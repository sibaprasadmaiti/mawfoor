let models = require('../../models');
let bcrypt = require('bcrypt-nodejs');
let jwt = require('jsonwebtoken');
let SECRET = 'nodescratch';
let flash = require('connect-flash');
let config = require("../../config/config.json");
let Sequelize = require("sequelize");
const Op = Sequelize.Op
let sequelize = new Sequelize(
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
const { emptyDir } = require('fs-extra');
const { exit } = require('process');
/**
* Description:  Product List
* @param req
* @param res user details with jwt token
* Developer:Surajit
**/

exports.productList_bkp = async function(req, res, next) {
	// const { storeId, customerId, categoryId} =req.body.data;
	const { storeId, customerId, categorySlug} =req.body.data;
	console.log("--------------------");
	console.log(req.body);
	console.log("--------------------");
	
	if(storeId && storeId != '' && storeId != null && categorySlug && categorySlug!='' && categorySlug!=null){
	
		var categoryList = await models.categories.findAll({
			attributes:['id','title','slug','status'],
			where:{
				storeId:storeId, slug:categorySlug,
			}
		});//console.log(categoryList);return false;
		var mainArray = [];
		if(categoryList.length>0){
			for(var i=0;i<categoryList.length;i++){
				var catId = categoryList[i].id;
				var productArray = [];
				var productList = await models.productCategory.findAll({
					attributes:['id'],
					where: {
						storeId:storeId,categoryId:catId					
					},
					include:[{
							model:models.products,
							attributes:['id','storeId','slug', 'title', 'shortDescription', 'price','bestSellers','newArrivals','specialPrice','size','brand'],
							where:{storeId:storeId},
						}]
				});
				 
				if(productList.length>0){
					for(var j=0;j<productList.length;j++){
						var productCartFlag = "false";
						var item_quantity =0;
						// var customer_favourute_product = "false";
						if(customerId && customerId!='' && customerId!=null){
							var cartdata = await models.carts.findAll({attributes:['id','itemQuantity'],where:{productId:productList[j].id,storeId:storeId,customerId:customerId}});

							if(cartdata.length>0){
								productCartFlag = "true";
								item_quantity = cartdata[0].itemQuantity;
							}

							var favouriteProduct = await models.favouriteProduct.findAll({where:{storeId: storeId, productId: productList[j].product.id, customerId: customerId}})


							if(favouriteProduct.length > 0){
								var customer_favourute_product = "true";
								var fav_pro_id = favouriteProduct[0].id;
							}else{
								var customer_favourute_product = "false";
								var fav_pro_id = 0;
							}
						}else {
							var customer_favourute_product = "false";
							var fav_pro_id = 0;
						}
						
						let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productList[j].product.id}});

						if(productImages.length>0){
							var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
						} else {
							var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
						}

						let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId: productList[j].product.id}, order: [['id', 'DESC']]})

						let stockQuantity
						if(stockDetails.length >= 1){
							stockQuantity = stockDetails[0].stock
						}else{
							stockQuantity = 0
						}

						productArray.push({
								"product_id":productList[j].product.id,
								"category_id":productList[j].id,
								//"category_name":productList[j].category.title,
								"slug":productList[j].product.slug,
								"product_in_cart": productCartFlag,
								"item_quantity": item_quantity,
								"total_quantity": productList[j].dataValues.itemQuantity==null?'0':productList[j].dataValues.itemQuantity,
								"title":productList[j].product.title,
								"price":productList[j].product.price,
								"stock": stockQuantity,
								"short_description":productList[j].product.shortDescription,
								"best_sellers":productList[j].product.bestSellers,
								"new_arrivals":productList[j].product.newArrivals,
								"brand":productList[j].product.brand,
								"customer_favourute_product": customer_favourute_product,
								"fav_pro_id": fav_pro_id,
								"images": product_images
							});
						
					}
				}
				//console.log(productArray); return false;

				mainArray.push({
					"title":categoryList[i].title,
					"slug":categoryList[i].slug,
					"is_active":categoryList[i].status,
					"product_list":productArray
				});
				// console.log(mainArray);return false;
			}
		}
		if(mainArray.length>0){
			return res.status(200).send({ data:{success:true, details:mainArray}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}else{
			return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}
	} else if(storeId && storeId != '' && storeId != null){
	
		var categoryList = await models.categories.findAll({
			attributes:['id','title','slug','status'],
			where:{
				storeId:storeId,
			}
		});//console.log(categoryList);return false;
		var mainArray = [];
		if(categoryList.length>0){
			for(var i=0;i<categoryList.length;i++){
				var catId = categoryList[i].id;
				//var categorytitle = 
				var productArray = [];
				var productList = await models.productCategory.findAll({
					attributes:['id'],
					where: {
						storeId:storeId,categoryId:catId					
					},
					include:[
						{
							model:models.products,
							attributes:['id','storeId','slug', 'title', 'shortDescription', 'price','bestSellers','newArrivals','specialPrice','size','brand'],
							where:{storeId:storeId},
						},
						
					]
				});
				 
				if(productList.length>0){
					for(var j=0;j<productList.length;j++){
						var productCartFlag = "false";
						var item_quantity =0;
						// var customer_favourute_product = "false";
						if(customerId && customerId!='' && customerId!=null){
							var cartdata = await models.carts.findAll({attributes:['id','itemQuantity'],where:{productId:productList[j].id,storeId:storeId,customerId:customerId}});

							if(cartdata.length>0){
								console.log(cartdata);
								productCartFlag = "true";
								item_quantity = cartdata[0].itemQuantity;
							} 
							// console.log("aaaaaaaaaaaaaaa---"+productList[j].slug);

							// console.log("aaaaaaaaaaaaaaa---"+productList[j].product.id);
							var favouriteProduct = await models.favouriteProduct.findAll({where:{storeId: storeId, productId: productList[j].product.id, customerId: customerId}})

							if(favouriteProduct.length > 0){
								// console.log("aaaaaaaaaaaaaaa-11111111--");
								var fav_pro_id = favouriteProduct[0].id;
								var customer_favourute_product = "true";
							}else{
								// console.log("aaaaaaaaaaaaaaa-222222222222--");
								var fav_pro_id = 0;
								var customer_favourute_product = "false";
							}
						} else {
							// console.log("aaaaaaaaaaaaaaa-33333333333--");
							var fav_pro_id = 0;
							var customer_favourute_product = "false";
						}

						let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productList[j].product.id}});


						if(productImages.length>0){
							var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
						} else {
							var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
						}

						let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId: productList[j].product.id}, order: [['id', 'DESC']]})

						let stockQuantity
						if(stockDetails.length >= 1){
							stockQuantity = stockDetails[0].stock
						}else{
							stockQuantity = 0
						}

						productArray.push({
								"product_id":productList[j].product.id,
								"category_id":productList[j].id,
								//"category_name":productList[j].category.title,
								"slug":productList[j].product.slug,
								"product_in_cart": productCartFlag,
								"item_quantity": item_quantity,
								"stock": stockQuantity,
								"total_quantity": productList[j].dataValues.itemQuantity==null?'0':productList[j].dataValues.itemQuantity,
								"title":productList[j].product.title,
								"price":productList[j].product.price,
								"short_description":productList[j].product.shortDescription,
								"best_sellers":productList[j].product.bestSellers,
								"new_arrivals":productList[j].product.newArrivals,
								"brand":productList[j].product.brand,
								"customer_favourute_product": customer_favourute_product,
								"fav_pro_id": fav_pro_id,
								"images": product_images
							});
					}
				}
				//console.log(productArray); return false;

				mainArray.push({
					"title":categoryList[i].title,
					"slug":categoryList[i].slug,
					"is_active":categoryList[i].status,
					"product_list":productArray
				});
				// console.log(mainArray);return false;
			}
		}
		if(mainArray.length>0){
			return res.status(200).send({ data:{success:true, details:mainArray}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}else{
			return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}

	}
	else {
		return res.status(200).send({ data:{success:false, message:"All fields are required"}, errorNode:{errorCode:1, errorMsg:"error"}});
	}
	
};

exports.productList = async function(req, res, next) {
	// const { storeId, customerId, categoryId} =req.body.data;
	const { storeId, customerId, categorySlug} =req.body.data;
	console.log("--------------------");
	console.log(req.body);
	console.log("--------------------");
	
	if(storeId && storeId != '' && storeId != null && categorySlug && categorySlug!='' && categorySlug!=null){
	
		var categoryList = await models.categories.findAll({
			attributes:['id','title','slug','status'],
			where:{
				storeId:storeId, slug:categorySlug,  status: 'Yes',
			}
		});//console.log(categoryList);return false;
		var mainArray = [];
		if(categoryList.length>0){

			////////////////////////// catelog price rule start /////////////////////////////////////
			var catelogPriceCurrentDate = yyyy_mm_dd();
			var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
			if(catelogPriceRuleDetails.length>0){
				var isCatelogPriceRule = 'yes';
			} else {
				var isCatelogPriceRule = 'no';
			}
			////////////////////////// catelog price rule end /////////////////////////////////////

			for(var i=0;i<categoryList.length;i++){
				var catId = categoryList[i].id;
				var productArray = [];
				var productList = await models.productCategory.findAll({
					attributes:['id'],
					where: {
						storeId:storeId,categoryId:catId					
					},
					include:[{
							model:models.products,
							attributes:['id','storeId','slug', 'title', 'shortDescription', 'price','bestSellers','newArrivals','specialPrice','size','brand','attr1','spicey'],
							where:{storeId:storeId, status: 'active'},
						}]
				});
				 
				if(productList.length>0){
					for(var j=0;j<productList.length;j++){

						////////////////////////// catelog price rule start /////////////////////////////////////

						if(isCatelogPriceRule == 'yes'){

							var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productList[j].product.id, productList[j].product.price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
		
							var discountPrice = productCatalogPriceDetails.discountPrice;
							var discountTag = productCatalogPriceDetails.discountTag;
		
						} else {
							var discountPrice = null;
							var discountTag = null;
						}

						////////////////////////// catelog price rule end /////////////////////////////////////

						// var productCartFlag = "false";
						// var item_quantity =0;
						// var customer_favourute_product = "false";
						if(customerId && customerId!='' && customerId!=null){
							// var cartdata = await models.carts.findAll({attributes:['id','itemQuantity'],where:{productId:productList[j].id,storeId:storeId,customerId:customerId}});

							// if(cartdata.length>0){
							// 	productCartFlag = "true";
							// 	item_quantity = cartdata[0].itemQuantity;
							// }

							var favouriteProduct = await models.favouriteProduct.findAll({where:{storeId: storeId, productId: productList[j].product.id, customerId: customerId}})


							if(favouriteProduct.length > 0){
								var customer_favourute_product = "true";
								var fav_pro_id = favouriteProduct[0].id;
							}else{
								var customer_favourute_product = "false";
								var fav_pro_id = 0;
							}
						}else {
							var customer_favourute_product = "false";
							var fav_pro_id = 0;
						}
						
						let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productList[j].product.id}});

						if(productImages.length>0){
							var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
						} else {
							var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
						}

						let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId: productList[j].product.id}, order: [['id', 'DESC']]})

						let stockQuantity
						if(stockDetails.length >= 1){
							stockQuantity = stockDetails[0].stock
						}else{
							stockQuantity = 0
						}

						if(productList[j].product.attr1 && productList[j].product.attr1 != '' && productList[j].product.attr1 != null){
							if(productList[j].product.attr1 == 'nonveg'){
								var veg_only = 'nonveg';
								// var non_veg_only = 'nonveg';
							} else {
								var veg_only = 'veg';
								// var non_veg_only = 'veg';
							}
						} else {
							var veg_only = 'veg';
							// var non_veg_only = 'veg';
						}

						var addOnProductList = await sequelize.query("SELECT products.id FROM `relatedProduct` left join products on products.id = relatedProduct.selectedProductId WHERE relatedProduct.storeId = "+storeId+" and relatedProduct.productId = "+productList[j].product.id+" and relatedProduct.type = 'Add-on'",{ type: Sequelize.QueryTypes.SELECT });
						if(addOnProductList.length>0){
							var addon_flug = 'Yes';
						} else {
							var addon_flug = 'No';
						}

						// ////////////////////////////////// option product start //////////////////
						let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:productList[j].product.id, storeId:storeId}});

						if(optionProductDetails.length>0){
							if(optionProductDetails[0].optionId && optionProductDetails[0].optionId != '' && optionProductDetails[0].optionId != null) {
								let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
								if(optionValueList.length>0){
									var isConfigurable = "Yes";
								} else {
									var isConfigurable = "Yes";
								}
								// var configurableProductList = optionValueList;
							} else {
								var isConfigurable = "No";
								// var configurableProductList = [];
							}
						} else {
							var isConfigurable = "No";
							// var configurableProductList = [];
						}
						// ////////////////////////////////// option product end //////////////////


						productArray.push({
								"product_id":productList[j].product.id,
								"category_id":productList[j].id,
								//"category_name":productList[j].category.title,
								"slug":productList[j].product.slug,
								// "product_in_cart": productCartFlag,
								// "item_quantity": item_quantity,
								"product_in_cart": "false",
								"item_quantity": 0,
								"total_quantity": productList[j].dataValues.itemQuantity==null?'0':productList[j].dataValues.itemQuantity,
								"title":productList[j].product.title,
								"price":productList[j].product.price,
								"stock": stockQuantity,
								"short_description":productList[j].product.shortDescription,
								"best_sellers":productList[j].product.bestSellers,
								"new_arrivals":productList[j].product.newArrivals,
								"spicey":productList[j].product.spicey,
								// "non_veg_only": non_veg_only,
								"veg_only": veg_only,
								"brand":productList[j].product.brand,
								"customer_favourute_product": customer_favourute_product,
								"fav_pro_id": fav_pro_id,
								"addon_flug": addon_flug,
								"isConfigurable":isConfigurable,
								"images": product_images,
								"discountPrice": discountPrice,
								"discountTag": discountTag
							});
						
					}
				}
				//console.log(productArray); return false;

				const productCount = await models.productCategory.count({where:{categoryId:categoryList[i].id, storeId: storeId}})

				mainArray.push({
					"title":categoryList[i].title,
					"totalProductCount":productCount,
					"slug":categoryList[i].slug,
					"is_active":categoryList[i].status,
					"product_list":productArray
				});
				// console.log(mainArray);return false;
			}
		}
		if(mainArray.length>0){
			return res.status(200).send({ data:{success:true, details:mainArray}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}else{
			return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}
	} else if(storeId && storeId != '' && storeId != null){
	
		// var categoryList = await models.categories.findAll({
		// 	attributes:['id','title','slug','status'],
		// 	where:{
		// 		storeId:storeId,
		// 	}
		// });//console.log(categoryList);return false;

		var categoryList = await sequelize.query("SELECT id, title, slug, status FROM `categories` WHERE storeId = "+storeId+" and  status = 'Yes'",{ type: Sequelize.QueryTypes.SELECT });

		var mainArray = [];
		if(categoryList.length>0){

			////////////////////////// catelog price rule start /////////////////////////////////////
			var catelogPriceCurrentDate = yyyy_mm_dd();
			var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
			if(catelogPriceRuleDetails.length>0){
				var isCatelogPriceRule = 'yes';
			} else {
				var isCatelogPriceRule = 'no';
			}
			////////////////////////// catelog price rule end /////////////////////////////////////

			for(var i=0; i<categoryList.length; i++){
				var catId = categoryList[i].id;
				//var categorytitle = 
				var productArray = [];
				// var productList = await models.productCategory.findAll({
				// 	attributes:['id'],
				// 	where: {
				// 		storeId:storeId,categoryId:catId					
				// 	},
				// 	include:[
				// 		{
				// 			model:models.products,
				// 			attributes:['id','storeId','slug', 'title', 'shortDescription', 'price','bestSellers','newArrivals','specialPrice','size','brand'],
				// 			where:{storeId:storeId},
				// 		},
						
				// 	]
				// });
				var productList = await sequelize.query("SELECT productCategory.id as productCatId, products.id, products.slug, products.title, products.shortDescription, products.price, products.bestSellers, products.newArrivals, products.specialPrice, products.size, products.brand, products.attr1, products.spicey FROM `productCategory` left join products on products.id = productCategory.productId WHERE productCategory.storeId = "+storeId+" and productCategory.categoryId = "+categoryList[i].id+" and products.status = 'active'",{ type: Sequelize.QueryTypes.SELECT });
				 
				if(productList.length>0){
					for(var j=0; j<productList.length; j++){

						////////////////////////// catelog price rule start /////////////////////////////////////

						if(isCatelogPriceRule == 'yes'){

							var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productList[j].id, productList[j].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
		
							var discountPrice = productCatalogPriceDetails.discountPrice;
							var discountTag = productCatalogPriceDetails.discountTag;
		
						} else {
							var discountPrice = null;
							var discountTag = null;
						}

						////////////////////////// catelog price rule end /////////////////////////////////////

						// var productCartFlag = "false";
						// var item_quantity =0;
						// var customer_favourute_product = "false";
						if(customerId && customerId!='' && customerId!=null){
							// var cartdata = await models.carts.findAll({attributes:['id','itemQuantity'],where:{productId:productList[j].id,storeId:storeId,customerId:customerId}});
							// var cartdata = await sequelize.query("SELECT id, itemQuantity FROM `carts` WHERE storeId = "+storeId+" and productId = "+productList[j].id+" and customerId = "+customerId,{ type: Sequelize.QueryTypes.SELECT });

							// if(cartdata.length>0){
							// 	console.log(cartdata);
							// 	productCartFlag = "true";
							// 	item_quantity = cartdata[0].itemQuantity;
							// } 
							// console.log("aaaaaaaaaaaaaaa---"+productList[j].slug);

							// console.log("aaaaaaaaaaaaaaa---"+productList[j].product.id);
							// var favouriteProduct = await models.favouriteProduct.findAll({where:{storeId: storeId, productId: productList[j].product.id, customerId: customerId}});
							var favouriteProduct = await sequelize.query("SELECT id FROM `favouriteProduct` WHERE storeId = "+storeId+" and productId = "+productList[j].id+" and customerId = "+customerId,{ type: Sequelize.QueryTypes.SELECT });

							if(favouriteProduct.length > 0){
								// console.log("aaaaaaaaaaaaaaa-11111111--");
								var fav_pro_id = favouriteProduct[0].id;
								var customer_favourute_product = "true";
							}else{
								// console.log("aaaaaaaaaaaaaaa-222222222222--");
								var fav_pro_id = 0;
								var customer_favourute_product = "false";
							}
						} else {
							// console.log("aaaaaaaaaaaaaaa-33333333333--");
							var fav_pro_id = 0;
							var customer_favourute_product = "false";
						}

						// let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productList[j].product.id}});
						var productImages = await sequelize.query("SELECT id, productId, file, imageTitle FROM `productImages` WHERE storeId = "+storeId+" and productId = "+productList[j].id,{ type: Sequelize.QueryTypes.SELECT });


						if(productImages.length>0){
							var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
						} else {
							var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
						}

						// let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId: productList[j].product.id}, order: [['id', 'DESC']]})
						var stockDetails = await sequelize.query("SELECT id, stock FROM `inventory` WHERE storeId = "+storeId+" and productId = "+productList[j].id+" order by id DESC",{ type: Sequelize.QueryTypes.SELECT });

						let stockQuantity
						if(stockDetails.length >= 1){
							stockQuantity = stockDetails[0].stock
						}else{
							stockQuantity = 0
						}

						if(productList[j].attr1 && productList[j].attr1 != '' && productList[j].attr1 != null){
							if(productList[j].attr1 == 'nonveg'){
								var veg_only = 'nonveg';
								// var non_veg_only = 'nonveg';
							} else {
								var veg_only = 'veg';
								// var non_veg_only = 'veg';
							}
						} else {
							var veg_only = 'veg';
							// var non_veg_only = 'veg';
						}

						var addOnProductList = await sequelize.query("SELECT products.id FROM `relatedProduct` left join products on products.id = relatedProduct.selectedProductId WHERE relatedProduct.storeId = "+storeId+" and relatedProduct.productId = "+productList[j].id+" and relatedProduct.type = 'Add-on'",{ type: Sequelize.QueryTypes.SELECT });
						if(addOnProductList.length>0){
							var addon_flug = 'Yes';
						} else {
							var addon_flug = 'No';
						}

						// ////////////////////////////////// option product start //////////////////
						let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:productList[j].id, storeId:storeId}});

						if(optionProductDetails.length>0){
							if(optionProductDetails[0].optionId && optionProductDetails[0].optionId != '' && optionProductDetails[0].optionId != null) {
								let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
								if(optionValueList.length>0){
									var isConfigurable = "Yes";
								} else {
									var isConfigurable = "Yes";
								}
								// var configurableProductList = optionValueList;
							} else {
								var isConfigurable = "No";
								// var configurableProductList = [];
							}
						} else {
							var isConfigurable = "No";
							// var configurableProductList = [];
						}
						// ////////////////////////////////// option product end //////////////////


						productArray.push({
								"product_id":productList[j].id,
								"category_id":categoryList[i].id,
								//"category_name":productList[j].category.title,
								"slug":productList[j].slug,
								// "product_in_cart": productCartFlag,
								// "item_quantity": item_quantity,
								"product_in_cart": "false",
								"item_quantity": 0,
								"stock": stockQuantity,
								"total_quantity": productList[j].itemQuantity==null?'0':productList[j].itemQuantity,
								"title":productList[j].title,
								"price":productList[j].price,
								"short_description":productList[j].shortDescription,
								"best_sellers":productList[j].bestSellers,
								"new_arrivals":productList[j].newArrivals,
								"spicey":productList[j].spicey,
								// "non_veg_only": non_veg_only,
								"veg_only": veg_only,
								"brand":productList[j].brand,
								"customer_favourute_product": customer_favourute_product,
								"fav_pro_id": fav_pro_id,
								"addon_flug": addon_flug,
								"isConfigurable":isConfigurable,
								"images": product_images,
								"discountPrice": discountPrice,
								"discountTag": discountTag
							});
					}
				}
				//console.log(productArray); return false;

				const productCount = await models.productCategory.count({where:{categoryId:categoryList[i].id, storeId: storeId}})
				
				mainArray.push({
					"title":categoryList[i].title,
					"totalProductCount":productCount,
					"slug":categoryList[i].slug,
					"is_active":categoryList[i].status,
					"product_list":productArray
				});
				// console.log(mainArray);return false;
			}
		}
		if(mainArray.length>0){
			return res.status(200).send({ data:{success:true, details:mainArray}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}else{
			return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}

	}
	else {
		return res.status(200).send({ data:{success:false, message:"All fields are required"}, errorNode:{errorCode:1, errorMsg:"error"}});
	}
	
};



/**
* Description:  Product Details
* @param req
* @param res user details with jwt token
* Developer:Surajit
**/

exports.productDetails = async function(req,res){
	//var p_id = req.body.data.productId;
	var storeId = req.body.data.storeId;
	var c_id = req.body.data.customer_id;
	var slug = req.body.data.slug;
	var productDetails=[];

	if(storeId && storeId != ''){
		if(typeof slug !== 'undefined' && slug != '') {
			var product = await models.products.findOne({where:{slug:slug, storeId:storeId}});
			if(product) {
				var p_id = product.id;
				var details = [];
				var productImage=[];
				if(p_id){

					////////////////////////// catelog price rule start /////////////////////////////////////
					var catelogPriceCurrentDate = yyyy_mm_dd();
					var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
					if(catelogPriceRuleDetails.length>0){
						var isCatelogPriceRule = 'yes';
					} else {
						var isCatelogPriceRule = 'no';
					}
					////////////////////////// catelog price rule end /////////////////////////////////////

					// ///////////////////////  customer favourit product start /////////////

					if(c_id && c_id != '' && c_id != null) {
						var fav_product = await models.favouriteProduct.findOne({where:{storeId:storeId, customerId:c_id, productId:p_id }});

						if(fav_product) {
							var is_favourite = 'yes';
						} else {
							var is_favourite = 'no';
						}
					} else {
						var is_favourite = 'no';
					}

					// ///////////////////////  customer favourit product start /////////////

					// ///////////////////////  customer product in cart start /////////////

					if(c_id && c_id != '' && c_id != null) {
						var cart_product = await models.carts.findOne({where:{storeId:storeId, customerId:c_id, productId:p_id }});

						if(cart_product) {
							console.log("111111111111111----")
							if(cart_product.configProductId && cart_product.configProductId != '' && cart_product.configProductId != null) {
								console.log("22222222222222----"+cart_product.configProductId)
								var configurableProductDetails = await models.optionValue.findOne({where:{storeId:storeId, id:cart_product.configProductId }});
								if(configurableProductDetails) {
									console.log("333333333333333----"+configurableProductDetails.price)
									var configurableProductPrice = configurableProductDetails.price;
								} else {
									var configurableProductPrice = '';
								}
								var configurableProductId = cart_product.configProductId;
							} else {
								var configurableProductId = null;
								var configurableProductPrice = '';
							}
							var product_in_cart = 'yes';
							var product_in_cart_count = cart_product.itemQuantity;
						} else {
							var product_in_cart = 'no';
							var configurableProductId = null;
							var product_in_cart_count = 0;
							var configurableProductPrice = '';
						}
					} else {
						var product_in_cart = 'no';
						var configurableProductId = null;
						var product_in_cart_count = 0;
						var configurableProductPrice = '';
					}

					// ///////////////////////  customer product in car end /////////////

					var multiImageDetails = await models.productImages.findAll({where:{productId:p_id},attributes:['productId','file']});
					
					if(multiImageDetails.length >0){
						multiImageDetails.forEach(function(img){
							productImage.push({
								// "image":req.app.locals.baseurl+"admin/products/image/"+img[0].productId+'/'+img.file
								"image": (img.file!='' && img.file!=null) ? req.app.locals.baseurl+'admin/products/image/'+img.productId+'/'+img.file : req.app.locals.baseurl+'admin/category/no_image.jpg'
							})
						});
						var product_images = (multiImageDetails[0].file!='' && multiImageDetails[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+multiImageDetails[0].productId+'/'+multiImageDetails[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
					} else {
						productImage.push({
							"image": req.app.locals.baseurl+'admin/category/no_image.jpg'
						})
						var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
					}

					var details = await sequelize.query(
						"SELECT p.id, p.title, p.slug, p.application, p.bestSellers, p.optionTitle,p.optionType, p.optionValue, p.color, p.description, p.shortDescription, p.topNotes, p.middleNotes, p.baseNotes, p.price, p.weight, p.size, p.specialPrice, p.specialPriceFrom, p.specialPriceTo, p.attr1, p.attr2, p.attr3, p.attr4, p.attr5, p.attr6, p.attr7, p.attr8, p.attr9, p.attr10, "+
						"bnd.id 'brand_id', bnd.title 'brand_name',CONCAT('"+req.app.locals.baseurl+"admin/brands/', IFNULL(bnd.image, 'no_image.jpg')) as brand_image, "+ 
						"'"+is_favourite+"' as is_favourite, "+
						"'"+product_in_cart+"' as product_in_cart, "+
						"'"+product_in_cart_count+"' as product_in_cart_count, "+
						"'"+product_images+"' as product_icon "+
						"FROM `products` as p "+
						"left join brands as bnd on p.brand = bnd.id "+
						"where p.storeId = "+storeId+" and p.id="+p_id,{ type: Sequelize.QueryTypes.SELECT });

						if(details.length >0){

							if(configurableProductPrice != '') {
								console.log("44444444444----")
								var product_price =   configurableProductPrice;
							} else {
								console.log("555555555555555555555----")
								var product_price =   details[0].price;
							}

							////////////////////////// catelog price rule start /////////////////////////////////////

							if(isCatelogPriceRule == 'yes'){

								var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, details[0].id, product_price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
			
								var discountPrice = productCatalogPriceDetails.discountPrice;
								var discountTag = productCatalogPriceDetails.discountTag;
			
							} else {
								var discountPrice = null;
								var discountTag = null;
							}

							////////////////////////// catelog price rule end /////////////////////////////////////

							productDetails.push({
								"id": details[0].id,
								"title": details[0].title,
								"slug": details[0].slug,
								"application": details[0].application,
								"bestSellers": details[0].bestSellers,
								"optionTitle": details[0].optionTitle,
								"optionType": details[0].optionType,
								"optionValue": details[0].optionValue,
								"color": details[0].color,
								"description": details[0].description,
								"shortDescription": details[0].shortDescription,
								"topNotes": details[0].topNotes,
								"middleNotes": details[0].middleNotes,
								"baseNotes": details[0].baseNotes,
								// "price": details[0].price,
								"price": product_price,
								"weight": details[0].weight,
								"size": details[0].size,
								"specialPrice": details[0].specialPrice,
								"specialPriceFrom": details[0].specialPriceFrom,
								"specialPriceTo": details[0].specialPriceTo,
								"brand_id": details[0].brand_id,
								"brand_name": details[0].brand_name,
								"brand_image": details[0].brand_image,
								"is_favourite": details[0].is_favourite,
								"product_in_cart": details[0].product_in_cart,
								"product_in_cart_count": details[0].product_in_cart_count,
								"configurableProductId": configurableProductId,
								"product_icon": details[0].product_icon,
								"attr1": details[0].attr1,
								"attr2": details[0].attr2,
								"attr3": details[0].attr3,
								"attr4": details[0].attr4,
								"attr5": details[0].attr5,
								"attr6": details[0].attr6,
								"attr7": details[0].attr7,
								"attr8": details[0].attr8,
								"attr9": details[0].attr9,
								"attr10": details[0].attr10,
								"discountPrice": discountPrice,
								"discountTag": discountTag
							})
						}

						var product_category = await sequelize.query("SELECT productCategory.productId, productCategory.categoryId, categories.title, categories.slug FROM `productCategory` left join categories on categories.id = productCategory.categoryId where productCategory.storeId = "+storeId+" and productCategory.productId = "+p_id,{ type: Sequelize.QueryTypes.SELECT });                                

						let configurableProductList  = await models.products.findAll({attributes:['id','title','price','specialPrice','weight','size'],where:{isConfigurable:p_id, storeId:storeId}});

						if(configurableProductList.length>0){
							var isConfigurable = true;
						} else {
							var isConfigurable = false;
						}

						// let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:p_id, storeId:storeId}});

						// // if(optionProductDetails.length>0){
						// // 	if(optionProductDetails[0].optionId && optionProductDetails[0].optionId != '' && optionProductDetails[0].optionId != null) {
						// // 		let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
						// // 		var isConfigurable = true;
						// // 		var configurableProductList = optionValueList;
						// // 	} else {
						// // 		var isConfigurable = false;
						// // 		var configurableProductList = [];
						// // 	}
						// // 	// var isConfigurable = false;
						// // 	// var configurableProductList = [];
						// // } else {
						// // 	var isConfigurable = false;
						// // 	var configurableProductList = [];
						// // }

						// if(optionProductDetails.length>0){
						// 	var configurableProductArray = [];
						// 	for(var i=0;i<optionProductDetails.length;i++){

						// 		// if(optionProductDetails[i].optionId && optionProductDetails[i].optionId != '' && optionProductDetails[i].optionId != null) {
						// 			let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[i].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
						// 			var isConfigurable = true;
						// 			var configurableProductList = optionValueList;

						// 			if(optionValueList.length>0){
						// 				for(var p=0;p<optionValueList.length;p++){

						// 					////////////////////////// catelog price rule start /////////////////////////////////////

						// 					if(isCatelogPriceRule == 'yes'){

						// 						var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, optionProductDetails[i].productId, Number(optionValueList[p].price), catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
							
						// 						var discountPrice = productCatalogPriceDetails.discountPrice;
						// 						var discountTag = productCatalogPriceDetails.discountTag;
							
						// 					} else {
						// 						var discountPrice = null;
						// 						var discountTag = null;
						// 					}

						// 					////////////////////////// catelog price rule end /////////////////////////////////////
											
						// 					configurableProductArray.push({
						// 						"id":optionValueList[p].id,
						// 						"sku":optionValueList[p].sku,
						// 						"value":optionValueList[p].value,
						// 						"price":optionValueList[p].price,
						// 						"discountPrice": discountPrice,
						// 						"discountTag": discountTag
						// 					});
						// 				}
						// 			}

						// 		// } else {
						// 		// 	var isConfigurable = false;
						// 		// 	var configurableProductList = [];
						// 		// }
						// 	}
						// 	var configurableProductList = configurableProductArray;
						// 	// var isConfigurable = false;
						// 	// var configurableProductList = [];
						// } else {
						// 	var isConfigurable = false;
						// 	var configurableProductList = [];
						// }

					// if(details && details[0].icon != '') {
					// 	productImage.push({
					// 	"image":details[0].product_icon
					// 	})
					// }


					// var multiImageDetails = await models.productImages.findAll({where:{productId:p_id},attributes:['productId','file']});
					
					// if(multiImageDetails.length >0){
					// 	multiImageDetails.forEach(function(img){
					// 		productImage.push({
					// 			// "image":req.app.locals.baseurl+"admin/products/image/"+img[0].productId+'/'+img.file
					// 			"image": (img.file!='' && img.file!=null) ? req.app.locals.baseurl+'admin/products/image/'+img.productId+'/'+img.file : req.app.locals.baseurl+'admin/category/no_image.jpg'
					// 		})
					// 	});
					// 	var product_images = (multiImageDetails[0].file!='' && multiImageDetails[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+multiImageDetails[0].productId+'/'+multiImageDetails[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
					// } else {
					// 	var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
					// }

					// var section = await models.section.findOne({where:{title:"Plywale Carpenters"}});
					// var sectionDetails =[];
					// sectionDetails.push({
					// 	id : section.id,
					// 	title : section.title,
					// 	content: section.content
					// })

					if(details.length > 0){

						// res.status(200).send({ success: true, details:details, productImage, product_category: product_category, section :sectionDetails }); 
						res.status(200).send({ data:{success : true,  details:productDetails, productImages:productImage, product_category: product_category, isConfigurable:isConfigurable, configurableProductList:configurableProductList },errorNode:{errorCode:0, errorMsg:"No Error"}});
					}else{
						// res.status(200).send({ success: false, message:"No product found.", section :sectionDetails}); 
						res.status(200).send({ data:{success : false, message: "No product found"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
					}
				}else{
				// res.status(200).send({ success: false, message:"No product found.",section :sectionDetails});  
					res.status(200).send({ data:{success : false, message: "No product found"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
				} 
			} else {
				// res.status(404).send({success:false, message:"Product not found"});
				res.status(200).send({ data:{success : false, message: "Product not found"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
			}
		}else{
			res.status(200).send({ data:{success : false, message: "Product Slug is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
		}
	}else{
		res.status(200).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	}
  }



/**
* Description:  Product Cart
* @param req
* @param res user details with jwt token
* Developer: Partha Mandal
**/
exports.productcart = async function(req, res, next) {
	const{ storeId,id } = req.body.data;
	console.log("---------------------------------");
	console.log(req.body);
	console.log("---------------------------------");
	if(storeId && storeId != '' && storeId != null) {

	const productList = await models.products.findAll({attributes:['id','title', 'shortDescription', 'price','specialPrice','size','brand'],where: {id:id,storeId:storeId} })
	
	let productDetails = []
		for(let product of productList){
			let productImages = await models.productImages.findAll({attributes: ['id','file','productId','imageTitle'], where : {productId: product.id}})

			let image
			if(productImages.length>0){
				image = productImages.map(image=>{
					return Object.assign({
						image: (image.file!='' && image.file!=null) ? req.app.locals.baseurl+'admin/products/image/'+image.productId+'/'+image.file : req.app.locals.baseurl+'admin/category/no_image.jpg',
					})
				})
			}else{
				let noImage = []
				let ni = {}
				ni.image =  req.app.locals.baseurl+'admin/category/no_image.jpg';
				noImage.push(ni)
				image = noImage
			}

			let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId: product.id}, order: [['id', 'DESC']]})

			let stockQuantity
			if(stockDetails.length >= 1){
				stockQuantity = stockDetails[0].stock
			}else{
				stockQuantity = 0
			}
			
			let product_details = {}

			product_details.productId = product.dataValues.id;
			product_details.title = product.dataValues.title;
			product_details.shortDescription = product.dataValues.shortDescription;
			product_details.price = product.dataValues.price;
			product_details.specialPrice = product.dataValues.specialPrice;
			product_details.size = product.dataValues.size;
			product_details.brand = product.dataValues.brand;
			product_details.stock = stockQuantity;
			product_details.image = image;


			productDetails.push(product_details)
		}
		//return productDetails; 
		if(productDetails.length > 0){
			return res.status(200).send({ data:{success:true, details:productDetails}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		} else {
			return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}
	} else {
        return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
    }
};

/**
* Description:  Product Cart
* @param req
* @param res user details with jwt token
* Developer:Surajit
**/
exports.bestSellingProductList = async function(req,res){
	var storeId = req.body.data.storeId;
	var limit = req.body.data.limit ? req.body.data.limit : 4 ;
	var pageSize = parseInt(limit);
	var pageNumber = req.body.data.pageNumber ? req.body.data.pageNumber : 1; 

	if(storeId && storeId !='')	{
		var allbestSellingProductCount = await models.products.count({where:{storeId:storeId,bestSellers:'yes'}});

		if(allbestSellingProductCount){

			////////////////////////// catelog price rule start /////////////////////////////////////
			var catelogPriceCurrentDate = yyyy_mm_dd();
			var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
			if(catelogPriceRuleDetails.length>0){
				var isCatelogPriceRule = 'yes';
			} else {
				var isCatelogPriceRule = 'no';
			}
			////////////////////////// catelog price rule end /////////////////////////////////////

			const productList  = await models.products.findAll({where: {status:'active',storeId:storeId,bestSellers:'yes'},order: [['id', 'DESC']],limit : pageSize,offset : (pageNumber-1)*pageSize})
	
			let productDetails = []
			for(let product of productList){

				if(product.brand && product.brand != '' && product.brand != null){
					let brandDetails = await models.brands.findOne({attributes: ['id','title'], where : {id: product.brand}})
					if(brandDetails){
						var brandTitle = brandDetails.title;
					} else {
						var brandTitle = '';
					}
				} else {
					var brandTitle = '';
				}

				let productCategoryDetails = await models.productCategory.findOne({attributes: ['id','categoryId'], where : {productId: product.id}})

				if(productCategoryDetails){
					let categoriesDetails = await models.categories.findOne({attributes: ['id','title'], where : {id: productCategoryDetails.categoryId}})
					if(categoriesDetails){
						var categoryTitle = categoriesDetails.title;
					} else {
						var categoryTitle = '';
					}
				} else {
					var categoryTitle = '';
				}

				////////////////////////// catelog price rule start /////////////////////////////////////

				if(isCatelogPriceRule == 'yes'){
					var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, product.id, product.price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

					var discountPrice = productCatalogPriceDetails.discountPrice;
					var discountTag = productCatalogPriceDetails.discountTag;

				} else {
					var discountPrice = null;
					var discountTag = null;
				}

				////////////////////////// catelog price rule end /////////////////////////////////////

				let productImages = await models.productImages.findAll({attributes: ['id','file','productId','imageTitle'], where : {productId: product.id}})

				let image
				if(productImages.length>0){
					image = productImages.map(image=>{
						return Object.assign({
							image: (image.file!='' && image.file!=null) ? req.app.locals.baseurl+'admin/products/image/'+image.productId+'/'+image.file : req.app.locals.baseurl+'admin/category/no_image.jpg',
						})
					})
				}else{
					let noImage = []
					let ni = {}
					ni.image =  req.app.locals.baseurl+'admin/category/no_image.jpg';
					noImage.push(ni)
					image = noImage
				}

				let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId: product.id}, order: [['id', 'DESC']]})

				let stockQuantity
				if(stockDetails.length >= 1){
					stockQuantity = stockDetails[0].stock
				}else{
					stockQuantity = 0
				}
				
				let product_details = {}

				product_details.id = product.dataValues.id;
				product_details.title = product.dataValues.title;
				product_details.shortDescription = product.dataValues.shortDescription;
				product_details.price = product.dataValues.price;
				product_details.specialPrice = product.dataValues.specialPrice;
				product_details.size = product.dataValues.size;
				product_details.brand = product.dataValues.brand;
				product_details.slug = product.dataValues.slug;
				product_details.specialPriceFrom = product.dataValues.specialPriceFrom;
				product_details.specialPriceTo = product.dataValues.specialPriceTo;
				product_details.bestSellers = product.dataValues.bestSellers;
				product_details.newArrivals = product.dataValues.newArrivals;
				product_details.weight = product.dataValues.weight;
				product_details.optionTitle = product.dataValues.optionTitle;
				product_details.optionType = product.dataValues.optionType;
				product_details.optionValue = product.dataValues.optionValue;
				product_details.color = product.dataValues.color;
				product_details.size = product.dataValues.size;
				product_details.brand = product.dataValues.brand;
				product_details.fromDate = product.dataValues.fromDate;
				product_details.fromTime = product.dataValues.fromTime;
				product_details.toDate = product.dataValues.toDate;
				product_details.toTime = product.dataValues.toTime;
				product_details.createdAt = product.dataValues.createdAt;
				product_details.updatedAt = product.dataValues.updatedAt;
				product_details.stock = stockQuantity;
				product_details.image = image;
				product_details.discountPrice = discountPrice;
				product_details.discountTag = discountTag;
				product_details.brandTitle = brandTitle;
				product_details.categoryTitle = categoryTitle;

				productDetails.push(product_details)
			}
			if(productDetails.length > 0){
				res.status(200).send({data:{success:true, details:productDetails},errorNode:{errorCode:0, errorMsg:"No Error"}});
			}else{
				res.status(200).send({data:{success:false, details:[]},errorNode:{errorCode:0, errorMsg:"No Error"}});
			}
		}else{
			res.status(200).send({data:{success:false, details:[]},errorNode:{errorCode:0, errorMsg:"No product found"}});
		}
	}else{
	res.status(400).send({data:{success:false, details:[]},errorNode:{errorCode:1, errorMsg:"Store Id is required"}});
	}
}

  /**
* Description:  Best selling Product List
* @param req
* @param res user details with jwt token
* Developer:Surajit
**/
exports.newArrivalProductList = async function(req,res){
	var storeId = req.body.data.storeId;
	var limit = req.body.data.limit ? req.body.data.limit : 4 ;
	var pageSize = parseInt(limit);
	var pageNumber = req.body.data.pageNumber ? req.body.data.pageNumber : 1; 

	if(storeId && storeId !='')	{
		var allbestSellingProductCount = await models.products.count({where:{storeId:storeId,newArrivals:'yes'}});

		if(allbestSellingProductCount){

			////////////////////////// catelog price rule start /////////////////////////////////////
			var catelogPriceCurrentDate = yyyy_mm_dd();
			var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
			if(catelogPriceRuleDetails.length>0){
				var isCatelogPriceRule = 'yes';
			} else {
				var isCatelogPriceRule = 'no';
			}
			////////////////////////// catelog price rule end /////////////////////////////////////
			
			const productList  = await models.products.findAll({where: {status:'active',storeId:storeId,newArrivals:'yes'},order: [['id', 'DESC']],limit : pageSize,offset : (pageNumber-1)*pageSize})
	
			let productDetails = []
			for(let product of productList){

				////////////////////////// catelog price rule start /////////////////////////////////////

				if(isCatelogPriceRule == 'yes'){

					var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, product.id, product.price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

					var discountPrice = productCatalogPriceDetails.discountPrice;
					var discountTag = productCatalogPriceDetails.discountTag;

				} else {
					var discountPrice = null;
					var discountTag = null;
				}

				////////////////////////// catelog price rule end /////////////////////////////////////

				let productImages = await models.productImages.findAll({attributes: ['id','file','productId','imageTitle'], where : {productId: product.id}})

				let image
				if(productImages.length>0){
					image = productImages.map(image=>{
						return Object.assign({
							image: (image.file!='' && image.file!=null) ? req.app.locals.baseurl+'admin/products/image/'+image.productId+'/'+image.file : req.app.locals.baseurl+'admin/category/no_image.jpg',
						})
					})
				}else{
					let noImage = []
					let ni = {}
					ni.image =  req.app.locals.baseurl+'admin/category/no_image.jpg';
					noImage.push(ni)
					image = noImage
				}

				let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId: product.id}, order: [['id', 'DESC']]})

				let stockQuantity
				if(stockDetails.length >= 1){
					stockQuantity = stockDetails[0].stock
				}else{
					stockQuantity = 0
				}
				
				let product_details = {}

				product_details.id = product.dataValues.id;
				product_details.title = product.dataValues.title;
				product_details.shortDescription = product.dataValues.shortDescription;
				product_details.price = product.dataValues.price;
				product_details.specialPrice = product.dataValues.specialPrice;
				product_details.size = product.dataValues.size;
				product_details.brand = product.dataValues.brand;
				product_details.slug = product.dataValues.slug;
				product_details.specialPriceFrom = product.dataValues.specialPriceFrom;
				product_details.specialPriceTo = product.dataValues.specialPriceTo;
				product_details.bestSellers = product.dataValues.bestSellers;
				product_details.newArrivals = product.dataValues.newArrivals;
				product_details.weight = product.dataValues.weight;
				product_details.optionTitle = product.dataValues.optionTitle;
				product_details.optionType = product.dataValues.optionType;
				product_details.optionValue = product.dataValues.optionValue;
				product_details.color = product.dataValues.color;
				product_details.size = product.dataValues.size;
				product_details.brand = product.dataValues.brand;
				product_details.fromDate = product.dataValues.fromDate;
				product_details.fromTime = product.dataValues.fromTime;
				product_details.toDate = product.dataValues.toDate;
				product_details.toTime = product.dataValues.toTime;
				product_details.createdAt = product.dataValues.createdAt;
				product_details.updatedAt = product.dataValues.updatedAt;
				product_details.stock = stockQuantity;
				product_details.image = image;
				product_details.discountPrice = discountPrice;
				product_details.discountTag = discountTag;

				productDetails.push(product_details)
			}
			if(productDetails.length > 0){
				res.status(200).send({data:{success:true, details:productDetails},errorNode:{errorCode:0, errorMsg:"No Error"}});
			}else{
				res.status(200).send({data:{success:false, details:[]},errorNode:{errorCode:0, errorMsg:"No Error"}});
			}
		}else{
			res.status(200).send({data:{success:false, details:[]},errorNode:{errorCode:0, errorMsg:"No product found"}});
		}
	}else{
	res.status(400).send({data:{success:false, details:[]},errorNode:{errorCode:1, errorMsg:"Store Id is required"}});
	}	
}


/**
 * Description: This function is developed to Add customer's favourite Product
 * @param req
 * @param res user details with jwt token
 * Developer: Surajit
 */

exports.addFavouriteProduct = async function (req,res){
	var storeId = req.body.data.storeId;
	var productId = req.body.data.productId;
	var customerId = req.body.data.customerId;
		if(storeId !='' && storeId != null && productId !='' && productId != null && customerId !='' && customerId !=null){
		  var checkProduct = await models.favouriteProduct.findAll({where:{storeId:storeId,productId:productId,customerId:customerId}});
		  if(checkProduct.length == 0){
			var createNewFavourite = await models.favouriteProduct.create({storeId:storeId,productId:productId,customerId:customerId});
			if(createNewFavourite){
			  res.status(200).send({data:{success:true, message:"Successfully saved in favourite list.", favouriteProductDetails: createNewFavourite},errorNode:{errorCode:0, errorMsg:"Successfully saved in favourite list."}});
			}else{
			  res.status(200).send({data:{success:false, message:"Something Worng! Please try again."},errorNode:{errorCode:0, errorMsg:"Something Worng! Please try again"}});
			}
		  }else{
			res.status(200).send({data:{success:false, message: 'This product already in favourite list.'},errorNode:{errorCode:1, errorMsg:"This product already in favourite list."}});
		  }
		}else{
		  res.status(200).send({data:{success:false, message:"Please fill the required field"},errorNode:{errorCode:1, errorMsg:"Please fill the required field"}});
		}
  }


  exports.customerFavouriteProductList = async function(req,res){
	var storeId = req.body.data.storeId;
	var customerId = req.body.data.customerId;
	var limit = req.body.data.limit ? req.body.data.limit : 9 ;
	var pageNumber = req.body.data.pageNumber ? req.body.data.pageNumber : 1;

	var favouriteProductArray = [];
  
	if(storeId && storeId != ''){
		if(pageNumber == 1){
			var offset = 0;
		} else {
			var offset = ((pageNumber)-1)*limit;
		}
		if(customerId && customerId != ''){
			
			//   var allProductIds = await sequelize.query("SELECT fp.fP_id as fav_pro_id, p.id 'product_id',p.title 'product_title', p.slug 'product_slug', p.price 'product_price',p.special_price,p.size 'product_size',CONCAT('"+req.app.locals.baseurl+"superpos/myimages/product/icon/', IFNULL(p.icon, 'user_contents/default-user_dp.png')) as product_icon, c.max_pro_availability, (SELECT inventory.stock FROM inventory WHERE inventory.product_id = p.id order BY inventory.inventory_id DESC LIMIT 1) as stock FROM `favourite_product` as fp left join product as p on p.id = fp.product_id left join site_settings as c on c.id=1 WHERE fp.customer_id="+customerId+" LIMIT "+offset+","+limit+" ",{ type: Sequelize.QueryTypes.SELECT });
			var allProductIds = await sequelize.query("SELECT fp.id as fav_pro_id, p.id 'product_id',p.title 'product_title', p.slug 'product_slug', p.price 'product_price',p.specialPrice,p.size 'product_size', p.weight FROM `favouriteProduct` as fp left join products as p on p.id = fp.productId WHERE fp.storeId = "+storeId+" and fp.customerId = "+customerId+" LIMIT "+offset+","+limit+" ",{ type: Sequelize.QueryTypes.SELECT });

			var totalProduct = await models.favouriteProduct.count({where:{customerId:customerId, storeId:storeId}});
			if(allProductIds.length > 0){

				////////////////////////// catelog price rule start /////////////////////////////////////
				var catelogPriceCurrentDate = yyyy_mm_dd();
				var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
				if(catelogPriceRuleDetails.length>0){
					var isCatelogPriceRule = 'yes';
				} else {
					var isCatelogPriceRule = 'no';
				}
				////////////////////////// catelog price rule end /////////////////////////////////////

				for(var i = 0; i < allProductIds.length; i++){

					////////////////////////// catelog price rule start /////////////////////////////////////

					if(isCatelogPriceRule == 'yes'){

						var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, allProductIds[i].product_id, allProductIds[i].product_price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

						var discountPrice = productCatalogPriceDetails.discountPrice;
						var discountTag = productCatalogPriceDetails.discountTag;

					} else {
						var discountPrice = null;
						var discountTag = null;
					}

					////////////////////////// catelog price rule end /////////////////////////////////////
		
					// let favouriteProductImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:allProductIds[i].product_id, isPrimary: 'Yes'}});
					let favouriteProductImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:allProductIds[i].product_id}});
		
					if(favouriteProductImages.length>0){
					if(favouriteProductImages[0].file!='' && favouriteProductImages[0].file!='' && favouriteProductImages[0].file!=null){
						var favourite_product_images = req.app.locals.baseurl+'admin/products/image/'+favouriteProductImages[0].productId+'/'+favouriteProductImages[0].file;
					} else {
						var favourite_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
					}
					} else {
					var favourite_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
					}
		
					favouriteProductArray.push({
					"fav_pro_id":allProductIds[i].fav_pro_id,
					"product_id":allProductIds[i].product_id,
					"product_title":allProductIds[i].product_title,
					"product_slug":allProductIds[i].product_slug,
					"product_price":allProductIds[i].product_price,
					"specialPrice":allProductIds[i].specialPrice,
					"weight":allProductIds[i].weight,
					"product_size":allProductIds[i].product_size,
					"shortDescription":allProductIds[i].shortDescription,
					"product_icon": favourite_product_images,
					"discountPrice": discountPrice,
					"discountTag": discountTag,
					});
				}

				res.status(200).send({ data:{success : true,  favouriteProductList:favouriteProductArray,totalProduct :totalProduct },errorNode:{errorCode:0, errorMsg:"No Error"}});
			} else {
				res.status(200).send({ data:{success : false, message: "No product found"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
			}
		} else {
			res.status(200).send({ data:{success : false, message: "Customer id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
		}
	}else{
		res.status(200).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	}
}



exports.customerFavouriteProductRemove = async function(req,res){
	var storeId = req.body.data.storeId;
	// var customerId = req.body.data.customerId;
	var favProductId = req.body.data.favProductId;
	if(storeId && storeId != ''){
		if(favProductId && favProductId != ''){
	
			models.favouriteProduct.destroy({
				where: { id: favProductId, storeId:storeId },
			})
			// res.status(200).send({ success: true, message:"Product suuccessfully remove from your favourite list",});
			res.status(200).send({ data:{success : true, message:"Product suuccessfully remove from your favourite list" },errorNode:{errorCode:0, errorMsg:"No Error"}});
		}else{
			//   res.status(200).send({ success: false, message:"Favourite product id is required"});
			res.status(200).send({ data:{success : false, message: "Favourite product id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
		}
	}else{
		//   res.status(200).send({ success: false, message:"Favourite product id is required"});
		res.status(200).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	}
}
/*********************************** filter product list latest start *********************************************/

exports.filterProductList = async function(req,res){
	console.log("aaaaaaaaa----"+req.body.data);
	var storeId = req.body.data.storeId;
	var option_title = req.body.data.option_title || '';
	var option_value = req.body.data.option_value || '';
	var brand = req.body.data.brand || '';
	var slug = req.body.data.category || '';
	var limit = req.body.data.limit ? req.body.data.limit : 9 ;
	var page_number = req.body.data.page_number ? req.body.data.page_number : 1;
	var productList ='';
	var total_product ='';
	var message ='';
	var success ='';
	var details = '';
	var totalProduct ='';

	var multiBrand = '';
	var multiOptionValue = '';
  
	var brandarr =[];
	var brandDetails = [];
	var option_value_arr = [];
	var option_valueDetails = [];
	var productArray = [];
	console.log("storeId----"+storeId);
	console.log("option_title----"+option_title);
	console.log("option_value----"+option_value);
	console.log("brand----"+brand);
	console.log("slug----"+slug);
	
	if(storeId != '' && storeId != null){

		///////////////////////////////////// category list start ///////////////////
		var category_list = await models.categories.findAll({attributes: ['id','storeId','title','status','slug', 'description'], where : {storeId : storeId, status : 'Yes'}, order: [['title', 'ASC']]})
		///////////////////////////////////// category list end ///////////////////
	
		///////////////////////////////////// brand is checked start ///////////////////
		if(brand !='' && brand != null){
			var brandarr = req.body.data.brand.split(",");
			var brandList = await models.brands.findAll({where : {storeId : storeId}});
			console.log(brandarr[0]);
			if(brandList !=''){
				brandList.forEach(async function(brd){
					for(var j=0; j < brandarr.length; j++){
						if(brd.id == brandarr[j]){
							var is_checked = 'true';
							break;
						} else {
							var is_checked = 'false';
						}
					}
					brandDetails.push({
						"brand_id":brd.id,
						"brand_id_in_str":brd.id.toString(),
						"brand_title":brd.title,
						"is_checked":is_checked
					});
				})
			}
		} else {
			var brandList = await models.brands.findAll({where : {storeId : storeId}});
			if(brandList !=''){
				brandList.forEach(function(brd){
					brandDetails.push({
						"brand_id":brd.id,
						"brand_id_in_str":brd.id.toString(),
						"brand_title":brd.title,
						"is_checked":'false'
					});
				})
			}
		}
		///////////////////////////////////// brand is checked end ///////////////////
	
		///////////////////////////////////// option value is checked start ///////////////////
		if(option_value !='' && option_value != null){
			// var optionTitle = await models.products.findAll({attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('optionTitle')), 'optionTitle']], where : { optionTitle: !null, storeId : storeId, status : 'active' }})
			var optionTitle = await sequelize.query("SELECT DISTINCT optionTitle FROM products where optionTitle is not null and optionTitle != '' and storeId = "+storeId+"",{ type: Sequelize.QueryTypes.SELECT });
			if (optionTitle.length > 0) {
				var multiOptionValue = ''
				var option_value_arr = req.body.data.option_value.split(",");
		
				if(option_value_arr.length == 1){
					option_valuestr = "optionValue = '"+option_value_arr[0].replace(/ /g, "")+"'";
				}else{
					var i=0; 
					option_value_arr.forEach(async function(ov){
						multiOptionValue += "optionValue ='"+option_value_arr[i].replace(/ /g, "")+"' or ";
						i++;
					}, this);
					var option_valuestr = multiOptionValue.slice(0,-4);
				}
			
				optionTitle.forEach(async function(opt){
					var optionValues = await sequelize.query("SELECT DISTINCT `optionValue`, IF(("+option_valuestr+"),'true', 'false') as is_checked FROM `products` AS `product` WHERE `product`.`optionTitle`= '"+opt.optionTitle+"' and `product`.`storeId` = "+storeId+"",{ type: Sequelize.QueryTypes.SELECT });
					
					option_valueDetails.push({
						"title":opt.optionTitle,
						"value":optionValues
					});
				})
			}
		} else {
			var optionTitle = await sequelize.query("SELECT DISTINCT optionTitle FROM products where optionTitle is not null and optionTitle != '' and storeId = "+storeId+"",{ type: Sequelize.QueryTypes.SELECT });
			
			if (optionTitle.length > 0) {
				optionTitle.forEach(async function(opt){
					var optionValues = await sequelize.query("SELECT DISTINCT `optionValue`, 'false' as is_checked FROM `products` AS `product` WHERE `product`.`optionTitle`= '"+opt.optionTitle+"' and `product`.`storeId` = "+storeId+"",{ type: Sequelize.QueryTypes.SELECT });
					
					option_valueDetails.push({
						"title":opt.optionTitle,
						"value":optionValues
					});
				})
			}
		}
		///////////////////////////////////// option value is checked end ///////////////////

		////////////////////////// catelog price rule start /////////////////////////////////////
		var catelogPriceCurrentDate = yyyy_mm_dd();
		var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
		if(catelogPriceRuleDetails.length>0){
			var isCatelogPriceRule = 'yes';
		} else {
			var isCatelogPriceRule = 'no';
		}
		////////////////////////// catelog price rule end /////////////////////////////////////
	
		if(slug && slug !='' ){
		  var categoryDetails = await models.categories.findOne({where:{slug:slug, storeId : storeId}});
		  var categoryId = categoryDetails.id;
		  var categoryTitle = categoryDetails.title;
	  
		  if(page_number == 1){
			var offset = 0;
		  }else{
			var offset = ((page_number)-1)*limit;
		  }
	  
		  if(brand !='' && brand != null){
			if(option_title!='' && option_value!=''){
				console.log("aaaaaaaaaaaaa----");
	  
			  var brandarr = req.body.data.brand.split(",");
			  var option_valuearr = req.body.data.option_value.split(",");
	  
			  if(brandarr.length == 1){
				brandstr = "b.brand = "+brandarr[0].replace(/ /g, "");
				console.log("brandstr333333333333333333333----"+brandstr);
			  }else{
				var i=0; 
				brandarr.forEach(function(brand){
				  multiBrand += "b.brand = "+brandarr[i].replace(/ /g, "")+" or ";
				  i++;
				}, this);
				var brandstr = multiBrand.slice(0,-4);
				console.log("brandstr44444444444444444----"+brandstr);
			  }
	  
			  if(option_valuearr.length == 1){
				option_valuestr = "b.optionValue ='"+option_valuearr[0].replace(/ /g, "")+"'";
				console.log("option_valuestr55555555555555----"+option_valuestr);
			  }else{
				var i=0; 
				option_valuearr.forEach(function(ov){
				  multiOptionValue += "b.optionValue ='"+option_valuearr[i].replace(/ /g, "")+"' or ";
				  i++;
				}, this);
				var option_valuestr = multiOptionValue.slice(0,-4);
				console.log("option_valuestr666666666666666666666----"+option_valuestr);
			  }
	  
			  productList = await sequelize.query("select a.id as product_category_id, b.slug, b.id, b.title, b.price, b.specialPrice, b.size from productCategory as a left join products as b on b.id=a.productId WHERE a.categoryId = "+categoryId+" and ("+brandstr+") and b.optionTitle='"+option_title+"' and b.storeId = "+storeId+" and ("+option_valuestr+") and b.status='active' LIMIT "+offset+", "+limit,{ type: Sequelize.QueryTypes.SELECT });

			  total_product = await sequelize.query("select a.id as product_category_id, b.slug, b.id from productCategory as a left join products as b on b.id=a.productId WHERE a.categoryId = "+categoryId+" and ("+brandstr+") and b.optionTitle='"+option_title+"' and b.storeId = "+storeId+" and ("+option_valuestr+") and b.status='active'",{ type: Sequelize.QueryTypes.SELECT })
	  
			  if(productList.length > 0){

				for(var j=0;j<productList.length;j++){
					////////////////////////// catelog price rule start /////////////////////////////////////

					if(isCatelogPriceRule == 'yes'){

						var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productList[j].id, productList[j].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

						var discountPrice = productCatalogPriceDetails.discountPrice;
						var discountTag = productCatalogPriceDetails.discountTag;

					} else {
						var discountPrice = null;
						var discountTag = null;
					}

					////////////////////////// catelog price rule end /////////////////////////////////////

					productArray.push({
						"id":productList[j].id,
						"title":productList[j].title,
						"product_category_id":productList[j].product_category_id,
						"slug":productList[j].slug,
						"price": productList[j].price,
						"specialPrice": productList[j].specialPrice,
						"size":productList[j].size,
						"discountPrice": discountPrice,
						"discountTag": discountTag
					});
				}

				success = true;
				details = productArray,
				totalProduct = total_product.length
			  }else{
				success = false;
				details = '';
				message ="No product found."
				totalProduct = total_product.length
			  }
			}else{
				console.log("bbbbbbbbbbbbbb----");
			  var brandarr = req.body.data.brand.split(",");
	  
			  if(brandarr.length == 1){
				brandstr = "b.brand = "+brandarr[0].replace(/ /g, "");
				console.log("brandstr000000000000000000----"+brandstr);
			  }else{
				var i=0; 
				brandarr.forEach(function(brand){
				  multiBrand += "b.brand = "+brandarr[i].replace(/ /g, "")+" or ";
				  i++;
				}, this);
				var brandstr = multiBrand.slice(0,-4);
				console.log("brandstr11111111111111----"+brandstr);
			  }
			  
			  productList = await sequelize.query("select a.id as product_category_id, b.slug, b.id, b.title, b.price, b.specialPrice, b.size from productCategory as a left join products as b on b.id=a.productId WHERE a.categoryId='"+categoryId+"' and ("+brandstr+") and b.status='active' and b.storeId = "+storeId+" LIMIT "+offset+", "+limit,{ type: Sequelize.QueryTypes.SELECT });
			  
			  total_product = await sequelize.query("select a.id as product_category_id, b.slug, b.id from productCategory as a left join products as b on b.id=a.productId WHERE a.categoryId='"+categoryId+"' and ("+brandstr+") and b.status='active' and b.storeId = "+storeId+" ",{ type: Sequelize.QueryTypes.SELECT });
	  
			  if(productList.length > 0){

				for(var j=0;j<productList.length;j++){
					////////////////////////// catelog price rule start /////////////////////////////////////

					if(isCatelogPriceRule == 'yes'){

						var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productList[j].id, productList[j].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

						var discountPrice = productCatalogPriceDetails.discountPrice;
						var discountTag = productCatalogPriceDetails.discountTag;

					} else {
						var discountPrice = null;
						var discountTag = null;
					}

					////////////////////////// catelog price rule end /////////////////////////////////////

					productArray.push({
						"id":productList[j].id,
						"title":productList[j].title,
						"product_category_id":productList[j].product_category_id,
						"slug":productList[j].slug,
						"price": productList[j].price,
						"specialPrice": productList[j].specialPrice,
						"size":productList[j].size,
						"discountPrice": discountPrice,
						"discountTag": discountTag
					});
				}

				success = true;
				// details = productList,
				details = productArray,
				totalProduct = total_product.length
			  }else{
				success = false;
				details = '';
				message ="No product found."
				totalProduct = total_product.length
			  }
			}  
		  }else{
			console.log("cccccccccccccccc----");
			if(option_title!='' && option_value!=''){
				console.log("ddddddddddddd----");
			  var option_valuearr = req.body.data.option_value.split(",");
	  
			  if(option_valuearr.length == 1){
				option_valuestr = "b.optionValue ='"+option_valuearr[0].replace(/ /g, "")+"'";
				console.log("option_valuestr11111111111111----"+option_valuestr);
			  }else{
				var i=0; 
				option_valuearr.forEach(function(ov){
				  multiOptionValue += "b.optionValue ='"+option_valuearr[i].replace(/ /g, "")+"' or ";
				  i++;
				}, this);
				var option_valuestr = multiOptionValue.slice(0,-4);
				console.log("option_valuestr222222222222221----"+option_valuestr);
			  }
			  
			  productList = await sequelize.query("select a.id as product_category_id, b.slug, b.id, b.title, b.price, b.specialPrice, b.size from productCategory as a left join products as b on b.id=a.productId WHERE a.categoryId='"+categoryId+"' and b.optionTitle='"+option_title+"' and ("+option_valuestr+") and b.status='active' and b.storeId = "+storeId+" LIMIT "+offset+", "+limit,{ type: Sequelize.QueryTypes.SELECT });

			  total_product = await sequelize.query("select a.id as product_category_id, b.slug, b.id from productCategory as a left join products as b on b.id=a.productId WHERE a.categoryId='"+categoryId+"' and b.optionTitle='"+option_title+"' and ("+option_valuestr+") and b.status='active' and b.storeId = "+storeId+"",{ type: Sequelize.QueryTypes.SELECT });
	  
			  if(productList.length > 0){

				for(var j=0;j<productList.length;j++){
					////////////////////////// catelog price rule start /////////////////////////////////////

					if(isCatelogPriceRule == 'yes'){

						var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productList[j].id, productList[j].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

						var discountPrice = productCatalogPriceDetails.discountPrice;
						var discountTag = productCatalogPriceDetails.discountTag;

					} else {
						var discountPrice = null;
						var discountTag = null;
					}

					////////////////////////// catelog price rule end /////////////////////////////////////

					productArray.push({
						"id":productList[j].id,
						"title":productList[j].title,
						"product_category_id":productList[j].product_category_id,
						"slug":productList[j].slug,
						"price": productList[j].price,
						"specialPrice": productList[j].specialPrice,
						"size":productList[j].size,
						"discountPrice": discountPrice,
						"discountTag": discountTag
					});
				}

				success = true;
				// details = productList,
				details = productArray,
				totalProduct = total_product.length
			  }else{
				success = false;
				details = '';
				message ="No product found."
				totalProduct = total_product.length
			  }
			}else{
				console.log("eeeeeeeeeeeee----");
			  
			  productList = await sequelize.query("select a.id as product_category_id, b.slug, b.id, b.title, b.price, b.specialPrice, b.size from productCategory as a left join products as b on b.id=a.productId WHERE a.categoryId='"+categoryId+"' and b.status='active' and b.storeId = "+storeId+" LIMIT "+offset+", "+limit,{ type: Sequelize.QueryTypes.SELECT });

			  total_product = await sequelize.query("select a.id as product_category_id, b.slug, b.id from productCategory as a left join products as b on b.id=a.productId WHERE a.categoryId='"+categoryId+"' and b.status='active' and b.storeId = "+storeId+"",{ type: Sequelize.QueryTypes.SELECT });
			  
			  if(productList.length > 0){

				for(var j=0;j<productList.length;j++){
					////////////////////////// catelog price rule start /////////////////////////////////////

					if(isCatelogPriceRule == 'yes'){

						var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productList[j].id, productList[j].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

						var discountPrice = productCatalogPriceDetails.discountPrice;
						var discountTag = productCatalogPriceDetails.discountTag;

					} else {
						var discountPrice = null;
						var discountTag = null;
					}

					////////////////////////// catelog price rule end /////////////////////////////////////

					productArray.push({
						"id":productList[j].id,
						"title":productList[j].title,
						"product_category_id":productList[j].product_category_id,
						"slug":productList[j].slug,
						"price": productList[j].price,
						"specialPrice": productList[j].specialPrice,
						"size":productList[j].size,
						"discountPrice": discountPrice,
						"discountTag": discountTag
					});
				}

				success = true;
				// details = productList,
				details = productArray,
				totalProduct = total_product.length
			  }else{
				success = false;
				details = '';
				message ="No product found."
				totalProduct = total_product.length
			  }
			}
		  }
  
			//   var section = await models.section.findOne({where:{title:"Carpenter on Doorstep", storeId : storeId}});
			//   var sectionDetails =[];
			//   sectionDetails.push({
			// 	id : section.id,
			// 	title : section.title,
			// 	content: section.content
			//   })
		
			//   res.status(200).send({ success: success,message:message, details:details,totalProduct:totalProduct, categoryTitle:categoryTitle, brandDetails:brandDetails, option_valueDetails:option_valueDetails, value: category_list}); 
			res.status(200).send({ data:{success : true, message:message, details:details,totalProduct:totalProduct, categoryTitle:categoryTitle, brandDetails:brandDetails, option_valueDetails:option_valueDetails, value: category_list },errorNode:{errorCode:0, errorMsg:"No Error"}});
		}else{
			//   res.status(200).json({ success: false,message: "Category is required", brandDetails:brandDetails, option_valueDetails:option_valueDetails, value: category_list});
			return res.status(400).send({ data:{success:true,message: "Category is required", brandDetails:brandDetails, option_valueDetails:option_valueDetails, value: category_list}, errorNode:{errorCode:1, errorMsg:"Category is required"}});
		} 
		
	}else{
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"Store Id is required"}});
	}
  }
  
/*********************************** filter product list latest ends *********************************************/


/************************* app Related Product Listing start ********************************/
exports.appRelatedProductList = async function(req, res, next) {

	var storeId = req.body.data.storeId;
	var productId= req.body.data.productId;
	var productArray = [];
  
	if(storeId && storeId != ''){
		if(productId && productId !=''){

			////////////////////////// catelog price rule start /////////////////////////////////////
			var catelogPriceCurrentDate = yyyy_mm_dd();
			var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
			if(catelogPriceRuleDetails.length>0){
				var isCatelogPriceRule = 'yes';
			} else {
				var isCatelogPriceRule = 'no';
			}
			////////////////////////// catelog price rule end /////////////////////////////////////


			var originalRelatedProduct = await sequelize.query("SELECT relatedProduct.selectedProductId, products.id, products.title, products.brand, products.slug, products.shortDescription, products.description, products.price, products.specialPrice, products.weight, products.brand, brands.title as brandTitle FROM `relatedProduct` left join products on products.id = relatedProduct.selectedProductId left join brands on brands.id = products.brand where relatedProduct.`storeId` = "+storeId+" and relatedProduct.`productId` = "+productId+" and relatedProduct.`type` = 'Related' and products.status = 'active' limit 4",{ type: Sequelize.QueryTypes.SELECT });
			var productArray = [];
			if(originalRelatedProduct.length > 0) {
				for(var j=0;j<originalRelatedProduct.length;j++){

					////////////////////////// catelog price rule start /////////////////////////////////////

					if(isCatelogPriceRule == 'yes'){

						var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, originalRelatedProduct[j].id, originalRelatedProduct[j].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

						var discountPrice = productCatalogPriceDetails.discountPrice;
						var discountTag = productCatalogPriceDetails.discountTag;

					} else {
						var discountPrice = null;
						var discountTag = null;
					}

					////////////////////////// catelog price rule end /////////////////////////////////////

					let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:originalRelatedProduct[j].id}});

					if(productImages.length>0){
						var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
					} else {
						var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
					}

					let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId: originalRelatedProduct[j].id}, order: [['id', 'DESC']]})

					let stockQuantity
					if(stockDetails.length >= 1){
						stockQuantity = stockDetails[0].stock
					}else{
						stockQuantity = 0
					}

					productArray.push({
						"id":originalRelatedProduct[j].id,
						"title":originalRelatedProduct[j].title,
						"shortDescription":originalRelatedProduct[j].shortDescription,
						"slug":originalRelatedProduct[j].slug,
						"description": originalRelatedProduct[j].description,
						"price": originalRelatedProduct[j].price,
						"stock": stockQuantity,
						"specialPrice": originalRelatedProduct[j].specialPrice,
						"weight":originalRelatedProduct[j].weight,
						"brandTitle":originalRelatedProduct[j].brandTitle,
						"images": product_images,
						"discountPrice": discountPrice,
						"discountTag": discountTag
					});

				}
			} else {
				var productArray = [];
			}

			var product_category = await sequelize.query("SELECT id, productId, categoryId FROM `productCategory` where `storeId` = "+storeId+" and `productId` = "+productId,{ type: Sequelize.QueryTypes.SELECT });
			var product_name = await sequelize.query("SELECT id, title, slug FROM `products` where `id` = "+productId,{ type: Sequelize.QueryTypes.SELECT });
			if(product_category.length > 0) {
				// var relate_product_listing = await sequelize.query("select b.id, b.title,CONCAT('"+req.app.locals.baseurl+"superpos/myimages/product/icon/', IFNULL(b.icon, 'superpos/images/no-product-image.jpg')) as icon, b.slug,b.short_description,b.description,b.price,b.special_price,b.weight from product_category as a "+ 
				// "left join product as b on b.id=a.product_id where a.category_id="+product_category[0].category_id+" and  b.status='active' and b.title != '"+product_name[0].title+"' ORDER BY RAND() limit 4",{ type: Sequelize.QueryTypes.SELECT });
				var relate_product_listing = await sequelize.query("select b.id, b.title, b.slug,b.shortDescription,b.description,b.price,b.specialPrice,b.weight, b.brand, brands.title as brandTitle from productCategory as a "+ 
				"left join products as b on b.id=a.productId left join brands on brands.id = b.brand where a.categoryId="+product_category[0].categoryId+" and  b.status='active' and b.title != '"+product_name[0].title+"' ORDER BY RAND() limit 4",{ type: Sequelize.QueryTypes.SELECT });
				
				
				if(relate_product_listing.length > 0) {
					for(var j=0;j<relate_product_listing.length;j++){

						////////////////////////// catelog price rule start /////////////////////////////////////

						if(isCatelogPriceRule == 'yes'){

							var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, relate_product_listing[j].id, relate_product_listing[j].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

							var discountPrice = productCatalogPriceDetails.discountPrice;
							var discountTag = productCatalogPriceDetails.discountTag;

						} else {
							var discountPrice = null;
							var discountTag = null;
						}

						////////////////////////// catelog price rule end /////////////////////////////////////

						let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:relate_product_listing[j].id}});

						if(productImages.length>0){
							var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
						} else {
							var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
						}

						let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId: relate_product_listing[j].id}, order: [['id', 'DESC']]})

						let stockQuantity
						if(stockDetails.length >= 1){
							stockQuantity = stockDetails[0].stock
						}else{
							stockQuantity = 0
						}

						productArray.push({
							"id":relate_product_listing[j].id,
							"title":relate_product_listing[j].title,
							"shortDescription":relate_product_listing[j].shortDescription,
							"slug":relate_product_listing[j].slug,
							"description": relate_product_listing[j].description,
							"price": relate_product_listing[j].price,
							"stock": stockQuantity,
							"specialPrice": relate_product_listing[j].specialPrice,
							"weight":relate_product_listing[j].weight,
							"brandTitle":relate_product_listing[j].brandTitle,
							"images": product_images,
							"discountPrice": discountPrice,
							"discountTag": discountTag
						});

					}
					res.status(200).send({ data:{success : true,  relate_product_listing:productArray.slice(0, 4) },errorNode:{errorCode:0, errorMsg:"No Error"}});
				} else {
					res.status(200).send({ data:{success : false, message: "No related product found"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
				}
			}else{
				res.status(200).send({ data:{success : false, message: "This product have no category"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
			}
		}else{
			res.status(200).send({ data:{success : false, message: "Product id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
		}
	}else{
		res.status(200).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	}
  }
/************************* app Related Product Listing ends *******************************/


exports.appProductList = async function (req, res, next) {
	console.log(req.body.data);

	var customerId = req.body.data.customerId;
	var storeId = req.body.data.storeId;
	var slug = req.body.data.slug;
	// var subCategorySlug = req.body.data.subCategorySlug;
	var type = req.body.data.type;
	var limit = req.body.data.limit ? req.body.data.limit : 9 ;
	var page_number = req.body.data.page_number ? req.body.data.page_number : 1;
	var productArray = [];

	// var allProduct = req.body.data.limit;

	if(storeId && storeId != ''){
		if(slug && slug != ''){

			if(page_number == 1){
				var offset = 0;
			}else{
				var offset = ((page_number)-1)*limit;
			}


			// console.log("limitlimitlimitlimit---"+limit)
			// console.log("offsetoffsetoffset---"+offset)

			////////////////////////// catelog price rule start /////////////////////////////////////
			var catelogPriceCurrentDate = yyyy_mm_dd();
			var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', $or: [{offerFrom: { $lte: catelogPriceCurrentDate }}, {offerTo: { $gte: catelogPriceCurrentDate }}] }});
			if(catelogPriceRuleDetails.length>0){
				var isCatelogPriceRule = 'yes';
				console.log("11111111111111111111111----"+catelogPriceRuleDetails.length)
			} else {
				var isCatelogPriceRule = 'no';
				console.log("11111111111111111111111---nononoono-")
			}
			////////////////////////// catelog price rule end /////////////////////////////////////

			if(storeId == 30){
				if(type && type != ''){

					if (type == 'category') {
			
						var category = await sequelize.query("select id,title,slug from categories where storeId = "+storeId+" and slug='" + slug + "' and status = 'Yes'",{ type: Sequelize.QueryTypes.SELECT });
						var subCategory = await sequelize.query("select id,title,slug from categories where storeId = "+storeId+" and parentCategoryId =" + category[0].id+" and status = 'Yes'",{ type: Sequelize.QueryTypes.SELECT });
						if (subCategory.length > 0) {
							var categoryId = subCategory[0].id;
							var categoryTitle = subCategory[0].title;
							var categorySlug = subCategory[0].slug;
						} else if(category.length > 0){
							var categoryId = category[0].id;
							var categoryTitle = category[0].title;
							var categorySlug = category[0].slug;
						} else {
							var categoryId = null;
							var categoryTitle = '';
							var categorySlug = '';
						}
							// var categoryId = subCategory[0].id;

						// ////////////////////////// catelog price rule start /////////////////////////////////////
						// var catelogPriceCurrentDate = yyyy_mm_dd();
						// var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, $or: [{offerFrom: { $lte: catelogPriceCurrentDate }}, {offerTo: { $gte: catelogPriceCurrentDate }}] }});
						// if(catelogPriceRuleDetails.length>0){
						// 	var isCatelogPriceRule = 'yes';
						// } else {
						// 	var isCatelogPriceRule = 'no';
						// }
						// ////////////////////////// catelog price rule end /////////////////////////////////////

						if(categoryId && categoryId != '' && categoryId != null){
							var product_count = await sequelize.query("select a.id, a.categoryId, b.slug, b.id, b.title from productCategory as a left join products as b on b.id = a.productId WHERE a.storeId = "+storeId+" and b.isConfigurable = 0 and a.categoryId = "+categoryId+" and b.status = 'active' ",{ type: Sequelize.QueryTypes.SELECT });
							
							// console.log("product_countproduct_countproduct_count---"+product_count.length)
							productList = await sequelize.query(
									"select a.productId, a.categoryId, b.slug, b.id, b.title, b.price, b.specialPrice, b.size, b.weight, b.brand "+
									"from productCategory as a "+
									"left join products as b on b.id=a.productId "+
									"WHERE a.storeId = "+storeId+" and b.isConfigurable=0 and a.categoryId='"+categoryId+"' and b.status='active' ORDER BY b.`sequence` ASC LIMIT "+offset+", "+limit,{ type: Sequelize.QueryTypes.SELECT });
							
							
							if (productList.length > 0) {
				
								for(var j=0;j<productList.length;j++){

									if(productList[j].brand && productList[j].brand != '' && productList[j].brand != null){
										let brandDetails = await models.brands.findOne({attributes: ['id','title'], where : {id: productList[j].brand}})
										if(brandDetails){
											var brandTitle = brandDetails.title;
										} else {
											var brandTitle = '';
										}
									} else {
										var brandTitle = '';
									}

									////////////////////////// catelog price rule start /////////////////////////////////////

									if(isCatelogPriceRule == 'yes'){

										var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productList[j].id, productList[j].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
					
										var discountPrice = productCatalogPriceDetails.discountPrice;
										var discountTag = productCatalogPriceDetails.discountTag;
					
									} else {
										var discountPrice = null;
										var discountTag = null;
									}

									////////////////////////// catelog price rule end /////////////////////////////////////
				
									let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productList[j].id}});
				
									let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId:productList[j].id}, order: [['id', 'DESC']]})
				
									let stockQuantity
									if(stockDetails.length >= 1){
										stockQuantity = stockDetails[0].stock
									}else{
										stockQuantity = 0
									}
				
									if(productImages.length>0){
										var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
									} else {
										var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
									}

									if(customerId && customerId != null && customerId != ''){
										let customerProductinCart = await models.carts.findAll({attributes:['id','itemQuantity'],where:{productId:productList[j].id,customerId:customerId,storeId:storeId}});

										if(customerProductinCart.length>0){
											var productInCart = true;
											var item_quantity = customerProductinCart[0].itemQuantity;
										} else {
											var productInCart = false;
											var item_quantity = 0;
										}
									} else {
										var productInCart = false;
										var item_quantity = 0;
									}
				
									// let configurableProduct = await models.products.findAll({attributes:['id','price','slug','weight'],where:{isConfigurable:productList[j].id}});

									// if(configurableProduct.length>0){
									// 	var isConfigurable = true;
									// 	var configurableProductList = configurableProduct;
									// } else {
									// 	var isConfigurable = false;
									// 	var configurableProductList = [];
									// }

									// ////////////////////////////////// option product start //////////////////
									let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:productList[j].id, storeId:storeId}});

									if(optionProductDetails.length>0){
										if(optionProductDetails[0].optionId && optionProductDetails[0].optionId != '' && optionProductDetails[0].optionId != null) {
											let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
											if(optionValueList.length>0){
												var isConfigurable = true;
											} else {
												var isConfigurable = true;
											}
											var configurableProductList = optionValueList;
										} else {
											var isConfigurable = false;
											var configurableProductList = [];
										}
									} else {
										var isConfigurable = false;
										var configurableProductList = [];
									}
									// ////////////////////////////////// option product end //////////////////
									
									productArray.push({
										"productId":productList[j].productId,
										"categoryId":productList[j].categoryId,
										"id":productList[j].id,
										"slug":productList[j].slug,
										"title":productList[j].title,
										"price":productList[j].price,
										"stock": stockQuantity,
										"specialPrice":productList[j].specialPrice,
										"size":productList[j].size,
										"productInCart":productInCart,
										"item_quantity":item_quantity,
										"isConfigurable":isConfigurable,
										"configurableProduct":configurableProductList,
										"images": product_images,
										"discountPrice": discountPrice,
										"discountTag": discountTag,
										"categoryTitle": categoryTitle,
										"brandTitle": brandTitle
									});
								}
								res.status(200).send({ data:{success : true, value: productArray, categoryTitle: categoryTitle, categorySlug: categorySlug, categoryId: categoryId, total_product_count: product_count.length },errorNode:{errorCode:0, errorMsg:"No Error"}});
							} else {
								res.status(200).send({ data:{success : false, message: "No product found"} ,errorNode:{errorCode:0, errorMsg:"No Error"}});
							}
						} else {
							res.status(200).send({ data:{success : false, message: "No product found"} ,errorNode:{errorCode:0, errorMsg:"No Error"}});
						}
					} else if (type == 'brand'){

						var category = await sequelize.query("select id,title,slug from brands where storeId = "+storeId+" and slug='" + slug + "' and status = 'Yes'",{ type: Sequelize.QueryTypes.SELECT });
						if (category.length > 0) {
							var categoryId = category[0].id;
							var product_count = await sequelize.query("select b.slug, b.id, b.title, b.price, b.specialPrice, b.size, b.weight from products as b WHERE b.storeId = "+storeId+" and b.isConfigurable=0 and b.brand='"+categoryId+"' and b.status='active'",{ type: Sequelize.QueryTypes.SELECT });
							
							productList = await sequelize.query(
									"select b.slug, b.id, b.title, b.price, b.specialPrice, b.size, b.weight "+
									"from products as b "+
									// "left join products as b on b.id=a.productId "+
									"WHERE b.storeId = "+storeId+" and b.isConfigurable=0 and b.brand='"+categoryId+"' and b.status='active' ORDER BY b.`sequence` ASC LIMIT "+offset+", "+limit,{ type: Sequelize.QueryTypes.SELECT });
							
							// ////////////////////////// catelog price rule start /////////////////////////////////////
							// var catelogPriceCurrentDate = yyyy_mm_dd();
							// var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, $or: [{offerFrom: { $lte: catelogPriceCurrentDate }}, {offerTo: { $gte: catelogPriceCurrentDate }}] }});
							// if(catelogPriceRuleDetails.length>0){
							// 	var isCatelogPriceRule = 'yes';
							// } else {
							// 	var isCatelogPriceRule = 'no';
							// }
							// ////////////////////////// catelog price rule end /////////////////////////////////////
							
							if (productList.length > 0) {
				
								for(var j=0;j<productList.length;j++){

									let productCategoryDetails = await models.productCategory.findOne({attributes: ['id','categoryId'], where : {productId: productList[j].id}})

									if(productCategoryDetails){
										let categoriesDetails = await models.categories.findOne({attributes: ['id','title'], where : {id: productCategoryDetails.categoryId}})
										if(categoriesDetails){
											var categoryTitle = categoriesDetails.title;
										} else {
											var categoryTitle = '';
										}
									} else {
										var categoryTitle = '';
									}

									////////////////////////// catelog price rule start /////////////////////////////////////

									if(isCatelogPriceRule == 'yes'){

										var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productList[j].id, productList[j].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
					
										var discountPrice = productCatalogPriceDetails.discountPrice;
										var discountTag = productCatalogPriceDetails.discountTag;
					
									} else {
										var discountPrice = null;
										var discountTag = null;
									}

									////////////////////////// catelog price rule end /////////////////////////////////////
				
									let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productList[j].id}});
				
									let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId:productList[j].id}, order: [['id', 'DESC']]})
				
									let stockQuantity
									if(stockDetails.length >= 1){
										stockQuantity = stockDetails[0].stock
									}else{
										stockQuantity = 0
									}
				
									if(productImages.length>0){
										var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
									} else {
										var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
									}

									if(customerId && customerId != null && customerId != ''){
										let customerProductinCart = await models.carts.findAll({attributes:['id','itemQuantity'],where:{productId:productList[j].id,customerId:customerId,storeId:storeId}});

										if(customerProductinCart.length>0){
											var productInCart = true;
											var item_quantity = customerProductinCart[0].itemQuantity;
										} else {
											var productInCart = false;
											var item_quantity = 0;
										}
									} else {
										var productInCart = false;
										var item_quantity = 0;
									}

									// let configurableProduct = await models.products.findAll({attributes:['id','price','slug','weight'],where:{isConfigurable:productList[j].id}});

									// if(configurableProduct.length>0){
									// 	var isConfigurable = true;
									// 	var configurableProductList = configurableProduct;
									// } else {
									// 	var isConfigurable = false;
									// 	var configurableProductList = [];
									// }

									// ////////////////////////////////// option product start //////////////////
									let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:productList[j].id, storeId:storeId}});

									if(optionProductDetails.length>0){
										if(optionProductDetails[0].optionId && optionProductDetails[0].optionId != '' && optionProductDetails[0].optionId != null) {
											let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
											if(optionValueList.length>0){
												var isConfigurable = true;
											} else {
												var isConfigurable = true;
											}
											var configurableProductList = optionValueList;
										} else {
											var isConfigurable = false;
											var configurableProductList = [];
										}
									} else {
										var isConfigurable = false;
										var configurableProductList = [];
									}
									// ////////////////////////////////// option product end //////////////////
				
									productArray.push({
										"productId":productList[j].id,
										"categoryId":'',
										"id":productList[j].id,
										"slug":productList[j].slug,
										"title":productList[j].title,
										"price":productList[j].price,
										"stock": stockQuantity,
										"specialPrice":productList[j].specialPrice,
										"size":productList[j].size,
										"productInCart":productInCart,
										"item_quantity":item_quantity,
										"isConfigurable":isConfigurable,
										"configurableProduct":configurableProductList,
										"images": product_images,
										"discountPrice": discountPrice,
										"discountTag": discountTag,
										"brandTitle": category[0].title,
										"categoryTitle": categoryTitle
									});
								}
								res.status(200).send({ data:{success : true, value: productArray, categoryTitle: category[0].title, categorySlug: category[0].slug, categoryId: category[0].id, total_product_count: product_count.length },errorNode:{errorCode:0, errorMsg:"No Error"}});
							} else {
								res.status(200).send({ data:{success : false, message: "No product found"} ,errorNode:{errorCode:0, errorMsg:"No Error"}});
							}
						} else {
							res.status(200).send({ data:{success : true, value: [], message: "No prduct found"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
						}
						
					} else {
						res.status(200).send({ data:{success : false, message: "Type should be category or subCategory"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
					}
				} else {
					res.status(200).send({ data:{success : false, message: "Type is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
				}
			} else {
				if (slug && slug !='') {
		
					var category = await sequelize.query("select id,title,slug from categories where storeId = "+storeId+" and slug='" + slug + "' and status = 'Yes'",{ type: Sequelize.QueryTypes.SELECT });
					var categoryId = category[0].id;
					var product_count = await sequelize.query("select a.id, a.categoryId, b.slug, b.id, b.title from productCategory as a left join products as b on b.id = a.productId WHERE a.storeId = "+storeId+" and b.isConfigurable = 0 and a.categoryId = "+categoryId+" and b.status = 'active' ",{ type: Sequelize.QueryTypes.SELECT });
					
					productList = await sequelize.query(
							"select a.productId, a.categoryId, b.slug, b.id, b.title, b.price, b.specialPrice, b.size, b.weight "+
							"from productCategory as a "+
							"left join products as b on b.id=a.productId "+
							"WHERE a.storeId = "+storeId+" and b.isConfigurable=0 and a.categoryId='"+categoryId+"' and b.status='active' ORDER BY b.`sequence` ASC LIMIT "+offset+", "+limit,{ type: Sequelize.QueryTypes.SELECT });
					
					
					if (productList.length > 0) {
		
						for(var j=0;j<productList.length;j++){

							////////////////////////// catelog price rule start /////////////////////////////////////

							if(isCatelogPriceRule == 'yes'){

								var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productList[j].id, productList[j].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
			
								var discountPrice = productCatalogPriceDetails.discountPrice;
								var discountTag = productCatalogPriceDetails.discountTag;
			
							} else {
								var discountPrice = null;
								var discountTag = null;
							}

							////////////////////////// catelog price rule end /////////////////////////////////////
		
							let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productList[j].id}});
		
							let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId:productList[j].id}, order: [['id', 'DESC']]})
		
							let stockQuantity
							if(stockDetails.length >= 1){
								stockQuantity = stockDetails[0].stock
							}else{
								stockQuantity = 0
							}
		
							if(productImages.length>0){
								var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
							} else {
								var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
							}

							if(customerId && customerId != null && customerId != ''){
								let customerProductinCart = await models.carts.findAll({attributes:['id','itemQuantity'],where:{productId:productList[j].id,customerId:customerId,storeId:storeId}});

								if(customerProductinCart.length>0){
									var productInCart = true;
									var item_quantity = customerProductinCart[0].itemQuantity;
								} else {
									var productInCart = false;
									var item_quantity = 0;
								}
							} else {
								var productInCart = false;
								var item_quantity = 0;
							}

							// let configurableProduct = await models.products.findAll({attributes:['id','price','slug','weight'],where:{isConfigurable:productList[j].id}});

							// if(configurableProduct.length>0){
							// 	var isConfigurable = true;
							// 	var configurableProductList = configurableProduct;
							// } else {
							// 	var isConfigurable = false;
							// 	var configurableProductList = [];
							// }

							// ////////////////////////////////// option product start //////////////////
							let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:productList[j].id, storeId:storeId}});

							if(optionProductDetails.length>0){
								if(optionProductDetails[0].optionId && optionProductDetails[0].optionId != '' && optionProductDetails[0].optionId != null) {
									let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
									if(optionValueList.length>0){
										var isConfigurable = true;
									} else {
										var isConfigurable = true;
									}
									var configurableProductList = optionValueList;
								} else {
									var isConfigurable = false;
									var configurableProductList = [];
								}
							} else {
								var isConfigurable = false;
								var configurableProductList = [];
							}
							// ////////////////////////////////// option product end //////////////////
		
							productArray.push({
								"productId":productList[j].productId,
								"categoryId":productList[j].categoryId,
								"id":productList[j].id,
								"slug":productList[j].slug,
								"title":productList[j].title,
								"price":productList[j].price,
								"stock": stockQuantity,
								"specialPrice":productList[j].specialPrice,
								"size":productList[j].size,
								"productInCart":productInCart,
								"item_quantity":item_quantity,
								"isConfigurable":isConfigurable,
								"configurableProduct":configurableProductList,
								"images": product_images,
								"discountPrice": discountPrice,
								"discountTag": discountTag
							});
						}
						res.status(200).send({ data:{success : true, value: productArray, category_title: category[0].title, total_product_count: product_count.length, categoryTitle: category[0].title, categorySlug: category[0].slug, categoryId: category[0].id },errorNode:{errorCode:0, errorMsg:"No Error"}});
					} else {
						res.status(200).send({ data:{success : false, message: "No product found"} ,errorNode:{errorCode:0, errorMsg:"No Error"}});
					}
				} else {
					res.status(200).send({ data:{success : false, message: "Slug is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
				}
			}
			
		
			// if (slug && slug !='') {
		
			// 	var category = await sequelize.query("select id,title from categories where slug='" + slug + "'",{ type: Sequelize.QueryTypes.SELECT });
			// 	var categoryId = category[0].id;
			// 	var product_count = await sequelize.query("select a.id, a.categoryId, b.slug, b.id, b.title from productCategory as a left join products as b on b.id = a.productId WHERE b.isConfigurable = 0 and a.categoryId = "+categoryId+" and b.status = 'active' ",{ type: Sequelize.QueryTypes.SELECT });
				
			// 	productList = await sequelize.query(
			// 			"select a.productId, a.categoryId, b.slug, b.id, b.title, b.price, b.specialPrice, b.size "+
			// 			"from productCategory as a "+
			// 			"left join products as b on b.id=a.productId "+
			// 			"WHERE b.isConfigurable=0 and a.categoryId='"+categoryId+"' and b.status='active' ORDER BY b.`id` DESC LIMIT "+offset+", "+limit,{ type: Sequelize.QueryTypes.SELECT });
				
				
			// 	if (productList.length > 0) {

			// 		for(var j=0;j<productList.length;j++){

			// 			let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productList[j].id}});

			// 			let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId:productList[j].id}, order: [['id', 'DESC']]})

			// 			let stockQuantity
			// 			if(stockDetails.length >= 1){
			// 				stockQuantity = stockDetails[0].stock
			// 			}else{
			// 				stockQuantity = 0
			// 			}

			// 			if(productImages.length>0){
			// 				var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
			// 			} else {
			// 				var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
			// 			}

			// 			productArray.push({
			// 				"productId":productList[j].productId,
			// 				"categoryId":productList[j].categoryId,
			// 				"id":productList[j].id,
			// 				"slug":productList[j].slug,
			// 				"title":productList[j].title,
			// 				"price":productList[j].price,
			// 				"stock": stockQuantity,
			// 				"specialPrice":productList[j].specialPrice,
			// 				"size":productList[j].size,
			// 				"images": product_images
			// 			});
			// 		}
			// 		res.status(200).send({ data:{success : true, value: productArray, category_title: category[0].title, total_product_count: product_count.length },errorNode:{errorCode:0, errorMsg:"No Error"}});
			// 	} else {
			// 		res.status(200).send({ data:{success : false, message: "No product found"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
			// 	}
			// } else {
			// 	res.status(200).send({ data:{success : false, message: "Slug is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
			// }
		}else{
			res.status(200).send({ data:{success : false, message: "Slug is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
		}
	}else{
		res.status(200).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	}
};


function yyyy_mm_dd() {
    now = new Date();
    year = "" + now.getFullYear();
    month = "" + (now.getMonth() + 1);
    if (month.length == 1) {
      month = "0" + month;
    }
    day = "" + now.getDate();
    if (day.length == 1) {
      day = "0" + day;
    }
    hour = "" + now.getHours();
    if (hour.length == 1) {
      hour = "0" + hour;
    }
    minute = "" + now.getMinutes();
    if (minute.length == 1) {
      minute = "0" + minute;
    }
    second = "" + now.getSeconds();
    if (second.length == 1) {
      second = "0" + second;
    }
    return year + "-" + month + "-" + day;
}


/*******************************brand wise product details start*************************/
exports.brandWiseProductDetails = async function(req,res){

	var storeId = req.body.data.storeId;
	var slug = req.body.data.slug;
	var limit = req.body.data.limit ? req.body.data.limit : 9 ;
	var page_number = req.body.data.page_number ? req.body.data.page_number : 1;
	var productArray = [];

	if(storeId && storeId != ''){
		if(slug && slug != ''){
			var brandId = await models.brands.findAll({where:{slug:slug, storeId:storeId}});
			// var allProduct = await models.product.count({where:{brand:brandId[0].brand_id,is_configurable:0}});
			var allProduct = await sequelize.query("SELECT products.id,products.title FROM `products` where products.storeId = "+storeId+" and products.brand = "+brandId[0].id+" and products.isConfigurable = 0 ",{ type: Sequelize.QueryTypes.SELECT });
			if(brandId.length > 0){
	
				if(page_number == 1){
					var offset = 0;
				}else{
					var offset = ((page_number)-1)*limit;
				}
		
				var product_details = await sequelize.query("SELECT products.id,products.title,products.price,products.specialPrice,products.slug FROM `products` where products.storeId = "+storeId+" and products.brand = "+brandId[0].id+" and products.isConfigurable = 0 LIMIT "+offset+","+limit+"",{ type: Sequelize.QueryTypes.SELECT });
				if(product_details.length > 0){

					////////////////////////// catelog price rule start /////////////////////////////////////
					var catelogPriceCurrentDate = yyyy_mm_dd();
					var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
					if(catelogPriceRuleDetails.length>0){
						var isCatelogPriceRule = 'yes';
					} else {
						var isCatelogPriceRule = 'no';
					}
					////////////////////////// catelog price rule end /////////////////////////////////////

					for(var j=0;j<product_details.length;j++){

						////////////////////////// catelog price rule start /////////////////////////////////////

						if(isCatelogPriceRule == 'yes'){

							var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, product_details[j].id, product_details[j].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

							var discountPrice = productCatalogPriceDetails.discountPrice;
							var discountTag = productCatalogPriceDetails.discountTag;

						} else {
							var discountPrice = null;
							var discountTag = null;
						}

						////////////////////////// catelog price rule end /////////////////////////////////////

						let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:product_details[j].id}});
						if(productImages.length>0){
							var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
						} else {
							var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
						}

						let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId: product_details[j].id}, order: [['id', 'DESC']]})

						let stockQuantity
						if(stockDetails.length >= 1){
							stockQuantity = stockDetails[0].stock
						}else{
							stockQuantity = 0
						}
	
						productArray.push({
							"id":product_details[j].id,
							"slug":product_details[j].slug,
							"title":product_details[j].title,
							"price":product_details[j].price,
							"stock": stockQuantity,
							"specialPrice":product_details[j].specialPrice,
							"icon": product_images,
							"discountPrice": discountPrice,
						"discountTag": discountTag,
						});
					}

					// res.status(200).send({ success: true, product_details:product_details, allProduct:allProduct.length});  
					res.status(200).send({ data:{success : true, product_details:productArray, allProduct:allProduct.length },errorNode:{errorCode:0, errorMsg:"No Error"}});
				}else{
					// res.status(200).send({ success: false, message:"No product found."});  
					res.status(200).send({ data:{success : false, message: "No product found."} ,errorNode:{errorCode:0, errorMsg:"Error"}});
				}
			}else{
				// res.status(200).send({ success: false, message:"No product found."});  
				res.status(200).send({ data:{success : false, message: "No product found."} ,errorNode:{errorCode:1, errorMsg:"Error"}});
			}
		}else{
			res.status(200).send({ data:{success : false, message: "slug is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
		}
	}else{
		res.status(200).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	}
} 
/*******************************brand wise product details ends*************************/





/*********************************** filter product list latest start *********************************************/

// exports.zbrdstfilterProductList = async function(req,res){
//  	var storeId = req.body.data.storeId;
// 	var option_value = req.body.data.option_value;
// 	var customerId = req.body.data.customerId;
// 	var value = [];
// 	var resultArray = [];
// 	var arr = [];
// 	var option_value_arr = [];
// 	var categoryArray = [];
  
// 	// ///////////////// option value checked start /////////////
// 	if(option_value && option_value !='' && option_value != null){
// 	  var option_value_arr = req.body.data.option_value.split(",");
// 	}
// 	var option_title = 'Veg Only,New Arrivals';
// 	var option_titlearr = option_title.split(",");
// 	option_titlearr.forEach(async function(opt){
// 	  var slugify = opt.toString().toLowerCase().replace(/\s+/g, '_');
// 	  if(option_value_arr.length > 0){
// 		for(var j=0; j < option_value_arr.length; j++){
// 		  if(slugify == option_value_arr[j]){
// 			var is_checked = 'true';
// 			break;
// 		  } else {
// 			var is_checked = 'false';
// 		  }
// 		}
// 	  } else {
// 		var is_checked = 'false';
// 	  }
// 	  arr.push({
// 		"title":opt,
// 		"is_checked":is_checked,
// 		"slug" : slugify
// 	  });
// 	})
// 	// ///////////////// option value checked end /////////////
  
// 	// ///////////////// filter wise product start /////////////
  
// 	// ////// option value search dynamic start ///////////////
// 	if(option_value !='' && option_value != null){
// 	  var option_value_arr = req.body.data.option_value.split(",");
// 	  var multiOptionValue = ''
  
// 	  if(option_value_arr.length == 1){
// 		option_valuestr = "and b."+option_value_arr[0]+" = 'yes'";
// 	  }else{
// 		var i=0; 
// 		option_value_arr.forEach(async function(ov){
// 		  multiOptionValue += "and b."+option_value_arr[i]+" = 'yes' ";
// 		  i++;
// 		}, this);
// 		var option_valuestr = multiOptionValue.slice(0,-1);
// 	  }
// 	} else {
// 	  var option_valuestr = '';
// 	}
// 	// ////// option value search dynamic end ///////////////
  
// 	// ///////////////////////////// castomer wise cart filter product start //////////////////
  
// 	var cat_wise_product_list = [];
// 	var product_list = [];
// 	var value = [];
// 	var cat_wise_product = '';
  
// 	// var category = await sequelize.query("select id, title, slug from categories where storeId = "+storeId+" and status = 'Yes' order by position ASC" ,{ type: Sequelize.QueryTypes.SELECT })
// 	var category = await models.categories.findAll({attributes: ['id','storeId','title','status','slug'], where : {storeId : storeId, status : 'Yes'}, order: [['title', 'ASC']]})
// 	if(category.length > 0){
// 	  console.log('11111111111111111111');
// 	  if (customerId && customerId !='') {
// 		var customer_cart_list = await sequelize.query("select id, customer_id, product_id, item_quantity from cart where customer_id =" + customerId,{ type: Sequelize.QueryTypes.SELECT });
// 		var customer_favourite_product_list = await sequelize.query("select favouriteProduct.id, products.id, products.title, products.shortDescription, productCategory.categoryId, products.price, products.bestSellers, products.newArrivals, products.isConfigurable, products.slug, 'true' as customer_favourite_product, 'false' as product_in_cart, 0 as itemQuantity, siteSettings.maxProAvailability from favouriteProduct left join products on products.id = favouriteProduct.productId left join siteSettings on siteSettings.id = 1 left join productCategory on productCategory.productId = product.id where products.isConfigurable = 0 and favouriteProduct.customerId = " + customerId,{ type: Sequelize.QueryTypes.SELECT });
		
// 		  //////////////// for customer favourite start //////////////////
// 		  if (customer_favourite_product_list.length > 4) {
// 			var value = [];
// 			  for(var a=0; a < customer_favourite_product_list.length; a++){
  
				
  
// 				/**
// 				 * check if any configurable and addon product avaiable
// 				 */
// 				var is_configurable_flag = '';
// 				var addon_flug = '';             
// 				var checkConfg = await models.products.findOne({attributes: ["id", "title"], where:{isConfigurable : customer_favourite_product_list[a].id, storeId : storeId}});
// 				if(checkConfg){
// 				  is_configurable_flag = 'Yes';
// 				}else{
// 				  is_configurable_flag = 'No';
// 				}
// 				var checkAddOn  = await models.related_product.findOne({attributes: ["id", "p_id","selected_id"], where:{type : 'Add-on', p_id:customer_favourite_product_list[a].id}});
// 				if(checkAddOn){
// 				  addon_flug = 'Yes';
// 				}else{
// 				  addon_flug = 'No';
// 				}
  
// 				if (customer_cart_list.length > 0) {
// 				  for(var i=0; i < customer_cart_list.length; i++){
// 					if(customer_favourite_product_list[a].id == customer_cart_list[i].product_id){
// 					  var product_in_cart = 'true';
// 					  var item_quantity = customer_cart_list[i].item_quantity;
// 					  break;
// 					} else {
// 					  var product_in_cart = 'false';
// 					  var item_quantity = 0;
// 					}
// 				  }
// 				} else {
// 				  var product_in_cart = 'false';
// 				  var item_quantity = 0;
// 				}
  
// 				value.push({
// 				  "product_id": customer_favourite_product_list[a].id,
// 				  "category_id": customer_favourite_product_list[a].category_id,
// 				  "slug": customer_favourite_product_list[a].slug,
// 				  "id":customer_favourite_product_list[a].id,
// 				  "title": customer_favourite_product_list[a].title,
// 				  "price": customer_favourite_product_list[a].price,
// 				  "veg_only": customer_favourite_product_list[a].veg_only,
// 				  "short_description": customer_favourite_product_list[a].short_description,
// 				  "best_sellers": customer_favourite_product_list[a].best_sellers,
// 				  "spicy": customer_favourite_product_list[a].spicy,
// 				  "new_arrivals": customer_favourite_product_list[a].new_arrivals,
// 				  "product_in_cart": product_in_cart,
// 				  "customer_favourite_product": customer_favourite_product_list[a].customer_favourite_product,
// 				  "item_quantity": item_quantity,
// 				  "max_pro_availability": customer_favourite_product_list[a].max_pro_availability,
// 				  "addon_product": [],
// 				  "is_configurable_flag" : is_configurable_flag,
// 				  "addon_flug" : addon_flug
  
// 				});
// 			  }
  
// 			  cat_wise_product_list.push({
// 				id: '',
// 				title: 'My Favourite',
// 				slug: 'my_favourite',
// 				is_active: 'false',
// 				product_list:value
// 			  });
  
// 			  // ///////////////////////// left menu category filter list start /////////////////////
// 			  categoryArray.push({
// 				id: '',
// 				title: 'My Favourite',
// 				slug: 'my_favourite',
// 				is_active: 'false',
// 			  });
// 			  // ///////////////////////// left menu category filter list start /////////////////////
// 		  } else {
// 			var cat_wise_product_list = [];
// 		  }
  
// 		  ///////////////////for customer favourite end //////////////////
  
// 		  //////////////// for best seller start //////////////////
// 		  var value = [];
// 		  var best_selling_product = await sequelize.query(
// 			"select b.id as product_id, product_category.category_id, b.slug, b.id, b.title, b.price, b.veg_only, b.short_description, b.best_sellers, b.spicy, b.new_arrivals, b.description, "+
// 			"CONCAT('"+req.app.locals.baseurl+"superpos/myimages/product/icon/', IFNULL(b.icon, 'superpos/no-product-image.jpg')) as icon, "+
// 			"'false' as product_in_cart, "+
// 			"'false' as customer_favourite_product, "+
// 			"0 as item_quantity, "+
// 			"c.max_pro_availability "+
// 			"from product as b "+
// 			"left join site_settings as c on c.id=1 "+
// 			"left join product_category on product_category.product_id = b.id "+
// 			"WHERE b.best_sellers = 'yes' and b.is_configurable = 0 and b.status='active' "+option_valuestr+"",{ type: Sequelize.QueryTypes.SELECT })
// 			console.log('44444444444444444444444444444444444444======='+best_selling_product.length);
// 		  if (best_selling_product.length > 0) {
  
// 			for(var a=0; a < best_selling_product.length; a++){
  
				
  
// 			  /**
// 			   * check if any configurable and addon product avaiable
// 			   */
// 			  var is_configurable_flag = '';
// 			  var addon_flug = '';             
// 			  var checkConfg = await models.product.findOne({attributes: ["id", "title"], where:{is_configurable : best_selling_product[a].id}});
// 			  if(checkConfg){
// 				is_configurable_flag = 'Yes';
// 			  }else{
// 				is_configurable_flag = 'No';
// 			  }
// 			  var checkAddOn  = await models.related_product.findOne({attributes: ["id", "p_id","selected_id"], where:{type : 'Add-on', p_id:best_selling_product[a].id}});
// 			  if(checkAddOn){
// 				addon_flug = 'Yes';
// 			  }else{
// 				addon_flug = 'No';
// 			  }
  
// 			  if (customer_favourite_product_list.length > 0) {
// 				for(var k=0; k < customer_favourite_product_list.length; k++){
// 				  if(best_selling_product[a].id == customer_favourite_product_list[k].product_id){
// 					var customer_favourite_product = 'true';
// 					break;
// 				  } else {
// 					var customer_favourite_product = 'false';
// 				  }
// 				}
  
// 			  } else {
// 				var customer_favourite_product = 'false';
// 			  }
  
// 			  if (customer_cart_list.length > 0) {
// 				for(var i=0; i < customer_cart_list.length; i++){
// 				  if(best_selling_product[a].id == customer_cart_list[i].product_id){
// 					var product_in_cart = 'true';
// 					var item_quantity = customer_cart_list[i].item_quantity;
// 					break;
// 				  } else {
// 					var product_in_cart = 'false';
// 					var item_quantity = 0;
// 				  }
// 				}
// 			  } else {
// 				var product_in_cart = 'false';
// 				var item_quantity = 0;
// 			  }
  
// 			  value.push({
// 				"product_id": best_selling_product[a].product_id,
// 				"category_id": best_selling_product[a].category_id,
// 				"slug": best_selling_product[a].slug,
// 				"id":best_selling_product[a].id,
// 				"title": best_selling_product[a].title,
// 				"price": best_selling_product[a].price,
// 				"veg_only": best_selling_product[a].veg_only,
// 				"short_description": best_selling_product[a].short_description,
// 				"best_sellers": best_selling_product[a].best_sellers,
// 				"spicy": best_selling_product[a].spicy,
// 				"new_arrivals": best_selling_product[a].new_arrivals,
// 				"product_in_cart": product_in_cart,
// 				"customer_favourite_product": customer_favourite_product,
// 				"item_quantity": item_quantity,
// 				"max_pro_availability": best_selling_product[a].max_pro_availability,
// 				"addon_product": [],
// 				"is_configurable_flag" : is_configurable_flag,
// 				"addon_flug" : addon_flug
// 			  });
// 			}
  
// 			cat_wise_product_list.push({
// 			  id: '',
// 			  title: 'Best Sellers',
// 			  slug: 'best_sellers',
// 			  is_active: 'false',
// 			  product_list:value
// 			});
// 			// ///////////////////////// left menu category filter list start /////////////////////
// 			categoryArray.push({
// 			  id: '',
// 			  title: 'Best Sellers',
// 			  slug: 'best_sellers',
// 			  is_active: 'false',
// 			});
// 			// ///////////////////////// left menu category filter list start /////////////////////
// 		  } else {
// 			if(cat_wise_product_list.length > 0){
// 			  var cat_wise_product_list = cat_wise_product_list;
// 			} else {
// 			  var cat_wise_product_list = [];
// 			}
// 			// var cat_wise_product_list = [];
// 		  }
  
// 		  ///////////////////for best seller end //////////////////
  
// 		  for(var j=0; j < category.length; j++){
// 			var value = [];
// 			console.log('000000000000000000000'+category[j].id);
// 			cat_wise_product = await sequelize.query(
// 			  "select b.id as product_id, pc.category_id, b.slug, b.id, b.title, b.price, b.veg_only, b.short_description, b.best_sellers, b.spicy, b.new_arrivals, "+
// 			  "CONCAT('"+req.app.locals.baseurl+"superpos/myimages/product/icon/', IFNULL(b.icon, 'superpos/no-product-image.jpg')) as icon, "+
// 			  "'false' as product_in_cart, "+
// 			  "0 as item_quantity, "+
// 			  "c.max_pro_availability "+
// 			  "from product_category as pc "+
// 			  "left join product as b on b.id=pc.product_id "+
// 			  "left join site_settings as c on c.id=1 "+
// 			  "WHERE pc.category_id='"+category[j].id+"' and b.is_configurable = 0 and b.status='active' "+option_valuestr+"",{ type: Sequelize.QueryTypes.SELECT });
  
// 			if(cat_wise_product.length > 0){
			  
// 			  for(var a=0; a < cat_wise_product.length; a++){
  
				
  
// 				if (customer_favourite_product_list.length > 0) {
// 				  for(var k=0; k < customer_favourite_product_list.length; k++){
// 					if(cat_wise_product[a].id == customer_favourite_product_list[k].product_id){
// 						var customer_favourite_product = 'true';
// 						break;
// 					} else {
// 						var customer_favourite_product = 'false';
// 					}
// 				  }
  
// 				} else {
// 					var customer_favourite_product = 'false';
// 				}
  
// 				if (customer_cart_list.length > 0) {
// 				  for(var i=0; i < customer_cart_list.length; i++){
// 					if(cat_wise_product[a].id == customer_cart_list[i].product_id){
// 					  var product_in_cart = 'true';
// 					  var item_quantity = customer_cart_list[i].item_quantity;
// 					  break;
// 					} else {
// 					  var product_in_cart = 'false';
// 					  var item_quantity = 0;
// 					}
// 				  }
// 				} else {
// 				  var product_in_cart = 'false';
// 				  var item_quantity = 0;
// 				}
  
// 				  /**
// 				   * check if any configurable and addon product avaiable
// 				   */
// 				  var is_configurable_flag = '';
// 				  var addon_flug = '';             
// 				  var checkConfg = await models.product.findOne({attributes: ["id", "title"], where:{is_configurable : cat_wise_product[a].id}});
// 				  if(checkConfg){
// 					is_configurable_flag = 'Yes';
// 				  }else{
// 					is_configurable_flag = 'No';
// 				  }
// 				  var checkAddOn  = await models.related_product.findOne({attributes: ["id", "p_id","selected_id"], where:{type : 'Add-on', p_id:cat_wise_product[a].id}});
// 				  if(checkAddOn){
// 					addon_flug = 'Yes';
// 				  }else{
// 					addon_flug = 'No';
// 				  }
  
// 				value.push({
// 				  "product_id": cat_wise_product[a].product_id,
// 				  "category_id": cat_wise_product[a].category_id,
// 				  "slug": cat_wise_product[a].slug,
// 				  "id":cat_wise_product[a].id,
// 				  "title": cat_wise_product[a].title,
// 				  "price": cat_wise_product[a].price,
// 				  "veg_only": cat_wise_product[a].veg_only,
// 				  "short_description": cat_wise_product[a].short_description,
// 				  "best_sellers": cat_wise_product[a].best_sellers,
// 				  "spicy": cat_wise_product[a].spicy,
// 				  "new_arrivals": cat_wise_product[a].new_arrivals,
// 				  "product_in_cart": product_in_cart,
// 				  "customer_favourite_product": customer_favourite_product,
// 				  "item_quantity": item_quantity,
// 				  "max_pro_availability": cat_wise_product[a].max_pro_availability,
// 				  "addon_product": [],
// 				  "is_configurable_flag" : is_configurable_flag,
// 				  "addon_flug" : addon_flug
// 				});
// 			  }
  
// 			  cat_wise_product_list.push({
// 				id: category[j].id,
// 				title: category[j].title,
// 				slug: category[j].slug,
// 				is_active: 'false',
// 				product_list:value
// 			  });
  
// 			  // ///////////////////////// left menu category filter list start /////////////////////
// 			  categoryArray.push({
// 				id: category[j].id,
// 				title: category[j].title,
// 				slug: category[j].slug,
// 				is_active: 'false',
// 			  });
// 			  // ///////////////////////// left menu category filter list start /////////////////////
  
// 			} 
			
// 		  }
  
// 		var product_list = cat_wise_product_list;
// 	  } else {
  
// 		//////////////// for best seller start //////////////////
	
// 		var value = [];
// 		var best_selling_product = await sequelize.query(
// 		  "select b.id as productId, productCategory.categoryId, b.slug, b.id, b.title, b.price, b.shortDescription, b.best_sellers, b.spicy, b.new_arrivals, b.description, "+
// 		  "CONCAT('"+req.app.locals.baseurl+"superpos/myimages/product/icon/', IFNULL(b.icon, 'superpos/no-product-image.jpg')) as icon, "+
// 		  "'false' as product_in_cart, "+
// 		  "'false' as customer_favourite_product, "+
// 		  "0 as item_quantity, "+
// 		  "c.max_pro_availability "+
// 		  "from product as b "+
// 		  "left join site_settings as c on c.id=1 "+
// 		  "left join product_category on product_category.product_id = b.id "+
// 		  "WHERE b.best_sellers = 'yes' and b.is_configurable = 0 and b.status='active' "+option_valuestr+"",{ type: Sequelize.QueryTypes.SELECT })
  
// 		if (best_selling_product.length > 0) {
  
// 			for(var a=0; a < best_selling_product.length; a++){
  
  
// 			  /**
// 			   * check if any configurable and addon product avaiable
// 			   */
// 			  var is_configurable_flag = '';
// 			  var addon_flug = '';             
// 			  var checkConfg = await models.products.findOne({attributes: ["id", "title"], where:{isConfigurable : best_selling_product[a].id}});
// 			  if(checkConfg){
// 				is_configurable_flag = 'Yes';
// 			  }else{
// 				is_configurable_flag = 'No';
// 			  }
// 			  var checkAddOn  = await models.related_product.findOne({attributes: ["id", "p_id","selected_id"], where:{type : 'Add-on', p_id:best_selling_product[a].id}});
// 			  if(checkAddOn){
// 				addon_flug = 'Yes';
// 			  }else{
// 				addon_flug = 'No';
// 			  }
  
// 			  value.push({
// 				"productId": best_selling_product[a].productId,
// 				"categoryId": best_selling_product[a].categoryId,
// 				"slug": best_selling_product[a].slug,
// 				"id":best_selling_product[a].id,
// 				"title": best_selling_product[a].title,
// 				"price": best_selling_product[a].price,
// 				"veg_only": best_selling_product[a].veg_only,
// 				"shortDescription": best_selling_product[a].shortDescription,
// 				"bestSellers": best_selling_product[a].bestSellers,
// 				"spicy": best_selling_product[a].spicy,
// 				"newArrivals": best_selling_product[a].newArrivals,
// 				"productInCart": best_selling_product[a].productInCart,
// 				"customerFavouriteProduct": best_selling_product[a].customer_favourite_product,
// 				"itemQuantity": best_selling_product[a].item_quantity,
// 				"maxProAvailability": best_selling_product[a].maxProAvailability,
// 				"addon_product": [],
// 				"is_configurable_flag" : is_configurable_flag,
// 				"addon_flug" : addon_flug
// 			  });
// 			}
  
// 		  cat_wise_product_list.push({
// 			id: '',
// 			title: 'Best Sellers',
// 			slug: 'best_sellers',
// 			is_active: 'false',
// 			product_list:value
// 		  });
  
// 		  // ///////////////////////// left menu category filter list start /////////////////////
// 		  categoryArray.push({
// 			id: '',
// 			title: 'Best Sellers',
// 			slug: 'best_sellers',
// 			is_active: 'false',
// 		  });
// 		  // ///////////////////////// left menu category filter list start /////////////////////
  
// 		} else {
// 		  var cat_wise_product_list = [];
// 		}
  
// 		///////////////////for best seller end //////////////////
  
// 		for(var j=0; j < category.length; j++){
  
// 		  var value = [];
// 		  console.log('999999999999999999999'+category[j].id);
// 		  var cat_wise_product = await sequelize.query(
// 			"select b.id as product_id, pc.category_id, b.slug, b.id, b.title, b.price, b.veg_only, b.short_description, b.best_sellers, b.new_arrivals, b.description, "+
// 			"CONCAT('"+req.app.locals.baseurl+"superpos/myimages/product/icon/', IFNULL(b.icon, 'superpos/no-product-image.jpg')) as icon, "+
// 			"'false' as product_in_cart, "+
// 			"'false' as customer_favourite_product, "+
// 			"0 as item_quantity, "+
// 			"c.max_pro_availability "+
// 			"from product_category as pc "+
// 			"left join product as b on b.id=pc.product_id "+
// 			"left join site_settings as c on c.id=1 "+
// 			"WHERE pc.category_id='"+category[j].id+"' and b.is_configurable = 0 and b.status='active' "+option_valuestr+"",{ type: Sequelize.QueryTypes.SELECT });
  
// 		  if (cat_wise_product.length > 0) {
  
// 			for(var a=0; a < cat_wise_product.length; a++){
  
// 			  /**
// 			   * check if any configurable and addon product avaiable
// 			   */
// 			  var is_configurable_flag = '';
// 			  var addon_flug = '';             
// 			  var checkConfg = await models.product.findOne({attributes: ["id", "title"], where:{is_configurable : cat_wise_product[a].id}});
// 			  if(checkConfg){
// 				is_configurable_flag = 'Yes';
// 			  }else{
// 				is_configurable_flag = 'No';
// 			  }
// 			  var checkAddOn  = await models.related_product.findOne({attributes: ["id", "p_id","selected_id"], where:{type : 'Add-on', p_id:cat_wise_product[a].id}});
// 			  if(checkAddOn){
// 				addon_flug = 'Yes';
// 			  }else{
// 				addon_flug = 'No';
// 			  }
  
// 			  value.push({
// 				"product_id": cat_wise_product[a].product_id,
// 				"category_id": cat_wise_product[a].category_id,
// 				"slug": cat_wise_product[a].slug,
// 				"id":cat_wise_product[a].id,
// 				"title": cat_wise_product[a].title,
// 				"price": cat_wise_product[a].price,
// 				"veg_only": cat_wise_product[a].veg_only,
// 				"short_description": cat_wise_product[a].short_description,
// 				"best_sellers": cat_wise_product[a].best_sellers,
// 				"spicy": cat_wise_product[a].spicy,
// 				"new_arrivals": cat_wise_product[a].new_arrivals,
// 				"product_in_cart": cat_wise_product[a].product_in_cart,
// 				"customer_favourite_product": cat_wise_product[a].customer_favourite_product,
// 				"item_quantity": cat_wise_product[a].item_quantity,
// 				"max_pro_availability": cat_wise_product[a].max_pro_availability,
// 				"addon_product": [],
// 				"is_configurable_flag" : is_configurable_flag,
// 				"addon_flug" : addon_flug
// 			  });
// 			}
  
// 			cat_wise_product_list.push({
// 			  id: category[j].id,
// 			  title: category[j].title,
// 			  slug: category[j].slug,
// 			  is_active: 'false',
// 			  product_list:value
// 			});
  
// 			 // ///////////////////////// left menu category filter list start /////////////////////
// 			 categoryArray.push({
// 			  id: category[j].id,
// 			  title: category[j].title,
// 			  slug: category[j].slug,
// 			  is_active: 'false',
// 			});
// 			// ///////////////////////// left menu category filter list start /////////////////////
  
// 		  }
		  
// 		}
// 		var product_list = cat_wise_product_list;
		
// 	  }
  
// 	  if (product_list.length > 0) {
	  
// 		res.status(200).send({status: 200, success: true, message: "Product found", value: product_list, category_list: categoryArray, option_value_arr:arr });
// 	  } else {
// 		res.status(200).send({status: 200, success: false, message: "No product found", value: [], category_list: categoryArray, option_value_arr:arr });
// 	  }
  
// 	  // ///////////////// filter wise product end /////////////
// 	} else {
// 	  res.status(200).send({status: 200, success: false, message: "No Category found", value: [], category_list: [], option_value_arr:[] });
// 	}
//   }
  
exports.zbrdstfilterProductList_bkp = async function(req, res, next) {
	const storeId = req.body.data.storeId || ''
	const customerId = req.body.data.customerId || ''
	const vegOnly = req.body.data.vegOnly || ''
	const newArrival = req.body.data.newArrival || ''

	
	if(storeId && storeId != '' && storeId != null && vegOnly =='' && vegOnly == 'false' && newArrival =='' && newArrival == 'false'){
	
		let categoryList = await models.categories.findAll({
			attributes:['id','title','slug','status'],
			where:{
				storeId:storeId, status: 'Yes'
			}
		})
		let mainArray = [];
		if(categoryList.length>0){
			for(let i=0;i<categoryList.length;i++){
				let catId = categoryList[i].id;
				let productArray = [];
				let productList = await models.productCategory.findAll({
					attributes:['id'],
					where: {
						storeId:storeId,categoryId:catId					
					},
					include:[{
							model:models.products,
							attributes:['id','storeId','slug', 'title', 'shortDescription', 'price','bestSellers','newArrivals','specialPrice','size','brand'],
							where:{storeId:storeId},
						}]
				});
				 
				if(productList.length>0){
					for(let j=0;j<productList.length;j++){
						let productCartFlag = "false";
						let item_quantity =0;
						let customer_favourute_product = "false";
						if(customerId && customerId!='' && customerId!=null){
							let cartdata = await models.carts.findAll({attributes:['id','itemQuantity'],where:{productId:productList[j].id,storeId:storeId,customerId:customerId}});

							if(cartdata.length>0){
								productCartFlag = "true";
								item_quantity = cartdata[0].itemQuantity;
							}

							const favouriteProduct = await models.favouriteProduct.findAll({where:{productId: productList[j].id, customerId: customerId}})

							if(favouriteProduct.length > 0){
								customer_favourute_product = "true"
							}else{
								customer_favourute_product = "false"
							}
						}
						
						let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productList[j].product.id}});
						let product_images
						if(productImages.length>0){
							product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
						} else {
							product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
						}

						let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId: productList[j].product.id}, order: [['id', 'DESC']]})

						let stockQuantity
						if(stockDetails.length >= 1){
							stockQuantity = stockDetails[0].stock
						}else{
							stockQuantity = 0
						}

						productArray.push({
								"product_id":productList[j].product.id,
								"category_id":productList[j].id,
								"slug":productList[j].product.slug,
								"product_in_cart": productCartFlag,
								"item_quantity": item_quantity,
								"total_quantity": productList[j].dataValues.itemQuantity==null?'0':productList[j].dataValues.itemQuantity,
								"title":productList[j].product.title,
								"price":productList[j].product.price,
								"stock": stockQuantity,
								"short_description":productList[j].product.shortDescription,
								"best_sellers":productList[j].product.bestSellers,
								"new_arrivals":productList[j].product.newArrivals,
								"brand":productList[j].product.brand,
								"customer_favourute_product": customer_favourute_product,
								"images": product_images
							});
						
					}
				}
				//console.log(productArray); return false;

				mainArray.push({
					"title":categoryList[i].title,
					"slug":categoryList[i].slug,
					"is_active":categoryList[i].status,
					"product_list":productArray
				});
				// console.log(mainArray);return false;
			}
		}
		if(mainArray.length>0){
			return res.status(200).send({ data:{success:true, details:mainArray}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}else{
			return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}
	} else if(storeId && storeId != '' && storeId != null && vegOnly && vegOnly == 'true' && vegOnly && newArrival == 'false' && newArrival ==''){
	
		let categoryList = await models.categories.findAll({
			attributes:['id','title','slug','status'],
			where:{
				storeId:storeId,
			}
		});//console.log(categoryList);return false;
		let mainArray = [];
		if(categoryList.length>0){
			for(let i=0;i<categoryList.length;i++){
				let catId = categoryList[i].id;
				
				// let attributevalue = await models.attributevalue.findAll({attirbutes:['attrName'],where:{value : ['veg','Veg'], storeId : storeId}})
				// let attributeName
				// if(attributevalue.length > 0){
				// 	attributeName =  attributevalue[0].attrName
				// }else{
				// 	attributeName = 'attr1'
				// }
				

				let productArray = [];
				let productList = await models.productCategory.findAll({attributes:['id'],where: {storeId:storeId,categoryId:catId},include:[{model:models.products,where:{storeId:storeId, attr1 : ['veg','Veg']}}]})
				 
				if(productList.length>0){
					for(let j=0;j<productList.length;j++){
						let productCartFlag = "false";
						let item_quantity =0;
						let customer_favourute_product = "false";
						if(customerId && customerId!='' && customerId!=null){
							let cartdata = await models.carts.findAll({attributes:['id','itemQuantity'],where:{productId:productList[j].id,storeId:storeId,customerId:customerId}});

							if(cartdata.length>0){
								console.log(cartdata);
								productCartFlag = "true";
								item_quantity = cartdata[0].itemQuantity;
							} 

							const favouriteProduct = await models.favouriteProduct.findAll({where:{productId: productList[j].id, customerId: customerId}})

							if(favouriteProduct.length > 0){
								customer_favourute_product = "true"
							}else{
								customer_favourute_product = "false"
							}
						}

						let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productList[j].product.id}});

						let product_images
						if(productImages.length>0){
							product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
						} else {
							product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
						}

						let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId: productList[j].product.id}, order: [['id', 'DESC']]})

						let stockQuantity
						if(stockDetails.length >= 1){
							stockQuantity = stockDetails[0].stock
						}else{
							stockQuantity = 0
						}

						productArray.push({
							"product_id":productList[j].product.id,
							"category_id":productList[j].id,
							"slug":productList[j].product.slug,
							"product_in_cart": productCartFlag,
							"item_quantity": item_quantity,
							"stock": stockQuantity,
							"total_quantity": productList[j].dataValues.itemQuantity==null?'0':productList[j].dataValues.itemQuantity,
							"title":productList[j].product.title,
							"price":productList[j].product.price,
							"short_description":productList[j].product.shortDescription,
							"best_sellers":productList[j].product.bestSellers,
							"new_arrivals":productList[j].product.newArrivals,
							"brand":productList[j].product.brand,
							"customer_favourute_product": customer_favourute_product,
							"images": product_images
						});
					}
				}
				//console.log(productArray); return false;

				mainArray.push({
					"title":categoryList[i].title,
					"slug":categoryList[i].slug,
					"is_active":categoryList[i].status,
					"product_list":productArray
				});
				// console.log(mainArray);return false;
			}
		}
		if(mainArray.length>0){
			return res.status(200).send({ data:{success:true, details:mainArray}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}else{
			return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}

	}else if(storeId && storeId != '' && storeId != null && vegOnly && vegOnly == 'true' && newArrival && newArrival == 'true'){
	
		let categoryList = await models.categories.findAll({
			attributes:['id','title','slug','status'],
			where:{
				storeId:storeId,
			}
		});//console.log(categoryList);return false;
		let mainArray = [];
		if(categoryList.length>0){
			for(let i=0;i<categoryList.length;i++){
				let catId = categoryList[i].id;

				let productArray = [];
				let productList = await models.productCategory.findAll({attributes:['id'],where: {storeId:storeId,categoryId:catId},include:[{model:models.products,where:{storeId:storeId, attr1 : 'veg', newArrivals: 'yes'}}]})
				 
				if(productList.length>0){
					for(let j=0;j<productList.length;j++){
						let productCartFlag = "false";
						let item_quantity =0;
						let customer_favourute_product = "false";
						if(customerId && customerId!='' && customerId!=null){
							let cartdata = await models.carts.findAll({attributes:['id','itemQuantity'],where:{productId:productList[j].id,storeId:storeId,customerId:customerId}});

							if(cartdata.length>0){
								console.log(cartdata);
								productCartFlag = "true";
								item_quantity = cartdata[0].itemQuantity;
							} 

							const favouriteProduct = await models.favouriteProduct.findAll({where:{productId: productList[j].id, customerId: customerId}})

							if(favouriteProduct.length > 0){
								customer_favourute_product = "true"
							}else{
								customer_favourute_product = "false"
							}
						}

						let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productList[j].product.id}});

						let product_images
						if(productImages.length>0){
							product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
						} else {
							product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
						}

						let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId: productList[j].product.id}, order: [['id', 'DESC']]})

						let stockQuantity
						if(stockDetails.length >= 1){
							stockQuantity = stockDetails[0].stock
						}else{
							stockQuantity = 0
						}

						productArray.push({
							"product_id":productList[j].product.id,
							"category_id":productList[j].id,
							"slug":productList[j].product.slug,
							"product_in_cart": productCartFlag,
							"item_quantity": item_quantity,
							"stock": stockQuantity,
							"total_quantity": productList[j].dataValues.itemQuantity==null?'0':productList[j].dataValues.itemQuantity,
							"title":productList[j].product.title,
							"price":productList[j].product.price,
							"short_description":productList[j].product.shortDescription,
							"best_sellers":productList[j].product.bestSellers,
							"new_arrivals":productList[j].product.newArrivals,
							"brand":productList[j].product.brand,
							"customer_favourute_product": customer_favourute_product,
							"images": product_images
						});
					}
				}
				//console.log(productArray); return false;

				mainArray.push({
					"title":categoryList[i].title,
					"slug":categoryList[i].slug,
					"is_active":categoryList[i].status,
					"product_list":productArray
				});
				// console.log(mainArray);return false;
			}
		}
		if(mainArray.length>0){
			return res.status(200).send({ data:{success:true, details:mainArray}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}else{
			return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}

	}else if(storeId && storeId != '' && storeId != null && vegOnly == '' && vegOnly == 'false' && newArrival && newArrival == 'true'){
	
		let categoryList = await models.categories.findAll({
			attributes:['id','title','slug','status'],
			where:{
				storeId:storeId,
			}
		});//console.log(categoryList);return false;
		let mainArray = [];
		if(categoryList.length>0){
			for(let i=0;i<categoryList.length;i++){
				let catId = categoryList[i].id;

				let productArray = [];
				let productList = await models.productCategory.findAll({attributes:['id'],where: {storeId:storeId,categoryId:catId},include:[{model:models.products,where:{storeId:storeId, newArrivals: 'yes'}}]})
				 
				if(productList.length>0){
					for(let j=0;j<productList.length;j++){
						let productCartFlag = "false";
						let item_quantity =0;
						let customer_favourute_product = "false";
						if(customerId && customerId!='' && customerId!=null){
							let cartdata = await models.carts.findAll({attributes:['id','itemQuantity'],where:{productId:productList[j].id,storeId:storeId,customerId:customerId}});

							if(cartdata.length>0){
								console.log(cartdata);
								productCartFlag = "true";
								item_quantity = cartdata[0].itemQuantity;
							} 

							const favouriteProduct = await models.favouriteProduct.findAll({where:{productId: productList[j].id, customerId: customerId}})

							if(favouriteProduct.length > 0){
								customer_favourute_product = "true"
							}else{
								customer_favourute_product = "false"
							}
						}

						let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productList[j].product.id}});

						let product_images
						if(productImages.length>0){
							product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
						} else {
							product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
						}

						let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId: productList[j].product.id}, order: [['id', 'DESC']]})

						let stockQuantity
						if(stockDetails.length >= 1){
							stockQuantity = stockDetails[0].stock
						}else{
							stockQuantity = 0
						}

						productArray.push({
							"product_id":productList[j].product.id,
							"category_id":productList[j].id,
							"slug":productList[j].product.slug,
							"product_in_cart": productCartFlag,
							"item_quantity": item_quantity,
							"stock": stockQuantity,
							"total_quantity": productList[j].dataValues.itemQuantity==null?'0':productList[j].dataValues.itemQuantity,
							"title":productList[j].product.title,
							"price":productList[j].product.price,
							"short_description":productList[j].product.shortDescription,
							"best_sellers":productList[j].product.bestSellers,
							"new_arrivals":productList[j].product.newArrivals,
							"brand":productList[j].product.brand,
							"customer_favourute_product": customer_favourute_product,
							"images": product_images
						});
					}
				}
				//console.log(productArray); return false;

				mainArray.push({
					"title":categoryList[i].title,
					"slug":categoryList[i].slug,
					"is_active":categoryList[i].status,
					"product_list":productArray
				});
				// console.log(mainArray);return false;
			}
		}
		if(mainArray.length>0){
			return res.status(200).send({ data:{success:true, details:mainArray}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}else{
			return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}

	}else {
		return res.status(200).send({ data:{success:false, message:"All fields are required"}, errorNode:{errorCode:1, errorMsg:"error"}});
	}
	
};


  /*********************************** filter product list latest end *********************************************/


/*********************************** filter product list latest start *********************************************/

exports.zbrdstfilterProductList_bkp_28_01 = async function(req,res){
 
	var option_value = req.body.data.option_value;
	var customerId = req.body.data.customerId;
	var storeId = req.body.data.storeId;
	var veg_only = req.body.data.veg_only;
	var new_arrivals = req.body.data.new_arrivals;
	var value = [];
	var resultArray = [];
	var arr = [];
	var option_value_arr = [];
	var categoryArray = [];
  
	if(storeId !='' && storeId != null){
		// ///////////////// option value checked start /////////////
		if(option_value && option_value !='' && option_value != null){
		var option_value_arr = req.body.data.option_value.split(",");
		}
		var option_title = 'Veg Only,New Arrivals';
		var option_titlearr = option_title.split(",");
		option_titlearr.forEach(async function(opt){
		var slugify = opt.toString().toLowerCase().replace(/\s+/g, '_');
		if(option_value_arr.length > 0){
			for(var j=0; j < option_value_arr.length; j++){
			if(slugify == option_value_arr[j]){
				var is_checked = 'true';
				break;
			} else {
				var is_checked = 'false';
			}
			}
		} else {
			var is_checked = 'false';
		}
		arr.push({
			"title":opt,
			"is_checked":is_checked,
			"slug" : slugify
		});
		})
		// ///////////////// option value checked end /////////////
	
		// ///////////////// filter wise product start /////////////
	
		// ////// option value search dynamic start ///////////////
		// if(option_value !='' && option_value != null){
		// var option_value_arr = req.body.data.option_value.split(",");
		// var multiOptionValue = ''
	
		// if(option_value_arr.length == 1){
		// 	option_valuestr = "and b."+option_value_arr[0]+" = 'veg'";
		// }else{
		// 	var i=0; 
		// 	option_value_arr.forEach(async function(ov){
		// 	multiOptionValue += "and b."+option_value_arr[i]+" = 'yes' ";
		// 	i++;
		// 	}, this);
		// 	var option_valuestr = multiOptionValue.slice(0,-1);
		// }
		// } else {
		// var option_valuestr = '';
		// }

		if(veg_only && veg_only !='' && veg_only != null){
			if(new_arrivals && new_arrivals !='' && new_arrivals != null){
				var option_valuestr = "and b.attr1 = 'veg' and b.newArrivals = 'yes'";
			} else {
				var option_valuestr = "and b.attr1 = 'veg'";
			}

		} else {
			if(new_arrivals && new_arrivals !='' && new_arrivals != null){
				var option_valuestr = "and b.newArrivals = 'yes'";
			} else {
				var option_valuestr = '';
			}
		}
		
		// ////// option value search dynamic end ///////////////
	
		// ///////////////////////////// castomer wise cart filter product start //////////////////
	
		var cat_wise_product_list = [];
		var product_list = [];
		var value = [];
		var cat_wise_product = '';
	
		var category = await sequelize.query("select id, title, slug from categories where storeId = "+storeId+" and status = 'Yes' order by position ASC" ,{ type: Sequelize.QueryTypes.SELECT })
	
		if(category.length > 0){
		console.log('11111111111111111111');
		if (customerId && customerId !='') {
			var customer_cart_list = await sequelize.query("select id, customerId, productId, itemQuantity from carts where storeId = "+storeId+" and customerId =" + customerId,{ type: Sequelize.QueryTypes.SELECT });
			var customer_favourite_product_list = await sequelize.query("select favouriteProduct.id as fav_pro_id, products.id, products.title, products.shortDescription, productCategory.categoryId, products.price, products.attr1, products.bestSellers, products.newArrivals, products.isConfigurable, products.slug, 'true' as customer_favourite_product, 'false' as product_in_cart, 0 as item_quantity from favouriteProduct left join products on products.id = favouriteProduct.productId left join productCategory on productCategory.productId = products.id where favouriteProduct.storeId = "+storeId+" and products.isConfigurable = 0 and products.status='active' and favouriteProduct.customerId = " + customerId,{ type: Sequelize.QueryTypes.SELECT });
			
			//////////////// for customer favourite start //////////////////
			if (customer_favourite_product_list.length > 4) {
				var value = [];
				for(var a=0; a < customer_favourite_product_list.length; a++){
	
					
	
					/**
					 * check if any configurable and addon product avaiable
					 */
					var is_configurable_flag = '';
					var addon_flug = '';             
					var checkConfg = await models.products.findOne({attributes: ["id", "title"], where:{isConfigurable : customer_favourite_product_list[a].id}});
					if(checkConfg){
					is_configurable_flag = 'Yes';
					}else{
					is_configurable_flag = 'No';
					}
					var checkAddOn  = await models.relatedProduct.findOne({attributes: ["id", "productId","selectedProductId"], where:{type : 'Add-on', productId:customer_favourite_product_list[a].id}});
					if(checkAddOn){
					addon_flug = 'Yes';
					}else{
					addon_flug = 'No';
					}
	
					if (customer_cart_list.length > 0) {
					for(var i=0; i < customer_cart_list.length; i++){
						if(customer_favourite_product_list[a].id == customer_cart_list[i].productId){
						var product_in_cart = 'true';
						var item_quantity = customer_cart_list[i].itemQuantity;
						break;
						} else {
						var product_in_cart = 'false';
						var item_quantity = 0;
						}
					}
					} else {
					var product_in_cart = 'false';
					var item_quantity = 0;
					}
	
					if(customer_favourite_product_list[a].attr1 && customer_favourite_product_list[a].attr1 != '' && customer_favourite_product_list[a].attr1 != null){
						if(customer_favourite_product_list[a].attr1 == 'nonveg'){
							var veg_only = 'nonveg';
						} else {
							var veg_only = 'veg';
						}
					} else {
						var veg_only = 'veg';
					}
					value.push({
					"product_id": customer_favourite_product_list[a].id,
					"category_id": customer_favourite_product_list[a].categoryId,
					"slug": customer_favourite_product_list[a].slug,
					"id":customer_favourite_product_list[a].id,
					"title": customer_favourite_product_list[a].title,
					"price": customer_favourite_product_list[a].price,
					"veg_only": veg_only,
					"short_description": customer_favourite_product_list[a].shortDescription,
					"best_sellers": customer_favourite_product_list[a].bestSellers,
					"new_arrivals": customer_favourite_product_list[a].newArrivals,
					"product_in_cart": product_in_cart,
					"customer_favourute_product": customer_favourite_product_list[a].customer_favourite_product,
					"fav_pro_id": customer_favourite_product_list[a].fav_pro_id,
					"item_quantity": item_quantity,
					"addon_product": [],
					"is_configurable_flag" : is_configurable_flag,
					"addon_flug" : addon_flug
	
					});
				}
	
				cat_wise_product_list.push({
					id: '',
					title: 'My Favourite',
					slug: 'my_favourite',
					is_active: 'false',
					product_list:value
				});
	
				// ///////////////////////// left menu category filter list start /////////////////////
				categoryArray.push({
					id: '',
					title: 'My Favourite',
					slug: 'my_favourite',
					is_active: 'false',
				});
				// ///////////////////////// left menu category filter list start /////////////////////
			} else {
				var cat_wise_product_list = [];
			}
	
			///////////////////for customer favourite end //////////////////
	
			//////////////// for best seller start //////////////////
			var value = [];
			var best_selling_product = await sequelize.query(
				"select b.id as productId, productCategory.categoryId, b.slug, b.id, b.title, b.price, b.attr1, b.shortDescription, b.bestSellers, b.newArrivals, b.description, "+
				"'false' as product_in_cart, "+
				"'false' as customer_favourite_product, "+
				"0 as item_quantity "+
				"from products as b "+
				"left join productCategory on productCategory.productId = b.id "+
				"WHERE b.storeId = "+storeId+" and b.bestSellers = 'yes' and b.isConfigurable = 0 and b.status='active' "+option_valuestr+"",{ type: Sequelize.QueryTypes.SELECT })
				console.log('44444444444444444444444444444444444444======='+best_selling_product.length);
			if (best_selling_product.length > 0) {
	
				for(var a=0; a < best_selling_product.length; a++){
	
					
	
				/**
				 * check if any configurable and addon product avaiable
				 */
				var is_configurable_flag = '';
				var addon_flug = '';             
				var checkConfg = await models.products.findOne({attributes: ["id", "title"], where:{isConfigurable : best_selling_product[a].id}});
				if(checkConfg){
					is_configurable_flag = 'Yes';
				}else{
					is_configurable_flag = 'No';
				}
				var checkAddOn  = await models.relatedProduct.findOne({attributes: ["id", "productId","selectedProductId"], where:{type : 'Add-on', productId:best_selling_product[a].id}});
				if(checkAddOn){
					addon_flug = 'Yes';
				}else{
					addon_flug = 'No';
				}
	
				if (customer_favourite_product_list.length > 0) {
					for(var k=0; k < customer_favourite_product_list.length; k++){
					if(best_selling_product[a].id == customer_favourite_product_list[k].productId){
						var customer_favourite_product = 'true';
						var fav_pro_id = customer_favourite_product_list[k].fav_pro_id;
						break;
					} else {
						var customer_favourite_product = 'false';
						var fav_pro_id = 0;
					}
					}
	
				} else {
					var customer_favourite_product = 'false';
					var fav_pro_id = 0;
				}
	
				if (customer_cart_list.length > 0) {
					for(var i=0; i < customer_cart_list.length; i++){
					if(best_selling_product[a].id == customer_cart_list[i].product_id){
						var product_in_cart = 'true';
						var item_quantity = customer_cart_list[i].item_quantity;
						break;
					} else {
						var product_in_cart = 'false';
						var item_quantity = 0;
					}
					}
				} else {
					var product_in_cart = 'false';
					var item_quantity = 0;
				}

				if(best_selling_product[a].attr1 && best_selling_product[a].attr1 != '' && best_selling_product[a].attr1 != null){
					if(best_selling_product[a].attr1 == 'nonveg'){
						var veg_only = 'nonveg';
					} else {
						var veg_only = 'veg';
					}
				} else {
					var veg_only = 'veg';
				}
	
				value.push({
					"product_id": best_selling_product[a].productId,
					"category_id": best_selling_product[a].categoryId,
					"slug": best_selling_product[a].slug,
					"id":best_selling_product[a].id,
					"title": best_selling_product[a].title,
					"price": best_selling_product[a].price,
					"veg_only": veg_only,
					"short_description": best_selling_product[a].shortDescription,
					"best_sellers": best_selling_product[a].bestSellers,
					"new_arrivals": best_selling_product[a].newArrivals,
					"product_in_cart": product_in_cart,
					"customer_favourute_product": customer_favourite_product,
					"fav_pro_id": fav_pro_id,
					"item_quantity": item_quantity,
					"addon_product": [],
					"is_configurable_flag" : is_configurable_flag,
					"addon_flug" : addon_flug
				});
				}
	
				cat_wise_product_list.push({
				id: '',
				title: 'Best Sellers',
				slug: 'best_sellers',
				is_active: 'false',
				product_list:value
				});
				// ///////////////////////// left menu category filter list start /////////////////////
				categoryArray.push({
				id: '',
				title: 'Best Sellers',
				slug: 'best_sellers',
				is_active: 'false',
				});
				// ///////////////////////// left menu category filter list start /////////////////////
			} else {
				if(cat_wise_product_list.length > 0){
				var cat_wise_product_list = cat_wise_product_list;
				} else {
				var cat_wise_product_list = [];
				}
				// var cat_wise_product_list = [];
			}
	
			///////////////////for best seller end //////////////////
	
			for(var j=0; j < category.length; j++){
				var value = [];
				console.log('000000000000000000000'+category[j].id);
				cat_wise_product = await sequelize.query(
				"select b.id as productId, pc.categoryId, b.slug, b.id, b.title, b.price, b.attr1, b.shortDescription, b.bestSellers, b.newArrivals, "+
				"'false' as product_in_cart, "+
				"0 as item_quantity "+
				"from productCategory as pc "+
				"left join products as b on b.id=pc.productId "+
				"WHERE pc.storeId = "+storeId+" and pc.categoryId='"+category[j].id+"' and b.isConfigurable = 0 and b.status='active' "+option_valuestr+"",{ type: Sequelize.QueryTypes.SELECT });
	
				if(cat_wise_product.length > 0){
				
				for(var a=0; a < cat_wise_product.length; a++){
	
					
	
					if (customer_favourite_product_list.length > 0) {
					for(var k=0; k < customer_favourite_product_list.length; k++){
						if(cat_wise_product[a].id == customer_favourite_product_list[k].productId){
							var customer_favourite_product = 'true';
							var fav_pro_id = customer_favourite_product_list[k].fav_pro_id;
							break;
						} else {
							var customer_favourite_product = 'false';
							var fav_pro_id = 0;
						}
					}
	
					} else {
						var customer_favourite_product = 'false';
						var fav_pro_id = 0;
					}
	
					if (customer_cart_list.length > 0) {
					for(var i=0; i < customer_cart_list.length; i++){
						if(cat_wise_product[a].id == customer_cart_list[i].product_id){
						var product_in_cart = 'true';
						var item_quantity = customer_cart_list[i].item_quantity;
						break;
						} else {
						var product_in_cart = 'false';
						var item_quantity = 0;
						}
					}
					} else {
					var product_in_cart = 'false';
					var item_quantity = 0;
					}
	
					/**
					 * check if any configurable and addon product avaiable
					 */
					var is_configurable_flag = '';
					var addon_flug = '';             
					var checkConfg = await models.products.findOne({attributes: ["id", "title"], where:{isConfigurable : cat_wise_product[a].id}});
					if(checkConfg){
						is_configurable_flag = 'Yes';
					}else{
						is_configurable_flag = 'No';
					}
					var checkAddOn  = await models.relatedProduct.findOne({attributes: ["id", "productId","selectedProductId"], where:{type : 'Add-on', productId:cat_wise_product[a].id}});
					if(checkAddOn){
						addon_flug = 'Yes';
					}else{
						addon_flug = 'No';
					}

					if(cat_wise_product[a].attr1 && cat_wise_product[a].attr1 != '' && cat_wise_product[a].attr1 != null){
						if(cat_wise_product[a].attr1 == 'nonveg'){
							var veg_only = 'nonveg';
						} else {
							var veg_only = 'veg';
						}
					} else {
						var veg_only = 'veg';
					}
	
					value.push({
					"product_id": cat_wise_product[a].productId,
					"category_id": cat_wise_product[a].categoryId,
					"slug": cat_wise_product[a].slug,
					"id":cat_wise_product[a].id,
					"title": cat_wise_product[a].title,
					"price": cat_wise_product[a].price,
					"veg_only": veg_only,
					"short_description": cat_wise_product[a].shortDescription,
					"best_sellers": cat_wise_product[a].bestSellers,
					"new_arrivals": cat_wise_product[a].newArrivals,
					"product_in_cart": product_in_cart,
					"customer_favourute_product": customer_favourite_product,
					"fav_pro_id": fav_pro_id,
					"item_quantity": item_quantity,
					"addon_product": [],
					"is_configurable_flag" : is_configurable_flag,
					"addon_flug" : addon_flug
					});
				}
	
				cat_wise_product_list.push({
					id: category[j].id,
					title: category[j].title,
					slug: category[j].slug,
					is_active: 'false',
					product_list:value
				});
	
				// ///////////////////////// left menu category filter list start /////////////////////
				categoryArray.push({
					id: category[j].id,
					title: category[j].title,
					slug: category[j].slug,
					is_active: 'false',
				});
				// ///////////////////////// left menu category filter list start /////////////////////
	
				} 
				
			}
	
			var product_list = cat_wise_product_list;
		} else {
	
			//////////////// for best seller start //////////////////
		
			var value = [];
			var best_selling_product = await sequelize.query(
			"select b.id as productId, productCategory.categoryId, b.slug, b.id, b.title, b.price, b.attr1, b.shortDescription, b.bestSellers, b.newArrivals, b.description, "+
			"'false' as product_in_cart, "+
			"'false' as customer_favourite_product, "+
			"0 as item_quantity "+
			"from products as b "+
			"left join productCategory on productCategory.productId = b.id "+
			"WHERE b.storeId = "+storeId+" and b.bestSellers = 'yes' and b.isConfigurable = 0 and b.status='active' "+option_valuestr+"",{ type: Sequelize.QueryTypes.SELECT })
	
			if (best_selling_product.length > 0) {
	
				for(var a=0; a < best_selling_product.length; a++){
	
	
				/**
				 * check if any configurable and addon product avaiable
				 */
				var is_configurable_flag = '';
				var addon_flug = '';             
				var checkConfg = await models.products.findOne({attributes: ["id", "title"], where:{isConfigurable : best_selling_product[a].id}});
				if(checkConfg){
					is_configurable_flag = 'Yes';
				}else{
					is_configurable_flag = 'No';
				}
				var checkAddOn  = await models.relatedProduct.findOne({attributes: ["id", "productId","selectedProductId"], where:{type : 'Add-on', productId:best_selling_product[a].id}});
				if(checkAddOn){
					addon_flug = 'Yes';
				}else{
					addon_flug = 'No';
				}
	
				if(best_selling_product[a].attr1 && best_selling_product[a].attr1 != '' && best_selling_product[a].attr1 != null){
					if(best_selling_product[a].attr1 == 'nonveg'){
						var veg_only = 'nonveg';
					} else {
						var veg_only = 'veg';
					}
				} else {
					var veg_only = 'veg';
				}

				value.push({
					"product_id": best_selling_product[a].productId,
					"category_id": best_selling_product[a].categoryId,
					"slug": best_selling_product[a].slug,
					"id":best_selling_product[a].id,
					"title": best_selling_product[a].title,
					"price": best_selling_product[a].price,
					"veg_only": veg_only,
					"short_description": best_selling_product[a].shortDescription,
					"best_sellers": best_selling_product[a].bestSellers,
					"new_arrivals": best_selling_product[a].newArrivals,
					"product_in_cart": best_selling_product[a].product_in_cart,
					"customer_favourute_product": best_selling_product[a].customer_favourite_product,
					"fav_pro_id": 0,
					"item_quantity": best_selling_product[a].item_quantity,
					"addon_product": [],
					"is_configurable_flag" : is_configurable_flag,
					"addon_flug" : addon_flug
				});
				}
	
			cat_wise_product_list.push({
				id: '',
				title: 'Best Sellers',
				slug: 'best_sellers',
				is_active: 'false',
				product_list:value
			});
	
			// ///////////////////////// left menu category filter list start /////////////////////
			categoryArray.push({
				id: '',
				title: 'Best Sellers',
				slug: 'best_sellers',
				is_active: 'false',
			});
			// ///////////////////////// left menu category filter list start /////////////////////
	
			} else {
			var cat_wise_product_list = [];
			}
	
			///////////////////for best seller end //////////////////
	
			for(var j=0; j < category.length; j++){
	
			var value = [];
			console.log('999999999999999999999'+category[j].id);
			var cat_wise_product = await sequelize.query(
				"select b.id as productId, pc.categoryId, b.slug, b.id, b.title, b.price, b.attr1, b.shortDescription, b.bestSellers, b.newArrivals, b.description, "+
				"'false' as product_in_cart, "+
				"'false' as customer_favourite_product, "+
				"0 as item_quantity "+
				"from productCategory as pc "+
				"left join products as b on b.id=pc.productId "+
				"WHERE pc.storeId = "+storeId+" and pc.categoryId='"+category[j].id+"' and b.isConfigurable = 0 and b.status='active' "+option_valuestr+"",{ type: Sequelize.QueryTypes.SELECT });
	
			if (cat_wise_product.length > 0) {
	
				for(var a=0; a < cat_wise_product.length; a++){
	
				/**
				 * check if any configurable and addon product avaiable
				 */
				var is_configurable_flag = '';
				var addon_flug = '';             
				var checkConfg = await models.products.findOne({attributes: ["id", "title"], where:{isConfigurable : cat_wise_product[a].id}});
				if(checkConfg){
					is_configurable_flag = 'Yes';
				}else{
					is_configurable_flag = 'No';
				}
				var checkAddOn  = await models.relatedProduct.findOne({attributes: ["id", "productId","selectedProductId"], where:{type : 'Add-on', productId:cat_wise_product[a].id}});
				if(checkAddOn){
					addon_flug = 'Yes';
				}else{
					addon_flug = 'No';
				}

				if(cat_wise_product[a].attr1 && cat_wise_product[a].attr1 != '' && cat_wise_product[a].attr1 != null){
					if(cat_wise_product[a].attr1 == 'nonveg'){
						var veg_only = 'nonveg';
					} else {
						var veg_only = 'veg';
					}
				} else {
					var veg_only = 'veg';
				}
	
				value.push({
					"product_id": cat_wise_product[a].productId,
					"category_id": cat_wise_product[a].categoryId,
					"slug": cat_wise_product[a].slug,
					"id":cat_wise_product[a].id,
					"title": cat_wise_product[a].title,
					"price": cat_wise_product[a].price,
					"veg_only": veg_only,
					"short_description": cat_wise_product[a].shortDescription,
					"best_sellers": cat_wise_product[a].bestSellers,
					"new_arrivals": cat_wise_product[a].newArrivals,
					"product_in_cart": cat_wise_product[a].product_in_cart,
					"customer_favourute_product": cat_wise_product[a].customer_favourite_product,
					"fav_pro_id": 0,
					"item_quantity": cat_wise_product[a].item_quantity,
					"addon_product": [],
					"is_configurable_flag" : is_configurable_flag,
					"addon_flug" : addon_flug
				});
				}
	
				cat_wise_product_list.push({
				id: category[j].id,
				title: category[j].title,
				slug: category[j].slug,
				is_active: 'false',
				product_list:value
				});
	
				// ///////////////////////// left menu category filter list start /////////////////////
				categoryArray.push({
				id: category[j].id,
				title: category[j].title,
				slug: category[j].slug,
				is_active: 'false',
				});
				// ///////////////////////// left menu category filter list start /////////////////////
	
			}
			
			}
			var product_list = cat_wise_product_list;
			
		}
	
		if (product_list.length > 0) {
		
			// res.status(200).send({status: 200, success: true, message: "Product found", value: product_list, category_list: categoryArray, option_value_arr:arr });
			return res.status(200).send({ data:{success:true, message: "Product found", value: product_list, category_list: categoryArray, option_value_arr:arr}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		} else {
			// res.status(200).send({status: 200, success: false, message: "No product found", value: [], category_list: categoryArray, option_value_arr:arr });
			return res.status(200).send({ data:{success:false, message: "No product found", value: [], category_list: categoryArray, option_value_arr:arr}, errorNode:{errorCode:1, errorMsg:"error"}});
		}
	
		// ///////////////// filter wise product end /////////////
		} else {
		// res.status(200).send({status: 200, success: false, message: "No Category found", value: [], category_list: [], option_value_arr:[] });
		return res.status(200).send({ data:{success:false, message: "No Category found", value: [], category_list: [], option_value_arr:[]}, errorNode:{errorCode:1, errorMsg:"error"}});
		}
	} else {
		// res.status(200).send({status: 200, success: false, message: "Store id is required", value: [], category_list: [], option_value_arr:[] });
		return res.status(200).send({ data:{success:false, message: "Store id is required", value: [], category_list: [], option_value_arr:[]}, errorNode:{errorCode:1, errorMsg:"error"}});
	}
  }


exports.restaurantFilterProductList = async function(req,res){
 
	var option_value = req.body.data.option_value;
	var customerId = req.body.data.customerId;
	var storeId = req.body.data.storeId;
	var veg_only = req.body.data.veg_only || "";
	var non_veg_only = req.body.data.non_veg_only || "";
	var new_arrivals = req.body.data.new_arrivals|| "";
	var spicey = req.body.data.spicey || "";
	var best_sellings = req.body.data.best_sellings || "";
	var value = [];
	var resultArray = [];
	var arr = [];
	var option_value_arr = [];
	var categoryArray = [];

	console.log("qqqqqqqqqqqqqqqqqqq--"+JSON.stringify(req.body.data))
  
	if(storeId !='' && storeId != null){
		// ///////////////// option value checked start /////////////
		if(option_value && option_value !='' && option_value != null){
			 option_value_arr = req.body.data.option_value.split(",");
		}
		// var option_title = 'Veg Only,New Arrivals';
		// var option_title = 'Veg Only,Non Veg Only,New Arrivals';
		// var option_title = 'Veg Only,New Arrivals,Best Seller,Spicy';
		var option_title = 'Veg Only,New,Best Seller,Spicy';
		var option_titlearr = option_title.split(",");
		option_titlearr.forEach(async function(opt){
			var slugify = opt.toString().toLowerCase().replace(/\s+/g, '_');
			if(option_value_arr.length > 0){
				for(var j=0; j < option_value_arr.length; j++){
					if(slugify == option_value_arr[j]){
						var is_checked = 'true';
						break;
					} else {
						var is_checked = 'false';
					}
				}
			} else {
				var is_checked = 'false';
			}
			arr.push({
				"title":opt,
				"is_checked":is_checked,
				"slug" : slugify
			});
		})
		// ///////////////// option value checked end /////////////
	
		// ///////////////// filter wise product start /////////////
	
		// ////// option value search dynamic start ///////////////
		// if(option_value !='' && option_value != null){
		// var option_value_arr = req.body.data.option_value.split(",");
		// var multiOptionValue = ''
	
		// if(option_value_arr.length == 1){
		// 	option_valuestr = "and b."+option_value_arr[0]+" = 'veg'";
		// }else{
		// 	var i=0; 
		// 	option_value_arr.forEach(async function(ov){
		// 	multiOptionValue += "and b."+option_value_arr[i]+" = 'yes' ";
		// 	i++;
		// 	}, this);
		// 	var option_valuestr = multiOptionValue.slice(0,-1);
		// }
		// } else {
		// var option_valuestr = '';
		// }

		let vo = ""
		let nvo = ""
		let na = ""
		let bs = ""
		let s = ""
		if(veg_only != ''){
			vo = "and b.attr1 = 'veg'"
		}
		// if(non_veg_only != ''){
		// 	nvo = "and b.attr1 = 'nonveg'"
		// }
		if(new_arrivals != ''){
			na = "and b.newArrivals = 'yes'"
		}
		if(best_sellings != ''){
			bs = "and b.bestSellers = 'yes'"
		}
		if(spicey != ''){
			s = "and b.spicey = 'yes'"
		}

		let option_valuestr = `${vo} ${nvo} ${na} ${bs} ${s}`

		// if(veg_only && veg_only !='' && veg_only != null){
		// 	if(new_arrivals && new_arrivals !='' && new_arrivals != null){
		// 		var option_valuestr = "and b.attr1 = 'veg' and b.newArrivals = 'yes'";
		// 	} else {
		// 		var option_valuestr = "and b.attr1 = 'veg'";
		// 	}

		// } else if(non_veg_only && non_veg_only != '' && non_veg_only != null) {
		// 	if(new_arrivals && new_arrivals !='' && new_arrivals != null){
		// 		var option_valuestr = "and b.attr1 = 'nonveg' and b.newArrivals = 'yes'";
		// 	} else {
		// 		var option_valuestr = "and b.attr1 = 'nonveg'";
		// 	}
		// }else{
		// 	if(new_arrivals && new_arrivals !='' && new_arrivals != null){
		// 		var option_valuestr = "and b.newArrivals = 'yes'";
		// 	} else {
		// 		var option_valuestr = "";
		// 	}
		// }
		
		// ////// option value search dynamic end ///////////////
	
		// ///////////////////////////// castomer wise cart filter product start //////////////////
	
		var cat_wise_product_list = [];
		var product_list = [];
		var value = [];
		var cat_wise_product = '';
	
		var category = await sequelize.query("select id, title, slug from categories where storeId = "+storeId+" and status = 'Yes' order by position ASC" ,{ type: Sequelize.QueryTypes.SELECT })
	
		if(category.length > 0){
			console.log('11111111111111111111');

			////////////////////////// catelog price rule start /////////////////////////////////////
			var catelogPriceCurrentDate = yyyy_mm_dd();
			var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
			if(catelogPriceRuleDetails.length>0){
				var isCatelogPriceRule = 'yes';
			} else {
				var isCatelogPriceRule = 'no';
			}
			////////////////////////// catelog price rule end /////////////////////////////////////
			
			if (customerId && customerId !='') {
				// var customer_cart_list = await sequelize.query("select id, customerId, productId, itemQuantity from carts where storeId = "+storeId+" and customerId =" + customerId,{ type: Sequelize.QueryTypes.SELECT });
				var customer_favourite_product_list = await sequelize.query("select favouriteProduct.id as fav_pro_id, products.id, products.title, products.shortDescription, productCategory.categoryId, products.price, products.attr1, products.bestSellers, products.spicey, products.newArrivals, products.isConfigurable, products.slug, 'true' as customer_favourite_product, 'false' as product_in_cart, 0 as item_quantity from favouriteProduct left join products on products.id = favouriteProduct.productId left join productCategory on productCategory.productId = products.id where favouriteProduct.storeId = "+storeId+" and products.isConfigurable = 0 and products.status='active' and favouriteProduct.customerId = " + customerId,{ type: Sequelize.QueryTypes.SELECT });
				
				//////////////// for customer favourite start //////////////////
				if (customer_favourite_product_list.length > 4) {
					var value = [];
					for(var a=0; a < customer_favourite_product_list.length; a++){
		
						////////////////////////// catelog price rule start /////////////////////////////////////

						if(isCatelogPriceRule == 'yes'){

							var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, customer_favourite_product_list[a].id, customer_favourite_product_list[a].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

							var discountPrice = productCatalogPriceDetails.discountPrice;
							var discountTag = productCatalogPriceDetails.discountTag;

						} else {
							var discountPrice = null;
							var discountTag = null;
						}

						////////////////////////// catelog price rule end /////////////////////////////////////
		
						/**
						 * check if any configurable and addon product avaiable
						 */
						// var is_configurable_flag = '';
						// var addon_flug = '';             
						// var checkConfg = await models.products.findOne({attributes: ["id", "title"], where:{isConfigurable : customer_favourite_product_list[a].id}});
						// if(checkConfg){
						// is_configurable_flag = 'Yes';
						// }else{
						// is_configurable_flag = 'No';
						// }

						// ////////////////////////////////// option product start //////////////////
						let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:customer_favourite_product_list[a].id, storeId:storeId}});

						if(optionProductDetails.length>0){
							if(optionProductDetails[0].optionId && optionProductDetails[0].optionId != '' && optionProductDetails[0].optionId != null) {
								let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
								if(optionValueList.length>0){
									var isConfigurable = "Yes";
								} else {
									var isConfigurable = "Yes";
								}
								// var configurableProductList = optionValueList;
							} else {
								var isConfigurable = "No";
								// var configurableProductList = [];
							}
						} else {
							var isConfigurable = "No";
							// var configurableProductList = [];
						}
						// ////////////////////////////////// option product end //////////////////

						var addon_flug = '';       
						var checkAddOn  = await models.relatedProduct.findOne({attributes: ["id", "productId","selectedProductId"], where:{type : 'Add-on', productId:customer_favourite_product_list[a].id}});
						if(checkAddOn){
						addon_flug = 'Yes';
						}else{
						addon_flug = 'No';
						}
		
						// if (customer_cart_list.length > 0) {
						// for(var i=0; i < customer_cart_list.length; i++){
						// 	if(customer_favourite_product_list[a].id == customer_cart_list[i].productId){
						// 	var product_in_cart = 'true';
						// 	var item_quantity = customer_cart_list[i].itemQuantity;
						// 	break;
						// 	} else {
						// 	var product_in_cart = 'false';
						// 	var item_quantity = 0;
						// 	}
						// }
						// } else {
						// var product_in_cart = 'false';
						// var item_quantity = 0;
						// }
		
						if(customer_favourite_product_list[a].attr1 && customer_favourite_product_list[a].attr1 != '' && customer_favourite_product_list[a].attr1 != null){
							if(customer_favourite_product_list[a].attr1 == 'nonveg'){
								var veg_only = 'nonveg';
								// var non_veg_only = 'nonveg';
							} else {
								var veg_only = 'veg';
								// var non_veg_only = 'veg';
							}
						} else {
							var veg_only = 'veg';
							// var non_veg_only = 'veg';
						}
						value.push({
						"product_id": customer_favourite_product_list[a].id,
						"category_id": customer_favourite_product_list[a].categoryId,
						"slug": customer_favourite_product_list[a].slug,
						"id":customer_favourite_product_list[a].id,
						"title": customer_favourite_product_list[a].title,
						"price": customer_favourite_product_list[a].price,
						"veg_only": veg_only,
						// "non_veg_only": non_veg_only,
						"short_description": customer_favourite_product_list[a].shortDescription,
						"best_sellers": customer_favourite_product_list[a].bestSellers,
						"new_arrivals": customer_favourite_product_list[a].newArrivals,
						"spicey": customer_favourite_product_list[a].spicey,
						// "product_in_cart": product_in_cart,
						// "item_quantity": item_quantity,
						"customer_favourute_product": customer_favourite_product_list[a].customer_favourite_product,
						"fav_pro_id": customer_favourite_product_list[a].fav_pro_id,
						"product_in_cart": "false",
						"item_quantity": 0,
						"addon_product": [],
						// "is_configurable_flag" : is_configurable_flag,
						"isConfigurable":isConfigurable,
						"addon_flug" : addon_flug,
						"discountPrice": discountPrice,
						"discountTag": discountTag
		
						});
					}
		
					cat_wise_product_list.push({
						id: '',
						title: 'My Favourite',
						slug: 'my_favourite',
						totalProductCount:customer_favourite_product_list.length,
						is_active: 'false',
						product_list:value
					});
		
					// ///////////////////////// left menu category filter list start /////////////////////
					categoryArray.push({
						id: '',
						title: 'My Favourite',
						slug: 'my_favourite',
						totalProductCount:customer_favourite_product_list.length,
						is_active: 'false',
					});
					// ///////////////////////// left menu category filter list start /////////////////////
				} else {
					var cat_wise_product_list = [];
				}
		
				///////////////////for customer favourite end //////////////////
		
				//////////////// for best seller start //////////////////
				var value = [];
				var best_selling_product = await sequelize.query(
					"select b.id as productId, productCategory.categoryId, b.slug, b.id, b.title, b.price, b.attr1, b.spicey, b.shortDescription, b.bestSellers, b.newArrivals, b.description, "+
					"'false' as product_in_cart, "+
					"'false' as customer_favourite_product, "+
					"0 as item_quantity "+
					"from products as b "+
					"left join productCategory on productCategory.productId = b.id "+
					"WHERE b.storeId = "+storeId+" and b.bestSellers = 'yes' and b.isConfigurable = 0 and b.status='active' "+option_valuestr+"",{ type: Sequelize.QueryTypes.SELECT })
					console.log('44444444444444444444444444444444444444======='+best_selling_product.length);
				if (best_selling_product.length > 0) {
		
					for(var a=0; a < best_selling_product.length; a++){
		
						////////////////////////// catelog price rule start /////////////////////////////////////

						if(isCatelogPriceRule == 'yes'){

							var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, best_selling_product[a].id, best_selling_product[a].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

							var discountPrice = productCatalogPriceDetails.discountPrice;
							var discountTag = productCatalogPriceDetails.discountTag;

						} else {
							var discountPrice = null;
							var discountTag = null;
						}

						////////////////////////// catelog price rule end /////////////////////////////////////
		
					/**
					 * check if any configurable and addon product avaiable
					 */
					// var is_configurable_flag = '';
					// var addon_flug = '';             
					// var checkConfg = await models.products.findOne({attributes: ["id", "title"], where:{isConfigurable : best_selling_product[a].id}});
					// if(checkConfg){
					// 	is_configurable_flag = 'Yes';
					// }else{
					// 	is_configurable_flag = 'No';
					// }

					// ////////////////////////////////// option product start //////////////////
					let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:best_selling_product[a].id, storeId:storeId}});

					if(optionProductDetails.length>0){
						if(optionProductDetails[0].optionId && optionProductDetails[0].optionId != '' && optionProductDetails[0].optionId != null) {
							let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
							if(optionValueList.length>0){
								var isConfigurable = "Yes";
							} else {
								var isConfigurable = "Yes";
							}
							// var configurableProductList = optionValueList;
						} else {
							var isConfigurable = "No";
							// var configurableProductList = [];
						}
					} else {
						var isConfigurable = "No";
						// var configurableProductList = [];
					}
					// ////////////////////////////////// option product end //////////////////

					var addon_flug = '';        
					var checkAddOn  = await models.relatedProduct.findOne({attributes: ["id", "productId","selectedProductId"], where:{type : 'Add-on', productId:best_selling_product[a].id}});
					if(checkAddOn){
						addon_flug = 'Yes';
					}else{
						addon_flug = 'No';
					}
		
					if (customer_favourite_product_list.length > 0) {
						for(var k=0; k < customer_favourite_product_list.length; k++){
						if(best_selling_product[a].id == customer_favourite_product_list[k].productId){
							var customer_favourite_product = 'true';
							var fav_pro_id = customer_favourite_product_list[k].fav_pro_id;
							break;
						} else {
							var customer_favourite_product = 'false';
							var fav_pro_id = 0;
						}
						}
		
					} else {
						var customer_favourite_product = 'false';
						var fav_pro_id = 0;
					}
		
					// if (customer_cart_list.length > 0) {
					// 	for(var i=0; i < customer_cart_list.length; i++){
					// 	if(best_selling_product[a].id == customer_cart_list[i].product_id){
					// 		var product_in_cart = 'true';
					// 		var item_quantity = customer_cart_list[i].item_quantity;
					// 		break;
					// 	} else {
					// 		var product_in_cart = 'false';
					// 		var item_quantity = 0;
					// 	}
					// 	}
					// } else {
					// 	var product_in_cart = 'false';
					// 	var item_quantity = 0;
					// }

					if(best_selling_product[a].attr1 && best_selling_product[a].attr1 != '' && best_selling_product[a].attr1 != null){
						if(best_selling_product[a].attr1 == 'nonveg'){
							var veg_only = 'nonveg';
							// var non_veg_only = 'nonveg';
						} else {
							var veg_only = 'veg';
							// var non_veg_only = 'veg';
						}
					} else {
						var veg_only = 'veg';
						// var non_veg_only = 'veg';
					}
		
					value.push({
						"product_id": best_selling_product[a].productId,
						"category_id": best_selling_product[a].categoryId,
						"slug": best_selling_product[a].slug,
						"id":best_selling_product[a].id,
						"title": best_selling_product[a].title,
						"price": best_selling_product[a].price,
						"veg_only": veg_only,
						// "non_veg_only":non_veg_only,
						"short_description": best_selling_product[a].shortDescription,
						"best_sellers": best_selling_product[a].bestSellers,
						"new_arrivals": best_selling_product[a].newArrivals,
						"spicey": best_selling_product[a].spicey,
						// "product_in_cart": product_in_cart,
						// "item_quantity": item_quantity,
						"customer_favourute_product": customer_favourite_product,
						"fav_pro_id": fav_pro_id,
						"product_in_cart": "false",
						"item_quantity": 0,
						"addon_product": [],
						// "is_configurable_flag" : is_configurable_flag,
						"isConfigurable":isConfigurable,
						"addon_flug" : addon_flug,
						"discountPrice": discountPrice,
						"discountTag": discountTag
					});
					}
		
					cat_wise_product_list.push({
						id: '',
						title: 'Best Sellers',
						slug: 'best_sellers',
						totalProductCount:best_selling_product.length,
						is_active: 'false',
						product_list:value
					});
					// ///////////////////////// left menu category filter list start /////////////////////
					categoryArray.push({
						id: '',
						title: 'Best Sellers',
						slug: 'best_sellers',
						totalProductCount:best_selling_product.length,
						is_active: 'false',
					});
					// ///////////////////////// left menu category filter list start /////////////////////
				} else {
					if(cat_wise_product_list.length > 0){
						var cat_wise_product_list = cat_wise_product_list;
					} else {
						var cat_wise_product_list = [];
					}
					// var cat_wise_product_list = [];
				}
		
				///////////////////for best seller end //////////////////
		
				for(var j=0; j < category.length; j++){
					var value = [];
					console.log('000000000000000000000'+category[j].id);
					cat_wise_product = await sequelize.query(
					"select b.id as productId, pc.categoryId, b.slug, b.id, b.title, b.price, b.attr1, b.spicey, b.shortDescription, b.bestSellers, b.newArrivals, "+
					"'false' as product_in_cart, "+
					"0 as item_quantity "+
					"from productCategory as pc "+
					"left join products as b on b.id=pc.productId "+
					"WHERE pc.storeId = "+storeId+" and pc.categoryId='"+category[j].id+"' and b.isConfigurable = 0 and b.status='active' "+option_valuestr+"",{ type: Sequelize.QueryTypes.SELECT });
		
					if(cat_wise_product.length > 0){
					
					for(var a=0; a < cat_wise_product.length; a++){
		
						////////////////////////// catelog price rule start /////////////////////////////////////

						if(isCatelogPriceRule == 'yes'){

							var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, cat_wise_product[a].id, cat_wise_product[a].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

							var discountPrice = productCatalogPriceDetails.discountPrice;
							var discountTag = productCatalogPriceDetails.discountTag;

						} else {
							var discountPrice = null;
							var discountTag = null;
						}

						////////////////////////// catelog price rule end /////////////////////////////////////
		
						if (customer_favourite_product_list.length > 0) {
						for(var k=0; k < customer_favourite_product_list.length; k++){
							if(cat_wise_product[a].id == customer_favourite_product_list[k].productId){
								var customer_favourite_product = 'true';
								var fav_pro_id = customer_favourite_product_list[k].fav_pro_id;
								break;
							} else {
								var customer_favourite_product = 'false';
								var fav_pro_id = 0;
							}
						}
		
						} else {
							var customer_favourite_product = 'false';
							var fav_pro_id = 0;
						}
		
						// if (customer_cart_list.length > 0) {
						// for(var i=0; i < customer_cart_list.length; i++){
						// 	if(cat_wise_product[a].id == customer_cart_list[i].product_id){
						// 	var product_in_cart = 'true';
						// 	var item_quantity = customer_cart_list[i].item_quantity;
						// 	break;
						// 	} else {
						// 	var product_in_cart = 'false';
						// 	var item_quantity = 0;
						// 	}
						// }
						// } else {
						// var product_in_cart = 'false';
						// var item_quantity = 0;
						// }
		
						/**
						 * check if any configurable and addon product avaiable
						 */
						// var is_configurable_flag = '';
						// var addon_flug = '';             
						// var checkConfg = await models.products.findOne({attributes: ["id", "title"], where:{isConfigurable : cat_wise_product[a].id}});
						// if(checkConfg){
						// 	is_configurable_flag = 'Yes';
						// }else{
						// 	is_configurable_flag = 'No';
						// }

						// ////////////////////////////////// option product start //////////////////
						let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:cat_wise_product[a].id, storeId:storeId}});

						if(optionProductDetails.length>0){
							if(optionProductDetails[0].optionId && optionProductDetails[0].optionId != '' && optionProductDetails[0].optionId != null) {
								let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
								if(optionValueList.length>0){
									var isConfigurable = "Yes";
								} else {
									var isConfigurable = "Yes";
								}
								// var configurableProductList = optionValueList;
							} else {
								var isConfigurable = "No";
								// var configurableProductList = [];
							}
						} else {
							var isConfigurable = "No";
							// var configurableProductList = [];
						}
						// ////////////////////////////////// option product end //////////////////

						var addon_flug = '';        
						var checkAddOn  = await models.relatedProduct.findOne({attributes: ["id", "productId","selectedProductId"], where:{type : 'Add-on', productId:cat_wise_product[a].id}});
						if(checkAddOn){
							addon_flug = 'Yes';
						}else{
							addon_flug = 'No';
						}

						if(cat_wise_product[a].attr1 && cat_wise_product[a].attr1 != '' && cat_wise_product[a].attr1 != null){
							if(cat_wise_product[a].attr1 == 'nonveg'){
								var veg_only = 'nonveg';
								// var non_veg_only = 'nonveg';
							} else {
								var veg_only = 'veg';
								// var non_veg_only = 'veg';
							}
						} else {
							var veg_only = 'veg';
							// var non_veg_only = 'veg';
						}
		
						value.push({
						"product_id": cat_wise_product[a].productId,
						"category_id": cat_wise_product[a].categoryId,
						"slug": cat_wise_product[a].slug,
						"id":cat_wise_product[a].id,
						"title": cat_wise_product[a].title,
						"price": cat_wise_product[a].price,
						"veg_only": veg_only,
						// "non_veg_only":non_veg_only,
						"short_description": cat_wise_product[a].shortDescription,
						"best_sellers": cat_wise_product[a].bestSellers,
						"new_arrivals": cat_wise_product[a].newArrivals,
						"spicey": cat_wise_product[a].spicey,
						// "product_in_cart": product_in_cart,
						// "item_quantity": item_quantity,
						"customer_favourute_product": customer_favourite_product,
						"fav_pro_id": fav_pro_id,
						"product_in_cart": "false",
						"item_quantity": 0,
						"addon_product": [],
						// "is_configurable_flag" : is_configurable_flag,
						"isConfigurable":isConfigurable,
						"addon_flug" : addon_flug,
						"discountPrice": discountPrice,
						"discountTag": discountTag
						});
					}
		
					cat_wise_product_list.push({
						id: category[j].id,
						title: category[j].title,
						slug: category[j].slug,
						totalProductCount:cat_wise_product.length,
						is_active: 'false',
						product_list:value
					});
		
					// ///////////////////////// left menu category filter list start /////////////////////
					categoryArray.push({
						id: category[j].id,
						title: category[j].title,
						slug: category[j].slug,
						totalProductCount:cat_wise_product.length,
						is_active: 'false',
					});
					// ///////////////////////// left menu category filter list start /////////////////////
		
					} 
					
				}
		
				var product_list = cat_wise_product_list;
			} else {
		
				//////////////// for best seller start //////////////////
			
				var value = [];
				var best_selling_product = await sequelize.query(
				"select b.id as productId, productCategory.categoryId, b.slug, b.id, b.title, b.price, b.attr1, b.spicey, b.shortDescription, b.bestSellers, b.newArrivals, b.description, "+
				"'false' as product_in_cart, "+
				"'false' as customer_favourite_product, "+
				"0 as item_quantity "+
				"from products as b "+
				"left join productCategory on productCategory.productId = b.id "+
				"WHERE b.storeId = "+storeId+" and b.bestSellers = 'yes' and b.isConfigurable = 0 and b.status='active' "+option_valuestr+"",{ type: Sequelize.QueryTypes.SELECT })
		
				if (best_selling_product.length > 0) {
		
					for(var a=0; a < best_selling_product.length; a++){

						////////////////////////// catelog price rule start /////////////////////////////////////

						if(isCatelogPriceRule == 'yes'){
							var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, best_selling_product[a].id, best_selling_product[a].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

							var discountPrice = productCatalogPriceDetails.discountPrice;
							var discountTag = productCatalogPriceDetails.discountTag;

						} else {
							var discountPrice = null;
							var discountTag = null;
						}

						////////////////////////// catelog price rule end /////////////////////////////////////
		
		
					/**
					 * check if any configurable and addon product avaiable
					 */
					// var is_configurable_flag = '';
					// var addon_flug = '';             
					// var checkConfg = await models.products.findOne({attributes: ["id", "title"], where:{isConfigurable : best_selling_product[a].id}});
					// if(checkConfg){
					// 	is_configurable_flag = 'Yes';
					// }else{
					// 	is_configurable_flag = 'No';
					// }

					// ////////////////////////////////// option product start //////////////////
					let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:best_selling_product[a].id, storeId:storeId}});

					if(optionProductDetails.length>0){
						if(optionProductDetails[0].optionId && optionProductDetails[0].optionId != '' && optionProductDetails[0].optionId != null) {
							let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
							if(optionValueList.length>0){
								var isConfigurable = "Yes";
							} else {
								var isConfigurable = "Yes";
							}
							// var configurableProductList = optionValueList;
						} else {
							var isConfigurable = "No";
							// var configurableProductList = [];
						}
					} else {
						var isConfigurable = "No";
						// var configurableProductList = [];
					}
					// ////////////////////////////////// option product end //////////////////

					var addon_flug = '';    
					var checkAddOn  = await models.relatedProduct.findOne({attributes: ["id", "productId","selectedProductId"], where:{type : 'Add-on', productId:best_selling_product[a].id}});
					if(checkAddOn){
						addon_flug = 'Yes';
					}else{
						addon_flug = 'No';
					}
		
					if(best_selling_product[a].attr1 && best_selling_product[a].attr1 != '' && best_selling_product[a].attr1 != null){
						if(best_selling_product[a].attr1 == 'nonveg'){
							var veg_only = 'nonveg';
							// var non_veg_only = 'nonveg';
						} else {
							var veg_only = 'veg';
							// var non_veg_only = 'veg';
						}
					} else {
						var veg_only = 'veg';
						// var non_veg_only = 'veg';
					}

					value.push({
						"product_id": best_selling_product[a].productId,
						"category_id": best_selling_product[a].categoryId,
						"slug": best_selling_product[a].slug,
						"id":best_selling_product[a].id,
						"title": best_selling_product[a].title,
						"price": best_selling_product[a].price,
						"veg_only": veg_only,
						// "non_veg_only": non_veg_only,
						"short_description": best_selling_product[a].shortDescription,
						"best_sellers": best_selling_product[a].bestSellers,
						"new_arrivals": best_selling_product[a].newArrivals,
						"spicey": best_selling_product[a].spicey,
						// "product_in_cart": best_selling_product[a].product_in_cart,
						// "item_quantity": best_selling_product[a].item_quantity,
						"customer_favourute_product": best_selling_product[a].customer_favourite_product,
						"fav_pro_id": 0,
						"product_in_cart": "false",
						"item_quantity": 0,
						"addon_product": [],
						// "is_configurable_flag" : is_configurable_flag,
						"isConfigurable":isConfigurable,
						"addon_flug" : addon_flug,
						"discountPrice": discountPrice,
						"discountTag": discountTag
					});
					}
		
				cat_wise_product_list.push({
					id: '',
					title: 'Best Sellers',
					slug: 'best_sellers',
					totalProductCount:best_selling_product.length,
					is_active: 'false',
					product_list:value
				});
		
				// ///////////////////////// left menu category filter list start /////////////////////
				categoryArray.push({
					id: '',
					title: 'Best Sellers',
					slug: 'best_sellers',
					totalProductCount:best_selling_product.length,
					is_active: 'false',
				});
				// ///////////////////////// left menu category filter list start /////////////////////
		
				} else {
					var cat_wise_product_list = [];
				}
		
				///////////////////for best seller end //////////////////
		
				for(var j=0; j < category.length; j++){
		
				var value = [];
				console.log('999999999999999999999'+category[j].id);
				var cat_wise_product = await sequelize.query(
					"select b.id as productId, pc.categoryId, b.slug, b.id, b.title, b.price, b.attr1, b.spicey, b.shortDescription, b.bestSellers, b.newArrivals, b.description, "+
					"'false' as product_in_cart, "+
					"'false' as customer_favourite_product, "+
					"0 as item_quantity "+
					"from productCategory as pc "+
					"left join products as b on b.id=pc.productId "+
					"WHERE pc.storeId = "+storeId+" and pc.categoryId='"+category[j].id+"' and b.isConfigurable = 0 and b.status='active' "+option_valuestr+"",{ type: Sequelize.QueryTypes.SELECT });
		
				if (cat_wise_product.length > 0) {
		
					for(var a=0; a < cat_wise_product.length; a++){

						////////////////////////// catelog price rule start /////////////////////////////////////

						if(isCatelogPriceRule == 'yes'){

							var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, cat_wise_product[a].id, cat_wise_product[a].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

							var discountPrice = productCatalogPriceDetails.discountPrice;
							var discountTag = productCatalogPriceDetails.discountTag;

						} else {
							var discountPrice = null;
							var discountTag = null;
						}

						////////////////////////// catelog price rule end /////////////////////////////////////
		
					/**
					 * check if any configurable and addon product avaiable
					 */
					// var is_configurable_flag = '';
					// var addon_flug = '';             
					// var checkConfg = await models.products.findOne({attributes: ["id", "title"], where:{isConfigurable : cat_wise_product[a].id}});
					// if(checkConfg){
					// 	is_configurable_flag = 'Yes';
					// }else{
					// 	is_configurable_flag = 'No';
					// }

					// ////////////////////////////////// option product start //////////////////
					let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:cat_wise_product[a].id, storeId:storeId}});

					if(optionProductDetails.length>0){
						if(optionProductDetails[0].optionId && optionProductDetails[0].optionId != '' && optionProductDetails[0].optionId != null) {
							let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
							if(optionValueList.length>0){
								var isConfigurable = "Yes";
							} else {
								var isConfigurable = "Yes";
							}
							// var configurableProductList = optionValueList;
						} else {
							var isConfigurable = "No";
							// var configurableProductList = [];
						}
					} else {
						var isConfigurable = "No";
						// var configurableProductList = [];
					}
					// ////////////////////////////////// option product end //////////////////

					var addon_flug = '';  
					var checkAddOn  = await models.relatedProduct.findOne({attributes: ["id", "productId","selectedProductId"], where:{type : 'Add-on', productId:cat_wise_product[a].id}});
					if(checkAddOn){
						addon_flug = 'Yes';
					}else{
						addon_flug = 'No';
					}

					if(cat_wise_product[a].attr1 && cat_wise_product[a].attr1 != '' && cat_wise_product[a].attr1 != null){
						if(cat_wise_product[a].attr1 == 'nonveg'){
							var veg_only = 'nonveg';
							// var non_veg_only = 'nonveg';
						} else {
							var veg_only = 'veg';
							// var non_veg_only = 'veg';
						}
					} else {
						var veg_only = 'veg';
						// var non_veg_only = 'veg';
					}
		
					value.push({
						"product_id": cat_wise_product[a].productId,
						"category_id": cat_wise_product[a].categoryId,
						"slug": cat_wise_product[a].slug,
						"id":cat_wise_product[a].id,
						"title": cat_wise_product[a].title,
						"price": cat_wise_product[a].price,
						"veg_only": veg_only,
						// "non_veg_only": non_veg_only,
						"short_description": cat_wise_product[a].shortDescription,
						"best_sellers": cat_wise_product[a].bestSellers,
						"new_arrivals": cat_wise_product[a].newArrivals,
						"spicey": cat_wise_product[a].spicey,
						// "product_in_cart": cat_wise_product[a].product_in_cart,
						// "item_quantity": cat_wise_product[a].item_quantity,
						"customer_favourute_product": cat_wise_product[a].customer_favourite_product,
						"fav_pro_id": 0,
						"product_in_cart": "false",
						"item_quantity": 0,
						"addon_product": [],
						// "is_configurable_flag" : is_configurable_flag,
						"isConfigurable":isConfigurable,
						"addon_flug" : addon_flug,
						"discountPrice": discountPrice,
						"discountTag": discountTag
					});
					}
		
					cat_wise_product_list.push({
						id: category[j].id,
						title: category[j].title,
						slug: category[j].slug,
						totalProductCount:cat_wise_product.length,
						is_active: 'false',
						product_list:value
					});
		
					// ///////////////////////// left menu category filter list start /////////////////////
					categoryArray.push({
						id: category[j].id,
						title: category[j].title,
						slug: category[j].slug,
						totalProductCount:cat_wise_product.length,
						is_active: 'false',
					});
					// ///////////////////////// left menu category filter list start /////////////////////
		
				}
				
				}
				var product_list = cat_wise_product_list;
				
			}
		
			if (product_list.length > 0) {
			
				// res.status(200).send({status: 200, success: true, message: "Product found", value: product_list, category_list: categoryArray, option_value_arr:arr });
				return res.status(200).send({ data:{success:true, message: "Product found", value: product_list, category_list: categoryArray, option_value_arr:arr}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			} else {
				// res.status(200).send({status: 200, success: false, message: "No product found", value: [], category_list: categoryArray, option_value_arr:arr });
				return res.status(200).send({ data:{success:false, message: "No product found", value: [], category_list: categoryArray, option_value_arr:arr}, errorNode:{errorCode:0, errorMsg:"error"}});
			}
		
			// ///////////////// filter wise product end /////////////
		} else {
			// res.status(200).send({status: 200, success: false, message: "No Category found", value: [], category_list: [], option_value_arr:[] });
			return res.status(200).send({ data:{success:false, message: "No Category found", value: [], category_list: [], option_value_arr:[]}, errorNode:{errorCode:1, errorMsg:"error"}});
		}
	} else {
		// res.status(200).send({status: 200, success: false, message: "Store id is required", value: [], category_list: [], option_value_arr:[] });
		return res.status(200).send({ data:{success:false, message: "Store id is required", value: [], category_list: [], option_value_arr:[]}, errorNode:{errorCode:1, errorMsg:"error"}});
	}
}
  
/*********************************** filter product list latest end *********************************************/


exports.favouriteProductRemove = async function(req,res){
	var storeId = req.body.data.storeId;
	var customerId = req.body.data.customerId;
	var favProductId = req.body.data.favProductId;
	if(storeId && storeId != ''){
		if(favProductId && favProductId != ''){
			if(customerId && customerId != ''){
	
				models.favouriteProduct.destroy({
					where: { productId: favProductId, storeId:storeId, customerId:customerId },
				})
				res.status(200).send({ data:{success : true, message:"Product suuccessfully remove from your favourite list" },errorNode:{errorCode:0, errorMsg:"No Error"}});
			}else{
				res.status(200).send({ data:{success : false, message: "Customer id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
			}
		}else{
			res.status(200).send({ data:{success : false, message: "Favourite product id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
		}
	}else{
		res.status(200).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	}
}
  

exports.categoryProductSearch = async function (req, res, next) {
	console.log(req.body.data);

	var searchString = req.body.data.searchString;
	var storeId = req.body.data.storeId;
	var productArray = [];

	if(storeId && storeId != ''){
		if(searchString && searchString != ''){

			productList = await sequelize.query(
				"select b.id, b.slug, b.id, b.title, b.price "+
				"from products as b "+
				"WHERE b.storeId = "+storeId+" and LOWER(b.`title`) LIKE LOWER('%"+searchString+"%') and b.status='active' ORDER BY b.`id` DESC ",{ type: Sequelize.QueryTypes.SELECT });

			
			
			if (productList.length > 0) {

				// for(var k=0; k<productList.length; k++){

							
				// 	productArray.push({
				// 		"id":productList[k].id,
				// 		"slug":productList[k].slug,
				// 		"title":productList[k].title,
				// 	});
				// }
				res.status(200).send({ data:{success : true, value: productList },errorNode:{errorCode:0, errorMsg:"No Error"}});
			} else {
				res.status(200).send({ data:{success : true, value: [] },errorNode:{errorCode:0, errorMsg:"No Error"}});
			}
		}else{
			res.status(200).send({ data:{success : false, message: "Search string is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
		}
	}else{
		res.status(200).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	}
};


exports.homeRandumProductList = async function(req,res){
	var storeId = req.body.data.storeId;
	
	var randumProductArray = [];

	if(storeId && storeId !='')	{
		
		var randumProductList = await models.products.findAll({attributes: ['id','sku','title','slug','shortDescription','price','specialPrice','weight','size'], where: { status:'active', storeId:storeId, bestSellers: { $ne: 'yes' }}, order: Sequelize.literal('rand()'), limit: 3 });

		if(randumProductList.length>0){

			////////////////////////// catelog price rule start /////////////////////////////////////
			var catelogPriceCurrentDate = yyyy_mm_dd();
			var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
			if(catelogPriceRuleDetails.length>0){
				var isCatelogPriceRule = 'yes';
			} else {
				var isCatelogPriceRule = 'no';
			}
			////////////////////////// catelog price rule end /////////////////////////////////////

			for(var i = 0; i < randumProductList.length; i++){

				////////////////////////// catelog price rule start /////////////////////////////////////

				if(isCatelogPriceRule == 'yes'){

					var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, randumProductList[i].id, randumProductList[i].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

					var discountPrice = productCatalogPriceDetails.discountPrice;
					var discountTag = productCatalogPriceDetails.discountTag;

				} else {
					var discountPrice = null;
					var discountTag = null;
				}

				////////////////////////// catelog price rule end /////////////////////////////////////
	
				let randumProductImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:randumProductList[i].id, isPrimary: 'Yes'}});
	
				if(randumProductImages.length>0){
				if(randumProductImages[0].file!='' && randumProductImages[0].file!='' && randumProductImages[0].file!=null){
					var randum_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/'+randumProductImages[0].productId+'/'+randumProductImages[0].file;
				} else {
					var randum_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
				}
				} else {
				var randum_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
				}
	
				randumProductArray.push({
				"id":randumProductList[i].id,
				"sku":randumProductList[i].sku,
				"slug":randumProductList[i].slug,
				"title":randumProductList[i].title,
				"price":randumProductList[i].price,
				"specialPrice":randumProductList[i].specialPrice,
				"weight":randumProductList[i].weight,
				"size":randumProductList[i].size,
				"shortDescription":randumProductList[i].shortDescription,
				"thumbnailImage": randum_thumbnail_product_images,
				"discountPrice": discountPrice,
				"discountTag": discountTag,
				});
			}
			res.status(200).send({data:{success:true, details:randumProductArray},errorNode:{errorCode:0, errorMsg:"No Error"}});
		}else{
			res.status(200).send({data:{success:false, details:[]},errorNode:{errorCode:0, errorMsg:"No Error"}});
		}

	}else{
	res.status(400).send({data:{success:false, details:[], randumProductDetails:[]},errorNode:{errorCode:1, errorMsg:"Store Id is required"}});
	}
}

exports.configAndAddonProductList_bkp_23_04_2022 = async function(req,res){
	var storeId = req.body.data.storeId;
	var productId = req.body.data.productId;
	var customerId = req.body.data.customerId;
	
	var productDetailsArray = [];
	var addOnProductArray = [];

	if(storeId && storeId !='')	{
		if(productId && productId !='')	{
		
			var productDetails = await models.products.findAll({attributes: ['id','sku','title','slug','shortDescription','price','specialPrice','weight','size'], where: { storeId:storeId, id: productId} });

			if(productDetails.length>0){

				var addOnProductList = await sequelize.query("SELECT products.id, products.sku, products.title, products.slug, products.price, products.specialPrice, products.size, products.status, products.isConfigurable, products.weight, products.color, products.attr1 FROM `relatedProduct` left join products on products.id = relatedProduct.selectedProductId WHERE relatedProduct.storeId = "+storeId+" and relatedProduct.productId = "+productId+" and relatedProduct.type = 'Add-on'",{ type: Sequelize.QueryTypes.SELECT });
				if(addOnProductList.length>0){

					////////////////////////// catelog price rule start /////////////////////////////////////
					var catelogPriceCurrentDate = yyyy_mm_dd();
					var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
					if(catelogPriceRuleDetails.length>0){
						var isCatelogPriceRule = 'yes';
					} else {
						var isCatelogPriceRule = 'no';
					}
					////////////////////////// catelog price rule end /////////////////////////////////////
					
					for(var i = 0; i < addOnProductList.length; i++){

						////////////////////////// catelog price rule start /////////////////////////////////////

						if(isCatelogPriceRule == 'yes'){

							var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, addOnProductList[i].id, addOnProductList[i].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

							var discountPrice = productCatalogPriceDetails.discountPrice;
							var discountTag = productCatalogPriceDetails.discountTag;
							
							// if(catelogPriceRuleDetails[0].discountType == 'fixed'){
							// 	var productDiscountPrice = Number(addOnProductList[i].price) - Number(catelogPriceRuleDetails[0].discountValue);
							// 	var discountPrice = productDiscountPrice > 0 ? productDiscountPrice : 0;
							// 	var discountTag = 'Rs. '+catelogPriceRuleDetails[0].discountValue+'';
							// } else {
							// 	// var discountPrice = Math.round(Number(addOnProductList[i].price) - (Number(addOnProductList[i].price)*Number(catelogPriceRuleDetails[0].discountValue)/100));
							// 	// var discountTag = catelogPriceRuleDetails[0].discountValue+' %';
							// 	var discountPrice = null;
							// 	var discountTag = null;
							// }

						} else {
							var discountPrice = null;
							var discountTag = null;
						}

						////////////////////////// catelog price rule end /////////////////////////////////////

						// let addOnProductImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:addOnProductList[i].id, isPrimary: 'Yes'}});

						// if(addOnProductImages.length>0){
						// if(addOnProductImages[0].file!='' && addOnProductImages[0].file!='' && addOnProductImages[0].file!=null){
						// 	var addon_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/'+addOnProductImages[0].productId+'/'+addOnProductImages[0].file;
						// } else {
						// 	var addon_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
						// }
						// } else {
						// var addon_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
						// }

						addOnProductArray.push({
						"id":addOnProductList[i].id,
						"sku":addOnProductList[i].sku,
						"slug":addOnProductList[i].slug,
						"productName":addOnProductList[i].title,
						"price":addOnProductList[i].price,
						"color":addOnProductList[i].color,
						"size":addOnProductList[i].size,
						"weight": addOnProductList[i].weight,
						"veg_only":addOnProductList[i].attr1,
						"status":addOnProductList[i].status,
						"addon_product_in_cart":'false',
						"discountPrice": discountPrice,
						"discountTag": discountTag,
						// "thumbnailImage": addon_thumbnail_product_images,
						});
					}
				} 

				let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:productId, storeId:storeId}});

				if(optionProductDetails.length>0){
					if(optionProductDetails[0].optionId && optionProductDetails[0].optionId != '' && optionProductDetails[0].optionId != null) {
						let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
						// var isConfigurable = true;
						var configurableProductList = optionValueList;
					} else {
						// var isConfigurable = false;
						var configurableProductList = [];
					}
					// var isConfigurable = false;
					// var configurableProductList = [];
				} else {
					// var isConfigurable = false;
					var configurableProductList = [];
				}

				// for(var i = 0; i < randumProductList.length; i++){
		
					// let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productDetails[0].id, isPrimary: 'Yes'}});
		
					// if(productImages.length>0){
					// if(productImages[0].file!='' && productImages[0].file!='' && productImages[0].file!=null){
					// 	var thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file;
					// } else {
					// 	var thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
					// }
					// } else {
					// var thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
					// }
		
					productDetailsArray.push({
					"id":productDetails[0].id,
					"sku":productDetails[0].sku,
					"slug":productDetails[0].slug,
					"title":productDetails[0].title,
					"price":productDetails[0].price,
					"specialPrice":productDetails[0].specialPrice,
					"weight":productDetails[0].weight,
					"size":productDetails[0].size,
					"shortDescription":productDetails[0].shortDescription,
					"addOnProductArray" :addOnProductArray,
					"configurableProductArray": configurableProductList,
					// "thumbnailImage": thumbnail_product_images,
					});
				// }
				res.status(200).send({data:{success:true, details:productDetailsArray[0]},errorNode:{errorCode:0, errorMsg:"No Error"}});
			}else{
				res.status(200).send({data:{success:false, details:[], message: "Product not found"},errorNode:{errorCode:0, errorMsg:"Error"}});
			}
		}else{
			res.status(200).send({ data:{success : false, details:[], message: "Product id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
			}

	}else{
		res.status(200).send({ data:{success : false, details:[], message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	}
}

exports.configAndAddonProductList = async function(req,res){
	var storeId = req.body.data.storeId;
	var productId = req.body.data.productId;
	var customerId = req.body.data.customerId;
	
	var productDetailsArray = [];
	var addOnProductArray = [];

	if(storeId && storeId !='')	{
		if(productId && productId !='')	{
		
			var productDetails = await models.products.findAll({attributes: ['id','sku','title','slug','shortDescription','price','specialPrice','weight','size'], where: { storeId:storeId, id: productId} });

			if(productDetails.length>0){

				////////////////////////// catelog price rule start /////////////////////////////////////
				var catelogPriceCurrentDate = yyyy_mm_dd();
				var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
				if(catelogPriceRuleDetails.length>0){
					var isCatelogPriceRule = 'yes';
				} else {
					var isCatelogPriceRule = 'no';
				}
				////////////////////////// catelog price rule end /////////////////////////////////////

				var addOnProductList = await sequelize.query("SELECT products.id, products.sku, products.title, products.slug, products.price, products.specialPrice, products.size, products.status, products.isConfigurable, products.weight, products.color, products.attr1 FROM `relatedProduct` left join products on products.id = relatedProduct.selectedProductId WHERE relatedProduct.storeId = "+storeId+" and relatedProduct.productId = "+productId+" and relatedProduct.type = 'Add-on'",{ type: Sequelize.QueryTypes.SELECT });
				if(addOnProductList.length>0){
					
					for(var i = 0; i < addOnProductList.length; i++){

						////////////////////////// catelog price rule start /////////////////////////////////////

						if(isCatelogPriceRule == 'yes'){

							var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, addOnProductList[i].id, addOnProductList[i].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

							var discountPrice = productCatalogPriceDetails.discountPrice;
							var discountTag = productCatalogPriceDetails.discountTag;

						} else {
							var discountPrice = null;
							var discountTag = null;
						}

						////////////////////////// catelog price rule end /////////////////////////////////////

						// let addOnProductImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:addOnProductList[i].id, isPrimary: 'Yes'}});

						// if(addOnProductImages.length>0){
						// if(addOnProductImages[0].file!='' && addOnProductImages[0].file!='' && addOnProductImages[0].file!=null){
						// 	var addon_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/'+addOnProductImages[0].productId+'/'+addOnProductImages[0].file;
						// } else {
						// 	var addon_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
						// }
						// } else {
						// var addon_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
						// }

						addOnProductArray.push({
						"id":addOnProductList[i].id,
						"sku":addOnProductList[i].sku,
						"slug":addOnProductList[i].slug,
						"productName":addOnProductList[i].title,
						"price":addOnProductList[i].price,
						"color":addOnProductList[i].color,
						"size":addOnProductList[i].size,
						"weight": addOnProductList[i].weight,
						"veg_only":addOnProductList[i].attr1,
						"status":addOnProductList[i].status,
						"addon_product_in_cart":'false',
						"discountPrice": discountPrice,
						"discountTag": discountTag,
						// "thumbnailImage": addon_thumbnail_product_images,
						});
					}
				} 

				let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:p_id, storeId:storeId}});


				if(optionProductDetails.length>0){
					var configurableProductArray = [];
					for(var i=0;i<optionProductDetails.length;i++){

						// if(optionProductDetails[i].optionId && optionProductDetails[i].optionId != '' && optionProductDetails[i].optionId != null) {
							let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[i].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
							var isConfigurable = true;
							var configurableProductList = optionValueList;

							if(optionValueList.length>0){
								for(var p=0;p<optionValueList.length;p++){

									////////////////////////// catelog price rule start /////////////////////////////////////

									if(isCatelogPriceRule == 'yes'){

										var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, optionProductDetails[i].productId, Number(optionValueList[p].price), catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
					
										var discountPrice = productCatalogPriceDetails.discountPrice;
										var discountTag = productCatalogPriceDetails.discountTag;
					
									} else {
										var discountPrice = null;
										var discountTag = null;
									}

									////////////////////////// catelog price rule end /////////////////////////////////////
									
									configurableProductArray.push({
										"id":optionValueList[p].id,
										"sku":optionValueList[p].sku,
										"value":optionValueList[p].value,
										"price":optionValueList[p].price,
										"discountPrice": discountPrice,
										"discountTag": discountTag
									});
								}
							}
					}
					var configurableProductList = configurableProductArray;
				} else {
					var configurableProductList = [];
				}

				// for(var i = 0; i < randumProductList.length; i++){
		
					// let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productDetails[0].id, isPrimary: 'Yes'}});
		
					// if(productImages.length>0){
					// if(productImages[0].file!='' && productImages[0].file!='' && productImages[0].file!=null){
					// 	var thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file;
					// } else {
					// 	var thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
					// }
					// } else {
					// var thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
					// }
		
					productDetailsArray.push({
					"id":productDetails[0].id,
					"sku":productDetails[0].sku,
					"slug":productDetails[0].slug,
					"title":productDetails[0].title,
					"price":productDetails[0].price,
					"specialPrice":productDetails[0].specialPrice,
					"weight":productDetails[0].weight,
					"size":productDetails[0].size,
					"shortDescription":productDetails[0].shortDescription,
					"addOnProductArray" :addOnProductArray,
					"configurableProductArray": configurableProductList,
					// "thumbnailImage": thumbnail_product_images,
					});
				// }
				res.status(200).send({data:{success:true, details:productDetailsArray[0]},errorNode:{errorCode:0, errorMsg:"No Error"}});
			}else{
				res.status(200).send({data:{success:false, details:[], message: "Product not found"},errorNode:{errorCode:0, errorMsg:"Error"}});
			}
		}else{
			res.status(200).send({ data:{success : false, details:[], message: "Product id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
			}

	}else{
		res.status(200).send({ data:{success : false, details:[], message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	}
}

exports.productSearch = async (req, res) => {
	const storeId = req.body.data.storeId || "";
	const searchString = req.body.data.searchString || "";
	var productArray = [];
	console.log(storeId)
	if (storeId == '') {
	  res.status(200).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	} else {
		if (searchString == '') {
			res.status(200).send({ data:{success : false, message: "Search string is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
		} else {
			// var searchProductList = await sequelize.query("SELECT id, title, slug, price, specialPrice, size FROM `products` WHERE storeId = "+storeId+" and `title` LIKE '%"+searchString+"%' and status = 'active' and isConfigurable = 0",{ type: Sequelize.QueryTypes.SELECT });
			var searchProductList = await sequelize.query("SELECT id, title, slug, price, specialPrice  FROM `products` WHERE  storeId = "+storeId+"  and LOWER(`title`) LIKE LOWER('%"+searchString+"%') and status = 'active' and isConfigurable = 0",{ type: Sequelize.QueryTypes.SELECT });
		
			if(searchProductList.length >0){

				////////////////////////// catelog price rule start /////////////////////////////////////
				var catelogPriceCurrentDate = yyyy_mm_dd();
				var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
				if(catelogPriceRuleDetails.length>0){
					var isCatelogPriceRule = 'yes';
				} else {
					var isCatelogPriceRule = 'no';
				}
				////////////////////////// catelog price rule end /////////////////////////////////////

				for(var i = 0; i < searchProductList.length; i++){

					////////////////////////// catelog price rule start /////////////////////////////////////

					if(isCatelogPriceRule == 'yes'){

						var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, searchProductList[i].id, searchProductList[i].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

						var discountPrice = productCatalogPriceDetails.discountPrice;
						var discountTag = productCatalogPriceDetails.discountTag;

					} else {
						var discountPrice = null;
						var discountTag = null;
					}

					////////////////////////// catelog price rule end /////////////////////////////////////
	
					let randumProductImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:searchProductList[i].id, isPrimary: 'Yes'}});
		
					if(randumProductImages.length>0){
					if(randumProductImages[0].file!='' && randumProductImages[0].file!='' && randumProductImages[0].file!=null){
						var randum_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/'+randumProductImages[0].productId+'/'+randumProductImages[0].file;
					} else {
						var randum_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
					}
					} else {
					var randum_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
					}
		
					productArray.push({
					"id":searchProductList[i].id,
					"sku":searchProductList[i].sku,
					"slug":searchProductList[i].slug,
					"title":searchProductList[i].title,
					"price":searchProductList[i].price,
					"specialPrice":searchProductList[i].specialPrice,
					"weight":searchProductList[i].weight,
					"shortDescription":searchProductList[i].shortDescription,
					"images": randum_thumbnail_product_images,
					"discountPrice": discountPrice,
					"discountTag": discountTag,
					});
				}
				
				res.status(200).send({data:{success:true, searchList:productArray},errorNode:{errorCode:0, errorMsg:"No Error"}})
			} else {
				res.status(200).send({data:{success:true, searchList:[]},errorNode:{errorCode:0, errorMsg:"No data found"}})
			}
		}
	}
}

exports.productMetaDetails = async function(req,res){
	var storeId = req.body.data.storeId;
	var productSlug = req.body.data.productSlug;

	if(storeId && storeId !='')	{
		if(productSlug && productSlug !='')	{
		
			var productDetails = await models.products.findAll({attributes: ['id','sku','title','slug','metaTitle','metaKey','metaDescription'], where: {storeId:storeId, slug: productSlug} });

			if(productDetails.length>0){
				res.status(200).send({data:{success:true, details:productDetails[0]},errorNode:{errorCode:0, errorMsg:"No Error"}});
			}else{
				res.status(200).send({data:{success:true, details:[], message: "No product found"},errorNode:{errorCode:0, errorMsg:"No Error"}});
			}
		}else{
			res.status(400).send({data:{success:false, details:[], message: "Product slug is required"},errorNode:{errorCode:1, errorMsg:"Product slug is required"}});
		}
	}else{
	res.status(400).send({data:{success:false, details:[], message: "Store id is required"},errorNode:{errorCode:1, errorMsg:"Store Id is required"}});
	}
}


exports.appAllProductList = async function (req, res, next) {
	console.log(req.body.data);

	var customerId = req.body.data.customerId;
	var storeId = req.body.data.storeId;
	var slug = req.body.data.slug;
	var type = req.body.data.type;
	var productArray = [];

	if(storeId && storeId != ''){
		if(slug && slug != ''){

			////////////////////////// catelog price rule start /////////////////////////////////////
			var catelogPriceCurrentDate = yyyy_mm_dd();
			var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', $or: [{offerFrom: { $lte: catelogPriceCurrentDate }}, {offerTo: { $gte: catelogPriceCurrentDate }}] }});
			if(catelogPriceRuleDetails.length>0){
				var isCatelogPriceRule = 'yes';
				console.log("11111111111111111111111----"+catelogPriceRuleDetails.length)
			} else {
				var isCatelogPriceRule = 'no';
				console.log("11111111111111111111111---nononoono-")
			}
			////////////////////////// catelog price rule end /////////////////////////////////////

			if(storeId == 30){
				if(type && type != ''){

					if (type == 'category') {
			
						var category = await sequelize.query("select id,title,slug from categories where storeId = "+storeId+" and slug='" + slug + "' and status = 'Yes'",{ type: Sequelize.QueryTypes.SELECT });
						var subCategory = await sequelize.query("select id,title,slug from categories where storeId = "+storeId+" and parentCategoryId =" + category[0].id+" and status = 'Yes'",{ type: Sequelize.QueryTypes.SELECT });
						if (subCategory.length > 0) {
							var categoryId = subCategory[0].id;
							var categoryTitle = subCategory[0].title;
							var categorySlug = subCategory[0].slug;
						} else if(category.length > 0){
							var categoryId = category[0].id;
							var categoryTitle = category[0].title;
							var categorySlug = category[0].slug;
						} else {
							var categoryId = null;
							var categoryTitle = '';
							var categorySlug = '';
						}

						// ////////////////////////// catelog price rule end /////////////////////////////////////

						if(categoryId && categoryId != '' && categoryId != null){

							productList = await sequelize.query(
									"select a.productId, a.categoryId, b.slug, b.id, b.title, b.price, b.specialPrice, b.size, b.weight, b.brand "+
									"from productCategory as a "+
									"left join products as b on b.id=a.productId "+
									"WHERE a.storeId = "+storeId+" and b.isConfigurable=0 and a.categoryId='"+categoryId+"' and b.status='active' ORDER BY b.`sequence` ASC ",{ type: Sequelize.QueryTypes.SELECT });
							
							
							if (productList.length > 0) {
				
								for(var j=0;j<productList.length;j++){

									if(productList[j].brand && productList[j].brand != '' && productList[j].brand != null){
										let brandDetails = await models.brands.findOne({attributes: ['id','title'], where : {id: productList[j].brand}})
										if(brandDetails){
											var brandTitle = brandDetails.title;
										} else {
											var brandTitle = '';
										}
									} else {
										var brandTitle = '';
									}

									////////////////////////// catelog price rule start /////////////////////////////////////

									if(isCatelogPriceRule == 'yes'){

										var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productList[j].id, productList[j].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
					
										var discountPrice = productCatalogPriceDetails.discountPrice;
										var discountTag = productCatalogPriceDetails.discountTag;
					
									} else {
										var discountPrice = null;
										var discountTag = null;
									}

									////////////////////////// catelog price rule end /////////////////////////////////////
				
									let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productList[j].id}});
				
									let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId:productList[j].id}, order: [['id', 'DESC']]})
				
									let stockQuantity
									if(stockDetails.length >= 1){
										stockQuantity = stockDetails[0].stock
									}else{
										stockQuantity = 0
									}
				
									if(productImages.length>0){
										var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
									} else {
										var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
									}

									if(customerId && customerId != null && customerId != ''){
										let customerProductinCart = await models.carts.findAll({attributes:['id','itemQuantity'],where:{productId:productList[j].id,customerId:customerId,storeId:storeId}});

										if(customerProductinCart.length>0){
											var productInCart = true;
											var item_quantity = customerProductinCart[0].itemQuantity;
										} else {
											var productInCart = false;
											var item_quantity = 0;
										}
									} else {
										var productInCart = false;
										var item_quantity = 0;
									}

									// ////////////////////////////////// option product start //////////////////
									let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:productList[j].id, storeId:storeId}});

									if(optionProductDetails.length>0){
										if(optionProductDetails[0].optionId && optionProductDetails[0].optionId != '' && optionProductDetails[0].optionId != null) {
											let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
											if(optionValueList.length>0){
												var isConfigurable = true;
											} else {
												var isConfigurable = true;
											}
											var configurableProductList = optionValueList;
										} else {
											var isConfigurable = false;
											var configurableProductList = [];
										}
									} else {
										var isConfigurable = false;
										var configurableProductList = [];
									}
									// ////////////////////////////////// option product end //////////////////
									
									productArray.push({
										"productId":productList[j].productId,
										"categoryId":productList[j].categoryId,
										"id":productList[j].id,
										"slug":productList[j].slug,
										"title":productList[j].title,
										"price":productList[j].price,
										"stock": stockQuantity,
										"specialPrice":productList[j].specialPrice,
										"size":productList[j].size,
										"productInCart":productInCart,
										"item_quantity":item_quantity,
										"isConfigurable":isConfigurable,
										"configurableProduct":configurableProductList,
										"images": product_images,
										"discountPrice": discountPrice,
										"discountTag": discountTag,
										"categoryTitle": categoryTitle,
										"brandTitle": brandTitle
									});
								}
								res.status(200).send({ data:{success : true, value: productArray, categoryTitle: categoryTitle, categorySlug: categorySlug, categoryId: categoryId, total_product_count: productList.length },errorNode:{errorCode:0, errorMsg:"No Error"}});
							} else {
								res.status(200).send({ data:{success : false, message: "No product found"} ,errorNode:{errorCode:0, errorMsg:"No Error"}});
							}
						} else {
							res.status(200).send({ data:{success : false, message: "No product found"} ,errorNode:{errorCode:0, errorMsg:"No Error"}});
						}
					} else if (type == 'brand'){

						var category = await sequelize.query("select id,title,slug from brands where storeId = "+storeId+" and slug='" + slug + "' and status = 'Yes'",{ type: Sequelize.QueryTypes.SELECT });
						if (category.length > 0) {
							var categoryId = category[0].id;

							productList = await sequelize.query(
									"select b.slug, b.id, b.title, b.price, b.specialPrice, b.size, b.weight "+
									"from products as b "+
									// "left join products as b on b.id=a.productId "+
									"WHERE b.storeId = "+storeId+" and b.isConfigurable=0 and b.brand='"+categoryId+"' and b.status='active' ORDER BY b.`sequence` ASC ",{ type: Sequelize.QueryTypes.SELECT });
							
														
							if (productList.length > 0) {
				
								for(var j=0;j<productList.length;j++){

									let productCategoryDetails = await models.productCategory.findOne({attributes: ['id','categoryId'], where : {productId: productList[j].id}})

									if(productCategoryDetails){
										let categoriesDetails = await models.categories.findOne({attributes: ['id','title'], where : {id: productCategoryDetails.categoryId}})
										if(categoriesDetails){
											var categoryTitle = categoriesDetails.title;
										} else {
											var categoryTitle = '';
										}
									} else {
										var categoryTitle = '';
									}

									////////////////////////// catelog price rule start /////////////////////////////////////

									if(isCatelogPriceRule == 'yes'){

										var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productList[j].id, productList[j].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
					
										var discountPrice = productCatalogPriceDetails.discountPrice;
										var discountTag = productCatalogPriceDetails.discountTag;
					
									} else {
										var discountPrice = null;
										var discountTag = null;
									}

									////////////////////////// catelog price rule end /////////////////////////////////////
				
									let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productList[j].id}});
				
									let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId:productList[j].id}, order: [['id', 'DESC']]})
				
									let stockQuantity
									if(stockDetails.length >= 1){
										stockQuantity = stockDetails[0].stock
									}else{
										stockQuantity = 0
									}
				
									if(productImages.length>0){
										var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
									} else {
										var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
									}

									if(customerId && customerId != null && customerId != ''){
										let customerProductinCart = await models.carts.findAll({attributes:['id','itemQuantity'],where:{productId:productList[j].id,customerId:customerId,storeId:storeId}});

										if(customerProductinCart.length>0){
											var productInCart = true;
											var item_quantity = customerProductinCart[0].itemQuantity;
										} else {
											var productInCart = false;
											var item_quantity = 0;
										}
									} else {
										var productInCart = false;
										var item_quantity = 0;
									}

									// ////////////////////////////////// option product start //////////////////
									let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:productList[j].id, storeId:storeId}});

									if(optionProductDetails.length>0){
										if(optionProductDetails[0].optionId && optionProductDetails[0].optionId != '' && optionProductDetails[0].optionId != null) {
											let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
											if(optionValueList.length>0){
												var isConfigurable = true;
											} else {
												var isConfigurable = true;
											}
											var configurableProductList = optionValueList;
										} else {
											var isConfigurable = false;
											var configurableProductList = [];
										}
									} else {
										var isConfigurable = false;
										var configurableProductList = [];
									}
									// ////////////////////////////////// option product end //////////////////
				
									productArray.push({
										"productId":productList[j].id,
										"categoryId":'',
										"id":productList[j].id,
										"slug":productList[j].slug,
										"title":productList[j].title,
										"price":productList[j].price,
										"stock": stockQuantity,
										"specialPrice":productList[j].specialPrice,
										"size":productList[j].size,
										"productInCart":productInCart,
										"item_quantity":item_quantity,
										"isConfigurable":isConfigurable,
										"configurableProduct":configurableProductList,
										"images": product_images,
										"discountPrice": discountPrice,
										"discountTag": discountTag,
										"brandTitle": category[0].title,
										"categoryTitle": categoryTitle
									});
								}
								res.status(200).send({ data:{success : true, value: productArray, categoryTitle: category[0].title, categorySlug: category[0].slug, categoryId: category[0].id, total_product_count: productList.length },errorNode:{errorCode:0, errorMsg:"No Error"}});
							} else {
								res.status(200).send({ data:{success : false, message: "No product found"} ,errorNode:{errorCode:0, errorMsg:"No Error"}});
							}
						} else {
							res.status(200).send({ data:{success : true, value: [], message: "No prduct found"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
						}
						
					} else {
						res.status(200).send({ data:{success : false, message: "Type should be category or subCategory"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
					}
				} else {
					res.status(200).send({ data:{success : false, message: "Type is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
				}
			} else {
				if (slug && slug !='') {
		
					var category = await sequelize.query("select id,title,slug from categories where storeId = "+storeId+" and slug='" + slug + "' and status = 'Yes'",{ type: Sequelize.QueryTypes.SELECT });
					var categoryId = category[0].id;
					
					productList = await sequelize.query(
							"select a.productId, a.categoryId, b.slug, b.id, b.title, b.price, b.specialPrice, b.size, b.weight "+
							"from productCategory as a "+
							"left join products as b on b.id=a.productId "+
							"WHERE a.storeId = "+storeId+" and b.isConfigurable=0 and a.categoryId='"+categoryId+"' and b.status='active' ORDER BY b.`sequence` ASC LIMIT ",{ type: Sequelize.QueryTypes.SELECT });
					
					
					if (productList.length > 0) {
		
						for(var j=0;j<productList.length;j++){

							////////////////////////// catelog price rule start /////////////////////////////////////

							if(isCatelogPriceRule == 'yes'){

								var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productList[j].id, productList[j].price, catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
			
								var discountPrice = productCatalogPriceDetails.discountPrice;
								var discountTag = productCatalogPriceDetails.discountTag;
			
							} else {
								var discountPrice = null;
								var discountTag = null;
							}

							////////////////////////// catelog price rule end /////////////////////////////////////
		
							let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productList[j].id}});
		
							let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId:productList[j].id}, order: [['id', 'DESC']]})
		
							let stockQuantity
							if(stockDetails.length >= 1){
								stockQuantity = stockDetails[0].stock
							}else{
								stockQuantity = 0
							}
		
							if(productImages.length>0){
								var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
							} else {
								var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
							}

							if(customerId && customerId != null && customerId != ''){
								let customerProductinCart = await models.carts.findAll({attributes:['id','itemQuantity'],where:{productId:productList[j].id,customerId:customerId,storeId:storeId}});

								if(customerProductinCart.length>0){
									var productInCart = true;
									var item_quantity = customerProductinCart[0].itemQuantity;
								} else {
									var productInCart = false;
									var item_quantity = 0;
								}
							} else {
								var productInCart = false;
								var item_quantity = 0;
							}

							// ////////////////////////////////// option product start //////////////////
							let optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:productList[j].id, storeId:storeId}});

							if(optionProductDetails.length>0){
								if(optionProductDetails[0].optionId && optionProductDetails[0].optionId != '' && optionProductDetails[0].optionId != null) {
									let optionValueList = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId}, order: [['sorting', 'ASC']]});
									if(optionValueList.length>0){
										var isConfigurable = true;
									} else {
										var isConfigurable = true;
									}
									var configurableProductList = optionValueList;
								} else {
									var isConfigurable = false;
									var configurableProductList = [];
								}
							} else {
								var isConfigurable = false;
								var configurableProductList = [];
							}
							// ////////////////////////////////// option product end //////////////////
		
							productArray.push({
								"productId":productList[j].productId,
								"categoryId":productList[j].categoryId,
								"id":productList[j].id,
								"slug":productList[j].slug,
								"title":productList[j].title,
								"price":productList[j].price,
								"stock": stockQuantity,
								"specialPrice":productList[j].specialPrice,
								"size":productList[j].size,
								"productInCart":productInCart,
								"item_quantity":item_quantity,
								"isConfigurable":isConfigurable,
								"configurableProduct":configurableProductList,
								"images": product_images,
								"discountPrice": discountPrice,
								"discountTag": discountTag
							});
						}
						res.status(200).send({ data:{success : true, value: productArray, category_title: category[0].title, total_product_count: productList.length, categoryTitle: category[0].title, categorySlug: category[0].slug, categoryId: category[0].id },errorNode:{errorCode:0, errorMsg:"No Error"}});
					} else {
						res.status(200).send({ data:{success : false, message: "No product found"} ,errorNode:{errorCode:0, errorMsg:"No Error"}});
					}
				} else {
					res.status(200).send({ data:{success : false, message: "Slug is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
				}
			}
		}else{
			res.status(200).send({ data:{success : false, message: "Slug is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
		}
	}else{
		res.status(200).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	}
};