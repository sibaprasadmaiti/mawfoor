module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "newsLetter",
      {
        storeId: {
         type: DataTypes.INTEGER(10),
         allowNull: true,
        },
        heading:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        scheduleTime:{
          type: DataTypes.DATE,
          allowNull: true,
        },
        sendingStatus:{
          type: DataTypes.ENUM("Done","ScheduleTime"),
          allowNull: false,
          defaultValue : 'Done'
        },
        description:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        createdBy: {
          type: DataTypes.STRING(100),
          allowNull: true,
        }
      },
      {
        tableName: "newsLetter",
        comment:"News Letter Table",
      }
    );
  };