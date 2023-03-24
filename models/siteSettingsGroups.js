/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "siteSettingsGroups",
      {
        storeId: {
         type: DataTypes.INTEGER(11),
         allowNull: true,
        },
        groupTitle: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        sequence: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("Yes","No"),
          allowNull: false,
          defaultValue: 'Yes'
        },
        createdBy: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        updatedBy: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
      },
      {
        tableName: "siteSettingsGroups",
        comment:"Site Settings Groups Table",
      }
    );
  };