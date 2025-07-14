import { body, param } from "express-validator";
import { validateField } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./validate-roles.js";

export const getMovimientosValidator = [
    validateJWT,
    hasRoles("ADMIN", "CLIENT"),
    validateField,
    handleErrors
];

export const getMovimientoByIdValidator = [
    validateJWT,
    hasRoles("ADMIN", "CLIENT"),
    param("id")
        .isMongoId().withMessage("El ID no es válido"),
    validateField,
    handleErrors
];

export const realizarTransferenciaValidator = [
    validateJWT,
    hasRoles("CLIENT"),
    body("cuentaOrigen")
        .notEmpty().withMessage("El número de cuenta de origen es obligatorio"),
    body("cuentaDestino")
        .notEmpty().withMessage("El número de cuenta de destino es obligatorio"),
    body("monto")
        .notEmpty().withMessage("El monto es obligatorio")
        .isFloat({ min: 0.01 }).withMessage("El monto debe ser mayor a 0")
        .isFloat({ max: 2000 }).withMessage("No se puede transferir más de Q2000 por transacción"),
    body("descripcion")
        .optional(),
    validateField,
    handleErrors
];

export const realizarCreditoValidator = [
    validateJWT,
    hasRoles("ADMIN"),
    body("cuentaDestino")
        .notEmpty().withMessage("El número de cuenta de destino es obligatorio"),
    body("monto")
        .notEmpty().withMessage("El monto es obligatorio")
        .isFloat({ min: 0.01 }).withMessage("El monto debe ser mayor a 0"),
    body("descripcion")
        .optional(),
    validateField,
    handleErrors
];

export const realizarDepositoValidator = [
    validateJWT,
    hasRoles("ADMIN"),
    body("cuentaDestino")
        .notEmpty().withMessage("El número de cuenta de destino es obligatorio"),
    body("monto")
        .notEmpty().withMessage("El monto es obligatorio")
        .isFloat({ min: 0.01 }).withMessage("El monto debe ser mayor a 0"),
    body("descripcion")
        .optional(),
    validateField,
    handleErrors
];

export const revertirDepositoValidator = [
    validateJWT,
    hasRoles("ADMIN"),
    param("id")
        .isMongoId().withMessage("El ID no es válido"),
    validateField,
    handleErrors
];

export const comprarProductoValidator = [
    validateJWT,
    hasRoles("CLIENT"),
    body("cuentaId")
        .notEmpty().withMessage("La cuenta es obligatoria")
        .isMongoId().withMessage("El ID de la cuenta no es válido"),
    body("productoId")
        .notEmpty().withMessage("El producto es obligatorio")
        .isMongoId().withMessage("El ID del producto no es válido"),
    body("descripcion")
        .optional(),
    validateField,
    handleErrors
];

export const getHistorialCuentaValidator = [
    validateJWT,
    hasRoles("ADMIN", "CLIENT"),
    param("cuentaId")
        .isMongoId().withMessage("El ID de la cuenta no es válido"),
    validateField,
    handleErrors
];

