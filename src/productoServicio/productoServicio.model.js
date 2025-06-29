import { Schema, model } from "mongoose";

const ProductoServicioSchema = new Schema({
  nombre: { 
    type: String, 
    required: true, 
    unique: true
  },
  descripcion: { 
    type: String 
  },
  precio: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  disponible: { 
    type: Boolean, 
    default: true 
  }
}, {
  versionKey: false,
  timestamps: true
});

ProductoServicioSchema.methods.toJSON = function() {
  const { _id, ...productoServicio } = this.toObject();
  productoServicio.pid = _id;
  return productoServicio;
};

export default model('ProductoServicio', ProductoServicioSchema);

