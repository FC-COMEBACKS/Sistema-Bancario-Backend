import { Router } from 'express';
import { getEstadisticasGenerales, getMovimientosRecientes, getEstadisticasMovimientos, getEstadisticasUsuarios, getEstadisticasProductos, getCuentasConMasMovimientos } from './estadisticas.controller.js';
import { validarEstadisticasGenerales, validarMovimientosRecientes, validarEstadisticasMovimientos, validarEstadisticasUsuarios, validarEstadisticasProductos, validarCuentasConMasMovimientos } from '../middlewares/estadisticas-validator.js';

const router = Router();

/**
 * @swagger
 * /HRB/v1/estadisticas/general:
 *   get:
 *     summary: Obtener estadísticas generales del sistema
 *     description: Proporciona estadísticas generales del sistema incluyendo conteos de usuarios, cuentas, movimientos y productos
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas generales obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     usuarios:
 *                       type: object
 *                     cuentas:
 *                       type: object
 *                     movimientos:
 *                       type: object
 *                     productos:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: "Estadísticas generales obtenidas correctamente"
 *       401:
 *         description: Token de autenticación faltante o inválido
 *       403:
 *         description: No tiene permisos para acceder a las estadísticas
 *       500:
 *         description: Error interno del servidor
 */
router.get('/estadisticasgenerales', validarEstadisticasGenerales, getEstadisticasGenerales);

/**
 * @swagger
 * /HRB/v1/estadisticas/movimientos/recientes:
 *   get:
 *     summary: Obtener movimientos recientes
 *     description: Proporciona una lista de los movimientos más recientes en el sistema
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de movimientos a retornar
 *     responses:
 *       200:
 *         description: Movimientos recientes obtenidos exitosamente
 *       401:
 *         description: Token de autenticación faltante o inválido
 *       403:
 *         description: No tiene permisos para acceder a esta información
 *       500:
 *         description: Error interno del servidor
 */
router.get('/movimientos/recientes', validarMovimientosRecientes, getMovimientosRecientes);

/**
 * @swagger
 * /HRB/v1/estadisticas/movimientos:
 *   get:
 *     summary: Obtener estadísticas de movimientos
 *     description: Proporciona estadísticas de movimientos por período (semanal, mensual, anual)
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *           enum: [semanal, mensual, anual]
 *           default: mensual
 *         description: Período para las estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas de movimientos obtenidas exitosamente
 *       401:
 *         description: Token de autenticación faltante o inválido
 *       403:
 *         description: No tiene permisos para acceder a esta información
 *       500:
 *         description: Error interno del servidor
 */
router.get('/movimientos', validarEstadisticasMovimientos, getEstadisticasMovimientos);

/**
 * @swagger
 * /HRB/v1/estadisticas/usuarios:
 *   get:
 *     summary: Obtener estadísticas de usuarios
 *     description: Proporciona estadísticas de usuarios registrados por mes y estado
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de usuarios obtenidas exitosamente
 *       401:
 *         description: Token de autenticación faltante o inválido
 *       403:
 *         description: No tiene permisos para acceder a esta información
 *       500:
 *         description: Error interno del servidor
 */
router.get('/usuarios', validarEstadisticasUsuarios, getEstadisticasUsuarios);

/**
 * @swagger
 * /HRB/v1/estadisticas/productos:
 *   get:
 *     summary: Obtener estadísticas de productos
 *     description: Proporciona estadísticas de productos incluyendo los más populares basados en compras
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de productos obtenidas exitosamente
 *       401:
 *         description: Token de autenticación faltante o inválido
 *       403:
 *         description: No tiene permisos para acceder a esta información
 *       500:
 *         description: Error interno del servidor
 */
router.get('/productos', validarEstadisticasProductos, getEstadisticasProductos);

/**
 * @swagger
 * /HRB/v1/estadisticas/cuentas-mas-movimientos:
 *   get:
 *     summary: Obtiene las cuentas con más movimientos
 *     tags: [Estadísticas]
 *     description: Retorna un listado de cuentas ordenadas por cantidad de movimientos (requiere rol ADMIN)
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Número máximo de cuentas a retornar (por defecto 10)
 *       - in: query
 *         name: orden
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Orden de los resultados (asc=ascendente, desc=descendente) (por defecto desc)
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 cuentas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       numeroCuenta:
 *                         type: string
 *                       tipo:
 *                         type: string
 *                       saldo:
 *                         type: number
 *                       usuario:
 *                         type: object
 *                         properties:
 *                           nombre:
 *                             type: string
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
 *                       movimientos:
 *                         type: array
 *                 message:
 *                   type: string
 *       401:
 *         description: Token de autenticación faltante o inválido
 *       403:
 *         description: No tiene permisos para acceder a esta información
 *       500:
 *         description: Error interno del servidor
 *     security:
 *       - bearerAuth: []
 */
router.get('/cuentas-mas-movimientos', validarCuentasConMasMovimientos, getCuentasConMasMovimientos);

export default router;