import Cuenta from "./cuenta.model.js";
import Movimiento from "../Movimiento/movimiento.model.js";
import Favorito from "../Favorito/favorito.model.js";
import ProductoServicio from "../ProductoServicio/productoServicio.model.js";

const generarNumeroCuenta = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return timestamp.slice(-6) + random;
};

const verificarLimiteDiarioTransferencias = async (cuentaId, monto) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const transferenciasHoy = await Movimiento.find({
        cuentaOrigen: cuentaId,
        tipo: 'TRANSFERENCIA',
        fechaHora: { $gte: today, $lt: tomorrow }
    });
    
    let totalTransferidoHoy = 0;
    transferenciasHoy.forEach(t => {
        totalTransferidoHoy += t.monto;
    });
    
    if (totalTransferidoHoy + monto > 10000) {
        throw new Error("Has excedido el límite diario de transferencia de Q10,000");
    }
    
    return true;
};

export const crearCuenta = async (req, res) => {
    try {
        const { usuario, tipo } = req.body;
        
        const cuentaExistente = await Cuenta.findOne({ usuario });
        if (cuentaExistente) {
            return res.status(400).json({
                msg: "El usuario ya tiene una cuenta y solo puede tener una"
            });
        }
        
        let numeroCuenta;
        let existe = true;
        
        while (existe) {
            numeroCuenta = generarNumeroCuenta();
            const cuentaConMismoNumero = await Cuenta.findOne({ numeroCuenta });
            if (!cuentaConMismoNumero) {
                existe = false;
            }
        }
        
        const nuevaCuenta = new Cuenta({
            usuario,
            numeroCuenta,
            tipo
        });
        
        await nuevaCuenta.save();
        
        res.status(201).json({
            msg: "Cuenta creada correctamente",
            cuenta: nuevaCuenta
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al crear la cuenta"
        });
    }
};

export const editarCuenta = async (req, res) => {
    try {
        const { cid } = req.params;
        const { tipo } = req.body;
        
        const cuentaActualizada = await Cuenta.findByIdAndUpdate(
            cid,
            { tipo },
            { new: true }
        );
        
        res.json({
            msg: "Cuenta actualizada correctamente",
            cuenta: cuentaActualizada
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al actualizar la cuenta"
        });
    }
};

export const getDetallesCuenta = async (req, res) => {
    try {
        const { cid } = req.params;
        const usuario = req.usuario;
        
        const esAdmin = usuario.rol === 'ADMIN';

        const cuenta = await Cuenta.findById(cid)
            .populate('usuario', 'nombre username email')
            .populate({
                path: 'movimientos',
                options: { sort: { fechaCreacion: -1 }, limit: 5 }
            });
            
        if (!cuenta) {
            return res.status(404).json({
                success: false,
                msg: "Cuenta no encontrada"
            });
        }
        
        const esPropietario = cuenta.usuario._id.toString() === usuario._id.toString();
        
        if (!esAdmin && !esPropietario) {
            return res.status(403).json({
                success: false,
                msg: "No tiene autorización para acceder a los detalles de esta cuenta"
            });
        }
        res.json({
            success: true,
            cuenta
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener los detalles de la cuenta"
        });
    }
};

export const realizarTransferencia = async (req, res) => {
    try {
        const { cuentaOrigen, cuentaDestino, monto, descripcion = "Transferencia" } = req.body;
        
        const origen = await Cuenta.findOne({ numeroCuenta: cuentaOrigen });
        if (!origen) {
            return res.status(404).json({
                success: false,
                msg: "Cuenta de origen no encontrada"
            });
        }
        
        const destino = await Cuenta.findOne({ numeroCuenta: cuentaDestino });
        if (!destino) {
            return res.status(404).json({
                success: false,
                msg: "Cuenta de destino no encontrada"
            });
        }
        
        if (origen.numeroCuenta === destino.numeroCuenta) {
            return res.status(400).json({
                msg: "No se puede transferir a la misma cuenta"
            });
        }
        
        if (origen.saldo < monto) {
            return res.status(400).json({
                msg: "Saldo insuficiente"
            });
        }
        
        if (monto > 2000) {
            return res.status(400).json({
                msg: "No se puede transferir más de Q2000 por transacción"
            });
        }
        await verificarLimiteDiarioTransferencias(origen._id, monto);
        
        origen.saldo -= monto;
        origen.egresos += monto;
        
        destino.saldo += monto;
        destino.ingresos += monto;
        
        const movimiento = new Movimiento({
            cuentaOrigen: origen._id,
            cuentaDestino: destino._id,
            monto: monto,
            tipo: 'TRANSFERENCIA',
            descripcion: descripcion || `Transferencia de ${origen.numeroCuenta} a ${destino.numeroCuenta}`,
            fechaHora: new Date()
        });
        
        await movimiento.save();
        
        origen.movimientos.push(movimiento._id);
        destino.movimientos.push(movimiento._id);
        
        await origen.save();
        await destino.save();
        
        res.json({
            msg: "Transferencia realizada con éxito",
            origen: origen.numeroCuenta,
            destino: destino.numeroCuenta,
            monto
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al realizar la transferencia"
        });
    }
};

export const getMovimientosCuenta = async (req, res) => {
    try {
        const { cid } = req.params;
        const { desde = 0 } = req.query;
        const usuario = req.usuario;
        
        const esAdmin = usuario.rol === 'ADMIN';

        const cuenta = await Cuenta.findById(cid)
            .populate({
                path: 'movimientos',
                options: { 
                    sort: { fechaCreacion: -1 },
                    skip: Number(desde)
                }
            });
        
        if (!cuenta) {
            return res.status(404).json({
                success: false,
                msg: "Cuenta no encontrada"
            });
        }
        
        const esPropietario = cuenta.usuario.toString() === usuario._id.toString();
        
        if (!esAdmin && !esPropietario) {
            return res.status(403).json({
                success: false,
                msg: "No tiene autorización para acceder a los movimientos de esta cuenta"
            });
        }
    
        res.json({
            success: true,
            movimientos: cuenta.movimientos
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener los movimientos de la cuenta"
        });
    }
};

export const realizarDeposito = async (req, res) => {
    try {
        const { cuentaDestino, monto, descripcion = "Depósito" } = req.body;
        
        const cuenta = await Cuenta.findOne({ numeroCuenta: cuentaDestino });
        if (!cuenta) {
            return res.status(404).json({
                msg: "Cuenta no encontrada"
            });
        }
        cuenta.saldo += monto;
        cuenta.ingresos += monto;
        
        const movimiento = new Movimiento({
            cuentaDestino: cuenta._id,
            monto: monto,
            tipo: 'DEPOSITO',
            descripcion: descripcion || `Depósito a cuenta ${cuenta.numeroCuenta}`,
            fechaHora: new Date()
        });
        
        await movimiento.save();
        
        cuenta.movimientos.push(movimiento._id);
        await cuenta.save();
        
        res.json({
            msg: "Depósito realizado con éxito",
            cuenta: cuenta.numeroCuenta,
            monto
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al realizar el depósito"
        });
    }
};

export const revertirDeposito = async (req, res) => {
    try {
        const { depositoId } = req.params;
        const deposito = await Movimiento.findById(depositoId);
        
        if (!deposito || deposito.tipo !== 'DEPOSITO') {
            return res.status(404).json({
                msg: "Depósito no encontrado"
            });
        }
        
        if (deposito.reversed) {
            return res.status(400).json({
                msg: "Este depósito ya fue revertido anteriormente"
            });
        }        
        const ahora = new Date();
        const fechaDeposito = new Date(deposito.fechaHora);
        const tiempoTranscurrido = (ahora - fechaDeposito) / 1000 / 60; 
        
        if (tiempoTranscurrido > 60) { 
            return res.status(400).json({
                success: false,
                msg: "No se puede revertir el depósito después de 60 minutos",
                debug: {
                    fechaActual: ahora,
                    fechaDeposito: fechaDeposito,
                    tiempoTranscurrido: tiempoTranscurrido
                }
            });
        }
        
        const cuenta = await Cuenta.findById(deposito.cuentaDestino);
        
        if (!cuenta) {
            return res.status(404).json({
                msg: "Cuenta no encontrada"
            });
        }
        
        if (cuenta.saldo < deposito.monto) {
            return res.status(400).json({
                msg: "La cuenta no tiene saldo suficiente para revertir este depósito"
            });
        }
        
        cuenta.saldo -= deposito.monto;
        cuenta.ingresos -= deposito.monto;
        
        const movimientoReversion = new Movimiento({
            cuentaDestino: cuenta._id,
            monto: deposito.monto,
            tipo: 'CANCELACION',
            descripcion: `Reversión de depósito: ${depositoId}`,
            fechaHora: new Date(),
            originalMovimiento: depositoId
        });
        
        await movimientoReversion.save();
        
        cuenta.movimientos.push(movimientoReversion._id);
        await cuenta.save();
        
        deposito.reversed = true;
        await deposito.save();
          res.json({
            success: true,
            msg: "Depósito revertido con éxito",
            cuenta: cuenta.numeroCuenta,
            monto: deposito.monto,
            fechaReversion: new Date()
        });    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al revertir el depósito",
            error: error.message
        });
    }
};

export const agregarFavorito = async (req, res) => {
    try {
        const { numeroCuenta, alias } = req.body;
        const usuarioId = req.usuario._id;
        
        const cuentaFavorita = await Cuenta.findOne({ numeroCuenta });
        if (!cuentaFavorita) {
            return res.status(404).json({
                msg: "Cuenta no encontrada"
            });
        }
        
        const cuentaUsuario = await Cuenta.findOne({ usuario: usuarioId });
        if (!cuentaUsuario) {
            return res.status(404).json({
                msg: "No tienes una cuenta asociada"
            });
        }
        
        if (cuentaFavorita.numeroCuenta === cuentaUsuario.numeroCuenta) {
            return res.status(400).json({
                msg: "No puedes agregarte a ti mismo como favorito"
            });
        }
        
        const favoritoExistente = await Favorito.findOne({
            usuario: usuarioId,
            cuentaFavorita: cuentaFavorita._id
        });
        
        if (favoritoExistente) {
            return res.status(400).json({
                msg: "Esta cuenta ya está en tus favoritos"
            });
        }
        
        const nuevoFavorito = new Favorito({
            usuario: usuarioId,
            cuentaFavorita: cuentaFavorita._id,
            alias,
            numeroCuenta: cuentaFavorita.numeroCuenta
        });
        
        await nuevoFavorito.save();
        
        res.status(201).json({
            msg: "Cuenta agregada a favoritos",
            favorito: nuevoFavorito
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al agregar favorito"
        });
    }
};

export const getFavoritos = async (req, res) => {
    try {
        const usuarioId = req.usuario._id;
        
        const favoritos = await Favorito.find({ usuario: usuarioId })
            .populate({
                path: 'cuentaFavorita',
                select: 'numeroCuenta tipo usuario',
                populate: {
                    path: 'usuario',
                    select: 'nombre email'
                }
            });
        
        res.json({
            favoritos
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener los favoritos"
        });
    }
};

export const eliminarFavorito = async (req, res) => {
    try {
        const { favoritoId } = req.params;
        const usuarioId = req.usuario._id;
        
        const favorito = await Favorito.findOne({
            _id: favoritoId,
            usuario: usuarioId
        });
        
        if (!favorito) {
            return res.status(404).json({
                msg: "Favorito no encontrado o no tienes permiso para eliminarlo"
            });
        }
        
        await Favorito.findByIdAndDelete(favoritoId);
        
        res.json({
            msg: "Favorito eliminado correctamente"
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al eliminar el favorito"
        });
    }
};

export const getCuentaPorNumero = async (req, res) => {
    try {
        const { numeroCuenta } = req.params;
        
        const cuenta = await Cuenta.findOne({ numeroCuenta })
            .populate('usuario', 'nombre email');
            
        if (!cuenta) {
            return res.status(404).json({
                msg: "Cuenta no encontrada"
            });
        }
        
        res.json({
            cuenta
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener la cuenta"
        });
    }
};

export const getCuentas = async (req, res) => {
    try {
        const usuario = req.usuario; 
        
        if (usuario.rol !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                msg: "No tiene autorización para acceder al listado completo de cuentas. Esta función está limitada a administradores."
            });
        }
        
        const { desde = 0 } = req.query;
        
        const [total, cuentas] = await Promise.all([
            Cuenta.countDocuments(),
            Cuenta.find()
                .populate('usuario', 'nombre username email')
                .skip(Number(desde))
        ]);
        
        res.json({
            success: true,
            total,
            cuentas
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener las cuentas"
        });
    }
};

export const getCuentasConMasMovimientos = async (req, res) => {
    try {
        const usuario = req.usuario; 
        
        if (usuario.rol !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                msg: "No tiene autorización para acceder a las estadísticas de cuentas. Esta función está limitada a administradores."
            });
        }
        
        const { orden = 'desc', limite = 10 } = req.query;
        
        const cuentas = await Cuenta.find()
            .populate('usuario', 'nombre username email')
            .populate('movimientos');
        
        cuentas.sort((a, b) => {
            if (orden === 'asc') {
                return a.movimientos.length - b.movimientos.length;
            } else {
                return b.movimientos.length - a.movimientos.length;
            }
        });

        const cuentasLimitadas = cuentas.slice(0, Number(limite));
        
        res.json({
            success: true,
            cuentas: cuentasLimitadas
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener las cuentas con más movimientos"
        });
    }
};

export const realizarCompra = async (req, res) => {
    try {
        const { cuentaId, productoServicioId, descripcion = "" } = req.body;
        const usuarioId = req.usuario._id;
        
        const cuenta = await Cuenta.findOne({ 
            _id: cuentaId,
            usuario: usuarioId
        });
        
        if (!cuenta) {
            return res.status(404).json({
                msg: "Cuenta no encontrada o no tienes permiso para usarla"
            });
        }
        
        const productoServicio = await ProductoServicio.findOne({
            _id: productoServicioId,
            disponible: true
        });
        
        if (!productoServicio) {
            return res.status(404).json({
                msg: "Producto o servicio no encontrado o no disponible"
            });
        }
        
        if (cuenta.saldo < productoServicio.precio) {
            return res.status(400).json({
                msg: "Saldo insuficiente para realizar esta compra"
            });
        }
        
        cuenta.saldo -= productoServicio.precio;
        cuenta.egresos += productoServicio.precio;
        

        const movimiento = new Movimiento({
            cuentaOrigen: cuenta._id,
            monto: productoServicio.precio,
            tipo: 'COMPRA',
            productoServicio: productoServicio._id,
            descripcion: descripcion || `Compra de ${productoServicio.nombre}`
        });
        
        await movimiento.save();
        

        cuenta.movimientos.push(movimiento._id);
        await cuenta.save();
          res.json({
            msg: "Compra realizada con éxito",
            cuenta: cuenta.numeroCuenta,
            producto: productoServicio.nombre,
            monto: productoServicio.precio
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al realizar la compra"
        });
    }
};

export const getCuentaByUsuario = async (req, res) => {
    try {
        const usuarioId = req.usuario._id;
        
        const cuenta = await Cuenta.findOne({ usuario: usuarioId })
            .populate('usuario', 'nombre username email')
            .populate({
                path: 'movimientos',
                options: { sort: { fechaCreacion: -1 }, limit: 5 }
            });
            
        if (!cuenta) {
            return res.status(404).json({
                msg: "No tienes una cuenta asociada"
            });
        }
        
        res.json({
            cuenta
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener la cuenta"
        });
    }
};

 