const db = require('../models');

const ProductoPedido = db.ProductoPedido;
const Pedido = db.Pedido;
const Inventario = db.Inventario;

/**
 * Obtener los productos de un pedido específico (solo para administradores o el cliente que realizó el pedido).
 */
exports.obtenerProductosDePedido = async (req, res) => {
    const { idPedido } = req.params;

    try {
        const pedido = await Pedido.findByPk(idPedido, {
            include: [
                {
                    model: ProductoPedido,
                    include: {
                        model: Inventario,
                        attributes: ['idProducto', 'nombreProducto', 'rutaImagen'],
                    },
                },
                {
                    model: Miembro,
                    attributes: ['idMiembro'],
                },
            ],
        });

        if (!pedido) {
            return res.status(404).json({ msg: 'Pedido no encontrado.' });
        }

        // Verificar permisos: el cliente que hizo el pedido o un administrador
        if (
            req.usuario.tipoCuenta !== 'Administrador' &&
            pedido.Miembro.idMiembro !== req.usuario.idMiembro
        ) {
            return res.status(403).json({ msg: 'No tiene permiso para ver este pedido.' });
        }

        res.status(200).json({
            msg: 'Productos del pedido obtenidos exitosamente.',
            productos: pedido.ProductoPedidos,
        });
    } catch (error) {
        console.error(`Error en obtenerProductosDePedido: ${error.message}`, error);
        res.status(500).json({
            msg: 'Error interno al obtener los productos del pedido.',
        });
    }
};
