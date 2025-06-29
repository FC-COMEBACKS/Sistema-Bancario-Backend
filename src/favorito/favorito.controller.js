import Favorito from "./favorito.model.js";
import Cuenta from "../Cuenta/cuenta.model.js";
import Movimiento from "../Movimiento/movimiento.model.js";

export const agregarFavorito = async (req, res) => {
  try {
    const { numeroCuenta, alias } = req.body;
    const usuarioId = req.usuario._id;

    const cuentaEncontrada = await Cuenta.findOne({ numeroCuenta });
    if (!cuentaEncontrada) {
      return res.status(404).json({
        msg: "La cuenta no existe",
      });
    }

    const cuentaPropia = await Cuenta.findOne({ usuario: usuarioId });
    if (cuentaPropia && cuentaPropia.numeroCuenta === numeroCuenta) {
      return res.status(400).json({
        msg: "No puedes agregar tu propia cuenta a favoritos",
      });
    }

    const favoritoExistente = await Favorito.findOne({
      usuario: usuarioId,
      cuentaFavorita: cuentaEncontrada._id,
    });

    if (favoritoExistente) {
      return res.status(400).json({
        msg: "Esta cuenta ya está en tus favoritos",
      });
    }

    const nuevoFavorito = new Favorito({
      usuario: usuarioId,
      cuentaFavorita: cuentaEncontrada._id,
      numeroCuenta,
      alias,
    });

    await nuevoFavorito.save();

    res.status(201).json({
      msg: "Cuenta agregada a favoritos correctamente",
      favorito: nuevoFavorito,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al agregar la cuenta a favoritos",
    });
  }
};

export const getFavoritos = async (req, res) => {
  try {
    const usuarioId = req.usuario._id;
    const favoritos = await Favorito.find({ usuario: usuarioId }).populate({
      path: "cuentaFavorita",
      select: "numeroCuenta tipo",
    });

    res.json({
      favoritos,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener los favoritos",
    });
  }
};

export const updateFavorito = async (req, res) => {
  try {
    const { id } = req.params;
    const { alias } = req.body;
    const usuarioId = req.usuario._id;

    const favorito = await Favorito.findOne({
      _id: id,
      usuario: usuarioId,
    });

    if (!favorito) {
      return res.status(404).json({
        msg: "Favorito no encontrado",
      });
    }

    favorito.alias = alias;
    await favorito.save();

    res.json({
      msg: "Favorito actualizado correctamente",
      favorito,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al actualizar el favorito",
    });
  }
};

export const deleteFavorito = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario._id;

    const favorito = await Favorito.findOne({
      _id: id,
      usuario: usuarioId,
    });

    if (!favorito) {
      return res.status(404).json({
        msg: "Favorito no encontrado",
      });
    }

    await Favorito.findByIdAndDelete(id);

    res.json({
      msg: "Favorito eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al eliminar el favorito",
    });
  }
};

export const transferirAFavorito = async (req, res) => {
  try {
    const {
      favoritoId,
      monto,
      descripcion = "Transferencia a favorito",
    } = req.body;
    const usuarioId = req.usuario._id;

    const favorito = await Favorito.findOne({
      _id: favoritoId,
      usuario: usuarioId,
    });

    if (!favorito) {
      return res.status(404).json({
        msg: "Favorito no encontrado",
      });
    }

    const cuentaOrigen = await Cuenta.findOne({ usuario: usuarioId });
    if (!cuentaOrigen) {
      return res.status(404).json({
        msg: "No tienes una cuenta asociada",
      });
    }
    const cuentaDestino = await Cuenta.findById(favorito.cuentaFavorita);
    if (!cuentaDestino) {
      return res.status(404).json({
        msg: "La cuenta del favorito no existe",
      });
    }

    if (cuentaOrigen.saldo < monto) {
      return res.status(400).json({
        msg: "Saldo insuficiente para realizar esta transferencia",
      });
    }

    if (monto > 2000) {
      return res.status(400).json({
        msg: "No se puede transferir más de Q2000 por transacción",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    cuentaOrigen.saldo -= monto;
    cuentaOrigen.egresos += monto;

    cuentaDestino.saldo += monto;
    cuentaDestino.ingresos += monto;

    const movimientoData = {
      cuentaOrigen: cuentaOrigen._id,
      cuentaDestino: cuentaDestino._id,
      monto,
      tipo: "TRANSFERENCIA",
      fechaHora: new Date(),
      descripcion: `${descripcion} (a favorito: ${favorito.alias})`,
    };

    const nuevoMovimiento = await Movimiento.create(movimientoData);

    if (cuentaOrigen.movimientos)
      cuentaOrigen.movimientos.push(nuevoMovimiento._id);
    if (cuentaDestino.movimientos)
      cuentaDestino.movimientos.push(nuevoMovimiento._id);

    await Promise.all([cuentaOrigen.save(), cuentaDestino.save()]);

    res.json({
      msg: "Transferencia a favorito realizada con éxito",
      origen: cuentaOrigen.numeroCuenta,
      destino: {
        numeroCuenta: cuentaDestino.numeroCuenta,
        alias: favorito.alias,
      },
      monto,
      saldoActual: cuentaOrigen.saldo,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al realizar la transferencia a favorito",
    });
  }
};