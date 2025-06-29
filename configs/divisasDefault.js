import Divisa from "../src/divisas/divisa.model.js";

export const inicializarDivisas = async () => {
    try {
        const divisasIniciales = [
            {
                codigo: "USD",
                nombre: "Dólar Estadounidense",
                tasaEnQuetzales: 7.8, 
                activo: true
            },
            {
                codigo: "EUR",
                nombre: "Euro",
                tasaEnQuetzales: 8.5, 
                activo: true
            },
            {
                codigo: "MXN",
                nombre: "Peso Mexicano",
                tasaEnQuetzales: 0.45, 
                activo: true
            },
            {
                codigo: "GBP",
                nombre: "Libra Esterlina",
                tasaEnQuetzales: 10.1, 
                activo: true
            }
        ];

        const count = await Divisa.countDocuments();
        
        if (count === 0) {
            await Divisa.insertMany(divisasIniciales);
            console.log("Base de datos inicializada con divisas predeterminadas");
        } else {
            console.log("Ya existen divisas en la base de datos");
        }
    } catch (error) {
        console.error("Error al inicializar divisas:", error.message);
    }
};
