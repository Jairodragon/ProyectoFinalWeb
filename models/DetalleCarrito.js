// models/DetalleCarrito.js
module.exports = (sequelize, DataTypes) => {
    const DetalleCarrito = sequelize.define(
        'DetalleCarrito',
        {
            idDetalleCarrito: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            idCarrito: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            idProducto: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            cantidad: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: 'DetalleCarrito',
            timestamps: false,
        }
    );

    return DetalleCarrito;
};
    