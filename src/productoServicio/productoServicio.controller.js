import ProductoServicio from "./productoServicio.model.js";
import Movimiento from "../Movimiento/movimiento.model.js";

export const crearProductoServicio = async (req, res) => {
  try {
    const { nombre, descripcion, precio, disponible } = req.body;

    const existente = await ProductoServicio.findOne({ nombre });
    if (existente) {
      return res.status(400).json({
        msg: "Ya existe un producto o servicio con ese nombre",
      });
    }

    const nuevoProductoServicio = new ProductoServicio({
      nombre,
      descripcion,
      precio,
      disponible: disponible !== undefined ? disponible : true,
    });

    await nuevoProductoServicio.save();

    res.status(201).json({
      msg: "Producto o servicio creado correctamente",
      productoServicio: nuevoProductoServicio,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al crear el producto o servicio",
    });
  }
};

export const getProductosServicios = async (req, res) => {
  try {
    const { desde = 0, disponible } = req.query;

    const filtro =
      disponible !== undefined ? { disponible: disponible === "true" } : {};

    const [total, productos] = await Promise.all([
      ProductoServicio.countDocuments(filtro),
      ProductoServicio.find(filtro).skip(Number(desde)).sort({ nombre: 1 }),
    ]);

    res.json({
      total,
      productos,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener los productos y servicios",
    });
  }
};

export const getProductoServicioById = async (req, res) => {
  try {
    const { id } = req.params;

    const productoServicio = await ProductoServicio.findById(id);

    if (!productoServicio) {
      return res.status(404).json({
        msg: "Producto o servicio no encontrado",
      });
    }

    res.json({
      productoServicio,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener el producto o servicio",
    });
  }
};

export const updateProductoServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, disponible } = req.body;
    if (nombre) {
      const existente = await ProductoServicio.findOne({
        nombre,
        _id: { $ne: id },
      });

      if (existente) {
        return res.status(400).json({
          msg: "Ya existe otro producto o servicio con ese nombre",
        });
      }
    }

    const productoServicio = await ProductoServicio.findByIdAndUpdate(
      id,
      { nombre, descripcion, precio, disponible },
      { new: true }
    );

    if (!productoServicio) {
      return res.status(404).json({
        msg: "Producto o servicio no encontrado",
      });
    }

    res.json({
      msg: "Producto o servicio actualizado correctamente",
      productoServicio,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al actualizar el producto o servicio",
    });
  }
};

export const cambiarDisponibilidad = async (req, res) => {
  try {
    const { id } = req.params;

    const productoServicio = await ProductoServicio.findById(id);

    if (!productoServicio) {
      return res.status(404).json({
        msg: "Producto o servicio no encontrado",
      });
    }

    productoServicio.disponible = !productoServicio.disponible;

    await productoServicio.save();

    res.json({
      msg: `Producto o servicio ahora está ${
        productoServicio.disponible ? "disponible" : "no disponible"
      }`,
      productoServicio,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al cambiar la disponibilidad del producto o servicio",
    });
  }
};

export const deleteProductoServicio = async (req, res) => {
  try {
    const { id } = req.params;

    const movimientos = await Movimiento.find({ productoServicio: id });
    if (movimientos.length > 0) {
      return res.status(400).json({
        msg: "No se puede eliminar el producto o servicio porque ya ha sido usado en transacciones",
      });
    }

    const productoServicio = await ProductoServicio.findByIdAndDelete(id);

    if (!productoServicio) {
      return res.status(404).json({
        msg: "Producto o servicio no encontrado",
      });
    }

    res.json({
      msg: "Producto o servicio eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al eliminar el producto o servicio",
    });
  }
};