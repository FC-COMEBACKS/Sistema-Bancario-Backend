import { Router } from "express";
import {
  crearProductoServicio,
  getProductosServicios,
  getProductoServicioById,
  updateProductoServicio,
  cambiarDisponibilidad,
  deleteProductoServicio,
} from "./productoServicio.controller.js";
import {
  crearProductoServicioValidator,
  getProductosServiciosValidator,
  getProductoServicioByIdValidator,
  updateProductoServicioValidator,
  cambiarDisponibilidadValidator,
  deleteProductoServicioValidator,
} from "../middlewares/productoServicio-validator.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductoServicio:
 *       type: object
 *       required:
 *         - nombre
 *         - tipo
 *         - precio
 *         - descripcion
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del producto o servicio
 *           example: "60b5d8f5c8a2c20015a8b1a1"
 *         nombre:
 *           type: string
 *           description: Nombre del producto o servicio
 *           example: "Cuenta de Ahorros Premium"
 *         tipo:
 *           type: string
 *           enum: [PRODUCTO, SERVICIO]
 *           description: Tipo de elemento (Producto o Servicio)
 *           example: "PRODUCTO"
 *         precio:
 *           type: number
 *           minimum: 0
 *           description: Precio del producto o servicio
 *           example: 150.50
 *         descripcion:
 *           type: string
 *           description: Descripción detallada
 *           example: "Cuenta de ahorros con beneficios premium y sin comisiones"
 *         disponible:
 *           type: boolean
 *           description: Estado de disponibilidad
 *           example: true
 *         fechaCreacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         fechaActualizacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     ProductoServicioInput:
 *       type: object
 *       required:
 *         - nombre
 *         - tipo
 *         - precio
 *         - descripcion
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Nombre del producto o servicio
 *           example: "Cuenta de Ahorros Premium"
 *         tipo:
 *           type: string
 *           enum: [PRODUCTO, SERVICIO]
 *           description: Tipo de elemento
 *           example: "PRODUCTO"
 *         precio:
 *           type: number
 *           minimum: 0
 *           description: Precio del producto o servicio
 *           example: 150.50
 *         descripcion:
 *           type: string
 *           minLength: 10
 *           maxLength: 500
 *           description: Descripción detallada
 *           example: "Cuenta de ahorros con beneficios premium"
 *     DisponibilidadInput:
 *       type: object
 *       required:
 *         - disponible
 *       properties:
 *         disponible:
 *           type: boolean
 *           description: Nuevo estado de disponibilidad
 *           example: false
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensaje de error
 *         details:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/productosServicios/agregarProductoOServicio:
 *   post:
 *     summary: Crear un nuevo producto o servicio
 *     description: Permite a administradores y empleados crear nuevos productos o servicios bancarios
 *     tags: [Productos y Servicios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoServicioInput'
 *           examples:
 *             producto:
 *               summary: Ejemplo de producto
 *               value:
 *                 nombre: "Tarjeta de Crédito Oro"
 *                 tipo: "PRODUCTO"
 *                 precio: 200.00
 *                 descripcion: "Tarjeta de crédito con beneficios exclusivos y límite alto"
 *             servicio:
 *               summary: Ejemplo de servicio
 *               value:
 *                 nombre: "Asesoría Financiera Personal"
 *                 tipo: "SERVICIO"
 *                 precio: 75.00
 *                 descripcion: "Consultoría personalizada para planificación financiera"
 *     responses:
 *       201:
 *         description: Producto o servicio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto/Servicio creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/ProductoServicio'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Datos de entrada inválidos"
 *               details:
 *                 - field: "nombre"
 *                   message: "El nombre debe tener al menos 3 caracteres"
 *                 - field: "precio"
 *                   message: "El precio debe ser mayor a 0"
 *       401:
 *         description: Token de autenticación faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token de acceso requerido"
 *       403:
 *         description: Permisos insuficientes (solo ADMIN y EMPLEADO)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Acceso denegado. Permisos insuficientes"
 *       409:
 *         description: Producto o servicio ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Ya existe un producto/servicio con ese nombre"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error interno del servidor"
 */
router.post(
  "/agregarProductoOServicio",
  crearProductoServicioValidator,
  crearProductoServicio
);

/**
 * @swagger
 * /api/productosServicios/listarProductoOServicio:
 *   get:
 *     summary: Obtener lista de productos y servicios
 *     description: Permite a todos los roles obtener la lista de productos y servicios disponibles con filtros opcionales
 *     tags: [Productos y Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [PRODUCTO, SERVICIO]
 *         description: Filtrar por tipo de elemento
 *         example: "PRODUCTO"
 *       - in: query
 *         name: disponible
 *         schema:
 *           type: boolean
 *         description: Filtrar por disponibilidad
 *         example: true
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Buscar por nombre (búsqueda parcial)
 *         example: "cuenta"
 *       - in: query
 *         name: precioMin
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio mínimo para filtrar
 *         example: 50
 *       - in: query
 *         name: precioMax
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio máximo para filtrar
 *         example: 500
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página para paginación
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Cantidad de elementos por página
 *         example: 10
 *     responses:
 *       200:
 *         description: Lista de productos y servicios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Productos y servicios obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductoServicio'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalItems:
 *                       type: integer
 *                       example: 48
 *                     hasNext:
 *                       type: boolean
 *                       example: true
 *                     hasPrev:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Parámetros de consulta inválidos"
 *               details:
 *                 - field: "precioMin"
 *                   message: "El precio mínimo debe ser mayor o igual a 0"
 *       401:
 *         description: Token de autenticación faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token de acceso requerido"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error interno del servidor"
 */
router.get(
  "/listarProductoOServicio",
  getProductosServiciosValidator,
  getProductosServicios
);

/**
 * @swagger
 * /api/productosServicios/listarProductoOServicio/{id}:
 *   get:
 *     summary: Obtener un producto o servicio por ID
 *     description: Permite a todos los roles obtener los detalles de un producto o servicio específico
 *     tags: [Productos y Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID único del producto o servicio (MongoDB ObjectId)
 *         example: "60b5d8f5c8a2c20015a8b1a1"
 *     responses:
 *       200:
 *         description: Producto o servicio encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto/Servicio encontrado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/ProductoServicio'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ID inválido"
 *               details:
 *                 - field: "id"
 *                   message: "El ID debe ser un ObjectId válido de MongoDB"
 *       401:
 *         description: Token de autenticación faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token de acceso requerido"
 *       404:
 *         description: Producto o servicio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Producto/Servicio no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error interno del servidor"
 */
router.get(
  "/listarProductoOServicio/:id",
  getProductoServicioByIdValidator,
  getProductoServicioById
);

/**
 * @swagger
 * /api/productosServicios/actualizarProductoOServicio/{id}:
 *   put:
 *     summary: Actualizar un producto o servicio completo
 *     description: Permite a administradores y empleados actualizar completamente un producto o servicio existente
 *     tags: [Productos y Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID único del producto o servicio a actualizar
 *         example: "60b5d8f5c8a2c20015a8b1a1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoServicioInput'
 *           example:
 *             nombre: "Cuenta de Ahorros Premium Plus"
 *             tipo: "PRODUCTO"
 *             precio: 175.00
 *             descripcion: "Cuenta de ahorros con beneficios premium mejorados y sin comisiones"
 *     responses:
 *       200:
 *         description: Producto o servicio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto/Servicio actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/ProductoServicio'
 *       400:
 *         description: Datos de entrada o ID inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Datos de entrada inválidos"
 *               details:
 *                 - field: "precio"
 *                   message: "El precio debe ser mayor a 0"
 *       401:
 *         description: Token de autenticación faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token de acceso requerido"
 *       403:
 *         description: Permisos insuficientes (solo ADMIN y EMPLEADO)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Acceso denegado. Permisos insuficientes"
 *       404:
 *         description: Producto o servicio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Producto/Servicio no encontrado"
 *       409:
 *         description: Conflicto con nombre existente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Ya existe otro producto/servicio con ese nombre"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error interno del servidor"
 */
router.put(
  "/actualizarProductoOServicio/:id",
  updateProductoServicioValidator,
  updateProductoServicio
);

/**
 * @swagger
 * /api/productosServicios/disponibilidad/{id}:
 *   patch:
 *     summary: Cambiar disponibilidad de un producto o servicio
 *     description: Permite a administradores y empleados cambiar únicamente el estado de disponibilidad de un producto o servicio
 *     tags: [Productos y Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID único del producto o servicio
 *         example: "60b5d8f5c8a2c20015a8b1a1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DisponibilidadInput'
 *           examples:
 *             activar:
 *               summary: Activar producto/servicio
 *               value:
 *                 disponible: true
 *             desactivar:
 *               summary: Desactivar producto/servicio
 *               value:
 *                 disponible: false
 *     responses:
 *       200:
 *         description: Disponibilidad actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Disponibilidad actualizada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/ProductoServicio'
 *       400:
 *         description: Datos de entrada o ID inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Datos de entrada inválidos"
 *               details:
 *                 - field: "disponible"
 *                   message: "El campo disponible debe ser un valor booleano"
 *       401:
 *         description: Token de autenticación faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token de acceso requerido"
 *       403:
 *         description: Permisos insuficientes (solo ADMIN y EMPLEADO)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Acceso denegado. Permisos insuficientes"
 *       404:
 *         description: Producto o servicio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Producto/Servicio no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error interno del servidor"
 */
router.patch(
  "/disponibilidad/:id",
  cambiarDisponibilidadValidator,
  cambiarDisponibilidad
);

/**
 * @swagger
 * /api/productosServicios/eliminarProductoOServicio/{id}:
 *   delete:
 *     summary: Eliminar un producto o servicio
 *     description: Permite únicamente a administradores eliminar permanentemente un producto o servicio del sistema
 *     tags: [Productos y Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID único del producto o servicio a eliminar
 *         example: "60b5d8f5c8a2c20015a8b1a1"
 *     responses:
 *       200:
 *         description: Producto o servicio eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto/Servicio eliminado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60b5d8f5c8a2c20015a8b1a1"
 *                     nombre:
 *                       type: string
 *                       example: "Cuenta de Ahorros Premium"
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ID inválido"
 *               details:
 *                 - field: "id"
 *                   message: "El ID debe ser un ObjectId válido de MongoDB"
 *       401:
 *         description: Token de autenticación faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token de acceso requerido"
 *       403:
 *         description: Permisos insuficientes (solo ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Acceso denegado. Solo administradores pueden eliminar productos/servicios"
 *       404:
 *         description: Producto o servicio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Producto/Servicio no encontrado"
 *       409:
 *         description: No se puede eliminar por dependencias
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "No se puede eliminar. Existen transacciones asociadas a este producto/servicio"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error interno del servidor"
 */
router.delete(
  "/eliminarProductoOServicio/:id",
  deleteProductoServicioValidator,
  deleteProductoServicio
);

export default router;