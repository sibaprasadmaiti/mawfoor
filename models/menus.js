/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "menus",
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
            parentMenuId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            moduleId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            moduleItemId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            dynamicSectionId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            subSectionId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            sequence: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            title:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            pageName:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            label:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            description:{
                type: DataTypes.TEXT,
                allowNull: true,
            },
            link:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            slug:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            target:{
                type: DataTypes.ENUM("self","blank"),
                allowNull: true,
                defaultValue: 'self'
            },
            menuType: {
                type: DataTypes.ENUM("header","footer","both"),
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
            tableName: "menus",
            comment:"Menus Table",
        }
    )
}