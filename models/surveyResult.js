module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "surveyResult",
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
            empId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            questionaireId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            name:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            mobile:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            email:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            resultInJson: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            timeInMinute:{
                type: DataTypes.STRING(100),
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
            tableName: "surveyResult",
            comment:"Survey Result Table",
        }
    )
}