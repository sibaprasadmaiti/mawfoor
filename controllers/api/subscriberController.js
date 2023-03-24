var models = require("../../models");
var config = require("../../config/config.json");
var config = require('../../config/config.json');
const emailConfig = require('../../config/email-config')();
const mailgun = require('mailgun-js')(emailConfig);
var jwt = require("jsonwebtoken");
var SECRET = "nodescratch";
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
    // SQLite only
    //storage: 'path/to/database.sqlite'
});




/**
 * Save new subscriber in the database table
 */
exports.saveSubscriber_bkp = async function(req, res, next) {
    var storeId = req.body.data.storeId;
    var email = req.body.data.email;

    if(email && email != null && email != '') {
        if(storeId && storeId != null && storeId != '') {
            var storeDetails = await models.stores.findOne({where:{id:storeId}});
            if(storeDetails) {
                var storeName = storeDetails.storeName;
                var storeEmail = storeDetails.email;

                var is_exists = await models.subscribers.findOne({where:{email:email,storeId:storeId}});
                if(is_exists) {
                    return res.status(200).send({ data:{success:true, message: "This email address has already subscribed"}, errorNode:{errorCode:1, errorMsg:"No Error"}});
                } else {

                    await models.subscribers.create({
                        email: email,
                        storeId:storeId,
                    }).then(function(data) {
                        if(data) {
                            var edata = {
                                from: storeName+' <'+storeEmail+'>',
                                to: email,
                                subject: 'Team | '+storeName,
                                text: 'Thank you for subscribing. You will get news updates and offers from us on daily basis.',
                            };
                                
                            mailgun.messages().send(edata, function (error, body) {
                                console.log(body);
                            });
                            return res.status(200).send({ data:{success:true,  message: "Thank you for subscribing"}, errorNode:{errorCode:0, errorMsg:"No Error"}});                        
                        } else {
                            return res.status(200).send({ data:{success:true, message: "Failed to subscribe! Please try again"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                        }
                    })
                    
                }
            } else {
                return res.status(200).send({ data:{success:false, message: "Store not found"}, errorNode:{errorCode:1, errorMsg:" Error"}});
            }
        } else {
            return res.status(200).send({ data:{success:false, message: "Store id is required"}, errorNode:{errorCode:1, errorMsg:" Error"}});
        }
    } else {
        return res.status(200).send({ data:{success:false, message: "Email id is required"}, errorNode:{errorCode:1, errorMsg:" Error"}});
    }
}

exports.saveSubscriber = async function(req, res, next) {
    var storeId = req.body.data.storeId;
    var email = req.body.data.email;

    if(email && email != null && email != '') {
        if(storeId && storeId != null && storeId != '') {

            var is_exists = await models.subscribers.findOne({where:{email:email,storeId:storeId}});
            if(is_exists) {
                return res.status(200).send({ data:{success:false, message: "This email address has already subscribed"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            } else {

                await models.subscribers.create({
                    email: email,
                    storeId:storeId,
                }).then(function(data) {
                    if(data) {
                        return res.status(200).send({ data:{success:true,  message: "Thank you for subscribing"}, errorNode:{errorCode:0, errorMsg:"No Error"}});                        
                    } else {
                        return res.status(200).send({ data:{success:true, message: "Failed to subscribe! Please try again"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                    }
                })
                
            }
        } else {
            return res.status(200).send({ data:{success:false, message: "Store id is required"}, errorNode:{errorCode:1, errorMsg:" Error"}});
        }
    } else {
        return res.status(200).send({ data:{success:false, message: "Email id is required"}, errorNode:{errorCode:1, errorMsg:" Error"}});
    }
}




