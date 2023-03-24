module.exports = function(sequelize, DataTypes) {
    return sequelize.define('billingFeedback', {
      id: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      storeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      customerId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      billingNo: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      amount: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      foodQualityRating: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      foodQualityRemarks: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      serviceRating: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      serviceRemarks: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ambienceRating: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      ambienceRemarks: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      overallRating: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      overallRemarks: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('Yes','No'),
        allowNull: true,
        defaultValue: 'No'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    }, {
      tableName: 'billingFeedback'
    });
  };
  