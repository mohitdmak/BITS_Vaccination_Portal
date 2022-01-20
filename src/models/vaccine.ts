// mongo ORM and validator
import { Schema, model, Document } from 'mongoose';
// const schema = Schema;

export interface Vacc extends Document{
    QR: Object
}

// schema for QR being a json object
const Vaccineschema = new Schema({
    QR: {
        type: Object,
        required: [true, 'Request does not have a QRCODE DATA']
    },
});


// export ORM's vaccine model and schema seperately for controllers and student schema resp.
const Vaccine = model<Vacc>('vaccine', Vaccineschema);
export {
    Vaccine,
    Vaccineschema
};
