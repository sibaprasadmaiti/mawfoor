module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "campaignDetails",
        {
            storeId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            contactId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            configurationId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            title: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },
            subject: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("Active","Inactive"),
                allowNull: false,
                defaultValue : 'Active'
            },
            createdBy: {
                type: DataTypes.STRING(100),
                allowNull: true,
            }
        },
        {
            tableName: "campaignDetails",
            comment:"Campaign Details Table",
        }
    )
}