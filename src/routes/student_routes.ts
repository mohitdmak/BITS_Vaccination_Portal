// express  router
import express from "express";
var student_router = express.Router();

// importing controller for authentication
import student_fxn from "../controllers/student_controllers.js";
import admin_fxn from "../controllers/admin_controllers.js";

// importing middleware
import check_auth from "../middeware/check_auth";



// ########################### Defining routes ###########################
// handling certificate pdf post
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

// post extra data
student_router.post("/extra", student_fxn.post_extra_data);

// Logout page
student_router.get("/logout", student_fxn.get_logout);

// student_router.get("/api", async function mainHandler(req, res) {
//     error_handler = require("../middeware/error_handler").error_handler;
//     const ERROR = require("../middeware/error_models");
//     const HttpStatusCode = require("../middeware/error_models").HttpStatusCode;
//     try{
//         throw new ERROR.APIError(HttpStatusCode.UNAUTHORIZED_REQUEST, "Student needs to login first", false);
//     }
//     catch(e){
//         if(error_handler.isHandleAble(e)){
//             await error_handler.handleError(e, res);
//         }
//         else{
//             console.log("DEBUG SENTRY");
//         }
//     }
// });
// TESTING EXCEL FILE
// student_router.get("/excel", admin_fxn.get_excel);

// overall status 
// student.router.get("/overall_status", check_auth, student_fxn.get_overall_status); 
// ########################### / ########################### / ###########################



// exporting express router
export default  student_router;
