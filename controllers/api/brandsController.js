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
* Description:  Brands List
* @param req
* @param res user details with jwt token
* Developer:Susanta Kumar Das
**/
exports.list = async function(req, res, next) {
	var storeId = req.body.data.storeId;
	if(!storeId && storeId==null){
		return res.status(200).send({ data:{success:false, details:"Please Enter Required Details"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
	  }else{
			models.brands.findAll({ 
				attributes:['id', 'storeId', 'title', 'slug', 'image', 'address', 'rating','sequence'], 
				where: { 
					status:'Yes',
					storeId:storeId,
				},
				order: [['sequence', 'ASC']]
			}).then(function (brands) {
				const list = brands.map(brand => {
					return Object.assign(
						{},
						{
							id : brand.id,
							storeId : brand.storeId,
							title : brand.title,
							slug : brand.slug,
							address : brand.address,
							rating : brand.rating,
							image : (brand.image!='' && brand.image!=null) ? req.app.locals.baseurl+'admin/brands/'+brand.image : req.app.locals.baseurl+'admin/brands/no_image.jpg',
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
				//return res.send(error);
			});
		}
};
/**
* Description:  Brands details
* @param req slug for details
* @param res user details with jwt token
* Developer:Susanta Kumar Das
**/
exports.details = async function(req, res, next) {
	const { slug } = req.body;
	if(slug!=null && slug !='' && slug!=undefined){
		models.brands.findAll({ 
			attributes:['id', 'storeId', 'title', 'slug', 'image', 'address', 'email', 'phone', 'shortDescriptions', 'isoName', 'rating', 'descriptions'], 
			where: { 
				slug:slug
			},
			include:[{
				model: models.brandsIsoImage,
				attributes:['id','isoImage','brandId'],
				require: false
			}]
		}).then(function (brands) {
			const brandDetails = brands.map(brand => {
				return Object.assign(
					{},
					{
						id : brand.id,
						storeId : brand.storeId,
						title : brand.title,
						slug : brand.slug,
						descriptions : brand.descriptions,
						shortDescriptions : brand.shortDescriptions,
						address : brand.address,
						phone : brand.phone,
						email : brand.email,
						isoName : brand.isoName,
						rating : brand.rating,
						image : (brand.image!='' && brand.image!=null) ? req.app.locals.baseurl+'admin/brands/'+brand.id+'/'+brand.image : req.app.locals.baseurl+'admin/brands/no_image.jpg',
						isoImage: brand.brandsIsoImages.map(isoImg => {
							return Object.assign(
								{},
								{
									id: isoImg.id,
									image : (isoImg.isoImage!='' && isoImg.isoImage!=null) ? req.app.locals.baseurl+'admin/brands/iso/'+isoImg.brandId+'/'+isoImg.isoImage : req.app.locals.baseurl+'admin/brands/no_image.jpg',
								}
							)
						})
					}
				)
			});
			if(brandDetails.length > 0){
				return res.status(200).send({ data:{success:true, details:brandDetails[0]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			} else {
				return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			}
		}).catch(function(error) {
			return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
		});
	} else {
		return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
	}
};
/**
* Description:  Brands search list
* @param req title & address for details
* @param res user details with jwt token
* Developer:Susanta Kumar Das
**/
exports.searchList = async function(req, res, next) {
	const { title, address }=req.body;
	if((title!=null && title!='' && title!=undefined) && (address!=null && address!='' && address!=undefined)){
		models.brands.findAll({
			attributes:['id', 'storeId', 'title', 'slug', 'image', 'address', 'rating'],
			where: {
				status:'Yes',
				title:{
					[Op.like]:'%'+title+'%'
				},
				address:{
					[Op.like]:'%'+address+'%'
				},
			}
		}).then(function (brands) {
			const list = brands.map(brand => {
				return Object.assign(
					{},
					{
						id : brand.id,
						storeId : brand.storeId,
						title : brand.title,
						slug : brand.slug,
						address : brand.address,
						rating : brand.rating,
						image : (brand.image!='' && brand.image!=null) ? req.app.locals.baseurl+'admin/brands/'+brand.id+'/'+brand.image : req.app.locals.baseurl+'admin/brands/no_image.jpg',
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
	} else if(title!=null && title!='' && title!=undefined) {
		models.brands.findAll({
			attributes:['id', 'storeId', 'title', 'slug', 'image', 'address', 'rating'],
			where: {
				status:'Yes',
				title:{
					[Op.like]:'%'+title+'%'
				}
			}
		}).then(function (brands) {
			const list = brands.map(brand => {
				return Object.assign(
					{},
					{
						id : brand.id,
						storeId : brand.storeId,
						title : brand.title,
						slug : brand.slug,
						address : brand.address,
						rating : brand.rating,
						image : (brand.image!='' && brand.image!=null) ? req.app.locals.baseurl+'admin/brands/'+brand.id+'/'+brand.image : req.app.locals.baseurl+'admin/brands/no_image.jpg',
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
	} else if(address!=null && address!='' && address!=undefined) {
		models.brands.findAll({
			attributes:['id', 'storeId', 'title', 'slug', 'image', 'address', 'rating'],
			where: {
				status:'Yes',
				address:{
					[Op.like]:'%'+address+'%'
				},
			}
		}).then(function (brands) {
			const list = brands.map(brand => {
				return Object.assign(
					{},
					{
						id : brand.id,
						storeId : brand.storeId,
						title : brand.title,
						slug : brand.slug,
						address : brand.address,
						rating : brand.rating,
						image : (brand.image!='' && brand.image!=null) ? req.app.locals.baseurl+'admin/brands/'+brand.id+'/'+brand.image : req.app.locals.baseurl+'admin/brands/no_image.jpg',
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
	} else {
		models.brands.findAll({ 
			attributes:['id', 'storeId', 'title', 'slug', 'image', 'address', 'rating'], 
			where: { 
				status:'Yes' 
			}
		}).then(function (brands) {
			const list = brands.map(brand => {
				return Object.assign(
					{},
					{
						id : brand.id,
						storeId : brand.storeId,
						title : brand.title,
						slug : brand.slug,
						address : brand.address,
						rating : brand.rating,
						image : (brand.image!='' && brand.image!=null) ? req.app.locals.baseurl+'admin/brands/'+brand.id+'/'+brand.image : req.app.locals.baseurl+'admin/brands/no_image.jpg',
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
	}
};