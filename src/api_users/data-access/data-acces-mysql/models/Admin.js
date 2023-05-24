const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "Admin",
    {
      adminId: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "Admins",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "adminId" }],
        },
        {
          name: "unq",
          using: "BTREE",
          fields: [{ name: "adminId" }, { name: "email" }],
        },
      ],
    }
  );
};
