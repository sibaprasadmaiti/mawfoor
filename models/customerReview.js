/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "customerReview",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      emailId: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "customerReview",
      comment:"Customer Review Table",
    }
  );
};