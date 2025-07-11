import { Router } from "express";
import { crearCuenta, editarCuenta, getDetallesCuenta, getCuentas, getCuentaByUsuario, getCuentaById, getCuentaPorNumero } from "./cuenta.controller.js";
import { crearCuentaValidator, editarCuentaValidator, getCuentaByIdValidator, getCuentasValidator, getCuentaByUsuarioValidator, getCuentaPorNumeroValidator } from "../middlewares/cuenta-validator.js";

const router = Router();

/**
 * @swagger
 * /HRB/v1/cuentas/crearCuenta:
 *   post:
 *     summary: Crea una nueva cuenta bancaria
 *     tags: [Cuentas]
 *     description: Crea una nueva cuenta bancaria para un usuario existente (requiere rol ADMIN)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuarioId
 *               - tipo
 *               - saldoInicial
 *             properties:
 *               usuarioId:
 *                 type: string
 *                 description: ID del usuario al que pertenecerá la cuenta
 *                 example: "60d7258b4f5e8a18b4b3a1f2"
 *               tipo:
 *                 type: string
 *                 description: Tipo de cuenta (AHORRO, MONETARIA, etc.)
 *                 enum: ["AHORRO", "MONETARIA"]
 *                 example: "AHORRO"
 *               saldoInicial:
 *                 type: number
 *                 description: Saldo inicial de la cuenta (debe ser mayor a 0)
 *                 example: 1000
 *     responses:
 *       201:
 *         description: Cuenta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Cuenta creada con éxito"
 *                 cuenta:
 *                   type: object
 *                   properties:
 *                     cid:
 *                       type: string
 *                     numeroCuenta:
 *                       type: string
 *                     tipo:
 *                       type: string
 *                     saldo:
 *                       type: number
 *                     usuario:
 *                       type: string
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "El saldo inicial debe ser mayor a 0"
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
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Error al crear la cuenta"
 *     security:
 *       - bearerAuth: []
 */
router.post("/crearCuenta", crearCuentaValidator, crearCuenta);

/**
 * @swagger
 * /HRB/v1/cuentas/editarCuenta/{cid}:
 *   put:
 *     summary: Edita una cuenta existente
 *     tags: [Cuentas]
 *     description: Modifica los datos de una cuenta bancaria existente (requiere rol ADMIN)
 *     parameters:
 *       - in: path
 *         name: cid
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la cuenta a editar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: ["AHORRO", "MONETARIA"]
 *                 description: Tipo de cuenta
 *                 example: "MONETARIA"
 *               activa:
 *                 type: boolean
 *                 description: Estado de la cuenta (activa o inactiva)
 *                 example: true
 *     responses:
 *       200:
 *         description: Cuenta actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Cuenta actualizada con éxito"
 *                 cuenta:
 *                   type: object
 *                   properties:
 *                     cid:
 *                       type: string
 *                     numeroCuenta:
 *                       type: string
 *                     tipo:
 *                       type: string
 *                     saldo:
 *                       type: number
 *                     activa:
 *                       type: boolean
 *       400:
 *         description: Datos inválidos o formato incorrecto
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
 *                   example: "Error al actualizar la cuenta"
 *     security:
 *       - bearerAuth: []
 */
router.put("/editarCuenta/:cid", editarCuentaValidator, editarCuenta);

/**
 * @swagger
 * /HRB/v1/cuentas/detallesCuenta/{cid}:
 *   get:
 *     summary: Obtiene los detalles de una cuenta
 *     tags: [Cuentas]
 *     description: Retorna los detalles completos de una cuenta bancaria (el usuario debe ser propietario o administrador)
 *     parameters:
 *       - in: path
 *         name: cid
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la cuenta a consultar
 *     responses:
 *       200:
 *         description: Detalles de cuenta obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cuenta:
 *                   type: object
 *                   properties:
 *                     cid:
 *                       type: string
 *                     numeroCuenta:
 *                       type: string
 *                     tipo:
 *                       type: string
 *                     saldo:
 *                       type: number
 *                     ingresos:
 *                       type: number
 *                     egresos:
 *                       type: number
 *                     activa:
 *                       type: boolean
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                     usuario:
 *                       type: object
 *                       properties:
 *                         uid:
 *                           type: string
 *                         nombre:
 *                           type: string
 *                         username:
 *                           type: string
 *                     ultimosMovimientos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mid:
 *                             type: string
 *                           tipo:
 *                             type: string
 *                           monto:
 *                             type: number
 *                           fechaHora:
 *                             type: string
 *                             format: date-time
 *                           descripcion:
 *                             type: string
 *       400:
 *         description: Formato de ID inválido
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
 *                   example: "Error al obtener los detalles de la cuenta"
 *     security:
 *       - bearerAuth: []
 */
router.get("/detallesCuenta/:cid", getCuentaByIdValidator, getDetallesCuenta);

/**
 * @swagger
 * /HRB/v1/cuentas/{cid}:
 *   get:
 *     summary: Obtiene una cuenta por ID
 *     tags: [Cuentas]
 *     description: Retorna los datos básicos de una cuenta por su ID
 *     parameters:
 *       - in: path
 *         name: cid
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la cuenta a consultar
 *     responses:
 *       200:
 *         description: Cuenta encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 cuenta:
 *                   type: object
 *       404:
 *         description: Cuenta no encontrada
 *       403:
 *         description: Sin autorización
 *     security:
 *       - bearerAuth: []
 */
router.get("/:cid", getCuentaByIdValidator, getCuentaById);

/**
 * @swagger
 * /HRB/v1/cuentas/numero/{numeroCuenta}:
 *   get:
 *     summary: Obtiene una cuenta por número de cuenta
 *     tags: [Cuentas]
 *     description: Retorna los datos de una cuenta por su número
 *     parameters:
 *       - in: path
 *         name: numeroCuenta
 *         schema:
 *           type: string
 *         required: true
 *         description: Número de cuenta a consultar
 *     responses:
 *       200:
 *         description: Cuenta encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cuenta:
 *                   type: object
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
 *     security:
 *       - bearerAuth: []
 */
router.get("/numero/:numeroCuenta", getCuentaPorNumeroValidator, getCuentaPorNumero);

/**
 * @swagger
 * /HRB/v1/cuentas/usuario/{uid}:
 *   get:
 *     summary: Obtiene la cuenta de un usuario por su UID
 *     tags: [Cuentas]
 *     description: Retorna la cuenta asociada al usuario especificado
 *     parameters:
 *       - in: path
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: UID del usuario
 *     responses:
 *       200:
 *         description: Cuenta encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cuenta:
 *                   type: object
 *       404:
 *         description: Usuario no tiene cuenta asociada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Usuario no tiene cuenta asociada"
 *     security:
 *       - bearerAuth: []
 */
router.get("/cuentaUsuario/:uid", getCuentaByUsuarioValidator, getCuentaByUsuario);

/**
 * @swagger
 * /HRB/v1/cuentas:
 *   get:
 *     summary: Obtiene listado de cuentas
 *     tags: [Cuentas]
 *     description: Retorna un listado de cuentas según el rol del usuario (ADMIN ve todas, CLIENT solo las propias)
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número máximo de cuentas a retornar (por defecto 10)
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
 *           enum: [AHORRO, MONETARIA]
 *         description: Filtrar cuentas por tipo
 *       - in: query
 *         name: activa
 *         schema:
 *           type: boolean
 *         description: Filtrar cuentas por estado (activa/inactiva)
 *     responses:
 *       200:
 *         description: Listado de cuentas obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cuentas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       cid:
 *                         type: string
 *                       numeroCuenta:
 *                         type: string
 *                       tipo:
 *                         type: string
 *                       saldo:
 *                         type: number
 *                       activa:
 *                         type: boolean
 *                       fechaCreacion:
 *                         type: string
 *                         format: date-time
 *                       usuario:
 *                         type: object
 *                         properties:
 *                           uid:
 *                             type: string
 *                           nombre:
 *                             type: string
 *                           username:
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
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Error al obtener las cuentas"
 *     security:
 *       - bearerAuth: []
 */
router.get("/", getCuentasValidator, getCuentas);


export default router;