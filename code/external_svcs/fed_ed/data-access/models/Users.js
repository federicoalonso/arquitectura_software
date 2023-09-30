const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define(
    "User",
    {
      email: {
        type: DataTypes.STRING(45),
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: "Users",
      timestamps: true,
    }
  );

  return User;
};
