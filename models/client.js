/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "client",
        {
            name:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            siteName:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            siteUrl:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            email:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            password:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            mobileNo:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            otp:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("Active","Inactive"),
                allowNull: true,
                defaultValue: 'Active'
            }
        },
        {
            tableName: "client",
            comment:"Client Table",
        }
    )
}