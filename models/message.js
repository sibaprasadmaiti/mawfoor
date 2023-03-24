/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "message",
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
        senderId: {
          type: DataTypes.INTEGER(10),
          allowNull: true,
        },
        adminId: {
          type: DataTypes.INTEGER(10),
          allowNull: true,
        },
        message:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        senderType: {
          type: DataTypes.ENUM("admin","customer"),
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
        tableName: "message",
        comment:"Message Table",
      }
    );
  };