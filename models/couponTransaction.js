/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('couponTransaction', {
    customerId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    storeId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
     }, 
    couponId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    }, 
    appliedAmount: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    couponType: {
      type: DataTypes.ENUM('amount','percentage'),
      allowNull: true
    },
    couponValue: {
      type: DataTypes.INTEGER(11),
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
    timeFrom: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    timeTo: {
      type: DataTypes.STRING(200),
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
    createdBy: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    isShare: {
      type: DataTypes.ENUM('Yes','No'),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Yes','No'),
      allowNull: true
    }
  }, {
    tableName: 'couponTransaction'
  });
};
