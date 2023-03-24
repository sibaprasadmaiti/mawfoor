module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "subSection",
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
            sectionId: {
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
            description:{
                type: DataTypes.TEXT,
                allowNull: true,
            },
            shortText:{
                type: DataTypes.TEXT,
                allowNull: true,
            },
            longText:{
                type: DataTypes.TEXT,
                allowNull: true,
            },
            image:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            backgroundImage:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            slug:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            cssClass:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            link:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            buttontext:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            buttonlink:{
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
            tableName: "subSection",
            comment:"Dynamic Sub Section Table",
        }
    )
}