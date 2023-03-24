/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "orders",
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
        orderNo: {
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        customerId:{
         type: DataTypes.INTEGER(11),
         allowNull: true,
        },
        orderStatus:{
         type: DataTypes.STRING(32),
         allowNull: true,
        },
        paymentStatus:{
         type: DataTypes.STRING(32),
         allowNull: true,
        },
        shippingMethod:{
         type: DataTypes.STRING(32),
         allowNull: true,
        },
        shippingDescription:{
         type: DataTypes.STRING(255),
         allowNull: true,
        },
        deliveryStatus:{
         type: DataTypes.STRING(32),
         allowNull: true,
        },
        deliveryTrack:{
         type: DataTypes.STRING(100),
         allowNull: true,
        },
        deliveryBoy:{
         type: DataTypes.STRING(100),
         allowNull: true,
        },
        paymentMethod:{
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        discountPercent:{
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        discountAmount:{
         type: DataTypes.DECIMAL(10,2),
         allowNull: true,
        },
        total:{
         type: DataTypes.DECIMAL(10,2),
         allowNull: true,
        },
        salesmanId:{
         type: DataTypes.INTEGER(10),
         allowNull: true,
        },
        tax:{
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        baseGrandTotal:{
         type: DataTypes.DECIMAL(10,2),
         allowNull: true,
        },
        couponCode:{
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        couponCodeType:{
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        couponCodeValue:{
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        couponAmount:{
         type: DataTypes.DECIMAL(10,2),
         allowNull: true,
        },
        shippingAmount:{
         type: DataTypes.DECIMAL(10,2),
         allowNull: true,
        },
        grandTotal:{
         type: DataTypes.DECIMAL(10,2),
         allowNull: true,
        },
        walletAmount:{
         type: DataTypes.DECIMAL(10,2),
         allowNull: true,
        },
        amountPaid:{
         type: DataTypes.DECIMAL(10,2),
         allowNull: true,
        },
        promotion:{
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        customerName:{
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        customerEmail:{
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        customerMobile:{
         type: DataTypes.STRING(30),
         allowNull: true,
        },
        customerAddress:{
          type: DataTypes.STRING(255),
          allowNull: true,
         },
        billingAddress:{
         type: DataTypes.TEXT(),
         allowNull: true,
        },
        shippingAddress:{
         type: DataTypes.TEXT(),
         allowNull: true,
        },
        shippingCity:{
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        shippingState:{
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        shippingPin:{
         type: DataTypes.STRING(20),
         allowNull: true,
        },
        shippingCountry:{
         type: DataTypes.STRING(128),
         allowNull: true,
        },
        cancleReason:{
         type: DataTypes.STRING(255),
         allowNull: true,
        },
        cancleMessage:{
         type: DataTypes.STRING(255),
         allowNull: true,
        },
        giftMessage:{
         type: DataTypes.TEXT(),
         allowNull: true,
        },
        deliveryDate:{
         type: DataTypes.DATE,
         allowNull: true,
        },
        deliveryType: {
          type: DataTypes.ENUM("Now","Later"),
          allowNull: true,
        },
        deliveryTimeSlotId:{
         type: DataTypes.INTEGER(10),
         allowNull: true,
        },
        deliveryID:{
         type: DataTypes.STRING(255),
         allowNull: true,
        },
        bankRefNo:{
         type: DataTypes.STRING(255),
         allowNull: true,
        },
        trackingId:{
         type: DataTypes.STRING(255),
         allowNull: true,
        },
        adminCancelRemarks:{
          type: DataTypes.TEXT(),
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
        tableName: "orders",
        comment:"Orders Table",
      }
    );
  };
