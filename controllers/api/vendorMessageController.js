var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
var flash = require('connect-flash');
var config = require("../../config/config.json");
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

var fs = require('fs')
var fs = require('file-system');


/**
 * Description: This function is developed for sitesetting and sitesettinggroup list
 * @param req
 * @param res user details with jwt token
 * Developer: Surajit Gouri
 */


exports.messageAdd = async function(req,res){
    var storeId = req.body.data.storeId;
    var senderId = req.body.data.senderId;
    var message = req.body.data.message;
    
    if(storeId && storeId !='' && senderId && senderId !='' && message && message !='' ){

        let adminDetails = await models.admins.findOne({attributes:['id','storeId','adminName','email'], where:{storeId:storeId}});
        if(adminDetails){
        
            models.message.create({
                storeId   :storeId,
                senderId: senderId,
                adminId: adminDetails.id,
                message: message,
                senderType: 'customer',
                createdBy: senderId,
            }).then(async function(message) {  

                let messageDetails = await models.popupMessage.findOne({attributes:['id','storeId','message','title'], where:{storeId:storeId}});
                if(messageDetails){
                    if(messageDetails.message != null ){
                        var adminMessage = messageDetails.message;
                    } else {
                        var adminMessage = 'Thank You. Please Wait.';
                    }
                } else {
                    var adminMessage = 'Thank You. Please Wait.';
                }

                models.message.create({
                    storeId   :storeId,
                    senderId: senderId,
                    adminId: adminDetails.id,
                    message: adminMessage,
                    senderType: 'admin',
                    createdBy: adminDetails.id,
                })

                return res.status(200).send({ data:{success:true, message:'Message successfully send'}, errorNode:{errorCode:0, errorMsg:""}});
            }).catch(function(error) {
                return res.status(200).send({ data:{success:false, details:"",message:'something went wrong. Please try again'}, errorNode:{errorCode:1, errorMsg:error}});
            });
        } else {
            return res.status(200).send({ data:{success:false, message:'Admin not found'}, errorNode:{errorCode:1, errorMsg:"Error"}});
        }

    } else {
        return res.status(200).send({ data:{success:false, message : "Store id, Sender id and Message are required"}, errorNode:{errorCode:1, errorMsg:"error"}});
    }
}


exports.messageList = async function(req,res){
    var storeId = req.body.data.storeId;
    var senderId = req.body.data.senderId;
    if(storeId && storeId !=''){
        if(senderId && senderId !=''){
            const msgList = await sequelize.query("SELECT message.*, customers.fullName, admins.adminName FROM `message` left join customers on customers.id = message.senderId left join admins on admins.id = message.adminId WHERE message.senderId = "+senderId+" order by id ASC" ,{ type: Sequelize.QueryTypes.SELECT });
            
            if(msgList.length > 0){
                return res.status(200).send({ data:{success:true, messageList:msgList}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            } else {
                return res.status(200).send({ data:{success:false, messageList:[], message:"No data found"}, errorNode:{errorCode:1, errorMsg:"No Error"}});
            }
        } else {
            return res.status(200).send({ data:{success:false, message:"Sender Id is require!"}, errorNode:{errorCode:1, errorMsg:error}});
        }
    } else {
        return res.status(200).send({ data:{success:false, message:"storeId is require!"}, errorNode:{errorCode:1, errorMsg:error}});
    }

}


exports.messageUserLogin = async (req, res) => {
    try {
      const storeId = req.body.data.storeId || null
      const name = req.body.data.name || null
      const email = req.body.data.email || null
      const mobile = req.body.data.mobile || null
  
      const msgUserLoginDetails = await models.msgUserLogin.findOne({where:{storeId: storeId, [Op.or]: [{ email: email },{ mobile: mobile } ]}})

      if(msgUserLoginDetails){
        return res.status(201).send({ data:{success:true, details: msgUserLoginDetails, message: "Successfully Created" }, errorNode:{errorCode:0, errorMsg:"No error"}});
      } else {
        const userDetails = await models.msgUserLogin.create({
            storeId: storeId,
            name: name,
            email: email,
            mobile: mobile,
          })
      
          return res.status(201).send({ data:{success:true, details: userDetails, message: "Successfully Created" }, errorNode:{errorCode:0, errorMsg:"No error"}});
      }
        //   const userDetails = await models.msgUserLogin.create({
        //     storeId: storeId,
        //     name: name,
        //     email: email,
        //     mobile: mobile,
        //   })
    
        //   return res.status(201).send({ data:{success:true, details: userDetails, message: "Successfully Created" }, errorNode:{errorCode:0, errorMsg:"No error"}});
        
    } catch (error) {
      return res.status(500).send({ data:{success:false, message: "Something went wrong"}, errorNode:{errorCode:1, errorMsg:error}});
    }
}


exports.messageUserListing = async function(req,res){
    var storeId = req.body.data.storeId;
    if(storeId && storeId !=''){
        const msgUserList = await sequelize.query("SELECT DISTINCT message.senderId, msgUserLogin.name as userName, admins.adminName FROM `message` left join msgUserLogin on msgUserLogin.id = message.senderId left join admins on admins.id = message.adminId WHERE message.storeId = "+storeId ,{ type: Sequelize.QueryTypes.SELECT });
            
        if(msgUserList.length > 0){
            return res.status(200).send({ data:{success:true, msgUserList:msgUserList}, errorNode:{errorCode:0, errorMsg:"No Error"}});
        } else {
            return res.status(200).send({ data:{success:false, msgUserList:[], message:"No User found"}, errorNode:{errorCode:1, errorMsg:"No Error"}});
        }
    } else {
        return res.status(200).send({ data:{success:false, message:"storeId is require!"}, errorNode:{errorCode:1, errorMsg:error}});
    }

}

