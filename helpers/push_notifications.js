/** This is helper function where we can uoload fiels of every modules also file path will set where
 * Developer : NILMONI PATRA @Bluehorse
 */
const formidable = require('formidable');
var models = require('../models');
const glob = require("glob");
const fs = require("fs-extra");
const path = require('path');
//var fcm = require('fcm-notification');
var privatekey = require('../config/privatekey.json');
// var privatekey_vendorApp = require('../config/privatekey_vendorApp.json');
const ds = path.sep;
var config = require('../config/config.json');
const emailConfig = require('../config/email-config')();
const mailgun = require("mailgun-js")(emailConfig);
const urlServer ='https://gexpr.com:8080/';
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
  }
);
const nodemailer = require('nodemailer');
//const FCM = new fcm(privatekey);
// const FCMVA = new fcm(privatekey_vendorApp);
module.exports = {

  


  /**
   * Generate the contents and token for the push notification
   * @param {*} action 
   * @param {*} pro_id 
   * @param {*} caller_id 
   * @param {*} amount 
   * @param {*} currency 
   * @param {*} id   //id of the appointment/activity/message
   * Developer: Mitrajit Samanta
   */
  // generateNotification: async function(action, pro_id, caller_id, amount, currency, id){
    generateNotification: async function(salesmanId,vendorId, storeId, action, orderId){
    console.log("*********************** 44 *************************")
    
    var salesmanDetails = '';
    var customersDetails = '';
    var vendorDetails = '';
    
    console.log("zzzzzzzzzzzzz----"+salesmanId);
    console.log("xxxxxxxxxxxxxxx----"+storeId);
    console.log("ccccccccccccc----"+action);
    console.log("dddddddddddddd----"+vendorId);

    if(salesmanId != ''){
      if(action == "order-delivered") {
        customersDetails = await models.customers.findOne({attributes:['id', 'storeId', 'pushToken'],where:{id:salesmanId, storeId:storeId}});
      } else {
        salesmanDetails = await models.salesman.findOne({attributes:['id', 'storeId', 'pushToken','name'],where:{id:salesmanId, storeId:storeId}});
      }
    }
    if(vendorId != '') vendorDetails = await models.admins.findOne({attributes:['id', 'storeId', 'pushToken','adminName'],where:{id:vendorId, storeId:storeId}});


    if(action == "order-accept") {
      if(salesmanDetails.pushToken != '') {
        let data = {
          type: action,
          page: 'new-delivery',
          orderId: orderId.toString(),
          // defaultSound: true,
          sound:'notification.mpeg'
        }

        let notification = {
          title: 'You have a new order to deliver',
          body: 'You have a new order to deliver',
        }

        
        this.sendNotification(data, notification, salesmanDetails.pushToken);
      }
    } else if(action == "order-create") {
      if(vendorDetails.pushToken != '') {
        let data = {
          type: action,
          page: 'new-delivery',
          orderId: orderId.toString(),
          sound:'notification.mpeg'
        }

        let notification = {
          title: 'You have a new order',
          body: 'You have a new order',
        }

        
        this.sendNotification(data, notification, vendorDetails.pushToken);
      }
    } else if(action == "order-delivered") {
      if(customersDetails.pushToken != '') {
        let data = {
          type: action,
          page: 'new-delivery',
          orderId: orderId.toString(),
          sound:'notification.mpeg'
        }

        let notification = {
          title: 'You order successfully delivered',
          body: 'You order successfully delivered',
        }

        
        this.sendNotification(data, notification, salesmanDetails.pushToken);
      }
    } else if(action == "order-delivered-admin") {
      if(vendorDetails.pushToken != '') {
        let data = {
          type: action,
          page: 'new-delivery',
          orderId: orderId.toString(),
          sound:'notification.mpeg'
        }

        let notification = {
          title: 'You order successfully delivered',
          body: 'You order successfully delivered',
        }

        this.sendNotification(data, notification, vendorDetails.pushToken);
      }
    }
  },




  /**
   * Send the push notification
   * @param {*} title 
   * @param {*} body 
   * @param {*} push_token 
   * @param {*} user_slug 
   * Developer: Mitrajit Samanta
   */
   sendNotification: async function(data, notification, push_token){
    console.log("------------------------------------ 290 ------------------------------")
    console.log(data)
    console.log(JSON.stringify(notification))
    console.log("------------------------------------ 290 ------------------------------")
    //var FCM = new fcm(privatekey);
    let message = {
      data: data,
      notification: notification,
      android: {
        notification: {
          sound: 'default',
          icon:"fcm_push_icon",
          click_action: 'FCM_PLUGIN_ACTIVITY',
        },
      },
      token : push_token
    };

    console.log(message);
      
    try {
      FCM.send(message, function(err, response) {
        if(err){
          console.log('error found', err);
        }else {
          console.log('response here', response);
        }
      })
    } catch (error) {
      console.log(error);
    } 
},


    // ///////////////////////////// vendor app notification start ///////////////////
  //   generateNotificationVendorApp: async function(vendorId, storeId, action, orderId){
  //     console.log("*********************** 44 *************************")
  //     var caller = '';
  //     var pro = '';
  
  //     var vendorDetails = '';
      
  
  //     console.log("zzzzzzzzzzzzz----"+vendorId);
  //     console.log("xxxxxxxxxxxxxxx----"+storeId);
  //     console.log("ccccccccccccc----"+action);
  
  //     // if(pro_id != '') pro = await models.users.findOne({attributes:['id', 'user_slug', 'push_token','user_name'],where:{id:pro_id}});
  //     // if(caller_id != '') caller = await models.users.findOne({attributes:['id','user_slug', 'push_token','user_name'],where:{id:caller_id}});
  //     if(vendorId != '') vendorDetails = await models.admins.findOne({attributes:['id', 'storeId', 'pushToken','adminName'],where:{id:vendorId, storeId:storeId}});
  
  //     console.log("mmmmmmmmmmmmm----"+vendorDetails.adminName);
  
  //     if(action == "order-create") {
  //       console.log("nnnnnnnnnnnnnnn----"+vendorDetails.adminName);
  //       if(vendorDetails.pushToken != '') {
  //         console.log("sssssssssssssssssss----"+vendorDetails.adminName);
  //         let data = {
  //           type: action,
  //           page: 'new-delivery',
  //           orderId: orderId.toString(),
  //           // defaultSound: true,
  //           sound:'notification.mpeg'
  //         }
  
  //         let notification = {
  //           title: 'You have a new order',
  //           body: 'You have a new order',
  //         }
  
  //         console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"+data);
  //         console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"+data.sound);
  //         this.sendNotificationVendoeApp(data, notification, vendorDetails.pushToken);
  //       }
  //     } 
  //     console.log("*********************** 44 *************************")
  // },




  /**
   * Send the push notification
   * @param {*} title 
   * @param {*} body 
   * @param {*} push_token 
   * @param {*} user_slug 
   * Developer: Mitrajit Samanta
   */
  sendNotificationVendoeApp: async function(data, notification, push_token){
    console.log("------------------------------------ 290 ------------------------------")
    console.log(data)
    console.log(JSON.stringify(notification))
    console.log("------------------------------------ 290 ------------------------------")
    //var FCM = new fcm(privatekey);
    let message = {
      data: data,
      notification: notification,
      android: {
        notification: {
          sound: 'default',
          icon:"fcm_push_icon",
          click_action: 'FCM_PLUGIN_ACTIVITY',
        },
      },
      token : push_token
    };

    console.log(message);
      
    try {
      FCMVA.send(message, function(err, response) {
        if(err){
          console.log('error found', err);
        }else {
          console.log('response here', response);
        }
      })
    } catch (error) {
      console.log(error);
    } 
},

    ///////////////////// vendor app notification end //////////////////////////// 
  
};




