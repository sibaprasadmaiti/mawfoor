  module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "chatUsers",
      {
        id: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        store_id: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
        },
        session_id: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        client_ip: {
          type: DataTypes.STRING(30),
          allowNull: true,
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        mobile_no: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        profile_pic: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("Online","Offline"),
          defaultValue: "Offline",
          allowNull: true,
        },
        createdAt: {
          type: 'TIMESTAMP',
            allowNull: true,
          },
          updatedAt: {
              type: 'TIMESTAMP',
              defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: true,
          },
      },
      {
        tableName: "chatUsers",
        comment:"Chat Users Table",
      }
    );
  };