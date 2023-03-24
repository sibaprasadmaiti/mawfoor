
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "iUdyogBlogs",
      {
        cId: {
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
          type: DataTypes.ENUM("Active","Inactive"),
          allowNull: false,
          defaultValue: 'Active'
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
        tableName: "iUdyogBlogs",
        comment:"Blogs Table",
      }
    );
  };