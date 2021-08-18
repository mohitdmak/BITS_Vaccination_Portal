// importing express 
const express = require("express");

// importing controller for authentication
const admin_fxn = require("../controllers/admin_controllers.js");

// importing middleware
const check_auth = require("../middeware/check_auth");

// creating express router 
var admin_router = express.Router();


//* Defining routes
//
// Auth landing page
admin_router.post("/students", check_auth, admin_fxn.post_students);

// getting student's pdf
admin_router.post("/student", check_auth, admin_fxn.get_student);

// post consent form
admin_router.post("/update", check_auth, admin_fxn.update_student);

// get consent form
// admin_router.get("/get_consent", check_auth, admin_fxn.get_consent); 

// Setting auth tokens in session
// admin_router.get("/all", check_auth, admin_fxn.get_all);

// Showing protected page with student details
// admin_router.get("/details", check_auth, admin_fxn.get_student_details);

// Logout page
// admin_router.get("/logout", admin_fxn.get_logout);

// overall status 
// student.router.get("/overall_status", check_auth, admin_fxn.get_overall_status); 

// exporting express router
module.exports = admin_router;
