var models = require("../../models");
var config = require("../../config/config.json");
var Sequelize = require("sequelize");
var sequelize = new Sequelize(
config.development.database, 
config.development.username,
config.development.password, {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});

// var fs = require('fs')
var fs = require('file-system');
// var push_notifications = require('../../helpers/push_notifications');



exports.salesmanLogin= async function (req, res, next) {
  var mobile = req.body.data.mobile
  var hostName = req.body.data.hostName

  if(hostName && hostName != '') {
    var hostDetails = await models.stores.findOne({ where: {cCode: hostName}});
    if(hostDetails) {
      if(mobile && mobile != '') {
        var customer = await models.salesman.findOne({ where: {phone: mobile, storeId:hostDetails.id}});
        var msg = '';
        if(customer != null){
          msg = "Existing user";
          var otp = Math.floor(1000 + Math.random() * 9000);
          models.salesman.update({ 
            otp: otp
          },{where:{id:customer.id}}).then(function(val) {
              customer.otp=otp;
            // res.status(200).send({ success: true, otp: otp, message:msg }); 
            return res.status(200).send({ data:{success:true, otp: otp, message:msg, storeId:hostDetails.id}, errorNode:{errorCode:0, errorMsg:""}});
          });

        } else{ msg = "No user found";
          // res.status(200).send({ success: false, message:msg });
          return res.status(200).send({ data:{success:false,message:msg}, errorNode:{errorCode:1, errorMsg:''}});
        }    
      } else {
        // res.status(200).send({ success: false, message : "Mobile number are required" });
        return res.status(200).send({ data:{success:false,message:'Mobile number is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      // res.status(200).send({ success: false, message : "Mobile number are required" });
      return res.status(200).send({ data:{success:false,message:'This host name is not registered'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    // res.status(200).send({ success: false, message : "Mobile number are required" });
    return res.status(200).send({ data:{success:false,message:'Host name is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

// exports.salesmanOtpchecking= async function (req, res, next) {

//   var mobile = req.body.data.mobile;
//   var otpcheck = req.body.data.otp;
//   var storeId = req.body.data.storeId;

//   if(storeId && storeId != '') {
//     if(mobile && mobile != '' && otpcheck && otpcheck != '') {
//       var salesman = await models.salesman.findOne({ attributes: ['id', 'storeId', 'name', 'email', 'phone'], where: {phone: mobile, otp: otpcheck, storeId:storeId}});
//       var msg = '';
//       if(salesman != null){
//         msg = "Valid otp";
      
//         // res.status(200).send({ success: true, userDetails: customer, message:msg });
//         return res.status(200).send({ data:{success:true, userDetails: salesman, message:msg}, errorNode:{errorCode:0, errorMsg:""}});
//       } else{ msg = "Invalid otp";
//         // res.status(200).send({ success: false, message:msg });
//         return res.status(200).send({ data:{success:false,message:msg}, errorNode:{errorCode:1, errorMsg:''}});
//       }    
//     } else {
//       // res.status(200).send({ success: false, message : "Mobile number and OTP both are required" });
//       return res.status(200).send({ data:{success:false,message:'Mobile number and OTP both are required'}, errorNode:{errorCode:1, errorMsg:''}});
//     }
//   } else {
//     // res.status(200).send({ success: false, message : "Mobile number and OTP both are required" });
//     return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
//   }
// };

exports.salesmanOtpchecking= async function (req, res, next) {

  var mobile = req.body.data.mobile;
  var otpcheck = req.body.data.otp;
  var storeId = req.body.data.storeId;
  var resultArray = [];

  if(storeId && storeId != '') {
    if(mobile && mobile != '' && otpcheck && otpcheck != '') {
      var salesman = await models.salesman.findOne({ attributes: ['id', 'storeId', 'name', 'email', 'phone', 'address', 'image'], where: {phone: mobile, otp: otpcheck, storeId:storeId}});
      var msg = '';
      if(salesman != null){

        resultArray.push({
          "id": salesman.id,
          "storeId": salesman.storeId,
          "name": salesman.name,
          "email": salesman.email,
          "phone": salesman.phone,
          "address": salesman.address,
          "image": (salesman.image != '' && salesman.image != null) ? req.app.locals.baseurl + 'admin/salesman/' + salesman.image : req.app.locals.baseurl + 'admin/salesman/no_image.jpg',
      });

        msg = "Valid otp";
        return res.status(200).send({ data:{success:true, userDetails: resultArray[0], message:msg}, errorNode:{errorCode:0, errorMsg:""}});
      } else{ msg = "Invalid otp";
        return res.status(200).send({ data:{success:false,message:msg}, errorNode:{errorCode:1, errorMsg:''}});
      }    
    } else {
      return res.status(200).send({ data:{success:false,message:'Mobile number and OTP both are required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.salesmanResendOtp= async function (req, res, next) {
  var mobile = req.body.data.mobile
  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    if(mobile && mobile != '') {
      var salesmanDetails = await models.salesman.findOne({ where: {phone: mobile, storeId:storeId}});
      var msg = '';
      if(salesmanDetails != null){
        msg = "Resend OTP successfully sent";
        var otp = Math.floor(1000 + Math.random() * 9000);
        models.salesman.update({ 
          otp: otp
        },{where:{id:salesmanDetails.id}}).then(function(val) {
          salesmanDetails.otp=otp;
          // res.status(200).send({ success: true, userdetails: customer, message:msg }); 
          return res.status(200).send({ data:{success:true, otp: salesmanDetails.otp, storeId: salesmanDetails.storeId, message:msg}, errorNode:{errorCode:0, errorMsg:""}});
        });

      } else{ msg = "No user found";
        // res.status(200).send({ success: false, message:msg });
        return res.status(200).send({ data:{success:false,message:msg}, errorNode:{errorCode:1, errorMsg:''}});
      }    
    } else {
      // res.status(200).send({ success: false, message : "Mobile number and OTP both are required"});
      return res.status(200).send({ data:{success:false,message:'Mobile number and OTP both are required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    // res.status(200).send({ success: false, message : "Mobile number and OTP both are required" });
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.salesmanOrderlist= async function (req, res, next) {
  var id = req.body.data.id;
  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    if(id && id != '') {
    if(storeId == 17) {
      var order = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid, `orders`.updatedAt, `orders`.paymentMethod, `orders`.orderStatus FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and salesmanId = " +id+" and (orderStatus ='Assigned for Delivery' OR orderStatus ='Out for Delivery') order by `orders`.`orderStatus` DESC",{ type: Sequelize.QueryTypes.SELECT });
    } else {
      var order = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid, `orders`.updatedAt, `orders`.paymentMethod, `orders`.orderStatus FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and salesmanId = " +id+" and orderStatus ='Delivery Boy' order by `orders`.`orderStatus` DESC",{ type: Sequelize.QueryTypes.SELECT });
    }
      var delivered_order = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid, `orders`.updatedAt, `orders`.paymentMethod FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and salesmanId = " +id+" and orderStatus ='Delivered'order by updatedAt DESC",{ type: Sequelize.QueryTypes.SELECT });
      console.log(order);
      var msg = '';
      if(order.length>0 || delivered_order.length>0){
        msg="Deliveryboy can accept order";
        // res.status(200).send({ success: true, ordeerList: order, message:msg, delivered_order:delivered_order });
        return res.status(200).send({ data:{success:true, orderList: order, message:msg, deliveredOrder:delivered_order}, errorNode:{errorCode:0, errorMsg:""}});
      } else{ 
        msg = "Order are not assigned";
        // res.status(200).send({ success: false, message:msg });
        return res.status(200).send({ data:{success:false,message:msg}, errorNode:{errorCode:1, errorMsg:''}});
      }    
    } else {
      // res.status(200).send({ success: false, message : "User id not found" });
      return res.status(200).send({ data:{success:false,message:'User id not found'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    // res.status(200).send({ success: false, message : "Mobile number and OTP both are required" });
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.salesmanOrderDetails= async function (req, res, next) {
  var orid = req.body.data.orderId;
  var storeId = req.body.data.storeId;
  var resultArray = [];
  var deliveryTimeSlot = '';

  if(storeId && storeId != '') {
    if(orid && orid != '') {
      // var order = await models.orders.findOne({ attributes: ['id', 'storeId', 'orderNo', 'customerId', 'orderStatus', 'shippingMethod', 'paymentMethod', 'discountPercent', 'discountAmount', 'shippingAmount', 'amountPaid', 'customerName', 'customerEmail', 'customerMobile', 'billingAddress', 'shippingAddress', 'shippingCity', 'shippingState', 'shippingPin', 'shippingCountry', 'deliveryTimeSlotId', 'createdAt'], where: {id: orid, storeId:storeId}});
      // var order = await sequelize.query("SELECT o.*, d. FROM `orders` as o left join deliveryTimeSlot as d on d.id = o.deliveryTimeSlotId where storeId = " +storeId+" and id = " +orid,{ type: Sequelize.QueryTypes.SELECT });
      var order = await models.orders.findOne({ attributes: ['id', 'orderNo', 'orderStatus', 'shippingMethod', 'paymentMethod', 'shippingAmount', 'amountPaid', 'customerName', 'customerEmail', 'customerMobile', 'billingAddress', 'shippingAddress', 'deliveryTimeSlotId', 'createdAt'], where: {id: orid, storeId:storeId}});
      // var order = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid, `orders`.createdAt, `orders`.paymentMethod FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and salesmanId = " +id+" and orderStatus ='Delivery Boy'",{ type: Sequelize.QueryTypes.SELECT });
      var ordItem= await models.orderItems.findAll({ attributes: ['id', 'name', 'qty', 'price', 'totalPrice'], where: {orderId: orid, storeId:storeId}});
      console.log("----------------------------------------------------------"+order.id);

      if(order && order.deliveryTimeSlotId != '' && order.deliveryTimeSlotId != null) {
        var deliveryTimeSlotDetails= await models.deliveryTimeSlot.findOne({ attributes: ['id', 'fromTime', 'toTime'], where: {id: order.deliveryTimeSlotId, storeId:storeId}});
        var deliveryTimeSlotDetails = await sequelize.query("SELECT id, TIME_FORMAT(fromTime, '%h:%i %p') as deliveryFromTime, TIME_FORMAT(toTime, '%h:%i %p') as deliveryToTime FROM `deliveryTimeSlot` where storeId = " +storeId+" and id = " +order.deliveryTimeSlotId,{ type: Sequelize.QueryTypes.SELECT });

       

        if(deliveryTimeSlotDetails[0].deliveryFromTime != '' && deliveryTimeSlotDetails[0].deliveryFromTime != null && deliveryTimeSlotDetails[0].deliveryToTime != '' && deliveryTimeSlotDetails[0].deliveryToTime != null) {
         
          var deliveryTimeSlot = deliveryTimeSlotDetails[0].deliveryFromTime+' to '+deliveryTimeSlotDetails[0].deliveryToTime;
        } else {
          var deliveryTimeSlot = '';
        }
      }

      resultArray.push({
        "id": order.id,
        "orderNo": order.orderNo,
        "orderStatus": order.orderStatus,
        "shippingMethod": order.shippingMethod,
        "paymentMethod": order.paymentMethod,
        "shippingAmount": order.shippingAmount,
        "amountPaid": order.amountPaid,
        "customerName": order.customerName,
        "customerEmail": order.customerEmail,
        "customerMobile": order.customerMobile,
        "billingAddress": order.billingAddress,
        "shippingAddress": order.shippingAddress,
        "createdAt": order.createdAt,
        "deliveryTimeSlot": deliveryTimeSlot,
        "orderAcceptBySalesman": true,
      });

      var msg = '';
      msg="successfully generate order";
      return res.status(200).send({ data:{success:true,orderDetails: resultArray[0], unit: ordItem, message:msg}, errorNode:{errorCode:0, errorMsg:''}});
              
    } else {
      return res.status(200).send({ data:{success:false,message:'Order Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.salesmanOrderDestination= async function (req, res, next) {
  var orid = req.body.data.orderId;
  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    if(orid && orid != '') {
      var dest = await models.orders.findOne({ attributes: ['shippingAddress', 'shippingCity', 'shippingCountry', 'shippingState', 'shippingPin', 'customerName'], where: {id: orid, storeId:storeId}});
      var source = await models.siteSettings.findOne({ attributes: ['address', 'siteName'], where: {id: 9}});
      var msg = '';
      msg="successfully generate order";
      // res.status(200).send({ success: true, source: source, destination: dest, message:msg });
      return res.status(200).send({ data:{success:true, source: source, destination: dest, message:msg}, errorNode:{errorCode:0, errorMsg:''}});
              
    } else {
      // res.status(200).send({ success: false, message : "Data not found" });
      return res.status(200).send({ data:{success:false,message:'Order Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    // res.status(200).send({ success: false, message : "Mobile number and OTP both are required" });
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.salesmanOrderInfo= async function (req, res, next) {
  var orid = req.body.data.orderId;
  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    if(orid && orid != '') {
      var order = await models.orderItems.findAll({ where: {orderId: orid, storeId:storeId}});
      var odDetails = await models.orders.findOne({ attributes: ['giftMessage', 'paymentMethod', 'amountPaid'], where: {id: orid, storeId:storeId}});
      var msg = '';
      msg="successfully generate order";
      // res.status(200).send({ success: true, orderItemList: order, details: odDetails, message:msg });
      return res.status(200).send({ data:{success:true, orderItemList: order, details: odDetails, message:msg}, errorNode:{errorCode:0, errorMsg:''}});
              
    } else {
      // res.status(200).send({ success: false, message : "Data not found" });
      return res.status(200).send({ data:{success:false,message:'Order Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    // res.status(200).send({ success: false, message : "Mobile number and OTP both are required" });
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.salesmanOrderStatusUpdate= async function (req, res, next) {
  var orid = req.body.data.orderId;
  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    if(orid && orid != '') {
    
      models.orders.update({ 
        orderStatus: "Delivered"
        },{where:{id: orid, storeId:storeId}}).then(async function(val) {
          var msg = '';
          msg="Order successfully delivered to customer";

          if(storeId == 17 ){
            var vendorDetails = await models.admins.findOne({ attributes:['id', 'storeId', 'pushToken'],where: {id: 4}});
          } else if(storeId == 15){
            var vendorDetails = await models.admins.findOne({ attributes:['id', 'storeId', 'pushToken'],where: {id: 3}});
          } else if(storeId == 18){
            var vendorDetails = await models.admins.findOne({ attributes:['id', 'storeId', 'pushToken'],where: {id: 5}});
          } else {
            var vendorDetails = await models.admins.findOne({ attributes:['id', 'storeId', 'pushToken'],where: {storeId: storeId}});
          }
          if(vendorDetails) {
            if(vendorDetails.pushToken != '' && vendorDetails.pushToken != null) {
              console.log("vvvvvvvvvvvvvvvvvvvvvvv----");
              push_notifications.generateNotification('',vendorDetails.id,storeId,"order-delivered-admin",order.id);
            }
          }

          // res.status(200).send({ success: true, message:msg });
          return res.status(200).send({ data:{success:true, message:msg}, errorNode:{errorCode:0, errorMsg:''}});
        });
              
    } else {
      // res.status(200).send({ success: false, message : "Order not delivered to customer" });
      return res.status(200).send({ data:{success:false,message:'Order Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    // res.status(200).send({ success: false, message : "Mobile number and OTP both are required" });
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.salesmanAttendance= async function (req, res, next) {

  var salesmanId = req.body.data.salesmanId;
  var storeId = req.body.data.storeId;
  var date = req.body.data.date;
  var fromTime = req.body.data.fromTime;
  var toTime = req.body.data.toTime;
  var location = req.body.data.location;
  var flag = req.body.data.flag;
  var image = req.body.data.image;
  var imageExt = req.body.data.imageExt;

  var attendanceId = req.body.data.attendanceId;

  console.log("aaaaaaaaaaaaa----"+location);
  console.log("bbbbbbbbbbbbbbbb----"+image);
  console.log("ccccccccccccc----"+imageExt);
  console.log("aaaaaaaaaaaaa----"+imageExt);

  if(storeId && storeId != '') {
    if(salesmanId && salesmanId != '') {
      if(date && date != '' && flag && flag != '') {

        if(flag == 'start') {
          if(fromTime && fromTime != '') {

            models.salesmanAttendance.create({ 
              salesmanId: salesmanId,
              storeId: storeId,
              date: date,
              fromTime: fromTime,
              startLocation: location,
              flag: flag,
              createdBy: salesmanId,
            }).then(async function (rows) {

              if(image && image != '' && imageExt && imageExt !='') {

                console.log("11111111111111111----");

                var dir = './public/admin/salesman/attendance/'+rows.id; 
                console.log(dir);
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);                  
                }
                
                var path = './public/admin/salesman/attendance/'+ rows.id +'/start-'+Date.now()+'.'+imageExt;
                var Attendanceimage = 'admin/salesman/attendance/'+ rows.id +'/start-'+Date.now()+'.'+imageExt;  
                try {
                    const imgdata = image;
                    const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                    fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                    models.salesmanAttendance.update({
                      startImage : Attendanceimage,
                    },{where:{id:rows.id}}).then(async function(model_users) {
                        
                        // var userdetail = await sequelize.query("select id, user_type, name, email, mobile, gender, address, dob, status, email_verified, mobile_verified, CONCAT('"+req.app.locals.baseurl+"', IFNULL(customer_profile_picture, 'user_contents/default-user_dp.png')) as profile_picture from users where id = "+users.id,{ type: Sequelize.QueryTypes.SELECT });
                        // var userdetail = await sequelize.query("select users.id, users.user_type, users.name, users.email, users.mobile, users.gender, users.address, users.city, users.location, users.dob, users.status, users.email_verified, users.mobile_verified, CONCAT('"+req.app.locals.baseurl+"', IFNULL(users.customer_profile_picture, 'user_contents/default-user_dp.png')) as profile_picture, CONCAT('"+req.app.locals.baseurl+"', IFNULL(users.vendor_profile_picture, 'user_contents/default-user_dp.png')) as vendor_profile_picture, users.vendor_Subcategory, users.vendor_category, vendor_categories.title as category_title, sub_categories.title as sub_category_title from users left join vendor_categories on vendor_categories.id = users.vendor_category left join sub_categories on sub_categories.id = users.vendor_Subcategory where users.id = "+users.id,{ type: Sequelize.QueryTypes.SELECT });
                        // res.status(200).send({ success: true, message: "User details successfully submit", userdetail:userdetail[0] });

                    })
                } catch (e) {
                    next(e);
                }
              }

              var msg = '';
              msg="Your attendance successfully submited";
              return res.status(200).send({ data:{success:true, message:msg}, errorNode:{errorCode:0, errorMsg:''}});
            });

          } else {
            return res.status(200).send({ data:{success:false,message:'From time is required'}, errorNode:{errorCode:1, errorMsg:''}});
          }

        } else {
          if(attendanceId && attendanceId != '') {
            if(toTime && toTime != '') {

              var attendanceDetails = await models.salesmanAttendance.findOne({ attributes: ['id', 'flag', 'fromTime', 'toTime', 'spendTime'], where: {id: attendanceId, storeId:storeId}});
              var endingTime = toTime.split(":");
              var originalEndHours = Number(endingTime[0]);
              var orifinalEndMinutes = Number(endingTime[1]);

              if(orifinalEndMinutes <= 9){
                var endMinutes = 0+orifinalEndMinutes;
              } else {
                var endMinutes = orifinalEndMinutes;
              }

              if(originalEndHours <= 9){
                var endHours = 0+originalEndHours;
              } else {
                var endHours = originalEndHours;
              }

              // console.log("time-----------"+time);
              // console.log("endHours-----------"+endHours111);
              // console.log("endMinutes-----------"+endMinutes111);
              // console.log("endMinutes1111111111-----------1111"+(08-50));

            

              var endingTime = attendanceDetails.fromTime.split(":");
              var orifinalStartHours = Number(endingTime[0]);
              var originalStartMinutes = Number(endingTime[1]);

              if(originalStartMinutes <= 9){
                var startMinutes = 0+originalStartMinutes;
              } else {
                var startMinutes = originalStartMinutes;
              }

              if(orifinalStartHours <= 9){
                var startHours = 0+orifinalStartHours;
              } else {
                var startHours = orifinalStartHours;
              }

              // console.log("attendanceDetails[0].fromTime-----------"+attendanceDetails[0].fromTime);
              // console.log("startHours-----------"+startHours111);
              // console.log("startMinutes-----------"+startMinutes111);

              var spendMinutes = endMinutes - startMinutes;
              // var originalSpendMinutes = (60 - endMinutes) + startMinutes;

              // if(originalSpendMinutes >= 60){
              //   var finalSpendMinutes = originalSpendMinutes - 60;
              //   var originalSpendHours = 1;
              // } else {
              //   var finalSpendMinutes = originalSpendMinutes;
              //   var originalSpendHours = 0;
              // }

              if(spendMinutes > 0){
                var spendHours = endHours - startHours;
                var finalSpendMinutes = spendMinutes;
                var originalSpendHours = 0;
              } else {
                var originalSpendMinutes = (60 - startMinutes) + endMinutes;
                if(originalSpendMinutes >= 60){
                  var finalSpendMinutes = originalSpendMinutes - 60;
                  var originalSpendHours = 1;
                } else {
                  var finalSpendMinutes = originalSpendMinutes;
                  var originalSpendHours = 0;
                }
                var spendHours = endHours - (startHours+1);
              }

              if(finalSpendMinutes <= 9){
                var minutes = "0"+finalSpendMinutes;
              } else {
                var minutes = finalSpendMinutes;
              }
              var finalSpendHours = originalSpendHours + spendHours;

              models.salesmanAttendance.update({ 
                // salesmanId: salesmanId,
                // storeId: storeId,
                // date: date,
                spendTime: finalSpendHours+':'+minutes,
                toTime: toTime,
                endLocation: location,
                flag: flag,
                updatedBy: salesmanId,
              },{where:{id: attendanceId}}).then(function(val) {

                if(image && image != '' && imageExt && imageExt !='') {

                  console.log("11111111111111111----");

                  var dir = './public/admin/salesman/attendance/'+attendanceId; 
                  console.log(dir);
                  if (!fs.existsSync(dir)){
                      fs.mkdirSync(dir);                  
                  }
                  
                  var path = './public/admin/salesman/attendance/'+ attendanceId +'/end-'+Date.now()+'.'+imageExt;
                  var Attendanceimage = 'admin/salesman/attendance/'+ attendanceId +'/end-'+Date.now()+'.'+imageExt;  
                  try {
                      const imgdata = image;
                      const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                      fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                      models.salesmanAttendance.update({
                        endImage : Attendanceimage,
                      },{where:{id: attendanceId}}).then(async function(model_users) {
                          
                          // var userdetail = await sequelize.query("select id, user_type, name, email, mobile, gender, address, dob, status, email_verified, mobile_verified, CONCAT('"+req.app.locals.baseurl+"', IFNULL(customer_profile_picture, 'user_contents/default-user_dp.png')) as profile_picture from users where id = "+users.id,{ type: Sequelize.QueryTypes.SELECT });
                          // var userdetail = await sequelize.query("select users.id, users.user_type, users.name, users.email, users.mobile, users.gender, users.address, users.city, users.location, users.dob, users.status, users.email_verified, users.mobile_verified, CONCAT('"+req.app.locals.baseurl+"', IFNULL(users.customer_profile_picture, 'user_contents/default-user_dp.png')) as profile_picture, CONCAT('"+req.app.locals.baseurl+"', IFNULL(users.vendor_profile_picture, 'user_contents/default-user_dp.png')) as vendor_profile_picture, users.vendor_Subcategory, users.vendor_category, vendor_categories.title as category_title, sub_categories.title as sub_category_title from users left join vendor_categories on vendor_categories.id = users.vendor_category left join sub_categories on sub_categories.id = users.vendor_Subcategory where users.id = "+users.id,{ type: Sequelize.QueryTypes.SELECT });
                          // res.status(200).send({ success: true, message: "User details successfully submit", userdetail:userdetail[0] });

                      })
                  } catch (e) {
                      next(e);
                  }
                }

                  var msg = '';
                  msg="Your attendance successfully updated";
                  return res.status(200).send({ data:{success:true, message:msg}, errorNode:{errorCode:0, errorMsg:''}});
              });
            } else {
              return res.status(200).send({ data:{success:false,message:'To time is required'}, errorNode:{errorCode:1, errorMsg:''}});
            }


          } else {
            return res.status(200).send({ data:{success:false,message:'Attendance id is required'}, errorNode:{errorCode:1, errorMsg:''}});
          }
        }

      } else {
        return res.status(200).send({ data:{success:false,message:'Date and flag is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }       
    } else {
      return res.status(200).send({ data:{success:false,message:'Salesman Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


// exports.salesmanDashboard= async function (req, res, next) {

//   var salesmanId = req.body.data.salesmanId;
//   var storeId = req.body.data.storeId;
//   var date = req.body.data.date;
//   var time = req.body.data.time;

//   var resultArray = [];

//   if(storeId && storeId != '') {
//     if(salesmanId && salesmanId != '') {
//       if(date && date != '' && time && time != '') {

//         var openOrders = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and salesmanId = " +salesmanId+" and orderStatus ='Delivery Boy'",{ type: Sequelize.QueryTypes.SELECT });
//         var deliveredOrders = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and salesmanId = " +salesmanId+" and orderStatus ='Delivered'",{ type: Sequelize.QueryTypes.SELECT });
//         var amountsCollect = await sequelize.query("SELECT SUM(amountPaid) as todayTotalAmound  FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and salesmanId = " +salesmanId+" and orderStatus ='Delivered'",{ type: Sequelize.QueryTypes.SELECT });
    
//         var attendanceDetails = await models.salesmanAttendance.findAll({ attributes: ['id', 'flag', 'fromTime', 'toTime', 'spendTime'], where: {salesmanId: salesmanId, date: date, storeId:storeId}});

//         // return res.status(200).send({ data:{success:true, message:msg}, errorNode:{errorCode:0, errorMsg:''}});
//         if(attendanceDetails.length > 0){

//           var breakDetails = await models.salesmanBreak.findAll({ attributes: ['id', 'flag', 'fromTime'], where: {salesmanId: salesmanId, date: date, storeId:storeId, flag:'start'}, order: [['id', 'DESC']]});

//           if(breakDetails.length > 0){
//             var isBreak = true;
//             var breakId = breakDetails[0].id;
//           } else {
//             var isBreak = false;
//             var breakId = '';
//           }

//           if(attendanceDetails[0].toTime && attendanceDetails[0].toTime !='' && attendanceDetails[0].toTime != null){

//             resultArray.push({
//               "attendanceId": '',
//               "flag": attendanceDetails[0].flag,
//               "fromTime": attendanceDetails[0].fromTime,
//               "toTime": attendanceDetails[0].toTime,
//               "spendTime": attendanceDetails[0].spendTime,
//               "isAttended": true,
//               "openOrdersCounts": openOrders.length,
//               "deliveredOrdersCounts": deliveredOrders.length,
//               "todayTotalAmound": amountsCollect[0].todayTotalAmound,
//               "isBreak": isBreak,
//               "breakId": breakId,
//             });
  
//             return res.status(200).send({ data:{success:true, dashboardDetails: resultArray[0], message:'no attendance'}, errorNode:{errorCode:0, errorMsg:''}});

//           } else {
            
//             var endingTime = time.split(":");
//             var originalEndHours = Number(endingTime[0]);
//             var orifinalEndMinutes = Number(endingTime[1]);

//             if(orifinalEndMinutes <= 9){
//               var endMinutes = 0+orifinalEndMinutes;
//             } else {
//               var endMinutes = orifinalEndMinutes;
//             }

//             if(originalEndHours <= 9){
//               var endHours = 0+originalEndHours;
//             } else {
//               var endHours = originalEndHours;
//             }

//             // console.log("time-----------"+time);
//             // console.log("endHours-----------"+endHours111);
//             // console.log("endMinutes-----------"+endMinutes111);
//             // console.log("endMinutes1111111111-----------1111"+(08-50));

           

//             var endingTime = attendanceDetails[0].fromTime.split(":");
//             var orifinalStartHours = Number(endingTime[0]);
//             var originalStartMinutes = Number(endingTime[1]);

//             if(originalStartMinutes <= 9){
//               var startMinutes = 0+originalStartMinutes;
//             } else {
//               var startMinutes = originalStartMinutes;
//             }

//             if(orifinalStartHours <= 9){
//               var startHours = 0+orifinalStartHours;
//             } else {
//               var startHours = orifinalStartHours;
//             }

//             // console.log("attendanceDetails[0].fromTime-----------"+attendanceDetails[0].fromTime);
//             // console.log("startHours-----------"+startHours111);
//             // console.log("startMinutes-----------"+startMinutes111);

//             var spendMinutes = endMinutes - startMinutes;
//             // var originalSpendMinutes = (60 - endMinutes) + startMinutes;

//             // if(originalSpendMinutes >= 60){
//             //   var finalSpendMinutes = originalSpendMinutes - 60;
//             //   var originalSpendHours = 1;
//             // } else {
//             //   var finalSpendMinutes = originalSpendMinutes;
//             //   var originalSpendHours = 0;
//             // }

//             if(spendMinutes > 0){
//               var spendHours = endHours - startHours;
//               var finalSpendMinutes = spendMinutes;
//               var originalSpendHours = 0;
//             } else {
//               var originalSpendMinutes = (60 - startMinutes) + endMinutes;
//               if(originalSpendMinutes >= 60){
//                 var finalSpendMinutes = originalSpendMinutes - 60;
//                 var originalSpendHours = 1;
//               } else {
//                 var finalSpendMinutes = originalSpendMinutes;
//                 var originalSpendHours = 0;
//               }
//               var spendHours = endHours - (startHours+1);
//             }

//             if(finalSpendMinutes <= 9){
//               var minutes = "0"+finalSpendMinutes;
//             } else {
//               var minutes = finalSpendMinutes;
//             }
//             var finalSpendHours = originalSpendHours + spendHours;

//             // console.log("zzzzzzzzzzzzzz-----------******"+(startMinutes111-endMinutes111));

//             resultArray.push({
//               "attendanceId": attendanceDetails[0].id,
//               "flag": attendanceDetails[0].flag,
//               "fromTime": attendanceDetails[0].fromTime,
//               "toTime": attendanceDetails[0].toTime,
//               "spendTime": finalSpendHours+':'+minutes,
//               "isAttended": true,
//               "openOrdersCounts": openOrders.length,
//               "deliveredOrdersCounts": deliveredOrders.length,
//               "todayTotalAmound": amountsCollect[0].todayTotalAmound,
//               "isBreak": isBreak,
//               "breakId": breakId,
//             });
    
            
//             return res.status(200).send({ data:{success:true, dashboardDetails: resultArray[0], message:'attendance'}, errorNode:{errorCode:0, errorMsg:""}});

//           }

          
//         } else{ 

//           resultArray.push({
//             "attendanceId": '',
//             "flag": '',
//             "fromTime": '',
//             "toTime": '',
//             "spendTime": '',
//             "isAttended": false,
//             "openOrdersCounts": '',
//             "deliveredOrdersCounts": '',
//             "todayTotalAmound": '',
//             "isBreak": '',
//             "breakId": '',
//           });

//           return res.status(200).send({ data:{success:true, dashboardDetails: resultArray[0], message:'no attendance'}, errorNode:{errorCode:0, errorMsg:''}});
//         } 

//       } else {
//         return res.status(200).send({ data:{success:false,message:'Date and time is required'}, errorNode:{errorCode:1, errorMsg:''}});
//       }      
//     } else {
//       return res.status(200).send({ data:{success:false,message:'Salesman Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
//     }
//   } else {
//     return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
//   }
// };


exports.salesmanDashboard= async function (req, res, next) {

  var salesmanId = req.body.data.salesmanId;
  var storeId = req.body.data.storeId;
  var date = req.body.data.date;
  var time = req.body.data.time;

  var resultArray = [];

  var totalBreakMinutes = 0;
  var totalBreakHours = 0;

  if(storeId && storeId != '') {
    if(salesmanId && salesmanId != '') {
      if(date && date != '' && time && time != '') {

        if(storeId == 17) {
          var openOrders = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and salesmanId = " +salesmanId+" and orderStatus ='Assigned for Delivery'",{ type: Sequelize.QueryTypes.SELECT });
        } else {
          var openOrders = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and salesmanId = " +salesmanId+" and orderStatus ='Delivery Boy'",{ type: Sequelize.QueryTypes.SELECT });
        }
        // var openOrders = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and salesmanId = " +salesmanId+" and orderStatus ='Assigned for Delivery'",{ type: Sequelize.QueryTypes.SELECT });
        var deliveredOrders = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and salesmanId = " +salesmanId+" and orderStatus ='Delivered'",{ type: Sequelize.QueryTypes.SELECT });
        var amountsCollect = await sequelize.query("SELECT SUM(amountPaid) as todayTotalAmound  FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and salesmanId = " +salesmanId+" and orderStatus ='Delivered'",{ type: Sequelize.QueryTypes.SELECT });
    
        var attendanceDetails = await models.salesmanAttendance.findAll({ attributes: ['id', 'flag', 'fromTime', 'toTime', 'spendTime'], where: {salesmanId: salesmanId, date: date, storeId:storeId}});

        // return res.status(200).send({ data:{success:true, message:msg}, errorNode:{errorCode:0, errorMsg:''}});
        if(attendanceDetails.length > 0){

          var endBreakDetails = await models.salesmanBreak.findAll({ attributes: ['id', 'flag', 'fromTime', 'toTime', 'spendTime'], where: {salesmanId: salesmanId, date: date, storeId:storeId, flag:'end'}, order: [['id', 'DESC']]});

          if(endBreakDetails.length > 0){

            for(var i = 0; i < endBreakDetails.length; i++){

              var spendTime = endBreakDetails[i].spendTime.split(":");
              var breakEndHours = Number(spendTime[0]);
              var breakEndMinutes = Number(spendTime[1]);
              
              if(breakEndMinutes <= 9){
                var originalBreakEndMinutes = 0+breakEndMinutes;
              } else {
                var originalBreakEndMinutes = breakEndMinutes;
              }
  
              if(breakEndHours <= 9){
                var originalBreakEndHours = 0+breakEndHours;
              } else {
                var originalBreakEndHours = breakEndHours;
              }

              totalBreakMinutes += originalBreakEndMinutes;
              totalBreakHours += originalBreakEndHours;
            }

            // console.log("aaaaaaaaaaaaaaaa---"+totalBreakMinutes);
            // console.log("bbbbbbbbbbbbbb---"+totalBreakHours);

            if(totalBreakMinutes >= 60){
              var finalBreakMinutes = totalBreakMinutes % 60;
              var breakMinutesDivides = Math.floor(totalBreakMinutes / 60);
              var finalBreakHours = totalBreakHours + breakMinutesDivides;
            } else {
              var finalBreakMinutes = totalBreakMinutes;
              var finalBreakHours = totalBreakHours;
            }

          } else {
            var finalBreakMinutes = 0;
            var finalBreakHours = 0;
          }

          var breakDetails = await models.salesmanBreak.findAll({ attributes: ['id', 'flag', 'fromTime'], where: {salesmanId: salesmanId, date: date, storeId:storeId, flag:'start'}, order: [['id', 'DESC']]});

          if(breakDetails.length > 0){
            var isBreak = true;
            var breakId = breakDetails[0].id;
          } else {
            var isBreak = false;
            var breakId = '';
          }

          if(attendanceDetails[0].toTime && attendanceDetails[0].toTime !='' && attendanceDetails[0].toTime != null){
            // console.log("ccccccccccccccccccccc---"+totalBreakMinutes);

            resultArray.push({
              "attendanceId": '',
              "flag": attendanceDetails[0].flag,
              "fromTime": attendanceDetails[0].fromTime,
              "toTime": attendanceDetails[0].toTime,
              "spendTime": attendanceDetails[0].spendTime,
              "isAttended": true,
              "openOrdersCounts": openOrders.length,
              "deliveredOrdersCounts": deliveredOrders.length,
              "todayTotalAmound": amountsCollect[0].todayTotalAmound,
              "isBreak": isBreak,
              "breakId": breakId,
            });
  
            return res.status(200).send({ data:{success:true, dashboardDetails: resultArray[0], message:'no attendance'}, errorNode:{errorCode:0, errorMsg:''}});

          } else {
            // console.log("ddddddddddddddd---"+totalBreakMinutes);
            
            if(breakDetails.length > 0){
              // console.log("eeeeeeeeeeeeeeeee---"+totalBreakMinutes);

              var endingTime = breakDetails[0].fromTime.split(":");
              var originalEndHours = Number(endingTime[0]);
              var orifinalEndMinutes = Number(endingTime[1]);

              if(orifinalEndMinutes <= 9){
                var endMinutes = 0+orifinalEndMinutes;
              } else {
                var endMinutes = orifinalEndMinutes;
              }

              if(originalEndHours <= 9){
                var endHours = 0+originalEndHours;
              } else {
                var endHours = originalEndHours;
              }

              // console.log("time-----------"+time);
              // console.log("endHours-----------"+endHours111);
              // console.log("endMinutes-----------"+endMinutes111);
              // console.log("endMinutes1111111111-----------1111"+(08-50));

            

              var endingTime = attendanceDetails[0].fromTime.split(":");
              var orifinalStartHours = Number(endingTime[0]);
              var originalStartMinutes = Number(endingTime[1]);

              if(originalStartMinutes <= 9){
                var startMinutes = 0+originalStartMinutes;
              } else {
                var startMinutes = originalStartMinutes;
              }

              if(orifinalStartHours <= 9){
                var startHours = 0+orifinalStartHours;
              } else {
                var startHours = orifinalStartHours;
              }

              // console.log("attendanceDetails[0].fromTime-----------"+attendanceDetails[0].fromTime);
              // console.log("startHours-----------"+startHours111);
              // console.log("startMinutes-----------"+startMinutes111);

              var spendMinutes = endMinutes - startMinutes;
              // var originalSpendMinutes = (60 - endMinutes) + startMinutes;

              // if(originalSpendMinutes >= 60){
              //   var finalSpendMinutes = originalSpendMinutes - 60;
              //   var originalSpendHours = 1;
              // } else {
              //   var finalSpendMinutes = originalSpendMinutes;
              //   var originalSpendHours = 0;
              // }

              if(spendMinutes > 0){
                var spendHours = endHours - startHours;
                var finalSpendMinutes = spendMinutes;
                var originalSpendHours = 0;
              } else {
                var originalSpendMinutes = (60 - startMinutes) + endMinutes;
                if(originalSpendMinutes >= 60){
                  var finalSpendMinutes = originalSpendMinutes - 60;
                  var originalSpendHours = 1;
                } else {
                  var finalSpendMinutes = originalSpendMinutes;
                  var originalSpendHours = 0;
                }
                var spendHours = endHours - (startHours+1);
              }

              if(finalSpendMinutes <= 9){
                var minutes = "0"+finalSpendMinutes;
              } else {
                var minutes = finalSpendMinutes;
              }
              var finalSpendHours = originalSpendHours + spendHours;




              var totalspendMinutes = finalSpendMinutes - finalBreakMinutes;

              if(totalspendMinutes > 0){
                var grandSpendHours = finalSpendHours - finalBreakHours;
                var grandSpendMinutes = totalspendMinutes;
                var orgSpendHours = 0;
              } else {
                var originalSpendMinutes = (60 - finalBreakMinutes) + finalSpendMinutes;
                if(originalSpendMinutes >= 60){
                  var grandSpendMinutes = originalSpendMinutes - 60;
                  var orgSpendHours = 1;
                } else {
                  var grandSpendMinutes = originalSpendMinutes;
                  var orgSpendHours = 0;
                }
                var grandSpendHours = finalSpendHours - (finalBreakHours+1);
              }
              var grandFinalSpendHours = orgSpendHours + grandSpendHours;
              if(grandSpendMinutes <= 9){
                var minutes = "0"+grandSpendMinutes;
              } else {
                var minutes = grandSpendMinutes;
              }


              // console.log("zzzzzzzzzzzzzz-----------******"+(startMinutes111-endMinutes111));

              resultArray.push({
                "attendanceId": attendanceDetails[0].id,
                "flag": attendanceDetails[0].flag,
                "fromTime": attendanceDetails[0].fromTime,
                "toTime": attendanceDetails[0].toTime,
                // "spendTime": finalSpendHours+':'+minutes,
                "spendTime": grandFinalSpendHours+':'+minutes,
                "isAttended": true,
                "openOrdersCounts": openOrders.length,
                "deliveredOrdersCounts": deliveredOrders.length,
                "todayTotalAmound": amountsCollect[0].todayTotalAmound,
                "isBreak": isBreak,
                "breakId": breakId,
              });
    
            
              return res.status(200).send({ data:{success:true, dashboardDetails: resultArray[0], message:'attendance'}, errorNode:{errorCode:0, errorMsg:""}});

            } else {
              console.log("ffffffffffffffffff---"+totalBreakMinutes);

              var originalendingTime = time.split(":");
              var originalEndHours = Number(originalendingTime[0]);
              var orifinalEndMinutes = Number(originalendingTime[1]);

              if(orifinalEndMinutes <= 9){
                var endMinutes = 0+orifinalEndMinutes;
              } else {
                var endMinutes = orifinalEndMinutes;
              }

              if(originalEndHours <= 9){
                var endHours = 0+originalEndHours;
              } else {
                var endHours = originalEndHours;
              }

              // console.log("time-----------"+time);
              // console.log("endHours-----------"+endHours);
              // console.log("endMinutes-----------"+endMinutes);
              // console.log("endMinutes1111111111-----------1111"+(08-50));

            

              var endingTime = attendanceDetails[0].fromTime.split(":");
              var orifinalStartHours = Number(endingTime[0]);
              var originalStartMinutes = Number(endingTime[1]);

              if(originalStartMinutes <= 9){
                var startMinutes = 0+originalStartMinutes;
              } else {
                var startMinutes = originalStartMinutes;
              }

              if(orifinalStartHours <= 9){
                var startHours = 0+orifinalStartHours;
              } else {
                var startHours = orifinalStartHours;
              }

              // console.log("attendanceDetails[0].fromTime-----------"+attendanceDetails[0].fromTime);
              // console.log("orifinalStartHours-----------"+orifinalStartHours);
              // console.log("originalStartMinutes-----------"+originalStartMinutes);

              var spendMinutes = endMinutes - startMinutes;

              // console.log("spendMinutes-----------"+spendMinutes);
              // console.log("endMinutes-----------"+endMinutes);
              // console.log("startMinutes-----------"+startMinutes);
              // var originalSpendMinutes = (60 - endMinutes) + startMinutes;

              // if(originalSpendMinutes >= 60){
              //   var finalSpendMinutes = originalSpendMinutes - 60;
              //   var originalSpendHours = 1;
              // } else {
              //   var finalSpendMinutes = originalSpendMinutes;
              //   var originalSpendHours = 0;
              // }

              // console.log("zzzzzzzzzzzzzzz----"+spendMinutes);
              if(spendMinutes >= 0){
                // console.log("qaqaqaqaqaqaqa----"+spendMinutes);
                var spendHours = endHours - startHours;
                var finalSpendMinutes = spendMinutes;
                var originalSpendHours = 0;

                // console.log("mmmmmmmmmmmmmm--spendHours--"+spendHours);
                // console.log("nnnnnnnnnnnnnnn--endHours--"+endHours);
                // console.log("vvvvvvvvvvvvvvvvvv--startHours--"+startHours);
              } else {
                var originalSpendMinutes = (60 - startMinutes) + endMinutes;
                if(originalSpendMinutes >= 60){
                  var finalSpendMinutes = originalSpendMinutes - 60;
                  var originalSpendHours = 1;
                } else {
                  var finalSpendMinutes = originalSpendMinutes;
                  var originalSpendHours = 0;
                }
                var spendHours = endHours - (startHours+1);
              }

              // if(finalSpendMinutes <= 9){
              //   var minutes = "0"+finalSpendMinutes;
              // } else {
              //   var minutes = finalSpendMinutes;
              // }
              var finalSpendHours = originalSpendHours + spendHours;

              // console.log("vvvvvvvvvvv111v--finalSpendHours--"+finalSpendHours);
              // console.log("vvvvvvvvvvvv2222--originalSpendHours--"+originalSpendHours);
              // console.log("vvvvvvvvvvvv333333v--spendHours--"+spendHours);


              var totalspendMinutes = finalSpendMinutes - finalBreakMinutes;

              // console.log("ggggggggggggggggggggggggg--totalspendMinutes--111111"+totalspendMinutes);
              // console.log("vvvvvvvvvvvv2222--finalSpendMinutes--"+finalSpendMinutes);
              // console.log("vvvvvvvvvvvv333333v--finalBreakMinutes--"+finalBreakMinutes);
              // console.log("jjjjjjjjjjjjjjjjjjj--totalspendMinutes--"+typeof(totalspendMinutes));

              if(totalspendMinutes > 0){
                var grandSpendHours = finalSpendHours - finalBreakHours;
                var grandSpendMinutes = totalspendMinutes;
                var orgSpendHours = 0;

              } else {
                // console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiii--totalspendMinutes--"+totalspendMinutes);
                var originalSpendMinutes = (60 - finalBreakMinutes) + finalSpendMinutes;
                if(originalSpendMinutes >= 60){
                  var grandSpendMinutes = originalSpendMinutes - 60;
                  var orgSpendHours = 1;
                } else {
                  var grandSpendMinutes = originalSpendMinutes;
                  var orgSpendHours = 0;
                }
                var grandSpendHours = finalSpendHours - (finalBreakHours+1);
                // console.log("sssssssssssssssss--grandSpendHours--"+grandSpendHours);
                // console.log("ttttttttttttttt--finalSpendHours--"+finalSpendHours);
                // console.log("uuuuuuuuuuuuuuuu--finalBreakHours--"+finalBreakHours);
                // console.log("yyyyyyyyyyyyyyyyy--grandSpendMinutes--"+grandSpendMinutes);
              }
              var grandFinalSpendHours = orgSpendHours + grandSpendHours;
              if(grandSpendMinutes <= 9){
                var minutes = "0"+grandSpendMinutes;
              } else {
                var minutes = grandSpendMinutes;
              }


              // console.log("zzzzzzzzzzzzzz-----------******"+(startMinutes111-endMinutes111));

              resultArray.push({
                "attendanceId": attendanceDetails[0].id,
                "flag": attendanceDetails[0].flag,
                "fromTime": attendanceDetails[0].fromTime,
                "toTime": attendanceDetails[0].toTime,
                // "spendTime": finalSpendHours+':'+minutes,
                "spendTime": grandFinalSpendHours+':'+minutes,
                "isAttended": true,
                "openOrdersCounts": openOrders.length,
                "deliveredOrdersCounts": deliveredOrders.length,
                "todayTotalAmound": amountsCollect[0].todayTotalAmound,
                "isBreak": isBreak,
                "breakId": breakId,
              });
    
            
              return res.status(200).send({ data:{success:true, dashboardDetails: resultArray[0], message:'attendance'}, errorNode:{errorCode:0, errorMsg:""}});
            }

          }

          
        } else{ 

          resultArray.push({
            "attendanceId": '',
            "flag": '',
            "fromTime": '',
            "toTime": '',
            "spendTime": '',
            "isAttended": false,
            "openOrdersCounts": '',
            "deliveredOrdersCounts": '',
            "todayTotalAmound": '',
            "isBreak": '',
            "breakId": '',
          });

          return res.status(200).send({ data:{success:true, dashboardDetails: resultArray[0], message:'no attendance'}, errorNode:{errorCode:0, errorMsg:''}});
        } 

      } else {
        return res.status(200).send({ data:{success:false,message:'Date and time is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }      
    } else {
      return res.status(200).send({ data:{success:false,message:'Salesman Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.salesmanNotification= async function (req, res, next) {

  var salesmanId = req.body.data.salesmanId;
  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    if(salesmanId && salesmanId != '') {
      var openOrders = await sequelize.query("SELECT `orders`.id, `orders`.orderNo FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and salesmanId = " +salesmanId+" and orderStatus ='Delivery Boy'",{ type: Sequelize.QueryTypes.SELECT });
      // console.log(order);
      var msg = '';
      if(openOrders.length > 0 ){
        msg="Assigned order found";
        return res.status(200).send({ data:{success:true, openOrdersCounts: openOrders.length, message:msg}, errorNode:{errorCode:0, errorMsg:""}});
      } else{ 
        msg = "Order are not assigned";
        return res.status(200).send({ data:{success:false,openOrdersCounts: 0, message:msg}, errorNode:{errorCode:1, errorMsg:''}});
      }    
    } else {
      return res.status(200).send({ data:{success:false,message:'Salesman id not found'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.salesmanOpenOrderlist= async function (req, res, next) {

  var salesmanId = req.body.data.salesmanId;
  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    if(salesmanId && salesmanId != '') {

      if(storeId == 17) {
          var openOrderList = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid, `orders`.updatedAt, `orders`.paymentMethod, `orders`.shippingAddress FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and salesmanId = " +salesmanId+" and orderStatus ='Assigned for Delivery'",{ type: Sequelize.QueryTypes.SELECT });
      } else {
        var openOrderList = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid, `orders`.updatedAt, `orders`.paymentMethod, `orders`.shippingAddress FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and salesmanId = " +salesmanId+" and orderStatus ='Delivery Boy'",{ type: Sequelize.QueryTypes.SELECT });
      }
      // console.log(order);
      var msg = '';
      if(openOrderList.length>0 ){
        msg="Open orders found";
        return res.status(200).send({ data:{success:true, openOrderList: openOrderList, message:msg}, errorNode:{errorCode:0, errorMsg:""}});
      } else{ 
        msg = "Order are not assigned";
        return res.status(200).send({ data:{success:false,openOrderList: [], message:msg}, errorNode:{errorCode:1, errorMsg:''}});
      }    
    } else {
      return res.status(200).send({ data:{success:false,message:'Salesman id not found'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.salesmanBreak = async function (req, res, next) {

  var salesmanId = req.body.data.salesmanId;
  var storeId = req.body.data.storeId;
  var date = req.body.data.date;
  var fromTime = req.body.data.fromTime;
  var toTime = req.body.data.toTime;
  var flag = req.body.data.flag;

  var breakId = req.body.data.breakId;

  if(storeId && storeId != '') {
    if(salesmanId && salesmanId != '') {
      if(date && date != '' && flag && flag != '') {

        if(flag == 'start') {
          if(fromTime && fromTime != '') {

            models.salesmanBreak.create({ 
              salesmanId: salesmanId,
              storeId: storeId,
              date: date,
              fromTime: fromTime,
              flag: flag,
              createdBy: salesmanId,
            }).then(async function (rows) {

              var msg = '';
              msg="Your Break successfully start";
              return res.status(200).send({ data:{success:true, message:msg}, errorNode:{errorCode:0, errorMsg:''}});
            });

          } else {
            return res.status(200).send({ data:{success:false,message:'From time is required'}, errorNode:{errorCode:1, errorMsg:''}});
          }

        } else {
          if(breakId && breakId != '') {
            if(toTime && toTime != '') {

              var breakDetails = await models.salesmanBreak.findOne({ attributes: ['id', 'flag', 'fromTime', 'toTime', 'spendTime'], where: {id: breakId, storeId:storeId}});
              var endingTime = toTime.split(":");
              var originalEndHours = Number(endingTime[0]);
              var orifinalEndMinutes = Number(endingTime[1]);

              if(orifinalEndMinutes <= 9){
                var endMinutes = 0+orifinalEndMinutes;
              } else {
                var endMinutes = orifinalEndMinutes;
              }

              if(originalEndHours <= 9){
                var endHours = 0+originalEndHours;
              } else {
                var endHours = originalEndHours;
              }
            

              var endingTime = breakDetails.fromTime.split(":");
              var orifinalStartHours = Number(endingTime[0]);
              var originalStartMinutes = Number(endingTime[1]);

              if(originalStartMinutes <= 9){
                var startMinutes = 0+originalStartMinutes;
              } else {
                var startMinutes = originalStartMinutes;
              }

              if(orifinalStartHours <= 9){
                var startHours = 0+orifinalStartHours;
              } else {
                var startHours = orifinalStartHours;
              }

              var spendMinutes = endMinutes - startMinutes;

              if(spendMinutes > 0){
                var spendHours = endHours - startHours;
                var finalSpendMinutes = spendMinutes;
                var originalSpendHours = 0;
              } else {
                var originalSpendMinutes = (60 - startMinutes) + endMinutes;
                if(originalSpendMinutes >= 60){
                  var finalSpendMinutes = originalSpendMinutes - 60;
                  var originalSpendHours = 1;
                } else {
                  var finalSpendMinutes = originalSpendMinutes;
                  var originalSpendHours = 0;
                }
                var spendHours = endHours - (startHours+1);
              }

              if(finalSpendMinutes <= 9){
                var minutes = "0"+finalSpendMinutes;
              } else {
                var minutes = finalSpendMinutes;
              }
              var finalSpendHours = originalSpendHours + spendHours;

              models.salesmanBreak.update({ 
                spendTime: finalSpendHours+':'+minutes,
                toTime: toTime,
                flag: flag,
                updatedBy: salesmanId,
              },{where:{id: breakId}}).then(function(val) {

                  var msg = '';
                  msg="Your break is end";
                  return res.status(200).send({ data:{success:true, message:msg}, errorNode:{errorCode:0, errorMsg:''}});
              });
            } else {
              return res.status(200).send({ data:{success:false,message:'To time is required'}, errorNode:{errorCode:1, errorMsg:''}});
            }

          } else {
            return res.status(200).send({ data:{success:false,message:'Break id is required'}, errorNode:{errorCode:1, errorMsg:''}});
          }
        }

      } else {
        return res.status(200).send({ data:{success:false,message:'Date and flag is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }       
    } else {
      return res.status(200).send({ data:{success:false,message:'Salesman Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.salesmanOrderAcceptOrReject= async function (req, res, next) {

  var orderId = req.body.data.orderId;
  var storeId = req.body.data.storeId;
  var salesmanId = req.body.data.salesmanId;
  var flag = req.body.data.flag;

  if(storeId && storeId != '') {
    if(orderId && orderId != '') {
      if(salesmanId && salesmanId != '') {
        if(flag && flag != '') {

          if(flag == 'accept') {

            // var salesmanDetails = await models.salesman.findOne({ where: {id: salesmanId}});

            // console.log("aaaaaaaaaaaaaaaaaa----");
            // if(salesmanDetails.pushToken != '' && salesmanDetails.pushToken != null) {
            //   console.log("vvvvvvvvvvvvvvvvvvvvvvv----");
            //   push_notifications.generateNotification(salesmanDetails.id,storeId,"order-accept");
            // }

            // if(storeId ==17) {
              models.orders.update({ 
                orderStatus: "Accept by Delivery Boy",
              },{where:{id: orderId, storeId:storeId}}).then(function(val) {

                return res.status(200).send({ data:{success:true, message:"Order successfully accepted"}, errorNode:{errorCode:0, errorMsg:''}});
              });
            // } else {
            //   return res.status(200).send({ data:{success:true, message:"Order successfully accepted"}, errorNode:{errorCode:0, errorMsg:''}});
            // }

            // return res.status(200).send({ data:{success:true, message:"Order successfully accepted"}, errorNode:{errorCode:0, errorMsg:''}});
          } else if(flag == 'reject'){

            models.orders.update({ 
              salesmanId: null
            },{where:{id: orderId, storeId:storeId}}).then(function(val) {

              models.salesmanOrderReject.create({ 
                salesmanId: salesmanId,
                storeId: storeId,
                orderId: orderId,
                remarks: remarks,
                createdBy: salesmanId,
              });

              return res.status(200).send({ data:{success:true, message:"Order successfully rejected from your list"}, errorNode:{errorCode:0, errorMsg:''}});
            });

          } else {
            return res.status(200).send({ data:{success:false,message:'Flag should be accept or reject'}, errorNode:{errorCode:1, errorMsg:''}});
          }

        } else {
          return res.status(200).send({ data:{success:false,message:'Flag is required'}, errorNode:{errorCode:1, errorMsg:''}});
        }
      } else {
        return res.status(200).send({ data:{success:false,message:'Salesman Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
              
    } else {
      return res.status(200).send({ data:{success:false,message:'Order Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.salesmanPushTokenUpdate= async function (req, res, next) {

  var storeId = req.body.data.storeId;
  var salesmanId = req.body.data.salesmanId;
  var token = req.body.data.token;

  if(storeId && storeId != '') {
    if(salesmanId && salesmanId != '') {
      if(token && token != '') {

        models.salesman.update({ 
          pushToken: token,
          updatedBy: salesmanId
        },{where:{id: salesmanId, storeId:storeId}}).then(function(val) {

          return res.status(200).send({ data:{success:true, message:"Your token successfully updated"}, errorNode:{errorCode:0, errorMsg:''}});
        });

      } else {
        return res.status(200).send({ data:{success:false,message:'token is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'Salesman Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};