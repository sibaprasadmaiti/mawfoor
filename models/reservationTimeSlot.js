/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "reservationTimeSlot",
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
        fromTime: {
         type: DataTypes.TIME,
         allowNull: true,
        },
        toTime: {
         type: DataTypes.TIME,
         allowNull: true,
        },
        sequence: {
         type: DataTypes.INTEGER(10),
         allowNull: true,
        },
        status:{
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
        tableName: "reservationTimeSlot",
        comment:"Reservation Time Slot Table",
      }
    );
  };