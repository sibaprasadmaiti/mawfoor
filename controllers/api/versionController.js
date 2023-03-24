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
var fs = require("fs");
var helper = require('../../helpers/helper_functions');
/**
* Description:  Product List
* @param req
* @param res user details with jwt token
* Developer:Avijit Das
**/

exports.versionCheck = async function(req, res, next) {
	const { version } = req.body.data;
	models.version.findAll({ 
		where: {
			version:version,
		}
	}).then(function (version) {
		if(version.length > 0){
			return res.status(200).send({ data:{success:true, verified:true}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		} else {
			return res.status(200).send({ data:{success:false}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}
	}).catch(function(error) {
		return res.status(200).send({ data:{success:false}, errorNode:{errorCode:1, errorMsg:error}});
	});
};