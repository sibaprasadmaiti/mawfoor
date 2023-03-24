/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "moduleItem",
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
            moduleId: {
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
            file:{
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
            attr1:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            attr2:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            attr3:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            attr4:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            attr5:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            attr6:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            attr7:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            attr8:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            attr9:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            attr10:{
                type: DataTypes.STRING(255),
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
            tableName: "moduleItem",
            comment:"Module Item Table",
        }
    )
}