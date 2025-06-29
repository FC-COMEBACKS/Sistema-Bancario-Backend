import { Schema, model } from "mongoose";

const UsuarioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      immutable: true,
    },
    rol: {
      type: String,
      enum: ["ADMIN", "CLIENT"],
      default: "CLIENT",
    },
    dpi: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },
    estado: {
      type: String,
      enum: ["ACTIVO", "INACTIVO"],
      default: "ACTIVO",
    },
    direccion: {
      type: String,
      required: true,
    },
    celular: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    nombreTrabajo: {
      type: String,
      required: true,
    },
    ingresosMensuales: {
      type: Number,
      required: true,
      min: 100,
    },
    fechaRegistro: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

UsuarioSchema.methods.toJSON = function () {
  const { _id, ...usuario } = this.toObject();
  usuario.uid = _id;
  return usuario;
};

export default model("Usuario", UsuarioSchema);