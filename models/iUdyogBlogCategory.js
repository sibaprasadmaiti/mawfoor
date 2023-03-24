
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "iUdyogBlogCategory",
      {
        cId: {
         type: DataTypes.INTEGER(50),
         allowNull: true,
        },
        categoryName:{
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
        tableName: "iUdyogBlogCategory",
        comment:"Blog Category Table",
      }
    );
  };