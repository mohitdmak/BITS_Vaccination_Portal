// Requiring mongoose and using its schema ORM
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { isEmail } = require('validator');


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
    pic: {
        type: String,
        required: [true, 'Request does not have a profile picture']
    }
});



//Exporting student model.
const Student = mongoose.model('student', Studentschema);
module.exports = Student;
