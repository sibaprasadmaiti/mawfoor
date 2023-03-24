module.exports = function(sequelize, DataTypes) {
    return sequelize.define('cartAddon', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
      },
      storeId: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
      },
      cartId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      parentsProductId: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      customerId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      productId: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      itemQuantity: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      tableName: 'cartAddon'
    });
  };
  