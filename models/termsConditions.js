module.exports = function(sequelize, DataTypes) {
    return sequelize.define('termsConditions', {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      storeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      question: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('active','inactive'),
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      createdBy: {
        type: DataTypes.STRING(128),
        allowNull: true
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedBy: {
        type: DataTypes.STRING(128),
        allowNull: true
      },
    }, {
      tableName:'termsConditions'
    });
  };
  