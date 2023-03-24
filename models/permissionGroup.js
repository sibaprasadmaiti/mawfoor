module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "permissionGroup",
      {
        groupName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        slug: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        sequence: {
            type: DataTypes.INTEGER(10),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('Yes','No'),
            allowNull: false,
            default:'Yes'
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
        tableName: "permissionGroup",
        comment:"Permission Group Table",
      }
    )
}