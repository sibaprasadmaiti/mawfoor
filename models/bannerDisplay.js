/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "bannerdisplay",
      {
        id: {
          type: DataTypes.INTEGER(10),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        storeId: {
         type: DataTypes.INTEGER(10),
         allowNull: true,
        },
        title:{
          type: DataTypes.STRING(128),
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
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        updatedBy: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        tableName: "bannerdisplay",
        comment:"Banner Display Table",
      }
    );
  };