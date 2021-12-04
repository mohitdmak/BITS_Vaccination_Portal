// mongo ORM and validator
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { isEmail } = require('validator');


// schema for QR being a json object
const Vaccineschema = new schema({
    QR: {
        type: Object,
        required: [true, 'Request does not have a QRCODE DATA']
    },
});


// export ORM's vaccine model and schema seperately for controllers and student schema resp.
const Vaccine = mongoose.model('vaccine', Vaccineschema);
module.exports = {
    Vaccine,
    Vaccineschema
};
