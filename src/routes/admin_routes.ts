// express to create router
import express from 'express';

// importing controller for authentication
import admin_fxn from '../controllers/admin_controllers';

// importing admin authenticating middleware
import check_admin_auth from '../middeware/check_admin_auth';

// alternative check (referrer being admin client)
import alternative_check_admin from '../middeware/alternative_check_admin';

const admin_router = express.Router();

// ########################### Defining routes ###########################
// serving students on filter
admin_router.post('/students', check_admin_auth, admin_fxn.post_students);

// details of particular id
admin_router.post('/student', check_admin_auth, admin_fxn.get_student);

// admin update student details
admin_router.post('/update', check_admin_auth, admin_fxn.update_student);

// get consent form
admin_router.get('/get_consent', admin_fxn.get_consent);

// get pdf form
admin_router.get('/get_pdf', admin_fxn.get_pdf);

// login jwt verification
admin_router.post('/login', admin_fxn.post_login);

// placeholder endpoint
admin_router.post('/details', check_admin_auth, admin_fxn.post_details);

// Get excel file of database
admin_router.get('/excel', alternative_check_admin, admin_fxn.get_excel);

// access modifier  for batches
admin_router.post('/allow', check_admin_auth, admin_fxn.restrict_access);

// get access allowed batches
admin_router.get('/allow', admin_fxn.get_restrict_access);

// validator
admin_router.get('/validate', admin_fxn.validate);
// ########################### / ########################### / ###########################

// exporting express router
export default admin_router;
