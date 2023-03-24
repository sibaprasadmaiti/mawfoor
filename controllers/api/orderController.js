var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
var flash = require('connect-flash');
var config = require("../../config/config.json");
const crypto = require('crypto');
// var push_notifications_vendorApp = require('../../helpers/push_notifications');
//var push_notifications = require('../../helpers/push_notifications');
var helper = require('../../helpers/helper_functions');
var Sequelize = require("sequelize");
const Op = Sequelize.Op
var sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password, 
    {
        host: "localhost",
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        }
    }
);


function dd_mm_yyyy() {
  now = new Date();
  year = "" + now.getFullYear().toString().substr(-2);
  month = "" + (now.getMonth() + 1);
  day = "" + now.getDate();
  return day + month + year;
}
  
function yyyy_mm_dd() {
  now = new Date();
  year = "" + now.getFullYear();
  month = "" + (now.getMonth() + 1);
  if (month.length == 1) {
    month = "0" + month;
  }
  day = "" + now.getDate();
  if (day.length == 1) {
    day = "0" + day;
  }
  hour = "" + now.getHours();
  if (hour.length == 1) {
    hour = "0" + hour;
  }
  minute = "" + now.getMinutes();
  if (minute.length == 1) {
    minute = "0" + minute;
  }
  second = "" + now.getSeconds();
  if (second.length == 1) {
    second = "0" + second;
  }
  return year + "-" + month + "-" + day;
}

/**
 * Description: This function is developed for Add New Customer Order
 * @param req
 * @param res user details with jwt token
 * Developer: Surajit Gouri
 */


exports.addOrder = async function(req,res) {

  var storeId = req.body.data.storeId;
  var customerId = req.body.data.customerId;
  var amountPaid = req.body.data.amountPaid;
  var deliveryCharges = req.body.data.deliverycharge;
  var shippingAddressId = req.body.data.customeraddressId;
  var paymentMode = req.body.data.paymentmode;
  var couponCode = req.body.data.couponCode;
  var couponId = req.body.data.couponId;
  var deliveryTimeSlotId = req.body.data.deliveryTimeSlotId ? req.body.data.deliveryTimeSlotId : null;
  var currentDate = dd_mm_yyyy();
  var debitWalletAmount = req.body.data.debitWalletAmount;
  var deliveryType = req.body.data.deliveryType;

  var discountAmount = req.body.data.discountAmount;
  var discountPercent = req.body.data.discountPercent;
  var codCharges = req.body.data.codCharges;

  var codAmount = codCharges ? codCharges : 0;
  var orderDiscountAmount = discountAmount ? discountAmount : 0;
  var orderSubTotal = Number(amountPaid) - Number(deliveryCharges) + Number(orderDiscountAmount) - Number(codAmount);
  // var orderTotal = Number(amountPaid) - Number(orderDiscountAmount) - Number(codAmount);
  var tax = Math.round((orderSubTotal*5)/100);
  var orderProductPrice = Math.round(orderSubTotal-tax)
  

  if(codCharges == 0){
    var paymentStatus = 'Online';
    var codPrice = null;
  } else {
    var paymentStatus = 'COD';
    var codPrice = codCharges;
  }

  //  console.log('aaaaaaaaaaaaaaaaaaaaaaaa-----'+deliveryCharges)
  if(customerId && customerId != '' && storeId && storeId !='' && shippingAddressId && shippingAddressId !=''){
        
    if(deliveryCharges == 0){
      var shippingMethod = 'Free Shipping';
      var shippingAmount = null;
    }else{
      var shippingMethod = 'Shipping Charge';
      var shippingAmount = deliveryCharges;
    }

    var customerIdCheck = await models.customers.findAll({attributes:['id','firstName','lastName','mobile','email'],where:{storeId:storeId,id:customerId}});

    var customerShippingAddressIdCheck = await models.customerAddresses.findOne({attributes:['id','customerId','fullName','mobile','address','locality','city','state','pin','country'],
                                          where:{
                                            id:shippingAddressId,
                                            // storeId:storeId,
                                            // customerId:customerId,
                                            // isPrimary:'Yes' 
                                          }
                                      }); 

    if(customerId && customerShippingAddressIdCheck){

      // let statusValue = await models.dropdownSettingsOptions.findOne({ attributes:['storeId','optionValue','optionOrder'], where:{storeId:storeId, optionOrder:1}});
      // if(statusValue){
      //   var orderStatus = statusValue.optionValue;
      // } else {
      //   var orderStatus = 'Processing';
      // }

      if(paymentStatus == 'Online'){
        var orderStatus = 'Payment Under Process';
      } else {
        var orderStatus = 'Processing';
      }

      if(couponCode && couponCode != '' && couponId && couponId != ''){
        var couponDetails = await models.coupon.findAll({ where:{couponCode:couponCode, id:couponId }});

        if(couponDetails.length>0){
          var couponCode = couponDetails[0].couponCode;
          var couponValue = couponDetails[0].couponValue;
          var couponCodeType  = couponDetails[0].couponType;
        } else {
          var couponCode = null;
          var couponValue = null;
          var couponCodeType  = null;
        }
      }

      var cartitems = await models.carts.findAll({ where:{ storeId:storeId, customerId:customerId },
                                                  include:[
                                                    {
                                                      model:models.products,
                                                      attributes:['id','title','price','specialPrice','weight'],
                                                    },
                                                  ]
                                              })

      // ////////////////////////// cart price rule start /////////////////////////////////////
      // if(couponCode && couponCode != '' && couponId && couponId != ''){
      //   var newAmountPaid = amountPaid;
      //   var discountAmount = req.body.data.discountAmount ? req.body.data.discountAmount : null;
      //   var discountPercent = req.body.data.discountPercent ? req.body.data.discountPercent : null;
        
      // } else {

      //   var customerOrderDetails = await models.orders.findAll({ attributes:['id','customerId','amountPaid'], where:{storeId:storeId, customerId:customerId }});
      //   var cartPriceCurrentDate = yyyy_mm_dd();
      //   if(customerOrderDetails.length>0){
      //     var cartPriceRuleDetails = await models.cartPriceRule.findAll({ where:{storeId:storeId, couponType:'noCoupon', customerType:'existing', $or: [{offerFrom: { $lte: cartPriceCurrentDate }}, {offerTo: { $gte: cartPriceCurrentDate }}] }});
      //   } else{
      //     var cartPriceRuleDetails = await models.cartPriceRule.findAll({ where:{storeId:storeId, couponType:'noCoupon', customerType:'new', $or: [{offerFrom: { $lte: cartPriceCurrentDate }}, {offerTo: { $gte: cartPriceCurrentDate }}] }});
      //   }
      //   if(cartPriceRuleDetails.length>0){
      //     console.log("1111111111111111111111111")

      //     var cartPriceRuleAttributeDetails = await models.cartPriceRuleAttributes.findAll({ where:{storeId:storeId, cartPriceRuleId : cartPriceRuleDetails[0].id, attributeName:'Category' }});
      //     if(cartPriceRuleAttributeDetails.length>0){
      //       console.log("11111000000000000000000000000000000cartPriceRuleAttributeDetails---"+cartPriceRuleAttributeDetails.length)
      //       if(cartitems.length>0){
      //         var cartProductTotalPrice = 0;
      //         for(var j=0; j<cartPriceRuleAttributeDetails.length; j++){
      //           var cartProductPrice = 0;
      //           for(var i=0; i<cartitems.length; i++){

      //             var productCategoryCheck = await models.productCategory.findOne({ where:{storeId:storeId, productId: cartitems[i].productId, parentCategoryId: Number(cartPriceRuleAttributeDetails[j].attributeValue) }});
      //             if(productCategoryCheck){
      //               var productPrice = Number(cartitems[i].product.price)*cartitems[i].itemQuantity;
      //             } else {
      //               var productPrice = 0;
      //             }
      //             cartProductPrice +=productPrice;
      //             console.log("1111111111111111111111111---cartProductPrice----"+cartProductPrice)
      //           }
      //           cartProductTotalPrice +=cartProductPrice;
      //           console.log("1111111111111111111111111cartProductTotalPrice----"+cartProductTotalPrice)
      //         }
      //       } else {
      //         var cartProductTotalPrice = 0;
      //         // var cartProductPrice = 0;
      //       }
      //     } else {
      //       var cartProductTotalPrice = Number(amountPaid)-Number(deliveryCharges);
      //     }

      //     console.log("1111222222222222222222222222222222222cartProductTotalPrice----"+cartProductTotalPrice)
      //     console.log("1111111111111111111111111")
      //     console.log("1111111111111111111111111")

      //     if(cartPriceRuleDetails[0].discountType == 'fixed'){
      //       if(cartPriceRuleDetails[0].purchaseLimit != '' && cartPriceRuleDetails[0].purchaseLimit != null ){
      //         if( Number(cartProductTotalPrice) >= Number(cartPriceRuleDetails[0].purchaseLimit)){
      //           var newAmountPaid = Math.round(Number(amountPaid)-Number(cartPriceRuleDetails[0].discountValue))
      //           var discountAmount = Number(cartPriceRuleDetails[0].discountValue);
      //           var discountPercent = null;
      //         } else {
      //           var newAmountPaid = amountPaid;
      //           var discountAmount = null;
      //           var discountPercent = null;
      //         }
              
      //       } else {
      //         var newAmountPaid = Math.round(Number(amountPaid)-Number(cartPriceRuleDetails[0].discountValue))
      //         var discountAmount = Number(cartPriceRuleDetails[0].discountValue);
      //         var discountPercent = null;
      //       }
      //     } else {

      //       if(cartPriceRuleDetails[0].minDiscountValue != '' && cartPriceRuleDetails[0].minDiscountValue != null && cartPriceRuleDetails[0].maxDiscountValue != '' && cartPriceRuleDetails[0].maxDiscountValue != null){
              
      //         if( Math.round((Number(cartProductTotalPrice))*(cartPriceRuleDetails[0].discountValue/100)) <= Number(cartPriceRuleDetails[0].maxDiscountValue) && Math.round((Number(cartProductTotalPrice))*(cartPriceRuleDetails[0].discountValue/100)) >= Number(cartPriceRuleDetails[0].minDiscountValue)){
      //           var newAmountPaid = Math.round((Number(amountPaid)-(Number(cartProductTotalPrice))*((cartPriceRuleDetails[0].discountValue)/100)))
      //           var discountAmount = Math.round(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100));
      //           var discountPercent = Number(cartPriceRuleDetails[0].discountValue);

      //         } else if( (Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)) <= Number(cartPriceRuleDetails[0].minDiscountValue)){
      //           var newAmountPaid = amountPaid;
      //           var discountAmount = null;
      //           var discountPercent = null;
      //         } else if( (Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)) >= Number(cartPriceRuleDetails[0].maxDiscountValue)){
      //           var newAmountPaid = Number(amountPaid)-Number(cartPriceRuleDetails[0].maxDiscountValue);
      //           var discountAmount = Number(cartPriceRuleDetails[0].maxDiscountValue);
      //           var discountPercent = Number(cartPriceRuleDetails[0].discountValue);
      //         } else {
      //           var newAmountPaid = amountPaid;
      //           var discountAmount = null;
      //           var discountPercent = null;
      //         }

      //       } else if (cartPriceRuleDetails[0].minDiscountValue != '' && cartPriceRuleDetails[0].minDiscountValue != null && cartPriceRuleDetails[0].maxDiscountValue == null){

      //         if( (Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)) >= Number(cartPriceRuleDetails[0].minDiscountValue)){
      //           var newAmountPaid = Math.round(Number(amountPaid)-(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)))
      //           var discountAmount = Math.round((Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)));
      //           var discountPercent = Number(cartPriceRuleDetails[0].discountValue);
      //         } else {
      //           var newAmountPaid = amountPaid;
      //           var discountAmount = null;
      //           var discountPercent = null;
      //         }

      //       } else if (cartPriceRuleDetails[0].maxDiscountValue != '' && cartPriceRuleDetails[0].maxDiscountValue != null && cartPriceRuleDetails[0].minDiscountValue == null){

      //         if( Math.round(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)) <= Number(cartPriceRuleDetails[0].maxDiscountValue)){
      //           var newAmountPaid = Math.round(Number(amountPaid)-(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)))
      //           var discountAmount = Math.round(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100));
      //           var discountPercent = Number(cartPriceRuleDetails[0].discountValue);
      //         } else {
      //           var newAmountPaid = Math.round(Number(amountPaid)-Number(cartPriceRuleDetails[0].maxDiscountValue));
      //           var discountAmount = Number(cartPriceRuleDetails[0].maxDiscountValue);
      //           var discountPercent = Number(cartPriceRuleDetails[0].discountValue);
      //         }

      //       } else if (cartPriceRuleDetails[0].minDiscountValue == null && cartPriceRuleDetails[0].maxDiscountValue == null){
      //         var newAmountPaid = Math.round(Number(amountPaid)-(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)))
      //         var discountAmount = Math.round(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100));
      //         var discountPercent = Number(cartPriceRuleDetails[0].discountValue);
      //       }
      //     }

      //   } else {
      //     var newAmountPaid = amountPaid;
      //     var discountAmount = null;
      //     var discountPercent = null;
      //   }
      // }
      // ////////////////////////// cart price rule end /////////////////////////////////////
      
      await models.orders.create({
        // orderStatus        : 'New',
        // orderStatus        : statusValue.optionValue,
        orderStatus        : orderStatus,
        storeId            : storeId,
        shippingMethod     : shippingMethod,
        customerId         : customerId,
        paymentMethod      : paymentMode,
        shippingAmount     : shippingAmount,
        amountPaid         : amountPaid,
        // amountPaid         : newAmountPaid,
        discountAmount     : discountAmount,
        discountPercent    : discountPercent,
        customerName       : customerIdCheck[0].firstName +' '+customerIdCheck[0].lastName,
        customerMobile     : customerIdCheck[0].mobile,
        customerEmail     : customerIdCheck[0].email,
        customerAddress     : customerIdCheck[0].address,
        // shippingAddress    : customerShippingAddressIdCheck.fullName+','+customerShippingAddressIdCheck.mobile+','+customerShippingAddressIdCheck.address+','+customerShippingAddressIdCheck.locality+','+customerShippingAddressIdCheck.city+','+customerShippingAddressIdCheck.state+','+customerShippingAddressIdCheck.pin+','+customerShippingAddressIdCheck.country+','+customerShippingAddressIdCheck.mobile,
        // billingAddress     : customerShippingAddressIdCheck.fullName+','+customerShippingAddressIdCheck.mobile+','+customerShippingAddressIdCheck.address+','+customerShippingAddressIdCheck.locality+','+customerShippingAddressIdCheck.city+','+customerShippingAddressIdCheck.state+','+customerShippingAddressIdCheck.pin+','+customerShippingAddressIdCheck.country+','+customerShippingAddressIdCheck.mobile,
        shippingAddress    : customerShippingAddressIdCheck.fullName+','+customerShippingAddressIdCheck.address+','+customerShippingAddressIdCheck.locality+','+customerShippingAddressIdCheck.city+','+customerShippingAddressIdCheck.state+','+customerShippingAddressIdCheck.pin+','+customerShippingAddressIdCheck.country+','+customerShippingAddressIdCheck.mobile,
        billingAddress     : customerShippingAddressIdCheck.fullName+','+customerShippingAddressIdCheck.address+','+customerShippingAddressIdCheck.locality+','+customerShippingAddressIdCheck.city+','+customerShippingAddressIdCheck.state+','+customerShippingAddressIdCheck.pin+','+customerShippingAddressIdCheck.country+','+customerShippingAddressIdCheck.mobile,
        shippingCity       : customerShippingAddressIdCheck.city,
        shippingState      : customerShippingAddressIdCheck.state,
        shippingPin        : customerShippingAddressIdCheck.pin,
        shippingCountry    : customerShippingAddressIdCheck.country,
        deliveryType       : deliveryType,
        deliveryTimeSlotId : deliveryTimeSlotId,
        couponCode         : couponCode,
        couponCodeType     : couponCodeType,
        couponValue        : couponValue,
        total              : codPrice,
        paymentStatus      : paymentStatus,
        baseGrandTotal     : orderProductPrice,
        tax                : tax,
      }).then(async function(order){
      console.log(order);
        var newOrderId = "MAW" + currentDate + order.id;
        await models.orders.update({
          orderNo: newOrderId
        },{where:{id:order.id}}).then(async function(ord){
          models.orderStatusHistory.create({
            orderId: order.id,
            storeId:storeId,
            orderStatus: 'Order Placed',
            userName: customerIdCheck[0].firstName +' '+customerIdCheck[0].lastName,
            createdBy: customerId,
          }).then(async function(osh){
            for(var i=0;i<cartitems.length;i++){

              if(cartitems[i].configProductId && cartitems[i].configProductId != '' && cartitems[i].configProductId != null){

                let configProductDetails = await models.optionValue.findOne({attributes:['id','price','value'],where:{id:cartitems[i].configProductId}});
                if(configProductDetails){
                  if(configProductDetails.price && configProductDetails.price != '' && configProductDetails.price != null){
                    var productTitle = cartitems[i].product.title+' - '+configProductDetails.value;
                    var productWeight = configProductDetails.value;
                    var productPrice = Number(configProductDetails.price);
                    var productTotalPrice = Number(cartitems[i].itemQuantity) * Number(configProductDetails.price);
                  } else {
                    var productTitle = cartitems[i].product.title;
                    var productWeight = cartitems[i].product.weight;
                    var productPrice = Number(cartitems[i].product.price);
                    var productTotalPrice = Number(cartitems[i].itemQuantity) * Number(cartitems[i].product.price);
                  }
                } else {
                  var productTitle = cartitems[i].product.title;
                  var productWeight = cartitems[i].product.weight;
                  var productPrice = Number(cartitems[i].product.price);
                  var productTotalPrice = Number(cartitems[i].itemQuantity) * Number(cartitems[i].product.price);
                }

              } else {
                var productTitle = cartitems[i].product.title;
                var productWeight = cartitems[i].product.weight;
                var productPrice = Number(cartitems[i].product.price);
                var productTotalPrice = Number(cartitems[i].itemQuantity) * Number(cartitems[i].product.price);
              }

              let stockDetails = await models.inventory.findAll({attributes: ['id','stock'], where:{productId: cartitems[i].productId}, order: [['id', 'DESC']]})

              if(stockDetails.length>0){
                if(stockDetails.stock && stockDetails.stock != null && stockDetails.stock != ''){
                  var newStock = parseInt(stockDetails[0].stock) - parseInt(cartitems[i].itemQuantity)
                } else {
                  var newStock = 0;
                }
              } else {
                var newStock = 0;
              }

              console.log("111111111111111111111111-----"+newStock);

              await models.inventory.create({
                productId : cartitems[i].productId,
                storeId : storeId,
                stock : newStock,
                remarks: `${cartitems[i].itemQuantity} product order by ${order.id}`
              })

              await models.orderItems.create({
                orderId : order.id,
                storeId :storeId,
                productId : cartitems[i].productId,
                configProductId : cartitems[i].configProductId ? cartitems[i].configProductId : null,
                // name : cartitems[i].product.title,
                name : productTitle,
                qty : cartitems[i].itemQuantity,
                wrapId : cartitems[i].wrapId,
                // price : cartitems[i].product.price,
                // originalPrice : cartitems[i].product.price,
                // totalPrice : cartitems[i].product.price * cartitems[i].itemQuantity,
                weight : productWeight ? productWeight : null,
                price : productPrice,
                originalPrice : productPrice,
                totalPrice : productTotalPrice,
              });

              // ///////////////////////// addon product in order item start ///////////////

              var addonCartItem = await sequelize.query("SELECT cartAddon.id, cartAddon.parentsProductId, cartAddon.customerId as customerId, cartAddon.productId, cartAddon.itemQuantity as itemQuantity, products.price, products.title, products.weight FROM `cartAddon` LEFT JOIN `products` ON cartAddon.productId = products.id where `cartAddon`.`storeId` = "+storeId+" and `cartAddon`.`cartId` = " +cartitems[i].id,{ type: Sequelize.QueryTypes.SELECT });
              if(addonCartItem.length > 0){
      
                for(var b=0; b < addonCartItem.length; b++){

                  models.orderItems.create({
                    orderId: order.id,
                    storeId: storeId,
                    productId: addonCartItem[b].productId ? addonCartItem[b].productId : null,
                    parentsProductId: addonCartItem[b].parentsProductId ? addonCartItem[b].parentsProductId : null,
                    name: addonCartItem[b].title ? addonCartItem[b].title : null,
                    weight: addonCartItem[b].weight ? addonCartItem[b].weight : null,
                    qty: Number(addonCartItem[b].itemQuantity),
                    price: addonCartItem[b].price ? addonCartItem[b].price : null,
                    originalPrice: addonCartItem[b].price ? addonCartItem[b].price : null,
                    totalPrice: Number(addonCartItem[b].itemQuantity)*Number(addonCartItem[b].price)
                  });

                }

              }

              // ///////////////////////// addon product in order item end ///////////////
              
            }

            if(storeId == 17){
              console.log("zxzxzxzxzxzxzxzxzxzxz----");
              let debit = parseInt(debitWalletAmount)
              let totalBalance = await models.walletTransaction.findOne({attributes:['balance'], where:{customerId: customerId},order: [['id', 'DESC']] })
                let balance = 0
                if(totalBalance){
                  console.log("fgfgfgfgfgfgfg----");
                  if(totalBalance.balance != '' && totalBalance.balance != null){
                    console.log("jkhjhkjhjkhkhkh----");
                    balance = parseInt(totalBalance.balance)-debit
                  }else{
                    console.log("ererererere----");
                    balance = 0
                  }
                } else {
                  console.log("hjkhghthututututuyuyu----");
                  balance = 0
                }
              await models.walletTransaction.create({
                storeId : storeId,
                customerId :customerId,
                orderId: order.id,
                transactionType: 'debit',
                amount: debit,
                remarks: '',
                balance:balance
              }).then(async(value)=>{
                console.log('Okkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
              }).catch(err => {console.log(err)})
            }
            
            if(couponCode && couponCode != '' && couponId && couponId != ''){
              await models.couponTransaction.create({
                customerId     : customerId,
                storeId        : storeId,
                couponId       : couponId,
                appliedAmount  : discountAmount,
                couponCodeType     : couponDetails[0].couponType,
                couponValue    : couponDetails[0].couponValue,
                dateFrom       : couponDetails[0].offerFrom,
                dateTo      : couponDetails[0].offerTo,
                couponCode    : couponCode,
                purchaseLimit : couponDetails[0].purchaseLimit,
              })
            }

            await models.carts.destroy({where:{customerId:customerId, storeId:storeId}}).then(async function(cart){
              if(cart){
                await models.cartAddon.destroy({where:{customerId:customerId, storeId:storeId}})

                // if(storeId == 17 ){
                //   var vendorDetails = await models.admins.findOne({ attributes:['id', 'storeId', 'pushToken'],where: {id: 4}});
                // } else if(storeId == 15){
                //   var vendorDetails = await models.admins.findOne({ attributes:['id', 'storeId', 'pushToken'],where: {id: 3}});
                // } else if(storeId == 18){
                //   var vendorDetails = await models.admins.findOne({ attributes:['id', 'storeId', 'pushToken'],where: {id: 5}});
                // } else {
                //   var vendorDetails = await models.admins.findOne({ attributes:['id', 'storeId', 'pushToken'],where: {storeId: storeId}});
                // }
                // if(vendorDetails) {
                //   if(vendorDetails.pushToken != '' && vendorDetails.pushToken != null) {
                //     console.log("vvvvvvvvvvvvvvvvvvvvvvv----");
                //     //push_notifications.generateNotification('',vendorDetails.id,storeId,"order-create",order.id);
                //   }
                // }

                /***Order details send to admin via mail start***/
                  var siteSeGrsDetails = await models.siteSettingsGroups.findOne({ attributes:['id','storeId'], where: {groupTitle: "Mail Services", storeId: storeId, status: "Yes"}});
                  if(siteSeGrsDetails){
                    var orderConemails = await models.siteSettings.findAll({ attributes:['email'], where: {storeId: siteSeGrsDetails.storeId, siteSettingsGroupId: siteSeGrsDetails.id}});
                    var storeData = await models.stores.findOne({ attributes: ['storeName'], where: { id: siteSeGrsDetails.storeId } });
                    if(orderConemails.length > 0){
                      var emails = '';
                      orderConemails.forEach(element => {
                        if(emails != ''){
                          emails +=`, ${element.email}`;
                        }else{
                          emails = element.email;
                        }
                      });
                      // var orderData = await models.orders.findOne({where: {id: order.id}});
                      // var orderItemData = await models.orderItems.findAll({where: {orderId: order.id}});
                      // helper.orderMailSendToAdmin(emails, storeData.storeName, orderData, orderItemData);
                    }
                  }
                /***Order details send to admin via mail end ***/

                 console.log('aaaaaaaaaaaaaaaaaaaaaaaa-----'+customerIdCheck[0].email)
                helper.orderMailSend(order.id, customerIdCheck[0].email);


                //avijit ccavinue start
                //const plainText=`merchant_id=45990&order_id=${order.id}&amount=${order.amountPaid}&currency=AED&redirect_url=https://mawfoor.com/ccavinue/ccavResponseHandler.php&cancel_url=https://mawfoor.com/ccavinue/ccavResponseHandler.php&language=EN&billing_name=${order.customerName}&billing_address=${order.customerAddress}&billing_city=${order.shippingCity}&billing_state=${order.shippingState}&billing_country=${order.shippingCountry}&billing_tel=${order.customerMobile}&billing_email=${order.customerEmail}`;
                 const plainText=`merchant_id=48444&order_id=${order.id}&amount=${order.amountPaid}&currency=AED&redirect_url=https://mawfoor.com/ccavinue/ccavResponseHandler.php&cancel_url=https://mawfoor.com/ccavinue/ccavResponseHandler.php&language=EN&billing_name=${order.customerName}&billing_address=${customerShippingAddressIdCheck.address}&billing_city=${order.shippingCity}&billing_state=${order.shippingState}&billing_country=${order.shippingCountry}&billing_tel=${order.customerMobile}&billing_email=${order.customerEmail}`;
		/*const workingKey="D3E3B8B2FC4C12BBC010F92F2FB651F7";
                var m = crypto.createHash('md5');
                m.update(workingKey);
                var key = crypto.randomBytes(32)//m.digest('binary');
                //console.log(key);
                var iv = crypto.randomBytes(16);//'\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';	//console.log(iv);return false;
                var cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
                var encoded = cipher.update(plainText,'utf8','hex');
                encoded += cipher.final('hex');*/
                //console.log(plainText);
                const url=`http://www.mawfoor.com/ccavinue/?${plainText}`;
                console.log(url);
                //avijit ccavinue start

                return res.status(200).send({ data:{success:true,orderId:newOrderId,url:url,message:'Order placed successfully'}, errorNode:{errorCode:0, errorMsg:""}});
              } else {
                return res.status(200).send({ data:{success:false,message:'Cart item not found in this order'}, errorNode:{errorCode:1, errorMsg:""}});
              }
            })

          }).catch(function(error) {
            console.log("111111111111111--"+error);
            return res.status(200).send({ data:{success:false}, errorNode:{errorCode:1, errorMsg:error}});
          });
        }).catch(function(error) {
          console.log("2222222222222--"+error);
          return res.status(200).send({ data:{success:false}, errorNode:{errorCode:1, errorMsg:error}});
        });
      }).catch(function(error) {
        console.log("3333333333333333--"+error);
        return res.status(200).send({ data:{success:false}, errorNode:{errorCode:1, errorMsg:error}});
      });

    } else {
      return res.status(200).send({ data:{success:false,message:'CustomerId or ShippingId did not match! '}, errorNode:{errorCode:1, errorMsg:''}});
    }
        
 
  } else {
    return res.status(200).send({ data:{success:false,message:'Customer and customer address id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
}

exports.paymentCallBack=async function(req,res){
  const {orderId,paymentStatus,bankRefNo,trackingId}=req.body.data;
  if(orderId && paymentStatus && bankRefNo && trackingId){
    let orderDetails = await models.orders.findOne({
        where:{
          id:orderId,
      }
    });

    if(paymentStatus == 'Success'){

      var orderStatus = 'Processing';
    } else {
      var orderStatus = 'Payment Under Process';
    }
    
      if(orderDetails){
        await models.orders.update({
          orderStatus: orderStatus,
          paymentStatus: paymentStatus,
          bankRefNo:bankRefNo,
          trackingId:trackingId
        },{where:{id:orderId}}).then(function(updateData){
          if(updateData){
            return res.status(200).send({data:{success:true,message:'Update Successfully'},errorNode:{errorCode:0, errorMsg:"No Error"}});
          }
        })
      }
  }else{
    return res.status(200).send({data:{success:false,message:'Enter required!'},errorNode:{errorCode:1, errorMsg:"Error"}});
  }
}


/**
 * Description: This function is developed for show OrderList
 * @param req
 * @param res user details with jwt token
 * Developer: Surajit Gouri
 */
exports.orderList = async function(req,res){
  var storeId = req.body.data.storeId;
  var customerId = req.body.data.customerId;
  if(storeId && storeId !='' && customerId && customerId != ''){
    var customerIdCheck = await models.customers.findOne({where:{ storeId:storeId,id:customerId,}}); 
    
    if(customerIdCheck){
      var list = [];
      // var orderItemList = [];
      var orderDetailsList = await models.orders.findAll({where:{storeId:storeId,customerId:customerId}, order: [['id', 'DESC']]});
      //console.log(orderDetailsList); return false;

      if(orderDetailsList.length>0){

        for(var i=0;i<orderDetailsList.length;i++){ 
          var orderId = orderDetailsList[i].id;
          var deliveryTimeslotId = orderDetailsList[i].deliveryTimeSlotId;

          var stringOrderId = 'tezcommerce '+orderId;
          var encriptedOrderId = Buffer.from(stringOrderId).toString('base64');

          var customerFeedback = await  models.feedback.findAll({
            attributes:['id','storeId','orderId'],
            where:{
              storeId:storeId,
              customerId:customerId,
              orderId:orderId,
            }
          });

          if(customerFeedback.length>0){
            var userFeedback = "yes";
          } else {
            var userFeedback = "no";
          }

          var deliveryTimeslot = await  models.deliveryTimeSlot.findOne({
            attributes:['id','storeId','label','fromTime','toTime','sequence','status'],
            where:{
                id:deliveryTimeslotId,
            }
        })

          var orderItemDetailsList = await models.orderItems.findAll({ where:{orderId:orderId},
            include:[
              {
                model:models.products,
                attributes:['id','storeId','slug', 'title', 'shortDescription', 'price','bestSellers','newArrivals','specialPrice','size','brand'],
              },
            ]
          });

          if(orderItemDetailsList.length>0){
            var orderItemList = [];
            for(var j=0; j<orderItemDetailsList.length; j++){ 

              if(orderItemDetailsList[j].wrapId && orderItemDetailsList[j].wrapId != null && orderItemDetailsList[j].wrapId != ''){
                var giftSetDetails = await models.giftSet.findOne({where:{ storeId:storeId, id:orderItemDetailsList[j].wrapId,}}); 
                if(giftSetDetails){
                  var wrapTitle = giftSetDetails.title;
                } else {
                  var wrapTitle = null;
                }
              } else {
                var wrapTitle = null;
              }

              if(orderItemDetailsList[j].configProductId && orderItemDetailsList[j].configProductId != '' && orderItemDetailsList[j].configProductId != null){

                let configProductDetails = await models.optionValue.findOne({attributes:['id','price','value'],where:{id:orderItemDetailsList[j].configProductId}});
                if(configProductDetails){
                  if(configProductDetails.price && configProductDetails.price != '' && configProductDetails.price != null){
                    var productWeight = configProductDetails.value;
                  } else {
                    var productWeight = orderItemDetailsList[j].product.weight;
                  }
                } else {
                  var productWeight = orderItemDetailsList[j].product.weight;
                }

              } else {
                var productWeight = orderItemDetailsList[j].product.weight;
              }

              orderItemList.push({
                'id'              : orderItemDetailsList[j].id,
                'storeId'         : orderItemDetailsList[j].storeId,
                'orderId'         : orderItemDetailsList[j].orderId,
                'productId'     : orderItemDetailsList[j].productId,
                'configProductId'       : orderItemDetailsList[j].configProductId,
                'name'      : orderItemDetailsList[j].name,
                'description' : orderItemDetailsList[j].description,
                'qty'      : orderItemDetailsList[j].qty,
                'originalPrice'       : orderItemDetailsList[j].originalPrice,
                'discountType'         : orderItemDetailsList[j].discountType,
                'discountPercent'       : orderItemDetailsList[j].discountPercent,
                'discounAamount'      : orderItemDetailsList[j].discounAamount,
                'price'          : orderItemDetailsList[j].price,
                'totalPrice'      : orderItemDetailsList[j].totalPrice,
                'createdAt'     : orderItemDetailsList[j].createdAt,
                'weight'     : productWeight,
                'wrapTitle'   : wrapTitle,
                'size'        : orderItemDetailsList[j].product.size,
                'productId'        : orderItemDetailsList[j].product.id,
                'productSlug'        : orderItemDetailsList[j].product.slug,
                'productTitle'        : orderItemDetailsList[j].product.title,
                'productShortDescription'        : orderItemDetailsList[j].product.shortDescription,
                'productPrice'        : orderItemDetailsList[j].product.price,
                'productSpecialPrice'        : orderItemDetailsList[j].product.specialPrice,
                'productSize'        : orderItemDetailsList[j].product.size,
                'productBrand'        : orderItemDetailsList[j].product.brand,
              });
            }
          }

          list.push({
            'id'              : orderDetailsList[i].id,
            'storeId'         : orderDetailsList[i].storeId,
            'orderNo'         : orderDetailsList[i].orderNo,
            //'customerId'      : orderDetailsList[i].orderNo,
            'orderStatus'     : orderDetailsList[i].orderStatus,
            'paymentStatus'       : orderDetailsList[i].paymentStatus,
            'shippingMethod'      : orderDetailsList[i].shippingMethod,
            'shippingDescription' : orderDetailsList[i].shippingDescription,
            'deliveryStatus'      : orderDetailsList[i].deliveryStatus,
            'deliveryTrack'       : orderDetailsList[i].deliveryTrack,
            'deliveryBoy'         : orderDetailsList[i].deliveryBoy,
            'paymentMethod'       : orderDetailsList[i].paymentMethod,
            'baseGrandTotal'      : orderDetailsList[i].baseGrandTotal,
            'couponCode'          : orderDetailsList[i].couponCode,
            'couponCodeType'      : orderDetailsList[i].couponCodeType,
            'couponCodeValue'     : orderDetailsList[i].couponCodeValue,
            'couponAmount'        : orderDetailsList[i].couponAmount,
            'shippingAmount'      : orderDetailsList[i].shippingAmount,
            'grandTotal'          : orderDetailsList[i].grandTotal,
            'walletAmount'        : orderDetailsList[i].walletAmount,
            'amountPaid'          : orderDetailsList[i].amountPaid,
            'discountAmount'      : orderDetailsList[i].discountAmount,
            'discountPercent'     : orderDetailsList[i].discountPercent,
            'promotion'           : orderDetailsList[i].promotion,
            'customerName'        : orderDetailsList[i].customerName,
            'customerEmail'       : orderDetailsList[i].customerEmail,
            'customerMobile'      : orderDetailsList[i].customerMobile,
            'billingAddress'     : orderDetailsList[i].billingAddress,
            'shippingAddress'    : orderDetailsList[i].shippingAddress,
            'shippingCity'       : orderDetailsList[i].shippingCity,
            'shippingState'      : orderDetailsList[i].shippingState,
            'shippingPin'        : orderDetailsList[i].shippingPin,
            'shippingCountry'    : orderDetailsList[i].shippingCountry,
            'cancleReason'       : orderDetailsList[i].cancleReason,
            'cancleMessage'      : orderDetailsList[i].cancleMessage,
            'giftMessage'        : orderDetailsList[i].giftMessage,
            'deliveryDate'       : orderDetailsList[i].deliveryDate,
            'deliveryTimeSlotId' : orderDetailsList[i].deliveryTimeSlotId,
            'date'               : orderDetailsList[i].createdAt,
            'tax'                : orderDetailsList[i].tax,
            'total'              : orderDetailsList[i].total,

            'customerName'       : customerIdCheck.firstName +' '+customerIdCheck.lastName,
            'customerEmail'      : customerIdCheck.email,
            'customerMobile'     : customerIdCheck.mobile,

            'deliveryTimeslot'   : deliveryTimeslot,
            // 'productDetails'     : orderItemDetailsList,
            'productDetails'      : orderItemList,
            'customerFeedback'  : userFeedback,
            'token'             : encriptedOrderId
          });
        }
      } else {
        var list = [];
      }

      return res.status(200).send({data:{success:true,list:list},errorNode:{errorCode:0, errorMsg:"No Error"}});

  
    } else {
      return res.status(200).send({data:{success:false,message:'CustomerId not found'},errorNode:{errorCode:1, errorMsg:"Error"}});
    }
  }else{
    return res.status(200).send({data:{success:false,message:'CustomerId is required!'},errorNode:{errorCode:1, errorMsg:"Error"}});
  }
}


/**
 * Description: This function is developed for cancel Order
 * @param req
 * @param res user details with jwt token
 * Developer: Surajit Gouri
 */
exports.cancelOrder = async function (req, res, next) {
  console.log("111111111111111111111"+storeId)
  var storeId = req.body.data.storeId;
  var orderId = req.body.data.orderId;
  var reason= req.body.data.reason;
  var message= req.body.data.message ? req.body.data.message : '';
  
  console.log(orderId);
  
  if (orderId && orderId != "") {
    if (reason && reason != "") {
      models.orders.update({
        orderStatus: "Cancelled",
        cancelReason: reason,
        cancelMessage: message,
      },{ where: {storeId:storeId, id: orderId } })
      .then(async function (order_update) {

       await models.orderStatusHistory.update({ orderStatus: "Canceled",
        },{where: {storeId:storeId, orderId:orderId}
        })

        let orderItems = await models.orderItems.findAll({attributes:['id','productId','qty'], where:{orderId: orderId}})
        for (let item of orderItems){
          let stockDetails = await models.inventory.findAll({attributes: ['id','stock','productId'], where:{productId: item.productId}, order: [['id', 'DESC']]})

          if(stockDetails.length>0){
            if(stockDetails.stock && stockDetails.stock != null && stockDetails.stock != ''){
              var newStock = parseInt(stockDetails[0].stock) + parseInt(item.qty);
            } else {
              var newStock = 0;
            }
          } else {
            var newStock = 0;
          }

          

          await models.inventory.create({
            productId : stockDetails[0].productId,
            storeId : storeId,
            stock : newStock,
            remarks: `${item.qty} product cancelled by ${orderId}`
          })
        }
        
        res.status(200).send({data:{success:true,message:'Order successfully cancelled.'},errorNode:{errorCode:0, errorMsg:"Order successfully cancelled."}});
      }).catch(function (error) {
        res.status(500).send({data:{success:false,message:'Order cancellation failed'},errorNode:{errorCode:1, errorMsg:"Order cancellation failed"}});
      });
    } else {
      res.status(400).send({data:{success:false,message:'Cancel Reason is required'},errorNode:{errorCode:0, errorMsg:"Cancel Reason is required"}});
    }
  } else {
    res.status(400).send({data:{success:false,message:'Order Id is required'},errorNode:{errorCode:0, errorMsg:"Order Id is required"}});
  }
};
/////////////////////////////// app order cancel end ///////////////////


// exports.booking = async function (req, res) {
//   var data = req.body.data;
//   var dt = new Date();
//   models.reservations.create({ 
//     userId: data.userId ? data.userId : null,
//     storeId: data.storeId ? data.storeId : null,
//     date: data.date ? data.date : null,
//     timeId: data.timeId ? data.timeId : null,
//     name: data.name ? data.name : null,  
//     noPeople: data.noPeople ? data.noPeople : null,
//     mobile: data.mobile ? data.mobile : null,
//     massage: data.massage ? data.massage : null,
//     purpose: data.purpose ? data.purpose : null,
//     status: data.status ? data.status : 'new'
//   }).then(function(banner_section) {
//     res.status(200).send({data: {success: true,message:'Your reservation has been submitted successfully'}});
//   }) .catch(function(error) {
//     res.status(200).send({data: {success: false, message: "Reservation not create" }});
//   });
// };

exports.booking = async function (req, res) {
      var userId = req.body.data.customerId;
      var storeId = req.body.data.storeId;
      var date = req.body.data.date;
      var timeId = req.body.data.timeId;
      var name = req.body.data.name;   
      var noPeople = req.body.data.noPeople; 
      var mobile = req.body.data.mobile;
      var massage = req.body.data.massage;
      var purpose = req.body.data.purpose;
      var status = req.body.data.status;

    if(userId && userId!='' && storeId && storeId!=''){
      await models.reservations.create({
            userId: userId,
            storeId: storeId,
            date: date,
            timeId: timeId,
            name: name,  
            noPeople: noPeople,
            mobile: mobile,
            massage: massage,
            purpose: purpose,
            status: status
        }).then(function(banner_section) {
          res.status(200).send({data: {success: true,message:'Your reservation has been submitted successfully'}});
        }).catch(function(error) {
          res.status(200).send({data: {success: false, message: "Reservation not create" }});
        });
    } else {
      res.status(400).send({data:{success:false,message:'All field are required'},errorNode:{errorCode:0, errorMsg:"All field are required"}});
    }
}


// /////////////////////////  reorder from customer start  /////////////////

exports.appReOrder = async function (req, res, next) {
  var storeId =req.body.data.storeId;
  var orderId = req.body.data.orderId;
  if (storeId && storeId !='' && orderId && orderId != "") {
    var orderDetails = await sequelize.query("SELECT id, orderNo, customerId FROM `orders` where `id` = '"+orderId+"' and `storeId` ='"+storeId+"'",{ type: Sequelize.QueryTypes.SELECT });
    if (orderDetails.length > 0 ) {
      var customerId = orderDetails[0].customerId;
      var orderItem = await sequelize.query("SELECT id, orderId, productId, configProductId, name, qty, price, totalPrice FROM `orderItems` where `storeId` = "+storeId+" and `orderId` = "+orderId,{ type: Sequelize.QueryTypes.SELECT });

      if (orderItem.length > 0) {
        // orderItem.forEach(async function (element) {
        for(let i=0; i < orderItem.length; i++){
          var cart_item_check = await sequelize.query("SELECT id, productId, customerId, configProductId FROM `carts` where `customerId` = '"+customerId+"' and `productId` = '"+orderItem[i].productId+"'",{ type: Sequelize.QueryTypes.SELECT });
          if (cart_item_check.length <= 0 ) {
            models.carts.create({
              storeId: storeId,
              customerId: customerId,
              productId: orderItem[i].productId,
              configProductId: orderItem[i].configProductId ? orderItem[i].configProductId : null,
              itemQuantity: orderItem[i].qty
            }).then(async function (cart) {
              // var addon_order_item = await sequelize.query("SELECT id, orderId, productId, parentsProductId, name, qty, price, totalPrice FROM `orderItems` where `parentsProductId` IS not null and `orderId` = "+orderId,{ type: Sequelize.QueryTypes.SELECT });
              // if (addon_order_item.length > 0) {
              //   addon_order_item.forEach(async function (addon_element) {
              //     var addon_cart_item_check = await sequelize.query("SELECT id, productId, customerId, configProductId FROM `carts` where `customerId` = '"+customerId+"' and `productId` = '"+addon_element.parentsProductId+"'",{ type: Sequelize.QueryTypes.SELECT });
              //     // if (addon_cart_item_check.length > 0) {
              //     //   models.cart_addon.destroy({
              //     //     where: { customerId: customerId, productId: addon_element.productId, parentsProductId: addon_element.parentsProductId },
              //     //   })
              //     //   models.cart_addon.create({
              //     //     cart_id: addon_cart_item_check[0].id,
              //     //     parentsProductId: addon_element.parentsProductId,
              //     //     customerId: customerId,
              //     //     productId: addon_element.productId,
              //     //     item_quantity: addon_element.qty
              //     //   })
              //     // }
              //   }, this);
              // }

              if(Number(orderItem.length) == Number(i+1)){
                var cart_item_count = await models.carts.findAll({attributes:['id'], where:{customerId: customerId, storeId : storeId}})
                return res.status(200).send({ data:{success:true, message: "Previous order item successfully added in your cart", cart_item_count : cart_item_count.length}, errorNode:{errorCode:0, errorMsg:"No Error"}});
              }
            })
          } else {
            models.carts.destroy({
              where: { customerId: customerId, productId: orderItem[i].productId },
            })
            models.carts.create({
              storeId: storeId,
              customerId: customerId,
              productId: orderItem[i].productId,
              itemQuantity: orderItem[i].qty
            }).then(async function (cart) {
              // var addon_order_item = await sequelize.query("SELECT id, orderId, productId, parentsProductId, name, qty, price, totalPrice FROM `orderItems` where `parentsProductId` IS not null and `orderId` = "+orderId,{ type: Sequelize.QueryTypes.SELECT });
              // if (addon_order_item.length > 0) {
              //   addon_order_item.forEach(async function (addon_element) {
              //     var addon_cart_item_check = await sequelize.query("SELECT id, productId, customerId, configProductId FROM `cart` where `customerId` = '"+customerId+"' and `productId` = '"+addon_element.parentsProductId+"'",{ type: Sequelize.QueryTypes.SELECT });
              //     // if (addon_cart_item_check.length > 0) {
              //     //   models.cart_addon.destroy({
              //     //     where: { customerId: customerId, productId: addon_element.productId, parentsProductId: addon_element.parentsProductId },
              //     //   })
              //     //   models.cart_addon.create({
              //     //     cart_id: addon_cart_item_check[0].id,
              //     //     parentsProductId: addon_element.parentsProductId,
              //     //     customerId: customerId,
              //     //     productId: addon_element.productId,
              //     //     item_quantity: addon_element.qty
              //     //   })
              //     // }
              //   }, this);
              // }

              if(Number(orderItem.length) == Number(i+1)){
                var cart_item_count = await models.carts.findAll({attributes:['id'], where:{customerId: customerId, storeId : storeId}})
                return res.status(200).send({ data:{success:true, message: "Previous order item successfully added in your cart", cart_item_count : cart_item_count.length}, errorNode:{errorCode:0, errorMsg:"No Error"}});
              }
            })
          }
        }
        // }, this);
      } else {
        return res.status(200).send({ data:{success:false,message: "Order item not found"}, errorNode:{errorCode:1, errorMsg:"error"}});
      }
    } else {
      return res.status(200).send({ data:{success:false, message: "Order not found"}, errorNode:{errorCode:1, errorMsg:"error"}});
    }
  } else {
    return res.status(200).send({ data:{success:false, message: "Order Id and storeId is required"}, errorNode:{errorCode:1, errorMsg:"error"}});
  }
}

// ///////////////////////// reorder from customer end /////////////////


exports.orderShow = async function(req,res) {
  var storeId = req.body.data.storeId;
  var customerId = req.body.data.customerId;
  var amountPaid = req.body.data.amountPaid;
  var deliveryCharges = req.body.data.deliverycharge;

  var value = [];

  //  console.log('aaaaaaaaaaaaaaaaaaaaaaaa-----'+deliveryCharges)
  if(customerId && customerId != '' && storeId && storeId !=''){

    let cartitems = await models.carts.findAll({ where:{ storeId:storeId, customerId:customerId },
                                                include:[
                                                  {
                                                    model:models.products,
                                                    attributes:['id','title','price','specialPrice'],
                                                  },
                                                ]
                                            })

    if(cartitems.length>0){

      ////////////////////////// catelog price rule start /////////////////////////////////////
      var catelogPriceCurrentDate = yyyy_mm_dd();
      var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
      if(catelogPriceRuleDetails.length>0){
        var isCatelogPriceRule = 'yes';
      } else {
        var isCatelogPriceRule = 'no';
      }
      ////////////////////////// catelog price rule end /////////////////////////////////////

      ////////////////////////// cart price rule start /////////////////////////////////////
        
      var customerOrderDetails = await models.orders.findAll({ attributes:['id','customerId','amountPaid'], where:{storeId:storeId, customerId:customerId }});
      var cartPriceCurrentDate = yyyy_mm_dd();
      if(customerOrderDetails.length>0){
        // var cartPriceRuleDetails = await models.cartPriceRule.findAll({ where:{storeId:storeId, couponType:'noCoupon', customerType:'existing', $or: [{offerFrom: { $lte: cartPriceCurrentDate }}, {offerTo: { $gte: cartPriceCurrentDate }}] }});
        var cartPriceRuleDetails = await models.cartPriceRule.findAll({ where:{storeId:storeId, couponType:'noCoupon', customerType:'existing', status:'Yes', offerFrom: { $lte: cartPriceCurrentDate }, offerTo: { $gte: cartPriceCurrentDate } }});
      } else{
        // var cartPriceRuleDetails = await models.cartPriceRule.findAll({ where:{storeId:storeId, couponType:'noCoupon', customerType:'new', $or: [{offerFrom: { $lte: cartPriceCurrentDate }}, {offerTo: { $gte: cartPriceCurrentDate }}] }});
        var cartPriceRuleDetails = await models.cartPriceRule.findAll({ where:{storeId:storeId, couponType:'noCoupon', customerType:'new', status:'Yes', offerFrom: { $lte: cartPriceCurrentDate }, offerTo: { $gte: cartPriceCurrentDate } }});
      }
      if(cartPriceRuleDetails.length>0){
        console.log("1111111111111111111111111")

        var cartPriceRuleAttributeDetails = await models.cartPriceRuleAttributes.findAll({ where:{storeId:storeId, cartPriceRuleId : cartPriceRuleDetails[0].id, attributeName:'Category' }});
        if(cartPriceRuleAttributeDetails.length>0){
          console.log("11111000000000000000000000000000000cartPriceRuleAttributeDetails---"+cartPriceRuleAttributeDetails.length)
          if(cartitems.length>0){
            var cartProductTotalPrice = 0;
            for(var j=0; j<cartPriceRuleAttributeDetails.length; j++){
              var cartProductPrice = 0;
              for(var i=0; i<cartitems.length; i++){

                var productCategoryCheck = await models.productCategory.findOne({ where:{storeId:storeId, productId: cartitems[i].productId, parentCategoryId: Number(cartPriceRuleAttributeDetails[j].attributeValue) }});
                if(productCategoryCheck){

                  ////////////////////////// catelog price rule start /////////////////////////////////////

                  if(cartitems[i].configProductId && cartitems[i].configProductId != '' && cartitems[i].configProductId != null){
                    var configProductDetails = await models.optionValue.findOne({attributes:['id','price'],where:{id:cartitems[i].configProductId}});
                    if(configProductDetails){
                      if(configProductDetails.price && configProductDetails.price != '' && configProductDetails.price != null){
    
                        	if(isCatelogPriceRule == 'yes'){
    
                        		var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, cartitems[i].productId, Number(configProductDetails.price), catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
                            if(productCatalogPriceDetails.discountPrice != null){
                              var productPrice = productCatalogPriceDetails.discountPrice*cartitems[i].itemQuantity;
                            } else {
                              var productPrice = Number(cartitems[i].product.price)*cartitems[i].itemQuantity;
                            }
                  
                        	} else {
                        		var productPrice = Number(cartitems[i].itemQuantity) * Number(cartitems[i].product.price);
                          }
                          
                      } else {
                        var productPrice = Number(cartitems[i].product.price)*cartitems[i].itemQuantity;
                      }
                    } else {
                      var productPrice = Number(cartitems[i].product.price)*cartitems[i].itemQuantity;
                    }
                  } else {
                    if(isCatelogPriceRule == 'yes'){
                      var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, cartItem[i].productId, Number(cartitems[i].product.price), catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
  
                      if(productCatalogPriceDetails.discountPrice != null){
                        var productPrice = productCatalogPriceDetails.discountPrice*cartitems[i].itemQuantity;
                      } else {
                        var productPrice = Number(cartitems[i].product.price)*cartitems[i].itemQuantity;
                      }
  
                    } else {
                      var productPrice = Number(cartitems[i].product.price)*cartitems[i].itemQuantity;
                    }
                  }


                  // if(isCatelogPriceRule == 'yes'){
                  //   var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, cartItem[i].productId, Number(cartitems[i].product.price), catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

                  //   if(productCatalogPriceDetails.discountPrice != null){
                  //     var productPrice = productCatalogPriceDetails.discountPrice*cartitems[i].itemQuantity;
                  //   } else {
                  //     var productPrice = Number(cartitems[i].product.price)*cartitems[i].itemQuantity;
                  //   }

                  // } else {
                  //   var productPrice = Number(cartitems[i].product.price)*cartitems[i].itemQuantity;
                  // }

                  ////////////////////////// catelog price rule end /////////////////////////////////////
                  
                  // var productPrice = Number(cartitems[i].product.price)*cartitems[i].itemQuantity;
                } else {
                  var productPrice = 0;
                }
                cartProductPrice +=productPrice;
                console.log("1111111111111111111111111---cartProductPrice----"+cartProductPrice)
              }
              cartProductTotalPrice +=cartProductPrice;
              console.log("1111111111111111111111111cartProductTotalPrice----"+cartProductTotalPrice)
            }
          } else {
            var cartProductTotalPrice = 0;
            // var cartProductPrice = 0;
          }
        } else {
          var cartProductTotalPrice = Number(amountPaid)-Number(deliveryCharges);
        }

        console.log("1111222222222222222222222222222222222cartProductTotalPrice----"+cartProductTotalPrice)
        console.log("1111111111111111111111111")
        console.log("1111111111111111111111111")

        if(cartPriceRuleDetails[0].discountType == 'fixed'){
          if(cartPriceRuleDetails[0].purchaseLimit != '' && cartPriceRuleDetails[0].purchaseLimit != null ){
            if( Number(cartProductTotalPrice) >= Number(cartPriceRuleDetails[0].purchaseLimit)){
              var newAmountPaid = Math.round(Number(amountPaid)-Number(cartPriceRuleDetails[0].discountValue))
              var discountAmount = Number(cartPriceRuleDetails[0].discountValue);
              var discountPercent = null;
            } else {
              var newAmountPaid = amountPaid;
              var discountAmount = null;
              var discountPercent = null;
            }
            
          } else {
            var newAmountPaid = Math.round(Number(amountPaid)-Number(cartPriceRuleDetails[0].discountValue))
            var discountAmount = Number(cartPriceRuleDetails[0].discountValue);
            var discountPercent = null;
          }
        } else {

          if(cartPriceRuleDetails[0].minDiscountValue != '' && cartPriceRuleDetails[0].minDiscountValue != null && cartPriceRuleDetails[0].maxDiscountValue != '' && cartPriceRuleDetails[0].maxDiscountValue != null){
            
            if( Math.round((Number(cartProductTotalPrice))*(cartPriceRuleDetails[0].discountValue/100)) <= Number(cartPriceRuleDetails[0].maxDiscountValue) && Math.round((Number(cartProductTotalPrice))*(cartPriceRuleDetails[0].discountValue/100)) >= Number(cartPriceRuleDetails[0].minDiscountValue)){
              var newAmountPaid = Math.round((Number(amountPaid)-(Number(cartProductTotalPrice))*((cartPriceRuleDetails[0].discountValue)/100)))
              var discountAmount = Math.round(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100));
              var discountPercent = Number(cartPriceRuleDetails[0].discountValue);

            } else if( (Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)) <= Number(cartPriceRuleDetails[0].minDiscountValue)){
              var newAmountPaid = amountPaid;
              var discountAmount = null;
              var discountPercent = null;
            } else if( (Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)) >= Number(cartPriceRuleDetails[0].maxDiscountValue)){
              var newAmountPaid = Number(amountPaid)-Number(cartPriceRuleDetails[0].maxDiscountValue);
              var discountAmount = Number(cartPriceRuleDetails[0].maxDiscountValue);
              var discountPercent = Number(cartPriceRuleDetails[0].discountValue);
            } else {
              var newAmountPaid = amountPaid;
              var discountAmount = null;
              var discountPercent = null;
            }

          } else if (cartPriceRuleDetails[0].minDiscountValue != '' && cartPriceRuleDetails[0].minDiscountValue != null && cartPriceRuleDetails[0].maxDiscountValue == null){

            if( (Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)) >= Number(cartPriceRuleDetails[0].minDiscountValue)){
              var newAmountPaid = Math.round(Number(amountPaid)-(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)))
              var discountAmount = Math.round((Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)));
              var discountPercent = Number(cartPriceRuleDetails[0].discountValue);
            } else {
              var newAmountPaid = amountPaid;
              var discountAmount = null;
              var discountPercent = null;
            }

          } else if (cartPriceRuleDetails[0].maxDiscountValue != '' && cartPriceRuleDetails[0].maxDiscountValue != null && cartPriceRuleDetails[0].minDiscountValue == null){

            if( Math.round(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)) <= Number(cartPriceRuleDetails[0].maxDiscountValue)){
              var newAmountPaid = Math.round(Number(amountPaid)-(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)))
              var discountAmount = Math.round(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100));
              var discountPercent = Number(cartPriceRuleDetails[0].discountValue);
            } else {
              var newAmountPaid = Math.round(Number(amountPaid)-Number(cartPriceRuleDetails[0].maxDiscountValue));
              var discountAmount = Number(cartPriceRuleDetails[0].maxDiscountValue);
              var discountPercent = Number(cartPriceRuleDetails[0].discountValue);
            }

          } else if (cartPriceRuleDetails[0].minDiscountValue == null && cartPriceRuleDetails[0].maxDiscountValue == null){
            var newAmountPaid = Math.round(Number(amountPaid)-(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100)))
            var discountAmount = Math.round(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].discountValue/100));
            var discountPercent = Number(cartPriceRuleDetails[0].discountValue);
          }
        }

      } else {
        var newAmountPaid = amountPaid;
        var discountAmount = null;
        var discountPercent = null;
      }

      value.push({
        "userAmountPaid": newAmountPaid,
        "userDiscountAmount": discountAmount,
        "userDiscountPercent": discountPercent,
      })

      ////////////////////////// cart price rule end /////////////////////////////////////
      
      

      return res.status(200).send({ data:{success:true,orderDetails:value[0], message:'Success'}, errorNode:{errorCode:0, errorMsg:""}});
 
    } else {
      return res.status(200).send({ data:{success:false,message:'Your cart is empty'}, errorNode:{errorCode:1, errorMsg:''}});
    }

  } else {
    return res.status(200).send({ data:{success:false,message:'Customer and Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
}

exports.codDetails = async function (req, res, next) {
  var storeId = req.body.data.storeId;
  if(storeId && storeId!=''){

    const codDetails = await models.siteSettings.findOne({attributes:['id','title','value'], where:{storeId:storeId, status: 'Yes', id: 57 }})
    
    return res.status(200).send({ data:{success:true, details:codDetails}, errorNode:{errorCode:0, errorMsg:"No Error"}});

  }else{
    return res.status(200).send({ data:{success:false, details:[], message:"Store id is required"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
  }
};
