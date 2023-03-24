/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "customers",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      storeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      otp:{
        type: DataTypes.STRING(20),
        allowNull:true,
      },
      prefix: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      firstName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      middleName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      fullName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      password: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      doa: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM("Male", "Female", "Other"),
        allowNull: true,
      },    
      status: {
        type: DataTypes.ENUM("Yes", "No", "Blocked"),
        allowNull: true,
      },    
      lastOrder: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },    
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },    
      referredBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },    
      orderValue: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },    
      mobileVerified: {
        type: DataTypes.ENUM("Yes", "No"),
        allowNull: true,
      },    
      emailVerified: {
        type: DataTypes.ENUM("Yes", "No"),
        allowNull: true,
      },
      verificationotp: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      pushToken: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
      termsChecked: {
        type: DataTypes.ENUM("Yes", "No"),
        allowNull: true,
      }, 
      offerChecked: {
        type: DataTypes.ENUM("Yes", "No"),
        allowNull: true,
      }, 
      createdBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "customers",
      comment:"Customers Table",
    }
  );
};