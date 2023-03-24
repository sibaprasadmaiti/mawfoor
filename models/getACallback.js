module.exports = function(sequelize, DataTypes) {
    return sequelize.define('getACallback', {
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
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    email:{
        type: DataTypes.STRING(255),
        allowNull: true
    },
    mobile:{
        type: DataTypes.STRING(100),
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
        tableName: 'getACallback'
    });
};
  