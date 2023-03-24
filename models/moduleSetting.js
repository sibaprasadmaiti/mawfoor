module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "moduleSetting",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            storeId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            ip:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            siteName:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            name:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            title:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            email:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            mobileNo:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            fax:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            gstn:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            siteURL:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            sslRedirect:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            copyright:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            logo:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            fabIcon:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            version:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            location:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            country:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            address:{
                type: DataTypes.TEXT,
                allowNull: true,
            },
            latitude:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            longitude:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            poweredByText:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            poweredByLink:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            facebookLink:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            instagramLink:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            twitterLink:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            otherLink:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            slug:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            metaTitle:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            metaKeyword:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            metaDescription:{
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("Active","Inactive"),
                allowNull: true,
                defaultValue: 'Active'
            },
            lastUpdate: {
                type: DataTypes.DATE,
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
            tableName: "moduleSetting",
            comment:"Module Setting Table",
        }
    )
}