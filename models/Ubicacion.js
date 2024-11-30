// models/Ubicacion.js
module.exports = (sequelize, DataTypes) => {
    const Ubicacion = sequelize.define(
        'Ubicacion',
        {
            idUbicacion: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            direccion: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            ciudad: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            pais: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            codigoPostal: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
        },
        {
            tableName: 'Ubicacion',
            timestamps: false,
        }
    );

    return Ubicacion;
};
