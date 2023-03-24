"using strict";
var models = require('../../models');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
var bcrypt 				= require('bcrypt-nodejs');
var formidable = require('formidable');
var multiparty = require('multiparty'); 
var bodyParser = require('body-parser');
var fs = require('file-system');
var crypto = require('crypto');
var config = require('../../config/config.json');
var Sequelize = require("sequelize");
// For Mail Send Through MailGun
const emailConfig = require('../../config/email-config')();
const mailgun = require('mailgun-js')(emailConfig);
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

exports.countries = async function(req,res){
        
        	const request = require('request');

		//function execute() {
		  const options = {
		    "url": `https://api.shipadelivery.com/v2/countries?apikey=${process.env.shipadeliveryAPIKeys}`,
		    "method": "GET",
		    "headers": {
		      "Accept": "application/json"
		    }
		  };
		  request(options, function (err, responce, body) {
		    if (err) {
		      console.error(err);
		    }
		    else {
		      console.log(body);
		      return res.status(200).send({ data:{success : true, data:JSON.parse(body), message:"successfully show the value" },errorNode:{errorCode:0, errorMsg:"No Error"}});
		    }
		  });
		//}
		//execute()

}
