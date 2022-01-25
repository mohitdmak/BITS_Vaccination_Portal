// express  router
import express from 'express';
const student_router = express.Router();
// importing controller for authentication
import student_fxn from '../controllers/student_controllers';
// import admin_fxn from "../controllers/admin_controllers.js";
// importing middleware
import check_auth from '../middeware/check_auth';


// ########################### Defining routes ###########################
// handling certificate pdf post
student_router.post('/post_pdf', check_auth, student_fxn.upload.single('pdf'), student_fxn.post_pdf);

// getting student's pdf
student_router.get('/get_pdf', check_auth, student_fxn.get_pdf);

// post consent form
student_router.post('/post_consent', check_auth, student_fxn.upload.single('consent_form'), student_fxn.post_consent);

// get consent form
student_router.get('/get_consent', check_auth, student_fxn.get_consent);

// Setting auth tokens in session
// student_router.get("/all", check_auth, student_fxn.get_all);

// Showing protected page with student details
student_router.get('/details', check_auth, student_fxn.get_student_details);

// post extra data
student_router.post('/extra', student_fxn.post_extra_data);

// Logout page
student_router.get('/logout', student_fxn.get_logout);

// overall status 
student_router.post("/staying_on_campus", student_fxn.get_staying_on_campus_status); 
// ########################### / ########################### / ###########################


// exporting express router
export default student_router;
