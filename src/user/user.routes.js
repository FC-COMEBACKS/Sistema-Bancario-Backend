import { Router } from "express";
import { getUserById, getUsers, deleteUserAdmin, deleteUserClient, updatePassword, updateUserAdmin, updateUserUser, updateRole } from "./user.controller.js";
import { getUserByIdValidator, getUsersValidator, updateUserValidatorAdmin, updateUserValidatorClient, deleteUserValidatorAdmin, deleteUserValidatorClient, updatePasswordValidator, updateRoleValidator } from "../middlewares/user-validator.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del usuario
 *           example: "60b5d8f5c8a2c20015a8b1a1"
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *           example: "Juan Carlos"
 *         apellido:
 *           type: string
 *           description: Apellido del usuario
 *           example: "Pérez García"
 *         username:
 *           type: string
 *           description: Nombre de usuario único
 *           example: "jperez123"
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico único
 *           example: "juan.perez@email.com"
 *         telefono:
 *           type: string
 *           description: Número de teléfono
 *           example: "+502 5555-1234"
 *         direccion:
 *           type: string
 *           description: Dirección de residencia
 *           example: "Zona 1, Ciudad de Guatemala"
 *         dpi:
 *           type: string
 *           description: Número de DPI (Documento Personal de Identificación)
 *           example: "1234567890101"
 *         fechaNacimiento:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento
 *           example: "1990-05-15"
 *         role:
 *           type: string
 *           enum: [ADMIN, EMPLEADO, CLIENTE]
 *           description: Rol del usuario en el sistema
 *           example: "CLIENTE"
 *         estado:
 *           type: boolean
 *           description: Estado activo/inactivo del usuario
 *           example: true
 *         fechaCreacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del usuario
 *         fechaActualizacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     UserUpdateAdmin:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Nombre del usuario
 *           example: "Juan Carlos"
 *         apellido:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Apellido del usuario
 *           example: "Pérez García"
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico
 *           example: "juan.perez@email.com"
 *         telefono:
 *           type: string
 *           pattern: '^[\+]?[0-9\s\-]{8,20}$'
 *           description: Número de teléfono
 *           example: "+502 5555-1234"
 *         direccion:
 *           type: string
 *           minLength: 10
 *           maxLength: 200
 *           description: Dirección de residencia
 *           example: "Zona 1, Ciudad de Guatemala"
 *         estado:
 *           type: boolean
 *           description: Estado del usuario
 *           example: true
 *     UserUpdateClient:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Nombre del usuario
 *           example: "Juan Carlos"
 *         apellido:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Apellido del usuario
 *           example: "Pérez García"
 *         telefono:
 *           type: string
 *           pattern: '^[\+]?[0-9\s\-]{8,20}$'
 *           description: Número de teléfono
 *           example: "+502 5555-1234"
 *         direccion:
 *           type: string
 *           minLength: 10
 *           maxLength: 200
 *           description: Dirección de residencia
 *           example: "Zona 1, Ciudad de Guatemala"
 *     PasswordUpdate:
 *       type: object
 *       required:
 *         - passwordActual
 *         - passwordNuevo
 *         - confirmarPassword
 *       properties:
 *         passwordActual:
 *           type: string
 *           description: Contraseña actual del usuario
 *           example: "password123"
 *         passwordNuevo:
 *           type: string
 *           minLength: 8
 *           description: Nueva contraseña (mínimo 8 caracteres)
 *           example: "newPassword456"
 *         confirmarPassword:
 *           type: string
 *           description: Confirmación de la nueva contraseña
 *           example: "newPassword456"
 *     RoleUpdate:
 *       type: object
 *       required:
 *         - role
 *       properties:
 *         role:
 *           type: string
 *           enum: [ADMIN, EMPLEADO, CLIENTE]
 *           description: Nuevo rol para el usuario
 *           example: "EMPLEADO"
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
 * /api/users/{uid}:
 *   get:
 *     summary: Obtener usuario por ID
 *     description: Permite obtener la información de un usuario específico. Los clientes solo pueden ver su propia información, mientras que administradores y empleados pueden ver cualquier usuario.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID único del usuario (MongoDB ObjectId)
 *         example: "60b5d8f5c8a2c20015a8b1a1"
 *     responses:
 *       200:
 *         description: Usuario encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario encontrado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ID inválido"
 *               details:
 *                 - field: "uid"
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
 *         description: Acceso denegado (clientes solo pueden ver su propia información)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Acceso denegado. Solo puedes ver tu propia información"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error interno del servidor"
 */
router.get("/:uid", getUserByIdValidator, getUserById);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener lista de usuarios
 *     description: Permite a administradores y empleados obtener la lista de usuarios con filtros opcionales. Los clientes no tienen acceso a este endpoint.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, EMPLEADO, CLIENTE]
 *         description: Filtrar por rol de usuario
 *         example: "CLIENTE"
 *       - in: query
 *         name: estado
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo
 *         example: true
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Buscar por nombre (búsqueda parcial)
 *         example: "juan"
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Buscar por email (búsqueda parcial)
 *         example: "gmail.com"
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
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuarios obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
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
 *                 - field: "role"
 *                   message: "El rol debe ser ADMIN, EMPLEADO o CLIENTE"
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
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error interno del servidor"
 */
router.get("/", getUsersValidator, getUsers);

/**
 * @swagger
 * /api/users/admin/{uid}:
 *   delete:
 *     summary: Eliminar usuario (Administrador)
 *     description: Permite únicamente a administradores eliminar cualquier usuario del sistema. No se puede eliminar el último administrador activo.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID único del usuario a eliminar
 *         example: "60b5d8f5c8a2c20015a8b1a1"
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60b5d8f5c8a2c20015a8b1a1"
 *                     username:
 *                       type: string
 *                       example: "jperez123"
 *                     email:
 *                       type: string
 *                       example: "juan.perez@email.com"
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ID inválido"
 *               details:
 *                 - field: "uid"
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
 *               error: "Acceso denegado. Solo administradores pueden eliminar usuarios"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Usuario no encontrado"
 *       409:
 *         description: No se puede eliminar (último admin activo o tiene dependencias)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               ultimo_admin:
 *                 value:
 *                   error: "No se puede eliminar el último administrador activo del sistema"
 *               dependencias:
 *                 value:
 *                   error: "No se puede eliminar. El usuario tiene transacciones o cuentas asociadas"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error interno del servidor"
 */
router.delete("/admin/:uid", deleteUserValidatorAdmin, deleteUserAdmin);

/**
 * @swagger
 * /api/users/client:
 *   delete:
 *     summary: Eliminar cuenta propia (Cliente)
 *     description: Permite a clientes eliminar su propia cuenta del sistema. Requiere confirmación de contraseña por seguridad.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: Contraseña actual para confirmar eliminación
 *                 example: "miPassword123"
 *           example:
 *             password: "miPassword123"
 *     responses:
 *       200:
 *         description: Cuenta eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cuenta eliminada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60b5d8f5c8a2c20015a8b1a1"
 *                     email:
 *                       type: string
 *                       example: "juan.perez@email.com"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Datos de entrada inválidos"
 *               details:
 *                 - field: "password"
 *                   message: "La contraseña es requerida"
 *       401:
 *         description: Token de autenticación faltante o contraseña incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               token_faltante:
 *                 value:
 *                   error: "Token de acceso requerido"
 *               password_incorrecta:
 *                 value:
 *                   error: "Contraseña incorrecta"
 *       403:
 *         description: Acceso denegado (solo clientes pueden usar este endpoint)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Este endpoint solo está disponible para clientes"
 *       409:
 *         description: No se puede eliminar por dependencias activas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "No puedes eliminar tu cuenta. Tienes cuentas bancarias activas o transacciones pendientes"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error interno del servidor"
 */
router.delete("/client", deleteUserValidatorClient, deleteUserClient);

/**
 * @swagger
 * /api/users/password:
 *   patch:
 *     summary: Cambiar contraseña propia
 *     description: Permite a cualquier usuario autenticado cambiar su propia contraseña proporcionando la contraseña actual y la nueva.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordUpdate'
 *           example:
 *             passwordActual: "password123"
 *             passwordNuevo: "newSecurePassword456"
 *             confirmarPassword: "newSecurePassword456"
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contraseña actualizada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "60b5d8f5c8a2c20015a8b1a1"
 *                     fechaActualizacion:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validacion:
 *                 value:
 *                   error: "Datos de entrada inválidos"
 *                   details:
 *                     - field: "passwordNuevo"
 *                       message: "La nueva contraseña debe tener al menos 8 caracteres"
 *                     - field: "confirmarPassword"
 *                       message: "Las contraseñas no coinciden"
 *               password_igual:
 *                 value:
 *                   error: "La nueva contraseña debe ser diferente a la actual"
 *       401:
 *         description: Token de autenticación faltante o contraseña actual incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               token_faltante:
 *                 value:
 *                   error: "Token de acceso requerido"
 *               password_incorrecta:
 *                 value:
 *                   error: "La contraseña actual es incorrecta"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error interno del servidor"
 */
router.patch("/password", updatePasswordValidator, updatePassword);

/**
 * @swagger
 * /api/users/admin/{uid}:
 *   put:
 *     summary: Actualizar usuario (Administrador)
 *     description: Permite a administradores actualizar completamente la información de cualquier usuario, incluyendo cambios de estado y datos sensibles.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID único del usuario a actualizar
 *         example: "60b5d8f5c8a2c20015a8b1a1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateAdmin'
 *           example:
 *             nombre: "Juan Carlos"
 *             apellido: "Pérez García"
 *             email: "juan.perez.nuevo@email.com"
 *             telefono: "+502 5555-9876"
 *             direccion: "Zona 10, Ciudad de Guatemala, Guatemala"
 *             estado: true
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos de entrada o ID inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Datos de entrada inválidos"
 *               details:
 *                 - field: "email"
 *                   message: "El email debe tener un formato válido"
 *                 - field: "telefono"
 *                   message: "El teléfono debe tener un formato válido"
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
 *               error: "Acceso denegado. Solo administradores pueden actualizar usuarios"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Usuario no encontrado"
 *       409:
 *         description: Conflicto con datos únicos existentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "El email ya está registrado por otro usuario"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error interno del servidor"
 */
router.put("/admin/:uid", updateUserValidatorAdmin, updateUserAdmin);

/**
 * @swagger
 * /api/users/client:
 *   put:
 *     summary: Actualizar perfil propio (Cliente)
 *     description: Permite a cualquier usuario autenticado actualizar su propia información personal. No puede cambiar email, username, role o estado.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateClient'
 *           example:
 *             nombre: "Juan Carlos"
 *             apellido: "Pérez García"
 *             telefono: "+502 5555-9876"
 *             direccion: "Zona 10, Ciudad de Guatemala, Guatemala"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Perfil actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
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
 *                   message: "El nombre debe tener al menos 2 caracteres"
 *                 - field: "telefono"
 *                   message: "El teléfono debe tener un formato válido"
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
router.put("/client", updateUserValidatorClient, updateUserUser);

/**
 * @swagger
 * /api/users/role/{uid}:
 *   patch:
 *     summary: Cambiar rol de usuario
 *     description: Permite únicamente a administradores cambiar el rol de cualquier usuario en el sistema. No se puede cambiar el rol del último administrador activo.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID único del usuario cuyo rol se cambiará
 *         example: "60b5d8f5c8a2c20015a8b1a1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleUpdate'
 *           examples:
 *             promover_empleado:
 *               summary: Promover a empleado
 *               value:
 *                 role: "EMPLEADO"
 *             promover_admin:
 *               summary: Promover a administrador
 *               value:
 *                 role: "ADMIN"
 *             degradar_cliente:
 *               summary: Cambiar a cliente
 *               value:
 *                 role: "CLIENTE"
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rol actualizado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "60b5d8f5c8a2c20015a8b1a1"
 *                     rolAnterior:
 *                       type: string
 *                       example: "CLIENTE"
 *                     rolNuevo:
 *                       type: string
 *                       example: "EMPLEADO"
 *                     fechaActualizacion:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Datos de entrada o ID inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Datos de entrada inválidos"
 *               details:
 *                 - field: "role"
 *                   message: "El rol debe ser ADMIN, EMPLEADO o CLIENTE"
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
 *               error: "Acceso denegado. Solo administradores pueden cambiar roles"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Usuario no encontrado"
 *       409:
 *         description: No se puede cambiar el rol (último admin o rol igual)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               ultimo_admin:
 *                 value:
 *                   error: "No se puede cambiar el rol del último administrador activo"
 *               mismo_rol:
 *                 value:
 *                   error: "El usuario ya tiene el rol especificado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error interno del servidor"
 */
router.patch("/role/:uid", updateRoleValidator, updateRole);

export default router;
