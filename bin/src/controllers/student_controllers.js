"use strict";
// auth requirements
var { google } = require('googleapis');
// Importing mongo student model
const Student = require('../models/student.js');
// importing vaccine model
const Vaccine = require('../models/vaccine.js').Vaccine;
//import fs
const fs = require('fs');
// configuring multer for storing pdfs
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (req.path == '/post_pdf') {
            cb(null, './media/pdf/');
        }
        else if (req.path == '/post_consent') {
            cb(null, './media/consent/');
        }
    },
    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, req.session["student"].email + path.extname(file.originalname));
    }
});
// Importing function to generate OauthClient
var { getOAuthClient } = require("./auth_controllers");
let upload = multer({ storage: storage,
    // limits: {fileSize: 1 * 1000},
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'application/pdf') {
            return cb(null, false);
        }
        else {
            cb(null, true);
        }
    }
});
// Handler for POST REQs submitting pdfs
const post_pdf = async (req, res) => {
    //!!!!!!!!!!!!!!!!!!! ONLY FOR DEV ENV
    // if(process.env.npm_lifecycle_event === 'dev_local' &&  req.query.access_token){
    //     // For testing via postman
    //     oauth2Client.setCredentials({access_token: req.query.access_token});
    //     // getting user details
    //     var oauth2 = google.oauth2({
    //         auth: oauth2Client,
    //         version: 'v2'
    //     });
    //     const user = await oauth2.userinfo.get();
    //     try{
    //         var student = await Student.find({email : user.data.email});
    //         req.session["student"] = student;
    //         // get_data(req, res);
    //         res.status(200).json({"file saved": req.file.path});
    //     }
    //     catch(err){
    //         res.status(500).json(err);
    //     }
    // }
    // 'pdf' is the name of our file input field in the HTML form
    // req.file contains information of uploaded file
    if (req.session["student"]) {
        //!!!!!!!!!!!!!!!!!!!!!! ALLOW ONLY PDFS
        try {
            console.log("\n    Checking validity of post_pdf file . . .");
            if (req.fileValidationError) {
                console.log("Validation error");
                res.status(400).json({ "error": req.fileValidationError });
            }
            else if (!req.file) {
                console.log("Validation Error 2");
                res.status(400).json({ "error": "\n File was not a valid PDF." });
                res.end();
            }
            else {
                console.log("FILE : PROPER PDF");
                save_data(req, res);
                // res.status(200).json({"file saved": req.file.path});
            }
        }
        // forward non multer errors
        catch (err) {
            console.log(err);
            res.status(500).json({ "error": err });
        }
    }
    else {
        console.log("Post_pdf accessed without logging in");
        res.status(400).json({ "error": "Student has not logged in yet." });
    }
};
//POST CONSENT FORM
const post_consent = async (req, res) => {
    if (req.session["student"]) {
        //!!!!!!!!!!!!!!!!!!!!!! ALLOW ONLY PDFS
        try {
            console.log("\n    Checking validity of post_consent file . . .");
            if (req.fileValidationError) {
                console.log("Validation error");
                return res.status(400).json({ "error": req.fileValidationError });
            }
            else if (!req.file) {
                console.log("Validation error 2");
                return res.status(400).json({ "error": '\n File was not a Valid PDF.' });
            }
            else {
                console.log("FILE : PROPER PDF");
                var student = req.session["student"];
                // update consent form in student model
                var new_student = await Student.findOneAndUpdate({ email: student.email }, { consent_form: req.file.path }, { new: true });
                // student.consent_form = req.file.path;
                console.log("Consent Form Updated : ");
                console.log(new_student);
                // update session data
                req.session["student"] = new_student;
                //update overall status
                update_overall_status(new_student, req, res);
                // sending file path response
                // res.status(200).json({"file saved": req.file.path});
            }
        }
        // forward non multer errors
        catch (err) {
            console.log(err);
            res.status(500).json({ "error": err });
        }
    }
    else {
        res.status(400).json({ "error": "Student has not logged in yet." });
    }
};
// get consent form
const get_consent = async (req, res) => {
    // get current logged in student
    try {
        // get downloaded file path
        var serve_file = req.session["student"].consent_form;
        console.log("\n		Serving Consent form at : ");
        console.log(String(serve_file));
        res.download(String(serve_file), function (err) {
            if (err) {
                console.log(err);
                res.status(500).json({ "error": "NO FILE FOUND ON SERVER" });
            }
            //else{
            //    console.log("CONSENT FORM FILE for student is served");
            //}
        });
    }
    // forward login errors
    catch (err) {
        console.log(err);
        res.status(500).json({ "error": err });
    }
};
// post extra data
const post_extra_data = async (req, res) => {
    try {
        console.log("POST EXTRA DATA CALLED . . .");
        // check student logged in session data
        if (req.session["student"]) {
            // get post data
            var updates = req.body;
            //utc ist bt
            //var date = new Date(Date.parse(updates.arrival_date));
            //date.setTime(date.getTime() + 19800000); 
            //updates.arrival_date = date.toISOString();
            //console.log(date.toISOString());
            console.log(updates);
            // update student
            var new_student = await Student.findOneAndUpdate({ email: req.session["student"].email }, updates, { new: true });
            // update session data for student
            req.session["student"] = new_student;
            // save called explicitly for post req
            req.session.save();
            // send new json
            res.status(201).json(new_student);
        }
        else {
            console.log("Post Extra data accessed without logged in status");
            res.status(400).json({ "error": "You must be logged in first to post your extra data" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ "error": err });
    }
};
// The protected page
const get_student_details = async (req, res) => {
    if (req.session["student"]) {
        console.log("entered if cond");
        console.log(req.session["student"]);
        try {
            // serve student details
            const student = req.session["student"];
            console.log("STUDENT DETAILS PROVIDED");
            // res.status(200).json({
            //     "_id": student._id,
            // "pic": student.pic,
            //     "name": student.name,
            //     "email": student.email,
            //     "vaccination_status": student.vaccination_status,
            //     "auto_verification": student.auto_verification,
            //     "manual_verification": student.manual_verification,
            //     "overall_status": student.overall_status,
            //     "pdf": student.pdf,
            //     "consent_form": student.consent_form
            // });
            res.status(200).json(student);
        }
        catch (err) {
            // send error report
            console.log(err);
            res.status(500).json({ "error": err });
        }
    }
    else {
        console.log('didnt error if');
        res.status(401).json({ "error": "NO STUDENT IS LOGGED IN CURRENTLY" });
    }
};
// The protected page
const save_data = async (req, res) => {
    try {
        console.log("Accessing QR data from file . . .");
        var file_name = req.file.path;
        var cp = require('child_process');
        cp.exec(`cd PyDIVOC &&  python3 solve.py ${file_name}`, async function (err, stdout, stderr) {
            // handle err, stdout, stderr
            //console.log(err);
            //console.log(stderr);
            if (err || stderr) {
                console.log(err);
                console.log(stderr);
                res.status(500).json({ "error": "FILE IS NOT A VALID CERTIFICATE" });
                // update student
                console.log("File is INVALID .");
                //@ts-ignore FIXME
                var student = await Student.findOneAndUpdate({ email: req.session["student"].email }, { vaccine: vac, pdf: file_name, pdf_data: fs.readFileSync(path.join(file_name)), vaccination_status: "NONE", auto_verification: "FAILED" }, { new: true });
                console.log("INVALID FILE FOR QR CODE UPDATED : ");
                console.log(student);
            }
            else {
                // main python output from PyDOC
                console.log("Updating student and vaccine models . . . ");
                // Using REGEX to replace escape sequences, due to baash output
                var regedStr = stdout.replace(/\\n/g, "\\n")
                    .replace(/\\'/g, "\\'")
                    .replace(/\\"/g, '\\"')
                    .replace(/\\&/g, "\\&")
                    .replace(/\\r/g, "\\r")
                    .replace(/\\t/g, "\\t")
                    .replace(/\\b/g, "\\b")
                    .replace(/\\f/g, "\\f");
                // convert to json using regex
                var parsedStr = regedStr.replace(/\'/g, '"');
                //console.log(parsedStr);
                // create vaccine object and save m
                var vaccine = new Vaccine({
                    'QR': JSON.parse(parsedStr)
                });
                var vac = await vaccine.save();
                // find db student instance
                var student = await Student.findOneAndUpdate({ email: req.session["student"].email }, {
                    vaccine: vac,
                    pdf: file_name,
                    pdf_data: fs.readFileSync(path.join(file_name))
                }, { new: true });
                //update session data for current student
                req.session["student"] = student;
                console.log("Student updated with new qr info : ");
                console.log(student);
                // console.log(req.session["student"]);
                // saving session data (!!!!!DOESNT DO AUTO IF REQ IS POST)
                req.session.save();
                verify_authenticity(req, res);
            }
        });
        // return saved status
        // res.status(201).json({"file saved": req.file.path});
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ "error": err });
    }
};
// VERIFY AUTHENTICITY
const verify_authenticity = async (req, res) => {
    console.log("Verifying authenticity of uploaded qr . . .");
    // get student data in current session
    var student = req.session["student"];
    //console.log(student);
    var count = 0;
    try {
        // seperate bits, pdf name
        var BITS_NAME = String(student.name.toUpperCase());
        var PDF_NAME = String(student.vaccine.QR.credentialSubject.name.toUpperCase());
        // split names into array
        var temp_BITS = BITS_NAME.split(" ");
        var temp_PDF = PDF_NAME.split(" ");
        var BITS_ARRAY = new Array();
        var PDF_ARRAY = new Array();
        // push space seperated values
        for (var i = 0; i < temp_BITS.length; i++) {
            BITS_ARRAY.push(temp_BITS[i]);
        }
        // push space seperated values
        for (var i = 0; i < temp_PDF.length; i++) {
            PDF_ARRAY.push(temp_PDF[i]);
        }
        // PDF_ARRAY[0] = 'MAKWANA';
        // PDF_ARRAY[1] = 'DILIP';
        // for reference
        console.log("	NAME FROM BITS INFO : ");
        console.log(BITS_ARRAY);
        console.log("	NAME FROM QR INFO : ");
        console.log(PDF_ARRAY);
        // count number of matching words
        // var count = 0;
        // Iterate through both arrays
        for (var i = 0; i < BITS_ARRAY.length; i += 1) {
            if (PDF_ARRAY.indexOf(BITS_ARRAY[i]) > -1) {
                count += 1;
            }
        }
        // for reference
        console.log("	NO OF NAMES MATCHING : ");
        console.log(count);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ "error": err });
    }
    // update/reject appropriately
    try {
        if (count >= 2) {
            console.log("Enough names matched, checking doses . . .");
            // student.vaccine.QR.evidence[0].dose = 2
            var new_student;
            if (Number(student.vaccine.QR.evidence[0].dose) > 0 && Number(student.vaccine.QR.evidence[0].dose < student.vaccine.QR.evidence[0].totalDoses)) {
                new_student = await Student.findOneAndUpdate({ email: student.email }, { auto_verification: 'DONE', vaccination_status: 'PARTIAL', latest_dose_date: student.vaccine.QR.evidence[0].date }, { new: true });
            }
            else if (Number(student.vaccine.QR.evidence[0].dose) > 0 && Number(student.vaccine.QR.evidence[0].dose) == Number(student.vaccine.QR.evidence[0].totalDoses)) {
                new_student = await Student.findOneAndUpdate({ email: student.email }, { auto_verification: 'DONE', vaccination_status: 'COMPLETE', latest_dose_date: student.vaccine.QR.evidence[0].date }, { new: true });
            }
            else if (Number(student.vaccine.QR.evidence[0].dose) == 0) {
                new_student = await Student.findOneAndUpdate({ email: student.email }, { auto_verification: 'DONE', vaccination_status: 'NONE' }, { new: true });
            }
            else {
                res.status(400).json({ "error": "TOTAL DOSES ARE LESS THAN COMPLETED DOSES" });
            }
            req.session["student"] = new_student;
            req.session.save();
            console.log("Vaccination and auto verification status updated .");
            // update overall status
            update_overall_status(new_student, req, res);
        }
        else {
            console.log("Enough names are not matched");
            var new_student = await Student.findOneAndUpdate({ email: student.email }, { auto_verification: 'FAILED' }, { new: true });
            req.session["student"] = new_student;
            req.session.save();
            console.log("Auto verification failed updated .");
            //update overall status
            update_overall_status(new_student, req, res);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ "error": err });
    }
    // res.status(200).send('hi');
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
// // Provide Overall Status
const update_overall_status = async (student, req, res) => {
    console.log("     Checking for update in Overall Access...........");
    // get current logged in student
    try {
        console.log("Checking for required fields . . .");
        // both files should be present
        // storing current session data for student
        if (student.pdf && student.consent_form && student.vaccination_status == 'COMPLETE') {
            console.log("All fields proper, updating student model and session cache . . .");
            var new_student = await Student.findOneAndUpdate({ email: student.email }, { overall_status: true }, { new: true });
            req.session["student"] = new_student;
            req.session.save();
            console.log("Overall Access grant updated .");
            res.status(201).json({ "success": "OVERALL ACCESS GRANTED" });
        }
        else {
            console.log("Not all fields are proper .");
            res.status(201).json({ "success": "OVERALL ACCESS NOT GRANTED" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ "error": err });
    }
};
// serving stored pdf file
const get_pdf = async (req, res) => {
    // get current logged in student
    try {
        // get downloaded file path
        var serve_file = req.session["student"].pdf;
        console.log("\n		Serving PDF file at : ");
        console.log(String(serve_file));
        res.download(String(serve_file), function (err) {
            if (err) {
                console.log(err);
                res.status(500).json({ "error": "NO FILE FOUND ON SERVER" });
            }
            else {
                console.log("File served .");
            }
        });
    }
    // forward login errors
    catch (err) {
        console.log(err);
        res.status(500).json({ "error": err });
    }
};
// landing page
const get_all = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ "error": err });
    }
};
const get_logout = (req, res) => {
    // removing tokens from session
    req.session.destroy();
    res.status(200).json({ "logout": "success" });
};
//alt details
const post_details = (req, res) => {
    console.log("ALT ADMIN DETAILS CALLED");
    res.status(200).json({ "success": "admin is allowed" });
};
module.exports = {
    get_all,
    get_student_details,
    get_logout,
    post_pdf,
    upload,
    get_pdf,
    post_consent,
    get_consent,
    post_details,
    post_extra_data
};
