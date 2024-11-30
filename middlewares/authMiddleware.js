// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'tu_clave_secreta'; // Deberías mover esto a una variable de entorno

/**
 * Middleware para autenticar al usuario mediante JWT.
 */
const autenticarUsuario = (req, res, next) => {
    // Obtener el token de los encabezados de la solicitud
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: 'No se proporcionó un token de autenticación.' });
    }

    try {
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, SECRET_KEY);

        // Almacenar la información del usuario en req.usuario
        req.usuario = decoded;

        // Continuar al siguiente middleware o ruta
        next();
    } catch (error) {
        return res.status(401).json({ msg: 'Token de autenticación inválido o expirado.' });
    }
};

/**
 * Middleware para verificar si el usuario autenticado es administrador.
 */
const esAdministrador = (req, res, next) => {
    // Verificar que la información del usuario esté presente
    if (!req.usuario) {
        return res.status(401).json({ msg: 'No autenticado.' });
    }

    // Verificar si el idTipoCuenta corresponde al rol de administrador (en este caso, se asume que el ID 1 es administrador)
    if (req.usuario.idTipoCuenta !== 1) { // Cambia '1' si el ID de administrador es diferente
        return res.status(403).json({ msg: 'Acceso denegado. Se requiere rol de administrador.' });
    }

    // Continuar al siguiente middleware o ruta
    next();
};

module.exports = {
    autenticarUsuario,
    esAdministrador,
};
