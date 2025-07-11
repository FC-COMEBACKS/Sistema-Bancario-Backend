import { body, param } from "express-validator";
import { cuentaExists, userExists, usuarioTieneCuenta } from "../helpers/db-validator.js";
import { validateField } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./validate-roles.js";

export const crearCuentaValidator = [
    validateJWT,
    hasRoles("ADMIN"),
    body("usuario")
        .notEmpty().withMessage("El usuario es obligatorio")
        .isMongoId().withMessage("El ID de usuario no es válido")
        .custom(userExists),
    body("tipo")
        .notEmpty().withMessage("El tipo de cuenta es obligatorio")
        .isIn(["AHORROS", "CORRIENTE"]).withMessage("El tipo de cuenta debe ser AHORROS o CORRIENTE"),
    body("usuario")
        .custom(usuarioTieneCuenta),
    validateField,
    handleErrors
]

export const editarCuentaValidator = [
    validateJWT,
    hasRoles("ADMIN", "CLIENT"),
    param("cid").isMongoId().withMessage("El ID de cuenta no es válido"),
    param("cid").custom(cuentaExists),
    body("tipo")
        .optional()
        .isIn(["AHORROS", "CORRIENTE"]).withMessage("El tipo de cuenta debe ser AHORROS o CORRIENTE"),
    validateField,
    handleErrors
]

export const getCuentaByIdValidator = [
    validateJWT,
    hasRoles("ADMIN", "CLIENT"),
    param("cid").isMongoId().withMessage("El ID de cuenta no es válido"),
    param("cid").custom(cuentaExists),
    validateField,
    handleErrors
];

export const getCuentasValidator = [
    validateJWT,
    hasRoles("ADMIN"),
    validateField,
    handleErrors
];

export const getCuentaByUsuarioValidator = [
    validateJWT,
    hasRoles("ADMIN", "CLIENT"),
    param("uid").isMongoId().withMessage("El ID de usuario no es válido"),
    validateField,
    handleErrors
];

export const getCuentaPorNumeroValidator = [
    validateJWT,
    hasRoles("ADMIN", "CLIENT"),
    param("numeroCuenta").notEmpty().withMessage("El número de cuenta es obligatorio"),
    validateField,
    handleErrors
];
