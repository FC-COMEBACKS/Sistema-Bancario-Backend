import ProductoServicio from "./productoServicio.model.js";
import Movimiento from "../Movimiento/movimiento.model.js";

export const crearProductoServicio = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock = 0, stockMinimo = 5, disponible } = req.body;
        
        const existente = await ProductoServicio.findOne({ nombre });
        if (existente) {
            return res.status(400).json({
                msg: "Ya existe un producto o servicio con ese nombre"
            });
        }
        
        const nuevoProductoServicio = new ProductoServicio({
            nombre,
            descripcion,
            precio,
            stock,
            stockMinimo,
            disponible: disponible !== undefined ? disponible : true
        });
        
        await nuevoProductoServicio.save();
        
        res.status(201).json({
            msg: "Producto o servicio creado correctamente",
            productoServicio: nuevoProductoServicio
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al crear el producto o servicio"
        });
    }
};

export const getProductosServicios = async (req, res) => {
    try {
        const { 
            desde = 0, 
            disponible, 
            nombre, 
            precioMin, 
            precioMax,
            page = 1,
            limit = 10
        } = req.query;
        
        const filtro = {};
        
        if (disponible !== undefined) {
            filtro.disponible = disponible === 'true';
        }
        

        if (nombre && nombre.trim()) {
            filtro.nombre = { $regex: nombre.trim(), $options: 'i' };
        }
        
        if (precioMin !== undefined || precioMax !== undefined) {
            filtro.precio = {};
            
            if (precioMin !== undefined && precioMin !== null && precioMin !== '') {
                const minPrice = parseFloat(precioMin);
                if (!isNaN(minPrice) && minPrice >= 0) {
                    filtro.precio.$gte = minPrice;
                }
            }
            
            if (precioMax !== undefined && precioMax !== null && precioMax !== '') {
                const maxPrice = parseFloat(precioMax);
                if (!isNaN(maxPrice) && maxPrice >= 0) {
                    filtro.precio.$lte = maxPrice;
                }
            }
            
            if (Object.keys(filtro.precio).length === 0) {
                delete filtro.precio;
            }
        }
        
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;
        
        const [total, productos] = await Promise.all([
            ProductoServicio.countDocuments(filtro),
            ProductoServicio.find(filtro)
                .skip(skip)
                .limit(limitNumber)
                .sort({ nombre: 1 })
        ]);
        
        const totalPages = Math.ceil(total / limitNumber);
        
        res.json({
            total,
            productos,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalItems: total,
                itemsPerPage: limitNumber,
                hasNext: pageNumber < totalPages,
                hasPrev: pageNumber > 1
            },
            filtros: {
                disponible: disponible !== undefined ? (disponible === 'true') : undefined,
                nombre: nombre || undefined,
                precioMin: precioMin ? parseFloat(precioMin) : undefined,
                precioMax: precioMax ? parseFloat(precioMax) : undefined,
                page: pageNumber,
                limit: limitNumber
            },
            filtroAplicado: filtro 
        });
    } catch (error) {
        console.error('Error al obtener productos y servicios:', error);
        res.status(500).json({
            msg: "Error al obtener los productos y servicios",
            error: error.message
        });
    }
};

export const getProductoServicioById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const productoServicio = await ProductoServicio.findById(id);
        
        if (!productoServicio) {
            return res.status(404).json({
                msg: "Producto o servicio no encontrado"
            });
        }
        
        res.json({
            productoServicio
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener el producto o servicio"
        });
    }
};

export const updateProductoServicio = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock, stockMinimo, disponible } = req.body;
        
        if (nombre) {
            const existente = await ProductoServicio.findOne({ 
                nombre, 
                _id: { $ne: id } 
            });
            
            if (existente) {
                return res.status(400).json({
                    msg: "Ya existe un producto o servicio con ese nombre"
                });
            }
        }
        
        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (descripcion !== undefined) updateData.descripcion = descripcion;
        if (precio !== undefined) updateData.precio = precio;
        if (stock !== undefined) updateData.stock = stock;
        if (stockMinimo !== undefined) updateData.stockMinimo = stockMinimo;
        if (disponible !== undefined) updateData.disponible = disponible;
        
        
        const productoServicio = await ProductoServicio.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        
        if (!productoServicio) {
            return res.status(404).json({
                msg: "Producto o servicio no encontrado"
            });
        }
        
        
        res.json({
            msg: "Producto o servicio actualizado correctamente",
            productoServicio
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({
            msg: "Error al actualizar el producto o servicio"
        });
    }
};

export const cambiarDisponibilidad = async (req, res) => {
    try {
        const { id } = req.params;
        
        const productoServicio = await ProductoServicio.findById(id);
        
        if (!productoServicio) {
            return res.status(404).json({
                msg: "Producto o servicio no encontrado"
            });
        }
        
        productoServicio.disponible = !productoServicio.disponible;
        
        await productoServicio.save();
        
        res.json({
            msg: `Producto o servicio ahora está ${productoServicio.disponible ? 'disponible' : 'no disponible'}`,
            productoServicio
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al cambiar la disponibilidad del producto o servicio"
        });
    }
};

export const deleteProductoServicio = async (req, res) => {
    try {
        const { id } = req.params;
        
        const movimientos = await Movimiento.find({ productoServicio: id });
        if (movimientos.length > 0) {
            return res.status(400).json({
                msg: "No se puede eliminar el producto o servicio porque ya ha sido usado en transacciones"
            });
        }
        
        const productoServicio = await ProductoServicio.findByIdAndDelete(id);
        
        if (!productoServicio) {
            return res.status(404).json({
                msg: "Producto o servicio no encontrado"
            });
        }
        
        res.json({
            msg: "Producto o servicio eliminado correctamente"
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al eliminar el producto o servicio"
        });
    }
};

export const getEstadisticasProductos = async (req, res) => {
    try {
        const [
            totalProductos,
            productosDisponibles,
            productosNoDisponibles,
            promedioPrecios,
            productoMasCaro,
            productoMasBarato
        ] = await Promise.all([
            ProductoServicio.countDocuments(),
            ProductoServicio.countDocuments({ disponible: true }),
            ProductoServicio.countDocuments({ disponible: false }),
            ProductoServicio.aggregate([
                { $group: { _id: null, promedio: { $avg: "$precio" } } }
            ]),
            ProductoServicio.findOne().sort({ precio: -1 }),
            ProductoServicio.findOne().sort({ precio: 1 })
        ]);

        res.json({
            estadisticas: {
                total: totalProductos,
                disponibles: productosDisponibles,
                noDisponibles: productosNoDisponibles,
                precioPromedio: promedioPrecios[0]?.promedio || 0,
                productoMasCaro,
                productoMasBarato
            }
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener estadísticas de productos"
        });
    }
};
