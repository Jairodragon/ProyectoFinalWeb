const db = require("../models");
const { Op } = require("sequelize");

const TipoCuenta = db.TipoCuenta;

/**
 * Obtener todos los tipos de cuenta.
 */
exports.obtenerTiposCuenta = async (req, res) => {
    try {
        const tiposCuenta = await TipoCuenta.findAll({
            attributes: ['idTipoCuenta', 'nombreTipoCuenta'],
            order: [['nombreTipoCuenta', 'ASC']]
        });
        res.status(200).json(tiposCuenta);
    } catch (error) {
        console.error(`Error en obtenerTiposCuenta: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al obtener los tipos de cuenta."
        });
    }
};

/**
 * Obtener un tipo de cuenta por su ID.
 */
exports.obtenerTipoCuentaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const tipoCuenta = await TipoCuenta.findByPk(id, {
            attributes: ['idTipoCuenta', 'nombreTipoCuenta']
        });

        if (!tipoCuenta) {
            return res.status(404).json({ msg: "Tipo de cuenta no encontrado." });
        }

        res.status(200).json(tipoCuenta);
    } catch (error) {
        console.error(`Error en obtenerTipoCuentaPorId: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al obtener el tipo de cuenta."
        });
    }
};

/**
 * Crear un nuevo tipo de cuenta.
 */
exports.crearTipoCuenta = async (req, res) => {
    const { nombreTipoCuenta } = req.body;

    if (!nombreTipoCuenta) {
        return res.status(400).json({ msg: "El nombre del tipo de cuenta es obligatorio." });
    }

    try {
        const nuevoTipoCuenta = await TipoCuenta.create({ nombreTipoCuenta });
        res.status(201).json({
            msg: "Tipo de cuenta creado exitosamente.",
            tipoCuenta: {
                idTipoCuenta: nuevoTipoCuenta.idTipoCuenta,
                nombreTipoCuenta: nuevoTipoCuenta.nombreTipoCuenta
            }
        });
    } catch (error) {
        console.error(`Error en crearTipoCuenta: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al crear el tipo de cuenta."
        });
    }
};

/**
 * Actualizar un tipo de cuenta existente.
 */
exports.actualizarTipoCuenta = async (req, res) => {
    const { id } = req.params;
    const { nombreTipoCuenta } = req.body;

    if (!nombreTipoCuenta) {
        return res.status(400).json({ msg: "El nombre del tipo de cuenta es obligatorio." });
    }

    try {
        const tipoCuenta = await TipoCuenta.findByPk(id);

        if (!tipoCuenta) {
            return res.status(404).json({ msg: "Tipo de cuenta no encontrado." });
        }

        tipoCuenta.nombreTipoCuenta = nombreTipoCuenta;
        await tipoCuenta.save();

        res.status(200).json({
            msg: "Tipo de cuenta actualizado exitosamente.",
            tipoCuenta: {
                idTipoCuenta: tipoCuenta.idTipoCuenta,
                nombreTipoCuenta: tipoCuenta.nombreTipoCuenta
            }
        });
    } catch (error) {
        console.error(`Error en actualizarTipoCuenta: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al actualizar el tipo de cuenta."
        });
    }
};

/**
 * Eliminar un tipo de cuenta.
 */
exports.eliminarTipoCuenta = async (req, res) => {
    const { id } = req.params;

    try {
        const tipoCuenta = await TipoCuenta.findByPk(id);

        if (!tipoCuenta) {
            return res.status(404).json({ msg: "Tipo de cuenta no encontrado." });
        }

        // Verificar si existen usuarios asociados a este tipo de cuenta
        const usuariosAsociados = await tipoCuenta.countMiembros();
        if (usuariosAsociados > 0) {
            return res.status(400).json({
                msg: "No se puede eliminar el tipo de cuenta porque tiene usuarios asociados."
            });
        }

        await tipoCuenta.destroy();
        res.status(200).json({ msg: "Tipo de cuenta eliminado exitosamente." });
    } catch (error) {
        console.error(`Error en eliminarTipoCuenta: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al eliminar el tipo de cuenta."
        });
    }
};
