/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "faq",
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
        faqGroupId:{
         type: DataTypes.INTEGER(11),
         allowNull: true,
        },
        question:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        answer: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        createdBy: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        updatedBy: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
      },
      {
        tableName: "faq",
        comment:"Faq Table",
      }
    );
  };