/* eslint @typescript-eslint/no-var-requires: "off" */

// Importing mongo student, vaccine models
import { Student, STUDENT } from '../models/student';
import { Vaccine, VACCINE } from '../models/vaccine';
//import logger, error_models, error_handler
import { logger } from '../middeware/logger';
import * as ERROR from '../middeware/error_models';
import { HttpStatusCode } from '../middeware/error_models';
import { error_handler } from '../middeware/error_handler';
import { forward_errors } from '../controllers/forward_errors';

// Req and Res types, config
import { Request, Response } from 'express';
import * as config from '../setup_project';

export interface RequestType extends Request {
    path: string;
    fileValidationError?: Error;
}
export interface ResponseType extends Response {
    local?: any;
}

// configuring multer for storing pdfs
import multer from 'multer';
import path from 'path';
import pino from 'pino';
const storage = multer.diskStorage({
    destination: function (req: RequestType, file: Express.Multer.File, cb) {
        if (req.path == '/post_pdf') {
            cb(null, config.VACCINATION_PDFS_STORAGE);
        } else if (req.path == '/post_consent') {
            cb(null, config.CONSENT_PDFS_STORAGE);
        }
    },

    // By default, multer removes file extensions so, adding them back
    filename: function (req: RequestType, file: Express.Multer.File, cb) {
        cb(null, req.session['student'].email + path.extname(file.originalname));
    },
});

/** Multer Upload middleware */
const upload = multer({
    storage: storage,
    // limits: {fileSize: 1 * 1000},
    fileFilter: function (req: RequestType, file: Express.Multer.File, cb) {
        if (file.mimetype !== 'application/pdf') {
            return cb(null, false);
        } else {
            cb(null, true);
        }
    },
});

/** Handler for post reqs submitting pdfs */
const post_pdf = async (req: RequestType, res: Response): Promise<void> => {
    const LOGGER: pino.Logger = res.locals.child_logger ? res.locals.child_logger : logger;
    try {
        if (req.session['student']) {
            // allowing only pdfs
            try {
                // NOTE: child logging removed, metadata used instead in log load
                // const child_logger: pino.Logger = logger.child({"STUDENT_EMAIL": req.session["student"].email});
                LOGGER.info('Checking validity of post_pdf file > > >');
                if (req.fileValidationError || !req.file) {
                    throw new ERROR.ClientError(
                        ERROR.HttpStatusCode.BAD_REQUEST,
                        'File upload is not of PDF format < < <',
                        false,
                    );
                } else {
                    LOGGER.info('File Valid < < <');
                    await save_data(req, res);
                }
            } catch (err) {
                // forward non multer errors
                throw err;
            }
        } else {
            throw new ERROR.ClientError(
                ERROR.HttpStatusCode.UNAUTHORIZED_REQUEST,
                'Post_PDF path accessed without logging in',
                false,
            );
        }
    } catch (err) {
        forward_errors(err, HttpStatusCode.INTERNAL_SERVER_ERROR, res, LOGGER);
    }
};

/** Handler for post requests of consent form by student */
const post_consent = async (req: RequestType, res: ResponseType): Promise<void> => {
    const LOGGER: pino.Logger = res.locals.child_logger ? res.locals.child_logger : logger;
    try {
        if (req.session['student']) {
            //!!!!!!!!!!!!!!!!!!!!!! ALLOW ONLY PDFS
            LOGGER.info('Checking validity of post_pdf file > > >');
            if (req.fileValidationError || !req.file) {
                throw new ERROR.ClientError(
                    ERROR.HttpStatusCode.BAD_REQUEST,
                    'File upload is not of PDF format < < <',
                    false,
                );
            } else {
                // update student data and session
                const updated_student: STUDENT | null = await Student.findOneAndUpdate(
                    { email: req.session['student'].email },
                    { consent_form: req.file.path },
                    { new: true },
                );
                if (updated_student) req.session['student'] = updated_student;
                LOGGER.info('File Valid < < <');
                //update overall status
                update_overall_status(updated_student!, req, res);
            }
        } else {
            throw new ERROR.ClientError(
                ERROR.HttpStatusCode.UNAUTHORIZED_REQUEST,
                'Post_PDF path accessed without logging in.',
                false,
            );
        }
    } catch (err) {
        forward_errors(err, HttpStatusCode.INTERNAL_SERVER_ERROR, res, LOGGER);
    }
};

/** Handler for get requests for consent form by student */
const get_consent = async (req: RequestType, res: ResponseType): Promise<void> => {
    const LOGGER: pino.Logger = res.locals.child_logger ? res.locals.child_logger : logger;
    try {
        // get downloaded file path
        let serve_file: string = req.session['student'].consent_form;
        // preserve consistency between old and new batch uploads
        if (serve_file.startsWith('src/') != true) {
            serve_file = 'src/' + serve_file;
        }
        LOGGER.info('Request to serve Consent form > > >');
        // serve file as a download
        res.download(String(serve_file), function (err) {
            let file_error: ERROR.BaseError;
            //@ts-ignore
            if (err && err.statusCode == 404) {
                file_error = new ERROR.ClientError(
                    ERROR.HttpStatusCode.NOT_FOUND,
                    'No consent file found on server < < <',
                    false,
                );
                error_handler.handleError(file_error, res, LOGGER);
            } else if (err) {
                file_error = new ERROR.BaseError(
                    'PDF Serve error',
                    ERROR.HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'Could not serve consent form < < <',
                    false,
                    true,
                );
                file_error.stack = err.stack;
                error_handler.handleError(file_error, res, LOGGER);
            } else {
                LOGGER.info({ SERVED_FILE: serve_file }, 'Consent form is served < < <');
            }
        });
    } catch (err) {
        forward_errors(err, HttpStatusCode.INTERNAL_SERVER_ERROR, res, LOGGER);
    }
};

/** Handler for updating student details by student */
const update = async (req: RequestType, res: ResponseType): Promise<void> => {
    try {
        await Student.findOneAndUpdate(
            { email: req.session['student'].email },
            { is_above_18: req.body.is_above_18, staying_on_campus: req.body.staying_on_campus },
        );
        res.status(HttpStatusCode.CREATED_RESOURCE).json({ message: 'Successfully updated details' });
    } catch (err) {
        forward_errors(err, HttpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
};

/** Handler for storing extra data into student model */
const post_extra_data = async (req: RequestType, res: ResponseType): Promise<void> => {
    const LOGGER: pino.Logger = res.locals.child_logger ? res.locals.child_logger : logger;
    try {
        LOGGER.info('Post extra data called > > >');
        // check student logged in session data
        if (req.session['student']) {
            // get post data and update student data
            const updates = req.body;
            const updated_student: STUDENT | null = await Student.findOneAndUpdate(
                { email: req.session['student'].email },
                updates,
                { new: true },
            );
            // update session data
            req.session['student'] = updated_student;
            req.session.save();
            // send new json
            res.status(HttpStatusCode.CREATED_RESOURCE).json(updated_student);
        } else {
            throw new ERROR.ClientError(
                ERROR.HttpStatusCode.UNAUTHORIZED_REQUEST,
                'Student must be logged in first to post extra data.',
                false,
            );
        }
    } catch (err) {
        forward_errors(err, HttpStatusCode.DB_ERROR, res, LOGGER);
    }
};

/** The protected page */
const get_student_details = async (req: RequestType, res: ResponseType): Promise<void> => {
    if (req.session['student']) {
        res.status(HttpStatusCode.OK).json(req.session['student']);
    } else {
        res.status(HttpStatusCode.NOT_FOUND).json({ error: 'No student is logged in currently.' });
    }
};

/** Save uploaded vaccination pdf data post parsing */
const save_data = async (req: RequestType, res: ResponseType): Promise<void> => {
    const LOGGER: pino.Logger = res.locals.child_logger ? res.locals.child_logger : logger;
    try {
        LOGGER.info('Accessing QR data from file > > >');
        const file_name = req.file!.path;
        const cp = require('child_process');
        let pdf_error: ERROR.BaseError | undefined;
        let parsedStr: string | undefined;
        const child = cp.exec(
            `python3 src/PyDIVOC/solve.py ${file_name}`,
            function (err: any, stdout: string, stderr: any) {
                // handle child process errors by giving parent try catch access to it
                if (err || stderr) {
                    if (err.code == 2) {
                        pdf_error = new ERROR.BaseError(
                            'Base Unexpected Error',
                            ERROR.HttpStatusCode.INTERNAL_SERVER_ERROR,
                            'PDF Parser failed.',
                            false,
                            true,
                        );
                    } else {
                        pdf_error = new ERROR.ClientError(
                            ERROR.HttpStatusCode.BAD_REQUEST,
                            'Pdf is not a valid certificate.',
                            false,
                        );
                    }
                    pdf_error.stack = err.stack;
                    LOGGER.info('Invalid QR, vacc status updated < < <');
                } else {
                    // main python output from PyDOC Using REGEX to replace escape sequences, due to bash output
                    const regedStr = stdout
                        .replace(/\\n/g, '\\n')
                        .replace(/\\'/g, "\\'")
                        .replace(/\\"/g, '\\"')
                        .replace(/\\&/g, '\\&')
                        .replace(/\\r/g, '\\r')
                        .replace(/\\t/g, '\\t')
                        .replace(/\\b/g, '\\b')
                        .replace(/\\f/g, '\\f');
                    // convert to json using regex
                    parsedStr = regedStr.replace(/\'/g, '"');
                    LOGGER.info({ QR_DATA: parsedStr }, 'QR succesfully parsed.');
                }
            },
        );
        // if error during QR parsing, let handler handle, else save vaccine and student models and update session
        child.on('close', async function () {
            let updated_student: STUDENT | null;
            if (pdf_error) {
                if (pdf_error instanceof ERROR.ClientError) {
                    updated_student = await Student.findOneAndUpdate(
                        { email: req.session['student'].email },
                        { pdf: file_name, vaccination_status: 'NONE', auto_verification: 'FAILED' },
                        { new: true },
                    );
                }
                error_handler.handleError(pdf_error, res, LOGGER);
            } else {
                const vaccine: VACCINE | null = await new Vaccine({ QR: JSON.parse(parsedStr!) }).save();
                updated_student = await Student.findOneAndUpdate(
                    { email: req.session['student'].email },
                    { vaccine: vaccine, pdf: file_name },
                    { new: true },
                );
            }
            //update session data for current student
            if (updated_student!) req.session['student'] = updated_student;
            LOGGER.info({ QR_DATA: parsedStr }, 'Student vaccination data updated.');
            req.session.save();
            LOGGER.info({ QR_DATA: parsedStr }, 'Student session data updated < < <');
            if (!pdf_error) await verify_authenticity(req, res);
        });
    } catch (err) {
        forward_errors(err, HttpStatusCode.DB_ERROR, res, LOGGER);
    }
};

/** Verify authenticity of stored vaccination data from pdf file */
const verify_authenticity = async (req: RequestType, res: ResponseType): Promise<void> => {
    const LOGGER: pino.Logger = res.locals.child_logger ? res.locals.child_logger : logger;
    LOGGER.info('Verifying authenticity of uploaded qr > > >');
    // check if names on certificate and BITS records match enough
    const student: STUDENT = req.session['student'];
    let MATCH_COUNT = 0;
    try {
        // seperate bits, pdf name
        const BITS_NAME = String(student.name.toUpperCase());
        const PDF_NAME = String(student.vaccine.QR.credentialSubject.name.toUpperCase());
        const BITS_ARRAY = BITS_NAME.split(' ');
        const PDF_ARRAY = PDF_NAME.split(' ');

        // Iterate through both arrays
        for (let i = 0; i < BITS_ARRAY.length; i += 1) {
            if (PDF_ARRAY.indexOf(BITS_ARRAY[i]) > -1) {
                MATCH_COUNT += 1;
            }
        }
        // for reference
        LOGGER.info(
            { BITS_RECORDS: BITS_ARRAY, COWIN_RECORDS: PDF_ARRAY, MATCH_COUNT: MATCH_COUNT },
            'Extracted student details from PDF/BITS data.',
        );
    } catch (err) {
        forward_errors(err, HttpStatusCode.DB_ERROR, res, LOGGER);
    }

    // update/reject appropriately
    try {
        if (MATCH_COUNT >= config.MIN_MATCH_REQUIRED) {
            const current_doses = Number(student.vaccine.QR.evidence[0].dose);
            const total_doses: number = student.vaccine.QR.evidence[0].totaldoses;
            let updated_student: STUDENT | null;
            if (current_doses > 0) {
                if (current_doses < total_doses) {
                    updated_student = await Student.findOneAndUpdate(
                        { email: student.email },
                        {
                            auto_verification: 'DONE',
                            vaccination_status: 'PARTIAL',
                            latest_dose_date: student.vaccine.QR.evidence[0].date,
                        },
                        { new: true },
                    );
                } else {
                    updated_student = await Student.findOneAndUpdate(
                        { email: student.email },
                        {
                            auto_verification: 'DONE',
                            vaccination_status: 'COMPLETE',
                            latest_dose_date: student.vaccine.QR.evidence[0].date,
                        },
                        { new: true },
                    );
                }
            } else {
                updated_student = await Student.findOneAndUpdate(
                    { email: student.email },
                    { auto_verification: 'DONE', vaccination_status: 'NONE' },
                    { new: true },
                );
            }
            // update current session
            if (updated_student) req.session['student'] = updated_student;
            req.session.save();
            LOGGER.info('Verified authenticity, updated student data < < <');
            // update overall status
            update_overall_status(updated_student!, req, res);
        } else {
            // update current session
            const updated_student: STUDENT | null = await Student.findOneAndUpdate(
                { email: student.email },
                { auto_verification: 'FAILED' },
                { new: true },
            );
            if (updated_student) req.session['student'] = updated_student;
            req.session.save();
            LOGGER.warn('Verification Failed, pushed to manual verification < < <');
            //update overall status
            update_overall_status(updated_student!, req, res);
        }
    } catch (err) {
        forward_errors(err, HttpStatusCode.DB_ERROR, res, LOGGER);
    }
};

//// FUZZY NAME MATCHING USING HMNI ML ALGORITHM
//const match_names = async(req, res) => {
//   try{
//       // Fetch BITS NAME and name on pdf
//       var student = req.session["student"];
//       console.log(student);
//       var BITS_NAME = student.name.toUpperCase();
//       var PDF_NAME = student.vaccine.QR.credentialSubject.name.toUpperCase();

//       // FORK CHILD PROCESS AND RUN BASH SCRIPT
//       var cp = require('child_process');
//       cp.exec(`python3 ML_ALGO.py ${BITS_NAME} ${PDF_NAME}`, async function(err, stdout, stderr) {
//          // handle err, stdout, stderr
//            console.log(err);
//            console.log(stderr);

//           // main python output from PyDOC
//            console.log(stdout);

//           // find db student instance
//           // var student = await Student.findOneAndUpdate({email: req.session["student"].email}, {vaccine: vac, pdf: file_name}, {new: true});

//           //update session data for current student
//           // req.session["student"] = student;
//           // console.log(student.vaccine.QR.type);
//           // console.log(student);
//           // console.log(req.session["student"]);

//           // saving session data (!!!!!DOESNT DO AUTO IF REQ IS POST)
//           // req.session.save();
//        });
//       // return saved status
//       res.status(201).json({"file saved": req.file.path});
//    }
//    catch(err){
//        console.log(err);
//        res.status(500).json(err);
//    }
//}

/** Compulsory checker post request processing to update overall_status of student */
const update_overall_status = async (student: STUDENT, req: RequestType, res: ResponseType): Promise<void> => {
    const LOGGER: pino.Logger = res.locals.child_logger ? res.locals.child_logger : logger;
    LOGGER.info('Checking for update in Overall Access > > >');
    // get current logged in student
    try {
        // both files should be present, storing current session data for student
        if (student.pdf && student.consent_form && student.vaccination_status == 'COMPLETE') {
            const updated_student: STUDENT | null = await Student.findOneAndUpdate(
                { email: student.email },
                { overall_status: true },
                { new: true },
            );
            if (updated_student) req.session['student'] = updated_student;
            req.session.save();
            res.status(HttpStatusCode.CREATED_RESOURCE).json({ success: 'OVERALL ACCESS GRANTED' });
        } else {
            res.status(HttpStatusCode.CREATED_RESOURCE).json({ success: 'OVERALL ACCESS NOT GRANTED' });
        }
        LOGGER.info({ OVERALL_STATUS: req.session['student'].overall_status }, 'Updated overall status < < <');
    } catch (err) {
        forward_errors(err, HttpStatusCode.DB_ERROR, res, LOGGER);
    }
};

/** Handler for serving vaccination certificates, req by student */
const get_pdf = async (req: RequestType, res: ResponseType): Promise<void> => {
    const LOGGER: pino.Logger = res.locals.child_logger ? res.locals.child_logger : logger;
    try {
        // get downloaded file path
        let serve_file: string = req.session['student'].pdf;
        // preserve consistency between old and new batch uploads
        if (serve_file.startsWith('src/') != true) {
            serve_file = 'src/' + serve_file;
        }
        LOGGER.info('Request to serve Vaccine certificate > > >');
        res.download(String(serve_file), function (err) {
            let file_error: ERROR.BaseError;
            //@ts-ignore
            if (err && err.statusCode == 404) {
                file_error = new ERROR.ClientError(
                    ERROR.HttpStatusCode.NOT_FOUND,
                    'No vaccine certificate found on server < < <',
                    false,
                );
                error_handler.handleError(file_error, res, LOGGER);
            } else if (err) {
                file_error = new ERROR.BaseError(
                    'PDF Serve error',
                    ERROR.HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'Could not serve vaccine certificate < < <',
                    false,
                    true,
                );
                file_error.stack = err.stack;
                error_handler.handleError(file_error, res, LOGGER);
            } else {
                LOGGER.info({ SERVED_FILE: serve_file }, 'Vaccine certificate is served < < <');
            }
        });
    } catch (err) {
        forward_errors(err, HttpStatusCode.DB_ERROR, res, LOGGER);
    }
};

/** Dashboard landing page */
const get_all = async (req: RequestType, res: ResponseType): Promise<void> => {
    try {
        const students: STUDENT[] | null = await Student.find();
        res.status(HttpStatusCode.OK).json(students);
    } catch (err) {
        forward_errors(err, HttpStatusCode.DB_ERROR, res);
    }
};

/** Logout Handler */
const get_logout = (req: RequestType, res: ResponseType) => {
    // removing tokens from session
    req.session.destroy(function (err) {
        if (err) {
            if (!error_handler.isHandleAble(err)) throw err;
            error_handler.handleError(err, res);
        } else {
            res.status(HttpStatusCode.OK).redirect('/');
        }
    });
};

// alt details
const post_details = (req: RequestType, res: ResponseType) => {
    console.log('ALT ADMIN DETAILS CALLED');
    res.status(200).json({ success: 'admin is allowed' });
};

/** Handler for status endpoint for hostel portal verification */
const get_staying_on_campus_status = async (req: RequestType, res: ResponseType): Promise<void> => {
    try {
        const student: STUDENT | null = await Student.findOne({ email: req.body.email });
        res.status(HttpStatusCode.OK).json({ staying_on_campus: student!.staying_on_campus });
    } catch (err) {
        forward_errors(err, HttpStatusCode.DB_ERROR, res);
    }
};

export default {
    get_all,
    get_student_details,
    get_logout,
    post_pdf,
    upload,
    get_pdf,
    post_consent,
    get_consent,
    post_details,
    post_extra_data,
    update,
    get_staying_on_campus_status,
};
