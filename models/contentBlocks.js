/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "contentBlocks",
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
        pageId: {
         type: DataTypes.INTEGER(50),
         allowNull: true,
        },
        parentId: {
         type: DataTypes.INTEGER(50),
         allowNull: true,
        },
        slug: {
          type: DataTypes.STRING(255),
          allowNull: true,  
        },
        group:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        sequence: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
        },
        title:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        shortDescription:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        image:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        link:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        videoLink:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
         status: {
          type: DataTypes.ENUM("Yes","No"),
          allowNull: true,
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
        tableName: "contentBlocks",
        comment:"Content Blocks Table",
      }
    );
  };