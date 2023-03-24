/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "banner",
      {
        id: {
          type: DataTypes.INTEGER(10),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        storeId: {
         type: DataTypes.INTEGER(10),
         allowNull: true,
        },
        title:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        categoryId:{
          type: DataTypes.INTEGER(10),
          allowNull: true,
        },
        brandId:{
          type: DataTypes.INTEGER(10),
          allowNull: true,
        },
        shortDescription:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        link:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        target:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        image:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        coverImage:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        mobileBannerImage:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        tabBannerImage:{
          type: DataTypes.TEXT,
          allowNull: true,
        },
        type:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        section:{
          type: DataTypes.INTEGER(10),
          allowNull: true,
        },
        displayType:{
          type: DataTypes.INTEGER(10),
          allowNull: true,
        },
        sequence:{
          type: DataTypes.INTEGER(10),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("Yes","No"),
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
        tableName: "banner",
        comment:"Banner Table",
      }
    );
  };