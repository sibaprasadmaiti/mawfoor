/* jshint indent: 2 */
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('subscribers', {
   storeId: {
    type: DataTypes.INTEGER(11),
    allowNull: true,
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Yes','No','Blocked'),
      defaultValue:'Yes',
      allowNull: false
    },
    updatedBy: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    tableName: 'subscribers',
     comment:"Subscribers Table",
  });
};
