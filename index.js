const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); // Importar path para manejar rutas
const fileUpload = require('express-fileupload');
const app = express();

// Middleware para parsear JSON y formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Configuración de CORS
var corsOptions = {
    origin: '*',
};
app.use(cors(corsOptions));

// Middleware para servir archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para manejo de archivos subidos
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // Limitar tamaño de archivos a 50MB
}));

app.get('/HistorialPedidos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/HistorialPedidos.html'));
});

// Sincronización de la base de datos
const db = require("./models");
db.sequelize.sync({
    // force: true // Descomentar si deseas recrear tablas
}).then(() => {
    console.log("Base de datos sincronizada");
}).catch((err) => {
    console.error("Error al sincronizar la base de datos:", err);
});

// Middleware para manejar errores de JSON
app.use(function (error, req, res, next) {
    if (error instanceof SyntaxError) {
        res.status(400).json({
            msg: 'Error en el JSON'
        });
    } else {
        next();
    }
});

// Rutas de la API
require("./routes")(app);

// Ruta para servir la página principal (index.html)
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public/index.html');
    console.log(`Intentando servir el archivo: ${indexPath}`); // Agregar log para depuración
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error("Error al servir index.html:", err);
            res.status(500).send("No se pudo cargar la página principal.");
        }
    });
});

// Ruta para servir el archivo admin.html
app.get('/admin', (req, res) => {
    const adminPath = path.join(__dirname, 'public/admin.html');
    console.log(`Intentando servir el archivo: ${adminPath}`); // Agregar log para depuración
    res.sendFile(adminPath, (err) => {
        if (err) {
            console.error("Error al servir admin.html:", err);
            res.status(500).send("No se pudo cargar la página de administración.");
        }
    });
});

// Ruta para manejar rutas inexistentes
app.use((req, res) => {
    console.warn(`Ruta no encontrada: ${req.url}`);
    res.status(404).send("Página no encontrada.");
});

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
