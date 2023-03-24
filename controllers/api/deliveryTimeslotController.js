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

/**
* Description: Delivery Time Slot List
* @param req
* @param res user details with jwt token
* Developer:Avijit Das
**/

exports.deliveryTimeslotList = async function(req, res, next) {
    //console.log(req.body.data);return false;
	const { storeId } = req.body.data;
	if(storeId && storeId !=''){
		models.deliveryTimeSlot.findAll({ 
			attributes:['id','storeId','label','fromTime','toTime','sequence','status'], 
			where: { 
				status:'Yes',
				storeId: storeId,
			}
		}).then(function (deliveryTimeSlot) {
			const list = deliveryTimeSlot.map(deliverytimeslot => {
				return Object.assign(
					{},
					{
						    id        : deliverytimeslot.id,
                            storeId   : deliverytimeslot.storeId,
							label	  : deliverytimeslot.label,
                            fromTime  : deliverytimeslot.fromTime,
                            toTime    : deliverytimeslot.toTime,
                            sequence  : deliverytimeslot.sequence,
                            status    : deliverytimeslot.status
					}
				)
			});
			if(list.length > 0){
				return res.status(200).send({ data:{success:true, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			} else {
				return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			}
		}).catch(function(error) {
			return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
		});
	}else {
		return res.status(200).send({ data:{success:false, details:"", message : "All fields are required"}, errorNode:{errorCode:1, errorMsg:"error"}});
	}
};


/**
* Description: Reservation Time Slot List
* @param req
* @param res user details with jwt token
* Developer: Surajit Gouri
**/
exports.reservationTimeList = async function(req, res, next) {
    //console.log(req.body.data);return false;
	const { storeId } = req.body.data;
	if(storeId && storeId !=''){
		models.reservationTimeSlot.findAll({ 
			attributes:['id','storeId','fromTime','toTime','sequence','status'], 
			where: { 
				status:'Yes',
				storeId: storeId,
			}
		}).then(function (reservationTimeSlot) {
			const list = reservationTimeSlot.map(reservationTimeslot => {
				return Object.assign(
					{},
					{
						    id        : reservationTimeslot.id,
                            storeId   : reservationTimeslot.storeId,
                            fromTime  : reservationTimeslot.fromTime,
                            toTime    : reservationTimeslot.toTime,
                            sequence  : reservationTimeslot.sequence,
                            status    : reservationTimeslot.status
					}
				)
			});
			if(list.length > 0){
				return res.status(200).send({ data:{success:true, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			} else {
				return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			}
		}).catch(function(error) {
			return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
		});
	} else {
		return res.status(200).send({ data:{success:false, details:"", message : "All fields are required"}, errorNode:{errorCode:1, errorMsg:"error"}});
	}
};
