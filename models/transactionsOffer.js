module.exports = function(sequelize, DataTypes) {
    return sequelize.define('transactionsOffer', {
      storeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      offerStatus:{
        type : DataTypes.ENUM('Signup','Refer','Share'),
        allowNull:true
      },
      credit: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
     offerFrom: {
        type: DataTypes.DATE,
        allowNull: true
      },
     offerTo: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('Yes','No'),
        allowNull: true
      },      
      createdBy: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      updatedBy: {
        type: DataTypes.STRING(100),
        allowNull: true
      }    
    }, {
      tableName: 'transactionsOffer'
    });
  };
  