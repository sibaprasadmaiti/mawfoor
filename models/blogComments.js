
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "blogcomments",
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
        blogId: {
         type: DataTypes.INTEGER(50),
         allowNull: true,
        },
        commentDescription:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("Yes","No"),
          allowNull: false,
          defaultValue: 'Yes'
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
        tableName: "blogcomments",
        comment:"Blog Comments Table",
      }
    );
  };