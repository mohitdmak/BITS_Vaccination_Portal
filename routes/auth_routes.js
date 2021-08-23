// importing express 
const express = require("express");

// importing controller for authentication
const auth_fxn = require("../controllers/auth_controllers.js");

// creating express router 
var auth_router = express.Router();


//* Defining routes

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

// exporting express router
module.exports = auth_router;
