// controllers/MiembroController.js
const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const Miembro = db.Miembro;
const TipoCuenta = db.TipoCuenta;

// Clave secreta para JWT (debería estar en un archivo de configuración)
const SECRET_KEY = "tu_clave_secreta"; // PONER CLAVE SECRETA AQUI

/**
 * Registro de un nuevo cliente.
 */
exports.registrarCliente = async (req, res) => {
    const {
        nombreCompleto,
        nombreUsuario,
        correoElectronico,
        contrasena,
        idUbicacion,
        idTipoCuenta,
    } = req.body;

    // Validaciones básicas
    if (!nombreCompleto || !nombreUsuario || !correoElectronico || !contrasena) {
        return res.status(400).json({ msg: "Todos los campos son obligatorios." });
    }

    // Validación de formato de correo electrónico
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(correoElectronico)) {
        return res.status(400).json({ msg: "El correo electrónico no es válido." });
    }

    // Validación de longitud mínima de contraseña
    if (contrasena.length < 6) {
        return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres." });
    }

    try {
        // Verificar si el nombre de usuario o correo electrónico ya existen
        const usuarioExistente = await Miembro.findOne({
            where: {
                [Op.or]: [
                    { nombreUsuario: nombreUsuario },
                    { correoElectronico: correoElectronico },
                ],
            },
        });

        if (usuarioExistente) {
            return res.status(400).json({
                msg: "El nombre de usuario o correo electrónico ya están registrados.",
            });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

        // Crear el nuevo cliente
        const nuevoMiembro = await Miembro.create({
            nombreCompleto,
            nombreUsuario,
            correoElectronico,
            contrasenaEncriptada,
            idUbicacion,
            idTipoCuenta
        });

        res.status(201).json({
            msg: "Cliente registrado exitosamente.",
            miembro: {
                idMiembro: nuevoMiembro.idMiembro,
                nombreCompleto: nuevoMiembro.nombreCompleto,
                nombreUsuario: nuevoMiembro.nombreUsuario,
                correoElectronico: nuevoMiembro.correoElectronico,
                fechaRegistro: nuevoMiembro.fechaRegistro,
                idDeUbicacion: nuevoMiembro.idUbicacion,
                tipoDeCuenta: nuevoMiembro.idTipoCuenta
            },
        });
    } catch (error) {
        console.error(`Error en registrarCliente: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al registrar el cliente.",
        });
    }
};

/**
 * Autenticación de clientes y administradores.
 */
exports.autenticarMiembro = async (req, res) => {
    const { nombreUsuario, correoElectronico, contrasena } = req.body;

    // Validar que se haya proporcionado el nombre de usuario o correo electrónico y la contraseña
    if ((!nombreUsuario && !correoElectronico) || !contrasena) {
        return res.status(400).json({
            msg: "Debe proporcionar nombre de usuario o correo electrónico y contraseña.",
        });
    }

    try {
        // Buscar al usuario por nombre de usuario o correo electrónico
        const miembro = await Miembro.findOne({
            where: {
                [Op.or]: [
                    { nombreUsuario: nombreUsuario || null },
                    { correoElectronico: correoElectronico || null },
                ],
            },
            include: {
                model: TipoCuenta,
                attributes: ["idTipoCuenta"],
            },
        });

        if (!miembro) {
            return res.status(401).json({ msg: "Credenciales inválidas." });
        }

        // Verificar la contraseña
        const esContrasenaValida = await bcrypt.compare(
            contrasena,
            miembro.contrasenaEncriptada
        );

        if (!esContrasenaValida) {
            return res.status(401).json({ msg: "Credenciales inválidas." });
        }

        // Crear el token JWT
        const payload = {
            idMiembro: miembro.idMiembro,
            nombreUsuario: miembro.nombreUsuario,
            idTipoCuenta: miembro.idTipoCuenta,
        };

        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });

        res.status(200).json({
            msg: "Autenticación exitosa.",
            token,
            miembro: {
                idMiembro: miembro.idMiembro,
                nombreCompleto: miembro.nombreCompleto,
                nombreUsuario: miembro.nombreUsuario,
                correoElectronico: miembro.correoElectronico,
                idDeUbicacion: miembro.idUbicacion,
                idTipoCuenta: miembro.idTipoCuenta,
            },
        });
    } catch (error) {
        console.error(`Error en autenticarMiembro: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al autenticar.",
        });
    }
};


/**
 * Obtener información del miembro autenticado.
 */
exports.obtenerMiembroAutenticado = async (req, res) => {
    try {
        const miembro = await Miembro.findByPk(req.usuario.idMiembro, {
            attributes: ["idMiembro", "nombreCompleto", "nombreUsuario", "correoElectronico"],
            include: {
                model: TipoCuenta,
                attributes: ["nombreTipoCuenta"],
            },
        });

        if (!miembro) {
            return res.status(404).json({ msg: "Usuario no encontrado." });
        }

        res.status(200).json({
            miembro: {
                idMiembro: miembro.idMiembro,
                nombreCompleto: miembro.nombreCompleto,
                nombreUsuario: miembro.nombreUsuario,
                correoElectronico: miembro.correoElectronico,
                idDeUbicacion: miembro.idUbicacion,
                tipoCuenta: miembro.TipoCuenta,
            },
        });
    } catch (error) {
        console.error(`Error en obtenerMiembroAutenticado: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al obtener la información del usuario.",
        });
    }
};


/**
 * Obtener un miembro por ID (requiere autenticación de administrador).
 */
exports.obtenerMiembroPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const miembro = await Miembro.findByPk(id, {
            attributes: ["idMiembro", "nombreCompleto", "nombreUsuario", "correoElectronico", "fechaRegistro"],
            include: [
                {
                    model: TipoCuenta,
                    attributes: ["nombreTipoCuenta"],
                },
                {
                    model: db.Ubicacion,
                    attributes: ["direccion", "ciudad", "pais", "codigoPostal"],
                }
            ],
        });

        if (!miembro) {
            return res.status(404).json({ msg: "Miembro no encontrado." });
        }

        res.status(200).json(miembro);
    } catch (error) {
        console.error(`Error en obtenerMiembroPorId: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al obtener el miembro.",
        });
    }
};

/**
 * Actualizar un miembro existente (propio perfil o por administrador).
 */
exports.actualizarMiembro = async (req, res) => {
    const { id } = req.params;
    const { nombreCompleto, contrasena } = req.body;

    try {
        // Verificar si el miembro existe
        const miembro = await Miembro.findByPk(id);

        if (!miembro) {
            return res.status(404).json({ msg: "Miembro no encontrado." });
        }

        // Verificar si el usuario tiene permiso para actualizar (propietario o administrador)
        if (req.usuario.idMiembro !== miembro.idMiembro && req.usuario.idTipoCuenta !== 1) {
            return res.status(403).json({ msg: "No tiene permiso para actualizar este miembro." });
        }

        // Actualizar datos personales
        if (nombreCompleto) miembro.nombreCompleto = nombreCompleto;

        // Actualizar contraseña si se proporciona
        if (contrasena) {
            if (contrasena.length < 6) {
                return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres." });
            }
            const salt = await bcrypt.genSalt(10);
            miembro.contrasenaEncriptada = await bcrypt.hash(contrasena, salt);
        }

        await miembro.save();

        res.status(200).json({
            msg: "Miembro actualizado exitosamente.",
            miembro: {
                idMiembro: miembro.idMiembro,
                nombreCompleto: miembro.nombreCompleto,
                nombreUsuario: miembro.nombreUsuario,
                correoElectronico: miembro.correoElectronico,
            },
        });
    } catch (error) {
        console.error(`Error en actualizarMiembro: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al actualizar el miembro.",
        });
    }
};

exports.obtenerAdministradores = async (req, res) => {
    try {
        console.log("Intentando obtener administradores...");
        const administradores = await Miembro.findAll({
            where: { idTipoCuenta: 1 }, // Filtrar por administradores
            attributes: ["idMiembro", "nombreCompleto", "nombreUsuario", "correoElectronico", "idUbicacion", "fechaRegistro"],
        });

        console.log("Administradores encontrados:", administradores);
        res.status(200).json(administradores);
    } catch (error) {
        console.error(`Error en obtenerAdministradores: ${error.message}`, error);
        res.status(500).json({ msg: "Error interno al obtener los administradores." });
    }
};


/**
 * Eliminar un miembro (requiere autenticación de administrador).
 */
exports.eliminarMiembro = async (req, res) => {
    const { id } = req.params;

    try {
        const miembro = await Miembro.findByPk(id);

        if (!miembro) {
            return res.status(404).json({ msg: "Miembro no encontrado." });
        }

        // Verificar si el usuario que realiza la eliminación es un administrador
        if (req.usuario.idTipoCuenta !== 1) {
            return res.status(403).json({ msg: "No tiene permiso para eliminar miembros." });
        }

        await miembro.destroy();
        res.status(200).json({ msg: "Miembro eliminado exitosamente." });
    } catch (error) {
        console.error(`Error en eliminarMiembro: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al eliminar el miembro.",
        });
    }
};
