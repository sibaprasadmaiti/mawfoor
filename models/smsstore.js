
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('smsstore',
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
      },
      customerId: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },

    {
      tableName: 'smsstore',
      comment:"smsstore Table"
    });
    
  };
  