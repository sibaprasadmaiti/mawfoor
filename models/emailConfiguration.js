module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "emailConfiguration",
        {
            storeId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            domain: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("Active","Inactive"),
                allowNull: false,
                defaultValue : 'Active'
            }
        },
        {
            tableName: "emailConfiguration",
            comment:"Email Configuration Table",
        }
    )
}