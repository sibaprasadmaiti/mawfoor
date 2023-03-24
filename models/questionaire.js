module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "questionaire",
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
            mediaUrl:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            slug:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            timeInMinute:{
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            totalQuestion:{
                type: DataTypes.INTEGER(10),
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
            tableName: "questionaire",
            comment:"Questionaire Table",
        }
    )
}