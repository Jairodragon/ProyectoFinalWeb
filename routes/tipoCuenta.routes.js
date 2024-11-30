// routes/tipoCuenta.routes.js
module.exports = app => {
    const tipoCuentaController = require("../controllers/TipoCuentaController.js");
    const { autenticarUsuario, esAdministrador } = require('../middlewares/authMiddleware');
    let router = require("express").Router();

    // Obtener todos los tipos de cuenta (requiere autenticación de administrador)
    router.get('/', autenticarUsuario, esAdministrador, tipoCuentaController.obtenerTiposCuenta);

    // Obtener un tipo de cuenta por su ID (requiere autenticación de administrador)
    router.get('/:id', autenticarUsuario, esAdministrador, tipoCuentaController.obtenerTipoCuentaPorId);

    // Crear un nuevo tipo de cuenta (requiere autenticación de administrador)
    router.post('/', autenticarUsuario, esAdministrador, tipoCuentaController.crearTipoCuenta);

    // Actualizar un tipo de cuenta existente (requiere autenticación de administrador)
    router.put('/:id', autenticarUsuario, esAdministrador, tipoCuentaController.actualizarTipoCuenta);

    // Eliminar un tipo de cuenta (requiere autenticación de administrador)
    router.delete('/:id', autenticarUsuario, esAdministrador, tipoCuentaController.eliminarTipoCuenta);

    app.use('/tipoCuenta', router);
};
