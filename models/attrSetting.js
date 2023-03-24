
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "attributesetting",
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
        attrName: {
         type: DataTypes.STRING(255),
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
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("Yes","No"),
          allowNull: false,
          defaultValue: 'Yes'
        },
        createdBy: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        updatedBy: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
      },
      {
        tableName: "attributesetting",
        comment:"Attribute Setting Table",
      }
    );
  };