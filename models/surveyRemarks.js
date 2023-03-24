module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "surveyRemarks",
        {
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
            surveyResultId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            marks:{
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
            tableName: "surveyRemarks",
            comment:"Survey Remarks Table",
        }
    )
}