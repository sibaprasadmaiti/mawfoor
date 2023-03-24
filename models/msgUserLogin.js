module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "msgUserLogin",
        {
            storeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            mobile: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: "msgUserLogin",
            comment:"Message User Login Table",
        }
    );
};