module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "campaignDetailsEmail",
        {
            storeId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            campaignId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: true,
            }
        },
        {
            tableName: "campaignDetailsEmail",
            comment:"Campaign Details Email Table",
        }
    )
}