
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "iUdyogBlogAuthor",
      {
        cId: {
         type: DataTypes.INTEGER(10),
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
        tableName: "iUdyogBlogAuthor",
        comment:"Blog Author Table",
      }
    );
  };