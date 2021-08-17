// auth requirements
var {google} = require('googleapis');
// Importing mongo student model
const Student = require('../models/student.js');
// importing vaccine model
const Vaccine = require('../models/vaccine.js').Vaccine;


// set pagination limit
const page_limit = 50;

// Handler for POST REQs submitting pdfs
const post_students = async ( req, res) => {

    // get page no
    const page = Number(req.body.page);
    // iterate through json to get filter specs
    var filters = req.body.filters;

    try{
        // return list of students
        var students = await Student.find(filters).skip((page - 1) * page_limit).limit(page_limit);
        var total_pages = students.length;
        // var students = students.skip(page * page_limit).limit(page_limit);
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
    console.log(id);
    try{
        var student = await Student.findById(id);
        res.status(200).json(student);
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
        console.log(updates);
        var student = await Student.findOneAndUpdate({_id: id}, updates, {new: true});
        console.log(student);
        res.status(200).json(student);
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            "error": err
        });
    }
}



module.exports = {
    update_student,
    get_student,
    post_students
}
