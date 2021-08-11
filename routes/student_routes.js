// importing express 
const express = require("express");

// importing controller for authentication
const student_fxn = require("../controllers/student_controllers.js");

// creating express router 
var student_router = express.Router();


//* Defining routes
// Auth landing page
student_router.post("/signup", student_fxn.post_signup);

// Setting auth tokens in session
student_router.get("/all", student_fxn.get_all);

// Showing protected page with student details
student_router.get("/details", student_fxn.get_student_details);

// Logout page
student_router.get("/logout", student_fxn.get_logout);


// exporting express router
module.exports = student_router;