/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "orderItems",
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
        orderId: {
         type: DataTypes.INTEGER(11),
         allowNull: true,
        },
        productId:{
         type: DataTypes.INTEGER(11),
         allowNull: true,
        },
        configProductId:{
          type: DataTypes.INTEGER(11),
          allowNull: true,
        },
        parentsProductId:{
         type: DataTypes.INTEGER(11),
         allowNull: true,
        },
        name:{
         type: DataTypes.STRING(255),
         allowNull: true,
        },
        description:{
         type: DataTypes.TEXT(),
         allowNull: true,
        },
        weight:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        tax:{
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        qty:{
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        originalPrice:{
         type: DataTypes.DECIMAL(10,2),
         allowNull: true,
        },
        discountType:{
         type: DataTypes.STRING(30),
         allowNull: true,
        },
        discountPercent:{
         type: DataTypes.STRING(30),
         allowNull: true,
        },
        discounAamount:{
         type: DataTypes.DECIMAL(10,2),
         allowNull: true,
        },
        price:{
         type: DataTypes.DECIMAL(10,2),
         allowNull: true,
        },
        totalPrice:{
         type: DataTypes.DECIMAL(10,2),
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
        tableName: "orderItems",
        comment:"Order Items Table",
      }
    );
  };