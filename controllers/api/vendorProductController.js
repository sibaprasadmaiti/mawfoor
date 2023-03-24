var models = require("../../models");
var config = require("../../config/config.json");
var Sequelize = require("sequelize");
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
});

var fs = require('fs')
var fs = require('file-system');


exports.vendorPushTokenUpdate= async function (req, res, next) {

  var storeId = req.body.data.storeId;
  var vendorId = req.body.data.vendorId;
  var token = req.body.data.token;

  if(storeId && storeId != '') {
    if(vendorId && vendorId != '') {
      if(token && token != '') {

        models.admins.update({ 
          pushToken: token,
          updatedBy: vendorId
        },{where:{id: vendorId, storeId:storeId}}).then(function(val) {

          return res.status(200).send({ data:{success:true, message:"Your token successfully updated"}, errorNode:{errorCode:0, errorMsg:''}});
        });

      } else {
        return res.status(200).send({ data:{success:false,message:'token is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'Vendor Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.categoryList= async function (req, res, next) {

  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    // var categoryList = await sequelize.query("SELECT id, storeId, title, slug FROM `categories` where storeId = " +storeId+" and parentCategoryId = 0 and status ='Yes'",{ type: Sequelize.QueryTypes.SELECT });
    var categoryList = await models.categories.findAll({ attributes: ['id', 'storeId', 'title', 'slug'], where: {parentCategoryId: 0, storeId:storeId, status:'Yes'}});
    // console.log(order);
    if(categoryList.length>0 ){
      return res.status(200).send({ data:{success:true, categoryList: categoryList, message:"Category found"}, errorNode:{errorCode:0, errorMsg:""}});
    } else{
      return res.status(200).send({ data:{success:false,categoryList: [], message:"Category not found"}, errorNode:{errorCode:1, errorMsg:''}});
    } 
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};



exports.productList= async function (req, res, next) {

  var storeId = req.body.data.storeId;
  var categoryId = req.body.data.categoryId;

  var limit = req.body.data.limit ? req.body.data.limit : 10 ;
  var pageNumber = req.body.data.pageNumber ? req.body.data.pageNumber : 1;

  if(pageNumber == 1){
    var offset = 0;
  }else{
    var offset = ((pageNumber)-1)*limit;
  }

  console.log("aaaaaaaaaaaaaaa---"+limit);
  console.log("bbbbbbbbbbbbbbbbbb---"+offset);

  var productArray = [];

  if(storeId && storeId != '') {
    if(categoryId && categoryId != '') {

      // var productList = await sequelize.query("SELECT DISTINCT productId FROM `productCategory` WHERE storeId = "+storeId+" and categoryId = "+categoryId+" LIMIT "+offset+", "+limit,{ type: Sequelize.QueryTypes.SELECT });
      // var productCount = await sequelize.query("SELECT DISTINCT productId FROM `productCategory` WHERE storeId = "+storeId+" and categoryId = "+categoryId,{ type: Sequelize.QueryTypes.SELECT });
      var productList = await sequelize.query("SELECT DISTINCT productCategory.productId FROM `productCategory` LEFT JOIN products ON products.id = productCategory.productId WHERE productCategory.storeId = "+storeId+" and products.isConfigurable = 0 and productCategory.categoryId = "+categoryId+" LIMIT "+offset+", "+limit,{ type: Sequelize.QueryTypes.SELECT });
      var productCount = await sequelize.query("SELECT DISTINCT productCategory.productId FROM `productCategory` LEFT JOIN products ON products.id = productCategory.productId WHERE productCategory.storeId = "+storeId+" and products.isConfigurable = 0 and productCategory.categoryId = "+categoryId,{ type: Sequelize.QueryTypes.SELECT });
    } else {
    // proUserSearchHistory = await models.search_history.findAll({ where: { user_id: uid }, attributes: [[Sequelize.literal('DISTINCT `keywords`'), 'keywords']], limit: 5 });
      // var productList = await sequelize.query("SELECT DISTINCT productId FROM `productCategory` WHERE storeId = "+storeId+" and productId is NOT null LIMIT "+offset+", "+limit,{ type: Sequelize.QueryTypes.SELECT });
      // var productCount = await sequelize.query("SELECT DISTINCT productId FROM `productCategory` WHERE storeId = "+storeId+" and productId is NOT null ",{ type: Sequelize.QueryTypes.SELECT });
      var productList = await sequelize.query("SELECT DISTINCT productCategory.productId FROM `productCategory` LEFT JOIN products ON products.id = productCategory.productId WHERE productCategory.storeId = "+storeId+" and products.isConfigurable = 0 and productCategory.productId is NOT null LIMIT "+offset+", "+limit,{ type: Sequelize.QueryTypes.SELECT });
      var productCount = await sequelize.query("SELECT DISTINCT productCategory.productId FROM `productCategory` LEFT JOIN products ON products.id = productCategory.productId WHERE productCategory.storeId = "+storeId+" and products.isConfigurable = 0 and productCategory.productId is NOT null ",{ type: Sequelize.QueryTypes.SELECT });
    }
    // console.log(order);

    if(productList.length > 0){
      for(var i=0; i<productList.length; i++){
        var productDetails = await sequelize.query("SELECT id, sku, title, slug, price, status, isConfigurable, type FROM `products` WHERE storeId = "+storeId+" and id = "+productList[i].productId,{ type: Sequelize.QueryTypes.SELECT });
        // var productCategoryList = await models.categories.findAll({ attributes: ['id', 'storeId', 'title', 'slug'], where: {parentCategoryId: 0, storeId:storeId, status:'Yes'}});
        

        for(var j=0; j<productDetails.length; j++){

          var productCategoryList = await sequelize.query("SELECT productCategory.id, productCategory.categoryId, categories.title as categoryTitle FROM `productCategory` left join categories on categories.id = productCategory.categoryId WHERE productCategory.storeId = "+storeId+" and productCategory.productId = "+productDetails[j].id,{ type: Sequelize.QueryTypes.SELECT });

          let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productDetails[j].id, isPrimary:'Yes'}});

          if(productImages.length>0){
            var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
          } else {
            var product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
          }

          let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{productId: productDetails[j].id}, order: [['id', 'DESC']]})

          let stockQuantity
          if(stockDetails.length >= 1){
            stockQuantity = stockDetails[0].stock
          }else{
            stockQuantity = 0
          }

          if(productDetails[j].isConfigurable == 0){
            var configurable = false;
          } else {
            var configurable = true;
          }

          productArray.push({
            "id":productDetails[j].id,
            "slug":productDetails[j].slug,
            "title":productDetails[j].title,
            "price":productDetails[j].price,
            "stock": stockQuantity,
            "type":productDetails[j].type,
            "sku":productDetails[j].sku,
            "status":productDetails[j].status,
            "isConfigurable": configurable,
            "images": product_images,
            "category": productCategoryList
          });
        }

      }
      return res.status(200).send({ data:{success:true, productList: productArray, productCount:productCount.length, message:"Product found"}, errorNode:{errorCode:0, errorMsg:""}});
    } else {
      return res.status(200).send({ data:{success:false,productList: [], productCount:0, message:"Product not found"}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.productStatusUpdate= async function (req, res, next) {

  var productId = req.body.data.productId;
  var storeId = req.body.data.storeId;
  var status = req.body.data.status;

  if(storeId && storeId != '') {
    if(productId && productId != '') {
      if(status && status != '') {
    
        models.products.update({ 
          status: status
        },{where:{id: productId, storeId:storeId}}).then(function(val) {
          var msg = '';
          msg="Product status successfully updated";
          return res.status(200).send({ data:{success:true, message:msg}, errorNode:{errorCode:0, errorMsg:''}});
        });

      } else {
        return res.status(200).send({ data:{success:false,message:'Status Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'Product Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.productDetails= async function (req, res, next) {

  var storeId = req.body.data.storeId;
  var productId = req.body.data.productId;

  var productArray = [];
  var productImageArray = [];

  var upSellProductArray = [];
  var crossSellProductArray = [];
  var relatedProductArray = [];
  var addOnProductArray = [];

  var productSubCategoryArray = [];
  var productCategoryArray = [];

  if(storeId && storeId != '') {
    if(productId && productId != '') {
      var productDetails = await sequelize.query("SELECT id, storeId, sku, title, slug, price, shortDescription, description, specialPrice, specialPriceFrom, specialPriceTo, color, size, weight, bestSellers, newArrivals, spicey, attr1, visibility, type, status, isConfigurable, metaTitle, metaDescription, metaKey, metaImage, inventory, attr1, attr2, attr3, attr4, attr5, attr6, attr7, attr8, attr9, attr10 FROM `products` WHERE storeId = "+storeId+" and id = "+productId,{ type: Sequelize.QueryTypes.SELECT });
    
      if(productDetails.length > 0){

        if(productDetails[0].metaImage && productDetails[0].metaImage != '' && productDetails[0].metaImage != null) {
          var product_meta_images = req.app.locals.baseurl+'admin/products/image/'+productId+'/'+productDetails[0].metaImage;
        } else {
          // var product_meta_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
          var product_meta_images = null;
        }

        var configurableProductList = await sequelize.query("SELECT id, sku, title, slug, price,  specialPrice, size, status, isConfigurable FROM `products` WHERE storeId = "+storeId+" and isConfigurable = "+productId,{ type: Sequelize.QueryTypes.SELECT });
        if(configurableProductList.length>0){
          var configurableProduct = true;
        } else {
          var configurableProduct = false;
        }

        var upSellProductList = await sequelize.query("SELECT products.id, products.sku, products.title, products.slug, products.price, products.specialPrice, products.size, products.status, products.isConfigurable FROM `relatedProduct` left join products on products.id = relatedProduct.selectedProductId WHERE relatedProduct.storeId = "+storeId+" and relatedProduct.productId = "+productId+"  and relatedProduct.type = 'Up-Sells'",{ type: Sequelize.QueryTypes.SELECT });
        if(upSellProductList.length>0){
          for(var i = 0; i < upSellProductList.length; i++){

            let upsellThumbnailProductImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:upSellProductList[i].id, isPrimary: 'Yes'}});

            if(upsellThumbnailProductImages.length>0){
              if(upsellThumbnailProductImages[0].file!='' && upsellThumbnailProductImages[0].file!='' && upsellThumbnailProductImages[0].file!=null){
                var upsell_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/'+upsellThumbnailProductImages[0].productId+'/'+upsellThumbnailProductImages[0].file;
              } else {
                var upsell_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
              }
            } else {
              var upsell_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
            }

            upSellProductArray.push({
              "id":upSellProductList[i].id,
              "sku":upSellProductList[i].sku,
              "slug":upSellProductList[i].slug,
              "productName":upSellProductList[i].title,
              "price":upSellProductList[i].price,
              "specialPrice":upSellProductList[i].specialPrice,
              "size":upSellProductList[i].size,
              "status":upSellProductList[i].status,
              "thumbnailImage": upsell_thumbnail_product_images,
              "configurableProduct": upSellProductList[i].isConfigurable,
              "isUpdated":"yes"
            });
          }
        } 

        var crossSellProductList = await sequelize.query("SELECT products.id, products.sku, products.title, products.slug, products.price, products.specialPrice, products.size, products.status, products.isConfigurable FROM `relatedProduct` left join products on products.id = relatedProduct.selectedProductId WHERE relatedProduct.storeId = "+storeId+" and relatedProduct.productId = "+productId+" and relatedProduct.type = 'Cross-Sells'",{ type: Sequelize.QueryTypes.SELECT });
        if(crossSellProductList.length>0){
          for(var i = 0; i < crossSellProductList.length; i++){

            let upsellThumbnailProductImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:crossSellProductList[i].id, isPrimary: 'Yes'}});

            if(upsellThumbnailProductImages.length>0){
              if(upsellThumbnailProductImages[0].file!='' && upsellThumbnailProductImages[0].file!='' && upsellThumbnailProductImages[0].file!=null){
                var upsell_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/'+upsellThumbnailProductImages[0].productId+'/'+upsellThumbnailProductImages[0].file;
              } else {
                var upsell_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
              }
            } else {
              var upsell_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
            }

            crossSellProductArray.push({
              "id":crossSellProductList[i].id,
              "sku":crossSellProductList[i].sku,
              "slug":crossSellProductList[i].slug,
              "productName":crossSellProductList[i].title,
              "price":crossSellProductList[i].price,
              "specialPrice":crossSellProductList[i].specialPrice,
              "size":crossSellProductList[i].size,
              "status":crossSellProductList[i].status,
              "thumbnailImage": upsell_thumbnail_product_images,
              "configurableProduct": crossSellProductList[i].isConfigurable,
              "isUpdated":"yes"
            });
          }
        } 

        var relatedProductList = await sequelize.query("SELECT products.id, products.sku, products.title, products.slug, products.price, products.specialPrice, products.size, products.status, products.isConfigurable FROM `relatedProduct` left join products on products.id = relatedProduct.selectedProductId WHERE relatedProduct.storeId = "+storeId+" and relatedProduct.productId = "+productId+" and relatedProduct.type = 'Related'",{ type: Sequelize.QueryTypes.SELECT });
        if(relatedProductList.length>0){
          for(var i = 0; i < relatedProductList.length; i++){

            let relatedProductImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:relatedProductList[i].id, isPrimary: 'Yes'}});

            if(relatedProductImages.length>0){
              if(relatedProductImages[0].file!='' && relatedProductImages[0].file!='' && relatedProductImages[0].file!=null){
                var related_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/'+relatedProductImages[0].productId+'/'+relatedProductImages[0].file;
              } else {
                var related_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
              }
            } else {
              var related_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
            }

            relatedProductArray.push({
              "id":relatedProductList[i].id,
              "sku":relatedProductList[i].sku,
              "slug":relatedProductList[i].slug,
              "productName":relatedProductList[i].title,
              "price":relatedProductList[i].price,
              "specialPrice":relatedProductList[i].specialPrice,
              "size":relatedProductList[i].size,
              "status":relatedProductList[i].status,
              "thumbnailImage": related_thumbnail_product_images,
              "configurableProduct": relatedProductList[i].isConfigurable,
              "isUpdated":"yes"
            });
          }
        } 

        var addOnProductList = await sequelize.query("SELECT products.id, products.sku, products.title, products.slug, products.price, products.specialPrice, products.size, products.status, products.isConfigurable FROM `relatedProduct` left join products on products.id = relatedProduct.selectedProductId WHERE relatedProduct.storeId = "+storeId+" and relatedProduct.productId = "+productId+" and relatedProduct.type = 'Add-on'",{ type: Sequelize.QueryTypes.SELECT });
        if(addOnProductList.length>0){
          for(var i = 0; i < addOnProductList.length; i++){

            let addOnProductImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:addOnProductList[i].id, isPrimary: 'Yes'}});

            if(addOnProductImages.length>0){
              if(addOnProductImages[0].file!='' && addOnProductImages[0].file!='' && addOnProductImages[0].file!=null){
                var addon_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/'+addOnProductImages[0].productId+'/'+addOnProductImages[0].file;
              } else {
                var addon_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
              }
            } else {
              var addon_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
            }

            addOnProductArray.push({
              "id":addOnProductList[i].id,
              "sku":addOnProductList[i].sku,
              "slug":addOnProductList[i].slug,
              "productName":addOnProductList[i].title,
              "price":addOnProductList[i].price,
              "specialPrice":addOnProductList[i].specialPrice,
              "size":addOnProductList[i].size,
              "status":addOnProductList[i].status,
              "thumbnailImage": addon_thumbnail_product_images,
              "configurableProduct": addOnProductList[i].isConfigurable,
              "isUpdated":"yes"
            });
          }
        } 

        var productCategoryList = await sequelize.query("SELECT productCategory.id, productCategory.categoryId, categories.parentCategoryId, categories.title as categoryTitle FROM `productCategory` left join categories on categories.id = productCategory.categoryId WHERE productCategory.storeId = "+storeId+" and productCategory.productId = "+productId,{ type: Sequelize.QueryTypes.SELECT });

        if(productCategoryList.length>0){
          for(var i = 0; i < productCategoryList.length; i++){
            if(productCategoryList[i].parentCategoryId == 0){
              productCategoryArray.push({
                // "id":productCategoryList[i].id,
                "categoryId":productCategoryList[i].categoryId,
                // "categoryTitle":productCategoryList[i].categoryTitle,
                
              });
            } else {

              productCategoryArray.push({
                // "id":productCategoryList[i].id,
                "categoryId":productCategoryList[i].parentCategoryId,
                // "categoryTitle":productCategoryList[i].categoryTitle,
                
              });

              productSubCategoryArray.push({
                // "id":productCategoryList[i].id,
                "categoryId":productCategoryList[i].categoryId,
                // "categoryTitle":productCategoryList[i].categoryTitle,
                
              });
            }
          }
        }

        let thumbnailProductImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productId, isPrimary: 'Yes'}});

        if(thumbnailProductImages.length>0){
          if(thumbnailProductImages[0].file!='' && thumbnailProductImages[0].file!='' && thumbnailProductImages[0].file!=null){
            var thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/'+thumbnailProductImages[0].productId+'/'+thumbnailProductImages[0].file;
          } else {
            // var thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
            var thumbnail_product_images = null;
          }
          // var thumbnail_product_images = (thumbnailProductImages[0].file!='' && thumbnailProductImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+thumbnailProductImages[0].productId+'/'+thumbnailProductImages[0].file : null;
        } else {
          // var thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
          var thumbnail_product_images = null;
        }

        let productImages = await models.productImages.findAll({attributes:['id','productId','file'],where:{productId:productId, isPrimary: 'No'}});

        if(productImages.length>0){
          for(var i = 0; i < productImages.length; i++){
            productImageArray.push({
              "id":productImages[i].id,
              "image": (productImages[i].file!='' && productImages[i].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[i].productId+'/'+productImages[i].file : req.app.locals.baseurl+'admin/products/image/no_image.jpg'
            });
          }
        }

        let productinventory = await models.inventory.findAll({attributes:['id','stock'],where:{productId:productId, storeId:storeId}, order: [['id', 'DESC']]});
        if(productDetails[0].inventory == 'manageStock'){
          if(productinventory.length >0){
            stockQuantity = productinventory[0].stock;
          }else{
            stockQuantity = 0;
          }
        } else {
          stockQuantity = 0;
        }


        var optionProductDetails = await models.optionProduct.findAll({attributes:['id','productId','optionId'],where:{productId:productId, storeId:storeId}});
        if(optionProductDetails.length>0){
          var optionValueList = await models.optionValue.findAll({attributes:['id','optionId','sku','value','price','status'],where:{optionId:optionProductDetails[0].optionId, storeId:storeId} });
          var optionMasterDetails = await models.optionMaster.findAll({attributes:['id','isRequired','title','type'],where:{id:optionProductDetails[0].optionId, storeId:storeId} });
          if(optionMasterDetails.length>0){
            var optionTitle = optionMasterDetails[0].title;
            var optionType = optionMasterDetails[0].type;
            var optionIsRequired = optionMasterDetails[0].isRequired;
          } else {
            var optionTitle = null;
            var optionType = null;
            var optionIsRequired = null;
          }
        } else {
          var optionValueList = [];
          var optionTitle = null;
          var optionType = null;
          var optionIsRequired = null;
        }

        productArray.push({
          "id":productDetails[0].id,
          "storeId":productDetails[0].storeId,
          "sku":productDetails[0].sku,
          "slug":productDetails[0].slug,
          "title":productDetails[0].title,
          "price":productDetails[0].price,
          "specialPrice":productDetails[0].specialPrice,
          "specialPriceFrom":productDetails[0].specialPriceFrom,
          "specialPriceTo":productDetails[0].specialPriceTo,
          "shortDescription":productDetails[0].shortDescription,
          "description":productDetails[0].description,
          "bestSellers":productDetails[0].bestSellers,
          "newArrivals":productDetails[0].newArrivals,
          "spicey":productDetails[0].spicey,
          "attr1":productDetails[0].attr1,
          "color":productDetails[0].color,
          "size":productDetails[0].size,
          "type":productDetails[0].type,
          "visibility":productDetails[0].visibility,
          "weight":productDetails[0].weight,
          "metaTitle":productDetails[0].metaTitle,
          "metaKey":productDetails[0].metaKey,
          "metaDescription":productDetails[0].metaDescription,
          "metaImages": product_meta_images,
          "status":productDetails[0].status,
          "invStatus":productDetails[0].inventory,
          "attr1":productDetails[0].attr1,
          "attr2":productDetails[0].attr2,
          "attr3":productDetails[0].attr3,
          "attr4":productDetails[0].attr4,
          "attr5":productDetails[0].attr5,
          "attr6":productDetails[0].attr6,
          "attr7":productDetails[0].attr7,
          "attr8":productDetails[0].attr8,
          "attr9":productDetails[0].attr9,
          "attr10":productDetails[0].attr10,
          "quantity":stockQuantity,
          "thumbnailImages": thumbnail_product_images,
          // "image": thumbnail_product_images,
          "productImage": productImageArray,
          // "category": productCategoryList,
          "category": productCategoryArray,
          "subCategory": productSubCategoryArray,
          "configurableProduct": configurableProduct,
          "configurableProductList": configurableProductList,
          "upSellProductList": upSellProductArray,
          "crossSellProductList":crossSellProductArray,
          "relatedProductList":relatedProductArray,
          "addOnProductList":addOnProductArray,
          "optionTitle":optionTitle,
          "optionType":optionType,
          "optionIsRequired":optionIsRequired,
          "optionValueArr":optionValueList,
        });

        return res.status(200).send({ data:{success:true, productDetails: productArray[0], message:"Product found"}, errorNode:{errorCode:0, errorMsg:""}});
      } else {
        return res.status(200).send({ data:{success:false,productDetails: [], message:"Product not found"}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'Product id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.productAdd= async function (req, res, next) {

  var userId = req.body.data.userId;
  var storeId = req.body.data.storeId;
  var title = req.body.data.title;
  var shortDescription = req.body.data.shortDescription;
  var description = req.body.data.description;
  var price = req.body.data.price;
  var specialPrice = req.body.data.specialPrice;
  var specialPriceFrom = req.body.data.specialPriceFrom;
  var specialPriceTo = req.body.data.specialPriceTo;
  var bestSellers = req.body.data.bestSellers;
  var newArrivals = req.body.data.newArrivals;
  var spicey = req.body.data.spicey || 'no';
  var weight = req.body.data.weight;
  var color = req.body.data.color;
  var size = req.body.data.size;
  var type = req.body.data.type;
  var visibility = req.body.data.visibility;
  var status = req.body.data.status;

  var attr1 = req.body.data.attr1 || "" ;
  var attr2 = req.body.data.attr2 || "" ;
  var attr3 = req.body.data.attr3 || "" ;
  var attr4 = req.body.data.attr4 || "" ;
  var attr5 = req.body.data.attr5 || "" ;
  var attr6 = req.body.data.attr6 || "" ;
  var attr7 = req.body.data.attr7 || "" ;
  var attr8 = req.body.data.attr8 || "" ;
  var attr9 = req.body.data.attr9 || "" ;
  var attr10 = req.body.data.attr10 || "" ;

  var invStatus	 = req.body.data.invStatus;
  var quantity = req.body.data.quantity;

  var metaTitle	 = req.body.data.metaTitle	;
  var metaKey = req.body.data.metaKey;
  var metaDescription = req.body.data.metaDescription;

  var productCatArr = req.body.data.productCatArr ? req.body.data.productCatArr :[];
  var productSubCatArr = req.body.data.productSubCatArr ? req.body.data.productSubCatArr :[];
  var configurableProductArr = req.body.data.configurableProductArr ? req.body.data.configurableProductArr : [];
  var upSellProductArr = req.body.data.upSellProductArr ? req.body.data.upSellProductArr : [];
  var crossSellProductArr = req.body.data.crossSellProductArr ? req.body.data.crossSellProductArr : [];
  var relatedProductArr = req.body.data.relatedProductArr ? req.body.data.relatedProductArr : [];
  var addOnProductArr = req.body.data.addOnProductArr ? req.body.data.addOnProductArr : [];
  var productImageArr = req.body.data.productImageArr ? req.body.data.productImageArr : [];
  var attributesArr = req.body.data.attributesArr ? req.body.data.attributesArr : [];

  var thumbnailImages = req.body.data.thumbnailImages;
  var thumbnailImagesExt = req.body.data.thumbnailImagesExt;

  var metaImage = req.body.data.metaImage;
  var metaImageExt = req.body.data.metaImageExt;

  var productId = req.body.data.productId;

  var optionTitle = req.body.data.optionTitle;
  var optionType = req.body.data.optionType;
  var optionIsRequired = req.body.data.optionIsRequired;
  var optionValueArr = req.body.data.optionValueArr ? req.body.data.optionValueArr : [];

  console.log("optionTitleoptionTitleoptionTitle--"+optionTitle)
  console.log("optionTypeoptionTypeoptionType--"+optionType)
  console.log("optionValueArroptionValueArroptionValueArr--"+optionValueArr.length)

  if(storeId && storeId != '') {
    if(productId && productId != '') {

      if(productCatArr.length > 0) {
        if(title && title != '' && price && price != '' && type && type != '' && status && status != '') {

          var productDetails = await models.products.findOne({attributes: ['id','type'], where:{storeId:storeId, id:productId}})
          if(productDetails.type != 'Simple') {

            if(type == 'Addon') {
              var optionProductValueDetails = await models.optionProduct.findAll({attributes: ['id','optionId', 'productId'], where:{storeId:storeId, productId:productId}})
              if(optionProductValueDetails.length > 0) {

                models.optionProduct.destroy({ 
                  where:{optionId:optionProductValueDetails[0].optionId, storeId: storeId}
                }).then(async function(val) {

                  models.optionValue.destroy({ 
                    where:{optionId:optionProductValueDetails[0].optionId, storeId: storeId}
                  }).then(async function(val) {
                    
                    models.optionMaster.destroy({ 
                      where:{id:optionProductValueDetails[0].optionId, storeId: storeId}
                    })
                  })
                })


                // models.optionProduct.destroy({ 
                //   where:{optionId:optionProductValueDetails[0].optionId, storeId: storeId}
                // })

                // models.optionValue.destroy({ 
                //   where:{optionId:optionProductValueDetails[0].optionId, storeId: storeId}
                // })

                // Configurable,Addon,Simple
              }
            } else if(type == 'Configurable'){
              var addonProductDetails = await models.relatedProduct.findAll({attributes: ['id'], where:{storeId:storeId, productId:productId, type : 'Add-on'}})
              if(addonProductDetails.length > 0) {
                models.relatedProduct.destroy({ 
                  where:{productId:productId, storeId: storeId, type : 'Add-on'}
                })
              }
            } else if(type == 'Simple'){

              var addonProductDetails = await models.relatedProduct.findAll({attributes: ['id'], where:{storeId:storeId, productId:productId, type : 'Add-on'}})
              if(addonProductDetails.length > 0) {
                models.relatedProduct.destroy({ 
                  where:{productId:productId, storeId: storeId, type : 'Add-on'}
                })
              }

              var optionProductValueDetails = await models.optionProduct.findAll({attributes: ['id','optionId', 'productId'], where:{storeId:storeId, productId:productId}})
              if(optionProductValueDetails.length > 0) {
                
                models.optionProduct.destroy({ 
                  where:{optionId:optionProductValueDetails[0].optionId, storeId: storeId}
                }).then(async function(val) {

                  models.optionValue.destroy({ 
                    where:{optionId:optionProductValueDetails[0].optionId, storeId: storeId}
                  }).then(async function(val) {
                    
                    models.optionMaster.destroy({ 
                      where:{id:optionProductValueDetails[0].optionId, storeId: storeId}
                    })
                  })
                })

                // Configurable,Addon,Simple
              }

            } 
          }

          if(invStatus == 'manageStock') {
            var inventory = 'manageStock';
            models.inventory.create({
              storeId: storeId,
              stock : quantity,
              productId : productId,
              status : 'Yes',
              remarks: quantity+" new quantity added"
            });
          } else {
            var inventory = 'alwaysInStock';
          }

          models.products.update({ 
            storeId: storeId,
            title: title,
            isConfigurable: 0,
            shortDescription: shortDescription,
            description: description,
            price: price,
            specialPrice: specialPrice,
            specialPriceFrom: specialPriceFrom,
            specialPriceTo: specialPriceTo,
            bestSellers: bestSellers,
            newArrivals: newArrivals,
            spicey: spicey,
            color: color,
            size: size,
            type: type,
            visibility: visibility,
            weight: weight,
            metaTitle: metaTitle,
            metaKey: metaKey,
            metaDescription: metaDescription,
            status: status,
            inventory:inventory,
            createdBy: userId,
            // attr1: attr1,
            // attr2: attr2,
            // attr3: attr3,
            // attr4: attr4,
            // attr5: attr5,
            // attr6: attr6,
            // attr7: attr7,
            // attr8: attr9,
            // attr9: attr1,
            // attr10: attr10,
          },{ where: { id: productId } }).then(async function(val) {

            var dir = './public/admin/products/image/'+productId; 
            console.log(dir);
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);                  
            }

            if(thumbnailImages && thumbnailImages != '' && thumbnailImagesExt && thumbnailImagesExt !='') {

              var thumbnailImagesDetails = await models.productImages.findOne({ attributes: ["file","id"], where: { storeId:storeId, productId: productId, isPrimary:'Yes' } });
              if(thumbnailImagesDetails) {
                if(thumbnailImagesDetails.file && thumbnailImagesDetails.file != '' && thumbnailImagesDetails.file != null) {

                  if(fs.existsSync(__dirname + '/../../public/admin/products/image/'+ productId +'/'+thumbnailImagesDetails.file)){
                    fs.unlink(__dirname +  '/../../public/admin/products/image/'+ productId +'/'+thumbnailImagesDetails.file, (err) => {
                      if (err) throw err;
                      console.log('successfully deleted /tmp/hello');
                    });
                  }
                  models.productImages.destroy({ 
                    where:{id:thumbnailImagesDetails.id}
                  })
                }
              }
              
              var imageTitle = Date.now();
              var path = './public/admin/products/image/'+ productId +'/'+imageTitle+'.'+thumbnailImagesExt;
              var productThumbnail =imageTitle+'.'+thumbnailImagesExt;   
              try {
                  const imgdata = thumbnailImages;
                  const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                  fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                  models.productImages.create({
                    storeId : storeId,
                    productId : productId,
                    file : productThumbnail,
                    isPrimary : 'Yes',
                  });         
              } catch (e) {
                  next(e);
              }
            }


            for(var i=0; i< productImageArr.length; i++){
              if(productImageArr[i].image && productImageArr[i].image != '' && productImageArr[i].imageExt && productImageArr[i].imageExt !='') {
                var imageTitle = Date.now();
                var path = './public/admin/products/image/'+ productId +'/'+imageTitle+'.'+productImageArr[i].imageExt;
                var productImage =imageTitle+'.'+productImageArr[i].imageExt;   
                try {
                    const imgdata = productImageArr[i].image;
                    const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                    fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                    models.productImages.create({
                      storeId : storeId,
                      productId : productId,
                      file : productImage,
                      isPrimary : 'No',
                    });         
                } catch (e) {
                    next(e);
                }
              }
            }

            if(metaImage && metaImage != '' && metaImageExt && metaImageExt !='') {

              var metaImageDetails = await models.products.findOne({ attributes: ["metaImage","id"], where: { storeId:storeId, id: productId } });
              if(metaImageDetails.metaImage && metaImageDetails.metaImage != '' && metaImageDetails.metaImage != null) {

                if(fs.existsSync(__dirname + '/../../public/admin/products/image/'+ productId +'/'+metaImageDetails.metaImage)){
                  fs.unlink(__dirname +  '/../../public/admin/products/image/'+ productId +'/'+metaImageDetails.metaImage, (err) => {
                    if (err) throw err;
                    console.log('successfully deleted /tmp/hello');
                  });
                }
              }
              
              var imageTitle = Date.now();
              var path = './public/admin/products/image/'+ productId +'/'+imageTitle+'.'+metaImageExt;
              var OGImage =imageTitle+'.'+metaImageExt;   
              try {
                  const imgdata = metaImage;
                  const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                  fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                  models.products.update({
                    metaImage : OGImage,
                  },{ where: { id: productId } });       
              } catch (e) {
                  next(e);
              }
            }

            models.productCategory.destroy({ 
              where:{storeId:storeId, productId: productId}
            }).then(async function(productCategory) {
              if(productSubCatArr.length > 0){
                for(var i=0; i< productSubCatArr.length; i++){
                  var productCategoryDetails = await models.productCategory.findAll({ attributes: ["id"], where: { storeId:storeId, productId: productId, categoryId:productSubCatArr[i] } });
                  if(productCategoryDetails.length <= 0){

                    const subCategoryDetails = await models.categories.findAll({where:{storeId:storeId, id:productSubCatArr[i]}})

                    models.productCategory.create({
                      storeId: storeId,
                      categoryId : productSubCatArr[i],
                      productId : productId,
                      parentCategoryId : subCategoryDetails[0].parentCategoryId,
                    })
                  }
                }
              } else {
                for(var i=0; i< productCatArr.length; i++){
                  var productCategoryDetails = await models.productCategory.findAll({ attributes: ["id"], where: { storeId:storeId, productId: productId, categoryId:productCatArr[i] } });
                  if(productCategoryDetails.length <= 0){
    
                  // } else {
                    models.productCategory.create({
                      storeId: storeId,
                      categoryId : productCatArr[i],
                      productId : productId,
                      parentCategoryId : productCatArr[i],
                      // position : i
                    })
                  }
                }
              }
            })
            // for(var i=0; i< productCatArr.length; i++){
            //   var productCategoryDetails = await models.productCategory.findAll({ attributes: ["id"], where: { storeId:storeId, productId: productId, categoryId:productCatArr[i] } });
            //   if(productCategoryDetails.length <= 0){

            //   // } else {
            //     models.productCategory.create({
            //       storeId: storeId,
            //       categoryId : productCatArr[i],
            //       productId : productId,
            //       // position : i
            //     })
            //   }
            // }
            console.log("upSellProductArr.length--111111111111111111---"+upSellProductArr.length)
            if(upSellProductArr.length > 0) {
              console.log("upSellProductArr.length-----"+upSellProductArr.length)
              models.relatedProduct.destroy({ 
                where:{productId:productId, storeId: storeId, type : 'Up-Sells'}
              }).then(async function(val) {
                for(var i=0; i< upSellProductArr.length; i++){
                  if(upSellProductArr[i].id && upSellProductArr[i].id != '' && upSellProductArr[i].id != null) {
                    models.relatedProduct.create({
                      storeId: storeId,
                      selectedProductId : upSellProductArr[i].id,
                      productId : productId,
                      type : 'Up-Sells'
                    })
                  }
                }
              })
            }

            console.log("crossSellProductArr.length-----"+upSellProductArr.length)
            if(crossSellProductArr.length > 0) {
              console.log("crossSellProductArr.length-----"+upSellProductArr.length)
              models.relatedProduct.destroy({ 
                where:{productId:productId, storeId: storeId, type : 'Cross-Sells'}
              }).then(async function(val) {
                for(var i=0; i< crossSellProductArr.length; i++){
                  if(crossSellProductArr[i].id && crossSellProductArr[i].id != '' && crossSellProductArr[i].id != null) {
                    models.relatedProduct.create({
                      storeId: storeId,
                      selectedProductId : crossSellProductArr[i].id,
                      productId : productId,
                      type : 'Cross-Sells'
                    })
                  }
                }
              })
            }

            console.log("relatedProductArr.length-----"+upSellProductArr.length)
            if(relatedProductArr.length > 0) {
              console.log("relatedProductArr.length-----"+upSellProductArr.length)
              models.relatedProduct.destroy({ 
                where:{productId:productId, storeId: storeId, type : 'Related'}
              }).then(async function(val) {
                for(var i=0; i< relatedProductArr.length; i++){
                  if(relatedProductArr[i].id && relatedProductArr[i].id != '' && relatedProductArr[i].id != null) {
                    models.relatedProduct.create({
                      storeId: storeId,
                      selectedProductId : relatedProductArr[i].id,
                      productId : productId,
                      type : 'Related'
                    })
                  }
                }
              })
            }

            console.log("addOnProductArr.length-----"+upSellProductArr.length)
            if(addOnProductArr.length > 0) {
              console.log("addOnProductArr.length-----"+upSellProductArr.length)
              models.relatedProduct.destroy({ 
                where:{productId:productId, storeId: storeId, type : 'Add-on'}
              }).then(async function(val) {
                for(var i=0; i< addOnProductArr.length; i++){
                  if(addOnProductArr[i].id && addOnProductArr[i].id != '' && addOnProductArr[i].id != null) {
                    models.relatedProduct.create({
                      storeId: storeId,
                      selectedProductId : addOnProductArr[i].id,
                      productId : productId,
                      type : 'Add-on'
                    })
                  }
                }
              })
            }

            if(configurableProductArr.length > 0) {
              for(var i=0; i< configurableProductArr.length; i++){
                if(configurableProductArr[i].id && configurableProductArr[i].id != '' && configurableProductArr[i].id != null) {

                  models.products.update({ 
                    isConfigurable: productId,
                    price: configurableProductArr[i].price,
                    specialPrice: configurableProductArr[i].specialPrice,
                    size: configurableProductArr[i].size,
                    status: configurableProductArr[i].status,
                  },{ where: { id: configurableProductArr[i].id } });

                } else {
                  
                  const productDetails = await models.products.findAll({where:{storeId:storeId, id:productId}})
                  if(productDetails.length > 0) {
                    const productCategoryDetails = await models.productCategory.findAll({where:{storeId:storeId, productId:productId}})

                    models.products.create({ 
                      storeId: storeId,
                      title: productDetails[0].title,
                      isConfigurable: productId,
                      shortDescription: productDetails[0].shortDescription,
                      description: productDetails[0].description,
                      price: configurableProductArr[i].price,
                      specialPrice: configurableProductArr[i].specialPrice,
                      specialPriceFrom: productDetails[0].specialPriceFrom,
                      specialPriceTo: productDetails[0].specialPriceTo,
                      bestSellers: productDetails[0].bestSellers,
                      newArrivals: productDetails[0].newArrivals,
                      spicey: productDetails[0].spicey,
                      color: productDetails[0].color,
                      size: configurableProductArr[i].size,
                      type: productDetails[0].type,
                      visibility: productDetails[0].visibility,
                      weight: productDetails[0].weight,
                      metaTitle: productDetails[0].metaTitle,
                      metaKey: productDetails[0].metaKey,
                      metaDescription: productDetails[0].metaDescription,
                      status: configurableProductArr[i].status,
                      attr1: productDetails[0].attr1,
                      attr2: productDetails[0].attr2,
                      attr3: productDetails[0].attr3,
                      attr4: productDetails[0].attr4,
                      attr5: productDetails[0].attr5,
                      attr6: productDetails[0].attr6,
                      attr7: productDetails[0].attr7,
                      attr8: productDetails[0].attr9,
                      attr9: productDetails[0].attr1,
                      attr10: productDetails[0].attr10,
                    }).then(async function(configurableProduct) {
                      if(productCategoryDetails.length > 0){
                        for(var i=0; i< productCategoryDetails.length; i++){
                          models.productCategory.create({
                            storeId: storeId,
                            categoryId : productCategoryDetails[i].categoryId,
                            productId : configurableProduct.id,
                          })
                        }
                      }
                    });
                  }
                }
                
              }
            }

            // //////////////////////////// option product update start //////////////////////
            if(optionValueArr.length > 0) {
              console.log("aaaaaaaaaaaaaaaaaaaaaaaa---"+optionValueArr.length)
              var productSku = await models.products.findOne({attributes: ['title', 'sku'], where:{id:productId}})
              var optionProductValueDetails = await models.optionProduct.findAll({attributes: ['id','optionId', 'productId'], where:{storeId:storeId, productId:productId}})
              if(optionProductValueDetails.length > 0) {
                console.log("bbbbbbbbbbbbbbbbbbbbbbbb---"+optionProductValueDetails.length)
                for(var i=0; i< optionValueArr.length; i++){
                  if(optionValueArr[i].id && optionValueArr[i].id != '' && optionValueArr[i].id != null) {
                    console.log("cccccccccccccccccccccccccccc---"+optionValueArr[i].id)
                          
                    models.optionValue.update({
                      // storeId: storeId,
                      // optionId : optionValueArr[i].optionId,
                      // sku: optSKU,
                      price : optionValueArr[i].price,
                      value : optionValueArr[i].value,
                      status : optionValueArr[i].status,
                    },{ where: { id: optionValueArr[i].id } })

                  } else {
                    console.log("dddddddddddddddddddddd---"+optionProductValueDetails[0].optionId)

                    var optionValueSku = optionValueArr[i].value.toString().substr(0, 5).toUpperCase().replace(/\s+/g, '-');
                    var optSKU = productSku.sku+'-'+optionValueSku;
                          
                      models.optionValue.create({
                        storeId: storeId,
                        optionId : optionProductValueDetails[0].optionId,
                        sku: optSKU,
                        price : optionValueArr[i].price,
                        value : optionValueArr[i].value,
                        status : optionValueArr[i].status,
                      })
                  }
                }
                
              } else {
                // var optionValueSku = optionValueArr[i].value.toString().substr(0, 5).toUpperCase().replace(/\s+/g, '-');
                // var optSKU = productSku.sku+'-'+optionValueSku;
                models.optionMaster.create({
                  storeId: storeId,
                  title : optionTitle,
                  type : optionType,
                  isRequired : optionIsRequired
                }).then(async function(optionMaster) {

                  models.optionProduct.create({
                    storeId: storeId,
                    optionId : optionMaster.id,
                    productId : productId
                  }).then(async function(optionProduct) {

                    for(var i=0; i< optionValueArr.length; i++){

                      var optionValueSku = optionValueArr[i].value.toString().substr(0, 5).toUpperCase().replace(/\s+/g, '-');
                      var optSKU = productSku.sku+'-'+optionValueSku;
                      
                      models.optionValue.create({
                        storeId: storeId,
                        optionId : optionMaster.id,
                        sku: optSKU,
                        price : optionValueArr[i].price,
                        value : optionValueArr[i].value,
                        status : optionValueArr[i].status,
                      })
                    }

                  });
                });
              }
            }
            // //////////////////////////// option product update end //////////////////////

            // ///////////////////////////// attribute add start ///////////////////////////
             console.log(attributesArr.length + "=====qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")
             if(attributesArr.length > 0) {
              for(var i=0; i< attributesArr.length; i++){
                if(attributesArr[i].value != '' && attributesArr[i].value != null) {
                  console.log(attributesArr[i].attrName + "=====sdsdsdsdsdsdsdsddddddddddddddddddddd")
                  console.log(attributesArr[i].value + "=====fgfgfffgfgfgggggggggggggggggggggg")
                  // console.log(attributesArr.length + "=====qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")
                  // models.products.update({ 
                  //   sku: newSkuID,
                  //   slug: newSlug ,
                  //   inventory: inventory 
                  // },{ where: { id: val.id } })
                  sequelize.query(`UPDATE products SET ${attributesArr[i].attrName}='${attributesArr[i].value}' WHERE id = ${productId}`)
                }
              }
            }

            // ///////////////////////////// attribute add end ///////////////////////////

            return res.status(200).send({ data:{success:true, message:"Product Update successfully", productId : productId}, errorNode:{errorCode:0, errorMsg:''}});
          });
        } else {
          return res.status(200).send({ data:{success:false,message:'please fillup required field'}, errorNode:{errorCode:1, errorMsg:''}});
        }
      } else {
        return res.status(200).send({ data:{success:false,message:'Category is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }

    } else {

      if(productCatArr.length > 0) {
        if(title && title != '' && price && price != '' && type && type != '' && status && status != '') {

          var str = title ? title : "";
          var productName = str.replace(" ", "").substr(0, 5).toUpperCase();
          var slugify = str.toString().toLowerCase().replace(/\s+/g, '-');
          var skuID = productName;

          models.products.create({ 
            storeId: storeId,
            title: title,
            isConfigurable: 0,
            shortDescription: shortDescription,
            description: description,
            price: price,
            specialPrice: specialPrice,
            specialPriceFrom: specialPriceFrom,
            specialPriceTo: specialPriceTo,
            bestSellers: bestSellers,
            newArrivals: newArrivals,
            spicey: spicey,
            color: color,
            size: size,
            type: type,
            visibility: visibility,
            weight: weight,
            metaTitle: metaTitle,
            metaKey: metaKey,
            metaDescription: metaDescription,
            status: status,
            inventory: inventory,
            createdBy: userId,
            // attr1: attr1,
            // attr2: attr2,
            // attr3: attr3,
            // attr4: attr4,
            // attr5: attr5,
            // attr6: attr6,
            // attr7: attr7,
            // attr8: attr9,
            // attr9: attr1,
            // attr10: attr10,
          }).then(async function(val) {

            var dir = './public/admin/products/image/'+val.id; 
            console.log(dir);
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);                  
            }

            if(thumbnailImages && thumbnailImages != '' && thumbnailImagesExt && thumbnailImagesExt !='') {
              var imageTitle = Date.now();
              var path = './public/admin/products/image/'+ val.id +'/'+imageTitle+'.'+thumbnailImagesExt;
              var productThumbnail =imageTitle+'.'+thumbnailImagesExt;   
              try {
                  const imgdata = thumbnailImages;
                  const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                  fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                  models.productImages.create({
                    storeId : storeId,
                    productId : val.id,
                    file : productThumbnail,
                    isPrimary : 'Yes',
                  });         
              } catch (e) {
                  next(e);
              }
            }


            for(var i=0; i< productImageArr.length; i++){
              if(productImageArr[i].image && productImageArr[i].image != '' && productImageArr[i].imageExt && productImageArr[i].imageExt !='') {
                var imageTitle = Date.now();
                var path = './public/admin/products/image/'+ val.id +'/'+imageTitle+'.'+productImageArr[i].imageExt;
                var productImage =imageTitle+'.'+productImageArr[i].imageExt;   
                try {
                    const imgdata = productImageArr[i].image;
                    const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                    fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                    models.productImages.create({
                      storeId : storeId,
                      productId : val.id,
                      file : productImage,
                      isPrimary : 'No',
                    });         
                } catch (e) {
                    next(e);
                }
              }
            }

            if(metaImage && metaImage != '' && metaImageExt && metaImageExt !='') {
              
              var imageTitle = Date.now();
              var path = './public/admin/products/image/'+  val.id +'/'+imageTitle+'.'+metaImageExt;
              var OGImage =imageTitle+'.'+metaImageExt;   
              try {
                  const imgdata = metaImage;
                  const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                  fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                  models.products.update({
                    metaImage : OGImage,
                  },{ where: { id: val.id } });       
              } catch (e) {
                  next(e);
              }
            }

            if(invStatus == 'manageStock') {
              var inventory = 'manageStock';
              
              models.inventory.create({
                storeId: storeId,
                stock : quantity,
                productId : val.id,
                status : 'Yes',
                remarks: quantity+" new quantity added"
              });
            } else {
              var inventory = 'alwaysInStock';
            }

            

            var newSlug = slugify +'-'+ val.id;
            var newSkuID = skuID + val.id;

            models.products.update({ 
              sku: newSkuID,
              slug: newSlug ,
              inventory: inventory 
            },{ where: { id: val.id } })

            // if(productSubCatArr.length > 0) {
            //   for(var i=0; i< productSubCatArr.length; i++){
            //     models.productCategory.create({
            //       storeId: storeId,
            //       categoryId : productSubCatArr[i],
            //       productId : val.id,
            //       position : i
            //     })
            //   }
            // } else {
            //   for(var i=0; i< productCatArr.length; i++){
            //     models.productCategory.create({
            //       storeId: storeId,
            //       categoryId : productCatArr[i],
            //       productId : val.id,
            //       position : i
            //     })
            //   }
            // }

            if(productSubCatArr.length > 0) {
              for(var i=0; i< productSubCatArr.length; i++){

                const subCategoryDetails = await models.categories.findAll({where:{storeId:storeId, id:productSubCatArr[i]}})

                models.productCategory.create({
                  storeId: storeId,
                  categoryId : productSubCatArr[i],
                  productId : val.id,
                  parentCategoryId : subCategoryDetails[0].parentCategoryId,
                  // position : i
                })
              }

              for(var i=0; i< productCatArr.length; i++){

                const subCategoryCheck = await models.categories.findAll({where:{storeId:storeId, parentCategoryId:productCatArr[i]}})
                if(subCategoryCheck.length > 0) {

                  var proCat = 'no';
                  for(var j=0; j< subCategoryCheck.length; j++){
                    for(var k=0; k< productSubCatArr.length; k++){
                      if(subCategoryCheck[j].id == productSubCatArr[k]) {
                        var proCat = 'yes';
                        break;
                      }
                    }
                    if(proCat == 'yes') {
                      break;
                    }
                    // if(Number(subCategoryCheck.length) == Number(j+1)){
                    //   if(proCat == 'no') {
                    //     models.productCategory.create({
                    //       storeId: storeId,
                    //       categoryId : productCatArr[i],
                    //       productId : val.id,
                    //       // position : i
                    //     })
                    //   }
                    // }
                  }
                  if(proCat == 'no') {
                    models.productCategory.create({
                      storeId: storeId,
                      categoryId : productCatArr[i],
                      productId : val.id,
                      parentCategoryId : productCatArr[i],
                      // position : i
                    })
                  }
                } else {
                  models.productCategory.create({
                    storeId: storeId,
                    categoryId : productCatArr[i],
                    productId : val.id,
                    parentCategoryId : productCatArr[i],
                    // position : i
                  })
                }

              }

            } else {
              for(var i=0; i< productCatArr.length; i++){
                models.productCategory.create({
                  storeId: storeId,
                  categoryId : productCatArr[i],
                  productId : val.id,
                  parentCategoryId : productCatArr[i],
                  // position : i
                })
              }
            }
            
            // for(var i=0; i< productCatArr.length; i++){
            //   models.productCategory.create({
            //     storeId: storeId,
            //     categoryId : productCatArr[i],
            //     productId : val.id,
            //     position : i
            //   })
            // }

            if(configurableProductArr.length > 0) {
              for(var i=0; i< configurableProductArr.length; i++){
                models.products.create({ 
                  storeId: storeId,
                  title: title,
                  isConfigurable: val.id,
                  shortDescription: shortDescription,
                  description: description,
                  price: configurableProductArr[i].price,
                  specialPrice: configurableProductArr[i].specialPrice,
                  specialPriceFrom: specialPriceFrom,
                  specialPriceTo: specialPriceTo,
                  bestSellers: bestSellers,
                  newArrivals: newArrivals,
                  spicey: spicey,
                  color: color,
                  size: configurableProductArr[i].size,
                  type: type,
                  visibility: visibility,
                  weight: weight,
                  metaTitle: metaTitle,
                  metaKey: metaKey,
                  metaDescription: metaDescription,
                  attr1: attr1,
                  attr2: attr2,
                  attr3: attr3,
                  attr4: attr4,
                  attr5: attr5,
                  attr6: attr6,
                  attr7: attr7,
                  attr8: attr9,
                  attr9: attr1,
                  attr10: attr10, 
                  status: configurableProductArr[i].status,
                });
              }
            }

            if(upSellProductArr.length > 0) {
              for(var i=0; i< upSellProductArr.length; i++){
                if(upSellProductArr[i].id && upSellProductArr[i].id != '' && upSellProductArr[i].id != null) {
                  models.relatedProduct.create({
                    storeId: storeId,
                    selectedProductId : upSellProductArr[i].id,
                    productId : val.id,
                    type : 'Up-Sells'
                  })
                }
              }
            }

            if(crossSellProductArr.length > 0) {
              for(var i=0; i< crossSellProductArr.length; i++){
                if(crossSellProductArr[i].id && crossSellProductArr[i].id != '' && crossSellProductArr[i].id != null) {
                  models.relatedProduct.create({
                    storeId: storeId,
                    selectedProductId : crossSellProductArr[i].id,
                    productId : val.id,
                    type : 'Cross-Sells'
                  })
                }
              }
            }

            if(relatedProductArr.length > 0) {
              for(var i=0; i< relatedProductArr.length; i++){
                if(relatedProductArr[i].id && relatedProductArr[i].id != '' && relatedProductArr[i].id != null) {
                  models.relatedProduct.create({
                    storeId: storeId,
                    selectedProductId : relatedProductArr[i].id,
                    productId : val.id,
                    type : 'Related'
                  })
                }
              }
            }

            if(addOnProductArr.length > 0) {
              for(var i=0; i< addOnProductArr.length; i++){
                if(addOnProductArr[i].id && addOnProductArr[i].id != '' && addOnProductArr[i].id != null) {
                  models.relatedProduct.create({
                    storeId: storeId,
                    selectedProductId : addOnProductArr[i].id,
                    productId : val.id,
                    type : 'Add-on'
                  })
                }
              }
            }

            // //////////////////////////// option product create start //////////////////////
            if(optionValueArr.length > 0) {
              // var productSku = await models.products.findOne({attributes: ['title', 'sku'], where:{id:val.id}})
              // console.log("productSkuproductSkuproductSkuproductSku--------"+productSku.sku)
              models.optionMaster.create({
                storeId: storeId,
                title : optionTitle,
                type : optionType,
                isRequired : optionIsRequired
              }).then(async function(optionMaster) {

                models.optionProduct.create({
                  storeId: storeId,
                  optionId : optionMaster.id,
                  productId : val.id
                }).then(async function(optionProduct) {

                  for(var i=0; i< optionValueArr.length; i++){
                    var optionValueSku = optionValueArr[i].value.toString().substr(0, 5).toUpperCase().replace(/\s+/g, '-');
                    var optSKU = newSkuID+'-'+optionValueSku;
                    console.log("optionValueSkuoptionValueSkuoptionValueSku--------"+optionValueSku);
                    console.log("skuskuskuskuskuskuskuskuskuskuskuskusku--------"+newSkuID+'-'+optionValueSku);
                    console.log("newSkuIDnewSkuIDnewSkuIDnewSkuIDnewSkuIDnewSkuIDnewSkuID--------"+newSkuID);
                    console.log("optSKUoptSKUoptSKUoptSKUoptSKUoptSKUoptSKUoptSKU--------"+optSKU);
                    
                    models.optionValue.create({
                      storeId: storeId,
                      optionId : optionMaster.id,
                      sku: optSKU,
                      price : optionValueArr[i].price,
                      value : optionValueArr[i].value,
                      status : optionValueArr[i].status,
                    })
                  }

                });
              });
            }
            // //////////////////////////// option product create end //////////////////////

            // ///////////////////////////// attribute add start ///////////////////////////

            // console.log(attributesArr.length + "=====qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")
            if(attributesArr.length > 0) {
              for(var i=0; i< attributesArr.length; i++){
                if(attributesArr[i].value != '' && attributesArr[i].value != null) {
                  // console.log(attributesArr[i].attrName + "=====sdsdsdsdsdsdsdsddddddddddddddddddddd")
                  // console.log(attributesArr[i].value + "=====fgfgfffgfgfgggggggggggggggggggggg")
                  // console.log(attributesArr.length + "=====qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")
                  // models.products.update({ 
                  //   sku: newSkuID,
                  //   slug: newSlug ,
                  //   inventory: inventory 
                  // },{ where: { id: val.id } })
                  sequelize.query(`UPDATE products SET ${attributesArr[i].attrName}='${attributesArr[i].value}' WHERE id = ${val.id}`)
                }
              }
            }

            // ///////////////////////////// attribute add end ///////////////////////////

            return res.status(200).send({ data:{success:true, message:"Product create successfully", productId : val.id}, errorNode:{errorCode:0, errorMsg:''}});
          });
        } else {
          return res.status(200).send({ data:{success:false,message:'please fillup required field'}, errorNode:{errorCode:1, errorMsg:''}});
        }
      } else {
        return res.status(200).send({ data:{success:false,message:'Category is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.productImageDelete= async function (req, res, next) {

  var productId = req.body.data.productId;
  var storeId = req.body.data.storeId;
  var imageId = req.body.data.imageId;
  var imageType = req.body.data.imageType;

  if(storeId && storeId != '') {
    if(productId && productId != '') {
      if(imageType == 'image') {
        if(imageId && imageId != '') {
      
          var productImagesDetails = await models.productImages.findOne({ attributes: ["file","id"], where: { storeId:storeId, productId: productId, id:imageId } });
          if(productImagesDetails.file && productImagesDetails.file != '' && productImagesDetails.file != null) {

            if(fs.existsSync(__dirname + '/../../public/admin/products/image/'+ productId +'/'+productImagesDetails.file)){
              fs.unlink(__dirname +  '/../../public/admin/products/image/'+ productId +'/'+productImagesDetails.file, (err) => {
                if (err) throw err;
                console.log('successfully deleted /tmp/hello');
              });
            }
            models.productImages.destroy({ 
              where:{id:imageId}
            })
          }
          return res.status(200).send({ data:{success:true, message:'Image successfully Deleted'}, errorNode:{errorCode:0, errorMsg:''}});

        } else {
          return res.status(200).send({ data:{success:false,message:'Image Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
        }
      } else if(imageType == 'metaImage') {

        var metaImageDetails = await models.products.findOne({ attributes: ["metaImage","id"], where: { storeId:storeId, id: productId } });
        if(metaImageDetails.metaImage && metaImageDetails.metaImage != '' && metaImageDetails.metaImage != null) {

          if(fs.existsSync(__dirname + '/../../public/admin/products/image/'+ productId +'/'+metaImageDetails.metaImage)){
            fs.unlink(__dirname +  '/../../public/admin/products/image/'+ productId +'/'+metaImageDetails.metaImage, (err) => {
              if (err) throw err;
              console.log('successfully deleted /tmp/hello');
            });
          }

          models.products.update({
            metaImage : null,
          },{ where: { id: productId } });  

        }

        return res.status(200).send({ data:{success:true, message:'Meta image successfully removed'}, errorNode:{errorCode:0, errorMsg:''}});

      } else if(imageType == 'thumbnailImages'){

        var thumbnailImagesDetails = await models.productImages.findOne({ attributes: ["file","id"], where: { storeId:storeId, productId: productId, isPrimary:'Yes' } });
        if(thumbnailImagesDetails.file && thumbnailImagesDetails.file != '' && thumbnailImagesDetails.file != null) {

          if(fs.existsSync(__dirname + '/../../public/admin/products/image/'+ productId +'/'+thumbnailImagesDetails.file)){
            fs.unlink(__dirname +  '/../../public/admin/products/image/'+ productId +'/'+thumbnailImagesDetails.file, (err) => {
              if (err) throw err;
              console.log('successfully deleted /tmp/hello');
            });
          }
          models.productImages.destroy({ 
            where:{id:thumbnailImagesDetails.id}
          })
        }

        return res.status(200).send({ data:{success:true, message:'Thumbnail image successfully removed'}, errorNode:{errorCode:0, errorMsg:''}});

      } else {
        return res.status(200).send({ data:{success:false,message:'Image type is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'Product Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.allProductList = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  console.log(storeId)
  if (storeId == '') {
    res.status(400).send({data:{success:false, details:"StoreId is required"},errorNode:{errorCode:1, errorMsg:"StoreId is required"}})
  } else {
    const products = await models.products.findAll({attributes:['id','sku','title','price','specialPrice', 'isConfigurable'], where:{storeId:storeId}})
    let allProduct = []
    if(products.length >0){
      for(let product of products){
        // const productCategory = await models.productCategory.findAll({attributes:['id','categoryId','productId'], where:{productId:product.id} })
        const productCategory = await sequelize.query("SELECT productCategory.id, productCategory.categoryId, categories.title as categoryTitle, categories.parentCategoryId FROM `productCategory` left join categories on categories.id = productCategory.categoryId WHERE productCategory.storeId = "+storeId+" and productCategory.productId = "+product.id,{ type: Sequelize.QueryTypes.SELECT });
        let mainTitle = ''
        if(productCategory.length >0){
          mainTitle = productCategory[0].categoryTitle
        } else {
          mainTitle = ''
        }
        const productImages = await models.productImages.findOne({attributes:['file'], where:{productId:product.id, isPrimary: "Yes"}, order: [['id', 'ASC']]})
        let image
        if(productImages !='' && productImages != null && productImages != undefined){
            image = req.app.locals.baseurl+'admin/products/image/'+product.id+'/'+productImages.file
        }else{
            image = req.app.locals.baseurl+'admin/category/no_image.jpg';
        }
        let isConfigurable = true
        if(product.isConfigurable == 0){
            isConfigurable = false
        }else{
            isConfigurable = true
        }
        let details = {}
        details.id = product.id
        details.sku = product.sku
        details.productName = product.title
        details.price = product.price
        details.specialPrice = product.specialPrice
        details.mainTitle = mainTitle
        details.isConfigurable = isConfigurable
        details.thumbnailImage = image

        allProduct.push(details)
      }
      res.status(200).send({data:{success:true, details:allProduct},errorNode:{errorCode:0, errorMsg:"No Error"}})
    } else {
        res.status(200).send({data:{success:true, details:[]},errorNode:{errorCode:0, errorMsg:"No data found"}})
    }
  }
}


exports.configurableProductDelete= async function (req, res, next) {

  var productId = req.body.data.id;
  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    if(productId && productId != '') {
      
      models.optionValue.destroy({ 
        where:{id:productId, storeId:storeId}
      });
      
      return res.status(200).send({ data:{success:true, message:'Configurable Product successfully Deleted'}, errorNode:{errorCode:0, errorMsg:''}});

    } else {
      return res.status(200).send({ data:{success:false,message:'Product Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.vendorProductSearch = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  const searchString = req.body.data.searchString || "";
  console.log(storeId)
  if (storeId == '') {
    res.status(400).send({data:{success:false, details:"StoreId is required"},errorNode:{errorCode:1, errorMsg:"StoreId is required"}}) 
  } else {
    if (searchString == '') {
      res.status(400).send({data:{success:false, details:"Search string is required"},errorNode:{errorCode:1, errorMsg:"Search string is required"}})
    } else {
      // var searchProductList = await sequelize.query("SELECT id, title, slug, price, specialPrice, size FROM `products` WHERE storeId = "+storeId+" and `title` LIKE '%"+searchString+"%' and status = 'active' and isConfigurable = 0",{ type: Sequelize.QueryTypes.SELECT });
      var searchProductList = await sequelize.query("SELECT id, title as name  FROM `products` WHERE  storeId = "+storeId+" and (LOWER(`title`) LIKE LOWER('%"+searchString+"%') or LOWER(`sku`) LIKE LOWER('%"+searchString+"%')) and status = 'active' and isConfigurable = 0",{ type: Sequelize.QueryTypes.SELECT });
    
      if(searchProductList.length >0){
          
          res.status(200).send({data:{success:true, searchList:searchProductList},errorNode:{errorCode:0, errorMsg:"No Error"}})
      } else {
          res.status(200).send({data:{success:true, searchList:[]},errorNode:{errorCode:0, errorMsg:"No data found"}})
      }
    }
  }
}

exports.productDelete= async function (req, res, next) {

  var productId = req.body.data.productId;
  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    if(productId && productId != '') {

      models.productCategory.destroy({ 
        where:{productId:productId, storeId:storeId}
      }).then(async function(dst){

        models.relatedProduct.destroy({ 
          where:{productId:productId, storeId:storeId}
        });
  
        models.relatedProduct.destroy({ 
          where:{selectedProductId:productId, storeId:storeId}
        });
  
        models.favouriteProduct.destroy({ 
          where:{productId:productId, storeId:storeId}
        });
  
        var productImagesDetails = await models.productImages.findOne({ attributes: ["file","id"], where: { storeId:storeId, productId: productId } });
  
        if(productImagesDetails.length > 0) {
          for(var j = 0; j < productImagesDetails.length; j++){
  
            if(productImagesDetails[j].file && productImagesDetails[j].file != '' && productImagesDetails[j].file != null) {
  
              if(fs.existsSync(__dirname + '/../../public/admin/products/image/'+ productId +'/'+productImagesDetails[j].file)){
                fs.unlink(__dirname +  '/../../public/admin/products/image/'+ productId +'/'+productImagesDetails[j].file, (err) => {
                  if (err) throw err;
                  console.log('successfully deleted /tmp/hello');
                });
              }
              models.productImages.destroy({ 
                where:{id:productImagesDetails[j].id}
              })
            }
          }
        }

        models.products.destroy({ 
          where:{id:productId, storeId:storeId}
        });

      })
      
      return res.status(200).send({ data:{success:true, message:'Product successfully Deleted'}, errorNode:{errorCode:0, errorMsg:''}});

    } else {
      return res.status(200).send({ data:{success:false,message:'Product Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.relatedProductDelete= async function (req, res, next) {

  var mainProductId = req.body.data.mainProductId;
  var productId = req.body.data.productId;
  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    if(mainProductId && mainProductId != '') {
      if(productId && productId != '') {

        const relatedProductList = await models.relatedProduct.findAll({ where:{productId:mainProductId, selectedProductId:productId, storeId:storeId, type:'Related'} })
        if(relatedProductList.length > 0) {

          models.relatedProduct.destroy({ 
            where:{productId:mainProductId, selectedProductId:productId, storeId:storeId, type:'Related'}
          });
        
          return res.status(200).send({ data:{success:true, message:'Related product successfully Deleted'}, errorNode:{errorCode:0, errorMsg:''}});

        } else {
          return res.status(200).send({ data:{success:false, message:'No related product found'}, errorNode:{errorCode:0, errorMsg:''}});
        }

      } else {
        return res.status(200).send({ data:{success:false,message:'Product Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'Main Product Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.selectedProductDelete= async function (req, res, next) {

  var mainProductId = req.body.data.mainProductId;
  var productId = req.body.data.productId;
  var storeId = req.body.data.storeId;
  var productType = req.body.data.productType;

  if(storeId && storeId != '') {
    if(mainProductId && mainProductId != '') {
      if(productId && productId != '') {
        if(productType && productType != '') {
        
          const relatedProductList = await models.relatedProduct.findAll({ where:{productId:mainProductId, selectedProductId:productId, storeId:storeId, type:productType} })
          if(relatedProductList.length > 0) {

            models.relatedProduct.destroy({ 
              where:{productId:mainProductId, selectedProductId:productId, storeId:storeId, type:productType}
            });
          
            return res.status(200).send({ data:{success:true, message:'Related product successfully Deleted'}, errorNode:{errorCode:0, errorMsg:''}});

          } else {
            return res.status(200).send({ data:{success:false, message:'No related product found'}, errorNode:{errorCode:0, errorMsg:''}});
          }

        } else {
          return res.status(200).send({ data:{success:false,message:'Product type is required'}, errorNode:{errorCode:1, errorMsg:''}});
        }
      } else {
        return res.status(200).send({ data:{success:false,message:'Product Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'Main Product Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};