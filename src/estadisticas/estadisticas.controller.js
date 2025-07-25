import Usuario from '../user/user.model.js';
import Cuenta from '../cuenta/cuenta.model.js';      
import Movimiento from '../movimiento/movimiento.model.js'; 
import ProductoServicio from '../productoServicio/productoServicio.model.js'; 

export const getEstadisticasGenerales = async (req, res) => {
    try {
        const { usuario } = req;
        
        if (usuario.rol !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: "No tiene autorización para acceder a las estadísticas"
            });
        }

        const [totalUsuarios, totalCuentas, totalMovimientos, totalProductos] = await Promise.all([
            Usuario.countDocuments({ estado: "ACTIVO" }),
            Cuenta.countDocuments(),
            Movimiento.countDocuments(),
            ProductoServicio.countDocuments({ disponible: true })
        ]);

        const usuariosPorRol = await Usuario.aggregate([
            { $match: { estado: "ACTIVO" } },
            { $group: { _id: "$rol", total: { $sum: 1 } } }
        ]);

        const cuentasPorTipo = await Cuenta.aggregate([
            { $group: { _id: "$tipo", total: { $sum: 1 } } }
        ]);

        const montoTotal = await Cuenta.aggregate([
            { $group: { _id: null, total: { $sum: "$saldo" } } }
        ]);

        return res.status(200).json({
            success: true,
            estadisticas: {
                usuarios: {
                    total: totalUsuarios,
                    porRol: usuariosPorRol
                },
                cuentas: {
                    total: totalCuentas,
                    porTipo: cuentasPorTipo,
                    montoTotal: montoTotal.length > 0 ? montoTotal[0].total : 0
                },
                movimientos: {
                    total: totalMovimientos
                },
                productos: {
                    total: totalProductos
                }
            },
            message: "Estadísticas generales obtenidas correctamente"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener estadísticas generales",
            error: err.message
        });
    }
};

export const getMovimientosRecientes = async (req, res) => {
    try {
        const { usuario } = req;
        const { limit = 10 } = req.query;

        let filtro = { reversed: false };

        if (usuario.rol === 'CLIENT') {
            // Buscar las cuentas del usuario
            const cuentasUsuario = await Cuenta.find({ usuario: usuario._id }).select('_id');
            const cuentasIds = cuentasUsuario.map(c => c._id);

            filtro.$or = [
                { cuentaOrigen: { $in: cuentasIds } },
                { cuentaDestino: { $in: cuentasIds } }
            ];
        }

        const movimientosRecientes = await Movimiento.find(filtro)
            .sort({ fechaHora: -1 })
            .limit(parseInt(limit))
            .populate('cuentaOrigen', 'numeroCuenta')
            .populate('cuentaDestino', 'numeroCuenta')
            .populate('productoServicio', 'nombre');

        return res.status(200).json({
            success: true,
            movimientos: movimientosRecientes,
            message: "Movimientos recientes obtenidos correctamente"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener movimientos recientes",
            error: err.message
        });
    }
};

export const getEstadisticasMovimientos = async (req, res) => {
    try {
        const { usuario } = req;
        if (usuario.rol !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: "No tiene autorización para acceder a las estadísticas"
            });
        }
        
        const { periodo = 'mensual' } = req.query;
        
        let groupStage;
        const currentDate = new Date();
        let startDate;

        switch(periodo) {
            case 'semanal':
                startDate = new Date();
                startDate.setDate(currentDate.getDate() - 7);
                groupStage = {
                    $group: {
                        _id: { 
                            $dateToString: { 
                                format: "%Y-%m-%d", 
                                date: "$fechaHora" 
                            } 
                        },
                        total: { $sum: 1 },
                        montoTotal: { $sum: "$monto" }
                    }
                };
                break;
            case 'mensual':
                startDate = new Date();
                startDate.setMonth(currentDate.getMonth() - 1);
                groupStage = {
                    $group: {
                        _id: { 
                            $dateToString: { 
                                format: "%Y-%m-%d", 
                                date: "$fechaHora" 
                            } 
                        },
                        total: { $sum: 1 },
                        montoTotal: { $sum: "$monto" }
                    }
                };
                break;
            case 'anual':
                startDate = new Date();
                startDate.setFullYear(currentDate.getFullYear() - 1);
                groupStage = {
                    $group: {
                        _id: { 
                            $dateToString: { 
                                format: "%Y-%m", 
                                date: "$fechaHora" 
                            } 
                        },
                        total: { $sum: 1 },
                        montoTotal: { $sum: "$monto" }
                    }
                };
                break;
            default:
                startDate = new Date();
                startDate.setMonth(currentDate.getMonth() - 1);
                groupStage = {
                    $group: {
                        _id: { 
                            $dateToString: { 
                                format: "%Y-%m-%d", 
                                date: "$fechaHora" 
                            } 
                        },
                        total: { $sum: 1 },
                        montoTotal: { $sum: "$monto" }
                    }
                };
        }

        const matchStage = {
            $match: {
                fechaHora: { $gte: startDate },
                reversed: false
            }
        };

        const estadisticas = await Movimiento.aggregate([
            matchStage,
            groupStage,
            { $sort: { _id: 1 } }
        ]);

        const estadisticasPorTipo = await Movimiento.aggregate([
            matchStage,
            {
                $group: {
                    _id: "$tipo",
                    total: { $sum: 1 },
                    montoTotal: { $sum: "$monto" }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            estadisticas: {
                porFecha: estadisticas,
                porTipo: estadisticasPorTipo
            },
            periodo,
            message: "Estadísticas de movimientos obtenidas correctamente"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener estadísticas de movimientos",
            error: err.message
        });
    }
};

export const getEstadisticasUsuarios = async (req, res) => {
    try {
        const { usuario } = req;
        if (usuario.rol !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: "No tiene autorización para acceder a las estadísticas"
            });
        }

        const usuariosPorMes = await Usuario.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$fechaRegistro" },
                        month: { $month: "$fechaRegistro" }
                    },
                    total: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const estadoUsuarios = await Usuario.aggregate([
            {
                $group: {
                    _id: "$estado",
                    total: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            estadisticas: {
                porMes: usuariosPorMes,
                porEstado: estadoUsuarios
            },
            message: "Estadísticas de usuarios obtenidas correctamente"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener estadísticas de usuarios",
            error: err.message
        });
    }
};

export const getEstadisticasProductos = async (req, res) => {
    try {

        const { usuario } = req;
        if (usuario.rol !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: "No tiene autorización para acceder a las estadísticas"
            });
        }

        const movimientosProductos = await Movimiento.aggregate([
            { 
                $match: { 
                    tipo: "COMPRA",
                    reversed: false,
                    productoServicio: { $ne: null }
                } 
            },
            {
                $group: {
                    _id: "$productoServicio",
                    totalCompras: { $sum: 1 },
                    montoTotal: { $sum: "$monto" }
                }
            },
            { $sort: { totalCompras: -1 } },
            { $limit: 5 }
        ]);

        const productoIds = movimientosProductos.map(m => m._id);
        const productosPopulares = await ProductoServicio.find({ 
            _id: { $in: productoIds },
            disponible: true
        });

        const productoConEstadisticas = productosPopulares.map(p => {
            const estadistica = movimientosProductos.find(m => m._id.toString() === p._id.toString());
            return {
                ...p.toJSON(),
                totalCompras: estadistica ? estadistica.totalCompras : 0,
                montoTotal: estadistica ? estadistica.montoTotal : 0
            };
        });

        return res.status(200).json({
            success: true,
            estadisticas: {
                productosPopulares: productoConEstadisticas
            },
            message: "Estadísticas de productos obtenidas correctamente"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener estadísticas de productos",
            error: err.message
        });
    }
};

export const getCuentasConMasMovimientos = async (req, res) => {
    try {
        const usuario = req.usuario; 
        
        if (usuario.rol !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: "No tiene autorización para acceder a las estadísticas de cuentas. Esta función está limitada a administradores."
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
        
        return res.status(200).json({
            success: true,
            cuentas: cuentasLimitadas,
            message: "Estadísticas de cuentas con más movimientos obtenidas correctamente"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener las estadísticas de cuentas",
            error: error.message
        });
    }
};