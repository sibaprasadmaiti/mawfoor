/* jshint indent: 2 */
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('shippingMethods', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    storeId: {
     type: DataTypes.INTEGER(11),
     allowNull: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(12,2),
        allowNull: true,
        defaultValue: 0.00 
      },
    fromTime: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    toTime: {
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    active: {
      type: DataTypes.ENUM('Yes','No'),
      allowNull: true
    }
  }, {
    tableName: 'shippingMethods',
    comment:'Shipping Methods Table'
  });
};
