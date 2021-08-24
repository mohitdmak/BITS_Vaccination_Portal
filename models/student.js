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

// validating status
function ValidateVaccineStatus(String){
    if(String === 'COMPLETE' || String === 'PARTIAL' || String === 'NONE'){
        return true;
    }
    else{
        return false;
    }
}

// validate bits id
function ValidateBitsId(String){

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
    // bits_id: {
    //     type: String,
    //     required: [true, 'Request does not have a BITS ID'],
    //     unique: true,
    //     default: "2020A7PS0048P"
    //     // validate: [ValidateBitsId, "Request's BITS ID is not valid"]
    // },
    city: {
        type: String,
	//required: [true, "Request does not have the Student Address"],
	//default: "Earth"
    },
    is_containment_zone: {
        type: Boolean,
        required: [true, "Request does not specify if Student's address is a containment zone"],
        default: false
    },
    is_medically_fit: {
        type: Boolean,
        required: [true, "Request does not specify if Student is Medically Fit"],
        default: true 
    },
    TnC1_Agreement: {
        type: Boolean,
        required: [true, "Request does not specify if Student has agreed to the terms and conditions"],
        default: true
    },
    TnC2_Agreement: {
        type: Boolean,
        required: [true, "Request does not specify if Student has agreed to the terms and conditions"],
        default: true
    },
    latest_dose_date: {
        type: Date,
        //required: [true, "Request does not specify a Date for 1st Dose"],
        //default: new Date(2002, 08, 09, 10, 33, 30, 0)
    },
    arrival_date: {
        type: Date,
        required: [true, "Request does not specify a Date for Arrival"],
        default: new Date().setTime(new Date().getTime() + 19800000)
    },
    vaccination_status: {
        type: String,
        required: [true, 'Request does not contain a vaccination status'],
        default: 'NONE',
        validate: [ValidateVaccineStatus, 'Request\'s vaccination status is not valid']
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
    overall_status: {
        type: Boolean,
        default: false
    },
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
    // pdf_data: {
    //     type: Buffer
    // },
    // consent_form_data: {
    //     type: Buffer
    // },
    vaccine: Vaccineschema
});



//Exporting student model.
const Student = mongoose.model('student', Studentschema);
module.exports = Student;
