// express to create router 
const express = require("express");
var admin_router = express.Router();

// importing controller for authentication
const admin_fxn = require("../controllers/admin_controllers.js");

// importing admin authenticating middleware
const check_admin_auth = require("../middeware/check_admin_auth");

// alternative check (referrer being admin client)
const alternative_check_admin = require("../middeware/alternative_check_admin.js");



// ########################### Defining routes ###########################

// serving students on filter
admin_router.post("/students", check_admin_auth,  admin_fxn.post_students);

// details of particular id
admin_router.post("/student", check_admin_auth, admin_fxn.get_student);

// admin update student details
admin_router.post("/update", check_admin_auth,  admin_fxn.update_student);

// get consent form
admin_router.get("/get_consent",  admin_fxn.get_consent);

// get pdf form
admin_router.get("/get_pdf",  admin_fxn.get_pdf);

// login jwt verification
admin_router.post("/login", admin_fxn.post_login);

// placeholder endpoint
admin_router.post("/details", check_admin_auth, admin_fxn.post_details);

// Get excel file of database
admin_router.get("/excel", alternative_check_admin, admin_fxn.get_excel);

// access modifier  for batches
admin_router.post("/allow", check_admin_auth, admin_fxn.restrict_access); 

// get access allowed batches
admin_router.get("/allow", admin_fxn.get_restrict_access); 
// ########################### / ########################### / ###########################


    
// exporting express router
module.exports = admin_router;
