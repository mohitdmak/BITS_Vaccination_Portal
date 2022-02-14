/* eslint @typescript-eslint/no-var-requires: "off" */
// import { google } from 'googleapis';
// Importing mongo student model, error handlers, logger
import * as ERROR from '../middeware/error_models';
import { HttpStatusCode } from '../middeware/error_models';
import { error_handler } from '../middeware/error_handler';
import { forward_errors } from '../controllers/forward_errors';
import { Student, STUDENT } from '../models/student';
import { RequestType, ResponseType } from '../controllers/student_controllers';
import { logger } from '../middeware/logger';

//password and configs
import { password } from '../config/admin';
import { username } from '../config/admin';
import { hashed } from '../config/admin';
import * as config from '../setup_project';

// reqs for sending excel file
import json2xls from 'json2xls';
import { writeFileSync } from 'fs';
//@ts-ignore
const fs = require('fs');

/** Currently allowed batches set by admin (defaults) */
let allow_access = config.ALLOW_ACCESS;

/** Helper for oauth2 auth */
/**
 * @apiDefine ADMIN Restriction: Only accessible when logged in at ADMIN Portal
 * @apiParam {Number} id Users unique ID.
 * @apiIgnore Internally used method
 */
const get_allow_access = () => {
    return allow_access;
};

/**
 * @api {POST} /api/admin/allow/ Restrict login access
 * @apiBody {string} batch=f2020 Batch to restrict login access to
 * @apiDescription Helper for react admin client to get restrict current allowed batches to login
 * @apiPermission ADMIN
 * @apiGroup ADMIN
 * @apiSuccess {string[]} batch Array of allowed batches
 */
const restrict_access = async (req: RequestType, res: ResponseType): Promise<void> => {
    allow_access = req.body.batch;
    res.status(HttpStatusCode.CREATED_RESOURCE).json({ batch: allow_access });
};

/**
 * @api {GET} /api/admin/allow/ Get current batches allowed
 * @apiDescription Helper for react client to get current allowed batches to login
 * @apiGroup ADMIN
 * @apiSuccess {string[]} batch Array of allowed batches
 */
const get_restrict_access = async (req: RequestType, res: ResponseType): Promise<void> => {
    res.status(HttpStatusCode.OK).json({ batch: allow_access });
};

/**
 * @api {POST} /api/admin/allow/ Hostel Portal login access
 * @apiParam {string} email Requesting student's emailid
 * @apiDescription Validator for allowable entry to hostel portal
 * @apiGroup Hostel Allocation
 * @apiSuccess {json} details Relevant details required by Hostel Allocation Portal
 * @apiSuccess {boolean} result Whether to allow login
 * @apiSuccess {string} message Reasons if any, to disallow login
 */
const validate = async (req: RequestType, res: ResponseType): Promise<void> => {
    try {
        const student: STUDENT | null = await Student.findOne({ email: <string>req.query.email });
        let valid = true;
        let result = '';
        let verdict: boolean;
        const details: any = {};
        if (!student) {
            result += 'The Student with provided EmailId does not exist. \n';
            valid = false;
            verdict = false;
        } else {
            details['name'] = student.name;
            if (!(student.TnC1_Agreement && student.TnC2_Agreement && student.is_medically_fit)) {
                result += 'Non Acceptance of Terms And Conditions,';
                valid = false;
            }
            if (!student.consent_form) {
                result += ' No Consent Form,';
                valid = false;
            }
            if (!student.state) {
                result += ' State of Residence not uploaded,';
                valid = false;
            } else {
                details['state'] = student.state;
            }
            if (!student.city) {
                result += ' City of Residence not uploaded,';
                valid = false;
            } else {
                details['city'] = student.city;
            }
            if (student.vaccination_status == 'NONE') {
                result += ' Vaccination status being NONE,';
                valid = false;
            } else {
                details['vaccination_status'] = student.vaccination_status;
            }
            if (!student.gender) {
                result += ' gender not uploaded,';
                valid = false;
            } else {
                details['gender'] = student.gender;
            }
            if (!student.studentId) {
                result += ' BITS ID not uploaded,';
                valid = false;
            } else {
                details['studentId'] = student.studentId;
            }
            if (valid) {
                verdict = true;
            } else {
                verdict = false;
                result = 'Student is not allowed to login due to: ' + result;
                result = result.slice(0, -1);
            }
        }
        // allow hostel administrators at all times
        if (
            <string>req.query.email == 'f20201976@pilani.bits-pilani.ac.in' ||
            <string>req.query.email == 'f20200931@pilani.bits-pilani.ac.in'
        ) {
            result = 'ADMINISTRATORS allowed access.';
            verdict = true;
        }
        res.status(HttpStatusCode.OK).json({ result: verdict, message: result, details: details });
    } catch (err) {
        forward_errors(err, HttpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
};

/** Helper function to paginate array after applying filters */
function paginate(array: any[], page_size: number, page_number: number): any[] {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

/** Trim response data and minimize json load attached to respones */
function trim_res_data(students: any[], beggining?: number, ending?: number, student?: STUDENT): STUDENT[] | STUDENT {
    // parse according to student data available
    students = student ? new Array(1).fill(student) : students;
    for (let i = 0; i < students.length; i++) {
        if (
            student ||
            (beggining! <= Date.parse(<string>(students[i].arrival_date as any)) &&
                Date.parse(<string>(students[i].arrival_date as any)) <= ending!)
        ) {
            students[i] = {
                _id: students[i]._id,
                pic: students[i].pic,
                name: students[i].name,
                email: students[i].email,
                vaccination_status: students[i].vaccination_status,
                auto_verification: students[i].auto_verification,
                manual_verification: students[i].manual_verification,
                overall_status: students[i].overall_status,
                arrival_date: students[i].arrival_date,
                city: students[i].city,
                is_containment_zone: students[i].is_containment_zone,
                pdf: students[i].pdf,
                consent_form: students[i].consent_form,
            };
        } else {
            students.splice(i, 1);
            i--;
        }
    }
    return student ? students[0] : students;
}

/**
 * @api {POST} /api/admin/login/ Admin Portal Login
 * @apiGroup ADMIN
 * @apiDescription Handler for admin login
 * @apiBody {string} client_username Admin Username
 * @apiBody {string} client_password Admin Password
 * @apiError ClientError Admin password or username is incorrect
 * @apiSuccess Sets jwt token on browser cookie, which then embeds as a header for further requests
 */
const post_login = async (req: RequestType, res: ResponseType): Promise<void> => {
    try {
        const { client_username, client_password } = req.body;
        if (client_username == username && client_password === password) {
            res.status(HttpStatusCode.CREATED_RESOURCE).json({ jwt: hashed });
        } else {
            throw new ERROR.ClientError(
                ERROR.HttpStatusCode.UNAUTHORIZED_REQUEST,
                'Admin password or username is incorrect',
                false,
            );
        }
    } catch (err) {
        forward_errors(err, HttpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
};

/**
 * @api {POST} /api/admin/students/ Provide multi student data
 * @apiGroup ADMIN
 * @apiPermission ADMIN
 * @apiDescription Handler for providing data of students requested in admin page
 * @apiBody {filters} filters Filters to apply on student data model
 * @apiBody {number} page Return all student data at this page
 * @apiBody {between} start-end Filter student data by arrival dates within this range
 * @apiSuccess {number} total_pages Total pages of students formed by filter
 * @apiSuccess {json} data Data of all students on page requested
 */
const post_students = async (req: RequestType, res: ResponseType): Promise<void> => {
    // get page no, iterate through json to get filter specs
    const page = Number(req.body.page);
    const filters: any = req.body.filters;
    // parse filters
    logger.info({ FILTERS: req.body }, 'Trimming student data by filters set by admin > > >');
    for (const key in filters) {
        if (filters[key] == null) {
            delete filters[key];
        }
    }
    // implement incomplete and case insensitive match
    if (filters['name'] != null) {
        const name_var = filters['name'];
        filters['name'] = { $regex: String(name_var), $options: 'i' };
    }
    try {
        let total_pages: number;
        let students: STUDENT[] | null = await Student.find(filters);
        // get filter dates, batchwise filter, entries by batch
        const beggining: number = Date.parse(req.body.between.start);
        const ending: number = Date.parse(req.body.between.end);
        const batch: string = req.body.batch;
        if (batch.length) {
            for (let i = 0; i < students.length; i++) {
                if (
                    batch.indexOf(String(students[i].email.substr(1, 4))) > 2 ||
                    batch.indexOf(String(students[i].email.substr(1, 4))) < 0
                ) {
                    students.splice(i, 1);
                    i--;
                } else {
                    // conversion to IST
                    const date = new Date(Date.parse(<string>(students[i].arrival_date as any)));
                    date.setTime(date.getTime() + config.TIMEZONE_DIFF);
                    students[i].arrival_date = <Date>(date.toISOString() as any);
                }
            }
        } else {
            for (let i = 0; i < students.length; i++) {
                // conversion to IST
                const date = new Date(Date.parse(<string>(students[i].arrival_date as any)));
                date.setTime(date.getTime() + config.TIMEZONE_DIFF);
                students[i].arrival_date = <Date>(date.toISOString() as any);
            }
        }
        // trim actual content sent into response
        students! = <STUDENT[]>trim_res_data(students, beggining, ending);
        if (students.length % config.PAGINATION_LIMIT === 0) {
            total_pages = students.length / config.PAGINATION_LIMIT;
        } else {
            total_pages = Math.floor(students.length / config.PAGINATION_LIMIT) + 1;
        }
        // server paginated response
        students = paginate(students, config.PAGINATION_LIMIT, page);
        res.status(HttpStatusCode.OK).json({ total_pages: total_pages, data: students });
        logger.info({ FILTERS: req.body }, 'Provided students list < < <');
    } catch (err) {
        forward_errors(err, HttpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
};

/**
 * @api {POST} /api/admin/student/ Provide single student data
 * @apiGroup ADMIN
 * @apiPermission ADMIN
 * @apiError DBError Problems locating student document by given id
 * @apiDescription Handler for get reqs on particular student by admin
 * @apiBody {id} id Object Id of student to get details of
 * @apiSuccess {json} student Relavant student data
 */
const get_student = async (req: RequestType, res: ResponseType): Promise<void> => {
    const id: number = req.body._id;
    try {
        // convert to IST, and post to db
        let student: STUDENT | null = await Student.findById(id);
        const date = new Date(Date.parse(<string>(student!.arrival_date as any)));
        date.setTime(date.getTime() + config.TIMEZONE_DIFF);
        student!.arrival_date = <Date>(date.toISOString() as any);
        logger.info({ STUDENT_EMAIL: student!.email }, 'Admin provided student detail.');
        student! = <STUDENT>trim_res_data([], undefined, undefined, student!);
        res.status(HttpStatusCode.OK).json(student);
    } catch (err) {
        forward_errors(err, HttpStatusCode.DB_ERROR, res);
    }
};

/**
 * @api {POST} /api/admin/update/ Update student data
 * @apiGroup ADMIN
 * @apiPermission ADMIN
 * @apiError DBError Problems locating/updating student document by given id
 * @apiDescription Handler for update reqs on a particular student by admin
 * @apiBody {_id} id Object Id of student to update details of
 * @apiBody {json} updates Set of changes to be made to student data
 * @apiSuccess {json} student Updated student data
 */
const update_student = async (req: RequestType, res: ResponseType): Promise<void> => {
    const id = req.body._id;
    try {
        // post updates to db
        const updates: any[] = req.body.updates;
        const student: STUDENT | null = await Student.findOneAndUpdate({ _id: id }, updates, { new: true });
        res.status(HttpStatusCode.CREATED_RESOURCE).json(student);
        logger.info({ STUDENT_EMAIL: student!.email }, 'Admin updated student status.');
    } catch (err) {
        forward_errors(err, HttpStatusCode.DB_ERROR, res);
    }
};

/**
 * @api {GET} /api/admin/get_pdf/ Get Vacccination Certificate
 * @apiGroup ADMIN
 * @apiPermission ADMIN
 * @apiError DBError Problems locating/serving student certificate by given id
 * @apiDescription Handler for view reqs of vaccination certificate pdfs for student by admin
 * @apiParam {_id} id Object Id of student to get certificate of
 * @apiSuccess {file} serve_file Vaccination Certificate as a download
 */
const get_pdf = async (req: RequestType, res: ResponseType): Promise<void> => {
    try {
        // get downloaded file path
        const id: any = req.query._id;
        const student: STUDENT | null = await Student.findById(id);
        let serve_file: string = student!.pdf;
        // preserve consistency between old and new batch uploads
        if (serve_file.startsWith('src/') != true) {
            serve_file = 'src/' + serve_file;
        }
        logger.info({ STUDENT_EMAIL: student!.email }, 'ADMIN: Request to serve Consent form > > >');
        // serve file for download
        res.download(String(serve_file), function (err) {
            let file_error: ERROR.BaseError;
            //@ts-ignore
            if (err && err.statusCode == 404) {
                file_error = new ERROR.ClientError(
                    ERROR.HttpStatusCode.NOT_FOUND,
                    'No vaccination pdf found on server < < <',
                    false,
                );
                error_handler.handleError(file_error, res);
            } else if (err) {
                file_error = new ERROR.BaseError(
                    'PDF Serve error',
                    ERROR.HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'Could not serve vaccination pdf < < <',
                    false,
                    true,
                );
                file_error.stack = err.stack;
                error_handler.handleError(file_error, res);
            } else {
                logger.info(
                    { STUDENT_EMAIL: student!.email, SERVED_FILE: serve_file },
                    'ADMIN: Vaccination pdf is served < < <',
                );
            }
        });
    } catch (err) {
        forward_errors(err, HttpStatusCode.DB_ERROR, res);
    }
};

/**
 * @api {GET} /api/admin/get_consent/ Get Consent Form
 * @apiGroup ADMIN
 * @apiPermission ADMIN
 * @apiError DBError Problems locating/serving student consent form by given id
 * @apiDescription Handler for view requests of consent form by admin
 * @apiParam {_id} id Object Id of student to get form of
 * @apiSuccess {file} serve_file Consent Form as a download
 */
const get_consent = async (req: RequestType, res: ResponseType): Promise<void> => {
    try {
        // get downloaded file path
        const id: any = req.query._id;
        const student: STUDENT | null = await Student.findById(id);
        let serve_file: string = student!.consent_form;
        // preserve consistency between old and new batch uploads
        if (serve_file.startsWith('src/') != true) {
            serve_file = 'src/' + serve_file;
        }
        logger.info({ STUDENT_EMAIL: student!.email }, 'ADMIN: Request to serve Consent form > > >');
        // serve file for download
        res.download(String(serve_file), function (err) {
            let file_error: ERROR.BaseError;
            //@ts-ignore
            if (err && err.statusCode == 404) {
                file_error = new ERROR.ClientError(
                    ERROR.HttpStatusCode.NOT_FOUND,
                    'No consent file found on server < < <',
                    false,
                );
                error_handler.handleError(file_error, res);
            } else if (err) {
                file_error = new ERROR.BaseError(
                    'PDF Serve error',
                    ERROR.HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'Could not serve consent form < < <',
                    false,
                    true,
                );
                file_error.stack = err.stack;
                error_handler.handleError(file_error, res);
            } else {
                logger.info(
                    { STUDENT_EMAIL: student!.email, SERVED_FILE: serve_file },
                    'ADMIN: Consent form is served < < <',
                );
            }
        });
    } catch (err) {
        forward_errors(err, HttpStatusCode.DB_ERROR, res);
    }
};

/** Prettify dates for admin excel file */
function humanify_dates(arg_date: string): string {
    const temp_date = arg_date.split('/');
    arg_date = temp_date[1] + '/' + temp_date[0] + '/' + temp_date[2];
    return arg_date;
}

/** Get cooldown date for student's currently taken vaccine dose */
function get_cooldown_date(student: STUDENT, latest_dose_date: string): string {
    /** Individual vaccine data from cowin */
    const Dose_Cooldown_Period = new Map<string, number>([
        ['COVISHIELD', config.DOSE_COOLDOWN_COVISHIELD],
        ['COVAXIN', config.DOSE_COOLDOWN_COVAXIN],
        ['SPUTNIK V', config.DOSE_COOLDOWN_SPUTNIK_V],
    ]);
    // Return cooldown data if vaccine dose information is available
    if (student.vaccine && latest_dose_date != config.NOT_KNOWN_MSG && student.vaccination_status != 'COMPLETE') {
        if (student.auto_verification == 'DONE') {
            let temp_date: string | Date = new Date(Date.parse(latest_dose_date));
            temp_date.setDate(
                temp_date.getDate() + Number(Dose_Cooldown_Period.get(student.vaccine.QR.evidence[0].vaccine)),
            );
            temp_date = temp_date.toLocaleDateString(undefined, { timeZone: config.TIMEZONE_CURRENT });
            return humanify_dates(temp_date);
        } else {
            return 'Manually verified';
        }
    } else if (student.vaccination_status == 'COMPLETE' && student.vaccine) {
        return 'Completely vaccinated';
    } else {
        return config.NOT_KNOWN_MSG;
    }
}

/**
 * @api {GET} /api/admin/excel/ Get Excel Data
 * @apiGroup ADMIN
 * @apiPermission ADMIN
 * @apiError DBError Problems creating/serving excel data of all students
 * @apiDescription Create Student data's excel file, and serve post authentication
 * @apiSuccess {file} serve_file Excel data as a download
 */
const get_excel = async (req: RequestType, res: ResponseType): Promise<void> => {
    try {
        // get data from mongodb, initialize empty array for conversion to xlsx
        logger.info('ADMIN: Request for excel file > > >');
        const data: STUDENT[] | null = await Student.find();
        const excel_array: any[] = [];
        // parse data into human readable formats, remove mongoose id pairs, etc
        data.forEach((student) => {
            const pdf: boolean = student.pdf ? true : false;
            const consent_form: boolean = student.consent_form ? true : false;
            const vaccine: string = student.vaccine ? student.vaccine.QR.evidence[0].vaccine : config.NOT_KNOWN_MSG;
            const agreement: boolean = student.TnC1_Agreement && student.TnC2_Agreement && student.is_medically_fit;
            let latest_dose_date: string;
            if (student.latest_dose_date) {
                latest_dose_date = new Date(student.latest_dose_date).toLocaleDateString(undefined, {
                    timeZone: config.TIMEZONE_CURRENT,
                });
            } else if (student.manual_verification == 'DONE' && student.vaccine) {
                latest_dose_date = new Date(student.vaccine.QR.evidence[0].date).toLocaleDateString(undefined, {
                    timeZone: config.TIMEZONE_CURRENT,
                });
            } else {
                latest_dose_date = config.NOT_KNOWN_MSG;
            }
            const last_dose_date_start: string = get_cooldown_date(student, latest_dose_date);
            /** prepare each student row for excel file */
            const excel_student: any = {
                Name: student.name,
                Gender: student.gender,
                'BITS Id': student.studentId,
                Email: student.email,
                City: student.city,
                State: student.state,
                Vaccine: vaccine,
                'Is Above 18': student.is_above_18,
                'Staying on campus': student.staying_on_campus,
                'Vaccination Status': student.vaccination_status,
                'Auto Verification': student.auto_verification,
                'Manual Verification': student.manual_verification,
                'Certificate Uploaded': pdf,
                'Consent Uploaded': consent_form,
                'Accepted All Agreements': agreement,
                'Last Dose Starting': last_dose_date_start,
                'Latest Dose Date': humanify_dates(latest_dose_date),
                'Arrival Date': humanify_dates(
                    new Date(student.arrival_date).toLocaleDateString(undefined, { timeZone: config.TIMEZONE_CURRENT }),
                ),
                'Created At': humanify_dates(
                    new Date(student.createdAt).toLocaleString(undefined, { timeZone: config.TIMEZONE_CURRENT }),
                ),
                'Updated At': humanify_dates(
                    new Date(student.updatedAt).toLocaleString(undefined, { timeZone: config.TIMEZONE_CURRENT }),
                ),
            };
            excel_array.push(excel_student);
        });
        // create xlsx document
        const excel_doc: any = await json2xls(excel_array);
        //@ts-ignore  FIXME
        writeFileSync(config.ADMIN_EXCELFILE, excel_doc, 'binary', (err) => {
            if (err) {
                const excel_error: ERROR.BaseError = new ERROR.BaseError(
                    'Excel write error',
                    ERROR.HttpStatusCode.INTERNAL_SERVER_ERROR,
                    `Could not write to ${config.ADMIN_EXCELFILE}.`,
                    false,
                    false,
                );
                excel_error.stack = err.stack;
                throw excel_error;
            } else {
                logger.info({ ADMIN_FILE: config.ADMIN_EXCELFILE }, `${config.ADMIN_EXCELFILE} has been saved.`);
            }
        });
        // serve excel file for download
        res.download(config.ADMIN_EXCELFILE, function (err) {
            if (err) {
                const excel_error: ERROR.BaseError = new ERROR.BaseError(
                    'Excel upload',
                    ERROR.HttpStatusCode.INTERNAL_SERVER_ERROR,
                    `Could not provide ${config.ADMIN_EXCELFILE} as download.`,
                    false,
                    false,
                );
                excel_error.stack = err.stack;
                throw excel_error;
            } else {
                logger.info({ ADMIN_FILE: config.ADMIN_EXCELFILE }, `${config.ADMIN_EXCELFILE} is served < < <`);
            }
        });
    } catch (err) {
        forward_errors(err, HttpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
};

/// alt details
const post_details = (req, res) => {
    console.log('ALT ADMIN DETAILS CALLED');
    res.status(200).json({ success: 'admin is allowed' });
};

export default {
    update_student,
    get_student,
    post_students,
    get_pdf,
    get_consent,
    post_login,
    post_details,
    get_excel,
    restrict_access,
    allow_access,
    get_restrict_access,
    get_allow_access,
    validate,
};
