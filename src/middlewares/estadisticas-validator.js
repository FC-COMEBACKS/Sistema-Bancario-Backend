import { query } from "express-validator";
import { validateField } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./validate-roles.js";

export const validarEstadisticasGenerales = [
    validateJWT,
    hasRoles("ADMIN"),
    validateField,
    handleErrors
];

export const validarMovimientosRecientes = [
    validateJWT,
    hasRoles("ADMIN", "CLIENT"),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100'),
    validateField,
    handleErrors
];

    export const validarEstadisticasMovimientos = [
        validateJWT,
        hasRoles("ADMIN", "CLIENT"),
        query('periodo')
            .optional()
            .isIn(['semanal', 'mensual', 'anual'])
            .withMessage('El período debe ser semanal, mensual o anual'),
        validateField,
        handleErrors
    ];

export const validarEstadisticasUsuarios = [
    validateJWT,
    hasRoles("ADMIN"),
    validateField,
    handleErrors
];

export const validarEstadisticasProductos = [
    validateJWT,
    hasRoles("ADMIN"),
    validateField,
    handleErrors
];

export const validarCuentasConMasMovimientos = [
    validateJWT,
    hasRoles("ADMIN"),
    query('orden')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('El orden debe ser asc o desc'),
    query('limite')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100'),
    validateField,
    handleErrors
];