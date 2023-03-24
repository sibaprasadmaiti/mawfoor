/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('coupon', {
    storeId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    couponType: {
      type: DataTypes.ENUM('amount','percentage'),
      allowNull: true
    },
    couponValue: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    dateFrom: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    dateTo: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    description:{
      type: DataTypes.STRING(255),
      allowNull: true
    },
    shortDescription:{
      type: DataTypes.STRING(255),
      allowNull: true
    },
    couponCode: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    purchaseLimit: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    termsAndConditions:{
      type : DataTypes.TEXT,
      allowNull:true
    },
    customerType: {
      type: DataTypes.ENUM('new','all'),
      allowNull: true
    },
    createdBy: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Yes','No'),
      allowNull: true
    }
  }, {
    tableName: 'coupon'
  });
};
