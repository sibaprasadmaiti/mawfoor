/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "categories",
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
      parentCategoryId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      position: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      slug: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      anchor: {
        type: DataTypes.ENUM("yes","no"),
        allowNull: true,
        defaultValue: "no",
      },
      url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      }, 
      description: {
        type: DataTypes.TEXT(),
        allowNull: true,
      }, 
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      includeInHome: {
        type: DataTypes.ENUM("yes","no"),
        allowNull: true,
        defaultValue: "no",
      },  
      includeInMenu: {
        type: DataTypes.ENUM("yes","no"),
        allowNull: true,
        defaultValue: "no",
      },  
      includeInFooter: {
        type: DataTypes.ENUM("yes","no"),
        allowNull: true,
        defaultValue: "no",
      },  
      metaTitle: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },   
      metaKey: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },    
      metaDescription: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },     
      metaImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },  
      sequence:{
        type: DataTypes.INTEGER(10),
        allowNull: true,
      },    
      status: {
        type: DataTypes.ENUM("Yes","No","Archive"),
        allowNull: true,
        defaultValue: "Yes",
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
      tableName: "categories",
      comment:"Categories Table",
    }
  );
};