module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "sessions",
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
        location: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        ip_address: {
          type: DataTypes.STRING(30),
          allowNull: true,
        },
        device_name: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        device_type: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        browser: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        path_json: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        reference_url:{
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        no_of_hits:{
          type: DataTypes.INTEGER(11),
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
        tableName: "sessions",
        comment:"Sessions Table",
      }
    );
  };