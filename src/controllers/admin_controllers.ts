// @ts-nocheck
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
const fs = require("fs");

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
        if (
            <string>req.query.email == 'f20201976@pilani.bits-pilani.ac.in' ||
            <string>req.query.email == 'f20200931@pilani.bits-pilani.ac.in'
        ) {
            result = 'ADMINISTRATORS allowed access.';
            verdict = true;
        }
        res.status(HttpStatusCode.OK).json({ result: verdict, message: result, details: details });
    } catch (err) {
        if (!error_handler.isHandleAble(err)) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: err.message });
            throw err;
        }
        error_handler.handleError(err, res);
    }
};

// function to paginate array after applying filters
function paginate(array: any[], page_size: number, page_number: number): any[] {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

function trim_res_data(students: any[], beggining?: number, ending?: number, student?: STUDENT): STUDENT[] | STUDENT {
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
                    const date = new Date(Date.parse(<string>(students[i].arrival_date as any)));
                    date.setTime(date.getTime() + 19800000);
                    students[i].arrival_date = <Date>(date.toISOString() as any);
                }
            }
        } else {
            for (let i = 0; i < students.length; i++) {
                // conversion to IST
                const date = new Date(Date.parse(<string>(students[i].arrival_date as any)));
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
        var serve_file: string = student!.pdf;
	if(serve_file.startsWith("src/") != true){
	    serve_file = "src/" + serve_file;
	}
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
        var serve_file: string = student!.consent_form;
	if(serve_file.startsWith("src/") != true){
	    serve_file = "src/" + serve_file;
	}
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
const get_excel = async (req, res) => {
    // get data from mongodb
    const data = await Student.find();

    // initialize empty array for conversion to xlsl
    var excel_array = [];

    // remove mongoose id pairs
    data.forEach((student) => {
        var pdf;
        var consent_form;
        var latest_dose_date;
        var vaccine;
        var last_dose_date_start;
        // var last_dose_date_finish;
        var agreement = student.TnC1_Agreement && student.TnC2_Agreement && student.is_medically_fit;
        if(student.latest_dose_date){
            latest_dose_date = new Date(student.latest_dose_date).toLocaleDateString(undefined, {timeZone: 'Asia/Kolkata'});
        }
        else if(student.manual_verification == "DONE" && student.vaccine){
            latest_dose_date = new Date(student.vaccine.QR.evidence[0].date).toLocaleDateString(undefined, {timeZone: 'Asia/Kolkata'});
        }
        else{
            latest_dose_date = "DATA UNAVAILABLE";
        }
        if(student.pdf){
            pdf = true;
        }
        else{
            pdf = false;
        }
        if(student.consent_form){
            consent_form = true;
        }
        else{
            consent_form = false;
        }
        if(student.vaccine && latest_dose_date != "DATA UNAVAILABLE" && student.vaccination_status != "COMPLETE"){
            vaccine = student.vaccine.QR.evidence[0].vaccine;
            if(vaccine == "COVISHIELD"){
                // if(student.auto_verification == ""){
                    var date = new Date(Date.parse(latest_dose_date));
                    date.setDate(date.getDate() + 84);
                    last_dose_date_start = date.toISOString();
                    date.setDate(date.getDate() + 112 - 84);
                    //last_dose_date_finish = date.toISOString();
                    last_dose_date_start = new Date(last_dose_date_start).toLocaleDateString(undefined, {timeZone: 'Asia/Kolkata'});
                    //last_dose_date_finish = new Date(last_dose_date_finish).toLocaleDateString(undefined, {timeZone: 'Asia/Kolkata'});
                // }
                // else{
                    // last_dose_date_start = "MANUALLY VERIFIED";
                    // last_dose_date_finish = "MANUALLY VERIFIED";
                // }
            }
            else if(vaccine == "COVAXIN"){
                // if(student.auto_verification == "DONE"){
                    var date = new Date(Date.parse(latest_dose_date));
                    date.setDate(date.getDate() + 28);
                    last_dose_date_start = date.toISOString();
                    date.setDate(date.getDate() + 42 - 28);
                    //last_dose_date_finish = date.toISOString();
                    last_dose_date_start = new Date(last_dose_date_start).toLocaleDateString(undefined, {timeZone: 'Asia/Kolkata'});
                    //last_dose_date_finish = new Date(last_dose_date_finish).toLocaleDateString(undefined, {timeZone: 'Asia/Kolkata'});
                // }
                // else{
                //     last_dose_date_start = "MANUALLY VERIFIED";
                //     last_dose_date_finish = "MANUALLY VERIFIED";
                // }
            }
            else if(vaccine == "SPUTNIK V"){
                // if(student.auto_verification == "DONE"){
                    var date = new Date(Date.parse(latest_dose_date));
                    date.setDate(date.getDate() + 21);
                    last_dose_date_start = date.toISOString();
                    last_dose_date_start = new Date(last_dose_date_start).toLocaleDateString(undefined, {timeZone: 'Asia/Kolkata'});
                    //last_dose_date_finish = "NO END DATE";
                // }
                // else{
                //     last_dose_date_start = "MANUALLY VERIFIED";
                //     last_dose_date_finish = "MANUALLY VERIFIED";
                // }
            }
            // var date = new Date(Date.parse(last_dose_date_start));
            // date.setDate(date.getDate() + 14);
            // last_dose_date_finish = date.toISOString();
            // last_dose_date_finish = new Date(last_dose_date_finish).toLocaleString(undefined, {timeZone: 'Asia/Kolkata'});
            var dates = latest_dose_date.split("/");
            latest_dose_date = dates[1]+"/"+dates[0]+"/"+dates[2];
            var dates = String(last_dose_date_start).split("/");
            last_dose_date_start = dates[1]+"/"+dates[0]+"/"+dates[2];
            //var dates = last_dose_date_finish.split("/");
            //if(dates.length > 1){
                //last_dose_date_finish = dates[1]+"/"+dates[0]+"/"+dates[2];
            //}
        }
        else if(student.vaccination_status == "COMPLETE" && student.vaccine){
            last_dose_date_start = "COMPLETELY VACCINATED";
            //last_dose_date_finish = "COMPLETELY VACCINATED";
            vaccine = student.vaccine.QR.evidence[0].vaccine;
            var dates = latest_dose_date.split("/");
            latest_dose_date = dates[1]+"/"+dates[0]+"/"+dates[2];
        }
        else{
            vaccine = "DATA UNAVAILABLE";
            last_dose_date_start = "DATA UNAVAILABLE";
            //last_dose_date_finish = "DATA UNAVAILABLE";
        }
        var arrival_date = new Date(student.arrival_date).toLocaleString(undefined, {timeZone: 'Asia/Kolkata'})
        var createdAt = new Date(student.createdAt).toLocaleString(undefined, {timeZone: 'Asia/Kolkata'})
        var updatedAt = new Date(student.updatedAt).toLocaleString(undefined, {timeZone: 'Asia/Kolkata'})
        var dates = arrival_date.split("/");
        arrival_date = dates[1]+"/"+dates[0]+"/"+dates[2];
        var dates = createdAt.split("/");
        createdAt = dates[1]+"/"+dates[0]+"/"+dates[2];
        var dates = updatedAt.split("/");
        updatedAt = dates[1]+"/"+dates[0]+"/"+dates[2];
        const excel_student =  {
             "Name": student.name,
             "Gender": student.gender,
             "BITS ID": student.studentId,
             "Email": student.email,
             "City": student.city,
             "Arrival Date": arrival_date,
             "State": student.state,
             "Vaccine": vaccine,
             "Vaccination Status": student.vaccination_status,
             "Auto Verification": student.auto_verification,
             "Manual Verification": student.manual_verification,
             "Certificate Uploaded": pdf,
             "Consent Uploaded": consent_form,
             "Accepted All Agreements": agreement,
             "Latest Dose Date": latest_dose_date,
             "Last Dose Starting": last_dose_date_start,
             // "Last Dose Ending": last_dose_date_finish,
             "Is Above 18": student.is_above_18,
             "Staying on campus": student.staying_on_campus,
             "Created At": createdAt,
             "Updated At": updatedAt
        }
        // if(consent_form){
        excel_array.push(excel_student);
        // }
    });

    // prepare xlsx document
    var excel_doc = await json2xls(excel_array);

        // write to xlsx file
    fs.writeFileSync("ADMIN_ExcelFile.xlsx", excel_doc, 'binary', (err) => {
        if (err) {
            console.log("writeFileSync error :", err);
         }
        console.log("The file has been saved!");
     });
    res.download("ADMIN_ExcelFile.xlsx", function(err){
        if(err){
            console.log(err);
            res.status(500).json({"error": "NO FILE FOUND ON SERVER"});
        }
        //else{
        //    console.log("CONSENT FORM FILE for student is served");
        //}
    });
}
// get excel file
const get_excel_new = async (req: RequestType, res: ResponseType): Promise<void> => {
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
    validate,
};
