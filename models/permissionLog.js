module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "permissionLog",
      {
        storeId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        permissionGroupId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        createdBy: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        updatedBy: {
            type: DataTypes.STRING(100),
            allowNull: true,
        }
      },
      {
        tableName: "permissionLog",
        comment:"Permission Log Table",
      }
    )
}