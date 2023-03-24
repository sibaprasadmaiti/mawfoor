
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "blogauthor",
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
        firstName:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        lastName:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        profilePic:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        email:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        facebook:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        twitter:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        linkedin:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        github:{
            type: DataTypes.TEXT,
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
        tableName: "blogauthor",
        comment:"Blog Author Table",
      }
    );
  };