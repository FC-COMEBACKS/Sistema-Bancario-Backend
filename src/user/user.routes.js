import { Router } from "express";
import {
    getUserById,
    getUsers,
    deleteUserAdmin,
    deleteUserClient,
    updatePassword,
    updateUserAdmin,
    updateUserUser,
    updateRole
} from "./user.controler.js";

const router = Router();

// Obtener usuario por ID
router.get("/:uid", /* validateJWT, someValidator, */ getUserById);

// Obtener todos los usuarios
router.get("/", /* validateJWT, someValidator, */ getUsers);

// Eliminar usuario por admin
router.delete("/admin/:uid", /* validateJWT, someValidator, */ deleteUserAdmin);

// Eliminar usuario por cliente autenticado
router.delete("/client", /* validateJWT, someValidator, */ deleteUserClient);

// Actualizar contraseña usuario autenticado
router.patch("/password", /* validateJWT, someValidator, */ updatePassword);

// Actualizar usuario por admin
router.put("/admin/:uid", /* validateJWT, someValidator, */ updateUserAdmin);

// Actualizar usuario por usuario autenticado
router.put("/client", /* validateJWT, someValidator, */ updateUserUser);

// Actualizar rol de usuario (admin)
router.patch("/role/:uid", /* validateJWT, someValidator, */ updateRole);

export default router;