// models/index.js
const dbConfig = require("../config/db.config.js");
const { Sequelize, DataTypes } = require("sequelize");

// Inicialización de Sequelize
const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        port: dbConfig.PORT,
        dialect: dbConfig.dialect,
    }
);

const db = {};

// Guardamos las instancias de Sequelize
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importamos los modelos
db.CategoriaProducto = require("./CategoriaProducto")(sequelize, DataTypes);
db.Inventario = require("./Inventario")(sequelize, DataTypes);
db.TipoCuenta = require("./TipoCuenta")(sequelize, DataTypes);
db.Ubicacion = require("./Ubicacion")(sequelize, DataTypes);
db.Miembro = require("./Miembro")(sequelize, DataTypes);
db.Carrito = require("./Carrito")(sequelize, DataTypes);
db.DetalleCarrito = require("./DetalleCarrito")(sequelize, DataTypes);
db.EstadoPedido = require("./EstadoPedido")(sequelize, DataTypes);
db.Pedido = require("./Pedido")(sequelize, DataTypes);
db.ProductoPedido = require("./ProductoPedido")(sequelize, DataTypes);

// Definir las relaciones entre los modelos

// CategoriaProducto - Inventario (Uno a Muchos)
db.CategoriaProducto.hasMany(db.Inventario, {
    foreignKey: 'idCategoriaProducto',
});
db.Inventario.belongsTo(db.CategoriaProducto, {
    foreignKey: 'idCategoriaProducto',
});

// Ubicacion - Miembro (Uno a Muchos)
db.Ubicacion.hasMany(db.Miembro, {
    foreignKey: 'idUbicacion',
});
db.Miembro.belongsTo(db.Ubicacion, {
    foreignKey: 'idUbicacion',
});

// TipoCuenta - Miembro (Uno a Muchos)
db.TipoCuenta.hasMany(db.Miembro, {
    foreignKey: 'idTipoCuenta',
});
db.Miembro.belongsTo(db.TipoCuenta, {
    foreignKey: 'idTipoCuenta',
});

// Miembro - Carrito (Uno a Uno)
db.Miembro.hasOne(db.Carrito, {
    foreignKey: 'idMiembro',
});
db.Carrito.belongsTo(db.Miembro, {
    foreignKey: 'idMiembro',
});

// Carrito - DetalleCarrito (Uno a Muchos)
db.Carrito.hasMany(db.DetalleCarrito, {
    foreignKey: 'idCarrito',
});
db.DetalleCarrito.belongsTo(db.Carrito, {
    foreignKey: 'idCarrito',
});

// Inventario - DetalleCarrito (Uno a Muchos)
db.Inventario.hasMany(db.DetalleCarrito, {
    foreignKey: 'idProducto',
});
db.DetalleCarrito.belongsTo(db.Inventario, {
    foreignKey: 'idProducto',
});

// Miembro - Pedido (Uno a Muchos)
db.Miembro.hasMany(db.Pedido, {
    foreignKey: 'idMiembro',
});
db.Pedido.belongsTo(db.Miembro, {
    foreignKey: 'idMiembro',
});

// EstadoPedido - Pedido (Uno a Muchos)
db.EstadoPedido.hasMany(db.Pedido, {
    foreignKey: 'idEstadoPedido',
});
db.Pedido.belongsTo(db.EstadoPedido, {
    foreignKey: 'idEstadoPedido',
});

// Pedido - ProductoPedido (Uno a Muchos)
db.Pedido.hasMany(db.ProductoPedido, {
    foreignKey: 'idPedido',
});
db.ProductoPedido.belongsTo(db.Pedido, {
    foreignKey: 'idPedido',
});

// Inventario - ProductoPedido (Uno a Muchos)
db.Inventario.hasMany(db.ProductoPedido, {
    foreignKey: 'idProducto',
});
db.ProductoPedido.belongsTo(db.Inventario, {
    foreignKey: 'idProducto',
});

module.exports = db;
