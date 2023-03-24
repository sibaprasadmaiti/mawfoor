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


exports.deliveryTimeSlotAddEdit = async function(req,res){
    
    var id = req.body.data.id;
    var storeId = req.body.data.storeId;
    var fromTime = req.body.data.fromTime;
    var toTime = req.body.data.toTime;
    var sequence = req.body.data.sequence;
    var status = req.body.data.status;

    if(storeId && storeId !='' && fromTime && fromTime !='' && toTime && toTime !='' && sequence && sequence !='' && status && status !=''){

        if(!id){
            models.deliveryTimeSlot.create({
                storeId: storeId,
                fromTime: fromTime,
                toTime: toTime,
                status: status,
                sequence : sequence,
            }).then(async function(deliveryTimeSlot) {  
                return res.status(200).send({ data:{success:true, details:deliveryTimeSlot, message : "Successfully added"}, errorNode:{errorCode:0, errorMsg:""}});
            }).catch(function(error) {
                return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
            });

        } else {

            var deliveryTimeSlotIdCheck = await models.deliveryTimeSlot.findOne({where:{storeId:storeId,id:id}});
            if(deliveryTimeSlotIdCheck){

                models.deliveryTimeSlot.update({
                    storeId: storeId,
                    fromTime: fromTime,
                    toTime: toTime,
                    status: status,
                    sequence : sequence,
                },{where:{storeId:storeId,id:id}}).then(async function(data){

                    var deliveryTimeSlotIdDetails = await models.deliveryTimeSlot.findOne({attributes:['id','storeId','fromTime','toTime','sequence','status'],where:{storeId:storeId,id:id}});
                    return res.status(200).send({ data:{success:true, details:deliveryTimeSlotIdDetails,  message : "Successfully updated"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                    
                        
                }).catch(function(error){
                    return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
                })
            } else {
                return res.status(200).send({ data:{success:false, message:'Delivery time slot id not found'}, errorNode:{errorCode:1, errorMsg:"Error"}});
            }
        }
    } else {
        return res.status(200).send({ data:{success:false, message : "All fields are required"}, errorNode:{errorCode:1, errorMsg:"error"}});
    }
    
}

exports.deliveryTimeSlotView = async function(req,res){
    var storeId = req.body.data.storeId;
    var id = req.body.data.id;
    if(storeId && storeId !=''){
        if(id && id !=''){
            let deliveryTimeSlotView = await models.deliveryTimeSlot.findOne({attributes:['id','storeId','fromTime','toTime','sequence','status'], where:{storeId:storeId, id:id}});
            
            if(deliveryTimeSlotView){
                return res.status(200).send({ data:{success:true, details:deliveryTimeSlotView}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            } else {
                return res.status(200).send({ data:{success:false, details:'', message:"No data found"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }
        } else {
            return res.status(200).send({ data:{success:false, message:"Id is require!"}, errorNode:{errorCode:1, errorMsg:"error"}});
        }
    } else {
        return res.status(200).send({ data:{success:false, message:"storeId is require!"}, errorNode:{errorCode:1, errorMsg:"error"}});
    }

}

exports.deliveryTimeSlotList = async function(req,res) {
    var storeId = req.body.data.storeId;
    if(storeId && storeId !=''){
        const deliveryTimeSlotList = await models.deliveryTimeSlot.findAll({attributes:['id','fromTime','toTime','sequence','status'], where:{storeId:storeId},order:[['sequence','ASC']]})

        if(deliveryTimeSlotList.length>0){
            return res.status(200).send({data:{success:true,list:deliveryTimeSlotList},errorNode:{errorCode:0, errorMsg:"No Error"}});
        } else {
            return res.status(200).send({data:{success:true,list:[]},errorNode:{errorCode:0, errorMsg:"No Error"}});
        }
    } else {
        return res.status(200).send({data:{success:false,message:'stoerId is required!'},errorNode:{errorCode:1, errorMsg:"Error"}});
    }
}


exports.deliveryTimeSlotDelete = function (req, res) {
    var id = req.body.data.id;
    var storeId = req.body.data.storeId;
    if (id && id == "" && storeId && storeId=="") {
        return res.status(200).send({ status: 200, success: false, message: "Id not found" });
    }else{
        models.deliveryTimeSlot.destroy({
          where: { id:id,storeId:storeId }
        }).then(function (value) {
            if(value){
                return res.status(200).send({ data:{success:true,message:'Successfully deleted'}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }else{
                return res.status(200).send({ data:{success:false,message:'Something went wrong. Please try again later.'}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }
        }).catch(function (error) {
            return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
        });
    }
};




exports.reservationTimeSlotAddEdit = async function(req,res){
    
    var id = req.body.data.id;
    var storeId = req.body.data.storeId;
    var fromTime = req.body.data.fromTime;
    var toTime = req.body.data.toTime;
    var sequence = req.body.data.sequence;
    var status = req.body.data.status;

    if(storeId && storeId !='' && fromTime && fromTime !='' && toTime && toTime !='' && sequence && sequence !='' && status && status !=''){

        if(!id){
            models.reservationTimeSlot.create({
                storeId: storeId,
                fromTime: fromTime,
                toTime: toTime,
                status: status,
                sequence : sequence,
            }).then(async function(reservationTimeSlot) {  
                return res.status(200).send({ data:{success:true, details:reservationTimeSlot, message : "Successfully added"}, errorNode:{errorCode:0, errorMsg:""}});
            }).catch(function(error) {
                return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
            });

        } else {

            var reservationTimeSlotIdCheck = await models.reservationTimeSlot.findOne({where:{storeId:storeId,id:id}});
            if(reservationTimeSlotIdCheck){

                models.reservationTimeSlot.update({
                    storeId: storeId,
                    fromTime: fromTime,
                    toTime: toTime,
                    status: status,
                    sequence : sequence,
                },{where:{storeId:storeId,id:id}}).then(async function(data){

                    var reservationTimeSlotDetails = await models.reservationTimeSlot.findOne({attributes:['id','storeId','fromTime','toTime','sequence','status'],where:{storeId:storeId,id:id}});

                    return res.status(200).send({ data:{success:true, details:reservationTimeSlotDetails,  message : "Successfully updated"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                    
                        
                }).catch(function(error){
                    return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
                })
            } else {
                return res.status(200).send({ data:{success:false, message:'Reservation time slot id not found'}, errorNode:{errorCode:1, errorMsg:"Error"}});
            }
        }
    } else {
        return res.status(200).send({ data:{success:false, message : "All fields are required"}, errorNode:{errorCode:1, errorMsg:"error"}});
    }
    
}

exports.reservationTimeSlotView = async function(req,res){
    var storeId = req.body.data.storeId;
    var id = req.body.data.id;
    if(storeId && storeId !=''){
        if(id && id !=''){
            let reservationTimeSlotView = await models.reservationTimeSlot.findOne({attributes:['id','storeId','fromTime','toTime','sequence','status'], where:{storeId:storeId, id:id}});
            
            if(reservationTimeSlotView){
                return res.status(200).send({ data:{success:true, details:reservationTimeSlotView}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            } else {
                return res.status(200).send({ data:{success:false, details:'', message:"No data found"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }
        } else {
            return res.status(200).send({ data:{success:false, message:"Id is require!"}, errorNode:{errorCode:1, errorMsg:"error"}});
        }
    } else {
        return res.status(200).send({ data:{success:false, message:"storeId is require!"}, errorNode:{errorCode:1, errorMsg:"error"}});
    }

}

exports.reservationTimeSlotList = async function(req,res) {
    var storeId = req.body.data.storeId;
    if(storeId && storeId !=''){
        const reservationTimeSlotList = await models.reservationTimeSlot.findAll({attributes:['id','fromTime','toTime','sequence','status'], where:{storeId:storeId},order:[['sequence','ASC']]})

        if(reservationTimeSlotList.length>0){
            return res.status(200).send({data:{success:true,list:reservationTimeSlotList},errorNode:{errorCode:0, errorMsg:"No Error"}});
        } else {
            return res.status(200).send({data:{success:true,list:[]},errorNode:{errorCode:0, errorMsg:"No Error"}});
        }
    } else {
        return res.status(200).send({data:{success:false,message:'stoerId is required!'},errorNode:{errorCode:1, errorMsg:"Error"}});
    }
}


exports.reservationTimeSlotDelete = function (req, res) {
    var id = req.body.data.id;
    var storeId = req.body.data.storeId;
    if (id && id == "" && storeId && storeId=="") {
        return res.status(200).send({ status: 200, success: false, message: "Id not found" });
    }else{
        models.reservationTimeSlot.destroy({
          where: { id:id,storeId:storeId }
        }).then(function (value) {
            if(value){
                return res.status(200).send({ data:{success:true,message:'Successfully deleted'}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }else{
                return res.status(200).send({ data:{success:false,message:'Something went wrong. Please try again later.'}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }
        }).catch(function (error) {
            return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
        });
    }
};
