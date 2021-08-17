// importing express 
const express = require("express");

// importing controller for authentication
const student_fxn = require("../controllers/student_controllers.js");

// importing middleware
const check_auth = require("../middeware/check_auth");

// creating express router 
var student_router = express.Router();


//* Defining routes
//
// Auth landing page
student_router.post("/post_pdf", check_auth, student_fxn.upload.single("pdf"), student_fxn.post_pdf);

// getting student's pdf
student_router.get("/get_pdf", check_auth, student_fxn.get_pdf);

// post consent form
student_router.post("/post_consent", check_auth, student_fxn.upload.single("consent_form"), student_fxn.post_consent);

// get consent form
student_router.get("/get_consent", check_auth, student_fxn.get_consent); 

// Setting auth tokens in session
// student_router.get("/all", check_auth, student_fxn.get_all);

// Showing protected page with student details
student_router.get("/details", check_auth, student_fxn.get_student_details);

// Logout page
student_router.get("/logout", student_fxn.get_logout);

// overall status 
// student.router.get("/overall_status", check_auth, student_fxn.get_overall_status); 

// exporting express router
module.exports = student_router;
