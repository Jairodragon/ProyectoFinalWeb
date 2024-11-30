// models/CategoriaProducto.js
module.exports = (sequelize, DataTypes) => {
    const CategoriaProducto = sequelize.define(
        'CategoriaProducto',
        {
            idCategoriaProducto: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nombreCategoria: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            tableName: 'CategoriaProducto',
            timestamps: false,
        }
    );

    return CategoriaProducto;
};
