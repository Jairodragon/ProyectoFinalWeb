// models/TipoCuenta.js
module.exports = (sequelize, DataTypes) => {
    const TipoCuenta = sequelize.define(
        'TipoCuenta',
        {
            idTipoCuenta: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nombreTipoCuenta: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
        },
        {
            tableName: 'TipoCuenta',
            timestamps: false,
        }
    );

    return TipoCuenta;
};
