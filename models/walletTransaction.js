/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "walletTransaction",
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
        walletId: {
         type: DataTypes.INTEGER(11),
         allowNull: true,
        },
        customerId: {
         type: DataTypes.INTEGER(11),
         allowNull: true,
        },
        orderId: {
         type: DataTypes.INTEGER(11),
         allowNull: true,
        },
        transactionType:{
         type: DataTypes.ENUM("debit","credit"),
         allowNull: true,
        },
        amount:{
         type: DataTypes.DECIMAL(10,2),
         allowNull: true,
        },
        remarks:{
         type: DataTypes.STRING(255),
         allowNull: true,
        },
        balance:{
         type: DataTypes.DECIMAL(10,2),
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
        tableName: "walletTransaction",
        comment:"Wallet Transaction Table",
      }
    );
  };