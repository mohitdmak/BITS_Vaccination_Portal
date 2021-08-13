// Requiring mongoose and using its schema ORM
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { isEmail } = require('validator');

// validating status
function ValidateStatus(String){
    if(String === 'PENDING' || String === 'DONE' || String === 'FAILED'){
        return true;
    }
    else{
        return false;
    }
}


// importing vaccine mongoose schema
const Vaccineschema = require("./vaccine").Vaccineschema;

const Studentschema = new schema({
    name: {
        type: String,
        required: [true, 'Request does not have a Name']
    },
    email: {
        type: String,
        required: [true, 'Request does not have an email address'],
        unique: true,
        validate: [isEmail, 'Request\'s email-id is not a valid email addresss']
    },
    vaccination_status: {
        type: Boolean,
        required: [true, 'Request does not contain a vaccination status'],
        default: false
    },
    auto_verification: {
        type: String,
        required: [true, 'Request does not contain an auto-verification status'],
        validate: [ValidateStatus, 'Request\'s auto_verification status is not valid'],
        default: 'PENDING'
    },
    manual_verification: {
        type: String,
        required: [true, 'Request does not contain an auto-verification status'],
        validate: [ValidateStatus, 'Request\'s auto_verification status is not valid'],
        default: 'PENDING'
    },
    // person who updated 
    // overall_status: 
    // comments
    pic: {
        type: String,
        required: [true, 'Request does not have a profile picture']
    },
    pdf: {
        type: String,
    },
    consent_form: {
        type: String,
    },
    vaccine: Vaccineschema
});



//Exporting student model.
const Student = mongoose.model('student', Studentschema);
module.exports = Student;
