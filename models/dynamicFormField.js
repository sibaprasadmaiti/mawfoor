/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "dynamicformfields",
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
        position: {
         type: DataTypes.INTEGER(200),
         allowNull: true,
        },
        dynamicFormId: {
         type: DataTypes.INTEGER(50),
         allowNull: true,
        },
        fieldName:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        displayName:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        dataType:{
          type: DataTypes.ENUM("text","number","email","textarea","date","time","datetime","file","checkbox","checkboxlist","radio","select","hidden"),
          allowNull: false,
          defaultValue: 'text'
        },
        fileType:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        label:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        required:{
          type: DataTypes.ENUM("Yes","No"),
          allowNull: false,
          defaultValue: 'No'
        },
        requiredMessage:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        regularExpression:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        regexMessage:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        placeholder:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        multiSelect:{
          type: DataTypes.ENUM("Yes","No"),
          allowNull: false,
          defaultValue: 'No'
        },
        emptyOption:{
          type: DataTypes.ENUM("Yes","No"),
          allowNull: false,
          defaultValue: 'No'
        },
        emptyOptionName:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        tableName: "dynamicformfields",
        comment:"Dynamic Form Fields Table",
      }
    );
  };