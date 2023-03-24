/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "orderStatusHistory",
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
        orderStatus:{
         type: DataTypes.STRING(32),
         allowNull: true,
        },
        paymentStatus:{
         type: DataTypes.STRING(32),
         allowNull: true,
        },
        deliveryStatus:{
         type: DataTypes.STRING(32),
         allowNull: true,
        },
        userName:{
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        remarks:{
         type: DataTypes.TEXT(),
         allowNull: true,
        },
        message:{
         type: DataTypes.TEXT(),
         allowNull: true,
        },
        sendEmail:{
         type: DataTypes.ENUM("Yes","No"),
         allowNull: true,
        },
        sendSMS:{
         type: DataTypes.ENUM("Yes","No"),
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
        tableName: "orderStatusHistory",
        comment:"Order Status History Table",
      }
    );
  };