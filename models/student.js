module.exports = function(sequelize, DataTypes) {
    return sequelize.define('student', {
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
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        // unique:true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique:true
      },
      mobile: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique:true
      },
      password: {
        type: DataTypes.TEXT(),
        allowNull: true
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      rememberToken: {
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
      tableName: 'student',
      comment:"Students Table",
    });
  };
  