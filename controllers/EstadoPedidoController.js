const db = require('../models');

const EstadoPedido = db.EstadoPedido;

/**
 * Obtener todos los estados de pedido.
 */
exports.obtenerEstadosPedido = async (req, res) => {
    try {
        const estados = await EstadoPedido.findAll({
            attributes: ['idEstadoPedido', 'nombreEstado'],
            order: [['idEstadoPedido', 'ASC']],
        });

        res.status(200).json({
            msg: 'Estados de pedido obtenidos exitosamente.',
            estados,
        });
    } catch (error) {
        console.error(`Error en obtenerEstadosPedido: ${error.message}`, error);
        res.status(500).json({
            msg: 'Error interno al obtener los estados de pedido.',
        });
    }
};

/**
 * Crear un nuevo estado de pedido.
 */
exports.crearEstadoPedido = async (req, res) => {
    const { nombreEstado } = req.body;

    if (!nombreEstado || nombreEstado.trim() === '') {
        return res.status(400).json({ msg: 'El nombre del estado es obligatorio.' });
    }

    try {
        // Verificar si el nombre del estado ya existe
        const estadoExistente = await EstadoPedido.findOne({ where: { nombreEstado } });

        if (estadoExistente) {
            return res.status(400).json({ msg: 'El estado de pedido ya existe.' });
        }

        const nuevoEstado = await EstadoPedido.create({ nombreEstado });

        res.status(201).json({
            msg: 'Estado de pedido creado exitosamente.',
            estado: nuevoEstado,
        });
    } catch (error) {
        console.error(`Error en crearEstadoPedido: ${error.message}`, error);
        res.status(500).json({
            msg: 'Error interno al crear el estado de pedido.',
        });
    }
};

/**
 * Actualizar un estado de pedido existente.
 */
exports.actualizarEstadoPedido = async (req, res) => {
    const { id } = req.params;
    const { nombreEstado } = req.body;

    if (!nombreEstado || nombreEstado.trim() === '') {
        return res.status(400).json({ msg: 'El nombre del estado es obligatorio.' });
    }

    try {
        const estado = await EstadoPedido.findByPk(id);

        if (!estado) {
            return res.status(404).json({ msg: 'Estado de pedido no encontrado.' });
        }

        // Verificar si el nuevo nombre ya existe en otro estado
        const estadoExistente = await EstadoPedido.findOne({
            where: {
                nombreEstado,
                idEstadoPedido: { [db.Sequelize.Op.ne]: id },
            },
        });

        if (estadoExistente) {
            return res.status(400).json({ msg: 'Ya existe otro estado con ese nombre.' });
        }

        estado.nombreEstado = nombreEstado;
        await estado.save();

        res.status(200).json({
            msg: 'Estado de pedido actualizado exitosamente.',
            estado,
        });
    } catch (error) {
        console.error(`Error en actualizarEstadoPedido: ${error.message}`, error);
        res.status(500).json({
            msg: 'Error interno al actualizar el estado de pedido.',
        });
    }
};

/**
 * Eliminar un estado de pedido.
 */
exports.eliminarEstadoPedido = async (req, res) => {
    const { id } = req.params;

    try {
        const estado = await EstadoPedido.findByPk(id);

        if (!estado) {
            return res.status(404).json({ msg: 'Estado de pedido no encontrado.' });
        }

        // Verificar si el estado está asociado a algún pedido
        const pedidosAsociados = await estado.countPedidos();

        if (pedidosAsociados > 0) {
            return res.status(400).json({
                msg: 'No se puede eliminar el estado porque está asociado a pedidos existentes.',
            });
        }

        await estado.destroy();

        res.status(200).json({ msg: 'Estado de pedido eliminado exitosamente.' });
    } catch (error) {
        console.error(`Error en eliminarEstadoPedido: ${error.message}`, error);
        res.status(500).json({
            msg: 'Error interno al eliminar el estado de pedido.',
        });
    }
};

/**
 * Obtener un estado de pedido por ID.
 */
exports.obtenerEstadoPedidoPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const estado = await EstadoPedido.findByPk(id, {
            attributes: ['idEstadoPedido', 'nombreEstado'],
        });

        if (!estado) {
            return res.status(404).json({ msg: 'Estado de pedido no encontrado.' });
        }

        res.status(200).json({
            msg: 'Estado de pedido obtenido exitosamente.',
            estado,
        });
    } catch (error) {
        console.error(`Error en obtenerEstadoPedidoPorId: ${error.message}`, error);
        res.status(500).json({
            msg: 'Error interno al obtener el estado de pedido.',
        });
    }
};
