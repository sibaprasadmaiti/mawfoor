/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "siteSettings",
      {
        storeId: {
         type: DataTypes.INTEGER(11),
         allowNull: true,
        },
        siteSettingsGroupId: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        label: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        siteName: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        tagline: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        mobileNo: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        appVersion: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        fax: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        siteUrl: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        address: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        siteDescription: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        feature: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        maxProAvailability: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        shippingCharges: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        freeShippingLimit: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        contactUsContent: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        image: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        fImage: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },

        value:{
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        sequence: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
        },
        facebook: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        twitter: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        linkedin: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        instagram: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        youtube: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        latitude: {
          type: DataTypes.STRING(200),
          allowNull: true
        },
        longitude: {
          type: DataTypes.STRING(200),
          allowNull: true
        },
        googleUrl: {
          type: DataTypes.STRING(200),
          allowNull: true
        },
        isSystem: {
          type: DataTypes.ENUM("Yes","No"),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("Yes","No"),
          allowNull: false,
          defaultValue: 'Yes'
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
        tableName: "siteSettings",
        comment:"Site Settings Table",
      }
    );
  };