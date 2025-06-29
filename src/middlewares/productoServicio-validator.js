import { body, param } from "express-validator";
import { validateField } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./validate-roles.js";

export const crearProductoServicioValidator = [
  validateJWT,
  hasRoles("ADMIN"),
  body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("descripcion").optional(),
  body("precio")
    .notEmpty()
    .withMessage("El precio es obligatorio")
    .isFloat({ min: 0.01 })
    .withMessage("El precio debe ser mayor a 0"),
  body("disponible")
    .optional()
    .isBoolean()
    .withMessage("Disponible debe ser un valor booleano"),
  validateField,
  handleErrors,
];

export const getProductoServicioByIdValidator = [
  validateJWT,
  hasRoles("ADMIN", "CLIENT"),
  param("id").isMongoId().withMessage("El ID no es válido"),
  validateField,
  handleErrors,
];

export const updateProductoServicioValidator = [
  validateJWT,
  hasRoles("ADMIN"),
  param("id").isMongoId().withMessage("El ID no es válido"),
  body("nombre").optional(),
  body("descripcion").optional(),
  body("precio")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("El precio debe ser mayor a 0"),
  body("disponible")
    .optional()
    .isBoolean()
    .withMessage("Disponible debe ser un valor booleano"),
  validateField,
  handleErrors,
];

export const cambiarDisponibilidadValidator = [
  validateJWT,
  hasRoles("ADMIN"),
  param("id").isMongoId().withMessage("El ID no es válido"),
  validateField,
  handleErrors,
];

export const deleteProductoServicioValidator = [
  validateJWT,
  hasRoles("ADMIN"),
  param("id").isMongoId().withMessage("El ID no es válido"),
  validateField,
  handleErrors,
];

export const getProductosServiciosValidator = [
  validateJWT,
  hasRoles("ADMIN", "CLIENT"),
  validateField,
  handleErrors,
];