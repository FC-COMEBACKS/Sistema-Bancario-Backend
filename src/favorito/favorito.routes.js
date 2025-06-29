import { Router } from "express";
import {
  agregarFavorito,
  getFavoritos,
  updateFavorito,
  deleteFavorito,
  transferirAFavorito,
} from "./favorito.controller.js";
import {
  agregarFavoritoValidator,
  getFavoritosValidator,
  updateFavoritoValidator,
  deleteFavoritoValidator,
  transferirAFavoritoValidator,
} from "../middlewares/favorito-validator.js";

const router = Router();

/**
 * @swagger
 * /HRB/v1/favoritos/agregarCuenta:
 *   post:
 *     summary: Agrega una cuenta a favoritos
 *     tags: [Favoritos]
 *     description: Permite agregar una cuenta bancaria a la lista de favoritos del usuario (solo para clientes)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numeroCuenta
 *               - alias
 *             properties:
 *               numeroCuenta:
 *                 type: string
 *                 description: Número de cuenta que se desea agregar a favoritos
 *                 example: "1234567890"
 *               alias:
 *                 type: string
 *                 description: Nombre descriptivo para identificar fácilmente la cuenta favorita
 *                 example: "Hermano"
 *     responses:
 *       201:
 *         description: Cuenta agregada a favoritos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Cuenta agregada a favoritos correctamente"
 *                 favorito:
 *                   type: object
 *                   properties:
 *                     fid:
 *                       type: string
 *                     usuario:
 *                       type: string
 *                     cuentaFavorita:
 *                       type: string
 *                     numeroCuenta:
 *                       type: string
 *                     alias:
 *                       type: string
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos inválidos o restricciones de negocio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "No puedes agregar tu propia cuenta a favoritos"
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
 *                   example: "La cuenta no existe"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Error al agregar la cuenta a favoritos"
 *     security:
 *       - bearerAuth: []
 */
router.post("/agregarCuenta", agregarFavoritoValidator, agregarFavorito);

/**
 * @swagger
 * /HRB/v1/favoritos:
 *   get:
 *     summary: Obtiene los favoritos del usuario
 *     tags: [Favoritos]
 *     description: Retorna un listado de todas las cuentas guardadas como favoritos por el usuario (solo para clientes)
 *     responses:
 *       200:
 *         description: Lista de favoritos obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favoritos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fid:
 *                         type: string
 *                       usuario:
 *                         type: string
 *                       cuentaFavorita:
 *                         type: object
 *                         properties:
 *                           cid:
 *                             type: string
 *                           numeroCuenta:
 *                             type: string
 *                           tipo:
 *                             type: string
 *                       numeroCuenta:
 *                         type: string
 *                       alias:
 *                         type: string
 *                       fechaCreacion:
 *                         type: string
 *                         format: date-time
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
 *                   example: "Error al obtener los favoritos"
 *     security:
 *       - bearerAuth: []
 */
router.get("/", getFavoritosValidator, getFavoritos);

/**
 * @swagger
 * /HRB/v1/favoritos/actualizarNombre/{id}:
 *   put:
 *     summary: Actualiza el alias de un favorito
 *     tags: [Favoritos]
 *     description: Permite cambiar el nombre personalizado (alias) de una cuenta favorita (solo para clientes)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del favorito a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alias
 *             properties:
 *               alias:
 *                 type: string
 *                 description: Nuevo alias para la cuenta favorita
 *                 example: "Primo Juan"
 *     responses:
 *       200:
 *         description: Favorito actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Favorito actualizado correctamente"
 *                 favorito:
 *                   type: object
 *                   properties:
 *                     fid:
 *                       type: string
 *                     alias:
 *                       type: string
 *       400:
 *         description: Datos inválidos o formato incorrecto
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
 *                   example: "No tienes permisos para realizar esta acción"
 *       404:
 *         description: Favorito no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Favorito no encontrado"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Error al actualizar el favorito"
 *     security:
 *       - bearerAuth: []
 */
router.put("/actualizarNombre/:id", updateFavoritoValidator, updateFavorito);

/**
 * @swagger
 * /HRB/v1/favoritos/eliminarFavorito/{id}:
 *   delete:
 *     summary: Elimina un favorito
 *     tags: [Favoritos]
 *     description: Permite eliminar una cuenta de la lista de favoritos del usuario (solo para clientes)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del favorito a eliminar
 *     responses:
 *       200:
 *         description: Favorito eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Favorito eliminado correctamente"
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
 *                   example: "No tienes permisos para realizar esta acción"
 *       404:
 *         description: Favorito no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Favorito no encontrado"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Error al eliminar el favorito"
 *     security:
 *       - bearerAuth: []
 */
router.delete("/eliminarFavorito/:id", deleteFavoritoValidator, deleteFavorito);

/**
 * @swagger
 * /HRB/v1/favoritos/transferir:
 *   post:
 *     summary: Realiza una transferencia a una cuenta favorita
 *     tags: [Favoritos]
 *     description: Permite transferir dinero de forma rápida a una cuenta guardada en favoritos (solo para clientes)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - favoritoId
 *               - monto
 *               - descripcion
 *             properties:
 *               favoritoId:
 *                 type: string
 *                 description: ID del favorito al que se desea transferir
 *                 example: "60d725b3e6b8a0c3f8b4567e"
 *               monto:
 *                 type: number
 *                 description: Cantidad a transferir (máximo Q2,000 por transacción)
 *                 example: 500
 *               descripcion:
 *                 type: string
 *                 description: Descripción o motivo de la transferencia
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
 *                   example: "Transferencia a favorito realizada con éxito"
 *                 origen:
 *                   type: string
 *                   example: "1234567890"
 *                 destino:
 *                   type: object
 *                   properties:
 *                     numeroCuenta:
 *                       type: string
 *                       example: "0987654321"
 *                     alias:
 *                       type: string
 *                       example: "Primo Juan"
 *                 monto:
 *                   type: number
 *                   example: 500
 *                 saldoActual:
 *                   type: number
 *                   example: 2500
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
 *         description: Favorito o cuenta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Favorito no encontrado o no tienes permisos para acceder a él"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Error al realizar la transferencia a favorito"
 *     security:
 *       - bearerAuth: []
 */
router.post("/transferir", transferirAFavoritoValidator, transferirAFavorito);

export default router;