module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "Clients",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(45),
        allowNull: false,
        unique: true,
      },
      payment_method: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      nombre_completo: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      f_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      pais: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "Clients",
      timestamps: true,
    }
  );
};
