// routes/categoriaProducto.routes.js
module.exports = app => {
    const categoriaProductoController = require("../controllers/CategoriaProductoController.js");
    const { autenticarUsuario, esAdministrador } = require('../middlewares/authMiddleware');
    let router = require("express").Router();

    // Obtener todas las categorías de productos (accesible a todos)
    router.get('/', categoriaProductoController.obtenerCategorias);

    // Obtener una categoría de producto por su ID (accesible a todos)
    router.get('/:id', categoriaProductoController.obtenerCategoriaPorId);

    // Crear una nueva categoría de producto (solo administradores)
    router.post('/', autenticarUsuario, esAdministrador, categoriaProductoController.crearCategoria);

    // Actualizar una categoría de producto existente (solo administradores)
    router.put('/:id', autenticarUsuario, esAdministrador, categoriaProductoController.actualizarCategoria);

    // Eliminar una categoría de producto (solo administradores)
    router.delete('/:id', autenticarUsuario, esAdministrador, categoriaProductoController.eliminarCategoria);

    app.use('/categoriaProducto', router);
};
