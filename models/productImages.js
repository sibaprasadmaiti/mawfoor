/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "productImages",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      storeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      productId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      file: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      imageTitle: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      isVideo: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      isPrimary: {
        type: DataTypes.ENUM("Yes", "No"),
        allowNull: true,
        defaultValue: "No",
      },
      createdBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "productImages",
      comment:"Product Images Table",
    }
  );
};