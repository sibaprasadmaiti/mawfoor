/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "users",
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
      otp:{
        type: DataTypes.STRING(20),
        allowNull:true,
      },
      firstName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      password: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
      designation: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
      managerId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },      
      status: {
        type: DataTypes.ENUM("active", "inactive", "unapproved", "archive"),
        allowNull: false,
        defaultValue: 'active'
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
      tableName: "users",
      comment:"Users Table",
    }
  );
};
