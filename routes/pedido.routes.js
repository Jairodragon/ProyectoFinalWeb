// routes/pedido.routes.js
module.exports = app => {
    const pedidoController = require('../controllers/PedidoController');
    const { autenticarUsuario, esAdministrador } = require('../middlewares/authMiddleware');
    let router = require('express').Router();

    // Registrar un nuevo pedido a partir del carrito de compras
    router.post('/', autenticarUsuario, pedidoController.crearPedido);

    // Obtener el listado de pedidos del cliente autenticado
    router.get('/mios', autenticarUsuario, pedidoController.obtenerPedidosCliente);

    // Obtener todos los pedidos (solo para administradores)
    router.get('/', autenticarUsuario, esAdministrador, pedidoController.obtenerTodosLosPedidos);

    // Actualizar el estado de un pedido (solo para administradores)
    router.put('/:id/estado', autenticarUsuario, esAdministrador, pedidoController.actualizarEstadoPedido);

    app.use('/pedido', router);
};
