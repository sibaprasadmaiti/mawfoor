var models = require("../../models");
var config = require("../../config/config.json");
var jwt = require("jsonwebtoken");
var SECRET = "nodescratch";

/**
 * This function saves the data comming from the contact us form in frontend
 */
exports.contactUsSave = async function(req, res, next) {
    var cId = req.body.data.cId;
    var name = req.body.data.name;
    var email = req.body.data.email;
    var contactNo = req.body.data.contactNo;
    var message = req.body.data.message;
    
    if(cId && cId != ''){
        if(name && name != ''){
            if(email && email != ''){
                if(contactNo && contactNo != ''){
                    if(message && message != ''){
                        models.contactUsIudyog.create({
                            cId:cId,
                            name:name,
                            email:email,
                            contactNo:contactNo,
                            message:message
                        }).then(function(data) {

                            if(data) {
                                res.status(200).send({ data:{success : true, message: "Thank you for contact us. We will get back to you soon." },errorNode:{errorCode:0, errorMsg:"No Error"}});
                            } else {
                                res.status(200).send({ data:{success : false, message: "Something wrong! Please try again"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
                            }
                            
                        }).catch(function() {
                            res.status(200).send({ data:{success : false, message: "Something wrong! Please try again"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
                        });
                    }else{
                        res.status(200).send({ data:{success : false, message: "Message is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
                    }
                }else{
                    res.status(200).send({ data:{success : false, message: "Mobile no is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
                }
            }else{
                res.status(200).send({ data:{success : false, message: "Email id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
            }
        }else{
            res.status(200).send({ data:{success : false, message: "Name is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
        }
    }else{
        res.status(200).send({ data:{success : false, message: "Client id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
    }
}

exports.subscribe = async(req, res) => {
    const cId = req.body.data.cId;
    const email = req.body.data.email;
    const count = await models.iUdyogSubscribers.count({where:{email:email,cId:cId}});
    if(count > 0) {
        return res.status(400).send({ data:{success:false, message: "This email address has already subscribed"}, errorNode:{errorCode:1, errorMsg:"This email address has already subscribed"}})
    } else {
        await models.iUdyogSubscribers.create({
            email: email,
            cId:cId,
        }).then(() =>{
            return res.status(200).send({ data:{success:true,  message: "Thank you for subscribing. You will get news updates from us on daily basis."}, errorNode:{errorCode:0, errorMsg:"No Error"}});                        
        }).catch(err=>{
            return res.status(500).send({ data:{success:false, message: "Something went wrong! Please try again"}, errorNode:{errorCode:1, errorMsg:err}})
        })
    }
}