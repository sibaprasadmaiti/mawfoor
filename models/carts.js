/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "carts",
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
        customerId: {
         type: DataTypes.INTEGER(11),
         allowNull: true,
        },
        productId: {
         type: DataTypes.INTEGER(11),
         allowNull: true,
        },
        configProductId: {
         type: DataTypes.INTEGER(11),
         allowNull: true,
        },
        itemQuantity:{
         type: DataTypes.STRING(30),
         allowNull: true,
        },
        wrapId: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
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
        tableName: "carts",
        comment:"Carts Table",
      }
    );
  };