/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "franchise",
      {
        id: {
          type: DataTypes.INTEGER(10),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        storeId: {
         type: DataTypes.INTEGER(11),
         allowNull: true,
        },
        businessType: {
          type: DataTypes.ENUM('owned','lease'),
          allowNull: true,
        },
        address: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        name:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        contactNo: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        preferredLocation: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("Yes","No"),
          allowNull: true,
        },
        createdBy: {
          type: DataTypes.STRING(128),
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        updatedBy: {
          type: DataTypes.STRING(128),
          allowNull: true,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        tableName: "franchise",
        comment:"Franchise Table",
      }
    );
  };