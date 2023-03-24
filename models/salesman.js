module.exports = function(sequelize, DataTypes) {
    return sequelize.define('salesman', {
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
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(300),
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      designation: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      otp: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      pushToken: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active','inactive','archive'),
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
      tableName: 'salesman'
    });
  };
  