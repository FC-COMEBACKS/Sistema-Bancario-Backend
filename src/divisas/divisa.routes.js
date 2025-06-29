import { Router } from "express";
import { getDivisas, convertirMonto, convertirSaldoCuenta, actualizarTasas, agregarDivisa, restaurarTasasOficiales } from "./divisa.controller.js";
import { getDivisasValidator, convertirMontoValidator, convertirSaldoCuentaValidator, actualizarTasasValidator, agregarDivisaValidator, restaurarTasasOficialesValidator } from "../middlewares/divisa-validator.js";

const router = Router();

/**
 * @swagger
 * /divisas:
 *   get:
 *     summary: Obtiene la lista de divisas disponibles
 *     tags: [Divisas]
 *     parameters:
 *       - in: query
 *         name: filtro
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtro opcional para buscar divisas
 *     responses:
 *       200:
 *         description: Lista de divisas obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Divisa'
 *       400:
 *         description: Error de validación en los parámetros
 *     security:
 *       - bearerAuth: []
 *     x-roles:
 *       - admin
 *       - user
 *     x-validation: true
 */
router.get("/", getDivisasValidator, getDivisas);

/**
 * @swagger
 * /divisas/convertir:
 *   post:
 *     summary: Convierte un monto de una divisa a otra
 *     tags: [Divisas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               monto:
 *                 type: number
 *               divisaOrigen:
 *                 type: string
 *               divisaDestino:
 *                 type: string
 *             required:
 *               - monto
 *               - divisaOrigen
 *               - divisaDestino
 *     responses:
 *       200:
 *         description: Monto convertido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 montoConvertido:
 *                   type: number
 *       400:
 *         description: Error de validación o parámetros incorrectos
 *     security:
 *       - bearerAuth: []
 *     x-roles:
 *       - admin
 *       - user
 *     x-validation: true
 */
router.post("/convertir", convertirMontoValidator, convertirMonto);

/**
 * @swagger
 * /divisas/convertir-saldo:
 *   post:
 *     summary: Convierte el saldo de una cuenta a otra divisa
 *     tags: [Divisas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cuentaId:
 *                 type: string
 *               divisaDestino:
 *                 type: string
 *             required:
 *               - cuentaId
 *               - divisaDestino
 *     responses:
 *       200:
 *         description: Saldo convertido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 saldoConvertido:
 *                   type: number
 *       400:
 *         description: Error de validación o parámetros incorrectos
 *     security:
 *       - bearerAuth: []
 *     x-roles:
 *       - admin
 *       - user
 *     x-validation: true
 */
router.post("/convertir-saldo", convertirSaldoCuentaValidator, convertirSaldoCuenta);

/**
 * @swagger
 * /divisas/actualizar-tasas:
 *   post:
 *     summary: Actualiza las tasas de cambio de las divisas
 *     tags: [Divisas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tasas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     codigo:
 *                       type: string
 *                       description: Código de la divisa (USD, EUR, etc.)
 *                     tasaEnQuetzales:
 *                       type: number
 *                       description: Tasa de cambio en relación al quetzal (GTQ)
 *                   required:
 *                     - codigo
 *                     - tasaEnQuetzales
 *             required:
 *               - tasas
 *     responses:
 *       200:
 *         description: Tasas actualizadas correctamente
 *       400:
 *         description: Error de validación o parámetros incorrectos
 *     security:
 *       - bearerAuth: []
 *     x-roles:
 *       - admin
 *     x-validation: true
 */
router.post("/actualizar-tasas", actualizarTasasValidator, actualizarTasas);

/**
 * @swagger
 * /divisas/agregar:
 *   post:
 *     summary: Agrega una nueva divisa al sistema
 *     tags: [Divisas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               simbolo:
 *                 type: string
 *               tasa:
 *                 type: number
 *             required:
 *               - nombre
 *               - simbolo
 *               - tasa
 *     responses:
 *       201:
 *         description: Divisa agregada correctamente
 *       400:
 *         description: Error de validación o parámetros incorrectos
 *     security:
 *       - bearerAuth: []
 *     x-roles:
 *       - admin
 *     x-validation: true
 */
router.post("/agregar", agregarDivisaValidator, agregarDivisa);

/**
 * @swagger
 * /divisas/restaurar-tasas-oficiales:
 *   post:
 *     summary: Restaura las tasas de cambio a los valores oficiales desde la API externa
 *     tags: [Divisas]
 *     responses:
 *       200:
 *         description: Tasas restauradas correctamente a valores oficiales
 *       500:
 *         description: Error al restaurar las tasas oficiales
 *     security:
 *       - bearerAuth: []
 *     x-roles:
 *       - admin
 *     x-validation: true
 */
router.post("/restaurar-tasas-oficiales", restaurarTasasOficialesValidator, restaurarTasasOficiales);

export default router;
