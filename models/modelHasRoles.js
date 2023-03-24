/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "modelHasRoles",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      storeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      roleId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },      
      createdBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "modelHasRoles",
      comment:"Model Has Roles Table",
    }
  );
};