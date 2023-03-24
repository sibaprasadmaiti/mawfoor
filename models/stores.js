/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "stores",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      storeCode: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      cCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      slug: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      storeName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      company: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      storeOwner: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      fax:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      gstn:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      siteURL:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      sslRedirect:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      copyright:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      logo:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      fabIcon:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      version:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      location:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      country:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      latitude:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      longitude:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      facebookLink:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      instagramLink:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      twitterLink:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      youtubeLink:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      otherLink:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },      
      status: {
        type: DataTypes.ENUM("Yes","No","Archive"),
        allowNull: true,
      },
      openStore: {
        type: DataTypes.ENUM("Start","Open","Closed"),
        allowNull: true,
        defaultValue: 'Start'
      },
      createdBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "stores",
      comment:"Stores Table",
    }
  );
};