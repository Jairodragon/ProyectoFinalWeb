// routes/inventario.routes.js
module.exports = app => {
    const inventarioController = require('../controllers/InventarioController.js');
    const { autenticarUsuario, esAdministrador } = require('../middlewares/authMiddleware');
    const express = require('express');
    let router = express.Router();

    // Obtener todos los productos (accesible a todos)
    router.get('/', inventarioController.obtenerProductos);

    // Obtener productos por categoría (accesible a todos)
    router.get('/categoria/:idCategoria', inventarioController.obtenerProductosPorCategoria);

    // Obtener detalles de un producto (accesible a todos)
    router.get('/:id', inventarioController.obtenerProductoPorId);

    // Crear un nuevo producto (solo administradores)
    router.post('/', autenticarUsuario, esAdministrador, inventarioController.crearProducto);

    // Actualizar un producto existente (solo administradores)
    router.put('/:id', autenticarUsuario, esAdministrador, inventarioController.actualizarProducto);

    // Eliminar un producto (solo administradores)
    router.delete('/:id', autenticarUsuario, esAdministrador, inventarioController.eliminarProducto);

    app.use('/inventario', router);
};
