// routes/miembro.routes.js
module.exports = app => {
    const miembroController = require('../controllers/MiembroController.js');
    const { autenticarUsuario, esAdministrador } = require('../middlewares/authMiddleware');
    let router = require('express').Router();

    // Registro de un nuevo cliente
    router.post('/registrar', miembroController.registrarCliente);

    // Autenticación de clientes y administradores
    router.post('/login', miembroController.autenticarMiembro);

    // Obtener información del miembro autenticado
    router.get('/perfil', autenticarUsuario, miembroController.obtenerMiembroAutenticado);

    // Obtener un miembro por ID (requiere autenticación de administrador)
   

    // Actualizar un miembro existente (propio perfil o por administrador)
    router.put('/:id', autenticarUsuario, miembroController.actualizarMiembro);

    router.get('/administradores', autenticarUsuario, esAdministrador, miembroController.obtenerAdministradores);

    router.get('/:id', autenticarUsuario, esAdministrador, miembroController.obtenerMiembroPorId);
    

    // Eliminar un miembro (requiere autenticación de administrador)
    router.delete('/:id', autenticarUsuario, esAdministrador, miembroController.eliminarMiembro);

    app.use('/miembro', router);
};
