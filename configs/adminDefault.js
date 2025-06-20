import { hash } from "argon2";
import Usuario from "../src/user/user.model.js";

export const crearAdmin = async () => {
    try {
        const adminExistente = await Usuario.findOne({ rol: "ADMIN" });

        if (adminExistente) {
            console.log("Ya existe un administrador en la base de datos.");
            return;
        }

        const datosAdmin = {
            username: "ADMINB",
            password: "ADMINB",
        };

        const encryptedPassword = await hash(datosAdmin.password);
        datosAdmin.password = encryptedPassword;

        const nuevoAdmin = new Usuario(datosAdmin);
        await nuevoAdmin.save();

        console.log("Administrador creado exitosamente");
    } catch (err) {
        console.error("Error al crear el administrador:", err.message);
    }
}