// models/Pedido.js
module.exports = (sequelize, DataTypes) => {
    const Pedido = sequelize.define(
        'Pedido',
        {
            idPedido: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            fechaPedido: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            montoTotal: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            idMiembro: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            idEstadoPedido: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            direccionEnvio: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            ciudadEnvio: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            paisEnvio: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            codigoPostalEnvio: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
        },
        {
            tableName: 'Pedido',
            timestamps: false,
        }
    );

    return Pedido;
};
