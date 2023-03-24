var models = require("../../models");
const Excel = require("exceljs");
var fs = require("fs");
var jwt = require("jsonwebtoken");
var SECRET = "nodescratch";
var multiparty = require("multiparty");
var bodyParser = require("body-parser");
const paginate = require("express-paginate");
var config = require("../../config/config.json");
var path = require("path");
var helper = require("../../helpers/helper_functions");
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
      idle: 10000,
    },
  }
);
/**
* Description: Products list
* Developer:Susanta Kumar Das
**/
exports.productList =async function (req, res, next) {
  var token = req.session.token;
  var currPage = req.query.page ? req.query.page : 0;
  var limit = req.query.limit ? req.query.limit : 10;
  var offset = currPage != 0 ? currPage * limit - limit : 0;
  var keyword = req.query.search ? req.query.search.trim() : "";
  // var sessionStoreId = req.session.user.storeId;
  var sessionStoreId = 30;
  var sessionUserId = req.session.user.id;

  var catFilter = req.query.filter ? req.query.filter : "";

  //*****Permission Assign Start
  // var userPermission='';
  // if (sessionStoreId == null) {
  //     userPermission=true;
  // }else{    
  //   userPermission = !! req.session.permissions.find(permission => { 
  //       return permission === 'ProductList'
  //   })
  // }
  // if(userPermission==false){
  //   req.flash('errors','Contact Your administrator for permission');
  //     res.redirect('/admin/dashboard');
  // }else{
  //*****Permission Assign End
  var productImages = await models.products.findAll({
    attributes:['id'], 
    include: [{
      model: models.productImages,
      attributes:['id', 'file', 'isVideo', 'isPrimary', 'imageTitle', 'productId'],
      where: {
        id:{
          [Op.ne]:null
        }
      },
      required:false,
    }],
    where:{
      storeId:sessionStoreId,
    }
  }).then(products => {
    const productList = products.map(product => {
      return Object.assign(
        {},
        {
          productId : product.id,
          image : product.productImages.file,
          isVideo : product.productImages.isVideo,
          isPrimary : product.productImages.isPrimary,
          imageTitle : product.productImages.imageTitle,
          imageId : product.productImages.id,
          imageProductId : product.productImages.productId
        }
      )
    });
    return productList;    
  });

  jwt.verify(token, SECRET, async function (err, decoded) {
    if (err) {
      req.flash("info", "Invalid Token");
      res.redirect('/auth/signin');
    } else {    
      
      ///// product filter start ////////////

      if (catFilter && catFilter != "" && catFilter != 0) {
        var arrCatFilter = catFilter;
        models.productCategory.findAll({
          attributes:['id'],
          include: [{
            model: models.products,
            where: {
              isConfigurable: {
                [Op.in]:[0, null]
              },
              storeId:sessionStoreId,
            },
            
          }],
          where: {
            categoryId:catFilter,
            storeId:sessionStoreId,
          },
        }).then(async productCount => {
          if (productCount) {
            models.productCategory.findAll({
              attributes:['id'],
              include: [{
                model: models.products,
                where: {
                  isConfigurable: {
                    [Op.in]:[0, null]
                  },
                  storeId:sessionStoreId,
                },
                
              }],
              where: {
                categoryId:catFilter,
                storeId:sessionStoreId,
              },
            }).then(async value => {

              let productValues = []
              for(let productv of value){
                let pv = productv.dataValues
                let stock = await models.inventory.findAll({attributes: ['stock'], where: {productId: productv.product.id}, order: [['id', 'DESC']]})
                if(stock.length >= 1){
                  pv.stock = stock[0].stock
                }else{
                  pv.stock = 0
                  // const productImage = await models.productImages.findAll({attributes: ['file'], where:{productId: productv.id},limit:1})
                  // if(productImage.length >= 1){
                  //   pv.image = productImage[0].file
                  // }else{
                  //   pv.image = ''
                  // }
                }
                const productImage = await models.productImages.findAll({attributes: ['file'], where:{productId: productv.product.id},limit:1})
                  if(productImage.length >= 1){
                    pv.image = productImage[0].file
                  }else{
                    pv.image = ''
                  }
                
                productValues.push(pv)
              }

              models.productCategory.findAll({
                attributes:['id', 'categoryId', 'productId'],
                include: [{
                  attributes:['title'],
                  model: models.categories,
                  where:{
                    storeId:sessionStoreId
                  }
                }],
              }).then(productCategory => {
                models.categories.findAll({
                  where: { status: "Yes",storeId:30 }
                }).then(category => {
                  // return res.send(productValues);
                  const itemCount =productCount.length > 0 ? productCount[0].productCount: 0;
                  const pageCount =productCount.length > 0 ? Math.ceil(productCount[0].productCount / limit): 1;
                  const previousPageLink = paginate.hasNextPages(req)(pageCount);
                  const startItemsNumber =currPage == 0 || currPage == 1 ? 1 : (currPage - 1) * limit + 1;
                  const endItemsNumber = pageCount == currPage || pageCount == 1 ? itemCount : currPage * limit;
                  return res.render("admin/products/list", {
                    title: "Product",
                    arrCatFilter:arrCatFilter,
                    arrSearchData:keyword,
                    arrData: productValues,
                    arrProductCategory: productCategory,
                    helper:helper,
                    arrCategory: category,
                    messages: req.flash("info"),
                    errors: req.flash("errors"),
                    pageCount,
                    itemCount,
                    productImages:productImages,
                    currentPage: currPage,
                    previousPage: previousPageLink,
                    startingNumber: startItemsNumber,
                    endingNumber: endItemsNumber,
                    pages: paginate.getArrayPages(req)(
                      limit,
                      pageCount,
                      currPage
                    ),
                  });
                });
              });
            })
          } else {
            return res.render("admin/products/list", {
              title: "Product",
              arrCatFilter:arrCatFilter,
              arrSearchData:'',
              arrData: "",
              arrproductCategory: '',
              arrCategory: '',
              helper:helper,
              messages: req.flash("info"),
              errors: req.flash("errors"),
              pageCount: 0,
              itemCount: 0,
              productImages:productImages,
              currentPage: currPage,
              previousPage: '',
              startingNumber: '',
              endingNumber: '',
              pages: paginate.getArrayPages(req)(
                limit,
                0,
                currPage,
                keyword
              ),
            });
          }
        });

        // /////// product filter end ///////////////
      } else {

        if (catFilter && catFilter != "" ) {
            var arrCatFilter = 'all';
          } else {
            var arrCatFilter = '';
          }

        if (keyword && keyword != "") {
          
          models.products.count({
            where: {
              storeId:sessionStoreId,
              title: {
                [Op.like]: keyword+'%'
              },
              isConfigurable: {
                [Op.in]: [0, null]
              },
              storeId:sessionStoreId,
            },
          }).then(productCount => {
            if (productCount) {
              models.products.findAll({
                where: {
                  storeId:sessionStoreId,
                  title: {
                    [Op.like]: keyword+'%'
                  },
                  isConfigurable: {
                    [Op.in]:[0, null]
                  },
                },
                order: [['id', 'DESC']],
                offset:offset,
                limit : limit,
              }).then(async(value) => {
                let productValues = []
                for(let productv of value){
                  let pv = productv.dataValues
                  let stock = await models.inventory.findAll({attributes: ['stock'], where: {productId: productv.id}, order: [['id', 'DESC']]})
                  if(stock.length >= 1){
                    pv.stock = stock[0].stock
                  }else{
                    pv.stock = 0
                    // const productImage = await models.productImages.findAll({attributes: ['file'], where:{productId: productv.id},limit:1})
                    // if(productImage.length >= 1){
                    //   pv.image = productImage[0].file
                    // }else{
                    //   pv.image = ''
                    // }
                  }
                  const productImage = await models.productImages.findAll({attributes: ['file'], where:{productId: productv.id},limit:1})
                    if(productImage.length >= 1){
                      pv.image = productImage[0].file
                    }else{
                      pv.image = ''
                    }
                  
                  productValues.push(pv)
                }
                models.productCategory.findAll({
                  attributes:['id', 'categoryId', 'productId'],
                  include: [{
                    attributes:['title'],
                    model: models.categories,
                    where:{
                      storeId:sessionStoreId,
                    }
                  }],
                }).then(productCategory => {
                  models.categories.findAll({
                    where: { status: "Yes",storeId:30 }
                  }).then(category => {
                    // return res.send(arrData);
                    const itemCount =productCount > 0 ? productCount: 0;
                    const pageCount =productCount > 0 ? Math.ceil(productCount / limit): 1;
                    const previousPageLink = paginate.hasNextPages(req)(pageCount);
                    const startItemsNumber =currPage == 0 || currPage == 1 ? 1 : (currPage - 1) * limit + 1;
                    const endItemsNumber = pageCount == currPage || pageCount == 1 ? itemCount : currPage * limit;
                    return res.render("admin/products/list", {
                      title: "Product",
                      arrCatFilter:arrCatFilter,
                      arrSearchData:keyword,
                      arrData: productValues,
                      arrProductCategory: productCategory,
                      helper:helper,
                      arrCategory: category,
                      messages: req.flash("info"),
                      errors: req.flash("errors"),
                      pageCount,
                      itemCount,
                      productImages:productImages,
                      currentPage: currPage,
                      previousPage: previousPageLink,
                      startingNumber: startItemsNumber,
                      endingNumber: endItemsNumber,
                      pages: paginate.getArrayPages(req)(
                        limit,
                        pageCount,
                        currPage
                      ),
                    });
                  });
                });
              })
            } else {
              return res.render("admin/products/list", {
                title: "Product",
                arrCatFilter:arrCatFilter,
                arrSearchData:'',
                arrData: '',
                arrproductCategory: '',
                helper:helper,
                arrCategory: '',
                messages: req.flash("info"),
                errors: req.flash("errors"),
                pageCount:0,
                itemCount:0,
                productImages:productImages,
                currentPage: currPage,
                previousPage: '',
                startingNumber: '',
                endingNumber: '',
                pages: paginate.getArrayPages(req)(
                  limit,
                  0,
                  currPage,
                  keyword
                ),
              });
            }
          });
        } else {
          // if (catFilter && catFilter != "" ) {
          //   var arrCatFilter = 'all';
          // } else {
          //   var arrCatFilter = '';
          // }
          models.products.count({
            where: {
              // title: {
              //   [Op.like]: keyword+'%'
              // },
              isConfigurable: {
                [Op.in]: [0, null]
              },
              storeId:sessionStoreId,
            },
          }).then(productCount => {
            if (productCount) {
              models.products.findAll({
                where: {
                  storeId:sessionStoreId,
                  // title: {
                  //   [Op.like]: keyword+'%'
                  // },
                  isConfigurable: {
                    [Op.in]:[0, null]
                  },
                },
                order: [['id', 'DESC']],
                offset:offset,
                limit : limit,
              }).then(async (value) => {
                let productValues = []
                for(let productv of value){
                  let pv = productv.dataValues
                  let stock = await models.inventory.findAll({attributes: ['stock'], where: {productId: productv.id}, order: [['id', 'DESC']]})
                  if(stock.length >= 1){
                    pv.stock = stock[0].stock
                  }else{
                    pv.stock = 0
                    // const productImage = await models.productImages.findAll({attributes: ['file'], where:{productId: productv.id},limit:1})
                    // if(productImage.length >= 1){
                    //   pv.image = productImage[0].file
                    // }else{
                    //   pv.image = ''
                    // }
                  }
                  const productImage = await models.productImages.findAll({attributes: ['file'], where:{productId: productv.id},limit:1})
                  if(productImage.length >= 1){
                    pv.image = productImage[0].file
                  }else{
                    pv.image = ''
                  }
                  
                  productValues.push(pv)
                }
                
                models.productCategory.findAll({
                  attributes:['id', 'categoryId', 'productId'],
                  include: [{
                    attributes:['title'],
                    model: models.categories,
                    where:{
                      storeId:sessionStoreId,
                    }
                  }],
                }).then(productCategory => {
                  models.categories.findAll({
                    where: { status: "Yes",storeId:30 }
                  }).then(category => {
                    // return res.send(productValues);
                    const itemCount =productCount > 0 ? productCount: 0;
                    const pageCount =productCount > 0 ? Math.ceil(productCount / limit): 1;
                    const previousPageLink = paginate.hasNextPages(req)(pageCount);
                    const startItemsNumber =currPage == 0 || currPage == 1 ? 1 : (currPage - 1) * limit + 1;
                    const endItemsNumber = pageCount == currPage || pageCount == 1 ? itemCount : currPage * limit;
                    return res.render("admin/products/list", {
                      title: "Product",
                      arrCatFilter:arrCatFilter,
                      arrSearchData:keyword,
                      arrData: productValues,
                      arrProductCategory: productCategory,
                      helper:helper,
                      arrCategory: category,
                      messages: req.flash("info"),
                      errors: req.flash("errors"),
                      pageCount,
                      itemCount,
                      productImages:productImages,
                      currentPage: currPage,
                      previousPage: previousPageLink,
                      startingNumber: startItemsNumber,
                      endingNumber: endItemsNumber,
                      pages: paginate.getArrayPages(req)(
                        limit,
                        pageCount,
                        currPage
                      ),
                    });
                  });
                });
              })
            } else {
              return res.render("admin/products/list", {
                title: "Product",
                arrCatFilter:arrCatFilter,
                arrSearchData:'',
                arrData: '',
                arrproductCategory: '',
                helper:helper,
                arrCategory: '',
                messages: req.flash("info"),
                errors: req.flash("errors"),
                pageCount:0,
                itemCount:0,
                productImages:productImages,
                currentPage: currPage,
                previousPage: '',
                startingNumber: '',
                endingNumber: '',
                pages: paginate.getArrayPages(req)(
                  limit,
                  0,
                  currPage,
                  keyword
                ),
              });
            }
          });
        }
      }
    }
  });
// }
};




/**
* Description: add/edit Product
* Developer:Susanta Kumar Das
**/
exports.addeditProduct = async function(req, res){

  //*****Permission Assign Start
  var userPermission='';
  if (sessionStoreId == null) {
    userPermission=true;
  }else{
    userPermission = !! req.session.permissions.find(permission => { 
        return permission === 'ProductAddEdit'
    })
  }
  if(userPermission==false){
      res.redirect('/admin/dashboard');
  }else{
  //*****Permission Assign End

  var id = req.params.id;
  var productMultiImage=[];
  var allProductList = '';
  var allProductListforUpSell ='';
  var allProductListforCrossSell = '';
  var allProductListforAddon = '';
  //var allStoresId = await models.stores.findAll({attributes:['id','storeName'], where:{status:'Yes'}});
  var allBrandsId = await models.brands.findAll({attributes:['id','title'], where:{status:'Yes',storeId:30}});
  //var allUnits = await models.units.findAll({attributes:['id','title'], where:{status:'Yes'}});
  // var sessionStoreId = req.session.user.storeId;
  var sessionStoreId = 30;
  //var sessionUserId = req.session.user.id;
  var attr = await models.attributesetting.findAll({ where:{status:'Yes', storeId:sessionStoreId}, include: [{model: models.attributevalue, required: false }]});
  if(attr){
    var attrList = attr;
  }else{
    var attrList = '';
  }
  if(id !='' && id != undefined){
    var productList = await models.products.findAll({
      include: [{
        model: models.productCategory,
        include:[{
          model: models.categories,
          attributes:['id', 'title'],
          where:{
            storeId:sessionStoreId
          }
        }],
        required:false,
      }],
      where: {
        status:'active',
        isConfigurable:0,
        id:{
          [Op.notIn]:[id]
        },
        storeId:sessionStoreId
      },
      order: [['id', 'DESC']]
    }).then(products => {
      const productList = products.map(product => {
        return Object.assign(
          {},
          {
            productId : product.id,
            title : product.title,
            slug: product.slug,
            url: product.url,
            description: product.description,
            shortDescription: product.shortDescription,
            searchKeywords: product.searchKeywords,
            price: product.price,
            specialPrice: product.specialPrice,
            specialPriceFrom: product.specialPriceFrom,
            specialPriceTo: product.specialPriceTo,
            bestSellers: product.bestSellers,
            newArrivals: product.newArrivals,
            taxClassId: product.taxClassId,
            weight: product.weight,
            unitId: product.unitId,
            isConfigurable: product.isConfigurable,
            metaTitle: product.metaTitle, 
            metaKey: product.metaKey,   
            metaDescription: product.metaDescription,
            optionTitle: product.optionTitle,  
            optionType: product.optionType,  
            optionValue: product.optionValue,  
            color: product.color,      
            size: product.size,
            brand: product.brand,      
            application: product.application,      
            type: product.type,      
            fromDate: product.fromDate,        
            fromTime: product.fromTime,  
            toDate: product.toDate,  
            toTime: product.toTime,   
            visibility: product.visibility,
            status: product.status
          }
        )
      });
      return productList;    
    });
  } else {
    var productList = await models.products.findAll({
      where: {
        status:'active',
        isConfigurable:0,
        storeId:sessionStoreId
      },
      order: [['id', 'DESC']]
    }).then(products => {
      const productList = products.map(product => {
        return Object.assign(
          {},
          {
            productId : product.id,
            title : product.title,
            slug: product.slug,
            url: product.url,
            description: product.description,
            shortDescription: product.shortDescription,
            searchKeywords: product.searchKeywords,
            price: product.price,
            specialPrice: product.specialPrice,
            specialPriceFrom: product.specialPriceFrom,
            specialPriceTo: product.specialPriceTo,
            bestSellers: product.bestSellers,
            newArrivals: product.newArrivals,
            taxClassId: product.taxClassId,
            weight: product.weight,
            unitId: product.unitId,
            isConfigurable: product.isConfigurable,
            metaTitle: product.metaTitle, 
            metaKey: product.metaKey,   
            metaDescription: product.metaDescription,
            optionTitle: product.optionTitle,  
            optionType: product.optionType,  
            optionValue: product.optionValue,  
            color: product.color,      
            size: product.size,
            brand: product.brand,      
            application: product.application,      
            type: product.type,      
            fromDate: product.fromDate,        
            fromTime: product.fromTime,  
            toDate: product.toDate,  
            toTime: product.toTime,   
            visibility: product.visibility,
            status: product.status
          }
        )
      });
      return productList;    
    });
  }
  //For Related product//
  if(id !='' && id !=null){
    var arrRelatedProductIds =[];
    var relatedProductIds = await models.relatedProduct.findAll({attributes:['selectedProductId'], where:{productId:id,type:'Related'}});
    relatedProductIds.forEach(function(re){
      arrRelatedProductIds.push(re.selectedProductId);
    });
    if(arrRelatedProductIds.length > 0){
      arrRelatedProductIds.push(id);
      allProductList = await models.products.findAll({
        attributes:['id', 'storeId', 'sku', 'title', 'price', 'status'],
        where: {
          status:'active',
          isConfigurable:0,
          id:{
            [Op.notIn]:[arrRelatedProductIds]
          },
          storeId:sessionStoreId
        },
        order: [['id', 'DESC']]
      }).then(products => {
        const productList = products.map(product => {
          return Object.assign(
            {},
            {
              productId : product.id,
              title : product.title,
              slug: product.slug,
              url: product.url,
              description: product.description,
              shortDescription: product.shortDescription,
              searchKeywords: product.searchKeywords,
              price: product.price,
              specialPrice: product.specialPrice,
              specialPriceFrom: product.specialPriceFrom,
              specialPriceTo: product.specialPriceTo,
              bestSellers: product.bestSellers,
              newArrivals: product.newArrivals,
              taxClassId: product.taxClassId,
              weight: product.weight,
              unitId: product.unitId,
              isConfigurable: product.isConfigurable,
              metaTitle: product.metaTitle, 
              metaKey: product.metaKey,   
              metaDescription: product.metaDescription,
              optionTitle: product.optionTitle,  
              optionType: product.optionType,  
              optionValue: product.optionValue,  
              color: product.color,      
              size: product.size,
              brand: product.brand,      
              application: product.application,      
              type: product.type,      
              fromDate: product.fromDate,        
              fromTime: product.fromTime,  
              toDate: product.toDate,  
              toTime: product.toTime,   
              visibility: product.visibility,
              status: product.status
            }
          )
        });
        return productList;    
      });
    } else {
      allProductList = productList;
    }
  } else {
    allProductList = productList;
  }
  //For Related product//
  //For Up-Sell Products//
  if(id !='' && id !=null){
    var arrUpSellProductIds =[];
    var upSellProductIds = await models.relatedProduct.findAll({attributes:['selectedProductId'], where:{productId:id,type:'Up-Sells'}});
    upSellProductIds.forEach(function(re){
      arrUpSellProductIds.push(re.selectedProductId);
    });
    if(upSellProductIds.length > 0){
      upSellProductIds.push(id);
      allProductListforUpSell = await models.products.findAll({
        attributes:['id', 'storeId', 'sku', 'title', 'price', 'status'],
        where: {
          status:'active',
          isConfigurable:0,
          id:{
            [Op.notIn]:[upSellProductIds]
          },
          storeId:sessionStoreId
        },
        order: [['id', 'DESC']]
      }).then(products => {
        const productList = products.map(product => {
          return Object.assign(
            {},
            {
              productId : product.id,
              title : product.title,
              slug: product.slug,
              url: product.url,
              description: product.description,
              shortDescription: product.shortDescription,
              searchKeywords: product.searchKeywords,
              price: product.price,
              specialPrice: product.specialPrice,
              specialPriceFrom: product.specialPriceFrom,
              specialPriceTo: product.specialPriceTo,
              bestSellers: product.bestSellers,
              newArrivals: product.newArrivals,
              taxClassId: product.taxClassId,
              weight: product.weight,
              unitId: product.unitId,
              isConfigurable: product.isConfigurable,
              metaTitle: product.metaTitle, 
              metaKey: product.metaKey,   
              metaDescription: product.metaDescription,
              optionTitle: product.optionTitle,  
              optionType: product.optionType,  
              optionValue: product.optionValue,  
              color: product.color,      
              size: product.size,
              brand: product.brand,      
              application: product.application,      
              type: product.type,      
              fromDate: product.fromDate,        
              fromTime: product.fromTime,  
              toDate: product.toDate,  
              toTime: product.toTime,   
              visibility: product.visibility,
              status: product.status,
              categoryId : product.category.id,
              catTitle : product.category.title
            }
          )
        });
        return productList;    
      });
    } else {
      allProductListforUpSell = productList;
    }
  } else {
    allProductListforUpSell = productList;
  }
  //For Up-Sell Products//
  //For Cross-Sell Products//
  if(id !='' && id !=null){
    var arrCrossSellsProductIds =[];
    var crossSellsProductIds = await models.relatedProduct.findAll({attributes:['selectedProductId'], where:{productId:id,type:'Cross-Sells'}});
    crossSellsProductIds.forEach(function(re){
      arrCrossSellsProductIds.push(re.selectedProductId);
    });
    if(arrCrossSellsProductIds.length > 0){
      arrCrossSellsProductIds.push(id);
      allProductListforCrossSell = await models.products.findAll({
        attributes:['id', 'storeId', 'sku', 'title', 'price', 'status'],
        where: {
          status:'active',
          isConfigurable:0,
          id:{
            [Op.notIn]:[arrCrossSellsProductIds]
          },
          storeId:sessionStoreId
        },
        order: [['id', 'DESC']]
      }).then(products => {
        const productList = products.map(product => {
          return Object.assign(
            {},
            {
              productId : product.id,
              title : product.title,
              slug: product.slug,
              url: product.url,
              description: product.description,
              shortDescription: product.shortDescription,
              searchKeywords: product.searchKeywords,
              price: product.price,
              specialPrice: product.specialPrice,
              specialPriceFrom: product.specialPriceFrom,
              specialPriceTo: product.specialPriceTo,
              bestSellers: product.bestSellers,
              newArrivals: product.newArrivals,
              taxClassId: product.taxClassId,
              weight: product.weight,
              unitId: product.unitId,
              isConfigurable: product.isConfigurable,
              metaTitle: product.metaTitle, 
              metaKey: product.metaKey,   
              metaDescription: product.metaDescription,
              optionTitle: product.optionTitle,  
              optionType: product.optionType,  
              optionValue: product.optionValue,  
              color: product.color,      
              size: product.size,
              brand: product.brand,      
              application: product.application,      
              type: product.type,      
              fromDate: product.fromDate,        
              fromTime: product.fromTime,  
              toDate: product.toDate,  
              toTime: product.toTime,   
              visibility: product.visibility,
              status: product.status,
              categoryId : product.category.id,
              catTitle : product.category.title
            }
          )
        });
        return productList;    
      });
    } else {
      allProductListforCrossSell = productList;
    }
  } else {
    allProductListforCrossSell = productList;
  }
  //For Cross-Sell Products//
  //For Add-On Products//
  if(id !='' && id !=null){
    var arrAddOnProductIds =[];
    var addOnProductIds = await models.relatedProduct.findAll({attributes:['selectedProductId'], where:{productId:id,type:'Add-on'}});
    addOnProductIds.forEach(function(re){
      arrAddOnProductIds.push(re.selectedProductId);
    });
    if(arrAddOnProductIds.length > 0){
      arrAddOnProductIds.push(id);
      allProductListforAddon = await models.products.findAll({
        attributes:['id', 'storeId', 'sku', 'title', 'price', 'status'],
        where: {
          status:'active',
          isConfigurable:0,
          id:{
            [Op.notIn]:[arrAddOnProductIds]
          },
          storeId:sessionStoreId
        },
        order: [['id', 'DESC']]
      });
    } else {
      allProductListforAddon = productList;
    }
  } else {
    allProductListforAddon = productList;
  }
  //For Add-On Products//
  var configProducts = await models.products.findAll({ attributes:['id', 'title', 'storeId'], where:{ isConfigurable:id,storeId:sessionStoreId } });
  var categoryDetails = await models.categories.findAll({ where:{status:'Yes',storeId:30}});
  var arr=[];
  var tree ='';
  categoryDetails.forEach(function (cat) {
    arr.push({
      "id": cat.id,
      "title": cat.title,
      "storeId": cat.storeId,
      "parent": cat.parentCategoryId
    });
  });
  tree = unflatten(arr); 
  if(!id){
    return res.render("admin/products/addedit", {
      title: "Add Product",
      arrData: "",
      productImages:'',
      stockQuantity: '',
      arrAllProductList: allProductList,
      arrAllProductListforUpSell :allProductListforUpSell,
      arrAllProductListforCrossSell: allProductListforCrossSell,
      arrAllProductListforAddon : allProductListforAddon,
      arrConfigProducts : configProducts,
      arrCategoryTree : JSON.stringify(tree, null, " "),
      catid: '',
      //allStoresId: allStoresId,
      allBrandsId: allBrandsId,
      attrList:attrList,
      //allUnits: allUnits,
      catName: '',
      arrOption : '',
      arrCategory : '',
      messages: req.flash("info"),
      errors: req.flash("errors"),
    });
  } else {
    var productDetails = await models.products.findOne({ where:{ id:id , storeId:sessionStoreId} });
    const stockDetails = await models.inventory.findAll({ where:{ productId:id , storeId:sessionStoreId}, order: [['id', 'DESC']] });
    let stockQuantity
    if(stockDetails.length >= 1){
      stockQuantity = stockDetails[0].stock
    }else{
      stockQuantity = 0
    }
    
    if(productDetails==null){
      res.redirect('/admin/products');
    }
    var productImages = await models.productImages.findAll({ where:{ productId:id, id:{ [Op.ne]:null }}});
    var productCategory = await models.productCategory.findAll({attributes:['categoryId'], where:{ productId:id,storeId:sessionStoreId } });
    var arrProCat = [];
    var catid =[];
    var catName =[];
    var catProIds =[];
    if(productCategory.length > 0){
      productCategory.forEach(function(cat){
        arrProCat.push(cat.categoryId);
      });
      var category = await models.categories.findAll({
        attributes:['id', 'title','storeId'],
        include: [{
          model: models.productCategory,
          where: {
            categoryId:{
              [Op.in]:[arrProCat]
            },
            storeId:30
          },
        }],
      });
      category.forEach(function(orgcat){
        catid.push(orgcat.id);
        catName.push(orgcat.title);
        catProIds.push({id:orgcat.id,storeId:orgcat.storeId});
      });
    }
    //custom option//
    var arrOption = await models.optionMaster.findAll({
      attributes:['id','title','type','isRequired','sorting'],
      include: [{
        model: models.optionProduct,
        attributes:['productId'],
        required:false,
      },{
        model: models.optionValue,
        attributes:['value', 'price'],
        required:false,            
      }],
    }).then(arrOptions => {
      const list = arrOptions.map(arrOption => {
        return Object.assign(
          {},
          {
            id: arrOption.id,
            title: arrOption.title,
            type: arrOption.type,
            isRequired: arrOption.isRequired,
            sorting: arrOption.sorting,
            productId: arrOption.optionProduct ? arrOption.optionProduct.productId :null,
            optionValue: arrOption.optionValues.map(oV => {
              return Object.assign(
                {},
                {
                  value:oV.value,
                  price:oV.price,
                }
              )
            })
          }
        );
      })
      return list;
    });
    return res.render("admin/products/addedit", {
      title: "Edit Product",
      arrData: productDetails,
      stockQuantity: stockQuantity,
      arrCategoryTree : JSON.stringify(tree, null, " "),
      arrAllProductList: allProductList,
      arrAllProductListforUpSell :allProductListforUpSell,
      arrAllProductListforCrossSell: allProductListforCrossSell,
      arrAllProductListforAddon : allProductListforAddon,
      productImages : productImages,             
      arrConfigProducts : configProducts, 
      catid: catid,
      //allStoresId: allStoresId,
      allBrandsId: allBrandsId,
      attrList:attrList,
      //allUnits: allUnits,
      catName: catName,
      arrCategory: JSON.stringify(catProIds, null, " "),
      arrOption : arrOption,
      messages: req.flash("info"),
      errors: req.flash("errors"),
    });
  }
}
}





/**
* Description: Products add Geneneral Info
* Developer:Susanta Kumar Das
**/

exports.addGenInfo = async function(req,res){
  var form = new multiparty.Form();
  form.parse(req,async function (err, fields, files) {
    var productId = fields.updateId[0];
    var storeIds = fields.storeIds[0];
    // var sessionStoreId = 30;
    console.log('store============>',storeIds);
    var jsonHiddenCatIds = fields.hiddenCatIds[0];
    var hiddenCatIds = jsonHiddenCatIds.split(',');
    var hiddenStoreIds = JSON.parse(storeIds);
    // var sessionStoreId = req.session.user.storeId;
    var sessionStoreId = 30;
    //var sessionUserId = req.session.user.id;
    if(fields.status == 'active'){
      var status = 'active';
    } else {
      var status = 'inactive';
    }
    if(fields.bestSellers == 'yes'){
      var bestSellers = 'yes';
    }else{
      var bestSellers = 'no';
    }
    if(fields.newArrivals == 'yes'){
      var newArrivals = 'yes';
    }else{
      var newArrivals = 'no';
    }
    if(fields.type[0] == 'Addon'){
      var isConfigurable = null;
    } else {
      var isConfigurable = 0;
    }
    if( fields.specialPrice == '' ){
      var specialPrice = 0.00;
    } else {
      var specialPrice = fields.specialPrice;
    }
    if(productId !='' && productId !=null){
      models.products.update({
        status: status,
        bestSellers : bestSellers,
        newArrivals : newArrivals,
        // storeId: 1,
        type: fields.type[0],
        title : fields.title[0],
        sku : fields.sku[0],
        slug : fields.slug[0],
        price : fields.price[0],
        specialPrice : specialPrice  ,
        specialPriceFrom : fields.specialPriceFrom[0] ? fields.specialPriceFrom[0] : null,
        specialPriceTo : fields.specialPriceTo[0] ? fields.specialPriceTo[0] : null,
        // weight : fields.weight[0],
        // visibility : fields.visibility[0],
        // color : fields.color[0],
        // size : fields.size[0],
        brand : fields.brand ? fields.brand[0] : null,
        isConfigurable : isConfigurable,
        status : fields.status[0],
      },{where:{id:productId}}).then(async function(crt){
        if(crt){
          // const stock = fields.stock[0] || ''
          // await models.inventory.create({
          //   productId : productId,
          //   storeId : sessionStoreId,
          //   stock : stock,
          //   remarks : `${stock} new quantity added`
          // })
          if(hiddenStoreIds !=''){
            var deletecapPro = await models.productCategory.destroy({ where:{ productId:productId, storeId:sessionStoreId }});
            if(deletecapPro == 0){
              for(var i=0; i< hiddenStoreIds.length; i++){
                models.productCategory.create({
                  // storeId : hiddenStoreIds[i].storeId,
                  storeId : sessionStoreId,
                  categoryId : hiddenStoreIds[i].id,
                  productId : productId,
                  position : i
                })
              }
            } else {
              for(var i=0; i< hiddenStoreIds.length; i++){
                models.productCategory.create({
                  storeId : hiddenStoreIds[i].storeId,
                  storeId : sessionStoreId,
                  categoryId : hiddenStoreIds[i].id,
                  productId : productId,
                  position : i
                })
              }
            }                    
          }
          req.flash("info", "Successfully Updated");
          return res.redirect("/admin/products/addedit/"+productId);
        } else {
          req.flash("errors", "Something Worng! Please try again.");
          return res.redirect("back");
        }
      })
    } else {
      models.products.create({
        status:status,
        bestSellers : bestSellers,
        newArrivals : newArrivals,
        //storeId: 1,
        storeId : sessionStoreId,
        type: fields.type[0],
        title : fields.title[0],
        sku : fields.sku[0],
        slug : fields.slug[0],
        price : fields.price[0],
        specialPrice : specialPrice,
        specialPriceFrom : fields.specialPriceFrom[0] ? fields.specialPriceFrom[0] : null,
        specialPriceTo : fields.specialPriceTo[0] ? fields.specialPriceTo[0] : null,
        // weight : fields.weight[0],
        // //unitId : fields.unitId[0],
        // visibility : fields.visibility[0],
        // color : fields.color[0],
        // size : fields.size[0],
        brand : fields.brand ? fields.brand[0] : null,
        status : fields.status[0],
        isConfigurable : isConfigurable
      }).then(async function(crt){
        if(crt){
          // const stock = fields.stock[0] || ''
          // await models.inventory.create({
          //   productId : crt.id,
          //   storeId : sessionStoreId,
          //   stock : stock
          // })

          if(hiddenStoreIds !=''){
            var deletecapPro = await models.productCategory.destroy({ where:{ productId:crt.id }});
            if(deletecapPro == 0){
              for(var i=0; i< hiddenStoreIds.length; i++){
                models.productCategory.create({
                  storeId: hiddenStoreIds[i].storeId,
                  storeId : hiddenStoreIds[i].storeId,
                  categoryId : hiddenStoreIds[i].id,
                  productId : crt.id,
                  position : i
                })
              }
            } else {
              for(var i=0; i< hiddenStoreIds.length; i++){
                models.productCategory.create({
                  storeId: hiddenStoreIds[i].storeId,
                  storeId : hiddenStoreIds[i].storeId,
                  categoryId : hiddenStoreIds[i].id,
                  productId : crt.id,
                  position : i
                })
              }
            }                    
          }
          req.flash("info", "Successfully Updated");
          return res.redirect("/admin/products");
        } else {
          req.flash("errors", "Something Worng! Please try again.");
          return res.redirect("back");
        }
      })
    }
  });
}




/**
* Description: Products add Attribute Info
* Developer:Partha Mandal
**/
exports.addAttrInfo = async function(req,res){
  var form = new multiparty.Form();
  form.parse(req,async function (err, fields, files) {
    var productId = fields.updateId[0];
    if(productId !='' && productId !=null){

      delete fields.updateId;
      Object.keys(fields).forEach((item, index) => {
         sequelize.query(`UPDATE products SET ${item}='${fields[item]}' WHERE id=${productId}`)
      })
      req.flash('info', 'Successfully updated');
      res.redirect('back');
    }else{
      let query = `INSERT INTO products (`
      let value = '';
      delete fields.updateId;
      Object.keys(fields).forEach((item, index) => {
          if(index === Object.keys(fields).length -1){
              query+= `${item} `;
              value += `'${fields[item]}'`
          }else{
              query+= `${item}, `;
              value += `'${fields[item]}',`
          }
      })
      query +=') VALUES ('+ value + ');';
      sequelize.query(query).then((success)=>{
          req.flash('info', 'Successfully created');
          res.redirect('back');
      }).catch((error)=>{
          req.flash('errors', 'Something went wrong');
          res.redirect('back');
      })
    }
  })

}





/**
* Description: Products add image
* Developer:Susanta Kumar Das
**/
exports.addFile = async function(req,res){
  //return res.send(req)
  var form = new multiparty.Form();
  form.parse(req,async function (err, fields, files) {
   // return res.send(fields);
    var productImages = files.image;
    //console.log(productImages); return false;
    var productId= fields.updateIdForFile[0];
    if(productId !=null && productId !=''){
      if(productImages !=''){
        var productFiles = [];
        helper.createDirectory('public/admin/products/image/'+productId+'/');
        productImages.forEach(async function(img){
          var tempPath = img.path;
          var fileName = img.originalFilename;
          var targetPath = productId+'/'+fileName;
          helper.uploadProductImage(tempPath, targetPath);
        });
        var productDetals = await models.products.findOne({attributes:['storeId'], where:{id:productId}})
        for(var i= 0; i < productImages.length; i++){                                   
          models.productImages.create({productId:productId, storeId:productDetals.storeId, file:productImages[i].originalFilename });              
        };
        req.flash("info", "Product Images Saved Successfully.");
        return res.redirect("/admin/products/addedit/"+productId);
      } else {
        req.flash("info", "Product Images Saved Successfully.");
        return res.redirect("/admin/products/addedit/"+productId);
      }
    } else {
      req.flash("info", "Product Images Not Upload.");
      return res.redirect("/admin/products/addedit/"+productId);
    }
  })
}




/**
* Description: Products add Content Info
* Developer:Susanta Kumar Das
**/
exports.addContentInfo = async function(req,res){
  var form = new multiparty.Form();
  form.parse(req,async function (err, fields, files) {
    var productId = fields.updateId[0];
    if(productId !=''){
      models.products.update({
        description : fields.description[0],
        shortDescription : fields.shortDescription[0],
        searchKeywords : fields.searchKeywords[0],
        optionTitle : fields.optionTitle[0],
        optionType : fields.optionType[0],
        optionValue : fields.optionValue[0],
        application : fields.application[0],
        fromDate : fields.fromDate ? fields.fromDate[0] : null,
        fromTime : fields.fromTime ? fields.fromTime[0] : null,
        toDate : fields.toDate ? fields.toDate[0] : null,
        toTime : fields.toTime ? fields.toTime[0] : null,
      },{where:{id:productId}}).then(function(upd){
        req.flash("info", "Successfully Updated");
        return res.redirect("/admin/products/addedit/"+productId);
      })
    } else {
      models.products.create({
        description : fields.description[0],
        shortDescription : fields.shortDescription[0],
        searchKeywords : fields.searchKeywords[0],
        optionTitle : fields.optionTitle[0],
        optionType : fields.optionType[0],
        optionValue : fields.optionValue[0],
        application : fields.application[0],
        fromDate : fields.fromDate ? fields.fromDate[0] : null,
        fromTime : fields.fromTime ? fields.fromTime[0] : null,
        toDate : fields.toDate ? fields.toDate[0] : null,
        toTime : fields.toDate ? fields.toDate[0] : null,
      }).then(function(crt){
        req.flash("info", "Successfully Created");
        return res.redirect("/admin/products/addedit/"+crt.id);
      })
    }
  });
}



/**
* Description: Products add Seo Info
* Developer:Susanta Kumar Das
**/
exports.addSeoInfo = async function(req,res){
  var form = new multiparty.Form();
  form.parse(req,async function (err, fields, files) {
    var productId = fields.updateId[0];
    if(productId !=''){
      models.products.update({
        url : fields.url[0],
        metaTitle : fields.metaTitle[0],
        metaKey : fields.metaKey[0],
        metaDescription : fields.metaDescription[0],
      },{where:{id:productId}}).then(function(upd){
        req.flash("info", "Successfully Updated");
        return res.redirect("/admin/products/addedit/"+productId);
      })
    }else{
      models.products.create({
        url : fields.url[0],
        metaTitle : fields.metaTitle[0],
        metaKey : fields.metaKey[0],
        metaDescription : fields.metaDescription[0],
      }).then(function(crt){
        req.flash("info", "Successfully Created");
        return res.redirect("/admin/products/addedit/"+crt.id);
      })
    }
  });
}




/**
* Description: Products remove Image
* Developer:Susanta Kumar Das
**/
exports.removeImages = async function(req,res){
  var productId = req.params.productId;
  var imgId = req.params.imgId;
  if(productId!='' && imgId !=''){
    var productImageDetails = await models.productImages.findOne({where:{id:imgId,productId:productId}});
    var fileName = productImageDetails.file;
      fs.unlink('public/admin/products/image/'+productId+'/'+fileName, function (err) {
    });
    models.productImages.destroy({where:{id:imgId,productId:productId}}).then(function(dst){
      if(dst){
        req.flash("info", "Image Successfully Removed");
        return res.redirect("/admin/products/addedit/"+productId);
      }else{
        req.flash("errors", "Something Worng! Please try again.");
        return res.redirect("/admin/products/addedit/"+productId);
      }
    })
  }
}




/**
* Description: Products add Related
* Developer:Susanta Kumar Das
**/
exports.addRelPro = async function(req,res){
  var form = new multiparty.Form();
  form.parse(req,async function (err, fields, files) {
    var selectProduct = fields.selectProduct[0];
    var arrSelectProduct = selectProduct.split(',');
    var productId = fields.productId[0];
    var storeId = fields.storeId[0];
    if(selectProduct !='' && productId !=''){ 
      for(var i=0;i < arrSelectProduct.length; i++){ 
        models.relatedProduct.create({
          productId:productId,
          storeId:storeId,
          selectedProductId : arrSelectProduct[i],
          type :'Related',
          createdAt: Date.now()  
        }).then(function(crt){
          req.flash("info", "Related Product Added Successfully");
          return res.redirect("/admin/products/addedit/"+productId);
        })
      }     
    }else{
      req.flash("errors", "Please try again.");
      return res.redirect("/admin/products/addedit/"+productId);
    }
  })
}


/**
* Description: Products add Up Sell
* Developer:Susanta Kumar Das
**/
exports.addUpSellPro = async function(req,res){
  var form = new multiparty.Form();
  form.parse(req,async function (err, fields, files) {
    var selectProduct = fields.selectProduct[0];
    var arrSelectProduct = selectProduct.split(',');
    var productId = fields.productId[0];
    var storeId = fields.storeId[0];
    if(selectProduct !='' && productId !=''){ 
      for(var i=0;i < arrSelectProduct.length; i++){ 
        models.relatedProduct.create({
          productId:productId,
          storeId:storeId,
          selected_id : arrSelectProduct[i],
          type :'Up-Sells',
          createdAt: Date.now()  
        }).then(function(crt){
          req.flash("info", "Up-Sells Product Added Successfully");
        return res.redirect("/admin/products/addedit/"+productId);
        })
      }     
    }else{
      req.flash("errors", "Please try again.");
      return res.redirect("/admin/products/addedit/"+productId);
    }
  })
}




/**
* Description: Products add Cross Sells
* Developer:Susanta Kumar Das
**/
exports.addCrossSellsPro = async function(req,res){
  var form = new multiparty.Form();
  form.parse(req,async function (err, fields, files) {
    var selectProduct = fields.selectProduct[0];
    var arrSelectProduct = selectProduct.split(',');
    var productId = fields.productId[0];
    var storeId = fields.storeId[0];
    if(selectProduct !='' && productId !=''){ 
      for(var i=0;i < arrSelectProduct.length; i++){ 
        models.relatedProduct.create({
          productId:productId,
          storeId:storeId,
          selected_id : arrSelectProduct[i],
          type :'Cross-Sells',
          createdAt: Date.now()  
        }).then(function(crt){
          req.flash("info", "Cross-Sells Product Added Successfully");
        return res.redirect("/admin/products/addedit/"+productId);
        })
      }     
    }else{
      req.flash("errors", "Please try again.");
      return res.redirect("/admin/products/addedit/"+productId);
    }
  })
}





/**
* Description: Products add Add on
* Developer:Susanta Kumar Das
**/
exports.addAddonPro = async function(req,res){
  var form = new multiparty.Form();
  form.parse(req,async function (err, fields, files) {
    var selectProduct = fields.selectProduct[0];
    var arrSelectProduct = selectProduct.split(',');
    var productId = fields.productId[0];
    var storeId = fields.storeId[0];
    if(selectProduct !='' && p_id !=''){ 
      for(var i=0;i < arrSelectProduct.length; i++){ 
        models.relatedProduct.create({
          productId:productId,
          storeId : arrSelectProduct[i],
          type :'Add-on',
          createdAt: Date.now()  
        }).then(function(crt){
          req.flash("info", "Add-on Product Added Successfully");
        return res.redirect("/admin/products/addedit/"+productId);
        })
      }     
    }else{
      req.flash("errors", "Please try again.");
      return res.redirect("/admin/products/addedit/"+productId);
    }
  })
}




/**
* Description: Products create/update
* Developer:Susanta Kumar Das
**/
exports.configProduct = async function(req,res){
  var form = new multiparty.Form();
  form.parse(req,async function (err, fields, files) {
    var org_product_id = fields.mailProductId[0];
    var productDetals = await models.product.findOne({where:{id:org_product_id}});
    var addOneProduct = await models.related_product.findAll({where:{p_id : org_product_id,type:"Add-on"}});
    var conf_pro_size = JSON.parse(JSON.stringify(fields.conf_pro_size));
    var conf_pro_price = JSON.parse(JSON.stringify(fields.conf_pro_price));
    var conf_pro_sp_price =  JSON.parse(JSON.stringify(fields.conf_pro_sp_price));
    var con_pro_status = JSON.parse(JSON.stringify(fields.con_pro_status));
    var conf_product_id = JSON.parse(JSON.stringify(fields.conf_id));
    for(var i=0; i < conf_pro_size.length; i++){
      if(conf_product_id[i] ==''){
        models.product.create({
          title : productDetals.title,
          sku : productDetals.sku,
          short_description : productDetals.short_description,
          description : productDetals.description,
          keyword: productDetals.keyword,
          price: conf_pro_price[i],
          special_price: conf_pro_sp_price[i],
          is_configurable : productDetals.id,
          size : conf_pro_size[i],
          status : con_pro_status[i],
          inventory : productDetals.inventory,
          veg_only : productDetals.veg_only,
          best_sellers : productDetals.best_sellers,
          new_arrivals: productDetals.new_arrivals,
        }).then(function(crt){
          if(addOneProduct.length > 0){
            for(var i=0; i < addOneProduct.length; i++){
              models.related_product.create({
                p_id : crt.id,
                selected_id : addOneProduct[i].selected_id,
                type: "Add-on"
              })
            }
          }
          req.flash("info", "Configurable Product Added Successfully");
          return res.redirect("/admin/products/addedit/"+org_product_id);
        })
      }else{
        models.product.update({
          title : productDetals.title,
          sku : productDetals.sku,
          short_description : productDetals.short_description,
          description : productDetals.description,
          keyword: productDetals.keyword,
          price: conf_pro_price[i],
          special_price: conf_pro_sp_price[i],
          is_configurable : productDetals.id,
          size : conf_pro_size[i],
          status : con_pro_status[i],
          inventory : productDetals.inventory,
          veg_only : productDetals.veg_only,
          best_sellers : productDetals.best_sellers,
          new_arrivals: productDetals.new_arrivals,
        },{where:{id:conf_product_id[i],is_configurable:org_product_id}}).then(function(upd){
          req.flash("info", "Configurable Product Added Successfully");
          return res.redirect("/admin/products/addedit/"+org_product_id);
        })
      }      
    }
  })
}





/**
* Description: Products create/update
* Developer:Susanta Kumar Das
**/
exports.addcustomeOption = async function(req,res){
  var form = new multiparty.Form();
  form.parse(req,async function (err, fields, files) {
    var value='';
    var page_product_id = fields.page_product_id[0];
    var page_option_id = fields.page_option_id ? fields.page_option_id[0] : '';
    var option_title = fields.option_title[0];
    var option_type = fields.option_type[0];
    var is_required = fields.is_required[0];
    var option_text_price = fields.option_text_price ? fields.option_text_price[0]:'';
    var option_sel_title  = fields.option_sel_title ? fields.option_sel_title[0]:'';
    var option_sel_price = fields.option_sel_price ? fields.option_sel_price[0]:'';
    if(option_text_price !='' && option_text_price !=null){
      value = { "title":"","price": option_text_price};      
    }else{
      value = { "title":option_sel_title,"price":option_sel_price}; 
    }
    if(!page_option_id){
      models.option.create({
        title : option_title,
        type: option_type,
        is_required : is_required
      }).then(function(crt){
          models.option_value.create({
            option_id : crt.id,
            value : JSON.stringify(value)
          }).then(function(crt2){
            models.option_product.create({
              option_id : crt.id,
              product_id : page_product_id
            }) 
          })         
        })
      req.flash("info", "Custom Option Added Successfully");
      return res.redirect("/admin/products/addedit/"+page_product_id);
    }else{
      models.option.update({
        title : option_title,
        type: option_type,
        is_required : is_required
      },{where:{id: page_option_id}}).then(function(crt){
          models.option_value.update({
            option_id : page_option_id,
            value : JSON.stringify(value)
          },{where:{option_id:page_option_id}}).then(function(crt2){
            models.option_product.update({
              option_id : page_option_id,
              product_id : page_product_id
            },{where:{option_id:page_option_id}}) 
          })         
        })
      req.flash("info", "Custom Option Updated Successfully");
      return res.redirect("/admin/products/addedit/"+page_product_id);
    }
    
  });
}





/**
* Description: Products create/update
* Developer:Susanta Kumar Das
**/
exports.deleteCustomeOption = async function(req,res){
  var option_id = req.params.optionId;
  if(option_id !=''){
    models.option.destroy({where: { id: option_id }}).then(function(val){
      models.option_value.destroy({where:{option_id: option_id}}).then(function(dst){
        models.option_product.destroy({where:{option_id:option_id}});
    })
  })
  req.flash("info", "Successfully Deleted");
  res.redirect("back");
  }
}





/**
* Description: Products create/update
* Developer:Susanta Kumar Das
**/
exports.deleteConfigProduct = async function(req,res){
  var productId = req.params.productId;
  var confId = req.params.confId;
  if(productId !='' || confId !=''){
    models.product.destroy({where:{id:confId,is_configurable:productId}}).then(function(dst){
      models.related_product.destroy({where:{p_id : confId}});
        if(dst){
          req.flash("info", "Configurable Product Successfully removed");
          return res.redirect("/admin/products/addedit/"+productId);
        }else{
          req.flash("errors", "Something worng! Please try again.");
          return res.redirect("/admin/products/addedit/"+productId);
        }  
    })
  }else{
    req.flash("errors", "Something worng! Please try again.");
    return res.redirect("/admin/products/addedit/"+productId);
  }
}





/**
* Description: Products create/update
* Developer:Susanta Kumar Das
**/
exports.deleteProduct = async function(req,res){
  var token= req.session.token;
  var sessionStoreId = req.session.user.storeId;
  var role = req.session.role;
  //*****Permission Assign Start
  var userPermission='';
  if (sessionStoreId == null) {
      userPermission=true;
  }else{
      userPermission = !! req.session.permissions.find(permission => { 
        return permission === 'ProductDelete'
    })
  }
  if(userPermission==false){
      res.redirect('/admin/dashboard');
  }else{
    //*****Permission Assign End

    var id = req.params.id;
    models.products.destroy({where: { id: id, storeId: sessionStoreId }}).then(function(val){
      if(val){
          models.product_category.destroy({where:{product_id: id, storeId: sessionStoreId}}).then(function(dst){
            models.related_product.destroy({where:{p_id:id}});
        })
      }else{
        req.flash('errors','Something went wrong');
        res.redirect('back');
      }
    })
    req.flash("info", "Successfully Deleted");
    res.redirect("back");
  }
}





/**
* Description: Products create/update
* Developer:Susanta Kumar Das
**/
function unflatten(arr) {
  var tree = [],
    mappedArr = {},
    arrElem,
    mappedElem;

  // First map the nodes of the array to an object -> create a hash table.
  for (var i = 0, len = arr.length; i < len; i++) {
    arrElem = arr[i];
    mappedArr[arrElem.id] = arrElem;
    mappedArr[arrElem.id]['subs'] = [];
  }
  for (var id in mappedArr) {
    if (mappedArr.hasOwnProperty(id)) {
      mappedElem = mappedArr[id];
      // If the element is not at the root level, add it to its parent array of subs.
      if (mappedElem.parent) {
        mappedArr[mappedElem['parent']]['subs'].push(mappedElem);
      }
      // If the element is at the root level, add it to first level elements array.
      else {
        tree.push(mappedElem);
      }
    }
  }
  return tree;
}



exports.downloadReport = async function (req, res, next) {

  var sessionStoreId = req.session.user.storeId;
  var sessionUserId = req.session.user.id;
  var role = req.session.role;

  var workbook = new Excel.Workbook();

  workbook.creator = 'Me';
  workbook.lastModifiedBy = 'Her';
  workbook.created = new Date(1985, 8, 30);
  workbook.modified = new Date();
  workbook.lastPrinted = new Date(2016, 9, 27);
  workbook.properties.date1904 = true;

  workbook.views = [
      {
          x: 0, y: 0, width: 10000, height: 20000,
          firstSheet: 0, activeTab: 1, visibility: 'visible'
      }
  ];

  var worksheet = workbook.addWorksheet('My Sheet');
  worksheet.columns = [
      { header: 'Product name', key: 'proName', width: 10 },
      //{ header: 'Quantity', key: 'qty', width: 10 },
      
      { header: 'orderbook-qty', key: 'orderBookqty', width: 10 },
      { header: 'stock review-qty', key: 'stockReviewqty', width: 10 },
      { header: 'stock return', key: 'stockReturn', width: 10 },
      { header: 'Sample', key: 'sample', width: 10 },
              
  ];


  var sessionStoreId = req.session.user.storeId;
  var form = new multiparty.Form();
  form.parse(req, async function(err, fields, files) {

  var product = await models.products.findAll({attributes:['id','title','price'] });

      
    for(var i=0;i<product.length;i++){
      var pid = product[i].id;

          //var orderBook = await models.orderBook.findAll({attributes:['productId','quantity'], where:{productId:pid} });
         /*var sum=0;
           for(var j=0; j<orderBook.length; j++){
              var quantity =orderBook[j].quantity;
              sum=sum+quantity;
            }*/
            var orderbookid='';
            var orderBook = await models.orderBook.findAll({attributes:[ [sequelize.fn('sum', sequelize.col('quantity')), 'total_quantity'] ], where:{productId:pid} });
           /* for(var j=0; j<orderBook.length; j++){
            var orderbookid = orderBook[j].productId;
            }*/
          //console.log(orderBook[0].dataValues.total_quantity);return false;

          var stockReview = await models.stockReview.findAll({attributes:[ [sequelize.fn('sum', sequelize.col('quantity')), 'total_reviewquantity'] ], where:{productId:pid},
                           /* include:[{
                              model:models.orderBook,
                              attributes:['productId'],
                              where:{
                                productId :productId
                              }
                            }] */
                          });
          //console.log(stockReview[0].dataValues.total_reviewquantity);return false;


        var stockReturn = await models.stockReturn.findAll({attributes:[ [sequelize.fn('sum', sequelize.col('quantity')), 'total_returnquantity'] ], where:{productId:pid},});
    //console.log(stockReturn[0].dataValues.total_returnquantity);return false;

        var sample = await models.sample.findAll({attributes:[ [sequelize.fn('sum', sequelize.col('quantity')), 'total_sample'] ], where:{productId:pid},});
        //console.log(sample[0].dataValues.total_sample);return false;

          worksheet.addRow({
              SlNo  : i+1,
              proName : product[i].title,
              orderBookqty     :orderBook[0].dataValues.total_quantity==null?'0':orderBook[0].dataValues.total_quantity,
              stockReviewqty   :stockReview[0].dataValues.total_reviewquantity==null?'0':stockReview[0].dataValues.total_reviewquantity,
              stockReturn   :stockReturn[0].dataValues.total_returnquantity==null?'0':stockReturn[0].dataValues.total_returnnquantity,
              sample        :sample[0].dataValues.total_sample==null?'0':sample[0].dataValues.total_sample,


          })

      }
          
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader("Content-Disposition", "attachment; filename=" + "Product Report.csv");
          workbook.csv.write(res)
          .then(function (data) {
              res.end();
              console.log('File write done........');
          });
  });   
  
 
      
};


exports.productStatusChange = function(req, res, next) {
  var id = req.params.id;
  var sessionStoreId = req.session.user.storeId;
  var orderStatusData = req.params.data;
  console.log(id);
  // return res.send(orderStatusData);
  // console.log(orderStatusData);
  if(!id){
      res.status(200).send({ status:205, message: "Id not found" });
  }else{
     
    models.products.update({
      status:orderStatusData,
    },{where:{id:id,storeId:sessionStoreId}})
        
  }
    // window.location.href = window.location.href;
    // window.location.reload();
    // res.redirect('back');
    return res.redirect("/admin/products");

}