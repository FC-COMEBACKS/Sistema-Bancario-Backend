import { Schema, model } from "mongoose";

const DivisaSchema = new Schema({
    codigo: {
        type: String, 
        required: true, 
        unique: true
    },
    nombre: {
        type: String,
        required: true
    },
    tasaEnQuetzales: {
        type: Number,
        required: true,
        min: 0.0001
    },
    activo: {
        type: Boolean,
        default: true
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false,
    timestamps: true
});

DivisaSchema.methods.toJSON = function() {
    const { _id, ...divisa } = this.toObject();
    divisa.did = _id;
    return divisa;
};

export default model('Divisa', DivisaSchema);
