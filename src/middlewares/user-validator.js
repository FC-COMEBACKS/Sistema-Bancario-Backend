import { body } from "express-validator";
import { emailExists, usernameExists, dpiExists } from "../helpers/db-validator.js";
import { validateField } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";

export const validatorRegister = [
  body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("username")
    .notEmpty().withMessage("El username es obligatorio")
    .custom(usernameExists),
  body("password")
     .notEmpty().withMessage("La contraseña es obligatoria")
  .isLength({ min: 6 })
  .withMessage("La contraseña debe tener al menos 6 caracteres")
  .matches(/^(?:.*[A-Z]){6,}$/).withMessage("La contraseña debe contener al menos 6 letras mayúsculas"),
  body("dpi")
    .notEmpty().withMessage("El DPI es obligatorio")
    .custom(dpiExists),
  body("email")
    .notEmpty().withMessage("El email es obligatorio")
    .isEmail().withMessage("No es un email válido")
    .custom(emailExists),
  body("direccion").notEmpty().withMessage("La dirección es obligatoria"),
  body("celular").notEmpty().withMessage("El celular es obligatorio"),
  body("nombreTrabajo").notEmpty().withMessage("El nombre del trabajo es obligatorio"),
  body("ingresosMensuales")
    .notEmpty().withMessage("Los ingresos mensuales son obligatorios")
    .isNumeric().withMessage("Los ingresos mensuales deben ser numéricos")
    .isFloat({ min: 100 }).withMessage("Los ingresos mensuales deben ser al menos 100"),
  validateField,
  handleErrors
];

export const validatorLogin = [
  body("username").notEmpty().withMessage("El username es obligatorio"),
  body("password")
    .notEmpty().withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/^(?:.*[A-Z]){6,}$/).withMessage("La contraseña debe contener al menos 6 letras mayúsculas"),
  validateField,
  handleErrors
];