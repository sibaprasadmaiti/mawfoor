module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "questions",
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
            sequence: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            marks:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            questionTitle:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            audio:{
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            description:{
                type: DataTypes.TEXT,
                allowNull: true,
            },
            questionType: {
                type: DataTypes.ENUM("shorttext","number","email","longtext","datetime","multiplechioce","select","audio"),
                allowNull: true,
                defaultValue: 'shorttext'
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
            tableName: "questions",
            comment:"Questions Table",
        }
    )
}