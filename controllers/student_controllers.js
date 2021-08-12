// auth requirements
var {google} = require('googleapis');
// Importing mongo student model
const Student = require('../models/student.js');
// importing vaccine model
const Vaccine = require('../models/vaccine.js').Vaccine;

// configuring multer for storing pdfs
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './media/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + req.session["student"][0].email + path.extname(file.originalname));
    }
});

// Importing function to generate OauthClient
var { getOAuthClient } = require("./auth_controllers");

let upload = multer({ storage: storage});


// Handler for POST REQs submitting pdfs
const post_pdf = async ( req, res) => {
    //!!!!!!!!!!!!!!!!!!! ONLY FOR DEV ENV
    // if(process.env.npm_lifecycle_event === 'dev_local' &&  req.query.access_token){
    //     // For testing via postman
    //     oauth2Client.setCredentials({access_token: req.query.access_token});
    //     // getting user details
    //     var oauth2 = google.oauth2({
    //         auth: oauth2Client,
    //         version: 'v2'
    //     });

    //     const user = await oauth2.userinfo.get();
    //     try{
    //         var student = await Student.find({email : user.data.email});
    //         req.session["student"] = student;
    //         // get_data(req, res);
    //         res.status(200).json({"file saved": req.file.path});
    //     }
    //     catch(err){
    //         res.status(500).json(err);
    //     }
    // }
    // 'pdf' is the name of our file input field in the HTML form
    // req.file contains information of uploaded file
    if(req.session["student"]){
        try{
            if (req.fileValidationError) {
                return res.send(req.fileValidationError);
            }
            else if (!req.file) {
                return res.send('Please select an image to upload');
            }
            else{
                get_data(req, res);
                // res.status(200).json({"file saved": req.file.path});
            }
        }
        // forward non multer errors
        catch(err){
            console.log(err);
            res.status(500).json(err);
        }
    }
    else{
        res.status(400).json({"error": "Student has not logged in yet."});
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

// The protected page
const get_data = async (req, res) => {
   try{
       var file_name = req.file.path;
       var cp = require('child_process');
       cp.exec(`cd PyDIVOC &&  python3 solve.py ${file_name}`, async function(err, stdout, stderr) {
          // handle err, stdout, stderr
            console.log(err);
            console.log(stderr);
           
           // main python output from PyDOC
            console.log(stdout);
           // Using REGEX to replace escape sequences, due to baash output
            var regedStr = stdout.replace(/\\n/g, "\\n")  
               .replace(/\\'/g, "\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, "\\&")
               .replace(/\\r/g, "\\r")
               .replace(/\\t/g, "\\t")
               .replace(/\\b/g, "\\b")
               .replace(/\\f/g, "\\f");

           // convert to json using regex
           var parsedStr = regedStr.replace(/\'/g, '"');
           console.log(parsedStr);

           // create vaccine object and save
            var vaccine = new Vaccine({
                'QR': JSON.parse(parsedStr)
            });
           var vac = await vaccine.save();

           // find db student instance
           var student = await Student.findOneAndUpdate({email: req.session["student"][0].email}, {vaccine: vac}, {new: true});
           console.log(student.vaccine.QR.type);
        });
       // return saved status
       res.status(201).json({"file saved": req.file.path});
    }
    catch(err){
        console.log(err);
        res.status(500).json(err);
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
    get_all,
    get_student_details,
    get_logout,
    post_pdf,
    upload
}
