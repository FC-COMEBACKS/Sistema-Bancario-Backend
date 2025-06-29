import { hash, verify } from "argon2";
import Usuario from "./user.model.js";

export const getUserById = async (req, res) => {
  try {
    const { uid } = req.params;
    const usuarioAutenticado = req.usuario;

    const esAdmin = usuarioAutenticado.rol === "ADMIN";

    const esMismoUsuario = usuarioAutenticado._id.toString() === uid;

    if (!esAdmin && !esMismoUsuario) {
      return res.status(403).json({
        success: false,
        message:
          "No tiene autorización para acceder a la información de este usuario",
      });
    }

    const user = await Usuario.findById(uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener el usuario",
      error: err.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const usuario = req.usuario;

    if (usuario.rol !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message:
          "No tiene autorización para acceder al listado de usuarios. Esta función está limitada a administradores.",
      });
    }

    const query = { estado: "ACTIVO" };

    const [total, users] = await Promise.all([
      Usuario.countDocuments(query),
      Usuario.find(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener los usuarios",
      error: err.message,
    });
  }
};

export const deleteUserAdmin = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await Usuario.findByIdAndUpdate(
      uid,
      { estado: "INACTIVO" },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Usuario eliminado",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el usuario",
      error: err.message,
    });
  }
};

export const deleteUserClient = async (req, res) => {
  try {
    const { usuario } = req;

    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: "Usuario no proporcionado",
      });
    }

    const user = await Usuario.findByIdAndUpdate(
      usuario._id,
      { estado: "INACTIVO" },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Usuario eliminado",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el usuario",
      error: err.message,
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { usuario } = req;
    const { newPassword } = req.body;

    const user = await Usuario.findById(usuario._id);

    const isSamePassword = await verify(user.password, newPassword);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña no puede ser igual a la anterior",
      });
    }

    const encryptedPassword = await hash(newPassword);

    await Usuario.findByIdAndUpdate(
      usuario._id,
      { password: encryptedPassword },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar contraseña",
      error: err.message,
    });
  }
};

export const updateUserAdmin = async (req, res) => {
  try {
    const { uid } = req.params;
    const data = req.body;
    delete data.password;
    delete data.dpi;
    const updatedUser = await Usuario.findByIdAndUpdate(uid, data, {
      new: true,
    });
    return res.status(200).json({
      success: true,
      msg: "Usuario Actualizado",
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error al actualizar usuario",
      error: err.message,
    });
  }
};

export const updateUserUser = async (req, res) => {
  try {
    const { usuario } = req;
    const data = req.body;
    delete data.password;
    delete data.dpi;
    delete data.rol;
    const updatedUser = await Usuario.findByIdAndUpdate(usuario._id, data, {
      new: true,
    });
    return res.status(200).json({
      success: true,
      msg: "Usuario Actualizado",
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error al actualizar usuario",
      error: err.message,
    });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { uid } = req.params;
    const { newRole } = req.body;
    if (!["ADMIN", "CLIENT"].includes(newRole)) {
      return res.status(400).json({
        success: false,
        msg: "Rol no válido",
      });
    }
    const updatedUser = await Usuario.findByIdAndUpdate(
      uid,
      { rol: newRole },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      msg: "Rol actualizado",
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error al actualizar rol",
      error: err.message,
    });
  }
};