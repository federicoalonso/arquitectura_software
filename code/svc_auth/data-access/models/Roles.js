module.exports = function (sequelize, DataTypes) {
  const Roles = sequelize.define(
    "Roles",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(45),
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "Roles",
      timestamps: true,
    }
  );

  return Roles;
};
