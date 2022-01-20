// auth requirements
// import { google } from 'googleapis';
// Importing mongo student model
import Student from '../models/student';
// importing vaccine model
// import { Vaccine } from '../models/vaccine';

//password configs
import { password } from '../config/admin.js';
import { username } from '../config/admin.js';
import { hashed } from '../config/admin.js';

// reqs for sending excel file
import json2xls from 'json2xls';
const filename = 'myExcel.xlsx';
import { writeFileSync } from "fs";

// set pagination limit
const page_limit = 50;

// access data
let allow_access = [];
const get_allow_access = () => {
    return allow_access;
}

const restrict_access = async (req, res) => {
    allow_access = req.body.batch;
    res.status(201).json({"batch": allow_access});
}
const get_restrict_access = async (req, res) => {
    // allow_access = req.body.batch;
    // console.log(req.get("host"));
    res.status(200).json({"batch": allow_access});
}


// function to paginate array after applying filters
function paginate(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

//login
const post_login = async(req, res) => {
    const {client_username, client_password} = req.body;
    if(client_username == username && client_password === password){
        res.status(201).json({"jwt": hashed});
    }
    else{
        console.log("WRONG ADMIN PASSWORD OR USERNAME");
        res.status(400).json({"error": "ADMIN PASSWORD OR USERNAME IS INCORRECT"});
    }
}

// Handler for POST REQs submitting pdfs
const post_students = async ( req, res) => {

    // get page no
    const page = Number(req.body.page);
    // iterate through json to get filter specs
    var filters = req.body.filters;

    // parse filters
    console.log("Deleting null filters . . .");
    for(var key in filters){
        if(filters[key] == null){
            console.log(key);
            delete filters[key];
        }
    }

    // implement incomplete and case insensitive match
    if(filters["name"] != null){
        var name_var = filters["name"];
        filters["name"] = {"$regex": String(name_var), "$options" : "i"};
        console.log(filters["name"]);
    }

    try{
        // return list of students
        var students = await Student.find(filters);
        var total_pages;
        // set total pages
        //if(students.length % page_limit === 0){
        //    total_pages = students.length / page_limit;
        //}
        //else{
        //    total_pages = Math.floor(students.length / page_limit) + 1;
        //}

        // update pagination
        var students = await Student.find(filters);

        // get filter dates
        var beggining = Date.parse(req.body.between.start);
        var ending = Date.parse(req.body.between.end);

        // get batchwise filter
        var batch = req.body.batch;

        // edit entries by batch
        if(batch.length){
            for (let i = 0; i < students.length; i++) {
                if(batch.indexOf(String(students[i].email.substr(1, 4))) > 2 || batch.indexOf(String(students[i].email.substr(1, 4))) < 0){
                    console.log(students[i].email.substr(1, 4));
                    students.splice(i, 1);
                    i--;
                }
                else{
                    //@ts-ignore
                    var date = new Date(Date.parse(students[i].arrival_date));
                    date.setTime(date.getTime() + 19800000);
                    //@ts-ignore
                    students[i].arrival_date = date.toISOString();
                }
            }
        }
        else{
            for (let i = 0; i < students.length; i++) {
                    //@ts-ignore
            var date = new Date(Date.parse(students[i].arrival_date));
            date.setTime(date.getTime() + 19800000);
                    //@ts-ignore
            students[i].arrival_date = date.toISOString();
            }
        }


        // edit all entries for student
        //students.forEach(function(student, index, theArray){
        for (let i = 0; i < students.length; i++) {
            if((beggining != undefined && ending != undefined)){
                    //@ts-ignore
                if( beggining <= Date.parse(students[i].arrival_date) && Date.parse(students[i].arrival_date) <= ending){
                    //@ts-ignore
                    students[i] = {
                        "_id": students[i]._id,
                        "pic": students[i].pic,
                        "name": students[i].name,
                        "email": students[i].email,
                        "vaccination_status": students[i].vaccination_status,
                        "auto_verification": students[i].auto_verification,
                        "manual_verification": students[i].manual_verification,
                        "overall_status": students[i].overall_status,
                        "arrival_date": students[i].arrival_date,
                        "city": students[i].city,
                        "is_containment_zone": students[i].is_containment_zone, 
                        "pdf": students[i].pdf,
                        "consent_form": students[i].consent_form
                    }
                }
                else{
                    console.log("removed, not in time range :");
                    students.splice(i, 1);
                    i--;
                }
            }
            else{
                    //@ts-ignore
                students[i] = {
                    "_id": students[i]._id,
                    "pic": students[i].pic,
                    "name": students[i].name,
                    "email": students[i].email,
                    "vaccination_status": students[i].vaccination_status,
                    "auto_verification": students[i].auto_verification,
                    "manual_verification": students[i].manual_verification,
                    "overall_status": students[i].overall_status,
                    "arrival_date": students[i].arrival_date,
                    "city": students[i].city,
                    "is_containment_zone": students[i].is_containment_zone, 
                    "pdf": students[i].pdf,
                    "consent_form": students[i].consent_form
                }
            }
        }
        console.log("	ADMIN PROVIDED STUDENTS LIST");
        if(students.length % page_limit === 0){
            total_pages = students.length / page_limit;
        }
        else{
            total_pages = Math.floor(students.length / page_limit) + 1;
        }
        students = paginate(students, page_limit, page)
        res.status(200).json({
            "total_pages": total_pages,
            "data": students
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            "error": err
        });
    }
}

// Handler for GET REQs on particular student
const get_student = async (req, res) => {

    // get id no
    const id = req.body._id;
    //console.log(id);
    try{
        var student = await Student.findById(id);
                    //@ts-ignore
        var date = new Date(Date.parse(student.arrival_date));
        date.setTime(date.getTime() + 19800000);
                    //@ts-ignore
        student.arrival_date = date.toISOString();
        console.log(" STUDENT DETAIL SENT IS : ");
        console.log(student);
        console.log("	ADMIN PROVIDED STUDENT DETAIL");
        res.status(200).json({
                    //@ts-ignore
            "_id": student._id,
                    //@ts-ignore
            "pic": student.pic,
                    //@ts-ignore
            "name": student.name,
                    //@ts-ignore
            "email": student.email,
                    //@ts-ignore
            "vaccination_status": student.vaccination_status,
                    //@ts-ignore
            "auto_verification": student.auto_verification,
                    //@ts-ignore
            "manual_verification": student.manual_verification,
                    //@ts-ignore
            "overall_status": student.overall_status,
                    //@ts-ignore
            "city": student.city,
                    //@ts-ignore
            "arrival_date": student.arrival_date,
                    //@ts-ignore
            "is_containment_zone": student.is_containment_zone,
                    //@ts-ignore
            "pdf": student.pdf,
                    //@ts-ignore
            "consent_form": student.consent_form
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            "error": err
        });
    }
}

// Handler for UPDATE REQs on a particular student
const update_student = async (req, res) => {

    // get  id no
    const id = req.body._id;
    try{
        var updates = req.body.updates;
        var student = await Student.findOneAndUpdate({_id: id}, updates, {new: true});

	//var new_student;
	//if(student.pdf && student.consent_form && student.vaccination_status == 'COMPLETE'){
        //    console.log("All fields proper, updating student model and session cache . . .");
        //    var new_student = await Student.findOneAndUpdate({email: student.email}, {overall_status: true}, {new:true});
         //   console.log("Overall Access grant updated .");
         //   res.status(201).json({"success": "OVERALL ACCESS GRANTED"});
        //}
	//else{
	//    new_student = student;
//	}

	res.status(201).json(student);
        console.log("	ADMIN UPDATED STUDENT STATUS");
        //console.log("Verifying overall status . . .");
        //if(student.pdf && student.consent_form && student.vaccination_status == 'COMPLETE'){
        //    console.log("All fields proper, updating student model and session cache . . .");
        //    var new_student = await Student.findOneAndUpdate({email: student.email}, {overall_status: true}, {new:true});
        //    console.log("Overall Access grant updated .");
        //}
        //res.status(200).json({
        //    "_id": student._id,
        //    "pic": student.pic,
        //    "name": student.name,
        //    "email": student.email,
        //    "vaccination_status": student.vaccination_status,
        //    "auto_verification": student.auto_verification,
        //    "manual_verification": student.manual_verification,
        //    "overall_status": student.overall_status,
        //    "pdf": student.pdf,
        //    "consent_form": student.consent_form
        //});
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            "error": err
        });
    }
}

// Handler for VIEW REQs of pdfs for student
// serving stored pdf file
const get_pdf = async (req, res) => {
    // get current logged in student
    try{
        // get downloaded file path
        console.log("\n ADMIN REQUESTED PDF");
        console.log(req.query._id);
        var id = req.query._id;
        var student = await Student.findById(id);
                    //@ts-ignore
        if(student.pdf){
                    //@ts-ignore
            var serve_file = student.pdf;
            console.log("\n		Serving PDF file at : ");
            console.log(String(serve_file)); 
            res.download(String(serve_file), function(err){
                if(err){
                    console.log(err);
                    res.status(500).json({"error": "NO FILE FOUND ON SERVER"});
                }
                else{
                    console.log("CONSENT FORM FILE for student is served");
                }
            });
        }
        else{
            console.log("NO PDF FILE FOUND FOR STUDENT REQUESTED BY ADMIN");
            res.status(400).json({"error": "NO FILE FOUND ON SERVER"});
        }
    }
    // forward login errors
    catch(err){
        console.log(err);
        res.status(500).json({"error": err});
    }
}


//Handler for view requests of consent form by admin
// serving stored pdf file
const get_consent = async (req, res) => {
    // get current logged in student
    try{
        // get downloaded file path
        console.log("\n ADMIN REQUESTED CONSENT PDF");
        console.log(req.query);
        var id = req.query._id;
        var student = await Student.findById(id);
                    //@ts-ignore
        if(student.consent_form){
                    //@ts-ignore
            var serve_file = student.consent_form;
            console.log("\n		Serving PDF file at : ");
            console.log(String(serve_file)); 
            res.download(String(serve_file), function(err){
                if(err){
                    console.log(err);
                    res.status(500).json({"error": "NO FILE FOUND ON SERVER"});
                }
                else{
                    console.log("File served .");
                }
            });
        }
        else{
            console.log("NO PDF FILE FOUND FOR STUDENT REQUESTED BY ADMIN");
            res.status(400).json({"error": "NO FILE FOUND ON SERVER"});
        }
    }
    // forward login errors
    catch(err){
        console.log(err);
        res.status(500).json({"error": err});
    }
}

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
        var agreement = student.TnC1_Agreement && student.TnC2_Agreement && student.is_medically_fit;
        if(student.latest_dose_date){
            latest_dose_date = new Date('2020-01-14T17:43:37.000Z').toLocaleString(undefined, {timeZone: 'Asia/Kolkata'});
        }
        else{
            latest_dose_date = "No latest dose";
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
        const excel_student =  {
             "Name": student.name,
             "Email": student.email,
             "City": student.city,
             "State": student.state,
             "Vaccination Status": student.vaccination_status,
             "Auto Verification": student.auto_verification,
             "Manual Verification": student.manual_verification,
             "Certificate Uploaded": pdf,
             "Consent Uploaded": consent_form,
             "Accepted All Agreements": agreement,
             "Latest Dose Date": latest_dose_date,
             "Arrival Date": new Date(student.arrival_date).toLocaleString(undefined, {timeZone: 'Asia/Kolkata'}),
        };
                    //@ts-ignore
        excel_array.push(excel_student);
    });
    
    // prepare xlsx document
    var excel_doc = await json2xls(excel_array);

        // write to xlsx file
    //@ts-ignore  FIXME
    writeFileSync("ADMIN_ExcelFile.xlsx", excel_doc, 'binary', (err) => {
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

//alt details
const post_details = (req, res) => {
    console.log("ALT ADMIN DETAILS CALLED");
    res.status(200).json({"success": "admin is allowed"});
}

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
    get_allow_access
}