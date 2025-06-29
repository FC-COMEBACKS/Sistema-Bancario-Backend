import { Schema, model } from "mongoose";

const CuentaSchema = new Schema({
  usuario: { 
    type: Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  numeroCuenta: {
    type: String,
    required: true,
    unique: true,
  },
  tipo: { 
    type: String, 
    enum: ['AHORROS', 'CORRIENTE'], 
    default: 'AHORROS' 
  },
  saldo: { 
    type: Number, 
    default: 0 
  },
  ingresos: { 
    type: Number, 
    default: 0 
  },   
  egresos: { 
    type: Number, 
    default: 0 
  },   
  movimientos: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Movimiento' 
  }],
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  }
}, {
  versionKey: false,
  timestamps: true
});

CuentaSchema.methods.toJSON = function() {
  const { _id, ...cuenta } = this.toObject();
  cuenta.cid = _id;
  return cuenta;
};

export default model('Cuenta', CuentaSchema);
