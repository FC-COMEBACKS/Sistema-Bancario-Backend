import User from "../user/user.model.js";
import Cuenta from "../cuenta/cuenta.model.js";
import Movimiento from "../movimiento/movimiento.model.js";

export const emailExists = async (email = "") => {
    const existe = await User.findOne({email})
    if(existe){
        throw new Error(`The email ${email} is already registered`)
    }
}

export const userExists = async (uid) => {
    if (!uid) {
        throw new Error("User ID is required");
    }
    const existe = await User.findById(uid);
    if (!existe) {
        throw new Error("The user does not exist");
    }
}

export const isClient = async (uid) =>{
    if (!uid) {
        throw new Error("User ID is required");
    }
    const existe = await User.findById(uid);
    if(!existe){
        throw new Error("The client does not exist");
    }
    if(existe.rol !== "CLIENT" && existe.rol !== "ADMIN"){
        throw new Error("User is not a client");
    }
}

export const dpiExists = async (dpi = "") => {
    const existe = await User.findOne({ dpi });
    if (existe) {
        throw new Error(`El DPI ${dpi} ya está registrado`);
    }
}

export const usernameExists = async (username = "") => {
    const existe = await User.findOne({ username });
    if (existe) {
        throw new Error(`The username ${username} is already registered`);
    }
}

export const cuentaExists = async (cid = " ") => {
    const existe = await Cuenta.findById(cid);
    if (!existe) {
        throw new Error("La cuenta no existe");
    }
}

export const cuentaExistsByNumeroCuenta = async (numeroCuenta = "") => {
    const existe = await Cuenta.findOne({ numeroCuenta });
    if (!existe) {
        throw new Error(`La cuenta número ${numeroCuenta} no existe`);
    }
    return existe;
}

export const numeroCuentaExists = async (numeroCuenta = "") => {
    const existe = await Cuenta.findOne({ numeroCuenta });
    if (existe) {
        throw new Error(`El número de cuenta ${numeroCuenta} ya está registrado`);
    }
}

export const validateSaldoSuficiente = async (saldo = 0, monto = 0) => {
    if (saldo < monto) {
        throw new Error("Saldo insuficiente para realizar esta operación");
    }
}

export const validateMontoTransferencia = async (monto = 0) => {
    if (monto <= 0) {
        throw new Error("El monto debe ser mayor a 0");
    }
    if (monto > 2000) {
        throw new Error("No puede transferir más de Q2000 por transacción");
    }
}

export const usuarioTieneCuenta = async (uid = " ") => {
    const existe = await Cuenta.findOne({ usuario: uid });
    if (existe) {
        throw new Error(`El usuario ya tiene una cuenta y solo puede tener una`);
    }
    return true;
}

export const validateLimiteTransferenciaDiaria = async (uid = " ", monto = 0) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const cuentaUsuario = await Cuenta.findOne({ usuario: uid });
      if (!cuentaUsuario) {
        throw new Error("El usuario no tiene cuenta");
    }
    
    const transferenciasHoy = await Movimiento.find({
        cuentaOrigen: cuentaUsuario._id,
        tipo: 'TRANSFERENCIA',
        fechaHora: { $gte: today, $lt: tomorrow }
    });
    
    let totalTransferidoHoy = 0;
    transferenciasHoy.forEach(t => {
        totalTransferidoHoy += t.monto;
    });
    
    if (totalTransferidoHoy + monto > 10000) {
        throw new Error("Ha alcanzado el límite de transferencia diario de Q10,000");
    }
}