
module.exports = function(sequelize, DataTypes) {
    const Sms = sequelize.define('sms', 
    {
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
      
      sms: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
     
      createdBy: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      }
    },

    {
      tableName: 'sms',
      comment:"SMS Table",
    });

    Sms.associate = models=>{
        Sms.hasMany(models.smsstore,{
          onDelete:"cascade"
        })
      };
      return Sms;
  };
  