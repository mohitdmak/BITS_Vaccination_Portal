// auth requirements
var {google} = require('googleapis');

// Importing mongo student model
const Student = require('../models/student.js');

// Importing function to generate OauthClient
var { getOAuthClient } = require("./auth_controllers");

// Handler for post requests to signup
const post_signup = async (req, res) => {

    // Reject process if oauth login hasn't been done (ALLOWING POSTMAN OAUTH2 IN DEV ENV ONLY)
    if(req.session["tokens"] || (process.env.npm_lifecycle_event === 'dev_local' && req.query.access_token)){
        try{
            // getting oauth2Client
            var oauth2Client = getOAuthClient();
            // querying user data from google oauth2
            if(req.session["tokens"]){
                oauth2Client.setCredentials(req.session["tokens"]);
            }
            else if(process.env.npm_lifecycle_event === 'dev_local'){
                // For testing via postman
                oauth2Client.setCredentials({access_token: req.query.access_token});
            }
            // getting user details
            var oauth2 = google.oauth2({
                auth: oauth2Client,
                version: 'v2'
            });

            var dob = new Date(String(req.body.year) + "-" + String(req.body.month) + "-" + String(req.body.day));
            // creating student object to save in db
            const user = await oauth2.userinfo.get();
            var student = new Student({
                "name": user.data.name,
                "email": user.data.email,
                "phone": req.body.phone,
                "gender": req.body.gender,
                "dob": dob
            });

            // finish up
            await student.save();

            // storing user data in redis cache
            req.session["student"] = student;

            console.log("A new student has registered");
            // sending db confirmation
            res.status(201).json(student);
        }
        catch(err){
            // send forth the error
            console.log(err);
            res.status(501).json(err);
        }
    }
    else{
        // dont allow registering
        res.status(400).json({"error": "Oauth2 login has not been done yet, no tokens found"});
    }
}

// The protected page
const get_student_details = async (req, res) => {

    if(req.session["student"]){
        try{
            // serve student details
            const student = req.session["student"];
            console.log("Student details provided");
            res.status(200).json(student);
        }
        catch(err){
            // send error report
            console.log(err);
            res.status(500).json(err);
        }
    }
    else{
        res.status(401).json({"error":"No student is logged in currently"});
    }
};

// landing page
const get_all = async (req, res) => {
    try{
        const students = await Student.find();
        res.status(200).json(students);
    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
};

const get_logout = (req, res) => {

    // removing tokens from session
    req.session.destroy();

    res.status(200).json({"logout": "success"});
};

module.exports = {
    post_signup,
    get_all,
    get_student_details,
    get_logout
}
