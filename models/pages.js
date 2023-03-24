/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "pages",
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
        slug: {
          type: DataTypes.STRING(255),
          allowNull: true,  
        },
        title:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        urlKey:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
         heading:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
         shortDescription:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        image:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        metaTitle:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        metaKeyword:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        metaDescription:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        metaImage: {
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
        tableName: "pages",
        comment:"Pages Table",
      }
    );
  };