const db = require("../models");
const { Op } = require("sequelize");

const CategoriaProducto = db.CategoriaProducto;

/**
 * Obtener todas las categorías de productos.
 */
exports.obtenerCategorias = async (req, res) => {
    try {
        const categorias = await CategoriaProducto.findAll({
            attributes: ['idCategoriaProducto', 'nombreCategoria'],
            order: [['nombreCategoria', 'ASC']]
        });
        res.status(200).json(categorias);
    } catch (error) {
        console.error(`Error en obtenerCategorias: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al obtener las categorías de productos."
        });
    }
};

/**
 * Obtener una categoría de producto por su ID.
 */
exports.obtenerCategoriaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const categoria = await CategoriaProducto.findByPk(id, {
            attributes: ['idCategoriaProducto', 'nombreCategoria']
        });

        if (!categoria) {
            return res.status(404).json({ msg: "Categoría no encontrada." });
        }

        res.status(200).json(categoria);
    } catch (error) {
        console.error(`Error en obtenerCategoriaPorId: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al obtener la categoría de producto."
        });
    }
};

/**
 * Crear una nueva categoría de producto.
 */
exports.crearCategoria = async (req, res) => {
    const { nombreCategoria } = req.body;

    if (!nombreCategoria) {
        return res.status(400).json({ msg: "El nombre de la categoría es obligatorio." });
    }

    try {
        const nuevaCategoria = await CategoriaProducto.create({ nombreCategoria });
        res.status(201).json({
            msg: "Categoría creada exitosamente.",
            categoria: {
                idCategoriaProducto: nuevaCategoria.idCategoriaProducto,
                nombreCategoria: nuevaCategoria.nombreCategoria
            }
        });
    } catch (error) {
        console.error(`Error en crearCategoria: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al crear la categoría de producto."
        });
    }
};

/**
 * Actualizar una categoría de producto existente.
 */
exports.actualizarCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombreCategoria } = req.body;

    if (!nombreCategoria) {
        return res.status(400).json({ msg: "El nombre de la categoría es obligatorio." });
    }

    try {
        const categoria = await CategoriaProducto.findByPk(id);

        if (!categoria) {
            return res.status(404).json({ msg: "Categoría no encontrada." });
        }

        categoria.nombreCategoria = nombreCategoria;
        await categoria.save();

        res.status(200).json({
            msg: "Categoría actualizada exitosamente.",
            categoria: {
                idCategoriaProducto: categoria.idCategoriaProducto,
                nombreCategoria: categoria.nombreCategoria
            }
        });
    } catch (error) {
        console.error(`Error en actualizarCategoria: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al actualizar la categoría de producto."
        });
    }
};

/**
 * Eliminar una categoría de producto.
 */
exports.eliminarCategoria = async (req, res) => {
    const { id } = req.params;

    try {
        const categoria = await CategoriaProducto.findByPk(id);

        if (!categoria) {
            return res.status(404).json({ msg: "Categoría no encontrada." });
        }

        // Verificar si existen productos asociados a esta categoría
        const productosAsociados = await categoria.countInventarios();
        if (productosAsociados > 0) {
            return res.status(400).json({
                msg: "No se puede eliminar la categoría porque tiene productos asociados."
            });
        }

        await categoria.destroy();
        res.status(200).json({ msg: "Categoría eliminada exitosamente." });
    } catch (error) {
        console.error(`Error en eliminarCategoria: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al eliminar la categoría de producto."
        });
    }
};
