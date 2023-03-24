module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "chatMessages",
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
        chatUserId: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
        },
        type: {
          type: DataTypes.ENUM("sender","receiver"),
          allowNull: true,
        },
        adminUserId: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
        },
        adminUserName: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        adminProfilePic: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        page_url: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        msg_read: {
          type: DataTypes.ENUM("yes","no"),
          defaultValue: "no",
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
        tableName: "chatMessages",
        comment:"Chat Message Table",
      }
    );
  };