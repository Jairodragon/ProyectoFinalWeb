// models/Inventario.js
module.exports = (sequelize, DataTypes) => {
    const Inventario = sequelize.define(
        'Inventario',
        {
            idProducto: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nombreProducto: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            descripcionProducto: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            precio: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            nivelStock: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            rutaImagen: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            idCategoriaProducto: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: 'Inventario',
            timestamps: false,
        }
    );

    return Inventario;
};
