
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "blogcategory",
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
        categoryName:{
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
        tableName: "blogcategory",
        comment:"Blog Category Table",
      }
    );
  };