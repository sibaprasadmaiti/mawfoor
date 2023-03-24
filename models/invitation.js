module.exports = function(sequelize, DataTypes) {
    return sequelize.define('invitation', {
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
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status:{
        type : DataTypes.ENUM('Active','Inactive'),
        allowNull:true
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
      tableName: 'invitation'
    });
  };
  