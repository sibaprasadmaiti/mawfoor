/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('reservations', {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      storeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      date: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      timeId: {
        type: DataTypes.INTEGER(20),
        allowNull: true
      },
      name:{
        type: DataTypes.STRING(100),
        allowNull: true
      },
      noPeople:{
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      mobile: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      massage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      purpose: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('Yes','No'),
        allowNull: true
      },
      createdBy: {
        type: DataTypes.STRING(128),
        allowNull: true
      },
      updatedBy: {
        type: DataTypes.STRING(128),
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      tableName: 'reservations'
    });
  };
  