const db = require("../models");
const { Op } = require("sequelize");

const Ubicacion = db.Ubicacion;

/**
 * Obtener todas las ubicaciones.
 */
exports.obtenerUbicaciones = async (req, res) => {
    try {
        const ubicaciones = await Ubicacion.findAll({
            attributes: ['idUbicacion', 'direccion', 'ciudad', 'pais', 'codigoPostal'],
            order: [['ciudad', 'ASC']]
        });
        res.status(200).json(ubicaciones);
    } catch (error) {
        console.error(`Error en obtenerUbicaciones: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al obtener las ubicaciones."
        });
    }
};

/**
 * Obtener una ubicación por su ID.
 */
exports.obtenerUbicacionPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const ubicacion = await Ubicacion.findByPk(id, {
            attributes: ['idUbicacion', 'direccion', 'ciudad', 'pais', 'codigoPostal']
        });

        if (!ubicacion) {
            return res.status(404).json({ msg: "Ubicación no encontrada." });
        }

        res.status(200).json(ubicacion);
    } catch (error) {
        console.error(`Error en obtenerUbicacionPorId: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al obtener la ubicación."
        });
    }
};

/**
 * Crear una nueva ubicación.
 */
exports.crearUbicacion = async (req, res) => {
    const { direccion, ciudad, pais, codigoPostal } = req.body;

    // Validaciones básicas
    if (!direccion || !ciudad || !pais) {
        return res.status(400).json({ msg: "Los campos dirección, ciudad y país son obligatorios." });
    }

    try {
        const nuevaUbicacion = await Ubicacion.create({
            direccion,
            ciudad,
            pais,
            codigoPostal
        });

        res.status(201).json({
            msg: "Ubicación creada exitosamente.",
            ubicacion: nuevaUbicacion
        });
    } catch (error) {
        console.error(`Error en crearUbicacion: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al crear la ubicación."
        });
    }
};

/**
 * Actualizar una ubicación existente.
 */
exports.actualizarUbicacion = async (req, res) => {
    const { id } = req.params;
    const { direccion, ciudad, pais, codigoPostal } = req.body;

    try {
        const ubicacion = await Ubicacion.findByPk(id);
        if (!ubicacion) {
            return res.status(404).json({ msg: "Ubicación no encontrada." });
        }

        // Actualizar campos si fueron proporcionados
        if (direccion) ubicacion.direccion = direccion;
        if (ciudad) ubicacion.ciudad = ciudad;
        if (pais) ubicacion.pais = pais;
        if (codigoPostal) ubicacion.codigoPostal = codigoPostal;

        await ubicacion.save();

        res.status(200).json({
            msg: "Ubicación actualizada exitosamente.",
            ubicacion
        });
    } catch (error) {
        console.error(`Error en actualizarUbicacion: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al actualizar la ubicación."
        });
    }
};

/**
 * Eliminar una ubicación.
 */
exports.eliminarUbicacion = async (req, res) => {
    const { id } = req.params;

    try {
        const ubicacion = await Ubicacion.findByPk(id);

        if (!ubicacion) {
            return res.status(404).json({ msg: "Ubicación no encontrada." });
        }

        // Verificar si la ubicación está asociada a algún usuario o pedido
        const miembrosAsociados = await ubicacion.countMiembros();
        const pedidosAsociados = await ubicacion.countPedidos();

        if (miembrosAsociados > 0 || pedidosAsociados > 0) {
            return res.status(400).json({
                msg: "No se puede eliminar la ubicación porque está asociada a usuarios o pedidos."
            });
        }

        await ubicacion.destroy();
        res.status(200).json({ msg: "Ubicación eliminada exitosamente." });
    } catch (error) {
        console.error(`Error en eliminarUbicacion: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al eliminar la ubicación."
        });
    }
};
