module.exports = function(sequelize, DataTypes) {
    return sequelize.define('feedback', {
      id: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      storeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      customerId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      orderId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      rating: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      food: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      foodRating: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      delivery: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      deliveryRating: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      reply: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('Yes','No'),
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    }, {
      tableName: 'feedback'
    });
  };
  