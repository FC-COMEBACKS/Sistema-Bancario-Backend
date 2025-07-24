import axios from "axios";
import Divisa from "./divisa.model.js";
import Cuenta from "../cuenta/cuenta.model.js";

export const actualizarTasasDeCambio = async () => {
    try {
        const apiUrl = process.env.EXCHANGE_RATE_API_URL;
        const apiKey = process.env.EXCHANGE_RATE_API_KEY;
        
        if (!apiUrl || !apiKey) {
            return false;
        }
        
        const fullUrl = `${apiUrl}${apiKey}/latest/GTQ`;
        
        const response = await axios.get(fullUrl);
        const rates = response.data.conversion_rates;
        
        for (const [codigo, tasa] of Object.entries(rates)) {
            if (codigo !== "GTQ") { 
                const tasaEnQuetzales = 1 / tasa;
                
                await Divisa.findOneAndUpdate(
                    { codigo },
                    { 
                        codigo,
                        nombre: obtenerNombreDivisa(codigo),
                        tasaEnQuetzales,
                        fechaActualizacion: new Date()
                    },
                    { upsert: true, new: true }
                );
            }
        }
        
        return true;
    } catch (error) {
        return false;
    }
};

const obtenerNombreDivisa = (codigo) => {
    const divisas = {
        USD: "Dólar Estadounidense",
        EUR: "Euro",
        MXN: "Peso Mexicano",
        GBP: "Libra Esterlina",
        JPY: "Yen Japonés",
        CAD: "Dólar Canadiense",
    
    };
    return divisas[codigo] || codigo;
};

export const getDivisas = async (req, res) => {
    try {
        const { filtro } = req.query;
        let query = { activo: true };
        
        if (filtro) {
            query = {
                activo: true,
                $or: [
                    { codigo: { $regex: filtro, $options: 'i' } },
                    { nombre: { $regex: filtro, $options: 'i' } }
                ]
            };
        }
        
        const divisas = await Divisa.find(query);
        
        res.json({
            success: true,
            divisas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener las divisas"
        });
    }
};

export const convertirMonto = async (req, res) => {
    try {
        const { monto, divisaOrigen, divisaDestino } = req.body;
        
        if (!monto || !divisaOrigen || !divisaDestino) {
            return res.status(400).json({
                success: false,
                msg: "Falta información para realizar la conversión"
            });
        }
        
        if (divisaOrigen === "GTQ" && divisaDestino !== "GTQ") {
            const divisaTarget = await Divisa.findOne({ codigo: divisaDestino, activo: true });
            if (!divisaTarget) {
                return res.status(404).json({
                    success: false,
                    msg: `Divisa ${divisaDestino} no encontrada o no disponible`
                });
            }
            
            const montoConvertido = monto / divisaTarget.tasaEnQuetzales;
            
            return res.json({
                success: true,
                monto,
                montoConvertido,
                divisaOrigen,
                divisaDestino,
                tasa: 1 / divisaTarget.tasaEnQuetzales
            });
        } 
        
        if (divisaOrigen !== "GTQ" && divisaDestino === "GTQ") {
            const divisaSource = await Divisa.findOne({ codigo: divisaOrigen, activo: true });
            if (!divisaSource) {
                return res.status(404).json({
                    success: false,
                    msg: `Divisa ${divisaOrigen} no encontrada o no disponible`
                });
            }
            
            const montoConvertido = monto * divisaSource.tasaEnQuetzales;
            
            return res.json({
                success: true,
                monto,
                montoConvertido,
                divisaOrigen,
                divisaDestino,
                tasa: divisaSource.tasaEnQuetzales
            });
        }
        
        const divisaSource = await Divisa.findOne({ codigo: divisaOrigen, activo: true });
        const divisaTarget = await Divisa.findOne({ codigo: divisaDestino, activo: true });
        
        if (!divisaSource || !divisaTarget) {
            return res.status(404).json({
                success: false,
                msg: "Una o ambas divisas no fueron encontradas o no están disponibles"
            });
        }
        
        const montoEnQuetzales = monto * divisaSource.tasaEnQuetzales;
        const montoConvertido = montoEnQuetzales / divisaTarget.tasaEnQuetzales;
        
        res.json({
            success: true,
            monto,
            montoConvertido,
            divisaOrigen,
            divisaDestino,
            tasa: divisaSource.tasaEnQuetzales / divisaTarget.tasaEnQuetzales
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al convertir el monto"
        });
    }
};

export const convertirSaldoCuenta = async (req, res) => {
    try {
        const { cuentaId, divisaDestino } = req.body;
        const usuarioId = req.usuario._id;
        
        const cuenta = await Cuenta.findOne({ 
            _id: cuentaId,
            usuario: usuarioId
        });
        
        if (!cuenta) {
            return res.status(404).json({
                success: false,
                msg: "Cuenta no encontrada o no tienes permisos para acceder a ella"
            });
        }
        
        if (divisaDestino === "GTQ") {
            return res.json({
                success: true,
                saldoOriginal: cuenta.saldo,
                saldoConvertido: cuenta.saldo,
                divisaOrigen: "GTQ",
                divisaDestino: "GTQ",
                tasa: 1
            });
        }
        
        const divisa = await Divisa.findOne({ codigo: divisaDestino, activo: true });
        
        if (!divisa) {
            return res.status(404).json({
                success: false,
                msg: `Divisa ${divisaDestino} no encontrada o no disponible`
            });
        }
        
        const saldoConvertido = cuenta.saldo / divisa.tasaEnQuetzales;
        
        res.json({
            success: true,
            saldoOriginal: cuenta.saldo,
            saldoConvertido,
            divisaOrigen: "GTQ",
            divisaDestino,
            tasa: 1 / divisa.tasaEnQuetzales
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al convertir el saldo de la cuenta"
        });
    }
};

export const actualizarTasas = async (req, res) => {
    try {
        if (req.usuario.rol !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                msg: "Solo los administradores pueden actualizar las tasas de cambio"
            });
        }
        
        const { tasas } = req.body;
        
        if (!tasas || !Array.isArray(tasas) || tasas.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "Se requiere un array de tasas para actualizar"
            });
        }
      
        const actualizaciones = [];
        for (const tasa of tasas) {
            if (!tasa.codigo || !tasa.tasaEnQuetzales) {
                continue; 
            }
            
            const divisa = await Divisa.findOneAndUpdate(
                { codigo: tasa.codigo },
                { 
                    tasaEnQuetzales: tasa.tasaEnQuetzales,
                    fechaActualizacion: new Date()
                },
                { new: true }
            );
            
            if (divisa) {
                actualizaciones.push(divisa);
            }
        }
        
        if (actualizaciones.length > 0) {
            res.json({
                success: true,
                msg: "Tasas de cambio actualizadas correctamente",
                divisasActualizadas: actualizaciones.length
            });
        } else {
            res.status(404).json({
                success: false,
                msg: "No se encontraron divisas para actualizar"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al actualizar las tasas de cambio"
        });
    }
};

export const agregarDivisa = async (req, res) => {
    try {
        if (req.usuario.rol !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                msg: "Solo los administradores pueden agregar o modificar divisas"
            });
        }
        
        const { codigo, nombre, tasaEnQuetzales } = req.body;
        
        const divisa = await Divisa.findOneAndUpdate(
            { codigo },
            { codigo, nombre, tasaEnQuetzales, fechaActualizacion: new Date() },
            { upsert: true, new: true }
        );
        
        res.json({
            success: true,
            msg: "Divisa agregada o actualizada correctamente",
            divisa
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al agregar o actualizar la divisa"
        });
    }
};

export const programarActualizacionDivisas = () => {
    actualizarTasasDeCambio();

    setInterval(actualizarTasasDeCambio, 24 * 60 * 60 * 1000);
};

export const restaurarTasasOficiales = async (req, res) => {
    try {
        if (req.usuario.rol !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                msg: "Solo los administradores pueden restaurar las tasas oficiales"
            });
        }
        
        const resultado = await actualizarTasasDeCambio();
        
        if (resultado) {
            res.json({
                success: true,
                msg: "Tasas de cambio restauradas a valores oficiales correctamente"
            });
        } else {
            res.status(500).json({
                success: false,
                msg: "Error al restaurar las tasas de cambio oficiales"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al restaurar las tasas de cambio oficiales"
        });
    }
};
