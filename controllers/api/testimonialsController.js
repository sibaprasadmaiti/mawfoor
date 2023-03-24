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
* Description:  Testimonials List
* @param req
* @param res user details with jwt token
* Developer:Susanta Kumar Das
**/
/**
* Description:  Testimonials List
* @param req
* @param res user details with jwt token
* Developer:Surajit Gouri
**/
exports.list = async function(req, res, next) {
    var storeId = req.body.data.storeId;
	models.testimonials.findAll({ 
		attributes:['id','storeId','title','image','designation','company','description'], 
		where: { 
            storeId:storeId,
			status:'Yes' 
		}
	}).then(function (testimonials) {
		console.log(testimonials);
		const list = testimonials.map(testimonial => {
			return Object.assign(
				{},
				{
					id : testimonial.id,
					storeId : testimonial.storeId,
					title : testimonial.title,
					designation : testimonial.designation,
					company : testimonial.company,
					description : testimonial.description,
					image : (testimonial.image!='' && testimonial.image!=null) ? req.app.locals.baseurl+'admin/testimonials/'+testimonial.id+'/'+testimonial.image : req.app.locals.baseurl+'admin/testimonials/no_image.jpg',
				}
			)
		});
		if(list.length > 0){
			return res.status(200).send({ data:{success:true, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		} else {
			return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}
	}).catch(function(error) {
		return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
	});
};