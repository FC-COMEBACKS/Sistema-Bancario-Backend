import { body, param } from "express-validator";
import {
  emailExists,
  usernameExists,
  dpiExists,
  userExists,
} from "../helpers/db-validator.js";
import { validateField } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./validate-roles.js";

export const validatorRegister = [
  body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("username")
    .notEmpty()
    .withMessage("El username es obligatorio")
    .custom(usernameExists),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/^(?:.*[A-Z]){6,}$/)
    .withMessage("La contraseña debe contener al menos 6 letras mayúsculas"),
  body("dpi").notEmpty().withMessage("El DPI es obligatorio").custom(dpiExists),
  body("email")
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("No es un email válido")
    .custom(emailExists),
  body("direccion").notEmpty().withMessage("La dirección es obligatoria"),
  body("celular").notEmpty().withMessage("El celular es obligatorio"),
  body("nombreTrabajo")
    .notEmpty()
    .withMessage("El nombre del trabajo es obligatorio"),
  body("ingresosMensuales")
    .notEmpty()
    .withMessage("Los ingresos mensuales son obligatorios")
    .isNumeric()
    .withMessage("Los ingresos mensuales deben ser numéricos")
    .isFloat({ min: 100 })
    .withMessage("Los ingresos mensuales deben ser al menos 100"),
  validateField,
  handleErrors,
];

export const validatorLogin = [
  body("username").notEmpty().withMessage("El username es obligatorio"),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/^(?:.*[A-Z]){6,}$/)
    .withMessage("La contraseña debe contener al menos 6 letras mayúsculas"),
  validateField,
  handleErrors,
];

export const getUserByIdValidator = [
  validateJWT,
  hasRoles("ADMIN", "CLIENT"),
  param("uid").isMongoId().withMessage("El id no es válido"),
  param("uid").custom(userExists),
  validateField,
  handleErrors,
];

export const updateUserValidatorAdmin = [
  validateJWT,
  hasRoles("ADMIN"),
  param("uid").isMongoId().withMessage("El id no es válido"),
  param("uid").custom(userExists),
  validateField,
  handleErrors,
];

export const updateUserValidatorClient = [
  validateJWT,
  hasRoles("CLIENT"),
  validateField,
  handleErrors,
];

export const deleteUserValidatorAdmin = [
  validateJWT,
  hasRoles("ADMIN"),
  param("uid").isMongoId().withMessage("El id no es válido"),
  param("uid").custom(userExists),
  validateField,
  handleErrors,
];

export const deleteUserValidatorClient = [
  validateJWT,
  hasRoles("CLIENT"),
  validateField,
  handleErrors,
];

export const updatePasswordValidator = [
  validateJWT,
  hasRoles("ADMIN", "CLIENT"),
  body("newPassword")
    .notEmpty()
    .withMessage("La nueva contraseña es obligatoria")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/^(?:.*[A-Z]){6,}$/)
    .withMessage("La contraseña debe contener al menos 6 letras mayúsculas"),
  validateField,
  handleErrors,
];

export const updateRoleValidator = [
  validateJWT,
  hasRoles("ADMIN"),
  param("uid").isMongoId().withMessage("El id no es válido"),
  body("newRole")
    .notEmpty()
    .withMessage("El rol es obligatorio")
    .isIn(["ADMIN", "CLIENT"])
    .withMessage("El rol no es válido"),
  validateField,
  handleErrors,
];

export const getUsersValidator = [
  validateJWT,
  hasRoles("ADMIN"),
  validateField,
  handleErrors,
];