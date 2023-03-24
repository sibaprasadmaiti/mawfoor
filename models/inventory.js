module.exports = function(sequelize, DataTypes) {
    return sequelize.define('inventory', {
      productId: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      storeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      saleBuy: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      stock: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM("Yes", "No"),
        allowNull: false,
        defaultValue: 'Yes'
      },
      remarks: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      createdBy: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      updatedBy: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    }, {
      tableName: 'inventory'
    });
  };
  