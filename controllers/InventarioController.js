const db = require("../models");
const path = require('path');
const fs = require('fs');

const Inventario = db.Inventario;
const CategoriaProducto = db.CategoriaProducto;

/**
 * Obtener todos los productos.
 */
exports.obtenerProductos = async (req, res) => {
    try {
        const productos = await Inventario.findAll({
            attributes: ['idProducto', 'nombreProducto', 'precio', 'rutaImagen'],
            include: {
                model: CategoriaProducto,
                attributes: ['idCategoriaProducto', 'nombreCategoria']
            },
            order: [['nombreProducto', 'ASC']]
        });
        res.status(200).json(productos);
    } catch (error) {
        console.error(`Error en obtenerProductos: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al obtener los productos."
        });
    }
};

/**
 * Obtener productos por categoría.
 */
exports.obtenerProductosPorCategoria = async (req, res) => {
    const { idCategoria } = req.params;

    try {
        const categoria = await CategoriaProducto.findByPk(idCategoria);
        if (!categoria) {
            return res.status(404).json({ msg: "Categoría no encontrada." });
        }

        const productos = await Inventario.findAll({
            attributes: ['idProducto', 'nombreProducto', 'precio', 'rutaImagen'],
            where: { idCategoriaProducto: idCategoria },
            order: [['nombreProducto', 'ASC']]
        });

        res.status(200).json(productos);
    } catch (error) {
        console.error(`Error en obtenerProductosPorCategoria: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al obtener los productos por categoría."
        });
    }
};

/**
 * Obtener detalles de un producto.
 */
exports.obtenerProductoPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const producto = await Inventario.findByPk(id, {
            include: {
                model: CategoriaProducto,
                attributes: ['idCategoriaProducto', 'nombreCategoria']
            }
        });

        if (!producto) {
            return res.status(404).json({ msg: "Producto no encontrado." });
        }

        res.status(200).json(producto);
    } catch (error) {
        console.error(`Error en obtenerProductoPorId: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al obtener el producto."
        });
    }
};

/**
 * Crear un nuevo producto.
 */
exports.crearProducto = async (req, res) => {
    console.log("Inicio de creación de producto.");
    const {
        nombreProducto,
        descripcionProducto,
        precio,
        nivelStock,
        idCategoriaProducto
    } = req.body;

    console.log("Datos recibidos del cuerpo de la solicitud:", req.body);

    if (!nombreProducto || !descripcionProducto || !precio || !nivelStock || !idCategoriaProducto) {
        console.log("Error: Faltan campos obligatorios.");
        return res.status(400).json({ msg: "Todos los campos son obligatorios." });
    }

    let rutaImagen = null;

    if (req.files && req.files.rutaImagen) {
        const imagen = req.files.rutaImagen;
        console.log("Imagen recibida:", imagen.name);

        const extensionesPermitidas = /jpeg|jpg|png/;
        const extension = path.extname(imagen.name).toLowerCase();
        console.log("Extensión de la imagen:", extension);

        if (!extensionesPermitidas.test(extension)) {
            console.log("Error: Formato de imagen no permitido.");
            return res.status(400).json({ msg: "Formato de imagen no permitido. Solo JPEG, JPG y PNG." });
        }

        const nombreArchivo = `${Date.now()}_${imagen.name}`;
        rutaImagen = `/images/producto/${nombreArchivo}`;
        const rutaDestino = path.join(__dirname, '..', 'public', 'images', 'producto');
        console.log("Ruta destino para la imagen:", rutaDestino);

        // Asegurarse de que la carpeta existe usando mkdirSync de forma sincrónica
        try {
            fs.mkdirSync(rutaDestino, { recursive: true });
            console.log("Directorio creado o ya existente para la imagen.");
        } catch (err) {
            console.error(`Error al crear el directorio de la imagen: ${err.message}`);
            return res.status(500).json({ msg: "Error al preparar la carpeta de la imagen." });
        }

        // Mover la imagen a la carpeta destino
        try {
            await imagen.mv(path.join(rutaDestino, nombreArchivo));
            console.log("Imagen movida exitosamente a la ruta:", rutaImagen);
        } catch (err) {
            console.error(`Error al guardar la imagen: ${err.message}`);
            return res.status(500).json({ msg: "Error al guardar la imagen del producto." });
        }
    } else {
        console.log("No se proporcionó ninguna imagen en req.files.");
    }

    try {
        const categoria = await CategoriaProducto.findByPk(idCategoriaProducto);
        if (!categoria) {
            console.log("Error: Categoría no encontrada.");
            return res.status(404).json({ msg: "Categoría no encontrada." });
        }

        console.log("Creando producto en la base de datos con ruta de imagen:", rutaImagen);
        const nuevoProducto = await Inventario.create({
            nombreProducto,
            descripcionProducto,
            precio,
            nivelStock,
            rutaImagen,
            idCategoriaProducto
        });

        console.log("Producto creado exitosamente:", nuevoProducto);
        res.status(201).json({
            msg: "Producto creado exitosamente.",
            producto: nuevoProducto
        });
    } catch (error) {
        console.error(`Error en crearProducto: ${error.message}`);
        res.status(500).json({
            msg: "Error interno al crear el producto."
        });
    }
};

/**
 * Actualizar un producto existente.
 */
exports.actualizarProducto = async (req, res) => {
    console.log("Inicio de actualización de producto.");
    const { id } = req.params;
    const {
        nombreProducto,
        descripcionProducto,
        precio,
        nivelStock,
        idCategoriaProducto
    } = req.body;

    console.log("Datos recibidos del cuerpo de la solicitud:", req.body);

    try {
        const producto = await Inventario.findByPk(id);
        if (!producto) {
            console.log("Error: Producto no encontrado.");
            return res.status(404).json({ msg: "Producto no encontrado." });
        }

        if (idCategoriaProducto && idCategoriaProducto !== producto.idCategoriaProducto) {
            const categoria = await CategoriaProducto.findByPk(idCategoriaProducto);
            if (!categoria) {
                console.log("Error: Categoría no encontrada.");
                return res.status(404).json({ msg: "Categoría no encontrada." });
            }
            producto.idCategoriaProducto = idCategoriaProducto;
        }

        if (nombreProducto) producto.nombreProducto = nombreProducto;
        if (descripcionProducto) producto.descripcionProducto = descripcionProducto;
        if (precio) producto.precio = precio;
        if (nivelStock) producto.nivelStock = nivelStock;

        if (req.files && req.files.imagen) {
            const imagen = req.files.imagen;
            console.log("Nueva imagen recibida para actualizar:", imagen.name);

            const extensionesPermitidas = /jpeg|jpg|png/;
            const extension = path.extname(imagen.name).toLowerCase();

            if (!extensionesPermitidas.test(extension)) {
                console.log("Error: Formato de imagen no permitido en actualización.");
                return res.status(400).json({ msg: "Formato de imagen no permitido. Solo JPEG, JPG y PNG." });
            }

            if (producto.rutaImagen) {
                const rutaAnterior = path.join(__dirname, '..', 'public', producto.rutaImagen);
                try {
                    fs.unlinkSync(rutaAnterior);
                    console.log("Imagen anterior eliminada.");
                } catch (err) {
                    console.error(`Error al eliminar la imagen anterior: ${err.message}`, err);
                }
            }

            const nombreArchivo = `${Date.now()}_${imagen.name}`;
            const rutaDestino = path.join(__dirname, '..', 'public', 'images', 'producto');
            producto.rutaImagen = `/images/producto/${nombreArchivo}`;

            console.log("Ruta destino para la nueva imagen:", rutaDestino);

            try {
                // Crear el directorio de forma sincrónica si no existe
                fs.mkdirSync(rutaDestino, { recursive: true });
                console.log("Directorio creado o ya existente para la imagen actualizada.");

                // Mover la imagen a la carpeta destino
                await imagen.mv(path.join(rutaDestino, nombreArchivo));
                console.log("Nueva imagen movida exitosamente.");
            } catch (err) {
                console.error(`Error al guardar la imagen actualizada: ${err.message}`, err);
                return res.status(500).json({ msg: "Error al guardar la imagen del producto." });
            }
        } else {
            console.log("No se proporcionó ninguna nueva imagen para actualizar.");
        }

        await producto.save();
        console.log("Producto actualizado exitosamente:", producto);

        res.status(200).json({
            msg: "Producto actualizado exitosamente.",
            producto
        });
    } catch (error) {
        console.error(`Error en actualizarProducto: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al actualizar el producto."
        });
    }
};

/**
 * Eliminar un producto.
 */
exports.eliminarProducto = async (req, res) => {
    const { id } = req.params;

    try {
        const producto = await Inventario.findByPk(id);
        if (!producto) {
            return res.status(404).json({ msg: "Producto no encontrado." });
        }

        // Verificar si el producto está asociado a algún pedido
        const productoPedidos = await producto.countProductoPedidos();
        if (productoPedidos > 0) {
            return res.status(400).json({
                msg: "No se puede eliminar el producto porque está asociado a pedidos."
            });
        }

        // Eliminar la imagen asociada si existe
        if (producto.rutaImagen) {
            const rutaImagen = path.join(__dirname, '..', 'public', producto.rutaImagen);
            fs.unlink(rutaImagen, (err) => {
                if (err) console.error(`Error al eliminar la imagen: ${err.message}`, err);
            });
        }

        await producto.destroy();
        res.status(200).json({ msg: "Producto eliminado exitosamente." });
    } catch (error) {
        console.error(`Error en eliminarProducto: ${error.message}`, error);
        res.status(500).json({
            msg: "Error interno al eliminar el producto."
        });
    }
};
