// routes/index.js
const path = require('path');

module.exports = app => {
    // Rutas para la API
    require('./carrito.routes')(app);
    require('./categoriaProducto.routes')(app);
    require('./estadoPedido.routes')(app);
    require('./inventario.routes')(app);
    require('./miembro.routes')(app);
    require('./pedido.routes')(app);
    require('./productoPedido.routes')(app);
    require('./tipoCuenta.routes')(app);
    require('./ubicacion.routes')(app);

    // Ruta para servir el archivo admin.html
    app.get('/admin', (req, res) => {
        console.log('Ruta /admin accesada');
        res.sendFile(path.join(__dirname, '../frontend/admin.html'));
    });
    
}
