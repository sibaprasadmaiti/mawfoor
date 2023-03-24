
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "attributevalue",
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
        attrSettingId: {
         type: DataTypes.INTEGER(50),
         allowNull: true,
        },
        attrName: {
         type: DataTypes.STRING(255),
         allowNull: true,
        },
        label:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        value:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        slug:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        description:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        image:{
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
        tableName: "attributevalue",
        comment:"Attribute Value Table",
      }
    );
  };