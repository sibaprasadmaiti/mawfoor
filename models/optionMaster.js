/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "optionMaster",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      storeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      // type: {
      //   type: DataTypes.ENUM("text", "multi-select", "dropdown"),
      //   allowNull: true,
      // },
      isRequired: {
        type: DataTypes.ENUM("Yes", "No"),
        allowNull: true,
        defaultValue: "No",
      },
      sorting: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "optionMaster",
      comment:"Option Master Table",
    }
  );
};