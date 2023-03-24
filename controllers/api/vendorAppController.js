var models = require("../../models");
var config = require("../../config/config.json");
//var push_notifications = require('../../helpers/push_notifications');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const SECRET = 'nodescratch';
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

var fs = require('fs')
var fs = require('file-system');

const emailConfig = require('../../config/email-config')();
const mailgun = require('mailgun-js')(emailConfig);

exports.vendorLogin= async function (req, res, next) {
  var mobile = req.body.data.mobile
  var hostName = req.body.data.hostName

  if(hostName && hostName != '') {
    var hostDetails = await models.stores.findOne({ where: {cCode: hostName}});
    if(hostDetails) {
      if(mobile && mobile != '') {
        var vendor = await models.admins.findOne({ where: {mobile: mobile, storeId:hostDetails.id}});
        var msg = '';
        if(vendor != null){

          if(vendor.image != null && vendor.image != ''){
            var vendorImage = req.app.locals.baseurl+'admin/vendorApp/'+vendor.image;
          } else {
            var vendorImage = req.app.locals.baseurl+'admin/vendorApp/no_image.jpg';
          }
          msg = "Existing user";
          var otp = Math.floor(1000 + Math.random() * 9000);
          models.admins.update({ 
            otp: otp
          },{where:{id:vendor.id}}).then(function(val) {
              vendor.otp=otp;
            return res.status(200).send({ data:{success:true, otp: otp, message:msg, storeId:hostDetails.id, image:vendorImage, address:vendor.address}, errorNode:{errorCode:0, errorMsg:""}});
          });

        } else{ msg = "No user found";
          return res.status(200).send({ data:{success:false,message:msg}, errorNode:{errorCode:1, errorMsg:''}});
        }    
      } else {
        return res.status(200).send({ data:{success:false,message:'Mobile number is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'This host name is not registered'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Host name is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.demoVendorLogin= async function (req, res, next) {
  const username = req.body.data.username || ""
  const password = req.body.data.password || ""
  const hostName = req.body.data.hostName || ""

  if(username !='' && password != '' && hostName != '') {
    const hostDetails = await models.stores.findOne({ where: {cCode: hostName}});

    if(hostDetails) {

      const userDetails = await models.admins.findAll({attributes:['id','password'], where: {username: username, storeId:hostDetails.id}});

      if(!userDetails.length){
        return res.status(200).send({ data:{success:false,message:'Username not exist'}, errorNode:{errorCode:0, errorMsg:'Error'}})
      }else{
        if(bcrypt.compareSync(password, userDetails[0].password)){

          const user = await models.admins.findOne({attributes:['id', 'storeId', 'adminName', 'email', 'mobile', 'address', 'image'], where : {username: username, storeId:hostDetails.id}})

          const permissionLogs = await models.permissionLog.findAll({where:{storeId:user.storeId}})
          const permissions = []
          for(let log of permissionLogs){
            const permissionName = await models.permissionGroup.findOne({attributes:['slug'],where:{id:log.permissionGroupId}})
            permissions.push(permissionName.slug)
          }

          const token = jwt.sign(JSON.stringify(user), SECRET);
          const result = []
          result.push({
            "id": user.id,
            "storeId": user.storeId,
            "name": user.adminName,
            "email": user.email,
            "phone": user.mobile,
            "address": user.address,
            "image": (user.image != '' && user.image != null) ? req.app.locals.baseurl + 'admin/vendorApp/' + user.image : req.app.locals.baseurl + 'admin/vendorApp/no_image.jpg',
            "permissions":permissions,
            "token":token
          });

          return res.status(200).send({ data:{success:true, userDetails: result, message:"Successfully Loged in"}, errorNode:{errorCode:0, errorMsg:""}});
        }else{
          return res.status(200).send({ data:{success:false,message:'Password not match'}, errorNode:{errorCode:0, errorMsg:'Error'}})
        }
      }
    }else{
      return res.status(200).send({ data:{success:false,message:'Host name is not found'}, errorNode:{errorCode:0, errorMsg:'Error'}})
    }
  }else{
    return res.status(200).send({ data:{success:false,message:'Host name, Username and Password are required'}, errorNode:{errorCode:1, errorMsg:'Error'}})
  }
};

exports.vendorOtpchecking= async function (req, res, next) {

  var mobile = req.body.data.mobile;
  var otpcheck = req.body.data.otp;
  var storeId = req.body.data.storeId;
  var resultArray = [];

  if(storeId && storeId != '') {
    if(mobile && mobile != '' && otpcheck && otpcheck != '') {
      var vendor = await models.admins.findOne({ attributes: ['id', 'storeId', 'adminName', 'email', 'mobile', 'address', 'image'], where: {mobile: mobile, otp: otpcheck, storeId:storeId}});
      var msg = '';
      if(vendor != null){

        const permissionLogs = await models.permissionLog.findAll({where:{storeId:vendor.storeId}})
        const permissions = []
        for(let log of permissionLogs){
          const permissionName = await models.permissionGroup.findOne({attributes:['slug'],where:{id:log.permissionGroupId}})
          permissions.push(permissionName.slug)
        }

        resultArray.push({
          "id": vendor.id,
          "storeId": vendor.storeId,
          "name": vendor.adminName,
          "email": vendor.email,
          "phone": vendor.mobile,
          "address": vendor.address,
          "image": (vendor.image != '' && vendor.image != null) ? req.app.locals.baseurl + 'admin/vendorApp/' + vendor.image : req.app.locals.baseurl + 'admin/vendorApp/no_image.jpg',
          "permissions":permissions,
      });

        msg = "Valid otp";
        return res.status(200).send({ data:{success:true, userDetails: resultArray, message:msg}, errorNode:{errorCode:0, errorMsg:""}});
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

exports.vendorResendOtp= async function (req, res, next) {
  var mobile = req.body.data.mobile
  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    if(mobile && mobile != '') {
      var vendorDetails = await models.admins.findOne({ attributes: ['id', 'storeId', 'adminName', 'email', 'mobile', 'otp'], where: {mobile: mobile, storeId:storeId}});
      var msg = '';
      if(vendorDetails != null){
        msg = "Resend OTP successfully sent";
        var otp = Math.floor(1000 + Math.random() * 9000);
        models.admins.update({ 
          otp: otp
        },{where:{id:vendorDetails.id}}).then(function(val) {
          vendorDetails.otp=otp;
          return res.status(200).send({ data:{success:true, otp: vendorDetails.otp, storeId: vendorDetails.storeId, message:msg}, errorNode:{errorCode:0, errorMsg:""}});
        });

      } else{ msg = "No user found";
        return res.status(200).send({ data:{success:false,message:msg}, errorNode:{errorCode:1, errorMsg:''}});
      }    
    } else {
      return res.status(200).send({ data:{success:false,message:'Mobile number and OTP both are required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.vendornOrderlist= async function (req, res, next) {
  // var id = req.body.data.id;
  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    // if(id && id != '') {
      var order = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid, `orders`.customerName, `orders`.updatedAt, `orders`.paymentMethod, `orders`.orderStatus FROM `orders` where storeId = " +storeId+" and (orderStatus !='Delivered' AND orderStatus !='Cancelled') order by id DESC",{ type: Sequelize.QueryTypes.SELECT });
      var delivered_order = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid, `orders`.customerName, `orders`.updatedAt, `orders`.paymentMethod FROM `orders` where storeId = " +storeId+" and orderStatus ='Delivered' order by id DESC",{ type: Sequelize.QueryTypes.SELECT });
      console.log(order);
      var msg = '';
      if(order.length>0 || delivered_order.length>0){
        msg="Deliveryboy can accept order";
        return res.status(200).send({ data:{success:true, orderList: order, message:msg, deliveredOrder:delivered_order}, errorNode:{errorCode:0, errorMsg:""}});
      } else{ 
        msg = "Order are not assigned";
        return res.status(200).send({ data:{success:false,message:msg}, errorNode:{errorCode:1, errorMsg:''}});
      }    
    // } else {
    //   return res.status(200).send({ data:{success:false,message:'User id not found'}, errorNode:{errorCode:1, errorMsg:''}});
    // }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.vendorOrderDetails= async function (req, res, next) {
  var orid = req.body.data.orderId;
  var storeId = req.body.data.storeId;
  var resultArray = [];
  var deliveryTimeSlot = '';

  if(storeId && storeId != '') {
    if(orid && orid != '') {
      // var order = await models.orders.findOne({ attributes: ['id', 'storeId', 'orderNo', 'customerId', 'orderStatus', 'shippingMethod', 'paymentMethod', 'discountPercent', 'discountAmount', 'shippingAmount', 'amountPaid', 'customerName', 'customerEmail', 'customerMobile', 'billingAddress', 'shippingAddress', 'shippingCity', 'shippingState', 'shippingPin', 'shippingCountry', 'deliveryTimeSlotId', 'createdAt'], where: {id: orid, storeId:storeId}});
      // var order = await sequelize.query("SELECT o.*, d. FROM `orders` as o left join deliveryTimeSlot as d on d.id = o.deliveryTimeSlotId where storeId = " +storeId+" and id = " +orid,{ type: Sequelize.QueryTypes.SELECT });
      var order = await models.orders.findOne({ attributes: ['id', 'orderNo', 'orderStatus', 'shippingMethod', 'paymentMethod', 'shippingAmount', 'amountPaid', 'customerName', 'customerEmail', 'customerMobile', 'billingAddress', 'shippingAddress', 'deliveryTimeSlotId', 'createdAt', 'salesmanId'], where: {id: orid, storeId:storeId}});
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
        "salesmanId": order.salesmanId,
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

exports.vendorOrderDestination= async function (req, res, next) {
  var orid = req.body.data.orderId;
  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    if(orid && orid != '') {
      var dest = await models.orders.findOne({ attributes: ['shippingAddress', 'shippingCity', 'shippingCountry', 'shippingState', 'shippingPin', 'customerName'], where: {id: orid, storeId:storeId}});
      var source = await models.stores.findOne({ attributes: ['address', ['storeName', 'siteName']], where: {id: storeId}});
      var msg = '';
      msg="successfully generate order";
      return res.status(200).send({ data:{success:true, source: source, destination: dest, message:msg}, errorNode:{errorCode:0, errorMsg:''}});
              
    } else {
      return res.status(200).send({ data:{success:false,message:'Order Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.salesmanOrderInfo= async function (req, res, next) {
  var orid = req.body.data.orderId;
  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    if(orid && orid != '') {
      var order = await models.orderItems.findAll({ attributes: ['id', 'storeId', 'orderId', 'productId', 'name', 'description', 'qty', 'originalPrice', 'price', 'totalPrice'], where: {orderId: orid, storeId:storeId}});
      var odDetails = await models.orders.findOne({ attributes: ['giftMessage', 'paymentMethod', 'amountPaid'], where: {id: orid, storeId:storeId}});
      var msg = '';
      msg="successfully generate order";
      return res.status(200).send({ data:{success:true, orderItemList: order, details: odDetails, message:msg}, errorNode:{errorCode:0, errorMsg:''}});
              
    } else {
      return res.status(200).send({ data:{success:false,message:'Order Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
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
        },{where:{id: orid, storeId:storeId}}).then(function(val) {
          var msg = '';
          msg="Order successfully delivered to customer";
          return res.status(200).send({ data:{success:true, message:msg}, errorNode:{errorCode:0, errorMsg:''}});
        });
              
    } else {
      return res.status(200).send({ data:{success:false,message:'Order Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
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


exports.vendorDashboard= async function (req, res, next) {

  var storeId = req.body.data.storeId;
  var today = js_yyyy_mm_dd_hh_mm_ss();
  // var storeStatus = req.body.data.storeStatus;

  var resultArray = [];

  if(storeId && storeId != '') {
    var storesDetails = await sequelize.query("SELECT id, openStore FROM `stores` where id = " +storeId,{ type: Sequelize.QueryTypes.SELECT });
    if(storesDetails[0].openStore == 'Start') {

      resultArray.push({
        "totalOrderCount": 0,
        "totalOrderValue": 0,
        "totalCodDeliveredOrdersCount": 0,
        "totalCodDeliveredOrders": 0,
        "totalCancelledOrdersCount": 0,
        "totalCancelledValue": 0,
        "totalNewOrdersCount": 0,
        "storeStatus": storesDetails[0].openStore,
      });

    } else {

      // var totalOrders = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" ",{ type: Sequelize.QueryTypes.SELECT });
      // var totalOrdersValue = await sequelize.query("SELECT SUM(amountPaid) as todayTotalAmound  FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" ",{ type: Sequelize.QueryTypes.SELECT });
      var totalOrders = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid FROM `orders` where ( createdAt>= '" +today + "' AND `createdAt` < ('" + today + "' + INTERVAL 1 DAY)) and storeId = " +storeId+" ",{ type: Sequelize.QueryTypes.SELECT });
      var totalOrdersValue = await sequelize.query("SELECT SUM(amountPaid) as todayTotalAmound  FROM `orders` where ( createdAt>= '" +today + "' AND `createdAt` < ('" + today + "' + INTERVAL 1 DAY)) and storeId = " +storeId+" ",{ type: Sequelize.QueryTypes.SELECT });
      // var deliveredOrders = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and orderStatus ='Delivered'",{ type: Sequelize.QueryTypes.SELECT });

      // var totalCodDeliveredOrders = await sequelize.query("SELECT id, orderNo, amountPaid FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and orderStatus ='Delivered' and paymentMethod ='Cash On Delivery'",{ type: Sequelize.QueryTypes.SELECT });
      // var totalCodDeliveredValue = await sequelize.query("SELECT SUM(amountPaid) as todayTotalAmound  FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and orderStatus ='Delivered' and paymentMethod ='Cash On Delivery'",{ type: Sequelize.QueryTypes.SELECT });
      var totalCodDeliveredOrders = await sequelize.query("SELECT id, orderNo, amountPaid FROM `orders` where ( createdAt>= '" +today + "' AND `createdAt` < ('" + today + "' + INTERVAL 1 DAY)) and storeId = " +storeId+" and orderStatus ='Delivered' and paymentMethod ='Cash On Delivery'",{ type: Sequelize.QueryTypes.SELECT });
      var totalCodDeliveredValue = await sequelize.query("SELECT SUM(amountPaid) as todayTotalAmound  FROM `orders` where ( createdAt>= '" +today + "' AND `createdAt` < ('" + today + "' + INTERVAL 1 DAY)) and storeId = " +storeId+" and orderStatus ='Delivered' and paymentMethod ='Cash On Delivery'",{ type: Sequelize.QueryTypes.SELECT });

      // var totalCancelledOrders = await sequelize.query("SELECT id, orderNo, amountPaid FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and orderStatus ='Cancelled' ",{ type: Sequelize.QueryTypes.SELECT });
      // var totalCancelledValue = await sequelize.query("SELECT SUM(amountPaid) as todayTotalAmound  FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and orderStatus ='Cancelled' ",{ type: Sequelize.QueryTypes.SELECT });
      var totalCancelledOrders = await sequelize.query("SELECT id, orderNo, amountPaid FROM `orders` where ( createdAt>= '" +today + "' AND `createdAt` < ('" + today + "' + INTERVAL 1 DAY)) and storeId = " +storeId+" and orderStatus ='Cancelled' ",{ type: Sequelize.QueryTypes.SELECT });
      var totalCancelledValue = await sequelize.query("SELECT SUM(amountPaid) as todayTotalAmound  FROM `orders` where ( createdAt>= '" +today + "' AND `createdAt` < ('" + today + "' + INTERVAL 1 DAY)) and storeId = " +storeId+" and orderStatus ='Cancelled' ",{ type: Sequelize.QueryTypes.SELECT });

      if(storeId == 17) {
        // var totalNewOrders = await sequelize.query("SELECT id, orderNo, amountPaid FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and orderStatus ='New'",{ type: Sequelize.QueryTypes.SELECT });
        var totalNewOrders = await sequelize.query("SELECT id, orderNo, amountPaid FROM `orders` where ( createdAt>= '" +today + "' AND `createdAt` < ('" + today + "' + INTERVAL 1 DAY)) and storeId = " +storeId+" and orderStatus ='New'",{ type: Sequelize.QueryTypes.SELECT });
      } else {
        // var totalNewOrders = await sequelize.query("SELECT id, orderNo, amountPaid FROM `orders` where ( DATE(createdAt) BETWEEN CURDATE()-1 and CURDATE()+1) and storeId = " +storeId+" and orderStatus ='Processing'",{ type: Sequelize.QueryTypes.SELECT });
        var totalNewOrders = await sequelize.query("SELECT id, orderNo, amountPaid FROM `orders` where ( createdAt>= '" +today + "' AND `createdAt` < ('" + today + "' + INTERVAL 1 DAY)) and storeId = " +storeId+" and orderStatus ='Processing'",{ type: Sequelize.QueryTypes.SELECT });
      }

      resultArray.push({
        "totalOrderCount": totalOrders.length,
        "totalOrderValue": totalOrdersValue[0].todayTotalAmound,
        "totalCodDeliveredOrdersCount": totalCodDeliveredOrders.length,
        "totalCodDeliveredOrders": totalCodDeliveredValue[0].todayTotalAmound,
        "totalCancelledOrdersCount": totalCancelledOrders.length,
        "totalCancelledValue": totalCancelledValue[0].todayTotalAmound,
        "totalNewOrdersCount": totalNewOrders.length,
        "storeStatus": storesDetails[0].openStore,
      });
     

    }

    return res.status(200).send({ data:{success:true, dashboardDetails: resultArray[0], message:''}, errorNode:{errorCode:0, errorMsg:''}});
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


function js_yyyy_mm_dd_hh_mm_ss() {
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
  return year + "-" + month + "-" + day + "  00:00:00";
}

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


exports.vendorOpenOrderlist= async function (req, res, next) {

  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    if(storeId == 17){
      var openOrderList = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid, `orders`.updatedAt, `orders`.paymentMethod, `orders`.shippingAddress FROM `orders` where storeId = " +storeId+" and orderStatus ='New' order by id DESC",{ type: Sequelize.QueryTypes.SELECT });
    } else {
      var openOrderList = await sequelize.query("SELECT `orders`.id, `orders`.orderNo, `orders`.amountPaid, `orders`.updatedAt, `orders`.paymentMethod, `orders`.shippingAddress FROM `orders` where storeId = " +storeId+" and orderStatus ='Processing' order by id DESC",{ type: Sequelize.QueryTypes.SELECT });
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


exports.vendorOrderAcceptOrReject= async function (req, res, next) {

  var orderId = req.body.data.orderId;
  var storeId = req.body.data.storeId;
  var adminUserId = req.body.data.adminUserId;
  var flag = req.body.data.flag;
  var remarks = req.body.data.remarks;

  if(storeId && storeId != '') {
    if(orderId && orderId != '') {
      if(adminUserId && adminUserId != '') {
        if(flag && flag != '') {

          if(flag == 'accept') {
            models.orders.update({ 
              orderStatus: "Accepted",
            },{where:{id: orderId, storeId:storeId}}).then(function(val) {

              return res.status(200).send({ data:{success:true, message:"Order successfully accepted"}, errorNode:{errorCode:0, errorMsg:''}});
            });
            // return res.status(200).send({ data:{success:true, message:"Order successfully accepted"}, errorNode:{errorCode:0, errorMsg:''}});
          } else if(flag == 'reject'){

            models.orders.update({ 
              orderStatus: "Cancelled",
              adminCancelRemarks: remarks,
            },{where:{id: orderId, storeId:storeId}}).then(function(val) {

              return res.status(200).send({ data:{success:true, message:"Order successfully rejected from your list"}, errorNode:{errorCode:0, errorMsg:''}});
            });

          } else {
            return res.status(200).send({ data:{success:false,message:'Flag should be accept or rejecte'}, errorNode:{errorCode:1, errorMsg:''}});
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
          push_token: token,
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


exports.vendorOrderStatusList= async function (req, res, next) {

  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    var orderStatusList = await models.dropdownSettingsOptions.findAll({ attributes: ['id', 'optionLabel', 'optionValue', 'optionOrder'], where: {storeId:storeId}});
    // console.log(order);
    var msg = '';
    if(orderStatusList.length>0 ){
      msg="Order Status List found";
      return res.status(200).send({ data:{success:true, orderStatusList: orderStatusList, message:msg}, errorNode:{errorCode:0, errorMsg:""}});
    } else{ 
      msg = "Order Status List not found";
      return res.status(200).send({ data:{success:false,orderStatusList: [], message:msg}, errorNode:{errorCode:1, errorMsg:''}});
    } 
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.vendorOrderStatusUpdate= async function (req, res, next) {

  var storeId = req.body.data.storeId;
  var orderId = req.body.data.orderId;
  var orderStatus = req.body.data.orderStatus;
  var salesmanId = req.body.data.salesmanId ? req.body.data.salesmanId : null;

  if(storeId && storeId != '') {
    if(orderId && orderId != '') {
      if(orderStatus && orderStatus != '') {

        models.orders.update({ 
          orderStatus: orderStatus,
          salesmanId: salesmanId
        },{where:{id: orderId, storeId:storeId}}).then(async function(val) {

          if(salesmanId && salesmanId != '' && salesmanId != null) {
            var salesmanDetails = await models.salesman.findOne({ where: {id: salesmanId}});

            // console.log("aaaaaaaaaaaaaaaaaa----");
            if(salesmanDetails.pushToken != '' && salesmanDetails.pushToken != null) {
              console.log("vvvvvvvvvvvvvvvvvvvvvvv----");
              //push_notifications.generateNotification(salesmanDetails.id,'',storeId,"order-accept",orderId);
            }
          }

          return res.status(200).send({ data:{success:true, message:"Order successfully updated"}, errorNode:{errorCode:0, errorMsg:''}});
        });

      } else {
        return res.status(200).send({ data:{success:false,message:'Order status is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'Order Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.vendorDeliveryBoyList= async function (req, res, next) {

  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    var salesmanList = await models.salesman.findAll({ attributes: ['id', 'name', 'email', 'phone'], where: {storeId:storeId}});
    // console.log(order);
    var msg = '';
    if(salesmanList.length>0 ){
      msg="Deliveryboy List found";
      return res.status(200).send({ data:{success:true, salesmanList: salesmanList, message:msg}, errorNode:{errorCode:0, errorMsg:""}});
    } else{ 
      msg = "Deliveryboy List not found";
      return res.status(200).send({ data:{success:false,salesmanList: [], message:msg}, errorNode:{errorCode:1, errorMsg:''}});
    } 
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.userAddEdit= async function (req, res, next) {

  var storeId = req.body.data.storeId;
  var name = req.body.data.name;
  var email = req.body.data.email;
  var mobile = req.body.data.mobile;
  var designation = req.body.data.designation;
  var isdeliveryBoy = req.body.data.isdeliveryBoy;
  var userId = req.body.data.userId ? req.body.data.userId : '';
  // var salesmanId = req.body.data.salesmanId ? req.body.data.salesmanId : null;

  if(storeId && storeId != '') {
    if(name && name != '') {
      if(email && email != '') {
        if(mobile && mobile != '') {
          if(userId == '') {
            if(isdeliveryBoy =='yes') {

              models.salesman.create({ 
                name: name,
                storeId: storeId,
                email: email,
                phone: mobile,
                designation: designation,
                status: 'active',
              }).then(async function (rows) {

                return res.status(200).send({ data:{success:true, message:"User successfully create", data:rows}, errorNode:{errorCode:0, errorMsg:''}});
              });

            } else {
              models.admins.create({ 
                adminName: name,
                storeId: storeId,
                email: email,
                mobile: mobile,
                designation: designation,
                status: 'active',
              }).then(async function (rows) {

                return res.status(200).send({ data:{success:true, message:"User successfully create", data:rows}, errorNode:{errorCode:0, errorMsg:''}});
              });
            }
          } else {
            if(isdeliveryBoy =='yes') {
              models.salesman.update({ 
                name: name,
                storeId: storeId,
                email: email,
                phone: mobile,
                designation: designation,
              },{where:{id: userId, storeId:storeId}}).then(function(val) {
    
                return res.status(200).send({ data:{success:true, message:"User successfully updated"}, errorNode:{errorCode:0, errorMsg:''}});
              });
            } else {
              models.admins.update({ 
                adminName: name,
                storeId: storeId,
                email: email,
                mobile: mobile,
                designation: designation,
              },{where:{id: userId, storeId:storeId}}).then(function(val) {
    
                return res.status(200).send({ data:{success:true, message:"User successfully updated"}, errorNode:{errorCode:0, errorMsg:''}});
              });
            }
          }

        } else {
          return res.status(200).send({ data:{success:false,message:'Mobile is required'}, errorNode:{errorCode:1, errorMsg:''}});
        }

      } else {
        return res.status(200).send({ data:{success:false,message:'Email is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'Name is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.userList = async function (req, res, next) {

  var storeId = req.body.data.storeId;
  var resultArray = [];

  if(storeId && storeId != '') {
    var adminList = await models.admins.findAll({ attributes: ['id', 'storeId', 'adminName', 'email', 'mobile', 'designation'], where: {status: "active", storeId:storeId}});
    var salesmanList = await models.salesman.findAll({ attributes: ['id', 'storeId', 'name', 'email', 'phone', 'designation'], where: {status: "active", storeId:storeId}});
    var msg = '';
    if(adminList.length > 0){
      for(var i = 0; i < adminList.length; i++){
        resultArray.push({
          "id": adminList[i].id,
          "storeId": adminList[i].storeId,
          "name": adminList[i].adminName,
          "email": adminList[i].email,
          "mobile": adminList[i].mobile,
          "designation": adminList[i].designation,
          "isdeliveryBoy": 'no'
        });
      }
    } 

    if(salesmanList.length > 0){
      for(var j = 0; j < salesmanList.length; j++){
        resultArray.push({
          "id": salesmanList[j].id,
          "storeId": salesmanList[j].storeId,
          "name": salesmanList[j].name,
          "email": salesmanList[j].email,
          "mobile": salesmanList[j].phone,
          "designation": salesmanList[j].designation,
          "isdeliveryBoy": 'yes'
        });

        // console.log("222222222222222----"+Number(salesmanList.length));
        // console.log("3333333333333333333333---------------"+Number(j+1));
        // if(Number(salesmanList.length) == Number(j+1)){
        //   console.log("111111111111111111111111111");
        //   return res.status(200).send({ data:{success:true, userDetails: resultArray, message:'List found'}, errorNode:{errorCode:0, errorMsg:""}});
        // }
      }
    } 
    // else {
    //   return res.status(200).send({ data:{success:true, userDetails: resultArray, message:'List found'}, errorNode:{errorCode:0, errorMsg:""}});
    // }
    
    return res.status(200).send({ data:{success:true, userDetails: resultArray, message:'List found'}, errorNode:{errorCode:0, errorMsg:""}});
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.storeUpdate = async(req, res)=>{
  const {storeId, status} = req.body.data

  if(storeId !=''){
    if(storeId !=''){
        await models.stores.update({
          openStore: status
        }, {where:{id:storeId}})
        .then(data => {
            return res.status(200).send({ data:{success:true, details: 'Successfully status changed'}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        })
        .catch(err => {
            return res.status(500).send({ data:{success:false, details: 'Something went wrong !'}, errorNode:{errorCode:1, errorMsg:err}})
        })
      }else{
      return res.status(400).send({ data:{success:false, details: 'Status is required'}, errorNode:{errorCode:1, errorMsg:"Error"}})
    }
  }else{
      return res.status(400).send({ data:{success:false, details: 'StoreId is required'}, errorNode:{errorCode:1, errorMsg:"Error"}})
  }
}


exports.orderStatusChange = async(req, res)=>{
  const {storeId, orderStatus, orderId} = req.body.data

  if(storeId !='' && orderStatus !='' && orderId !=''){
      await models.orders.update({
          orderStatus: orderStatus
      }, {where:{id:orderId, storeId:storeId}})
      .then(data => {
          return res.status(200).send({ data:{success:true, details: 'Successfully status changed'}, errorNode:{errorCode:0, errorMsg:"No Error"}})
      })
      .catch(err => {
          return res.status(500).send({ data:{success:false, details: 'Something went wrong !'}, errorNode:{errorCode:1, errorMsg:err}})
      })
  }else{
      return res.status(400).send({ data:{success:false, details: 'StoreId, orderId and orderStatus is required'}, errorNode:{errorCode:1, errorMsg:"Error"}})
  }
}


exports.attributeDetails = async(req, res)=>{
  const storeId = req.body.data.storeId || ""

  if(storeId =="")
  return res.status(400).send({ data:{success:false, details: 'StoreId is required'}, errorNode:{errorCode:1, errorMsg:"Error"}})

  const attr = await models.attributesetting.findAll({attributes:['attrName','fieldName','displayName','dataType',[sequelize.literal('""'), 'value']], where:{status:'Yes', storeId:storeId}, include: [{attributes:['label','value'], model: models.attributevalue, required: false }]})

  if(attr.length>0){
    return res.status(200).send({ data:{success:true, details: attr}, errorNode:{errorCode:0, errorMsg:"No Error"}})
  }else{
    return res.status(200).send({ data:{success:true, details: []}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
  }
}

exports.vendorForgotPassword= async function (req, res, next) {
  var email = req.body.data.email
  var hostName = req.body.data.hostName

  if(hostName && hostName != '') {
    var hostDetails = await models.stores.findOne({ where: {cCode: hostName}});
    var storeName = hostDetails.storeName;
    var storeEmail = hostDetails.email;
    if(hostDetails) {
      if(email && email != '') {
        var vendor = await models.admins.findOne({ where: {username: email, storeId:hostDetails.id}});
        var msg = '';
        if(vendor != null){

          var base64data = Buffer.from(email).toString('base64');
          var resetLink = 'https://partner.tezcommerce.com/forgot-password/'+hostName+'/' +  base64data;
          // var localResetLink = 'http://localhost:8100/forgot-password/'+hostName+'/' + base64data;

          // var edata = {
          //   from: storeName+' <'+storeEmail+'>',
          //   to: email,
          //   subject: 'Team | '+storeName,
          //   text: 'To reset your password please click the button <a href='+ resetLink + '> <button >Forgot password</button> </a>',
          // };
              
          // mailgun.messages().send(edata, function (error, body) {
          //     console.log(body);
          // });

          return res.status(200).send({ data:{success:true, message:'forgot password link send to your email', storeId:hostDetails.id, url:base64data, resetLink:resetLink}, errorNode:{errorCode:0, errorMsg:""}});

        } else{
          return res.status(200).send({ data:{success:false,message:'No user found'}, errorNode:{errorCode:0, errorMsg:''}});
        }    
      } else {
        return res.status(200).send({ data:{success:false,message:'Email Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'This host name is not registered'}, errorNode:{errorCode:0, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Host name is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.forgotPasswordCheck = async function (req, res, next) {
  var encript = req.body.data.encript
  var hostName = req.body.data.hostName

  if(hostName && hostName != '') {
    var hostDetails = await models.stores.findOne({ where: {cCode: hostName}});
    
    if(hostDetails) {
      if(encript && encript != '') {

        var base64data = Buffer.from(encript, 'base64').toString('ascii');
        var vendor = await models.admins.findOne({ where: {username: base64data, storeId:hostDetails.id}});

        if(vendor != null){

          return res.status(200).send({ data:{success:true, data: vendor, message:'User Found'}, errorNode:{errorCode:0, errorMsg:""}});

        } else{
          return res.status(200).send({ data:{success:false,message:'No user found'}, errorNode:{errorCode:0, errorMsg:''}});
        }
      } else {
        return res.status(200).send({ data:{success:false,message:'Encripted token is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'This host name is not registered'}, errorNode:{errorCode:0, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Host name is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.vendorResetPassword = async function (req, res, next) {
  var id = req.body.data.id
  var password = req.body.data.password

  if(id && id != '') {
    if(password && password != '') {

      var vendor = await models.admins.findOne({ where: {id: id}});

      if(vendor != null){

        models.admins.update({ 
          password: bcrypt.hashSync(password)
        },{where:{id: id}}).then(function(val) {
          return res.status(200).send({ data:{success:true, message:'Password update successfully'}, errorNode:{errorCode:0, errorMsg:""}});
        });

      } else{
        return res.status(200).send({ data:{success:false,message:'No user found'}, errorNode:{errorCode:0, errorMsg:''}});
      } 
    } else {
      return res.status(200).send({ data:{success:false,message:'Password is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'User id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.viewProfile = async (req, res) => {
  const storeId = req.body.data.storeId || null

  if(!storeId)
    return res.status(400).send({ data:{success:false, message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:'Store id is required'}});

  const storeDetails = await models.stores.findOne({attributes:['cCode','storeName','company','storeOwner','email','mobile','fax','gstn','siteURL','copyright','logo','fabIcon','location','country','address','latitude','longitude','facebookLink','instagramLink','twitterLink','youtubeLink','otherLink'],where:{id: storeId}})

  const modifyDetails = {
    storeId: storeId,
    host: storeDetails.cCode,
    storeName: storeDetails.storeName,
    company: storeDetails.company,
    storeOwner: storeDetails.storeOwner,
    email: storeDetails.email,
    mobile: storeDetails.mobile,
    fax: storeDetails.fax,
    gstn: storeDetails.gstn,
    siteURL: storeDetails.siteURL,
    copyright: storeDetails.copyright,
    logo: storeDetails.logo ? req.app.locals.baseurl + "admin/stores/" + storeId + "/" + storeDetails.logo : req.app.locals.baseurl + "admin/category/no_image.jpg",
    fabIcon: storeDetails.fabIcon ? req.app.locals.baseurl + "admin/stores/" + storeId + "/" + storeDetails.fabIcon : req.app.locals.baseurl + "admin/category/no_image.jpg",
    location: storeDetails.location,
    country: storeDetails.country,
    address: storeDetails.address,
    latitude: storeDetails.latitude,
    longitude: storeDetails.longitude,
    facebookLink: storeDetails.facebookLink,
    instagramLink: storeDetails.instagramLink,
    twitterLink: storeDetails.twitterLink,
    youtubeLink: storeDetails.youtubeLink,
    otherLink: storeDetails.otherLink,
  }
  return res.status(200).send({ data:{success:true, details: modifyDetails}, errorNode:{errorCode:0, errorMsg:'No Error'}});
};

exports.editProfile = async (req, res) => {
  const storeId = req.body.data.storeId || null
  const cCode = req.body.data.host || null
  const storeName = req.body.data.storeName || null
  const company = req.body.data.company || null
  const storeOwner = req.body.data.storeOwner || null
  const email = req.body.data.email || null
  const mobile = req.body.data.mobile || null
  const fax = req.body.data.fax || null
  const gstn = req.body.data.gstn || null
  const siteURL = req.body.data.siteURL || null
  const copyright = req.body.data.copyright || null
  const logoExt = req.body.data.logoExt || null
  const logo = req.body.data.logo || null
  const fabIcon = req.body.data.fabIcon || null
  const fabIconExt = req.body.data.fabIconExt || null
  const location = req.body.data.location || null
  const country = req.body.data.country || null
  const address = req.body.data.address || null
  const latitude = req.body.data.latitude || null
  const longitude = req.body.data.longitude || null
  const facebookLink = req.body.data.facebookLink || null
  const instagramLink = req.body.data.instagramLink || null
  const twitterLink = req.body.data.twitterLink || null
  const youtubeLink = req.body.data.youtubeLink || null
  const otherLink = req.body.data.otherLink || null

  if(!storeId)
    return res.status(400).send({ data:{success:false, message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:'Store id is required'}});

  try {
    await models.stores.update({
      cCode: cCode,
      storeName: storeName,
      company: company,
      storeOwner: storeOwner,
      email: email,
      mobile: mobile,
      fax: fax,
      gstn: gstn,
      siteURL: siteURL,
      copyright: copyright,
      location: location,
      country: country,
      address: address,
      latitude: latitude,
      longitude: longitude,
      facebookLink: facebookLink,
      instagramLink: instagramLink,
      twitterLink: twitterLink,
      youtubeLink: youtubeLink,
      otherLink: otherLink,
    }, {where:{id : storeId}})
  
    const dir = "./public/admin/stores/" + storeId;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    if (logo && logoExt) {
      const logoTitle = Date.now();
      const path = "./public/admin/stores/" + storeId + "/" + logoTitle + "." + logoExt;
      const normallogo = logoTitle + "." + logoExt;
      const imgdata = logo;
      const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, "" );         
      fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
      await models.stores.update({logo: normallogo},{ where: { id: storeId } } );
    }
  
    if (fabIcon && fabIconExt) {
      const fabIconTitle = Date.now();
      const path = "./public/admin/stores/" + storeId + "/" + fabIconTitle + "." + fabIconExt;
      const normalfabIcon = fabIconTitle + "." + fabIconExt;
      const imgdata = fabIcon;
      const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, "" );         
      fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
      await models.stores.update({fabIcon: normalfabIcon},{ where: { id: storeId } } );
    }
  
    return res.status(200).send({ data:{success:true, message: "Successfully updated"}, errorNode:{errorCode:0, errorMsg:'No Error'}});
  } catch (error) {
    return res.status(500).send({ data:{success:false, message: "Something went wrong"}, errorNode:{errorCode:1, errorMsg:error}});
  }
};

exports.viewMessage = async (req, res) => {
  try {
    const storeId = req.body.data.storeId || null

    if(!storeId)
      return res.status(400).send({ data:{success:false, message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:'Store id is required'}});

      const popupMessage = await models.popupMessage.findOne({attributes:['id','title','message'], where:{storeId: storeId}})
      return res.status(200).send({ data:{success:true, details: popupMessage ? popupMessage : {} }, errorNode:{errorCode:0, errorMsg:"No error"}});

  } catch (error) {
    return res.status(500).send({ data:{success:false, message: "Something went wrong"}, errorNode:{errorCode:1, errorMsg:error}});
  }
}

exports.addEditMessage = async (req, res) => {
  try {
    const storeId = req.body.data.storeId || null
    const title = req.body.data.title || null
    const message = req.body.data.message || null

    if(!storeId)
      return res.status(400).send({ data:{success:false, message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:'Store id is required'}});

      const messageCount = await models.popupMessage.count({where:{storeId: storeId}})

      if(messageCount){
        await models.popupMessage.update({
          title: title,
          message: message,
        }, {where:{storeId: storeId}})

        return res.status(201).send({ data:{success:true, message: "Successfully updated" }, errorNode:{errorCode:0, errorMsg:"No error"}});
      }else{
        await models.popupMessage.create({
          storeId: storeId,
          title: title,
          message: message,
        })

        return res.status(200).send({ data:{success:true, message: "Successfully created" }, errorNode:{errorCode:0, errorMsg:"No error"}});
      }
      
  } catch (error) {
    return res.status(500).send({ data:{success:false, message: "Something went wrong"}, errorNode:{errorCode:1, errorMsg:error}});
  }
}
