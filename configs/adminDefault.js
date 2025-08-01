import { hash } from "argon2";
import Usuario from "../src/user/user.model.js";

export const crearAdmin = async () => {
    try {
        const adminExistente = await Usuario.findOne({ username: "ADMINB" });

        if (adminExistente) {
            console.log("Ya existe un administrador en la base de datos.");
            return;
        }

        const datosAdmin = {
            username: "ADMINBB",
            password: await hash("ADMINBB"),
            nombre: "Marco",
            email: "adminb@admin.com",
            celular: "37996330",
            direccion: "KINAL",
            dpi: "7030304051235",
            nombreTrabajo: "Administrador",
            ingresosMensuales: 10000,
            rol: "ADMIN"
        };

        const nuevoAdmin = new Usuario(datosAdmin);
        await nuevoAdmin.save();

        console.log("Administrador creado exitosamente");
    } catch (err) {
        console.error("Error al crear el administrador:", err.message);
    }
}