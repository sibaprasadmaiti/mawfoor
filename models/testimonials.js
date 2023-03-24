/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "testimonials",
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
        image:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        company:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        designation:{
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        description:{
          type: DataTypes.TEXT(),
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
        updatedBy: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
      },
      {
        tableName: "testimonials",
        comment:"Testimonials Table",
      }
    );
  };