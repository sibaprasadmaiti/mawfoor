/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "couponCustomer",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      couponId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      customerId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      couponCode: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },  
      customerName: {
        type: DataTypes.STRING(200),
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
      tableName: "couponCustomer",
      comment:"coupon Customer Table",
    }
  );
};