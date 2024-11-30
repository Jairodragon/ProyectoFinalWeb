const db = require('../models');

const Pedido = db.Pedido;
const ProductoPedido = db.ProductoPedido;
const Inventario = db.Inventario;
const Miembro = db.Miembro;
const EstadoPedido = db.EstadoPedido;
const Carrito = db.Carrito;
const DetalleCarrito = db.DetalleCarrito;

/**
 * Registrar un nuevo pedido a partir del carrito de compras.
 */
exports.crearPedido = async (req, res) => {
    const {
        direccionEnvio,
        ciudadEnvio,
        paisEnvio,
        codigoPostalEnvio,
    } = req.body;

    if (!direccionEnvio || !ciudadEnvio || !paisEnvio) {
        return res.status(400).json({ msg: 'Los datos de envío son obligatorios.' });
    }

    try {
        // Obtener el carrito del usuario
        const carrito = await Carrito.findOne({
            where: { idMiembro: req.usuario.idMiembro },
            include: {
                model: DetalleCarrito,
                include: {
                    model: Inventario,
                    attributes: ['idProducto', 'nombreProducto', 'precio'],
                },
            },
        });

        if (!carrito || carrito.DetalleCarritos.length === 0) {
            return res.status(400).json({ msg: 'El carrito está vacío.' });
        }

        // Calcular el monto total
        let montoTotal = 0;
        const productosPedido = [];

        for (const detalle of carrito.DetalleCarritos) {
            const subtotal = detalle.cantidad * detalle.Inventario.precio;
            montoTotal += subtotal;

            productosPedido.push({
                idProducto: detalle.idProducto,
                cantidadOrdenada: detalle.cantidad,
                precioUnitario: detalle.Inventario.precio,
                totalLinea: subtotal,
            });
        }

        // Crear el pedido
        const pedido = await Pedido.create({
            idMiembro: req.usuario.idMiembro,
            idEstadoPedido: 2, // Asumiendo que 1 es "Pendiente"
            fechaPedido: new Date(),
            montoTotal,
            direccionEnvio,
            ciudadEnvio,
            paisEnvio,
            codigoPostalEnvio,
        });

        // Crear los registros en ProductoPedido
        for (const producto of productosPedido) {
            await ProductoPedido.create({
                idPedido: pedido.idPedido,
                idProducto: producto.idProducto,
                cantidadOrdenada: producto.cantidadOrdenada,
                precioUnitario: producto.precioUnitario,
                totalLinea: producto.totalLinea,
            });
        }

        // Vaciar el carrito
        await DetalleCarrito.destroy({ where: { idCarrito: carrito.idCarrito } });

        res.status(201).json({
            msg: 'Pedido creado exitosamente.',
            pedidoId: pedido.idPedido,
        });
    } catch (error) {
        console.error(`Error en crearPedido: ${error.message}`, error);
        res.status(500).json({
            msg: 'Error interno al crear el pedido.',
        });
    }
};

/**
 * Obtener el listado de pedidos del cliente autenticado.
 */
exports.obtenerPedidosCliente = async (req, res) => {
    try {
        const pedidos = await Pedido.findAll({
            where: { idMiembro: req.usuario.idMiembro },
            include: [
                {
                    model: EstadoPedido,
                    attributes: ['nombreEstado'],
                },
                {
                    model: ProductoPedido,
                    include: {
                        model: Inventario,
                        attributes: ['idProducto', 'nombreProducto', 'rutaImagen'],
                    },
                },
            ],
            order: [['fechaPedido', 'DESC']],
        });

        res.status(200).json({
            msg: 'Pedidos obtenidos exitosamente.',
            pedidos,
        });
    } catch (error) {
        console.error(`Error en obtenerPedidosCliente: ${error.message}`, error);
        res.status(500).json({
            msg: 'Error interno al obtener los pedidos.',
        });
    }
};

/**
 * Obtener todos los pedidos (solo para administradores).
 */
exports.obtenerTodosLosPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.findAll({
            include: [
                {
                    model: Miembro,
                    attributes: ['idMiembro', 'nombreUsuario', 'correoElectronico'],
                },
                {
                    model: EstadoPedido,
                    attributes: ['nombreEstado'],
                },
                {
                    model: ProductoPedido,
                    include: {
                        model: Inventario,
                        attributes: ['idProducto', 'nombreProducto', 'rutaImagen'],
                    },
                },
            ],
            order: [['fechaPedido', 'DESC']],
        });

        res.status(200).json({
            msg: 'Todos los pedidos obtenidos exitosamente.',
            pedidos,
        });
    } catch (error) {
        console.error(`Error en obtenerTodosLosPedidos: ${error.message}`, error);
        res.status(500).json({
            msg: 'Error interno al obtener los pedidos.',
        });
    }
};

/**
 * Actualizar el estado de un pedido (solo para administradores).
 */
exports.actualizarEstadoPedido = async (req, res) => {
    const { id } = req.params;
    const { idEstadoPedido } = req.body;

    try {
        const pedido = await Pedido.findByPk(id);

        if (!pedido) {
            return res.status(404).json({ msg: 'Pedido no encontrado.' });
        }

        // Verificar que el estado de pedido exista
        const estadoPedido = await EstadoPedido.findByPk(idEstadoPedido);

        if (!estadoPedido) {
            return res.status(400).json({ msg: 'Estado de pedido inválido.' });
        }

        pedido.idEstadoPedido = idEstadoPedido;
        await pedido.save();

        res.status(200).json({
            msg: 'Estado del pedido actualizado exitosamente.',
            pedido,
        });
    } catch (error) {
        console.error(`Error en actualizarEstadoPedido: ${error.message}`, error);
        res.status(500).json({
            msg: 'Error interno al actualizar el estado del pedido.',
        });
    }
};
