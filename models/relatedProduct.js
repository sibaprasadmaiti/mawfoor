/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "relatedProduct",
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
      selectedProductId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "relatedProduct",
      comment:"Related Products Table",
    }
  );
};