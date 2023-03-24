
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "blogselectedcategory",
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
        tableName: "blogselectedcategory",
        comment:"Blog Selected Category Table",
      }
    );
  };