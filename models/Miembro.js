// models/Miembro.js
module.exports = (sequelize, DataTypes) => {
    const Miembro = sequelize.define(
        'Miembro',
        {
            idMiembro: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nombreCompleto: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            nombreUsuario: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
            },
            correoElectronico: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            contrasenaEncriptada: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            fechaRegistro: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            idUbicacion: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            idTipoCuenta: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: 'Miembro',
            timestamps: false,
        }
    );

    return Miembro;
};
