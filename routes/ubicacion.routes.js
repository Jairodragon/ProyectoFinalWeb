// routes/ubicacion.routes.js
module.exports = app => {
    const ubicacionController = require("../controllers/UbicacionController.js");
    const { autenticarUsuario, esAdministrador } = require('../middlewares/authMiddleware');
    let router = require("express").Router();

    // Obtener todas las ubicaciones (requiere autenticación de administrador)
    router.get('/', autenticarUsuario, esAdministrador, ubicacionController.obtenerUbicaciones);

    // Obtener una ubicación por su ID (requiere autenticación de administrador)
    router.get('/:id', autenticarUsuario, esAdministrador, ubicacionController.obtenerUbicacionPorId);

    // Crear una nueva ubicación (requiere autenticación de administrador)
    router.post('/', autenticarUsuario, esAdministrador, ubicacionController.crearUbicacion);

    // Actualizar una ubicación existente (requiere autenticación de administrador)
    router.put('/:id', autenticarUsuario, esAdministrador, ubicacionController.actualizarUbicacion);

    // Eliminar una ubicación (requiere autenticación de administrador)
    router.delete('/:id', autenticarUsuario, esAdministrador, ubicacionController.eliminarUbicacion);

    app.use('/ubicacion', router);
};
