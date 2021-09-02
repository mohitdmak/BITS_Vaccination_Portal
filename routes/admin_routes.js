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
admin_router.post("/students", check_admin_auth,  admin_fxn.post_students);

// getting student's pdf
admin_router.post("/student", check_admin_auth, admin_fxn.get_student);

// post consent form
admin_router.post("/update", check_admin_auth,  admin_fxn.update_student);

// get consent form
admin_router.get("/get_consent",  admin_fxn.get_consent);

// Setting auth tokens in session
admin_router.get("/get_pdf",  admin_fxn.get_pdf);

// Showing protected page with student details
admin_router.post("/login", admin_fxn.post_login);

// alt endpt
admin_router.post("/details", check_admin_auth, admin_fxn.post_details);

// Get excel file of database
admin_router.get("/excel", admin_fxn.get_excel);

// access modifier 
admin_router.post("/allow", check_admin_auth, admin_fxn.restrict_access); 

// get access
admin_router.get("/allow", admin_fxn.get_restrict_access); 

// exporting express router
module.exports = admin_router;
