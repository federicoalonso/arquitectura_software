module.exports = function (sequelize, DataTypes) {
  const Events = sequelize.define(
    "Events",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },
      proveedor_email: {
        type: DataTypes.STRING(45),
        allowNull: false,
        references: {
          model: "Providers",
          key: "email",
        },
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      f_inicio: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      f_fin: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      imagen_min_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      imagen_prin_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      video_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      video_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      categoria: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tipo_aut: {
        type: DataTypes.STRING,
        defaultValue: "automatico",
      },
      autorizado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      evento_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "Events",
      timestamps: true,
    }
  );

  return Events;
};
