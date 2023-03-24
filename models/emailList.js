module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "emailList",
      {
        storeId: {
         type: DataTypes.INTEGER(10),
         allowNull: true,
        },
        name:{
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        email:{
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        status:{
          type: DataTypes.ENUM("Yes","No"),
          allowNull: false,
          defaultValue : 'Yes'
        },
        createdBy: {
          type: DataTypes.STRING(100),
          allowNull: true,
        }
      },
      {
        tableName: "emailList",
        comment:"Emails Table",
      }
    );
  };