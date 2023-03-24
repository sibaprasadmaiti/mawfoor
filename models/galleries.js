/* jshint indent: 2 */
module.exports = function(sequelize, DataTypes) {
  const galleries = sequelize.define('galleries', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    catId: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    storeId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
     },
    image:{
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sequence:{
      type: DataTypes.INTEGER(10),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Yes", "No"),
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    createdBy: {
      type: DataTypes.STRING(128),
      allowNull: true
    }
  }, {
    tableName: 'galleries'
  });
  return galleries;
};
