// Requiring mongoose and using its schema ORM
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { isEmail } = require('validator');


// Regex verification of student's phone number.
function IsValidIndianMobileNumber(str) {
    // Regular expression to check if string is a Indian mobile number
    const regexExp = /^[6-9]\d{9}$/gi;
    return regexExp.test(str);
}

// Available choices for gender of student.
function IsValidGender(str){
    if(str === 'Male' || str === 'Female' || str === 'Other'){
        return true;
    }else{
        return false;
    }
}

// Verifying validity of Name string
function IsValidName(str){
    if(str.length < 101){
        return true;
    }
    else{
        return false;
    }
}

// Verrifying validity of DOB
function IsValidDOB(date){
    // parsing data
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    if((0 < day < 32) && (0 < month < 13) && (1900 < year < new Date().getFullYear())){
        return true;
    }
    else{
        return false;
    }
}


// Creating student schema
const Studentschema = new schema({
    name: {
        type: String,
        required: [true, 'Request does not have a Name'],
        valid: [IsValidName, 'Request\'s Name is invalid']
    },
    email: {
        type: String,
        required: [true, 'Request does not have an email address'],
        unique: true,
        validate: [isEmail, 'Request\'s email-id is not a valid email addresss']
    },
    phone: {
        type: String,
        required: [true, 'Request does not have a phone number'],
        unique: true,
        validate: [IsValidIndianMobileNumber, 'Request\'s phone number is not a valid Indian mobile number']
    },
    gender: {
        type: String,
        required: [true, 'Request does not have a gender'],
        validate: [IsValidGender, 'Request\'s gender is not a valid gender']
    },
    dob: {
        type: Date,
        required: [true, 'Request does not have a DOB'],
        validate: [IsValidDOB, 'Request\'s DOB is not valid']
    }
});



//Exporting student model.
const Student = mongoose.model('student', Studentschema);
module.exports = Student;