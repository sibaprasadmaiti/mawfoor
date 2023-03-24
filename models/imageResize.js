module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "imageResize",
        {
            storeId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            moduleName: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            height: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
            },
            width: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
            },
            createdBy: {
                type: DataTypes.STRING(100),
                allowNull: true,
            }
        },
        {
            tableName: "imageResize",
            comment:"Image Resize Table",
        }
    )
}