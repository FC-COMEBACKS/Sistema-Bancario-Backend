import Cuenta from "./cuenta.model.js";

const generarNumeroCuenta = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return timestamp.slice(-6) + random;
};

export const crearCuenta = async (req, res) => {
    try {
        const { usuario, tipo, activa = true } = req.body;
        
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
            tipo,
            activa
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
        const { tipo, activa } = req.body;
        
        const updateData = {};
        if (tipo !== undefined) updateData.tipo = tipo;
        if (activa !== undefined) updateData.activa = activa;
        
        const cuentaActualizada = await Cuenta.findByIdAndUpdate(
            cid,
            updateData,
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

export const getCuentaById = async (req, res) => {
    try {
        const { cid } = req.params;
        const usuario = req.usuario;
        
        const esAdmin = usuario.rol === 'ADMIN';
        
        const cuenta = await Cuenta.findById(cid)
            .populate('usuario', 'nombre username email');
            
        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: "Cuenta no encontrada"
            });
        }
        
        const esPropietario = cuenta.usuario._id.toString() === usuario._id.toString();
        
        if (!esAdmin && !esPropietario) {
            return res.status(403).json({
                success: false,
                message: "No tiene autorización para acceder a la información de esta cuenta"
            });
        }
        
        return res.status(200).json({
            success: true,
            cuenta
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener la cuenta",
            error: err.message
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
                message: "Cuenta no encontrada"
            });
        }
        
        const esPropietario = cuenta.usuario._id.toString() === usuario._id.toString();
        
        if (!esAdmin && !esPropietario) {
            return res.status(403).json({
                success: false,
                message: "No tiene autorización para acceder a los detalles de esta cuenta"
            });
        }
        
        res.json({
            success: true,
            cuenta
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los detalles de la cuenta",
            error: error.message
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

export const getCuentaByUsuario = async (req, res) => {
    try {
        const { uid } = req.params;
        
        console.log("Buscando cuenta para usuario:", uid);
        
        const cuenta = await Cuenta.findOne({ usuario: uid })
            .populate('usuario', 'nombre username email')
            .populate({
                path: 'movimientos',
                options: { sort: { fechaCreacion: -1 }, limit: 5 }
            });
            
        console.log("Cuenta encontrada:", cuenta);
            
        if (!cuenta) {
            return res.status(404).json({
                msg: "No tienes una cuenta asociada"
            });
        }
        
        res.json({
            cuenta
        });
    } catch (error) {
        console.error("Error en getCuentaByUsuario:", error);
        res.status(500).json({
            msg: "Error al obtener la cuenta",
            error: error.message
        });
    }
};

export const eliminarCuenta = async (req, res) => {
    try {
        const { cid } = req.params;
        const usuario = req.usuario;
        if (usuario.rol !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                msg: "No tiene autorización para eliminar cuentas. Solo el administrador puede hacerlo."
            });
        }
        const cuenta = await Cuenta.findByIdAndDelete(cid);
        if (!cuenta) {
            return res.status(404).json({
                success: false,
                msg: "Cuenta no encontrada"
            });
        }
        res.json({
            success: true,
            msg: "Cuenta eliminada correctamente",
            cuenta
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al eliminar la cuenta",
            error: error.message
        });
    }
};