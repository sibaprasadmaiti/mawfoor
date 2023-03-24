var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
var flash = require('connect-flash');
var config = require("../../config/config.json");
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

/**
* Description: Coupon List
* @param req
* @param res user details with jwt token
* Developer:Avijit Das
**/



exports.couponList = async function(req, res, next) {
    
    var storeId = req.body.data.storeId;
    var customerId = req.body.data.customerId;
    var currentDate = current_dd_mm_yyyy();
    var value = [];
	if(storeId && storeId !='' && customerId && customerId !='' ){

        var availableCoupons = await models.coupon.findAll({ where:{ status:'Yes',storeId: storeId,} });
                
            //for( var i=0; i<availableCoupons.length; i++){
            for( var i of availableCoupons){
                
                //var couponId =availableCoupons[i].id;
                var cutomerUsedCoupon = await models.couponTransaction.findOne({ where:{ storeId:storeId, customerId :customerId,couponId: i.id} });

                if ( i.dateFrom && i.dateFrom != "" && i.dateFrom != null && i.dateTo && i.dateTo != "" && i.dateTo != null) {
                    if ( currentDate >= i.dateFrom  && currentDate <= i.dateTo ) {
                        if(!cutomerUsedCoupon){
                            value.push({
                            
                                "id": i.id,
                                "couponType": i.couponType,
                                "couponValue": i.couponValue,
                                "dateFrom":i.dateFrom,
                                "dateTo": i.dateTo,
                                "description": i.description,
                                "shortDescription": i.shortDescription,
                                "couponCode": i.couponCode,
                                "purchaseLimit": i.purchaseLimit,
                                "termsAndConditions": i.termsAndConditions,
                                "status": i.status,
                            })
                        }
                    }    
                }  else if ( i.dateFrom && i.dateFrom != "" && i.dateFrom != null && !i.dateTo ) {
                    if(currentDate >= i.dateFrom){
                        if(!cutomerUsedCoupon){
                            value.push({
                           
                                "id": i.id,
                                "couponType": i.couponType,
                                "couponValue": i.couponValue,
                                "dateFrom":i.dateFrom,
                                "dateTo": i.dateTo,
                                "description": i.description,
                                "shortDescription": i.shortDescription,
                                "couponCode": i.couponCode,
                                "purchaseLimit": i.purchaseLimit,
                                "termsAndConditions": i.termsAndConditions,
                                "status": i.status,
                            })
                        }
                    }
                }  else if (i.dateTo && i.dateTo != "" && i.dateTo != null && !i.dateFrom){
                    if(currentDate <= i.dateTo){
                        if(!cutomerUsedCoupon){
                            value.push({
                               
                                "id": i.id,
                                "couponType": i.couponType,
                                "couponValue": i.couponValue,
                                "dateFrom":i.dateFrom,
                                "dateTo": i.dateTo,
                                "description": i.description,
                                "shortDescription": i.shortDescription,
                                "couponCode": i.couponCode,
                                "purchaseLimit": i.purchaseLimit,
                                "termsAndConditions": i.termsAndConditions,
                                "status": i.status,
                            })
                        }
                    }
                }  else {

                        if(!cutomerUsedCoupon){
                            value.push({
                                
                                "id": i.id,
                                "couponType": i.couponType,
                                "couponValue": i.couponValue,
                                "dateFrom":i.dateFrom,
                                "dateTo": i.dateTo,
                                "description": i.description,
                                "shortDescription": i.shortDescription,
                                "couponCode": i.couponCode,
                                "purchaseLimit": i.purchaseLimit,
                                "termsAndConditions": i.termsAndConditions,
                                "status": i.status,
                            })
                        }
                }

            }
            if (value.length > 0) {
                return res.status(200).send({ data:{success:true, availableCoupons:value}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            } else{
                return res.status(200).send({ data:{success:false, availableCoupons:value, message: "No offer available" }, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }

	}else {
		return res.status(200).send({ data:{success:false, details:"", message : "All fields are required"}, errorNode:{errorCode:1, errorMsg:"error"}});
	}
};



//   exports.couponAmount = async function(req,res){
//       var storeId = req.body.data.storeId;
//       var couponCode = req.body.data.couponCode;
//       var customerId = req.body.data.customerId;

//         if( storeId && storeId!='' && couponCode && couponCode !='' && customerId && customerId !='' ){
//             var customerUsedCoupon = await models.couponTransaction.findOne({ where:{storeId:storeId,customerId:customerId,couponCode:couponCode} });
            
//             if(customerUsedCoupon<=0){
//                 var couponDetails = await models.coupon.findOne({ where:{storeId:storeId,couponCode:couponCode} });
    
//                     if(couponDetails){
//                         return res.status(200).send({ data:{success:true, couponDetails:couponDetails}, errorNode:{errorCode:0, errorMsg:"No Error"}});
//                     } else{
//                         return res.status(200).send({ data:{success:false, message: "Coupon not found"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
//                     }

//                 } else {
//                     return res.status(200).send({ data:{success:false, message: "Coupon already used"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
//                 }

//         } else{
//             return res.status(200).send({ data:{success:false,  message: "customer id and couponcode are required"}, errorNode:{errorCode:1, errorMsg:"No Error"}});
//         }
//   }

exports.couponAmount = async function(req,res){
    const storeId = req.body.data.storeId;
    const couponCode = req.body.data.couponCode;
    const customerId = req.body.data.customerId;

      if( storeId && storeId!='' && couponCode && couponCode !='' && customerId && customerId !='' ){
          const customerUsedCoupon = await models.couponTransaction.count({ where:{storeId:storeId,customerId:customerId,couponCode:couponCode} });
          console.log("111111111111111111---"+customerUsedCoupon)
          if(customerUsedCoupon <= 0){
              const couponDetails = await models.coupon.findOne({ where:{storeId:storeId,couponCode:couponCode, status: "Yes"} });
  
              if(couponDetails){
                  return res.status(200).send({ data:{success:true, couponDetails:couponDetails}, errorNode:{errorCode:0, errorMsg:"No Error"}});
              } else{
                  return res.status(200).send({ data:{success:false, message: "Coupon not found"}, errorNode:{errorCode:1, errorMsg:"No Error"}});
              }

          } else {
              return res.status(200).send({ data:{success:false, message: "Coupon already used"}, errorNode:{errorCode:1, errorMsg:"No Error"}});
          }

      } else{
          return res.status(200).send({ data:{success:false,  message: "StoreId, customerId and couponcode are required"}, errorNode:{errorCode:1, errorMsg:"No Error"}});
      }
}






function current_dd_mm_yyyy() {
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
    //return day + month + year;
    return year + "-" + month + "-" + day;
}


exports.discountAmount = async function(req,res){
    const storeId = req.body.data.storeId;
    const couponCode = req.body.data.couponCode;
    const customerId = req.body.data.customerId;
    const amountPaid = req.body.data.amountPaid;
    const deliveryCharges = req.body.data.deliveryCharges ? req.body.data.deliveryCharges : 0;
    var value = [];
    var currentDate = yyyy_mm_dd();

    console.log(req.body.data)
    console.log(req.body.data.deliveryCharges)
    // if( storeId && storeId!='' && couponCode && couponCode !='' && customerId && customerId !='' && amountPaid && amountPaid != '' && deliveryCharges && deliveryCharges != ''){
    if( storeId && storeId!='' && couponCode && couponCode !='' && customerId && customerId !='' && amountPaid && amountPaid !=''){
        const customerUsedCoupon = await models.couponTransaction.count({ where:{storeId:storeId,customerId:customerId,couponCode:couponCode} });
        
        if(customerUsedCoupon <= 0){

            ////////////////////////// cart price rule start /////////////////////////////////////

            var cartPriceRuleDetails = await models.coupon.findAll({ where:{storeId:storeId, couponCode:couponCode, dateFrom:{ $lte: currentDate}, dateTo: { $gte: currentDate} }});

            if(cartPriceRuleDetails.length>0){
                console.log("1111111111111111111111111")

                if(cartPriceRuleDetails[0].customerType && cartPriceRuleDetails[0].customerType == 'new'){

                    var newCustomerDetails = await models.orders.findAll({ where:{ storeId:storeId, customerId:customerId }});
                    if(newCustomerDetails.length > 0 ){

                        var newAmountPaid = amountPaid;
                        var discountAmount = null;
                        var discountPercent = null;
                        var couponId = null;
                        var message = "This Coupon is for New Customer";
                        var success = false;

                    } else {

                        var cartProductTotalPrice = Number(amountPaid)-Number(deliveryCharges);

                        if(cartPriceRuleDetails[0].couponType == 'amount'){
                            if(cartPriceRuleDetails[0].purchaseLimit != '' && cartPriceRuleDetails[0].purchaseLimit != null ){
                                if( Number(cartProductTotalPrice) >= Number(cartPriceRuleDetails[0].purchaseLimit)){
                                    var newAmountPaid = Math.round(Number(amountPaid)-Number(cartPriceRuleDetails[0].couponValue))
                                    var discountAmount = Number(cartPriceRuleDetails[0].couponValue);
                                    var discountPercent = null;
                                    var message = "Coupon found";
                                } else {
                                    var newAmountPaid = amountPaid;
                                    var discountAmount = null;
                                    var discountPercent = null;
                                    var message = "You purchase Limit not crossed";
                                }
                                
                            } else {
                                var newAmountPaid = Math.round(Number(amountPaid)-Number(cartPriceRuleDetails[0].couponValue))
                                var discountAmount = Number(cartPriceRuleDetails[0].couponValue);
                                var discountPercent = null;
                                var message = "Coupon found";
                            }
                        } else {

                            if(cartPriceRuleDetails[0].purchaseLimit != '' && cartPriceRuleDetails[0].purchaseLimit != null ){
                                if( Number(cartProductTotalPrice) >= Number(cartPriceRuleDetails[0].purchaseLimit)){
                                    var newAmountPaid = Math.round(Number(amountPaid)-(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].couponValue/100)))
                                    var discountAmount = Math.round(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].couponValue/100));
                                    var discountPercent = Number(cartPriceRuleDetails[0].couponValue);
                                    var message = "Coupon found";
                                } else {
                                    var newAmountPaid = amountPaid;
                                    var discountAmount = null;
                                    var discountPercent = null;
                                }
                                
                            } else {
                                var newAmountPaid = Math.round(Number(amountPaid)-(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].couponValue/100)))
                                var discountAmount = Math.round(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].couponValue/100));
                                var discountPercent = Number(cartPriceRuleDetails[0].couponValue);
                                var message = "Coupon found";
                            }
                        }

                        var couponId = cartPriceRuleDetails[0].id;
                        // var message = "Coupon found";
                        var success = true;

                    }

                } else {

                    var couponCustomerDetails = await models.couponCustomer.findAll({ where:{ couponCode:couponCode, customerId:customerId }});

                    if(couponCustomerDetails.length>0){

                    
                        var cartProductTotalPrice = Number(amountPaid)-Number(deliveryCharges);

                        console.log("1111222222222222222222222222222222222cartProductTotalPrice----"+cartProductTotalPrice)
                        console.log("1111111111111111111111111")
                        console.log("1111111111111111111111111")

                        if(cartPriceRuleDetails[0].couponType == 'amount'){
                            if(cartPriceRuleDetails[0].purchaseLimit != '' && cartPriceRuleDetails[0].purchaseLimit != null ){
                                if( Number(cartProductTotalPrice) >= Number(cartPriceRuleDetails[0].purchaseLimit)){
                                    var newAmountPaid = Math.round(Number(amountPaid)-Number(cartPriceRuleDetails[0].couponValue))
                                    var discountAmount = Number(cartPriceRuleDetails[0].couponValue);
                                    var discountPercent = null;
                                    var message = "Coupon found";
                                } else {
                                    var newAmountPaid = amountPaid;
                                    var discountAmount = null;
                                    var discountPercent = null;
                                    var message = "You purchase Limit not crossed";
                                }
                                
                            } else {
                                var newAmountPaid = Math.round(Number(amountPaid)-Number(cartPriceRuleDetails[0].couponValue))
                                var discountAmount = Number(cartPriceRuleDetails[0].couponValue);
                                var discountPercent = null;
                                var message = "Coupon found";
                            }
                        } else {

                            if(cartPriceRuleDetails[0].purchaseLimit != '' && cartPriceRuleDetails[0].purchaseLimit != null ){
                                if( Number(cartProductTotalPrice) >= Number(cartPriceRuleDetails[0].purchaseLimit)){
                                    var newAmountPaid = Math.round(Number(amountPaid)-(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].couponValue/100)))
                                    var discountAmount = Math.round(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].couponValue/100));
                                    var discountPercent = Number(cartPriceRuleDetails[0].couponValue);
                                    var message = "Coupon found";
                                } else {
                                    var newAmountPaid = amountPaid;
                                    var discountAmount = null;
                                    var discountPercent = null;
                                }
                                
                            } else {
                                var newAmountPaid = Math.round(Number(amountPaid)-(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].couponValue/100)))
                                var discountAmount = Math.round(Number(cartProductTotalPrice)*(cartPriceRuleDetails[0].couponValue/100));
                                var discountPercent = Number(cartPriceRuleDetails[0].couponValue);
                                var message = "Coupon found";
                            }
                        }

                        var couponId = cartPriceRuleDetails[0].id;
                        // var message = "Coupon found";
                        var success = true;

                    } else {
                        var newAmountPaid = amountPaid;
                        var discountAmount = null;
                        var discountPercent = null;
                        var couponId = null;
                        var message = "This Coupon is not for You";
                        var success = false;
                    }
                }

            } else {
                var newAmountPaid = amountPaid;
                var discountAmount = null;
                var discountPercent = null;
                var couponId = null;
                var message = "Coupon not found";
                var success = false;
            }

            value.push({
                                
                // "id": cartPriceRuleDetails[0].id,
                // "title": cartPriceRuleDetails[0].title,
                // "description": cartPriceRuleDetails[0].description,
                // "discountType":cartPriceRuleDetails[0].discountType,
                // "discountValue": cartPriceRuleDetails[0].discountValue,
                // "minDiscountValue": cartPriceRuleDetails[0].minDiscountValue,
                // "maxDiscountValue": cartPriceRuleDetails[0].maxDiscountValue,
                // "purchaseLimit": cartPriceRuleDetails[0].purchaseLimit,
                // "customerType": cartPriceRuleDetails[0].customerType,
                // "couponType": cartPriceRuleDetails[0].couponType,
                "couponCode": couponCode,
                "userAmountPaid": newAmountPaid,
                "userDiscountAmount": discountAmount,
                "userDiscountPercent": discountPercent,
                "couponId": couponId
            })

            return res.status(200).send({ data:{success:success, couponDetails:value[0], message : message}, errorNode:{errorCode:0, errorMsg:"No Error"}});

            ////////////////////////// cart price rule end /////////////////////////////////////

        } else {
            return res.status(200).send({ data:{success:false, message: "Coupon already used"}, errorNode:{errorCode:1, errorMsg:"No Error"}});
        }

    } else{
        return res.status(200).send({ data:{success:false,  message: "StoreId, customerId and couponcode are required"}, errorNode:{errorCode:1, errorMsg:"No Error"}});
    }
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


exports.customerCouponRequest = async function (req, res, next) {

    var storeId = req.body.data.storeId;
    var customerId = req.body.data.customerId;

    if(storeId && storeId!=''){
        if(customerId && customerId!=''){
  
            models.customerCouponRequest.create({
                storeId: storeId,
                customerId: customerId,
                status: 'Request',
            })
            
            return res.status(200).send({ data:{success:true, message:"Customer successfully coupon applied"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
        }else{
            return res.status(200).send({ data:{success:false, message:"Customer id is required"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
        }
  
    }else{
      return res.status(200).send({ data:{success:false, message:"Store id is required"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
    }
  };