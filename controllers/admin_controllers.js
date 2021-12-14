// auth requirements
var {google} = require('googleapis');
// Importing mongo student model
const Student = require('../models/student.js');
// importing vaccine model
const Vaccine = require('../models/vaccine.js').Vaccine;

//password configs
const password = require('../config/admin.js').password;
const username = require('../config/admin.js').username;
const hashed = require('../config/admin.js').hashed;

// reqs for sending excel file
const json2xls = require('json2xls');
const filename = 'myExcel.xlsx';
const fs = require("fs");

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

// validate for hostel portal
const validate = async (req, res) => {
    var emailId = req.query.email;
    var student = await Student.findOne({email: emailId});
    var check_exists = true;
    var valid = true;
    var result = "";
    var verdict;
    var details = {};
    var agreement;
    if(!student){
        result = result + "The Student with provided EmailId does not exist. \n";
        check_exists = false;
        valid = false;
    }
    else{
        agreement = student.TnC1_Agreement && student.TnC2_Agreement && student.is_medically_fit;
        details["name"] = student.name;
    }
    if(check_exists == true && agreement == false){
        result = result + "Non Acceptance of Terms And Conditions,";
        valid = false;
    }
    if(check_exists == true && !student.consent_form){
        result = result + " No Consent Form,";
        valid = false;
    }
    if(check_exists == true && !student.state){
        result = result + " State of Residence not uploaded,";
        valid = false;
    }
    else if(check_exists == true){
        details["state"] = student.state;
    }
    if(check_exists == true && !student.city){
        result = result + " City of Residence not uploaded,";
        valid = false;
    }
    else if(check_exists == true){
        details["city"] = student.city;
    }
    if(check_exists == true && student.vaccination_status == "NONE"){
        result = result + " Vaccination status being NONE,";
        valid = false;
    }
    else if(check_exists == true){
        details["vaccination_status"] = student.vaccination_status;
    }
    if(check_exists == true && !student.gender){
        result = result + " gender not uploaded,";
        valid = false;
    }
    else if(check_exists == true){
        details["gender"] = student.gender;
    }
    if(check_exists == true && !student.studentId){
        result = result + " BITS ID not uploaded,";
        valid = false;
    }
    else if(check_exists == true){
        details["studentId"] = student.studentId;
    }
    if(check_exists && valid){
        verdict = true;
    }
    else{
        verdict = false;
        result = "Student is not allowed to login due to: " + result;
        result = result.slice(0, -1);
    }
    if(emailId == "f20201976@pilani.bits-pilani.ac.in" || emailId == "f20200931@pilani.bits-pilani.ac.in"){
        result = "ADMINISTRATORS allowed access.";
        verdict = true;
        valid = true;
        check_exists = true;
    }
    res.status(200).json({"result": verdict, "message": result, "details": details});
//     // if(student && student.consent_form && student.gender && student.studentId && (student.createdAt != student.updatedAt)){
//     //     res.status(200).json({
//     //         "result": true,
//     //         "name": student.name,
//     //         "gender": student.gender,
//     //         "studentId": student.studentId
//     //     });
//     // }
//     // else{
//         // res.status(200).json({
//         //     "result": false
//         // });
//     }
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
                    var date = new Date(Date.parse(students[i].arrival_date));
                    date.setTime(date.getTime() + 19800000);
                    students[i].arrival_date = date.toISOString();
                }
            }
        }
        else{
            for (let i = 0; i < students.length; i++) {
            var date = new Date(Date.parse(students[i].arrival_date));
            date.setTime(date.getTime() + 19800000);
            students[i].arrival_date = date.toISOString();
            }
        }


        // edit all entries for student
        //students.forEach(function(student, index, theArray){
        for (let i = 0; i < students.length; i++) {
            if((beggining != undefined && ending != undefined)){
                if( beggining <= Date.parse(students[i].arrival_date) && Date.parse(students[i].arrival_date) <= ending){
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
        var date = new Date(Date.parse(student.arrival_date));
        date.setTime(date.getTime() + 19800000);
        student.arrival_date = date.toISOString();
        console.log(" STUDENT DETAIL SENT IS : ");
        console.log(student);
        console.log("	ADMIN PROVIDED STUDENT DETAIL");
        res.status(200).json({
            "_id": student._id,
            "pic": student.pic,
            "name": student.name,
            "email": student.email,
            "vaccination_status": student.vaccination_status,
            "auto_verification": student.auto_verification,
            "manual_verification": student.manual_verification,
            "overall_status": student.overall_status,
            "city": student.city,
            "arrival_date": student.arrival_date,
            "is_containment_zone": student.is_containment_zone,
            "pdf": student.pdf,
            "consent_form": student.consent_form,
            "gender": student.gender,
            "studentId": student.studentId,
            "createdAt": student.createdAt,
            "updatedAt": student.updatedAt
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
        if(student.pdf){
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
        if(student.consent_form){
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
                    last_dose_date_finish = date.toISOString();
                    last_dose_date_start = new Date(last_dose_date_start).toLocaleDateString(undefined, {timeZone: 'Asia/Kolkata'});
                    last_dose_date_finish = new Date(last_dose_date_finish).toLocaleDateString(undefined, {timeZone: 'Asia/Kolkata'});
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
                    last_dose_date_finish = date.toISOString();
                    last_dose_date_start = new Date(last_dose_date_start).toLocaleDateString(undefined, {timeZone: 'Asia/Kolkata'});
                    last_dose_date_finish = new Date(last_dose_date_finish).toLocaleDateString(undefined, {timeZone: 'Asia/Kolkata'});
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
                    last_dose_date_finish = "NO END DATE";
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
            var dates = last_dose_date_finish.split("/");
            if(dates.length > 1){
                last_dose_date_finish = dates[1]+"/"+dates[0]+"/"+dates[2];
            }
        }
        else if(student.vaccination_status == "COMPLETE" && student.vaccine){
            last_dose_date_start = "COMPLETELY VACCINATED";
            last_dose_date_finish = "COMPLETELY VACCINATED";
            vaccine = student.vaccine.QR.evidence[0].vaccine;
            var dates = latest_dose_date.split("/");
            latest_dose_date = dates[1]+"/"+dates[0]+"/"+dates[2];
        }
        else{
            vaccine = "DATA UNAVAILABLE";
            last_dose_date_start = "DATA UNAVAILABLE";
            last_dose_date_finish = "DATA UNAVAILABLE";
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

//alt details
const post_details = (req, res) => {
    console.log("ALT ADMIN DETAILS CALLED");
    res.status(200).json({"success": "admin is allowed"});
}

module.exports = {
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
