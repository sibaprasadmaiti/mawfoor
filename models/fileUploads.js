
  module.exports = function(sequelize, DataTypes) {
    return sequelize.define('fileUploads', {
        id: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
          primaryKey: true,
          autoIncrement: true
        },
        customerId: {
          type: DataTypes.INTEGER(11).UNSIGNED,
          allowNull: true,
        },
        image:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        createdBy: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedBy: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        }
    },

    {
      tableName: "fileUploads",
      comment:"FileUpload Table",
    });
    
  };
  