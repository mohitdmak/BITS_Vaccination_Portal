// express router
import express from "express";
var auth_router = express.Router();

// importing controller for authentication
import auth_fxn from "../controllers/auth_controllers.js";


// ########################### Defining routes ###########################
// Auth landing page
auth_router.get("/", auth_fxn.get_auth_url);

// Setting auth tokens in session
auth_router.get("/oauthCallback", auth_fxn.set_tokens);

// admin
// auth_router.get("/AdminoauthCallback", auth_fxn.set_tokens_admin);

// Showing protected page with user details
auth_router.get("/details", auth_fxn.get_user_details);

// login page
auth_router.get("/login", auth_fxn.get_login); 

// Logout page
auth_router.get("/logout", auth_fxn.get_logout);

// JSON Obtaining fxn
// auth_router.get("/data", auth_fxn.get_data); 
// ########################### / ########################### / ###########################


// exporting express router
export default auth_router;
