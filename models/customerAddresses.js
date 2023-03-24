/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "customerAddresses",
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
      customerId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      isPrimary: {
        type: DataTypes.ENUM("yes","no"),
        allowNull: true,
      },
      label: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      prefix: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      firstName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      middleName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      fullName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      addressType:{
        type: DataTypes.ENUM("Home","Work","Other"),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
      locality: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      pin: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      company: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      vatNo: {
        type: DataTypes.STRING(200),
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
      tableName: "customerAddresses",
      comment:"Customer Addresses Table",
    }
  );
};