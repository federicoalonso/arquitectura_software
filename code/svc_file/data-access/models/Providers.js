module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "Providers",
    {
      providerId: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(45),
        allowNull: true,
        unique: true,
      },
      country: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(45),
        allowNull: false,
        unique: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 0),
        allowNull: false,
      },
      telephone: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      currencySymbol: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      currencyCode: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "Providers",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "providerId" }],
        } /*,
        {
          name: 'emailIndex',
          unique: true,
          using: 'BTREE',
          fields: ['email']
        },
        {
          name: 'nameIndex',
          using: 'BTREE',
          fields: ['name']
        }*/,
      ],
    }
  );
};
