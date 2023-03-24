
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "iUdyogBlogComments",
      {
        cId: {
         type: DataTypes.INTEGER(50),
         allowNull: true,
        },
        blogId: {
         type: DataTypes.INTEGER(50),
         allowNull: true,
        },
        commentDescription:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("Active","Inactive"),
          allowNull: false,
          defaultValue: 'Active'
        },
        createrName: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        createrEmail: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        tableName: "iUdyogBlogComments",
        comment:"Blog Comments Table",
      }
    );
  };