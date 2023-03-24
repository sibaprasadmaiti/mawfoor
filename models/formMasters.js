/* jshint indent: 2 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('formMasters', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      storeId:{
        type: DataTypes.INTEGER(11),
        allowNull:true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      notifyEmailMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notifyEmailId: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      notifySmsMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notifyMobileNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      senderEmailMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      senderSmsMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      tableName: 'formMasters',
      commit: 'Form Master Table'
    });
  };
  