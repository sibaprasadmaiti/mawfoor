/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "dynamicforms",
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
        formName:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        tableName:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        title:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        slug:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        image:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        description:{
          type: DataTypes.TEXT,
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
        metaKeyword:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("Yes","No"),
          allowNull: true,
        },
      },
      {
        tableName: "dynamicforms",
        comment:"Dynamic Forms Table",
      }
    );
  };