module.exports = function(sequelize, DataTypes) {
    return sequelize.define('admins', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      storeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      parentId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      adminName: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      mobile: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      address: {
        type: DataTypes.TEXT(),
        allowNull: true
      },
      image: {
        type: DataTypes.STRING(255),
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
      pushToken: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active","inactive","archive"),
        allowNull: true,
        defaultValue: "active",
      },
      createdBy: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      updatedBy: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }    
    }, {
      tableName: 'admins',
      comment:"Admins Table",
    });
  };
  