module.exports = function(sequelize, DataTypes) {
    return sequelize.define('carpenter', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
      },
      storeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      firstName: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      lastName: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      mobile: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      state: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      pin: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      country: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      otp: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: true,
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
      }
    }, {
      tableName: 'carpenter'
    });
  };
  