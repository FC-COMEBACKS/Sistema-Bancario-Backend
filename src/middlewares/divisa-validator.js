import { body, param } from "express-validator";
import { validateField } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./validate-roles.js";

export const getDivisasValidator = [validateJWT, validateField, handleErrors];

export const convertirMontoValidator = [
  validateJWT,
  body("monto")
    .notEmpty()
    .withMessage("El monto es obligatorio")
    .isFloat({ min: 0.01 })
    .withMessage("El monto debe ser un número positivo"),
  body("divisaOrigen")
    .notEmpty()
    .withMessage("La divisa de origen es obligatoria"),
  body("divisaDestino")
    .notEmpty()
    .withMessage("La divisa de destino es obligatoria"),
  validateField,
  handleErrors,
];

export const convertirSaldoCuentaValidator = [
  validateJWT,
  body("cuentaId")
    .notEmpty()
    .withMessage("El ID de cuenta es obligatorio")
    .isMongoId()
    .withMessage("El ID de cuenta no es válido"),
  body("divisaDestino")
    .notEmpty()
    .withMessage("La divisa de destino es obligatoria"),
  validateField,
  handleErrors,
];

export const actualizarTasasValidator = [
  validateJWT,
  hasRoles("ADMIN"),
  body("tasas").isArray().withMessage("Se espera un array de tasas"),
  body("tasas.*.codigo")
    .notEmpty()
    .withMessage("El código de divisa es obligatorio para cada tasa"),
  body("tasas.*.tasaEnQuetzales")
    .notEmpty()
    .withMessage("La tasa en quetzales es obligatoria para cada divisa")
    .isFloat({ min: 0.0001 })
    .withMessage("La tasa debe ser un número positivo"),
  validateField,
  handleErrors,
];

export const agregarDivisaValidator = [
  validateJWT,
  hasRoles("ADMIN"),
  body("codigo")
    .notEmpty()
    .withMessage("El código de la divisa es obligatorio"),
  body("nombre")
    .notEmpty()
    .withMessage("El nombre de la divisa es obligatorio"),
  body("tasaEnQuetzales")
    .notEmpty()
    .withMessage("La tasa de cambio es obligatoria")
    .isFloat({ min: 0.0001 })
    .withMessage("La tasa de cambio debe ser un número positivo"),
  validateField,
  handleErrors,
];

export const restaurarTasasOficialesValidator = [
  validateJWT,
  hasRoles("ADMIN"),
  validateField,
  handleErrors,
];