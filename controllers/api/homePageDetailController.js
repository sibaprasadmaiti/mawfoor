var models = require("../../models");
var path = require("path");
var jwt = require("jsonwebtoken");
var SECRET = "nodescratch";
var bcrypt = require("bcrypt-nodejs");
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
      idle: 10000,
    },
  }
);

////////////////////////////////   HomeDetails      /////////////////////////
exports.homeDetails = async function (req, res) {
    var storeId = req.body.data.storeId;
    var advertiseArray = [];
    var bannerImageArray = [];
    var offerArray = [];
    var homeAdvertiseArray = [];
    var homebrandsArray = [];
    var testimonialArray = [];

    if(!storeId && storeId==null){
      return res.status(200).send({ data:{success:false, details:"Please Enter Required Details"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
    }else{
      //var bannerList = await sequelize.query("select id, title, CONCAT('" +req.app.locals.baseurl +"', IFNULL(image, 'no_image.jpg')) as image from banner where status ='Yes' and type='Slider' and storeId="+storeId+"",{ type: Sequelize.QueryTypes.SELECT });      
      //var categoryList = await sequelize.query("select id, title, slug, CONCAT('" +req.app.locals.baseurl +"superpos/myimages/" +"', IFNULL(image, 'no_image.jpg')) as icon from categories where storeId="+storeId+" and status ='Yes' and includeInHome='yes' order by title",{ type: Sequelize.QueryTypes.SELECT });
      
      // var testmonialList = await sequelize.query("select id, title, description, designation, CONCAT('" +req.app.locals.baseurl +"superpos/myimages/testimonial/" +"', IFNULL(image, 'no_image.jpg')) as image from testimonials where storeId="+storeId+" and status ='Yes' ",{ type: Sequelize.QueryTypes.SELECT });
      var testmonialList = await models.testimonials.findAll({where: { storeId: storeId, status:"Yes" },attributes: ["id", "title", "description", "designation","image"],order: [['id', 'DESC']]});
      if(testmonialList.length>0){
        for(var t=0;t<testmonialList.length;t++){
          if(testmonialList[t].image && testmonialList[t].image != null && testmonialList[t].image != ''){
            // var brandsImage = req.app.locals.baseurl+'admin/testimonials/'+testmonialList[t].image;
            var testimonialImage = req.app.locals.baseurl+'admin/testimonials/'+testmonialList[t].id+'/'+testmonialList[t].image;
          } else {
            var testimonialImage = req.app.locals.baseurl+'admin/testimonials/no_image.jpg';
          }

          testimonialArray.push({
            "id":testmonialList[t].id,
            "title":testmonialList[t].title,
            "description":testmonialList[t].description,
            "designation":testmonialList[t].designation,
            "image": testimonialImage
          });
        }
      }
      
      //var bestSellingList = [];
      /*await sequelize.query(
            "select p.id, p.slug, p.title, p.price, p.special_price, p.category_id, c.title 'category_title', "+
            "CONCAT('"+req.app.locals.baseurl+"superpos/myimages/product/icon/', IFNULL(p.icon, 'superpos/images/no-product-image.jpg')) as icon ,"+
            "s.max_pro_availability, "+
            "(SELECT inventory.stock FROM inventory WHERE inventory.product_id = p.id order BY inventory.inventory_id DESC LIMIT 1) as stock "+
            "from categories as c "+
            "left join productCategory as a on a.category_id = c.id "+
            "left join products as p on p.id = a.product_id "+
            "left join siteSettings as s on s.id = 1 "+
            "where c.slug = 'best-selling' and p.status = 'yes' ORDER BY RAND() limit 4", { type: Sequelize.QueryTypes.SELECT });*/
      
      var welcomeList = await sequelize.query("select id, title, content from section where storeId="+storeId+" and status ='Yes' and title='WELCOME TO PLYWALE'",{ type: Sequelize.QueryTypes.SELECT });
      
      //var lookingForList = await sequelize.query("select id,title, content from section where storeId="+storeId+" and status ='Yes' and title='Looking for a Carpenter?'",{ type: Sequelize.QueryTypes.SELECT });
     
      var socialLinks = await sequelize.query("select facebook, twitter, linkedin, instagram from siteSettings where storeId="+storeId+" and title='Social Url'",{ type: Sequelize.QueryTypes.SELECT });
      var brandsList = await models.brands.findAll({where: { storeId: storeId, status:"Yes" },attributes: ["id", "title", "slug", "image","sequence"],order: [['sequence', 'ASC']]});
      if(brandsList.length>0){
        for(var b=0;b<brandsList.length;b++){
          if(brandsList[b].image && brandsList[b].image != null && brandsList[b].image != ''){
            var brandsImage = req.app.locals.baseurl+'admin/brands/'+brandsList[b].image;
          } else {
            var brandsImage = req.app.locals.baseurl+'admin/brands/no_image.jpg';
          }

          homebrandsArray.push({
            "id":brandsList[b].id,
            "title":brandsList[b].title,
            "slug":brandsList[b].slug,
            "image": brandsImage
          });
        }
      }
      
      //var specialOffresList = [];
      /*await sequelize.query(
        "select p.id, p.slug, p.title, p.price, p.special_price, p.category_id, c.title 'category_title', "+
        "CONCAT('"+req.app.locals.baseurl+"superpos/myimages/product/icon/', IFNULL(p.icon, 'superpos/images/no-product-image.jpg')) as icon ,"+
        "s.max_pro_availability, "+
        "(SELECT inventory.stock FROM inventory WHERE inventory.product_id = p.id order BY inventory.inventory_id DESC LIMIT 1) as stock "+
        "from category as c "+
        "left join product_category as a on a.category_id = c.id "+
        "left join product as p on p.id = a.product_id "+
        "left join site_settings as s on s.id = 1 "+
        "where p.special_offer = 'yes' and p.status = 'active'", { type: Sequelize.QueryTypes.SELECT });*/
        
      //var newArrivasList = [];/*await sequelize.query("select new_arrival_id, title, slug, url, CONCAT('" +req.app.locals.baseurl +"superpos/myimages/new_arrivals/', IFNULL(image, 'no_image.jpg')) as image from new_arrival where status ='active'",{ type: Sequelize.QueryTypes.SELECT });*/
      //console.log(newArrivasList);return false;

      // var groceryHomeContent = await sequelize.query("select id, title, content from section where storeId="+storeId+" and status ='Yes' and id = 14",{ type: Sequelize.QueryTypes.SELECT });
      // var groceryAdvertiseImage = await sequelize.query("select id, title,image from banner where storeId = "+storeId+" and status ='Yes' and type = 'advertise'",{ type: Sequelize.QueryTypes.SELECT });

      var groceryHomeContent = await models.section.findOne({where: { storeId: storeId, status:"Yes", slug:"grocery-home-page-14" },attributes: ["id", "title", "content"]});
      var groceryAdvertiseImage = await models.banner.findAll({where: { storeId: storeId, status:"Yes", type: 'advertise' },attributes: ["id", "title", "shortDescription", "image"]});

      if(groceryAdvertiseImage.length>0){
        for(var j=0;j<groceryAdvertiseImage.length;j++){
          if(groceryAdvertiseImage[j].image && groceryAdvertiseImage[j].image != null && groceryAdvertiseImage[j].image != ''){
            var advertiseImage = req.app.locals.baseurl+'admin/banner/image/'+groceryAdvertiseImage[j].id+'/'+groceryAdvertiseImage[j].image;
          } else {
            var advertiseImage = req.app.locals.baseurl+'admin/banner/no_image.jpg';
          }

          advertiseArray.push({
            "id":groceryAdvertiseImage[j].id,
            "title":groceryAdvertiseImage[j].title,
            "images": advertiseImage
          });
        }
      }

      // await models.banner.findAll({ where: { storeId: storeId, status: "Yes", type: 'slider' } }).then((value) => {
      //   const bannerList = value.map((banner) => {
      //     return Object.assign(
      //       {},
      //       {
      //         id: banner.id,
      //         title: banner.title,
      //         shortDescription: banner.shortDescription,
      //         type: banner.type,
      //         image:
      //           banner.image != "" && banner.image != null
      //             ? req.app.locals.baseurl +
      //               "admin/banner/image/" +
      //               banner.id +
      //               "/" +
      //               banner.image
      //             : "",
      //       }
      //     );
      //   });
      // })

      var bannerList = await models.banner.findAll({where: { storeId: storeId, status:"Yes", type: 'slider' },attributes: ["id", "title", "shortDescription", "type", "image", "categoryId","sequence","brandId"], order: [['sequence', 'ASC']]});
      console.log("bannerListbannerListbannerListbannerList----"+bannerList.length)
      if(bannerList.length>0){
        for(var i=0;i<bannerList.length;i++){
          if(bannerList[i].brandId && bannerList[i].brandId != null && bannerList[i].brandId != ''){
            var brandsDetails = await models.brands.findAll({where: { storeId: storeId, status:"Yes", id: bannerList[i].brandId },attributes: ["id", "title", "slug"]});
            console.log("brandsDetailsbrandsDetailsbrandsDetails----"+brandsDetails.length)
            if(brandsDetails.length>0){
              var bannerBrandName = brandsDetails[0].title;
              var bannerBrandSlug = brandsDetails[0].slug;
              console.log("bannerBrandName----"+bannerBrandName)
              console.log("bannerBrandSlug----"+bannerBrandSlug)
            } else {
              var bannerBrandName = '';
              var bannerBrandSlug = '';
              console.log("bannerBrandName11----"+bannerBrandName)
              console.log("bannerBrandSlug----"+bannerBrandSlug)
            }
          } else {
            var bannerBrandName = '';
            var bannerBrandSlug = '';
            console.log("bannerBrandName22----"+bannerBrandName)
            console.log("bannerBrandSlug----"+bannerBrandSlug)
          }

          if(bannerList[i].categoryId && bannerList[i].categoryId != null && bannerList[i].categoryId != ''){
            var categoryDetails = await models.categories.findAll({where: { storeId: storeId, status:"Yes", id: bannerList[i].categoryId },attributes: ["id", "title", "slug"]});
            if(categoryDetails.length>0){
              var bannerCategoryName = categoryDetails[0].title;
              var bannerCategorySlug = categoryDetails[0].slug;
            } else {
              var bannerCategoryName = '';
              var bannerCategorySlug = '';
            }
          } else {
            var bannerCategoryName = '';
            var bannerCategorySlug = '';
          }

          if(bannerList[i].image && bannerList[i].image != null && bannerList[i].image != ''){
            var bannerImage = req.app.locals.baseurl+'admin/banner/image/'+bannerList[i].id+'/'+bannerList[i].image;
          } else {
            var bannerImage = req.app.locals.baseurl+'admin/banner/no_image.jpg';
          }

          bannerImageArray.push({
            "id":bannerList[i].id,
            "title":bannerList[i].title,
            "type":bannerList[i].type,
            "shortDescription":bannerList[i].shortDescription,
            "brandName": bannerBrandName,
            "brandSlug": bannerBrandSlug,
            "categoryName": bannerCategoryName,
            "categorySlug": bannerCategorySlug,
            "images": bannerImage
          });
        }
      }

      var offerList = await models.contentBlocks.findAll({where: { storeId: storeId, status:"Yes", group: 'home offer' },attributes: ["id", "title", "shortDescription", "slug", "image", "link"], order: [['sequence', 'ASC']], limit: 2});
      if(offerList.length>0){
        for(var a=0;a<offerList.length;a++){
          if(offerList[a].image && offerList[a].image != null && offerList[a].image != ''){
            var offerImage = req.app.locals.baseurl+'admin/contentblock/image/'+offerList[a].id+'/'+offerList[a].image;
          } else {
            var offerImage = req.app.locals.baseurl+'admin/contentblock/no_image.jpg';
          }

          offerArray.push({
            "id":offerList[a].id,
            "title":offerList[a].title,
            "slug":offerList[a].slug,
            "shortDescription":offerList[a].shortDescription,
            "link":offerList[a].link,
            "images": offerImage
          });
        }
      }

      var homeSectionContent = await models.section.findOne({where: { storeId: storeId, status:"Yes", slug:"pharmacy-home-page-19" },attributes: ["id", "title", "content"]});
      var homeAdvertiseImage = await models.banner.findAll({where: { storeId: storeId, status:"Yes", type: 'advertise' },attributes: ["id", "title", "shortDescription", "image","sequence","categoryId","brandId"], order: [['sequence', 'ASC']]});

      if(homeAdvertiseImage.length>0){
        for(var p=0;p<homeAdvertiseImage.length;p++){

          // if(homeAdvertiseImage[p].categoryId && homeAdvertiseImage[p].categoryId != null && homeAdvertiseImage[p].categoryId != ''){
          //   var brandsDetails = await models.brands.findAll({where: { storeId: storeId, status:"Yes", id: homeAdvertiseImage[p].categoryId },attributes: ["id", "title", "slug"]});
          //   if(brandsDetails.length>0){
          //     var brandName = brandsDetails[0].title;
          //     var brandSlug = brandsDetails[0].slug;
          //   } else {
          //     var brandName = '';
          //     var brandSlug = '';
          //   }
          // } else {
          //   var brandName = '';
          //   var brandSlug = '';
          // }




          if(homeAdvertiseImage[p].brandId && homeAdvertiseImage[p].brandId != null && homeAdvertiseImage[p].brandId != ''){
            var brandsDetails = await models.brands.findAll({where: { storeId: storeId, status:"Yes", id: homeAdvertiseImage[p].brandId },attributes: ["id", "title", "slug"]});
            if(brandsDetails.length>0){
              var bannerBrandName = brandsDetails[0].title;
              var bannerBrandSlug = brandsDetails[0].slug;
            } else {
              var bannerBrandName = '';
              var bannerBrandSlug = '';
            }
          } else {
            var bannerBrandName = '';
            var bannerBrandSlug = '';
          }

          if(homeAdvertiseImage[p].categoryId && homeAdvertiseImage[p].categoryId != null && homeAdvertiseImage[p].categoryId != ''){
            var categoryDetails = await models.categories.findAll({where: { storeId: storeId, status:"Yes", id: homeAdvertiseImage[p].categoryId },attributes: ["id", "title", "slug"]});
            if(categoryDetails.length>0){
              var bannerCategoryName = categoryDetails[0].title;
              var bannerCategorySlug = categoryDetails[0].slug;
            } else {
              var bannerCategoryName = '';
              var bannerCategorySlug = '';
            }
          } else {
            var bannerCategoryName = '';
            var bannerCategorySlug = '';
          }

          if(homeAdvertiseImage[p].image && homeAdvertiseImage[p].image != null && homeAdvertiseImage[p].image != ''){
            var advertiseImage = req.app.locals.baseurl+'admin/banner/image/'+homeAdvertiseImage[p].id+'/'+homeAdvertiseImage[p].image;
          } else {
            var advertiseImage = req.app.locals.baseurl+'admin/banner/no_image.jpg';
          }

          homeAdvertiseArray.push({
            "id":homeAdvertiseImage[p].id,
            "title":homeAdvertiseImage[p].title,
            "images": advertiseImage,
            // "brandName": brandName,
            // "brandSlug": brandSlug,
            "brandName": bannerBrandName,
            "brandSlug": bannerBrandSlug,
            "categoryName": bannerCategoryName,
            "categorySlug": bannerCategorySlug,
          });
        }
      }

      if (
        testmonialList.length > 0 || welcomeList.length > 0 || socialLinks.length > 0 || groceryHomeContent || groceryAdvertiseImage.length > 0 || bannerList.length > 0 || offerList.length > 0 || homeSectionContent || homeAdvertiseArray.length > 0 || homebrandsArray.length >0) {
        /*res.status(200).send({
          value: {success: true, testmonialList, welcomeList, socialLinks},
        });*/
        return res.status(200).send({ value:{success:true, testmonialList:testimonialArray, welcomeList, socialLinks, groceryHomeContent:groceryHomeContent, groceryAdvertiseImage:advertiseArray, bannerList:bannerImageArray, offerList:offerArray, homeContent:homeSectionContent, advertiseImage:homeAdvertiseArray, brandsList:homebrandsArray}, errorNode:{errorCode:0, errorMsg:"No Error"}});
      } else {
        return res.status(200).send({ value:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
      }
    }
};
  
  //////////////////////////////// End HomeDetails//////////////////////////////
  
  ////////////////////////////////////////CMS Api//////////////////////////////
  exports.cmsListManage = async function (req, res) {
  var slug1 = req.body.data.slug;
  var storeId = req.body.data.storeId;
    if(storeId && storeId != '' && storeId != null && slug1 && slug1 != '' && slug1 != null) {
      var cms_details = await models.cms.findOne({where: { slug: slug1,storeId:storeId },attributes: ["id", "title", "content", "contentDescription"]});
      if (cms_details !='' && cms_details !=null) {
        return res.status(200).send({ data:{success:true, details:cms_details}, errorNode:{errorCode:0, errorMsg:"No Error"}});
      } else {
        return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
      }
    }else{
      return res.status(200).send({ data:{success:false, details:"Please fill details"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
    }
};
  
  
exports.cmsList = async function (req,res){
  var storeId = req.body.data.storeId;
  if(storeId && storeId!=''){
    var value = await models.cms.findAll({where:{storeId:storeId}});
    if(value.length > 0){
      return res.status(200).send({ data:{success:true, details:value}, errorNode:{errorCode:0, errorMsg:"No Error"}});
    }else{
      return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
    } 
  }else{
    return res.status(200).send({ data:{success:false, details:"Please fill details"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
  }
}
  
  ///////////////////////////////////////END CMS Api///////////////////////////
  

exports.appSiteSettings = async function (req, res, next) {
  var storeId = req.body.data.storeId;
  if(storeId && storeId!=''){
    var resultArray = [];
    const value = await models.siteSettings.findAll({where:{storeId:storeId, status: 'Yes', title: { [Op.like]: `%Social Details%` }}})
    
    if(value.length > 0){
  
      var i = 0;
      value.forEach(function(element,index){ 
        var headerImage='';
        var footerImage = '';
        if(element.image != '' && element.image!= null){
          headerImage = req.app.locals.baseurl+'site_setting/'+element.image;
        }else{
          headerImage = req.app.locals.baseurl+'site_setting/No_photo.jpg';
        }
  
        if(element.fImage != '' && element.fImage!= null){
          footerImage = req.app.locals.baseurl+'site_setting/'+element.fImage;
        }else{
          footerImage = req.app.locals.baseurl+'site_setting/No_photo.jpg';
        }
        resultArray.push({
          "id": element.id,
          "site_name": element.siteName,
          "tagline":element.tagline,
          "email": element.email,
          "mobile_no": element.mobileNo,
          "app_version": element.appVersion,
          "fax": element.fax,
          latitude: element.latitude,
          longitude: element.longitude,
          "site_url": element.siteUrl,
          "address": element.address,
          "site_description": element.siteDescription,
          "facebook": element.facebook,
          "twitter": element.twitter,
          "linkedin": element.linkedin,
          "instagram": element.instagram,
          "youtube": element.youtube,
          "image": headerImage,
          "feature": element.feature,
          "max_pro_availability": element.maxProAvailability,
          "shipping_charges": element.shippingCharges,
          "free_shipping_limit": element.freeShippingLimit,
          "f_image":  footerImage,
          "contact_us_content":element.contactUsContent
        });    
        i++;             
      });
      return res.status(200).send({ data:{success:true, details:resultArray[0]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
    }else{
      return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
    }
  }else{
    return res.status(200).send({ data:{success:false, details:"Please fill details"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
  }
};


exports.socialMideDetails = async function (req, res, next) {
  var storeId = req.body.data.storeId;
  if(storeId && storeId!=''){
    var resultArray = [];
    const facebookDetails = await models.siteSettings.findAll({where:{storeId:storeId, status: 'Yes', id: 54 }})
    const twitterDetails = await models.siteSettings.findAll({where:{storeId:storeId, status: 'Yes', id: 55 }})
    const linkdinDetails = await models.siteSettings.findAll({where:{storeId:storeId, status: 'Yes', id: 56 }})
    
    if(facebookDetails.length > 0){
      var facebookLink = facebookDetails[0].value;
    } else {
      var facebookLink = '';
    }

    if(twitterDetails.length > 0){
      var twitterLink = twitterDetails[0].value;
    } else {
      var twitterLink = '';
    }

    if(linkdinDetails.length > 0){
      var linkdinLink = linkdinDetails[0].value;
    } else {
      var linkdinLink = '';
    }

    resultArray.push({
      "facebook": facebookLink,
      "twitter": twitterLink,
      "linkedin": linkdinLink,
    }); 
    return res.status(200).send({ data:{success:true, details:resultArray[0]}, errorNode:{errorCode:0, errorMsg:"No Error"}});

  }else{
    return res.status(200).send({ data:{success:false, details:[], message:"Store id is required"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
  }
};

exports.giftSetList = async function (req, res, next) {
  var storeId = req.body.data.storeId;
  if(storeId && storeId!=''){
    var resultArray = [];
    const giftSetList = await models.giftSet.findAll({where:{storeId:storeId, status: 'Yes' }})

    if(giftSetList.length>0){
      for(var a=0;a<giftSetList.length;a++){
        if(giftSetList[a].image && giftSetList[a].image != null && giftSetList[a].image != ''){
          var giftSetImage = req.app.locals.baseurl+'admin/giftSet/'+giftSetList[a].id+'/'+giftSetList[a].image;
        } else {
          var giftSetImage = req.app.locals.baseurl+'admin/giftSet/no_image.jpg';
        }

        resultArray.push({
          "id":giftSetList[a].id,
          "title":giftSetList[a].title,
          "sequence":giftSetList[a].sequence,
          "message":giftSetList[a].message,
          "status":giftSetList[a].status,
          "images": giftSetImage
        });
      }
    }
    return res.status(200).send({ data:{success:true, giftSetList:resultArray }, errorNode:{errorCode:0, errorMsg:"No Error"}});

  }else{
    return res.status(200).send({ data:{success:false, giftSetList:[], message:"Store id is required"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
  }
};