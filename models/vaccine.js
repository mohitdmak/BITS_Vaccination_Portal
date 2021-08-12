// Requiring mongoose and using its schema ORM
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { isEmail } = require('validator');


const Vaccineschema = new schema({
    QR: {
        type: Object,
        required: [true, 'Request does not have a QRCODE DATA']
    },
});



//Exporting student model.
const Vaccine = mongoose.model('vaccine', Vaccineschema);
module.exports = {
    Vaccine,
    Vaccineschema
};
