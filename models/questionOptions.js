module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "questionoptions",
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
            questionaireId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            questionId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            options:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            isCorrectAnswer: {
                type: DataTypes.ENUM("Yes","No"),
                allowNull: true,
                defaultValue: 'No'
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
            tableName: "questionoptions",
            comment:"Question Option Table",
        }
    )
}