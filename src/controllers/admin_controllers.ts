// auth requirements
// import { google } from 'googleapis';
// Importing mongo student model, error handlers, logger
import * as ERROR from '../middeware/error_models';
import { HttpStatusCode } from '../middeware/error_models';
import { error_handler } from '../middeware/error_handler';
import { Student, STUDENT } from '../models/student';
import { RequestType, ResponseType } from '../controllers/student_controllers';
import { logger } from '../middeware/logger';

//password configs
import { password } from '../config/admin';
import { username } from '../config/admin';
import { hashed } from '../config/admin';

// reqs for sending excel file
import json2xls from 'json2xls';
const filename = 'myExcel.xlsx';
import { writeFileSync } from 'fs';

// set pagination limit
const page_limit = 50;

// access data
let allow_access = [];
const get_allow_access = () => {
    return allow_access;
};
const restrict_access = async (req: RequestType, res: ResponseType): Promise<void> => {
    allow_access = req.body.batch;
    res.status(HttpStatusCode.CREATED_RESOURCE).json({ batch: allow_access });
};
const get_restrict_access = async (req: RequestType, res: ResponseType): Promise<void> => {
    res.status(HttpStatusCode.OK).json({ batch: allow_access });
};

// validate for hostel portal
const validate = async (req: RequestType, res: ResponseType): Promise<void> => {
    try{

        var student: STUDENT | null = await Student.findOne({email: <string>req.query.email});
        var valid: boolean = true;
        var result: string = "";
        var verdict: boolean;
        var details: any = {};
        if(!student){
            result += "The Student with provided EmailId does not exist. \n";
            valid = false;
            verdict = false;
        }
        else{
            details["name"] = student.name;
            if(!(student.TnC1_Agreement && student.TnC2_Agreement && student.is_medically_fit)){
                result += "Non Acceptance of Terms And Conditions,";
                valid = false;
            }
            if(!student.consent_form){
                result += " No Consent Form,";
                valid = false;
            }
            if(!student.state){
                result += " State of Residence not uploaded,";
                valid = false;
            }
            else{
                details["state"] = student.state;
            }
            if(!student.city){
                result += " City of Residence not uploaded,";
                valid = false;
            }
            else{
                details["city"] = student.city;
            }
            if(student.vaccination_status == "NONE"){
                result += " Vaccination status being NONE,";
                valid = false;
            }
            else{
                details["vaccination_status"] = student.vaccination_status;
            }
            if(!student.gender){
                result += " gender not uploaded,";
                valid = false;
            }
            else{
                details["gender"] = student.gender;
            }
            if(!student.studentId){
                result += " BITS ID not uploaded,";
                valid = false;
            }
            else{
                details["studentId"] = student.studentId;
            }
            if(valid){
                verdict = true;
            }
            else{
                verdict = false;
                result = "Student is not allowed to login due to: " + result;
                result = result.slice(0, -1);
            }
        }
        if(<string>req.query.email == "f20201976@pilani.bits-pilani.ac.in" || <string>req.query.email == "f20200931@pilani.bits-pilani.ac.in"){
            result = "ADMINISTRATORS allowed access.";
            verdict = true;
        }
        res.status(HttpStatusCode.OK).json({"result": verdict, "message": result, "details": details});
    }
    catch(err){
        if (!error_handler.isHandleAble(err)) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: err.message });
            throw err;
        }
        error_handler.handleError(err, res);
    }
}

// function to paginate array after applying filters
function paginate(array: any[], page_size: number, page_number: number): any[] {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

function trim_res_data(students: any[], beggining?: number, ending?: number, student?: STUDENT): STUDENT[] | STUDENT {
    students = student ? new Array(1).fill(student) : students;
    console.log(students);
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
// admin login
const post_login = async (req: RequestType, res: ResponseType): Promise<void> => {
    try {
        const { client_username, client_password } = req.body;
        if (client_username == username && client_password === password) {
            res.status(HttpStatusCode.CREATED_RESOURCE).json({ jwt: hashed });
        } else {
            throw new ERROR.ClientError(
                ERROR.HttpStatusCode.UNAUTHORIZED_REQUEST,
                'ADMIN PASSWORD OR USERNAME IS INCORRECT',
                false,
            );
        }
    } catch (err) {
        if (!error_handler.isHandleAble(err)) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: err.message });
            throw err;
        }
        error_handler.handleError(err, res);
    }
};

// handle providing data of students requested in admin page
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
                    var date = new Date(Date.parse(<string>(students[i].arrival_date as any)));
                    date.setTime(date.getTime() + 19800000);
                    students[i].arrival_date = <Date>(date.toISOString() as any);
                }
            }
        } else {
            for (let i = 0; i < students.length; i++) {
                // conversion to IST
                var date = new Date(Date.parse(<string>(students[i].arrival_date as any)));
                date.setTime(date.getTime() + 19800000);
                students[i].arrival_date = <Date>(date.toISOString() as any);
            }
        }
        students! = <STUDENT[]>trim_res_data(students, beggining, ending);
        if (students.length % page_limit === 0) {
            total_pages = students.length / page_limit;
        } else {
            total_pages = Math.floor(students.length / page_limit) + 1;
        }
        students = paginate(students, page_limit, page);
        res.status(HttpStatusCode.OK).json({ total_pages: total_pages, data: students });
        logger.info({ FILTERS: req.body }, 'Provided students list < < <');
    } catch (err) {
        if (!error_handler.isHandleAble(err)) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: err.message });
            throw err;
        }
        error_handler.handleError(err, res);
    }
};

// Handler for GET REQs on particular student
const get_student = async (req: RequestType, res: ResponseType): Promise<void> => {
    const id: number = req.body._id;
    try {
        let student: STUDENT | null = await Student.findById(id);
        // convert to IST
        const date = new Date(Date.parse(<string>(student!.arrival_date as any)));
        date.setTime(date.getTime() + 19800000);
        student!.arrival_date = <Date>(date.toISOString() as any);
        logger.info({ STUDENT_EMAIL: student!.email }, 'Admin provided student detail.');
        student! = <STUDENT>trim_res_data([], undefined, undefined, student!);
        res.status(HttpStatusCode.OK).json(student);
    } catch (err) {
        if (!error_handler.isHandleAble(err)) {
            res.status(HttpStatusCode.DB_ERROR).json({ error: err.message });
            throw err;
        }
        error_handler.handleError(err, res);
    }
};

// Handler for UPDATE REQs on a particular student
const update_student = async (req: RequestType, res: ResponseType): Promise<void> => {
    const id = req.body._id;
    try {
        const updates: any[] = req.body.updates;
        const student: STUDENT | null = await Student.findOneAndUpdate({ _id: id }, updates, { new: true });
        res.status(HttpStatusCode.CREATED_RESOURCE).json(student);
        logger.info({ STUDENT_EMAIL: student!.email }, 'Admin updated student status.');
    } catch (err) {
        if (!error_handler.isHandleAble(err)) {
            res.status(HttpStatusCode.DB_ERROR).json({ error: err.message });
            throw err;
        }
        error_handler.handleError(err, res);
    }
};

// Handler for VIEW REQs of pdfs for student
const get_pdf = async (req: RequestType, res: ResponseType): Promise<void> => {
    try {
        // get downloaded file path
        const id: any = req.query._id;
        const student: STUDENT | null = await Student.findById(id);
        const serve_file: string = student!.pdf;
        logger.info({ STUDENT_EMAIL: student!.email }, 'ADMIN: Request to serve Consent form > > >');
        // serve file as a download
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
        // forward login errors
        if (!error_handler.isHandleAble(err)) {
            res.status(HttpStatusCode.DB_ERROR).json({ error: err.message });
            throw err;
        }
        error_handler.handleError(err, res);
    }
};

//Handler for view requests of consent form by admin
const get_consent = async (req: RequestType, res: ResponseType): Promise<void> => {
    try {
        // get downloaded file path
        const id: any = req.query._id;
        const student: STUDENT | null = await Student.findById(id);
        const serve_file: string = student!.consent_form;
        logger.info({ STUDENT_EMAIL: student!.email }, 'ADMIN: Request to serve Consent form > > >');
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
        // forward login errors
        if (!error_handler.isHandleAble(err)) {
            res.status(HttpStatusCode.DB_ERROR).json({ error: err.message });
            throw err;
        }
        error_handler.handleError(err, res);
    }
};

// get excel file
const get_excel = async (req: RequestType, res: ResponseType): Promise<void> => {
    try {
        // get data from mongodb, initialize empty array for conversion to xlsl
        logger.info('ADMIN: Request for excel file > > >');
        const data: STUDENT[] | null = await Student.find();
        const excel_array: any[] = [];
        // remove mongoose id pairs, etc
        data.forEach((student) => {
            const pdf: boolean = student.pdf ? true : false;
            const consent_form: boolean = student.consent_form ? true : false;
            let latest_dose_date: string;
            const agreement: boolean = student.TnC1_Agreement && student.TnC2_Agreement && student.is_medically_fit;
            if (student.latest_dose_date) {
                latest_dose_date = new Date('2020-01-14T17:43:37.000Z').toLocaleString(undefined, {
                    timeZone: 'Asia/Kolkata',
                });
            } else {
                latest_dose_date = 'No latest dose';
            }
            const excel_student = {
                Name: student.name,
                Email: student.email,
                City: student.city,
                State: student.state,
                'Vaccination Status': student.vaccination_status,
                'Auto Verification': student.auto_verification,
                'Manual Verification': student.manual_verification,
                'Certificate Uploaded': pdf,
                'Consent Uploaded': consent_form,
                'Accepted All Agreements': agreement,
                'Latest Dose Date': latest_dose_date,
                'Arrival Date': new Date(student.arrival_date).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }),
            };
            excel_array.push(excel_student);
        });

        // prepare xlsx document
        const excel_doc: any = await json2xls(excel_array);
        //@ts-ignore  FIXME
        writeFileSync('ADMIN_ExcelFile.xlsx', excel_doc, 'binary', (err) => {
            if (err) {
                const excel_error: ERROR.BaseError = new ERROR.BaseError(
                    'Excel write',
                    ERROR.HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'Could not write ADMIN excel file.',
                    false,
                    false,
                );
                excel_error.stack = err.stack;
                throw excel_error;
            } else {
                logger.info({ ADMIN_FILE: filename }, 'ADMIN Excel file has been saved.');
            }
        });
        // send for download
        res.download('ADMIN_ExcelFile.xlsx', function (err) {
            if (err) {
                const excel_error: ERROR.BaseError = new ERROR.BaseError(
                    'Excel upload',
                    ERROR.HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'Could not provide as download ADMIN excel file.',
                    false,
                    false,
                );
                excel_error.stack = err.stack;
                throw excel_error;
            } else {
                logger.info({ ADMIN_FILE: filename }, 'ADMIN Excel file is served < < <');
            }
        });
    } catch (err) {
        if (!error_handler.isHandleAble(err)) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: err.message });
            throw err;
        }
        error_handler.handleError(err, res);
    }
};

//alt details
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
    validate
}
