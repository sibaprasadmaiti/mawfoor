module.exports = function(sequelize, DataTypes) {
    return sequelize.define('favouriteProduct', {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
     storeId: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      productId :{
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      customerId :{
        type : DataTypes.INTEGER(11),
        allowNull: false
      },
      createdAt:{
        type : DataTypes.DATE,
        allowNull : false
      }
    }, {
      tableName: 'favouriteProduct'
    });
  };
  