import { Schema, model } from "mongoose";

const MovimientoSchema = new Schema({
    cuentaOrigen: {
        type: Schema.Types.ObjectId,
        ref: 'Cuenta'
    },   
    cuentaDestino: {
        type: Schema.Types.ObjectId,
        ref: 'Cuenta'
    },   
    monto: {
        type: Number,
        required: true,
        min: 0.01
    },
    tipo: {
        type: String,
        enum: ['TRANSFERENCIA', 'COMPRA', 'DEPOSITO', 'CREDITO', 'CANCELACION'],
        required: true
    },
    productoServicio: {
        type: Schema.Types.ObjectId,
        ref: 'ProductoServicio'
    },
    fechaHora: {
        type: Date,
        default: Date.now
    },
    reversed: {
        type: Boolean,
        default: false
    },
    originalMovimiento: {
        type: Schema.Types.ObjectId,
        ref: 'Movimiento'
    },
    descripcion: {
        type: String
    },
    montoConvertido: {
        type: Number,
        min: 0
    },
    tasaCambio: {
        type: Number,
        min: 0
    }
}, {
    versionKey: false,
    timestamps: true
});

MovimientoSchema.methods.toJSON = function () {
    const { _id, ...movimiento } = this.toObject();
    movimiento.mid = _id;
    return movimiento;
};

export default model('Movimiento', MovimientoSchema);

