import { body, param, query } from "express-validator";
import { validateField } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./validate-roles.js";

export const crearProductoServicioValidator = [
    validateJWT,
    hasRoles("ADMIN"),
    body("nombre")
        .notEmpty().withMessage("El nombre es obligatorio")
        .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres"),
    body("descripcion")
        .optional()
        .isLength({ max: 500 }).withMessage("La descripción no puede exceder 500 caracteres"),
    body("precio")
        .notEmpty().withMessage("El precio es obligatorio")
        .isFloat({ min: 0.01 }).withMessage("El precio debe ser mayor a 0"),
    body("stock")
        .optional()
        .isInt({ min: 0 }).withMessage("El stock debe ser un número entero mayor o igual a 0"),
    body("stockMinimo")
        .optional()
        .isInt({ min: 0 }).withMessage("El stock mínimo debe ser un número entero mayor o igual a 0"),
    body("disponible")
        .optional()
        .isBoolean().withMessage("Disponible debe ser un valor booleano"),
    validateField,
    handleErrors
];

export const getProductoServicioByIdValidator = [
    validateJWT,
    hasRoles("ADMIN", "CLIENT"),
    param("id")
        .isMongoId().withMessage("El ID no es válido"),
    validateField,
    handleErrors
];

export const updateProductoServicioValidator = [
    validateJWT,
    hasRoles("ADMIN"),
    param("id")
        .isMongoId().withMessage("El ID no es válido"),
    body("nombre")
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres"),
    body("descripcion")
        .optional()
        .isLength({ max: 500 }).withMessage("La descripción no puede exceder 500 caracteres"),
    body("precio")
        .optional()
        .isFloat({ min: 0.01 }).withMessage("El precio debe ser mayor a 0"),
    body("stock")
        .optional()
        .isInt({ min: 0 }).withMessage("El stock debe ser un número entero mayor o igual a 0"),
    body("stockMinimo")
        .optional()
        .isInt({ min: 0 }).withMessage("El stock mínimo debe ser un número entero mayor o igual a 0"),
    body("disponible")
        .optional()
        .isBoolean().withMessage("Disponible debe ser un valor booleano"),
    validateField,
    handleErrors
];

export const cambiarDisponibilidadValidator = [
    validateJWT,
    hasRoles("ADMIN"),
    param("id")
        .isMongoId().withMessage("El ID no es válido"),
    validateField,
    handleErrors
];

export const deleteProductoServicioValidator = [
    validateJWT,
    hasRoles("ADMIN"),
    param("id")
        .isMongoId().withMessage("El ID no es válido"),
    validateField,
    handleErrors
];

export const getProductosServiciosValidator = [
    validateJWT,
    hasRoles("ADMIN", "CLIENT"),
    query("nombre")
        .optional()
        .isLength({ min: 1, max: 100 }).withMessage("El nombre de búsqueda debe tener entre 1 y 100 caracteres"),
    query("disponible")
        .optional()
        .isIn(['true', 'false']).withMessage("Disponible debe ser true o false"),
    query("precioMin")
        .optional()
        .isFloat({ min: 0 }).withMessage("El precio mínimo debe ser mayor o igual a 0"),
    query("precioMax")
        .optional()
        .isFloat({ min: 0 }).withMessage("El precio máximo debe ser mayor o igual a 0"),
    query("page")
        .optional()
        .isInt({ min: 1 }).withMessage("La página debe ser un número entero mayor a 0"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage("El límite debe ser un número entre 1 y 100"),
    query("desde")
        .optional()
        .isInt({ min: 0 }).withMessage("Desde debe ser un número entero mayor o igual a 0"),
    validateField,
    handleErrors
];

export const getEstadisticasProductosValidator = [
    validateJWT,
    hasRoles("ADMIN"),
    validateField,
    handleErrors
];