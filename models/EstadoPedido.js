// models/EstadoPedido.js
module.exports = (sequelize, DataTypes) => {
    const EstadoPedido = sequelize.define(
        'EstadoPedido',
        {
            idEstadoPedido: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nombreEstado: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
        },
        {
            tableName: 'EstadoPedido',
            timestamps: false,
        }
    );

    return EstadoPedido;
};
