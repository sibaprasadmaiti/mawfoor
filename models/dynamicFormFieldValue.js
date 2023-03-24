/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "dynamicformfieldvalues",
      {
        id: {
          type: DataTypes.INTEGER(50),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        storeId: {
         type: DataTypes.INTEGER(50),
         allowNull: true,
        },
        dynamicFormId: {
         type: DataTypes.INTEGER(50),
         allowNull: true,
        },
        dynamicFormFieldId: {
         type: DataTypes.INTEGER(50),
         allowNull: true,
        },
        label:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        values:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        tableName: "dynamicformfieldvalues",
        comment:"Dynamic Form Field Values Table",
      }
    );
  };