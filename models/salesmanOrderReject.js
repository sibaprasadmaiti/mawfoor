/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('salesmanOrderReject', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    storeId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
     },
    salesmanId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    orderId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'salesmanOrderReject'
  });
};
