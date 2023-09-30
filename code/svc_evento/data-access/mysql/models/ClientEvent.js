module.exports = function (sequelize, DataTypes) {
  const ClientEvent = sequelize.define(
    "ClientEvent",
    {
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Events",
          key: "id",
        },
      },
      client_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "Clients",
          key: "id",
        },
      },
    },
    {
      tableName: "ClientEvent",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "event_id" }, { name: "client_email" }],
        },
      ],
    }
  );

  return ClientEvent;
};
