// routes/estadoPedido.routes.js
module.exports = app => {
    const estadoPedidoController = require('../controllers/EstadoPedidoController');
    const { autenticarUsuario, esAdministrador } = require('../middlewares/authMiddleware');
    let router = require('express').Router();

    // Obtener todos los estados de pedido (solo administradores)
    router.get('/', autenticarUsuario, esAdministrador, estadoPedidoController.obtenerEstadosPedido);

    // Crear un nuevo estado de pedido (solo administradores)
    router.post('/', autenticarUsuario, esAdministrador, estadoPedidoController.crearEstadoPedido);

    // Obtener un estado de pedido por ID (solo administradores)
    router.get('/:id', autenticarUsuario, esAdministrador, estadoPedidoController.obtenerEstadoPedidoPorId);

    // Actualizar un estado de pedido existente (solo administradores)
    router.put('/:id', autenticarUsuario, esAdministrador, estadoPedidoController.actualizarEstadoPedido);

    // Eliminar un estado de pedido (solo administradores)
    router.delete('/:id', autenticarUsuario, esAdministrador, estadoPedidoController.eliminarEstadoPedido);

    app.use('/estadoPedido', router);
};
