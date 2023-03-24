/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "brands",
      {
        id: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        storeId: {
         type: DataTypes.INTEGER(11),
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
        shortDescriptions: {
          type: DataTypes.TEXT(),
          allowNull: true,
        },
        descriptions: {
          type: DataTypes.TEXT(),
          allowNull: true,
        },
        address: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING(150),
          allowNull: true,
        },
        isoName: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        rating: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        sequence:{
          type: DataTypes.INTEGER(10),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("Yes","No"),
          allowNull: true,
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
        tableName: "brands",
        comment:"Brands Table",
      }
    );
  };