import { Schema, model } from "mongoose";

const FavoritoSchema = new Schema({
  usuario: { 
    type: Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  cuentaFavorita: { 
    type: Schema.Types.ObjectId, 
    ref: 'Cuenta', 
    required: true 
  },
  numeroCuenta: {
    type: String,
    required: true
  },
  alias: { 
    type: String, 
    required: true 
  },
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  }
}, {
  versionKey: false,
  timestamps: true
});

FavoritoSchema.index({ usuario: 1, cuentaFavorita: 1 }, { unique: true });

FavoritoSchema.methods.toJSON = function() {
  const { _id, ...favorito } = this.toObject();
  favorito.fid = _id;
  return favorito;
};

export default model('Favorito', FavoritoSchema);

