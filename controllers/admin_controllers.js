// auth requirements
var {google} = require('googleapis');
// Importing mongo student model
const Student = require('../models/student.js');
// importing vaccine model
const Vaccine = require('../models/vaccine.js').Vaccine;

//password configs
const password = require('../config/admin.js').password;
const username = require('../config/admin.js').username;
const hashed = require('../config/admin.js').hashed;


// set pagination limit
const page_limit = 50;

//login
const post_login = async(req, res) => {
    const {client_username, client_password} = req.body;
    if(client_username == username && client_password === password){
        res.status(201).json({"jwt": hashed});
    }
    else{
        console.log("WRONG ADMIN PASSWORD OR USERNAME");
        res.status(400).json({"error": "ADMIN PASSWORD OR USERNAME IS INCORRECT"});
    }
}

// Handler for POST REQs submitting pdfs
const post_students = async ( req, res) => {

    // get page no
    const page = Number(req.body.page);
    // iterate through json to get filter specs
    var filters = req.body.filters;

    // parse filters
    console.log("Deleting null filters . . .");
    for(var key in filters){
        if(filters[key] == null){
            console.log(key);
            delete filters[key];
        }
    }

    try{
        // return list of students
        var students = await Student.find(filters);
        var total_pages;
        // set total pages
        if(students.length % page_limit === 0){
            total_pages = students.length / page_limit;
        }
        else{
            total_pages = Math.floor(students.length / page_limit) + 1;
        }

        // update pagination
        var students = await Student.find(filters).skip((page-1) * page_limit).limit(page_limit);

        // get filter dates
        var beggining = Date.parse(req.body.between.start);
        var ending = Date.parse(req.body.between.end);

        // get batchwise filter
        var batch = req.body.batch;

        // edit entries by batch
        if(batch.length){
	    console.log(req.body);
	    for (let i = 0; i < students.length; i++) {
                if(batch.indexOf(String(students[i].email.substr(1, 4))) > 2 || batch.indexOf(String(students[i].email.substr(1, 4))) < 0){
                    console.log(students[i].email.substr(1, 4));
                    students.splice(i, 1);
		    i--;
                }
            }
        }

        // edit all entries for student
        //students.forEach(function(student, index, theArray){
        for (let i = 0; i < students.length; i++) {
            if((beggining != undefined && ending != undefined)){
                if( beggining <= Date.parse(students[i].arrival_date) && Date.parse(students[i].arrival_date) <= ending){
                    students[i] = {
                        "_id": students[i]._id,
                        "pic": students[i].pic,
                        "name": students[i].name,
                        "email": students[i].email,
                        "vaccination_status": students[i].vaccination_status,
                        "auto_verification": students[i].auto_verification,
                        "manual_verification": students[i].manual_verification,
                        "overall_status": students[i].overall_status,
                        "arrival_date": students[i].arrival_date,
                        "city": students[i].city,
                        "is_containment_zone": students[i].is_containment_zone, 
                        "pdf": students[i].pdf,
                        "consent_form": students[i].consent_form
                    }
                }
                else{
                    console.log("removed, not in time range :");
		    console.log(students[i]);
                    students.splice(i, 1);
		    i--;
                }
            }
            else{
                students[i] = {
                    "_id": students[i]._id,
                    "pic": students[i].pic,
                    "name": students[i].name,
                    "email": students[i].email,
                    "vaccination_status": students[i].vaccination_status,
                    "auto_verification": students[i].auto_verification,
                    "manual_verification": students[i].manual_verification,
                    "overall_status": students[i].overall_status,
                    "arrival_date": students[i].arrival_date,
                    "city": students[i].city,
                    "is_containment_zone": students[i].is_containment_zone, 
                    "pdf": students[i].pdf,
                    "consent_form": students[i].consent_form
                }
            }
        }
        console.log("	ADMIN PROVIDED STUDENTS LIST");
	console.log(students);
        res.status(200).json({
            "total_pages": total_pages,
            "data": students
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            "error": err
        });
    }
}

// Handler for GET REQs on particular student
const get_student = async (req, res) => {

    // get id no
    const id = req.body._id;
    //console.log(id);
    try{
        var student = await Student.findById(id);
        console.log(" STUDENT DETAIL SENT IS : ");
        console.log(student);
        console.log("	ADMIN PROVIDED STUDENT DETAIL");
        res.status(200).json({
            "_id": student._id,
            "pic": student.pic,
            "name": student.name,
            "email": student.email,
            "vaccination_status": student.vaccination_status,
            "auto_verification": student.auto_verification,
            "manual_verification": student.manual_verification,
            "overall_status": student.overall_status,
            "city": student.city,
            "arrival_date": student.arrival_date,
            "is_containment_zone": student.is_containment_zone,
            "pdf": student.pdf,
            "consent_form": student.consent_form
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            "error": err
        });
    }
}

// Handler for UPDATE REQs on a particular student
const update_student = async (req, res) => {

    // get  id no
    const id = req.body._id;
    try{
        var updates = req.body.updates;
        var student = await Student.findOneAndUpdate({_id: id}, updates, {new: true});
        console.log("	ADMIN UPDATED STUDENT STATUS");
        console.log("Verifying overall status . . .");
        if(student.pdf && student.consent_form && student.vaccination_status == 'COMPLETE'){
            console.log("All fields proper, updating student model and session cache . . .");
            var new_student = await Student.findOneAndUpdate({email: student.email}, {overall_status: true}, {new:true});
            console.log("Overall Access grant updated .");
        }
        res.status(200).json({
            "_id": student._id,
            "pic": student.pic,
            "name": student.name,
            "email": student.email,
            "vaccination_status": student.vaccination_status,
            "auto_verification": student.auto_verification,
            "manual_verification": student.manual_verification,
            "overall_status": student.overall_status,
            "pdf": student.pdf,
            "consent_form": student.consent_form
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            "error": err
        });
    }
}

// Handler for VIEW REQs of pdfs for student
// serving stored pdf file
const get_pdf = async (req, res) => {
    // get current logged in student
    try{
        // get downloaded file path
        var id = req.body._id;
        var student = await Student.findById(id);
        if(student.pdf){
            var serve_file = student.pdf;
            console.log("\n		Serving PDF file at : ");
            console.log(String(serve_file)); 
            res.download(String(serve_file), function(err){
                if(err){
                    console.log(err);
                    res.status(500).json({"error": "NO FILE FOUND ON SERVER"});
                }
                else{
                    console.log("File served .");
                }
            });
        }
        else{
            console.log("NO PDF FILE FOUND FOR STUDENT REQUESTED BY ADMIN");
            res.status(400).json({"error": "NO FILE FOUND ON SERVER"});
        }
    }
    // forward login errors
    catch(err){
        console.log(err);
        res.status(500).json({"error": err});
    }
}


//Handler for view requests of consent form by admin
// serving stored pdf file
const get_consent = async (req, res) => {
    // get current logged in student
    try{
        // get downloaded file path
        var id = req.body._id;
        var student = await Student.findById(id);
        if(student.consent_form){
            var serve_file = student.consent_form;
            console.log("\n		Serving PDF file at : ");
            console.log(String(serve_file)); 
            res.download(String(serve_file), function(err){
                if(err){
                console.log(err);
                res.status(500).json({"error": "NO FILE FOUND ON SERVER"});
                }
                else{
                console.log("File served .");
                }
            });
        }
        else{
            console.log("NO PDF FILE FOUND FOR STUDENT REQUESTED BY ADMIN");
            res.status(400).json({"error": "NO FILE FOUND ON SERVER"});
        }
        }
        // forward login errors
    catch(err){
        console.log(err);
        res.status(500).json({"error": err});
    }
}

//alt details
const post_details = (req, res) => {
    console.log("ALT ADMIN DETAILS CALLED");
    res.status(200).json({"success": "admin is allowed"});
}

module.exports = {
    update_student,
    get_student,
    post_students,
    get_pdf,
    get_consent,
    post_login,
    post_details
}
