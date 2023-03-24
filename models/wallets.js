/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "wallets",
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
      orderId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
       },
      balanceAmount:{
       type: DataTypes.DECIMAL(10,2),
       allowNull: true,
      },
      amount: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      amountType: {
        type: DataTypes.ENUM('debit','credit'),
        allowNull: true
      },
      status:{
       type: DataTypes.ENUM("Yes","No","Archive"),
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
      tableName: "wallets",
      comment:"Wallets Table",
    }
  );
};