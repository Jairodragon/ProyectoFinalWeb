// models/Carrito.js
module.exports = (sequelize, DataTypes) => {
    const Carrito = sequelize.define(
        'Carrito',
        {
            idCarrito: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            idMiembro: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            fechaCreacion: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'Carrito',
            timestamps: false,
        }
    );

    return Carrito;
};
