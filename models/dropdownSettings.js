/* jshint indent: 2 */
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dropdownSettings',  {
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
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    type:{
      type: DataTypes.ENUM('single','multi'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Yes','No'),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedBy: {
      type: DataTypes.STRING(128),
      allowNull: true
    }
  }, {
    tableName: 'dropdownSettings',
    comment:"Dropdown Settings Table"

  });
};

