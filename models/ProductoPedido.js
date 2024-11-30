// models/ProductoPedido.js
module.exports = (sequelize, DataTypes) => {
    const ProductoPedido = sequelize.define(
        'ProductoPedido',
        {
            idProductoPedido: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            idPedido: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            idProducto: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            cantidadOrdenada: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            precioUnitario: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            totalLinea: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
        },
        {
            tableName: 'ProductoPedido',
            timestamps: false,
        }
    );

    return ProductoPedido;
};
