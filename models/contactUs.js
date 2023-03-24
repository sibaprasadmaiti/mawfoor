module.exports = function(sequelize, DataTypes) {
    return sequelize.define('contactUs', {
    id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    storeId: {
        type: DataTypes.INTEGER(10),
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
    email:{
        type: DataTypes.STRING(255),
        allowNull: true
    },
    contactNo:{
        type: DataTypes.STRING(100),
        allowNull: true
    },
    address:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdBy: {
        type: DataTypes.STRING(100),
        allowNull: true
    },  
    updatedBy: {
        type: DataTypes.STRING(100),
        allowNull: true
    }  
    }, {
        tableName: 'contactUs'
    });
};
  