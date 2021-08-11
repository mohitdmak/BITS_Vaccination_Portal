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

// Showing protected page with user details
auth_router.get("/details", auth_fxn.get_user_details);

// Logout page
auth_router.get("/logout", auth_fxn.get_logout);


// exporting express router
module.exports = auth_router;
