import { Router } from "express";
import { register, login } from "./auth.controller.js";
import { validatorLogin, validatorRegister } from "../middlewares/user-validator.js";

const router = Router();

/**
 * @swagger
 * /HRB/v1/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario en el sistema
 *     tags: [Autenticación]
 *     description: Crea un nuevo usuario si todos los datos de registro son válidos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - username
 *               - dpi
 *               - direccion
 *               - celular
 *               - correo
 *               - password
 *               - nombreTrabajo
 *               - ingresosMensuales
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               username:
 *                 type: string
 *                 description: Nombre de usuario único
 *               dpi:
 *                 type: string
 *                 description: Documento Personal de Identificación, debe ser único
 *               direccion:
 *                 type: string
 *                 description: Dirección física del usuario
 *               celular:
 *                 type: string
 *                 description: Número de teléfono celular
 *               correo:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único del usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario (mínimo 6 caracteres)
 *               nombreTrabajo:
 *                 type: string
 *                 description: Nombre del lugar de trabajo del usuario
 *               ingresosMensuales:
 *                 type: number
 *                 description: Ingresos mensuales del usuario (debe ser mayor a Q100)
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Usuario creado exitosamente"
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     uid:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     username:
 *                       type: string
 *                     correo:
 *                       type: string
 *       400:
 *         description: Datos inválidos o usuario ya existente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "El correo ya está registrado"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Error al registrar el usuario"
 *     security: []
 */
router.post("/register", validatorRegister, register);

/**
 * @swagger
 * /HRB/v1/auth/login:
 *   post:
 *     summary: Inicia sesión en el sistema
 *     tags: [Autenticación]
 *     description: Autentica a un usuario y retorna un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - password
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Inicio de sesión exitoso"
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     uid:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     rol:
 *                       type: string
 *                       example: "CLIENT"
 *                     correo:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación
 *       400:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Correo o contraseña incorrectos"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Error al iniciar sesión"
 *     security: []
 */
router.post("/login", validatorLogin, login);

export default router;
