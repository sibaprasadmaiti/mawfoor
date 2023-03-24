module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "contacts",
        {
            storeId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            title: {
                type: DataTypes.STRING(255),
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
            },
            updatedBy: {
                type: DataTypes.STRING(100),
                allowNull: true,
            }
        },
        {
            tableName: "contacts",
            comment:"Contacts Table",
        }
    )
}