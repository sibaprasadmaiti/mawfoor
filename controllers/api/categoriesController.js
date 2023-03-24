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
* Description:  Category List
* @param req
* @param res user details with jwt token
* Developer:Susanta Kumar Das
**/

exports.categorylist = async function(req, res, next) {
	// const { storeId } =req.body.data.storeId;
	var storeId = req.body.data.storeId;
	console.log("--------------------");
	console.log(req.body);
	console.log("--------------------");
	
	if(storeId && storeId != '' && storeId != null) {
			
		let categories = await models.categories.findAll({ attributes: ['id','title','slug','url','description','image','includeInHome','includeInMenu', 'includeInFooter','sequence'], where: { storeId:storeId, status: 'Yes' }, order: [['sequence', 'ASC']] })
		// .then(async (categories) => {

			let list = [];
			// let subCategoryArr = [];

			if(categories.length > 0) {
				for(var j = 0; j < categories.length; j++){
					let subCat = await models.categories.findAll({where: { storeId:storeId, status: 'Yes', parentCategoryId: categories[j].id }})
					let subCategoryArr = [];
					if(subCat.length > 0) {
						for(var i = 0; i < subCat.length; i++) { 
							subCategoryArr.push({
								"id":subCat[i].id,
								"title":subCat[i].title,
								"slug":subCat[i].slug,
								"url":subCat[i].url,
								"description":subCat[i].description,
								"includeInHome":subCat[i].includeInHome,
								"includeInMenu":subCat[i].includeInMenu,
								"includeInFooter":subCat[i].includeInFooter,
								"image":(subCat[i].image!='' || subCat[i].image!=null) ? req.app.locals.baseurl+'admin/category/'+subCat[i].id+'/'+subCat[i].image : '',
							});
						}
						var isSubCategory = 'yes';
					} else {
						var isSubCategory = 'no';
					}

					// let category = {};
					// category.id = cat.dataValues.id;
					// category.title = cat.dataValues.title;
					// category.slug = cat.dataValues.slug;
					// category.url = cat.dataValues.url;
					// category.description = cat.dataValues.description;
					// category.includeInHome = cat.dataValues.includeInHome;
					// category.includeInMenu = cat.dataValues.includeInMenu;
					// category.includeInFooter = cat.dataValues.includeInFooter;
					// category.image = (cat.dataValues.image!='' || cat.dataValues.image!=null) ? req.app.locals.baseurl+'admin/category/'+cat.dataValues.id+'/'+cat.dataValues.image : '';

					list.push({
						"id" : categories[j].id,
						"title" : categories[j].title,
						"slug" : categories[j].slug,
						"url" : categories[j].url,
						"description" : categories[j].description,
						"includeInHome" : categories[j].includeInHome,
						"includeInMenu" : categories[j].includeInMenu,
						"includeInFooter" : categories[j].includeInFooter,
						"isSubCategory" : isSubCategory,
						"image" : (categories[j].image != '' && categories[j].image != null) ? req.app.locals.baseurl+'admin/category/'+categories[j].id+'/'+categories[j].image : req.app.locals.baseurl+'admin/category/no_image.jpg',
						"subCategory" : subCategoryArr
					});

					// category.subCategory = subCat.map(subCat => {
					// 	return Object.assign(
					// 		{},
					// 		{
					// 			id : subCat.id,
					// 			title : subCat.title,
					// 			slug : subCat.slug,
					// 			url : subCat.url,
					// 			description : subCat.description,
					// 			includeInHome : subCat.includeInHome,
					// 			includeInMenu : subCat.includeInMenu,
					// 			includeInFooter : subCat.includeInFooter,
					// 			image : (subCat.image!='' || subCat.image!=null) ? req.app.locals.baseurl+'admin/category/'+subCat.id+'/'+subCat.image : '',
					// 		}
					// 	)
					// })

					// list.push(category)
				}
			}
			let storeSubCategoryChecking = await models.categories.findAll({ attributes: ['id'], where: { storeId:storeId, status: 'Yes', parentCategoryId: { $ne: 0 } } })
			if(storeSubCategoryChecking.length > 0) {
				var storeSubCategory = 'yes';
			} else {
				var storeSubCategory = 'no';
			}

			if(list.length > 0){
				return res.status(200).send({ data:{success:true, details:list, storeSubCategory:storeSubCategory}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			} else {
				return res.status(200).send({ data:{success:false, details:[], storeSubCategory:'no'}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			}
		// }).catch(function(error) {
		// 	return res.status(200).send({ data:{success:false, details:"22"}, errorNode:{errorCode:1, errorMsg:error}});
		// });
	} else {
		return res.status(200).send({ data:{success:false, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
	}
};



// /////////////// app brand list home changes for is_checked value start //////////////////////

exports.appBrandList =async function (req, res, next) {
	var storeId = req.body.data.storeId;
	if(storeId && storeId != ''){
	
		var brandDetails = [];
		var brandList = await models.brands.findAll({where:{storeId:storeId}});
		if(brandList.length > 0){
			brandList.forEach(function(brd){
				brandDetails.push({
					"id":brd.id,
					"brand_id_in_str":brd.id.toString(),
					"brand_title":brd.title,
					"is_checked":'false'
				});
			})

			res.status(200).send({ data:{success : true,  brandDetails:brandDetails },errorNode:{errorCode:0, errorMsg:"No Error"}});
		} else {
			res.status(200).send({ data:{success : false, message: "No brand found"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
		}
	}else{
		res.status(200).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	}
  };
  
// /////////////// app brand list home changes for is_checked value end //////////////////////

// /////////////// app option value list home changes for is_checked value start //////////////////////

exports.appOptionValueList =async function (req, res, next) {
	var storeId = req.body.data.storeId;
	if(storeId && storeId != ''){
  
		var optionTitle = await sequelize.query("SELECT DISTINCT optionTitle FROM products where optionTitle is not null and optionTitle != ''",{ type: Sequelize.QueryTypes.SELECT });
		var optionList = [];
		var arr = [];
		var opt_valArr = [];
	
		if (optionTitle.length > 0) {
			for(var j=0;j < optionTitle.length;j++){
				optionList.push(optionTitle[j].optionTitle);
			}
		
			// optionList.forEach(async function(opt){
				for(var i=0;i < optionList.length;i++){
					var optionValues = await sequelize.query("SELECT DISTINCT `optionValue`, 'false' as is_checked FROM `products` AS `products` WHERE `products`.`optionTitle`= '"+optionList[i]+"'",{ type: Sequelize.QueryTypes.SELECT });
					
					arr.push({
						"title":optionList[i],
						"value":optionValues
					});
					if (Number(optionList.length) == Number(i+1)) {
						res.status(200).send({ data:{success : true,  optionValueList:arr },errorNode:{errorCode:0, errorMsg:"No Error"}});
					}
				}
			// })
			// res.status(200).send({ data:{success : true,  optionValueList:arr },errorNode:{errorCode:0, errorMsg:"No Error"}});
		}else {
			res.status(200).send({ data:{success : false, message: "No option value found"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
		}
	}else{
		res.status(200).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	}
}
  
// /////////////// app option value list home changes for is_checked value end //////////////////////

exports.categoryMetaDetails = async function(req,res){
	var storeId = req.body.data.storeId;
	var categorySlug = req.body.data.categorySlug;

	if(storeId && storeId !='')	{
		if(categorySlug && categorySlug !='')	{
		
			var categoryDetails = await models.categories.findAll({attributes: ['id','title','slug','metaTitle','metaKey','metaDescription'], where: {storeId:storeId, slug: categorySlug} });

			if(categoryDetails.length>0){
				res.status(200).send({data:{success:true, details:categoryDetails[0]},errorNode:{errorCode:0, errorMsg:"No Error"}});
			}else{
				res.status(200).send({data:{success:true, details:[], message: "No category found"},errorNode:{errorCode:0, errorMsg:"No Error"}});
			}
		}else{
			res.status(400).send({data:{success:false, details:[], message: "Category slug is required"},errorNode:{errorCode:1, errorMsg:"Category slug is required"}});
		}
	}else{
	res.status(400).send({data:{success:false, details:[], message: "Store id is required"},errorNode:{errorCode:1, errorMsg:"Store Id is required"}});
	}
}

exports.parameWiseCategorylist = async function(req, res, next) {

	var storeId = req.body.data.storeId;
	var type = req.body.data.type;

	console.log("--------------------");
	console.log(req.body);
	console.log("--------------------");
	
	if(storeId && storeId != '' && storeId != null) {
		if(type && type != '' && type != null) {
			
			if(type == "home") {
				// let categories = await models.categories.findAll({ attributes: ['id','title','slug','url','description','image','includeInHome','includeInMenu', 'includeInFooter'], where: { storeId:storeId, status: 'Yes', parentCategoryId: 0 }, order: [['position', 'ASC']] })
				var categories = await sequelize.query("SELECT `id`, `storeId`, `title`, `parentCategoryId`, `slug`, `url`, `image`, `description`, `includeInHome`, `includeInMenu`, `includeInFooter` FROM `categories` WHERE `storeId` = "+storeId+" AND `status` = 'Yes' AND `includeInHome` = 'yes' AND `parentCategoryId` = 0 ORDER BY -position desc",{ type: Sequelize.QueryTypes.SELECT });
			} else if(type == "menu"){
				var categories = await sequelize.query("SELECT `id`, `storeId`, `title`, `parentCategoryId`, `slug`, `url`, `image`, `description`, `includeInHome`, `includeInMenu`, `includeInFooter` FROM `categories` WHERE `storeId` = "+storeId+" AND `status` = 'Yes' AND `includeInMenu` = 'yes' AND `parentCategoryId` = 0 ORDER BY -position desc",{ type: Sequelize.QueryTypes.SELECT });
			} else if(type == "footer"){
				var categories = await sequelize.query("SELECT `id`, `storeId`, `title`, `parentCategoryId`, `slug`, `url`, `image`, `description`, `includeInHome`, `includeInMenu`, `includeInFooter` FROM `categories` WHERE `storeId` = "+storeId+" AND `status` = 'Yes' AND `includeInFooter` = 'yes' AND `parentCategoryId` = 0 ORDER BY -position desc",{ type: Sequelize.QueryTypes.SELECT });
			} else {
				var categories =  [];
				return res.status(200).send({ data:{success:false, details:[], message:'Type should be home or menu or footer'}, errorNode:{errorCode:1, errorMsg:"Type should be home or menu or footer"}});
			}

			let list = [];

			if(categories.length > 0) {
				for(var j = 0; j < categories.length; j++){
					let subCat = await models.categories.findAll({where: { storeId:storeId, status: 'Yes', parentCategoryId: categories[j].id }})
					let subCategoryArr = [];
					if(subCat.length > 0) {
						for(var i = 0; i < subCat.length; i++) { 
							subCategoryArr.push({
								"id":subCat[i].id,
								"title":subCat[i].title,
								"slug":subCat[i].slug,
								"url":subCat[i].url,
								"description":subCat[i].description,
								"includeInHome":subCat[i].includeInHome,
								"includeInMenu":subCat[i].includeInMenu,
								"includeInFooter":subCat[i].includeInFooter,
								"image":(subCat[i].image!='' || subCat[i].image!=null) ? req.app.locals.baseurl+'admin/category/'+subCat[i].id+'/'+subCat[i].image : '',
							});
						}
						var isSubCategory = 'yes';
					} else {
						var isSubCategory = 'no';
					}

					list.push({
						"id" : categories[j].id,
						"title" : categories[j].title,
						"slug" : categories[j].slug,
						"url" : categories[j].url,
						"description" : categories[j].description,
						"includeInHome" : categories[j].includeInHome,
						"includeInMenu" : categories[j].includeInMenu,
						"includeInFooter" : categories[j].includeInFooter,
						"isSubCategory" : isSubCategory,
						"image" : (categories[j].image != '' && categories[j].image != null) ? req.app.locals.baseurl+'admin/category/'+categories[j].id+'/'+categories[j].image : req.app.locals.baseurl+'admin/category/no_image.jpg',
						"subCategory" : subCategoryArr
					});
				}
			}
			let storeSubCategoryChecking = await models.categories.findAll({ attributes: ['id'], where: { storeId:storeId, status: 'Yes', parentCategoryId: { $ne: 0 } } })
			if(storeSubCategoryChecking.length > 0) {
				var storeSubCategory = 'yes';
			} else {
				var storeSubCategory = 'no';
			}

			if(list.length > 0){
				return res.status(200).send({ data:{success:true, details:list, storeSubCategory:storeSubCategory}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			} else {
				return res.status(200).send({ data:{success:false, details:[], storeSubCategory:'no'}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			}
		} else {
			return res.status(200).send({ data:{success:false, details:[], message:'Type is required'}, errorNode:{errorCode:1, errorMsg:"Type is required"}});
		}
	} else {
		return res.status(200).send({ data:{success:false, details:[], message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:"Store id is required"}});
	}
};