// routes/productoPedido.routes.js
module.exports = app => {
    const productoPedidoController = require('../controllers/ProductoPedidoController.js');
    const { autenticarUsuario } = require('../middlewares/authMiddleware');
    let router = require('express').Router();

    // Obtener los productos de un pedido específico (solo para administradores o el cliente que realizó el pedido)
    router.get('/:idPedido', autenticarUsuario, productoPedidoController.obtenerProductosDePedido);

    app.use('/productoPedido', router);
};
