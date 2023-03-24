
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "blogs",
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
        authorId: {
         type: DataTypes.INTEGER(50),
         allowNull: true,
        },
        blogTitle:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        slug:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        summary:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        tags:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        blogImage:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        blogDescription:{
          type: DataTypes.TEXT('long'),
          allowNull: true,
        },
        metaTitle:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        metaDescription:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        metaKeywords:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("Yes","No"),
          allowNull: false,
          defaultValue: 'No'
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
        tableName: "blogs",
        comment:"Blogs Table",
      }
    );
  };