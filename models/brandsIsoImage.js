/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "brandsIsoImage",
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
        brandId: {
         type: DataTypes.INTEGER(11),
         allowNull: true,
        },
        isoImage:{
          type: DataTypes.STRING(255),
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
      },
      {
        tableName: "brandsIsoImage",
        comment:"Brands Iso Image Table",
      }
    );
  };