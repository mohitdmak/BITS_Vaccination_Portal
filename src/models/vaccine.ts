// mongo ORM and validator
import { Schema, model, Document } from 'mongoose';
// const schema = Schema;

interface VACCINE extends Document{
    QR: any,
}

// schema for QR being a json object
const Vaccineschema = new Schema({
    QR: {
        type: Object,
        required: [true, 'Request does not have a QRCODE DATA']
    },
});


// export ORM's vaccine model and schema seperately for controllers and student schema resp.
const Vaccine = model<VACCINE>('vaccine', Vaccineschema);
export {
    Vaccine,
    VACCINE,
    Vaccineschema
};
