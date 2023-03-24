/** This is helper function where we can uoload fiels of every modules also file path will set where
 * Developer : NILMONI PATRA @Bluehorse
 */
const formidable = require('formidable');
var models = require('../models');
const glob = require("glob");
const fs = require("fs-extra");
const path = require('path');
var fcm = require('fcm-notification');
var privatekey = require('../config/privatekey_vendorApp.json');
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
var FCM = new fcm(privatekey);
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
    generateNotification: async function(vendorId, storeId, action, orderId){
      console.log("*********************** 44 *************************")
      var caller = '';
      var pro = '';
  
      var vendorDetails = '';
      
  
      console.log("zzzzzzzzzzzzz----"+vendorId);
      console.log("xxxxxxxxxxxxxxx----"+storeId);
      console.log("ccccccccccccc----"+action);
  
      // if(pro_id != '') pro = await models.users.findOne({attributes:['id', 'user_slug', 'push_token','user_name'],where:{id:pro_id}});
      // if(caller_id != '') caller = await models.users.findOne({attributes:['id','user_slug', 'push_token','user_name'],where:{id:caller_id}});
      if(vendorId != '') vendorDetails = await models.admins.findOne({attributes:['id', 'storeId', 'pushToken','adminName'],where:{id:vendorId, storeId:storeId}});
  
      console.log("mmmmmmmmmmmmm----"+vendorDetails.adminName);
  
      if(action == "order-create") {
        console.log("nnnnnnnnnnnnnnn----"+vendorDetails.adminName);
        if(vendorDetails.pushToken != '') {
          console.log("sssssssssssssssssss----"+vendorDetails.adminName);
          let data = {
            type: action,
            page: 'new-delivery',
            orderId: orderId.toString(),
            // defaultSound: true,
            sound:'notification.mpeg'
          }
  
          let notification = {
            title: 'You have a new order',
            body: 'You have a new order',
          }
  
          console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"+data);
          console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"+data.sound);
          this.sendNotification(data, notification, vendorDetails.pushToken);
        }
      } 
      console.log("*********************** 44 *************************")
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
  
};




