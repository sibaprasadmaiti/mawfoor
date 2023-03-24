/* jshint indent: 2 */
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dropdownSettingsOptions',  {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    dropdownSettingId:{
    type: DataTypes.INTEGER(11),
    allowNull: true,
    },
    storeId: {
    type: DataTypes.INTEGER(11),
    allowNull: true,
      },
    optionLabel: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    optionValue: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    optionOrder:{
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
  }, {
    tableName: 'dropdownSettingsOptions',
    comment:"Dropdown Settings Option Table"

  });
};

