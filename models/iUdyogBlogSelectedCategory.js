
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "iUdyogBlogSelectedCategory",
      {
        cId: {
         type: DataTypes.INTEGER(50),
         allowNull: true,
        },
        categoryId: {
         type: DataTypes.INTEGER(50),
         allowNull: true,
        },
        blogId: {
         type: DataTypes.INTEGER(50),
         allowNull: true,
        },
      },
      {
        tableName: "iUdyogBlogSelectedCategory",
        comment:"Blog Selected Category Table",
      }
    );
  };