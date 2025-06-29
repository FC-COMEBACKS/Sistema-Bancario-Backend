import { body, param } from "express-validator";
import { validateField } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { cuentaExistsByNumeroCuenta } from "../helpers/db-validator.js";
import { hasRoles } from "./validate-roles.js";

export const agregarFavoritoValidator = [
    validateJWT,
    hasRoles("CLIENT"),
    body("numeroCuenta")
        .notEmpty().withMessage("El número de cuenta es obligatorio")
        .custom(cuentaExistsByNumeroCuenta),
    body("alias")
        .notEmpty().withMessage("El alias es obligatorio"),
    validateField,
    handleErrors
];

export const getFavoritosValidator = [
    validateJWT,
    hasRoles("CLIENT"),
    validateField,
    handleErrors
];

export const updateFavoritoValidator = [
    validateJWT,
    hasRoles("CLIENT"),
    param("id")
        .isMongoId().withMessage("El ID no es válido"),
    body("alias")
        .notEmpty().withMessage("El alias es obligatorio"),
    validateField,
    handleErrors
];

export const deleteFavoritoValidator = [
    validateJWT,
    hasRoles("CLIENT"),
    param("id")
        .isMongoId().withMessage("El ID no es válido"),
    validateField,
    handleErrors
];

export const transferirAFavoritoValidator = [
    validateJWT,
    hasRoles("CLIENT"),
    body("favoritoId")
        .notEmpty().withMessage("El favorito es obligatorio")
        .isMongoId().withMessage("El ID del favorito no es válido"),
    body("monto")
        .notEmpty().withMessage("El monto es obligatorio")
        .isFloat({ min: 0.01 }).withMessage("El monto debe ser mayor a 0")
        .isFloat({ max: 2000 }).withMessage("No se puede transferir más de Q2000 por transacción"),
    body("descripcion")
        .optional(),
    validateField,
    handleErrors
];

