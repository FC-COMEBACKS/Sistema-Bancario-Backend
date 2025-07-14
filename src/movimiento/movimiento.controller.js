import Movimiento from "./movimiento.model.js";
import Cuenta from "../Cuenta/cuenta.model.js";
import ProductoServicio from "../ProductoServicio/productoServicio.model.js";

export const crearMovimiento = async (datosMovimiento) => {
    try {
        const movimiento = new Movimiento(datosMovimiento);
        await movimiento.save();
        return movimiento;
    } catch (error) {
        throw new Error("Error al crear el movimiento");
    }
};

export const getMovimientos = async (req, res) => {
    try {
        const { desde = 0, tipo, cuenta } = req.query;
        let filtro = {};

        if (tipo) {
            filtro.tipo = tipo;
        }

        if (req.usuario.rol === "CLIENT") {
            const cuentasUsuario = await Cuenta.find({ usuario: req.usuario._id }).select('_id');
            const cuentasIds = cuentasUsuario.map(c => c._id);

            filtro.$or = [
                { cuentaOrigen: { $in: cuentasIds } },
                { cuentaDestino: { $in: cuentasIds } }
            ];
        } else if (cuenta) {
            filtro.$or = [
                { cuentaOrigen: cuenta },
                { cuentaDestino: cuenta }
            ];
        }

        const [total, movimientos] = await Promise.all([
            Movimiento.countDocuments(filtro),
            Movimiento.find(filtro)
                .populate({
                    path: 'cuentaOrigen',
                    select: 'numeroCuenta usuario',
                    populate: {
                        path: 'usuario',
                        select: 'nombre'
                    }
                })
                .populate({
                    path: 'cuentaDestino',
                    select: 'numeroCuenta usuario',
                    populate: {
                        path: 'usuario',
                        select: 'nombre'
                    }
                })
                .populate('productoServicio', 'nombre precio')
                .sort({ fechaHora: -1 })
                .skip(Number(desde))
        ]);

        const movimientosEnriquecidos = movimientos.map(mov => {
            const movData = mov.toObject();

            return {
                ...movData,
                cuentaOrigen: mov.cuentaOrigen ? {
                    id: mov.cuentaOrigen._id,
                    numeroCuenta: mov.cuentaOrigen.numeroCuenta,
                    titular: mov.cuentaOrigen.usuario ? mov.cuentaOrigen.usuario.nombre : 'No especificado'
                } : null,
                cuentaDestino: mov.cuentaDestino ? {
                    id: mov.cuentaDestino._id,
                    numeroCuenta: mov.cuentaDestino.numeroCuenta,
                    titular: mov.cuentaDestino.usuario ? mov.cuentaDestino.usuario.nombre : 'No especificado'
                } : null
            };
        });

        res.json({
            total,
            movimientos: movimientosEnriquecidos
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener los movimientos"
        });
    }
};

export const getMovimientoById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const movimiento = await Movimiento.findById(id)
            .populate({
                path: 'cuentaOrigen',
                select: 'numeroCuenta usuario',
                populate: {
                    path: 'usuario',
                    select: 'nombre'
                }
            })
            .populate({
                path: 'cuentaDestino',
                select: 'numeroCuenta usuario',
                populate: {
                    path: 'usuario',
                    select: 'nombre'
                }
            })
            .populate('productoServicio', 'nombre precio');
        
        if (!movimiento) {
            return res.status(404).json({
                msg: "Movimiento no encontrado"
            });
        }
        
        const resultado = {
            movimiento: {
                _id: movimiento._id,
                monto: movimiento.monto,
                tipo: movimiento.tipo,
                descripcion: movimiento.descripcion,
                fechaHora: movimiento.fechaHora,
                reversed: movimiento.reversed
            },
            cuentaOrigen: movimiento.cuentaOrigen ? {
                id: movimiento.cuentaOrigen._id,
                numeroCuenta: movimiento.cuentaOrigen.numeroCuenta,
                titular: movimiento.cuentaOrigen.usuario ? movimiento.cuentaOrigen.usuario.nombre : 'No especificado'
            } : null,
            cuentaDestino: movimiento.cuentaDestino ? {
                id: movimiento.cuentaDestino._id,
                numeroCuenta: movimiento.cuentaDestino.numeroCuenta,
                titular: movimiento.cuentaDestino.usuario ? movimiento.cuentaDestino.usuario.nombre : 'No especificado'
            } : null
        };
        
        if (movimiento.productoServicio) {
            resultado.productoServicio = movimiento.productoServicio;
        }
        
        res.json(resultado);
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener el movimiento"
        });
    }
};

export const realizarTransferencia = async (req, res) => {
    try {
        const { cuentaOrigen, cuentaDestino, monto, descripcion = "Transferencia" } = req.body;
        const usuario = req.usuario;
        const montoNumber = Number(monto);

        const cuentaOrigenObj = await Cuenta.findOne({ numeroCuenta: cuentaOrigen }).populate('usuario', 'nombre');
        if (!cuentaOrigenObj) {
            return res.status(404).json({
                success: false,
                msg: "Cuenta de origen no encontrada"
            });
        }

        const usuarioOrigenId = cuentaOrigenObj.usuario._id ? cuentaOrigenObj.usuario._id.toString() : cuentaOrigenObj.usuario.toString();
        if (usuarioOrigenId !== usuario._id.toString() && usuario.rol !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                msg: "No tiene autorización para realizar transferencias desde esta cuenta"
            });
        }

        const cuentaDestinoObj = await Cuenta.findOne({ numeroCuenta: cuentaDestino }).populate('usuario', 'nombre');
        if (!cuentaDestinoObj) {
            return res.status(404).json({
                msg: "Cuenta de destino no encontrada"
            });
        }

        if (cuentaOrigenObj.numeroCuenta === cuentaDestinoObj.numeroCuenta) {
            return res.status(400).json({
                msg: "No se puede transferir a la misma cuenta"
            });
        }

        if (cuentaOrigenObj.saldo < montoNumber) {
            return res.status(400).json({
                msg: "Saldo insuficiente para realizar esta transferencia"
            });
        }

        if (montoNumber > 2000) {
            return res.status(400).json({
                msg: "No se puede transferir más de Q2000 por transferencia"
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const transferenciasHoy = await Movimiento.find({
            cuentaOrigen: cuentaOrigenObj._id,
            tipo: "TRANSFERENCIA",
            fechaHora: { $gte: today, $lt: tomorrow },
            reversed: false
        });

        let totalTransferidoHoy = 0;
        transferenciasHoy.forEach(t => {
            totalTransferidoHoy += Number(t.monto) || 0;
        });

        if (totalTransferidoHoy + montoNumber > 10000) {
            return res.status(400).json({
                msg: "Has superado el límite diario de Q10,000 en transferencias"
            });
        }

        cuentaOrigenObj.saldo -= montoNumber;
        cuentaOrigenObj.egresos += montoNumber;
        cuentaDestinoObj.saldo += montoNumber;
        cuentaDestinoObj.ingresos += montoNumber;

        const movimiento = await crearMovimiento({
            cuentaOrigen: cuentaOrigenObj._id,
            cuentaDestino: cuentaDestinoObj._id,
            monto: montoNumber,
            tipo: "TRANSFERENCIA",
            fechaHora: new Date(),
            descripcion
        });

        cuentaOrigenObj.movimientos.push(movimiento._id);
        cuentaDestinoObj.movimientos.push(movimiento._id);

        await Promise.all([
            cuentaOrigenObj.save(),
            cuentaDestinoObj.save()
        ]);

        const movimientoSimplificado = {
            cuentaOrigen: movimiento.cuentaOrigen,
            cuentaDestino: movimiento.cuentaDestino,
            monto: movimiento.monto,
            tipo: movimiento.tipo,
            descripcion: movimiento.descripcion
        };

        const resultado = {
            msg: "Transferencia realizada con éxito",
            movimiento: movimientoSimplificado,
            cuentaOrigen: {
                id: cuentaOrigenObj._id,
                numeroCuenta: cuentaOrigenObj.numeroCuenta,
                titular: cuentaOrigenObj.usuario ? cuentaOrigenObj.usuario.nombre : 'No especificado'
            },
            cuentaDestino: {
                id: cuentaDestinoObj._id,
                numeroCuenta: cuentaDestinoObj.numeroCuenta,
                titular: cuentaDestinoObj.usuario ? cuentaDestinoObj.usuario.nombre : 'No especificado'
            },
            saldoActual: cuentaOrigenObj.saldo
        };

        res.json(resultado);
        
        res.json(resultado);
    } catch (error) {
        res.status(500).json({
            msg: "Error al realizar la transferencia"
        });
    }
};

export const realizarCredito = async (req, res) => {
    try {
        const { cuentaDestino, monto, descripcion = "Crédito" } = req.body;
        const montoNumber = Number(monto);
        
        if (req.usuario.rol !== 'ADMIN') {
            return res.status(403).json({
                msg: "No tiene autorización para realizar créditos"
            });
        }

        const cuentaDestinoObj = await Cuenta.findOne({ numeroCuenta: cuentaDestino }).populate('usuario', 'nombre');
        if (!cuentaDestinoObj) {
            return res.status(404).json({
                msg: "Cuenta de destino no encontrada"
            });
        }

        cuentaDestinoObj.saldo += montoNumber;
        cuentaDestinoObj.ingresos += montoNumber;

        const movimiento = await crearMovimiento({
            cuentaDestino: cuentaDestinoObj._id,
            monto: montoNumber,
            tipo: "CREDITO",
            fechaHora: new Date(),
            descripcion: `${descripcion} (realizado por: ${req.usuario.nombre})`
        });

        cuentaDestinoObj.movimientos.push(movimiento._id);
        await cuentaDestinoObj.save();

        const movimientoSimplificado = movimiento.toObject();

        res.json({
            msg: "Crédito realizado con éxito",
            movimiento: movimientoSimplificado,
            cuentaDestino: {
                id: cuentaDestinoObj._id,
                numeroCuenta: cuentaDestinoObj.numeroCuenta,
                titular: cuentaDestinoObj.usuario ? cuentaDestinoObj.usuario.nombre : 'No especificado'
            },
            saldoActual: cuentaDestinoObj.saldo
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al realizar el crédito"
        });
    }
};

export const realizarDeposito = async (req, res) => {
    try {
        const { cuentaDestino, monto, descripcion = "Depósito" } = req.body;
        const montoNumber = Number(monto);
        
        const cuentaDestinoObj = await Cuenta.findOne({ numeroCuenta: cuentaDestino }).populate('usuario', 'nombre');
        if (!cuentaDestinoObj) {
            return res.status(404).json({
                msg: "Cuenta de destino no encontrada"
            });
        }
        
        cuentaDestinoObj.saldo += montoNumber;
        cuentaDestinoObj.ingresos += montoNumber;
        
        const movimiento = await crearMovimiento({
            cuentaDestino: cuentaDestinoObj._id,
            monto: montoNumber,
            tipo: "DEPOSITO",
            fechaHora: new Date(),
            descripcion: `${descripcion} (realizado por: ${req.usuario.nombre})`
        });
        
        cuentaDestinoObj.movimientos.push(movimiento._id);
        await cuentaDestinoObj.save();
        
        const movimientoSimplificado = movimiento.toObject();
        
        res.json({
            msg: "Depósito realizado con éxito",
            movimiento: movimientoSimplificado,
            cuentaDestino: {
                id: cuentaDestinoObj._id,
                numeroCuenta: cuentaDestinoObj.numeroCuenta,
                titular: cuentaDestinoObj.usuario ? cuentaDestinoObj.usuario.nombre : 'No especificado'
            },
            saldoActual: cuentaDestinoObj.saldo
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al realizar el depósito"
        });
    }
};


export const revertirDeposito = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.usuario._id; 
        
        const deposito = await Movimiento.findById(id);
        
        if (!deposito) {
            return res.status(404).json({
                msg: "Depósito no encontrado"
            });
        }
        
        if (deposito.tipo !== "DEPOSITO") {
            return res.status(400).json({
                msg: "Solo se pueden revertir depósitos"
            });
        }
        
        if (deposito.reversed) {
            return res.status(400).json({
                msg: "Este depósito ya fue revertido anteriormente"
            });
        }
        
        const ahora = new Date();
        const tiempoTranscurrido = ahora - deposito.fechaHora;
        
        if (tiempoTranscurrido > 60000) {
            return res.status(400).json({
                msg: "No se puede revertir el depósito después de 1 minuto"
            });
        }
        
        const cuenta = await Cuenta.findById(deposito.cuentaDestino).populate('usuario', 'nombre');
        
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
        
        deposito.reversed = true;
        
        const movimientoReversion = await crearMovimiento({
            cuentaDestino: cuenta._id,
            monto: deposito.monto,
            tipo: "CANCELACION",
            fechaHora: new Date(),
            descripcion: `Reversión del depósito: ${id}`,
            originalMovimiento: id
        });
        
        cuenta.movimientos.push(movimientoReversion._id);
        
        await Promise.all([
            cuenta.save(),
            deposito.save()
        ]);
        
        const movimientoReversionSimplificado = movimientoReversion.toObject();
        
        res.json({
            msg: "Depósito revertido con éxito",
            movimiento: movimientoReversionSimplificado,
            cuentaDestino: {
                id: cuenta._id,
                numeroCuenta: cuenta.numeroCuenta,
                titular: cuenta.usuario ? cuenta.usuario.nombre : 'No especificado'
            },
            depositoOriginal: {
                id: deposito._id,
                monto: deposito.monto,
                fecha: deposito.fechaHora
            },
            saldoActual: cuenta.saldo
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al revertir el depósito"
        });
    }
};

export const comprarProducto = async (req, res) => {
    try {
        const { numeroCuenta, productoId, descripcion = "Compra de producto/servicio" } = req.body;
        
        const cuenta = await Cuenta.findOne({ numeroCuenta }).populate('usuario', 'nombre');
        const producto = await ProductoServicio.findById(productoId);
        
        if (!cuenta) {
            return res.status(404).json({
                msg: "Cuenta no encontrada"
            });
        }
        
        if (!producto) {
            return res.status(404).json({
                msg: "Producto o servicio no encontrado"
            });
        }
        
        if (!producto.disponible) {
            return res.status(400).json({
                msg: "El producto o servicio no está disponible"
            });
        }
        
        if (cuenta.saldo < producto.precio) {
            return res.status(400).json({
                msg: "Saldo insuficiente para realizar esta compra"
            });
        }
        
        cuenta.saldo -= producto.precio;
        cuenta.egresos += producto.precio;
        
        const movimiento = await crearMovimiento({
            cuentaOrigen: cuenta._id,
            monto: producto.precio,
            tipo: "COMPRA",
            fechaHora: new Date(),
            descripcion: `${descripcion}: ${producto.nombre}`,
            productoServicio: productoId
        });
        
        cuenta.movimientos.push(movimiento._id);
        await cuenta.save();
        
        const movimientoSimplificado = movimiento.toObject();
        
        res.json({
            msg: "Compra realizada con éxito",
            movimiento: movimientoSimplificado,
            cuentaOrigen: {
                id: cuenta._id,
                numeroCuenta: cuenta.numeroCuenta,
                titular: cuenta.usuario ? cuenta.usuario.nombre : 'No especificado'
            },
            producto: producto.nombre,
            precio: producto.precio,
            saldoActual: cuenta.saldo
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al realizar la compra"
        });
    }
};

export const getHistorialCuenta = async (req, res) => {
    try {
        const { numeroCuenta } = req.params;
        const { desde = 0, tipo } = req.query;
        const usuario = req.usuario; 
        
        const esAdmin = usuario.rol === 'ADMIN';
    
        const cuenta = await Cuenta.findOne({ numeroCuenta });
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
                msg: "No tiene autorización para acceder al historial de esta cuenta"
            });
        }
        
        let filtro = {
            $or: [
                { cuentaOrigen: cuenta._id },
                { cuentaDestino: cuenta._id }
            ]
        };
        
        if (tipo) {
            filtro.tipo = tipo;
        }
        
        const [total, movimientos] = await Promise.all([
            Movimiento.countDocuments(filtro),
            Movimiento.find(filtro)
                .populate({
                    path: 'cuentaOrigen',
                    select: 'numeroCuenta usuario',
                    populate: {
                        path: 'usuario',
                        select: 'nombre'
                    }
                })
                .populate({
                    path: 'cuentaDestino',
                    select: 'numeroCuenta usuario',
                    populate: {
                        path: 'usuario',
                        select: 'nombre'
                    }
                })
                .populate('productoServicio', 'nombre precio')
                .sort({ fechaHora: -1 })
                .skip(Number(desde))
        ]);

        
        const movimientosEnriquecidos = movimientos.map(mov => {
            const movData = mov.toObject();
            
        
            return {
                ...movData,
                cuentaOrigenDetalle: mov.cuentaOrigen ? {
                    id: mov.cuentaOrigen._id,
                    numeroCuenta: mov.cuentaOrigen.numeroCuenta,
                    titular: mov.cuentaOrigen.usuario ? mov.cuentaOrigen.usuario.nombre : 'No especificado'
                } : null,
                cuentaDestinoDetalle: mov.cuentaDestino ? {
                    id: mov.cuentaDestino._id,
                    numeroCuenta: mov.cuentaDestino.numeroCuenta,
                    titular: mov.cuentaDestino.usuario ? mov.cuentaDestino.usuario.nombre : 'No especificado'
                } : null
            };
        });
        
        const cuentaData = cuenta.toObject();
        
        const cuentaUsuario = await Cuenta.findById(cuenta._id).populate('usuario', 'nombre username email');
        
        if (cuentaUsuario && cuentaUsuario.usuario) {
            cuentaData.usuario = cuentaUsuario.usuario;
        }
        
        res.json({
            success: true,
            total,
            cuenta: {
                ...cuentaData,
                cid: cuenta._id
            },
            movimientos: movimientosEnriquecidos
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener el historial de la cuenta"
        });
    }
};

