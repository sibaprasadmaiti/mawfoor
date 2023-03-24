/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "module",
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
            title:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            shortDescription:{
                type: DataTypes.TEXT,
                allowNull: true,
            },
            longDescription:{
                type: DataTypes.TEXT,
                allowNull: true,
            },
            image:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            tumbImage:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            bannerImage:{
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
            relavantIndustry:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("Active","Inactive"),
                allowNull: true,
                defaultValue: 'Active'
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
            tableName: "module",
            comment:"Module Table",
        }
    )
}