var models = require("../../models");
var path = require("path");
var config = require("../../config/config.json");
var Sequelize = require("sequelize");
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
      idle: 10000,
    },
  }
);

exports.sendInvitation = async function(req,res){
    var storeId = req.body.data.storeId;
    var name = req.body.data.name;
    var email = req.body.data.email;
    var mobile = req.body.data.mobile;
    var message = req.body.data.message;
    console.log("Name----------"+name);
    console.log("email----------"+email);
    console.log("mobile----------"+mobile);
    console.log("message----------"+message);

    if(storeId !=null && storeId !='' && name !='' && name !=null && email !='' && email !=null && mobile !='' && mobile !=null && message !='' && message !=null){
        var createModel = await models.invitation.create({storeId : storeId, name : name, email : email, mobile : mobile, message : message });
        if (createModel){
            res.status(200).send({ data:{success : true, message: "Your invitation has been sent successfully" },errorNode:{errorCode:0, errorMsg:"No Error"}});
        }else{ 
            res.status(200).send({ data:{success : false, message: "Something worng! Please try again."} ,errorNode:{errorCode:1, errorMsg:"Error"}});
        }
    }else{
        res.status(200).send({ data:{success : false, message: "All fields are required!"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
    }

}