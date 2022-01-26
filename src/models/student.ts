// mongo ORM and validator
import { Schema, model, Document } from 'mongoose';
const { isEmail } = require('validator');

// ########################### Validators ###########################
// validating verification status
function ValidateStatus(String: string) {
    if (String === 'PENDING' || String === 'DONE' || String === 'FAILED') {
        return true;
    } else {
        return false;
    }
}

// validating vaccination status
function ValidateVaccineStatus(String: string) {
    if (String === 'COMPLETE' || String === 'PARTIAL' || String === 'NONE') {
        return true;
    } else {
        return false;
    }
}
// ########################### / ########################### / ###########################

// ########################### Schemas ###########################
// importing vaccine mongoose schema
import { Vaccineschema } from './vaccine';

interface STUDENT extends Document {
    name: string;
    email: string;
    city?: string;
    state?: string;
    studentId?: string;
    gender?: string;
    is_above_18: boolean;
    staying_on_campus: boolean;
    is_containment_zone: boolean;
    is_medically_fit: boolean;
    TnC1_Agreement: boolean;
    TnC2_Agreement: boolean;
    latest_dose_date?: Date;
    arrival_date: Date;
    vaccination_status: string;
    manual_verification: string;
    auto_verification: string;
    overall_status: boolean;
    pic: string;
    pdf: string;
    consent_form: string;
    vaccine: any;
}

const Studentschema = new Schema({
    name: {
        type: String,
        required: [true, 'Request does not have a Name'],
    },
    email: {
        type: String,
        required: [true, 'Request does not have an email address'],
        unique: true,
        validate: [isEmail, "Request's email-id is not a valid email addresss"],
    },
    studentId: {
        type: String,
        //required: [true, 'Request does not have a BITS ID'],
        //unique: true,
        //default: ""
    //     // validate: [ValidateBitsId, "Request's BITS ID is not valid"]
    },
    is_above_18: {
        type: Boolean,
        required: [true, 'Request does not have is_above_18 field'],
        default: true
    },
    staying_on_campus: {
        type: Boolean,
        required: [true, 'Request does not contain preference for staying on campus'],
        default: true
    },
    gender: {
        type: String
    },
    city: {
        type: String,
        //required: [true, "Request does not have the Student Address"],
        //default: "Earth"
    },
    state: {
        type: String,
        //required: [true, "Request does not have the Student Address"],
        //default: "Earth"
    },
    is_containment_zone: {
        type: Boolean,
        required: [true, "Request does not specify if Student's address is a containment zone"],
        default: false,
    },
    is_medically_fit: {
        type: Boolean,
        required: [true, 'Request does not specify if Student is Medically Fit'],
        default: true,
    },
    TnC1_Agreement: {
        type: Boolean,
        required: [true, 'Request does not specify if Student has agreed to the terms and conditions'],
        default: true,
    },
    TnC2_Agreement: {
        type: Boolean,
        required: [true, 'Request does not specify if Student has agreed to the terms and conditions'],
        default: true,
    },
    latest_dose_date: {
        type: Date,
        // required: [true, "Request does not specify a Date for 1st Dose"],
        // default: new Date(2002, 08, 09, 10, 33, 30, 0)
    },
    arrival_date: {
        type: Date,
        required: [true, 'Request does not specify a Date for Arrival'],
        default: new Date(),
    },
    vaccination_status: {
        type: String,
        required: [true, 'Request does not contain a vaccination status'],
        default: 'NONE',
        validate: [ValidateVaccineStatus, "Request's vaccination status is not valid"],
    },
    auto_verification: {
        type: String,
        required: [true, 'Request does not contain an auto-verification status'],
        validate: [ValidateStatus, "Request's auto_verification status is not valid"],
        default: 'PENDING',
    },
    manual_verification: {
        type: String,
        required: [true, 'Request does not contain an auto-verification status'],
        validate: [ValidateStatus, "Request's auto_verification status is not valid"],
        default: 'PENDING',
    },
    // person who updated
    overall_status: {
        type: Boolean,
        default: false,
    },
    // comments
    pic: {
        type: String,
        required: [true, 'Request does not have a profile picture'],
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
},
    {
        timestamps: true
    });



const Student = model<STUDENT>('student', Studentschema);
export { Student, STUDENT };
