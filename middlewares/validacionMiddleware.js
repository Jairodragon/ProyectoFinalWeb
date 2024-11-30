// middlewares/validacionMiddleware.js
const { body, validationResult } = require('express-validator');

/**
 * Validaciones para el registro de usuarios.
 */
const validarRegistroUsuario = [
    body('nombreCompleto')
        .notEmpty().withMessage('El nombre completo es obligatorio.')
        .isLength({ min: 3 }).withMessage('El nombre completo debe tener al menos 3 caracteres.'),
    body('nombreUsuario')
        .notEmpty().withMessage('El nombre de usuario es obligatorio.')
        .isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres.'),
    body('correoElectronico')
        .notEmpty().withMessage('El correo electrónico es obligatorio.')
        .isEmail().withMessage('El correo electrónico no es válido.'),
    body('contrasena')
        .notEmpty().withMessage('La contraseña es obligatoria.')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
    (req, res, next) => {
        // Manejo de errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }
        next();
    },
];

module.exports = {
    validarRegistroUsuario,
};
