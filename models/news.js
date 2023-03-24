
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "news",
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
        shortDescription:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        description:{
          type: DataTypes.TEXT('long'),
          allowNull: true,
        },
        sequence:{
          type: DataTypes.INTEGER(10),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("Yes","No"),
          allowNull: false,
          defaultValue: 'No'
        },
        createdBy: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        updatedBy: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        tableName: "news",
        comment:"News Table",
      }
    );
  };