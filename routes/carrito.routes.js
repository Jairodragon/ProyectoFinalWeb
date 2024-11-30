// routes/carrito.routes.js
module.exports = app => {
    const carritoController = require('../controllers/CarritoController');
    const { autenticarUsuario } = require('../middlewares/authMiddleware');
    let router = require('express').Router();

    // Obtener el carrito de compras del usuario autenticado
    router.get('/', autenticarUsuario, carritoController.obtenerCarrito);

    // Agregar un producto al carrito
    router.post('/agregar/:idProducto', autenticarUsuario, carritoController.agregarProductoAlCarrito);

    // Actualizar la cantidad de un producto en el carrito
    router.put('/actualizar/:idProducto', autenticarUsuario, carritoController.actualizarCantidadProducto);

    // Eliminar un producto del carrito
    router.delete('/eliminar/:idProducto', autenticarUsuario, carritoController.eliminarProductoDelCarrito);

    // Vaciar el carrito de compras
    router.delete('/vaciar', autenticarUsuario, carritoController.vaciarCarrito);

    app.use('/carrito', router);
};
