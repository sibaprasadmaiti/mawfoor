module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "popupMessage",
      {
        storeId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        message: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        createdBy: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        tableName: "popupMessage",
        comment:"Popup Message Table",
      }
    );
  };