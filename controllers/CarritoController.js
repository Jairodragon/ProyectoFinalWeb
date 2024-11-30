const db = require('../models');

const Carrito = db.Carrito;
const DetalleCarrito = db.DetalleCarrito;
const Inventario = db.Inventario;
const Miembro = db.Miembro;

/**
 * Obtener el carrito de compras del usuario autenticado.
 */
exports.obtenerCarrito = async (req, res) => {
    try {
        const carrito = await Carrito.findOne({
            where: { idMiembro: req.usuario.idMiembro },
            include: {
                model: DetalleCarrito,
                include: {
                    model: Inventario,
                    attributes: ['idProducto', 'nombreProducto', 'precio', 'rutaImagen'],
                },
            },
        });

        if (!carrito || carrito.DetalleCarritos.length === 0) {
            return res.status(200).json({
                msg: 'El carrito está vacío.',
                items: [],
            });
        }

        const items = carrito.DetalleCarritos.map((item) => ({
            idProducto: item.Inventario.idProducto,
            nombreProducto: item.Inventario.nombreProducto,
            precio: item.Inventario.precio,
            cantidad: item.cantidad,
            subtotal: item.Inventario.precio * item.cantidad,
            rutaImagen: item.Inventario.rutaImagen,
        }));

        res.status(200).json({
            msg: 'Carrito obtenido exitosamente.',
            items,
        });
    } catch (error) {
        console.error(`Error en obtenerCarrito: ${error.message}`, error);
        res.status(500).json({
            msg: 'Error interno al obtener el carrito de compras.',
        });
    }
};

/**
 * Agregar un producto al carrito de compras.
 */
exports.agregarProductoAlCarrito = async (req, res) => {
    const { idProducto } = req.params;
    console.log(idProducto)
    const { cantidad } = req.body;

    try {
        const producto = await Inventario.findByPk(idProducto);

        if (!producto) {
            return res.status(404).json({ msg: 'Producto no encontrado en el inventario.' });
        }

        let carrito = await Carrito.findOne({ where: { idMiembro: req.usuario.idMiembro } });

        if (!carrito) {
            carrito = await Carrito.create({ idMiembro: req.usuario.idMiembro });
        }

        let detalleCarrito = await DetalleCarrito.findOne({
            where: { idCarrito: carrito.idCarrito, idProducto },
        });

        if (detalleCarrito) {
            detalleCarrito.cantidad += cantidad || 1;
            await detalleCarrito.save();
        } else {
            await DetalleCarrito.create({
                idCarrito: carrito.idCarrito,
                idProducto,
                cantidad: cantidad || 1,
            });
        }

        res.status(200).json({ msg: 'Producto agregado al carrito exitosamente.' });
    } catch (error) {
        console.error(`Error en agregarProductoAlCarrito: ${error.message}`, error);
        res.status(500).json({
            msg: 'Error interno al agregar el producto al carrito.',
        });
    }
};

/**
 * Actualizar la cantidad de un producto en el carrito.
 */
exports.actualizarCantidadProducto = async (req, res) => {
    const { idProducto } = req.params;
    const { cantidad } = req.body;

    if (cantidad < 1) {
        return res.status(400).json({ msg: 'La cantidad debe ser al menos 1.' });
    }

    try {
        const carrito = await Carrito.findOne({ where: { idMiembro: req.usuario.idMiembro } });

        if (!carrito) {
            return res.status(404).json({ msg: 'Carrito no encontrado.' });
        }

        const detalleCarrito = await DetalleCarrito.findOne({
            where: { idCarrito: carrito.idCarrito, idProducto },
        });

        if (!detalleCarrito) {
            return res.status(404).json({ msg: 'Producto no encontrado en el carrito.' });
        }

        detalleCarrito.cantidad = cantidad;
        await detalleCarrito.save();

        res.status(200).json({ msg: 'Cantidad actualizada exitosamente.' });
    } catch (error) {
        console.error(`Error en actualizarCantidadProducto: ${error.message}`, error);
        res.status(500).json({
            msg: 'Error interno al actualizar la cantidad del producto.',
        });
    }
};

/**
 * Eliminar un producto del carrito.
 */
exports.eliminarProductoDelCarrito = async (req, res) => {
    const { idProducto } = req.params;

    try {
        const carrito = await Carrito.findOne({ where: { idMiembro: req.usuario.idMiembro } });

        if (!carrito) {
            return res.status(404).json({ msg: 'Carrito no encontrado.' });
        }

        const detalleCarrito = await DetalleCarrito.findOne({
            where: { idCarrito: carrito.idCarrito, idProducto },
        });

        if (!detalleCarrito) {
            return res.status(404).json({ msg: 'Producto no encontrado en el carrito.' });
        }

        await detalleCarrito.destroy();

        res.status(200).json({ msg: 'Producto eliminado del carrito exitosamente.' });
    } catch (error) {
        console.error(`Error en eliminarProductoDelCarrito: ${error.message}`, error);
        res.status(500).json({
            msg: 'Error interno al eliminar el producto del carrito.',
        });
    }
};

/**
 * Vaciar el carrito de compras.
 */
exports.vaciarCarrito = async (req, res) => {
    try {
        const carrito = await Carrito.findOne({ where: { idMiembro: req.usuario.idMiembro } });

        if (!carrito) {
            return res.status(404).json({ msg: 'Carrito no encontrado.' });
        }

        await DetalleCarrito.destroy({ where: { idCarrito: carrito.idCarrito } });

        res.status(200).json({ msg: 'Carrito vaciado exitosamente.' });
    } catch (error) {
        console.error(`Error en vaciarCarrito: ${error.message}`, error);
        res.status(500).json({
            msg: 'Error interno al vaciar el carrito.',
        });
    }
};
