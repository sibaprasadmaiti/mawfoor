var models = require('../../models');
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


// ///////////////////////// app terms and conditions list start /////////////////

exports.termsConditionsList = async function(req,res){
    var storeId = req.body.data.storeId;

    if(storeId && storeId !='' && storeId !=null){

       var termsconditionslist = await models.termsConditions.findAll({where : {storeId : storeId}});

        if(termsconditionslist.length > 0){
            return res.status(200).send({ data:{success:true, termsconditionslist : termsconditionslist}, errorNode:{errorCode:0, errorMsg:"No Error"}});
        } else {
            return res.status(200).send({ data:{success:false, termsconditionslist:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
        }


    } else {
        return res.status(200).send({ data:{success:false, message:'All fields required!'}, errorNode:{errorCode:1, errorMsg:"Error"}});
    }


}

  // ///////////////////////// app terms and conditions list end /////////////////
  