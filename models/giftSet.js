/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "giftSet",
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
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT(),
        allowNull: true,
      }, 
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      sequence:{
        type: DataTypes.INTEGER(10),
        allowNull: true,
      },    
      status: {
        type: DataTypes.ENUM("Yes","No","Archive"),
        allowNull: true,
        defaultValue: "Yes",
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
      tableName: "giftSet",
      comment:"giftSet Table",
    }
  );
};