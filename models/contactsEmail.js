module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "contactsEmail",
        {
            storeId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            contactId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            unsubscribeReason: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("Active","Inactive","Unsubscribe"),
                allowNull: false,
                defaultValue : 'Active'
            }
        },
        {
            tableName: "contactsEmail",
            comment:"Contacts Email Table",
        }
    )
}