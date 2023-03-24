// const sendSmsService = require('msg91-sdk').SendSmsService;

var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
var flash = require('connect-flash');
var config = require("../../config/config.json");
const sms_controller = require('../sms/smsController.js');
var fs = require("fs");
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

var request = require('request'); //require somewhere and use




exports.sendsms = function(mobile_number, order_id, time, action) {
    const sendSms = new sendSmsService("317183A3kl4STEH5f3664d8P1", "ZBRDST", "4");
    sendSms.senderId
    const mobileNumber = mobile_number // mobile number of the user
    //var templateId = "5f367948d6fc0551fa6577dc" // Template created in msg91 platform 

    var templateId = '';
    var params = '';
    switch (action) {
        case "otp":
            templateId = "5f3773a2d6fc051546342571";
            break;

        case "receiving_order":
            templateId = "5f367948d6fc0551fa6577dc";
            params = {
                time: time,
                order_id: order_id,
            }
            break;

        case "receiving_food":
            templateId = "5f3679fed6fc051791068e90";
            break;

        case "food_ready":
            templateId = "5f3679b8d6fc054c51561e34";
            break;

        case "food_cancelation":
            templateId = "5f36798ad6fc0566d55d336e";
            params = {
                order_id: order_id,
            }
            break;

        default:
            break;
    }
    
    
    //Template Message in msg91 ->  Hi All, Welcome you all##COMPANY_NAME## 
    /**
     * const params = {COMPANY_NAME:"MSG91-SDK"}
     **/
    
    /* const params = {
        time: "10:10 AM",
        order_id: "ZBR123456",
    } */
    
    if(action == "receiving_order") {
        var mobile_numbers = ["9647000580---","9614271996----","7602477786---"];
        for(var i=0; i<mobile_numbers.length; i++) {
            sendSms.sendSMSFlow(mobile_numbers[i], templateId, params).then((response) => {
                //Handle success result
                console.log("SMS sent")
                console.log(response);
            }).catch((err) => {
                //Handle failure result
                console.log("Failed to send SMS");
                console.log(err);
            });
        }

    } else {
        sendSms.sendSMSFlow(mobileNumber, templateId, params).then((response) => {
            //Handle success result
            console.log("SMS sent")
            console.log(response);
        }).catch((err) => {
            //Handle failure result
            console.log("Failed to send SMS");
            console.log(err);
        });
    }
}


// exports.sendotp = function(mobile_number, otp) {
//     // const sendSms = new sendSmsService("317183A3kl4STEH5f3664d8P1", "ZBRDST", "4");
//     // sendSms.senderId
//     // const mobileNumber = mobile_number // mobile number of the user
//     // var templateId = "5f3773a2d6fc051546342571" //Template created in msg91 platform 

//     const sendSms = new sendSmsService("362790ArvbzCtY60cc81bdP1", "FYOPRO", "4");
//     sendSms.senderId
//     const mobileNumber = "91"+mobile_number // mobile number of the user
//     // var templateId = "5f3773a2d6fc051546342571" //Template created in msg91 platform for zbrdst
//     var templateId = "610a9551c54d156c350355d9" //Template created in msg91 platform for outcry

    
    
//     //Template Message in msg91 ->  Hi All, Welcome you all##COMPANY_NAME## 
//     /**
//      * const params = {COMPANY_NAME:"MSG91-SDK"}
//      **/
    
//     // params = {
//     //     otp: otp,
//     // }

//     const params = {
//         otp: otp,
//         message: 'FYOPRO OTP is '+otp+'. Use this to verify your mobile - FYOPRO',
//     }
    
//     sendSms.sendSMSFlow(mobileNumber, templateId, params).then((response) => {
//         //Handle success result
//         console.log("SMS sent")
//         console.log(response);
//     }).catch((err) => {
//         //Handle failure result
//         console.log("Failed to send SMS");
//         console.log(err);
//     });
// }

exports.sendotp = async function(phone, otp) {
    // // const sendSms = new sendSmsService("317183A3kl4STEH5f3664d8P1", "ZBRDST", "4");
    // // const sendSms = new sendSmsService("362790ArvbzCtY60cc81bdP1", "FYOPRO", "4");
    // const sendSms = new sendSmsService("317183A3kl4STEH5f3664d8P1-----", "BLUHRS---", "4---");
    // sendSms.senderId
    // const mobileNumber = "91"+mobile_number // mobile number of the user
    // // var templateId = "5f3773a2d6fc051546342571" //Template created in msg91 platform for zbrdst old
    // // var templateId = "610a9551c54d156c350355d9" //Template created in msg91 platform for outcry
    // var templateId = "6285fd3292103740aa221ce4----" //Template created in msg91 platform for Bluehorse

    
    
    // //Template Message in msg91 ->  Hi All, Welcome you all##COMPANY_NAME## 
    // /**
    //  * const params = {COMPANY_NAME:"MSG91-SDK"}
    //  **/
    
    // params = {
    //     var2: otp,
    //     var1: 'zbrdst',
    // }

    // // params = {
    // //     otp: otp,
    // //     company_name: "FYOPRO",
    // // }
    
    // sendSms.sendSMSFlow(mobileNumber, templateId, params).then((response) => {
    //     //Handle success result
    //     console.log("SMS sent")
    //     console.log(response);
    // }).catch((err) => {
    //     //Handle failure result
    //     console.log("Failed to send SMS");
    //     console.log(err);
    // });

    // // require('msg91-sdk').getBalance("317183A3kl4STEH5f3664d8P1", "4").then((response) => {
    // //     //Handle success result
    // //         console.log("SMS sent")
    // //     console.log(response);
    // //     }).catch((err) => {
    // //     //Handle failure result
    // //         console.log("Failed to send SMS");
    // //     console.log(err);
    // //     })

    // res.redirect('http://www.elitbuzz-me.com/sms/smsapi?api_key=C2003530627b60d5827979.92878775&type=text&contacts=+918670211650&senderid=MAWFOOR&msg=Your%20Mawfoor%20Code%20is%204321.%20Never%20share%20this%20code');
    // const fd = await fs.open('http://www.elitbuzz-me.com/sms/smsapi?api_key=C2003530627b60d5827979.92878775&type=text&contacts=+918670211650&senderid=MAWFOOR&msg=Your%20Mawfoor%20Code%20is%204321.%20Never%20share%20this%20code');

    var url = 'http://www.elitbuzz-me.com/sms/smsapi?api_key=C2003530627b60d5827979.92878775&type=text&contacts=00971'+phone+'&senderid=MAWFOOR&msg=Your%20Mawfoor%20Code%20is%20'+otp+'.%20Never%20share%20this%20code'; //omitted for brevity

    request(url, function(err, response, body) {
        // Do more stuff with 'body' here
    });

    
        
}

exports.orderSuccessMsg = async function(phone, orderNo) {

    var url = 'http://www.elitbuzz-me.com/sms/smsapi?api_key=C2003530627b60d5827979.92878775&type=text&contacts=00971'+phone+'&senderid=MAWFOOR&msg=order%20success-%20Thank%20you%20for%20purchasing%20from%20mawfoor.%20Your%20order%20id%20is%20'+orderNo+'.'; //omitted for brevity

    request(url, function(err, response, body) {
        // Do more stuff with 'body' here
    });

    
        
}

exports.sendsms1 = function(mobile_number,massage) {
    const sendSms = new sendSmsService("317183A3kl4STEH5f3664d8P1----", "ZBRDST----", "4----");
    sendSms.senderId
  
    sendSms.senderId
    const mobileNumbers = mobile_number  // (*) mobile number of the client
     
    const messages = massage
    // const messages = 'your otp is 1234'
    const countryDialCode = "91" // "91" -> India, "1" -> USA, "44" -> UK, etc
     
    sendSms.sendSMSRequest(mobileNumbers, messages, countryDialCode).then((response) => {
        
    //Handle success result
            console.log("SMS sent")
        console.log(response);
    }).catch((err) => {
    //Handle failure result
            console.log("Failed to send SMS");
        console.log(err);
    })



}


