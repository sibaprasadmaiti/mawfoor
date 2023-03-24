/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('salesmanBreak', {
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
    date: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    fromTime: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    toTime: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    flag: {
      type: DataTypes.ENUM('start','end'),
      allowNull: true
    },
    spendTime:{
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
    }
  }, {
    tableName: 'salesmanBreak'
  });
};
