import { Router } from "express";
import { getMovimientos, getMovimientoById, realizarTransferencia, realizarDeposito, revertirDeposito, comprarProducto, getHistorialCuenta } from "./movimiento.controller.js";
import { getMovimientosValidator, getMovimientoByIdValidator, realizarTransferenciaValidator, realizarDepositoValidator, revertirDepositoValidator, comprarProductoValidator, getHistorialCuentaValidator } from "../middlewares/movimiento-validator.js";

const router = Router();

/**
 * @swagger
 * /HRB/v1/movimientos:
 *   get:
 *     summary: Obtiene todos los movimientos
 *     tags: [Movimientos]
 *     description: Retorna un listado de todos los movimientos (solo administradores pueden ver todos los movimientos)
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número máximo de movimientos a retornar (por defecto 10)
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página a retornar (por defecto 1)
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [TRANSFERENCIA, DEPOSITO, COMPRA]
 *         description: Filtrar movimientos por tipo
 *     responses:
 *       200:
 *         description: Movimientos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 movimientos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mid:
 *                         type: string
 *                       tipo:
 *                         type: string
 *                         enum: [TRANSFERENCIA, DEPOSITO, COMPRA]
 *                       monto:
 *                         type: number
 *                       fechaHora:
 *                         type: string
 *                         format: date-time
 *                       descripcion:
 *                         type: string
 *                       cuentaOrigen:
 *                         type: object
 *                         properties:
 *                           cid:
 *                             type: string
 *                           numeroCuenta:
 *                             type: string
 *                       cuentaDestino:
 *                         type: object
 *                         properties:
 *                           cid:
 *                             type: string
 *                           numeroCuenta:
 *                             type: string
 *                 paginacion:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pagina:
 *                       type: integer
 *                     paginas:
 *                       type: integer
 *                     limite:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Token no válido"
 *       403:
 *         description: Prohibido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "No tienes permisos para realizar esta acción"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Error al obtener los movimientos"
 *     security:
 *       - bearerAuth: []
 */
router.get("/", getMovimientosValidator, getMovimientos);

/**
 * @swagger
 * /HRB/v1/movimientos/transferencia:
 *   post:
 *     summary: Realiza una transferencia entre cuentas
 *     tags: [Movimientos]
 *     description: Permite transferir dinero de una cuenta a otra (usuario debe ser propietario de la cuenta origen o administrador)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cuentaOrigen
 *               - cuentaDestino
 *               - monto
 *             properties:
 *               cuentaOrigen:
 *                 type: string
 *                 description: Número de cuenta de origen
 *                 example: "5627863035"
 *               cuentaDestino:
 *                 type: string
 *                 description: Número de cuenta de destino
 *                 example: "9698599992"
 *               monto:
 *                 type: number
 *                 description: Cantidad a transferir (máximo Q2,000 por transacción)
 *                 example: 1000
 *               descripcion:
 *                 type: string
 *                 description: Motivo de la transferencia
 *                 example: "Pago de préstamo"
 *     responses:
 *       200:
 *         description: Transferencia realizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Transferencia realizada con éxito"
 *                 movimiento:
 *                   type: object
 *                   properties:
 *                     mid:
 *                       type: string
 *                     tipo:
 *                       type: string
 *                       example: "TRANSFERENCIA"
 *                     monto:
 *                       type: number
 *                     fechaHora:
 *                       type: string
 *                       format: date-time
 *                     descripcion:
 *                       type: string
 *                 cuentaOrigen:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     numeroCuenta:
 *                       type: string
 *                     titular:
 *                       type: string
 *                       example: "Pedro Pérez"
 *                     saldo:
 *                       type: number
 *                 cuentaDestino:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     numeroCuenta:
 *                       type: string
 *                     titular:
 *                       type: string
 *                       example: "María García"
 *       400:
 *         description: Datos inválidos o restricciones de negocio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Saldo insuficiente para realizar esta transferencia"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Token no válido"
 *       403:
 *         description: Prohibido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "No tienes permisos para realizar esta acción"
 *       404:
 *         description: Cuenta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Cuenta de origen no encontrada o no tienes permisos para acceder a ella"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Error al realizar la transferencia"
 *     security:
 *       - bearerAuth: []
 */
router.post("/transferencia", realizarTransferenciaValidator, realizarTransferencia);

/**
 * @swagger
 * /HRB/v1/movimientos/deposito:
 *   post:
 *     summary: Realiza un depósito en una cuenta
 *     tags: [Movimientos]
 *     description: Permite depositar dinero en una cuenta (solo administradores pueden realizar depósitos)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cuentaId
 *               - monto
 *               - descripcion
 *             properties:
 *               cuentaId:
 *                 type: string
 *                 description: ID de la cuenta donde se realiza el depósito
 *                 example: "60d725b3e6b8a0c3f8b4567e"
 *               monto:
 *                 type: number
 *                 description: Cantidad a depositar (debe ser mayor que 0)
 *                 example: 500
 *               descripcion:
 *                 type: string
 *                 description: Descripción o motivo del depósito
 *                 example: "Depósito inicial"
 *     responses:
 *       200:
 *         description: Depósito realizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Depósito realizado con éxito"
 *                 movimiento:
 *                   type: object
 *                   properties:
 *                     mid:
 *                       type: string
 *                     tipo:
 *                       type: string
 *                       example: "DEPOSITO"
 *                     monto:
 *                       type: number
 *                     fechaHora:
 *                       type: string
 *                       format: date-time
 *                     descripcion:
 *                       type: string
 *                 cuenta:
 *                   type: object
 *                   properties:
 *                     numeroCuenta:
 *                       type: string
 *                     saldo:
 *                       type: number
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "El monto debe ser mayor a 0"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Token no válido"
 *       403:
 *         description: Prohibido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "No tienes permisos para realizar esta acción"
 *       404:
 *         description: Cuenta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Cuenta no encontrada"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Error al realizar el depósito"
 *     security:
 *       - bearerAuth: []
 */
router.post("/deposito", realizarDepositoValidator, realizarDeposito);

/**
 * @swagger
 * /HRB/v1/movimientos/deposito/{id}/revertir:
 *   post:
 *     summary: Revierte un depósito
 *     tags: [Movimientos]
 *     description: Permite revertir un depósito dentro del plazo de 1 minuto (solo administradores)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del movimiento de depósito a revertir
 *     responses:
 *       200:
 *         description: Depósito revertido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Depósito revertido con éxito"
 *                 movimiento:
 *                   type: object
 *                   properties:
 *                     mid:
 *                       type: string
 *                     tipo:
 *                       type: string
 *                       example: "DEPOSITO"
 *                     monto:
 *                       type: number
 *                     reversed:
 *                       type: boolean
 *                       example: true
 *                     descripcion:
 *                       type: string
 *                 cuenta:
 *                   type: object
 *                   properties:
 *                     numeroCuenta:
 *                       type: string
 *                     saldo:
 *                       type: number
 *       400:
 *         description: Datos inválidos o restricciones de negocio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "El depósito no puede ser revertido porque ha pasado más de 1 minuto desde su realización"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Token no válido"
 *       403:
 *         description: Prohibido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "No tienes permisos para realizar esta acción"
 *       404:
 *         description: Movimiento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Depósito no encontrado"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Error al revertir el depósito"
 *     security:
 *       - bearerAuth: []
 */
router.post("/deposito/:id/revertir", revertirDepositoValidator, revertirDeposito);

/**
 * @swagger
 * /HRB/v1/movimientos/realizar-compra:
 *   post:
 *     summary: Realiza la compra de un producto
 *     tags: [Movimientos]
 *     description: Permite a un cliente comprar un producto o servicio ofrecido por el banco
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cuentaId
 *               - productoId
 *             properties:
 *               cuentaId:
 *                 type: string
 *                 description: ID de la cuenta desde la que se realiza la compra
 *                 example: "60d725b3e6b8a0c3f8b4567e"
 *               productoId:
 *                 type: string
 *                 description: ID del producto a comprar
 *                 example: "60d725b3e6b8a0c3f8b4567f"
 *     responses:
 *       200:
 *         description: Compra realizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Compra realizada con éxito"
 *                 movimiento:
 *                   type: object
 *                   properties:
 *                     mid:
 *                       type: string
 *                     tipo:
 *                       type: string
 *                       example: "COMPRA"
 *                     monto:
 *                       type: number
 *                     fechaHora:
 *                       type: string
 *                       format: date-time
 *                     descripcion:
 *                       type: string
 *                 cuenta:
 *                   type: object
 *                   properties:
 *                     numeroCuenta:
 *                       type: string
 *                     saldo:
 *                       type: number
 *                 producto:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     precio:
 *                       type: number
 *       400:
 *         description: Datos inválidos o restricciones de negocio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Saldo insuficiente para realizar esta compra"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Token no válido"
 *       403:
 *         description: Prohibido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "No tienes permisos para realizar esta acción"
 *       404:
 *         description: Cuenta o producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Producto no encontrado o no disponible"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Error al realizar la compra"
 *     security:
 *       - bearerAuth: []
 */
router.post("/realizar-compra", comprarProductoValidator, comprarProducto);

/**
 * @swagger
 * /HRB/v1/movimientos/cuenta/{cuentaId}:
 *   get:
 *     summary: Obtiene historial de movimientos de una cuenta
 *     tags: [Movimientos]
 *     description: Retorna el historial de movimientos de una cuenta específica (el usuario debe ser propietario de la cuenta o administrador)
 *     parameters:
 *       - in: path
 *         name: cuentaId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la cuenta
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número máximo de movimientos a retornar (por defecto 10)
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página a retornar (por defecto 1)
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [TRANSFERENCIA, DEPOSITO, COMPRA]
 *         description: Filtrar movimientos por tipo
 *       - in: query
 *         name: ordenarPor
 *         schema:
 *           type: string
 *           enum: [fechaHora, monto]
 *         description: Campo por el cual ordenar los movimientos
 *       - in: query
 *         name: orden
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Dirección del ordenamiento (ascendente o descendente)
 *     responses:
 *       200:
 *         description: Movimientos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 movimientos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mid:
 *                         type: string
 *                       tipo:
 *                         type: string
 *                         enum: [TRANSFERENCIA, DEPOSITO, COMPRA]
 *                       monto:
 *                         type: number
 *                       fechaHora:
 *                         type: string
 *                         format: date-time
 *                       descripcion:
 *                         type: string
 *                       esIngreso:
 *                         type: boolean
 *                       esEgreso:
 *                         type: boolean
 *                       contrapartida:
 *                         type: object
 *                         properties:
 *                           numeroCuenta:
 *                             type: string
 *                           nombre:
 *                             type: string
 *                 paginacion:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pagina:
 *                       type: integer
 *                     paginas:
 *                       type: integer
 *                     limite:
 *                       type: integer
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "El ID de cuenta no es válido"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Token no válido"
 *       403:
 *         description: Prohibido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "No tienes permisos para acceder a esta cuenta"
 *       404:
 *         description: Cuenta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Cuenta no encontrada"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Error al obtener los movimientos de la cuenta"
 *     security:
 *       - bearerAuth: []
 */
router.get("/cuenta/:cuentaId", getHistorialCuentaValidator, getHistorialCuenta);

/**
 * @swagger
 * /HRB/v1/movimientos/{id}:
 *   get:
 *     summary: Obtiene un movimiento por su ID
 *     tags: [Movimientos]
 *     description: Retorna los detalles de un movimiento específico (el usuario debe ser propietario de alguna de las cuentas involucradas o administrador)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del movimiento
 *     responses:
 *       200:
 *         description: Movimiento encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 movimiento:
 *                   type: object
 *                   properties:
 *                     mid:
 *                       type: string
 *                     tipo:
 *                       type: string
 *                       enum: [TRANSFERENCIA, DEPOSITO, COMPRA]
 *                     monto:
 *                       type: number
 *                     fechaHora:
 *                       type: string
 *                       format: date-time
 *                     descripcion:
 *                       type: string
 *                     reversed:
 *                       type: boolean
 *                     cuentaOrigen:
 *                       type: object
 *                       properties:
 *                         cid:
 *                           type: string
 *                         numeroCuenta:
 *                           type: string
 *                         usuario:
 *                           type: object
 *                           properties:
 *                             nombre:
 *                               type: string
 *                     cuentaDestino:
 *                       type: object
 *                       properties:
 *                         cid:
 *                           type: string
 *                         numeroCuenta:
 *                           type: string
 *                         usuario:
 *                           type: object
 *                           properties:
 *                             nombre:
 *                               type: string
 *       400:
 *         description: ID con formato inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "El ID no es válido"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Token no válido"
 *       403:
 *         description: Prohibido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "No tienes permisos para acceder a este movimiento"
 *       404:
 *         description: Movimiento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Movimiento no encontrado"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Error al obtener el movimiento"
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", getMovimientoByIdValidator, getMovimientoById);

export default router;

