// importing express 
const express = require("express");

// importing controller for authentication
const admin_fxn = require("../controllers/admin_controllers.js");

// importing middleware
const check_admin_auth = require("../middeware/check_admin_auth");

// creating express router 
var admin_router = express.Router();


//* Defining routes
//
// Auth landing page
admin_router.post("/students",  admin_fxn.post_students);

// getting student's pdf
admin_router.post("/student", admin_fxn.get_student);

// post consent form
admin_router.post("/update",  admin_fxn.update_student);

// get consent form
admin_router.post("/get_consent",  admin_fxn.get_consent); 

// Setting auth tokens in session
admin_router.post("/get_pdf",  admin_fxn.get_pdf);

// Showing protected page with student details
admin_router.post("/login", check_admin_auth, admin_fxn.post_login);

// alt endpt
admin_router.post("/details", admin_fxn.post_details);
// protected page
// Logout page
// admin_router.get("/logout", admin_fxn.get_logout);

// overall status 
// student.router.get("/overall_status", check_auth, admin_fxn.get_overall_status); 

// exporting express router
module.exports = admin_router;
