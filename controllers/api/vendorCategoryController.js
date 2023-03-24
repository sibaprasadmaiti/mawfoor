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


exports.categoryList= async function (req, res, next) {

  var storeId = req.body.data.storeId;

  var limit = req.body.data.limit ? req.body.data.limit : 10 ;
  var pageNumber = req.body.data.pageNumber ? req.body.data.pageNumber : 1;

  if(pageNumber == 1){
    var offset = 0;
  }else{
    var offset = ((pageNumber)-1)*limit;
  }

  console.log("aaaaaaaaaaaaaaa---"+limit);
  console.log("bbbbbbbbbbbbbbbbbb---"+offset);

  var categoryArray = [];

  if(storeId && storeId != '') {

    var categoryList = await sequelize.query("SELECT id, storeId, parentCategoryId, title, slug, url, image, createdAt, updatedAt, status FROM `categories` WHERE storeId = "+storeId+" and parentCategoryId = 0 order by position ASC LIMIT "+offset+", "+limit,{ type: Sequelize.QueryTypes.SELECT });
    var categoryCount = await sequelize.query("SELECT id FROM `categories` WHERE storeId = "+storeId+" and parentCategoryId = 0",{ type: Sequelize.QueryTypes.SELECT });
   
    if(categoryList.length > 0){
      for(var i=0; i<categoryList.length; i++){

        var productCount = await sequelize.query("SELECT DISTINCT productId FROM `productCategory` WHERE storeId = "+storeId+" and categoryId = "+categoryList[i].id,{ type: Sequelize.QueryTypes.SELECT });

        if(categoryList[i].image && categoryList[i].image != '' && categoryList[i].image != null){
          var category_images = req.app.locals.baseurl+'admin/category/'+categoryList[i].id+'/'+categoryList[i].image ;
        } else {
          var category_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
        } 

        categoryArray.push({
          "id":categoryList[i].id,
          "storeId":categoryList[i].storeId,
          "title":categoryList[i].title,
          "slug":categoryList[i].slug,
          "url":categoryList[i].url,
          "createdAt":categoryList[i].createdAt,
          "status":categoryList[i].status,
          "productCount": productCount.length,
          "images": category_images,
        });

      }
      return res.status(200).send({ data:{success:true, categoryList: categoryArray, categoryCount:categoryCount.length, message:"Category found"}, errorNode:{errorCode:0, errorMsg:""}});
    } else {
      return res.status(200).send({ data:{success:false,categoryList: [], categoryCount:0, message:"Category not found"}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.categoryDetails= async function (req, res, next) {

  var storeId = req.body.data.storeId;
  var categoryId = req.body.data.categoryId;

  var categoryArray = [];

  if(storeId && storeId != '') {
    if(categoryId && categoryId != '') {
      var categoryDetails = await sequelize.query("SELECT id, storeId, parentCategoryId, title, slug, url, image, position, description, includeInHome, includeInMenu, includeInFooter, metaTitle, metaKey, metaDescription, metaImage, status, createdAt, updatedAt FROM `categories` WHERE storeId = "+storeId+" and id = "+categoryId,{ type: Sequelize.QueryTypes.SELECT });
    
      if(categoryDetails.length > 0){

        if(categoryDetails[0].image && categoryDetails[0].image != '' && categoryDetails[0].image != null){
          var category_images = req.app.locals.baseurl+'admin/category/'+categoryDetails[0].id+'/'+categoryDetails[0].image ;
        } else {
          // var category_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
          var category_images = null;
        } 

        if(categoryDetails[0].metaImage && categoryDetails[0].metaImage != '' && categoryDetails[0].metaImage != null){
          var category_meta_images = req.app.locals.baseurl+'admin/category/'+categoryDetails[0].id+'/'+categoryDetails[0].metaImage ;
        } else {
          // var category_meta_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
          var category_meta_images = null;
        } 

        categoryArray.push({
          "id":categoryDetails[0].id,
          "slug":categoryDetails[0].slug,
          "title":categoryDetails[0].title,
          "storeId":categoryDetails[0].storeId,
          "parentCategoryId":categoryDetails[0].parentCategoryId,
          "url":categoryDetails[0].url,
          "description":categoryDetails[0].description,
          "includeInHome":categoryDetails[0].includeInHome,
          "includeInMenu":categoryDetails[0].includeInMenu,
          "includeInFooter":categoryDetails[0].includeInFooter,
          "metaTitle":categoryDetails[0].metaTitle,
          "metaKey":categoryDetails[0].metaKey,
          "metaDescription":categoryDetails[0].metaDescription,
          "status":categoryDetails[0].status,
          "position":categoryDetails[0].position,
          "metaImage":category_meta_images,
          "categoryImages": category_images,
        });

        return res.status(200).send({ data:{success:true, categoryDetails: categoryArray[0], message:"category found"}, errorNode:{errorCode:0, errorMsg:""}});
      } else {
        return res.status(200).send({ data:{success:false,category: [], message:"category not found"}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'Category id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.categoryAdd= async function (req, res, next) {

  var storeId = req.body.data.storeId;
  var title = req.body.data.title;
  var position = req.body.data.position;
  var description = req.body.data.description;
  var url = req.body.data.url;
  var includeInHome = req.body.data.includeInHome;
  var includeInMenu = req.body.data.includeInMenu;
  var includeInFooter = req.body.data.includeInFooter;
  var metaTitle = req.body.data.metaTitle;
  var metaKey = req.body.data.metaKey;
  var metaDescription = req.body.data.metaDescription;
  var status = req.body.data.status;
  var parentCategoryId = req.body.data.parentCategoryId;

  var image = req.body.data.image;
  var imageExt = req.body.data.imageExt;

  var metaImage = req.body.data.metaImage;
  var metaImageExt = req.body.data.metaImageExt;

  var categoryId = req.body.data.categoryId;

  if(storeId && storeId != '') {
    if(title && title != '' && description && description != '' ) {

      if(categoryId && categoryId != '') {

        models.categories.update({ 
          storeId: storeId,
          title: title,
          position: position,
          url: url,
          description: description,
          includeInHome: includeInHome,
          includeInMenu: includeInMenu,
          includeInFooter: includeInFooter,
          metaTitle: metaTitle,
          metaKey: metaKey,
          metaDescription: metaDescription,
          status: status,
        },{ where: { id: categoryId } }).then(async function(val) {

          var dir = './public/admin/category/'+categoryId; 
          console.log(dir);
          if (!fs.existsSync(dir)){
              fs.mkdirSync(dir);                  
          }

          if(image && image != '' && imageExt && imageExt !='') {
            var categoriesDetails = await models.categories.findOne({ attributes: ["image"], where: { id: categoryId } });
            if(categoriesDetails.image && categoriesDetails.image != '' && categoriesDetails.image != null) {

              if(fs.existsSync(__dirname + '/../../public/admin/category/'+ categoryId +'/'+categoriesDetails.image)){
                fs.unlink(__dirname +  '/../../public/admin/category/'+ categoryId +'/'+categoriesDetails.image, (err) => {
                if (err) throw err;
                console.log('successfully deleted /tmp/hello');
                });
              }
            }
            var imageTitle = Date.now();
            var path = './public/admin/category/'+ categoryId +'/'+imageTitle+'.'+imageExt;
            var categoryImage =imageTitle+'.'+imageExt;   
            try {
                const imgdata = image;
                const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                models.categories.update({
                  image : categoryImage,
                },{ where: { id: categoryId } })        
            } catch (e) {
                next(e);
            }
          }

          if(metaImage && metaImage != '' && metaImageExt && metaImageExt !='') {

            var metaImageDetails = await models.categories.findOne({ attributes: ["metaImage","id"], where: { storeId:storeId, id: categoryId } });
            if(metaImageDetails.metaImage && metaImageDetails.metaImage != '' && metaImageDetails.metaImage != null) {

              if(fs.existsSync(__dirname + '/../../public/admin/category/'+ categoryId +'/'+metaImageDetails.metaImage)){
                fs.unlink(__dirname +  '/../../public/admin/category/'+ categoryId +'/'+metaImageDetails.metaImage, (err) => {
                  if (err) throw err;
                  console.log('successfully deleted /tmp/hello');
                });
              }
            }
            
            var imageTitle = Date.now();
            var path = './public/admin/category/'+ categoryId +'/'+imageTitle+'.'+metaImageExt;
            var OGImage =imageTitle+'.'+metaImageExt;   
            try {
                const imgdata = metaImage;
                const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                models.categories.update({
                  metaImage : OGImage,
                },{ where: { id: categoryId } });       
            } catch (e) {
                next(e);
            }
          }

          return res.status(200).send({ data:{success:true, message:"Product updated successfully"}, errorNode:{errorCode:0, errorMsg:''}});
        });
      } else {

        var str = title ? title : "";
        var slugify = str.toString().toLowerCase().replace(/\s+/g, '-');

        models.categories.create({ 
          storeId: storeId,
          title: title,
          parentCategoryId:parentCategoryId,
          position: position,
          url: url,
          description: description,
          includeInHome: includeInHome,
          includeInMenu: includeInMenu,
          includeInFooter: includeInFooter,
          metaTitle: metaTitle,
          metaKey: metaKey,
          metaDescription: metaDescription,
          status: status,
        }).then(function(val) {

          var dir = './public/admin/category/'+val.id; 
          console.log(dir);
          if (!fs.existsSync(dir)){
              fs.mkdirSync(dir);                  
          }

          if(image && image != '' && imageExt && imageExt !='') {
            var imageTitle = Date.now();
            var path = './public/admin/category/'+ val.id +'/'+imageTitle+'.'+imageExt;
            var categoryImage =imageTitle+'.'+imageExt;   
            try {
                const imgdata = image;
                const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                models.categories.update({
                  image : categoryImage,
                },{ where: { id: val.id } })        
            } catch (e) {
                next(e);
            }
          }

          if(metaImage && metaImage != '' && metaImageExt && metaImageExt !='') {
            
            var imageTitle = Date.now();
            var path = './public/admin/category/'+ val.id +'/'+imageTitle+'.'+metaImageExt;
            var OGImage =imageTitle+'.'+metaImageExt;   
            try {
                const imgdata = metaImage;
                const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                models.categories.update({
                  metaImage : OGImage,
                },{ where: { id: val.id } });       
            } catch (e) {
                next(e);
            }
          }


          var newSlug = slugify +'-'+ val.id;

          models.categories.update({ 
            slug: newSlug 
          },{ where: { id: val.id } });

          return res.status(200).send({ data:{success:true, message:"Product create successfully"}, errorNode:{errorCode:0, errorMsg:''}});
        });
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'please fillup required field'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.vendorCategoryList= async function (req, res, next) {

  var storeId = req.body.data.storeId;
  var categoryArray = [];

  if(storeId && storeId != '') {

    // const categoryList = await models.categories.findAll({attributes:['id','storeId','title','parentCategoryId','slug', 'url','image','createdAt','status','position'], where:{storeId:storeId,parentCategoryId : 0}, order: [['position', 'ASC']]})
    var categoryList = await sequelize.query("SELECT `id`, `storeId`, `title`, `parentCategoryId`, `slug`, `url`, `image`, `createdAt`, `status`, `position` FROM `categories` WHERE `storeId` = "+storeId+" AND `parentCategoryId` = 0 ORDER BY -position desc",{ type: Sequelize.QueryTypes.SELECT });
    
    if(categoryList.length > 0){
      for(var i=0; i<categoryList.length; i++){

        var productCount = await sequelize.query("SELECT DISTINCT productId FROM `productCategory` WHERE storeId = "+storeId+" and categoryId = "+categoryList[i].id,{ type: Sequelize.QueryTypes.SELECT });

        if(categoryList[i].image && categoryList[i].image != '' && categoryList[i].image != null){
          var category_images = req.app.locals.baseurl+'admin/category/'+categoryList[i].id+'/'+categoryList[i].image ;
        } else {
          var category_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
        } 

        categoryArray.push({
          "id":categoryList[i].id,
          "storeId":categoryList[i].storeId,
          "title":categoryList[i].title,
          "slug":categoryList[i].slug,
          "url":categoryList[i].url,
          "createdAt":categoryList[i].createdAt,
          "status":categoryList[i].status,
          "position":categoryList[i].position,
          "productCount": productCount.length,
          "images": category_images,
        });

      }
      return res.status(200).send({ data:{success:true, categoryList: categoryArray, message:"Category found"}, errorNode:{errorCode:0, errorMsg:""}});
    } else {
      return res.status(200).send({ data:{success:false,categoryList: [], message:"Category not found"}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};


exports.categoryImageDelete= async function (req, res, next) {

  var categoryId = req.body.data.categoryId;
  var storeId = req.body.data.storeId;
  var imageType = req.body.data.imageType;

  if(storeId && storeId != '') {
    if(categoryId && categoryId != '') {
      if(imageType == 'image') {
      
        var categoryImagesDetails = await models.categories.findOne({ attributes: ["image","id"], where: { storeId:storeId, id: categoryId } });
        if(categoryImagesDetails.image && categoryImagesDetails.image != '' && categoryImagesDetails.image != null) {

          if(fs.existsSync(__dirname + '/../../public/admin/category/'+ categoryId +'/'+categoryImagesDetails.image)){
            fs.unlink(__dirname +  '/../../public/admin/category/'+ categoryId +'/'+categoryImagesDetails.image, (err) => {
              if (err) throw err;
              console.log('successfully deleted /tmp/hello');
            });
          }
          models.categories.update({ 
            image : null,
          },{ where: { id: categoryId } });  

        }

        return res.status(200).send({ data:{success:true, message:'Image successfully removed'}, errorNode:{errorCode:0, errorMsg:''}});
        
      } else if(imageType == 'metaImage') {

        var metaImageDetails = await models.categories.findOne({ attributes: ["metaImage","id"], where: { storeId:storeId, id: categoryId } });
        if(metaImageDetails.metaImage && metaImageDetails.metaImage != '' && metaImageDetails.metaImage != null) {

          if(fs.existsSync(__dirname + '/../../public/admin/category/'+ categoryId +'/'+metaImageDetails.metaImage)){
            fs.unlink(__dirname +  '/../../public/admin/category/'+ categoryId +'/'+metaImageDetails.metaImage, (err) => {
              if (err) throw err;
              console.log('successfully deleted /tmp/hello');
            });
          }

          models.categories.update({
            metaImage : null,
          },{ where: { id: categoryId } });  

        }

        return res.status(200).send({ data:{success:true, message:'Meta image successfully removed'}, errorNode:{errorCode:0, errorMsg:''}});
      } else {
        return res.status(200).send({ data:{success:false,message:'Image type is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'category Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

exports.subcategoryList = async (req, res) => {
  const {storeId, categoryId} = req.body.data
  if(storeId != '' && storeId != null && categoryId != '' && categoryId != null){
      const categories = await models.categories.findOne({attributes:['id','title','url','image','createdAt'], where:{storeId:storeId,id:categoryId}})
      const productCount = await models.productCategory.count({where:{storeId:storeId,categoryId:categoryId}})
      const subcategories = await models.categories.findAll({attributes:['id','title','url','image','createdAt'], where:{storeId:storeId,parentCategoryId:categoryId}})

      let details = []
      if(subcategories.length > 0){
          for(let cat of subcategories){
            const subCategoryProductCount = await models.productCategory.count({where:{storeId:storeId,categoryId:cat.id}})
              let image 
              if (cat.image != '' && cat.image != null) {
                  image = req.app.locals.baseurl+'admin/category/'+cat.id+'/'+cat.image
              } else {
                  image = req.app.locals.baseurl+'admin/category/no_image.jpg'
              }

              let data = {}
              data.id = cat.id
              data.title = cat.title
              data.url = cat.url
              data.createdAt = cat.createdAt
              data.image = image,
              data.productCount = subCategoryProductCount
              
              details.push(data)
          }
      }else{
          details = []
      }

      let subcategoryList = {}
      let catImage 
      if (categories.image != '' && categories.image != null) {
          catImage = req.app.locals.baseurl+'admin/category/'+categories.id+'/'+categories.image
      } else {
          catImage = req.app.locals.baseurl+'admin/category/no_image.jpg'
      }
      subcategoryList.id = categories.id
      subcategoryList.productCount = productCount
      subcategoryList.title = categories.title
      subcategoryList.url = categories.url
      subcategoryList.createdAt = categories.createdAt
      subcategoryList.image = catImage
      subcategoryList.subcategoryList = details

      
      if (subcategoryList != null && subcategoryList != '') {
          res.status(200).send({data:{success:true, details:subcategoryList},errorNode:{errorCode:0, errorMsg:"No Error"}})
      } else {
          res.status(200).send({data:{success:true, details:{}},errorNode:{errorCode:0, errorMsg:"No data found"}})
      }
  }else{
      res.status(400).send({data:{success:false, message:"storeId and categoryId is required"},errorNode:{errorCode:1, errorMsg:"storeId and categoryId is required"}})
  }
}


exports.categoryTree = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	if(storeId && storeId != '' && storeId != null) {
        const categories = await models.categories.findAll({ attributes:['id','parentCategoryId','title','status'], where: { storeId:storeId}})
        
        let categorieyList

        if(categories.length > 0){
            const data = [];
            for(let cat of categories){
                const count = await models.productCategory.count({where: { storeId:storeId, categoryId: cat.id}})
                data.push({id:cat.id, parentCategoryId: cat.parentCategoryId, title:cat.title, status:cat.status, totalProductCount:count})
            }

            const idMapping = data.reduce((acc, el, i) => {
                acc[el.id] = i;
                return acc;
            }, {})

            let root = [];
            data.forEach((el) => {
                if (el.parentCategoryId == 0)
                root.push(el);
                let parentEl = data[idMapping[el.parentCategoryId]]
                if(parentEl){
                    parentEl.subCategory = [...(parentEl.subCategory || []), el]
                }
            })

            root.map(e => {
                let count = 0
                if (!e.subCategory) {
                    e.subCategory =[]
                } else {
                    e.subCategory.map(s => {
                        count = count+ s.totalProductCount
                    })
                }
                e.totalProductCount += count
            })

            categorieyList = root
        }else{
            categorieyList = []
        }


        if(categorieyList.length > 0){
            return res.status(200).send({ data:{success:true, details:categorieyList}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}


exports.vendorSubCategoryList = async function(req, res, next) {

  var storeId = req.body.data.storeId;
  var categoryArr = req.body.data.categoryId ? req.body.data.categoryId : [];
  let subCategoryArr = [];
  
	if(storeId && storeId != '' && storeId != null) {

		if(categoryArr.length > 0) {
      for(var j = 0; j < categoryArr.length; j++){
        let subCat = await models.categories.findAll({where: { storeId:storeId, status: 'Yes', parentCategoryId: categoryArr[j] }})
        // let subCategoryArr = [];
        if(subCat.length > 0) {
          for(var i = 0; i < subCat.length; i++) { 
            subCategoryArr.push({
              "id":subCat[i].id,
              "title":subCat[i].title,
              "slug":subCat[i].slug,
              "url":subCat[i].url,
              "description":subCat[i].description,
              // "includeInHome":subCat[i].includeInHome,
              // "includeInMenu":subCat[i].includeInMenu,
              // "includeInFooter":subCat[i].includeInFooter,
              "image":(subCat[i].image!='' || subCat[i].image!=null) ? req.app.locals.baseurl+'admin/category/'+subCat[i].id+'/'+subCat[i].image : '',
            });
          }
        }
      }
      
      if(subCategoryArr.length > 0){
        return res.status(200).send({ data:{success:true, details:subCategoryArr }, errorNode:{errorCode:0, errorMsg:"No Error"}});
      } else {
        return res.status(200).send({ data:{success:false, details:[] }, errorNode:{errorCode:0, errorMsg:"No Error"}});
      }

    } else {
      return res.status(200).send({ data:{success:false, details:[], message:"category is required"}, errorNode:{errorCode:0, errorMsg:"Error"}});
    }

	} else {
		return res.status(200).send({ data:{success:false, details:[], message:"storeId is required"}, errorNode:{errorCode:0, errorMsg:"Error"}});
	}
};


exports.vendorCategoryDelete= async function (req, res, next) {

  var categoryId = req.body.data.categoryId;
  var storeId = req.body.data.storeId;

  console.log("categoryIdcategoryIdcategoryIdcategoryIdcategoryId---"+categoryId)
  if(storeId && storeId != '') {
    if(categoryId && categoryId != '') {

      const categoryDetails = await models.categories.findOne({ attributes:['id','parentCategoryId','title','status','image'], where: { storeId:storeId, id : categoryId}})
      if(categoryDetails) {
        if(categoryDetails.parentCategoryId == 0) {
          const subCategoryList = await models.categories.findAll({ attributes:['id','parentCategoryId','title','status','image'], where: { storeId:storeId, parentCategoryId:categoryDetails.id }})
          if(subCategoryList.length > 0){
            for(var j = 0; j < subCategoryList.length; j++) { 
              const productCategoryList = await models.productCategory.findAll({ attributes:['id','productId'], where: { storeId:storeId, categoryId:subCategoryList[j].id }})
              if(productCategoryList.length > 0){
    
                for(var i = 0; i < productCategoryList.length; i++) { 
    
                  const categoryProductList = await models.productCategory.findAll({ attributes:['id','productId'], where: { storeId:storeId, productId: productCategoryList[i].productId, categoryId: { $ne: subCategoryList[j].id } }})
                  if(categoryProductList.length > 0){
                    models.productCategory.destroy({ 
                      where:{productId:productCategoryList[i].productId, categoryId: subCategoryList[j].id, storeId:storeId}
                    })
                  } else {
      
                    models.productCategory.destroy({ 
                      where:{productId:productCategoryList[i].productId, storeId:storeId}
                    }).then(async function(dst){
              
                      models.relatedProduct.destroy({ 
                        where:{productId:productCategoryList[i-1].productId, storeId:storeId}
                      });
                
                      models.relatedProduct.destroy({ 
                        where:{selectedProductId:productCategoryList[i-1].productId, storeId:storeId}
                      });
                
                      models.favouriteProduct.destroy({ 
                        where:{productId:productCategoryList[i-1].productId, storeId:storeId}
                      });
                
                      var productImagesDetails = await models.productImages.findOne({ attributes: ["file","id"], where: { storeId:storeId, productId: productCategoryList[i-1].productId } });
                      if(productImagesDetails.length > 0) {
                        for(var j = 0; j < productImagesDetails.length; j++){
                
                          if(productImagesDetails[j].file && productImagesDetails[j].file != '' && productImagesDetails[j].file != null) {
                
                            if(fs.existsSync(__dirname + '/../../public/admin/products/image/'+ productCategoryList[i-1].productId +'/'+productImagesDetails[j].file)){
                              fs.unlink(__dirname +  '/../../public/admin/products/image/'+ productCategoryList[i-1].productId +'/'+productImagesDetails[j].file, (err) => {
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
              
                      var optionProductValueDetails = await models.optionProduct.findAll({attributes: ['id','optionId', 'productId'], where:{storeId:storeId, productId:productCategoryList[i-1].productId}})
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
                      }
              
                      models.products.destroy({ 
                        where:{id:productCategoryList[i-1].productId, storeId:storeId}
                      });
              
                    })
    
                  }
    
                }

                models.categories.destroy({ 
                  where:{id:subCategoryList[j].id, storeId:storeId}
                }).then(async function(dst){
                  if(subCategoryList[j].image && subCategoryList[j].image != '' && subCategoryList[j].image != null) {
      
                    if(fs.existsSync(__dirname + '/../../public/admin/category/'+ subCategoryList[j].id +'/'+subCategoryList[j].image)){
                      fs.unlink(__dirname +  '/../../public/admin/category/'+ subCategoryList[j].id +'/'+subCategoryList[j].image, (err) => {
                        if (err) throw err;
                        console.log('successfully deleted /tmp/hello');
                      });
                    }
    
                  }
                })
    
              } else {
                models.categories.destroy({ 
                  where:{id:subCategoryList[j].id, storeId:storeId}
                }).then(async function(dst){
                  if(subCategoryList[j].image && subCategoryList[j].image != '' && subCategoryList[j].image != null) {
      
                    if(fs.existsSync(__dirname + '/../../public/admin/category/'+ subCategoryList[j].id +'/'+subCategoryList[j].image)){
                      fs.unlink(__dirname +  '/../../public/admin/category/'+ subCategoryList[j].id +'/'+subCategoryList[j].image, (err) => {
                        if (err) throw err;
                        console.log('successfully deleted /tmp/hello');
                      });
                    }
    
                  }
                })
              }
            }

          } else {

            const productCategoryList = await models.productCategory.findAll({ attributes:['id','productId'], where: { storeId:storeId, categoryId:categoryDetails.id }})
            if(productCategoryList.length > 0){

              for(var i = 0; i < productCategoryList.length; i++) { 

                const categoryProductList = await models.productCategory.findAll({ attributes:['id','productId'], where: { storeId:storeId, productId: productCategoryList[i].productId, categoryId: { $ne: categoryDetails.id } }})
                if(categoryProductList.length > 0){
                  models.productCategory.destroy({ 
                    where:{productId:productCategoryList[i].productId, categoryId: categoryDetails.id, storeId:storeId}
                  })
                } else {
    
                  models.productCategory.destroy({ 
                    where:{productId:productCategoryList[i].productId, storeId:storeId}
                  }).then(async function(dst){
            
                    models.relatedProduct.destroy({ 
                      where:{productId:productCategoryList[i-1].productId, storeId:storeId}
                    });
              
                    models.relatedProduct.destroy({ 
                      where:{selectedProductId:productCategoryList[i-1].productId, storeId:storeId}
                    });
              
                    models.favouriteProduct.destroy({ 
                      where:{productId:productCategoryList[i-1].productId, storeId:storeId}
                    });
              
                    var productImagesDetails = await models.productImages.findOne({ attributes: ["file","id"], where: { storeId:storeId, productId: productCategoryList[i-1].productId } });
                    if(productImagesDetails.length > 0) {
                      for(var j = 0; j < productImagesDetails.length; j++){
              
                        if(productImagesDetails[j].file && productImagesDetails[j].file != '' && productImagesDetails[j].file != null) {
              
                          if(fs.existsSync(__dirname + '/../../public/admin/products/image/'+ productCategoryList[i-1].productId +'/'+productImagesDetails[j].file)){
                            fs.unlink(__dirname +  '/../../public/admin/products/image/'+ productCategoryList[i-1].productId +'/'+productImagesDetails[j].file, (err) => {
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
            
                    var optionProductValueDetails = await models.optionProduct.findAll({attributes: ['id','optionId', 'productId'], where:{storeId:storeId, productId:productCategoryList[i-1].productId}})
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
                    }
            
                    models.products.destroy({ 
                      where:{id:productCategoryList[i-1].productId, storeId:storeId}
                    });
            
                  })

                }

              }

              models.categories.destroy({ 
                where:{id:categoryDetails.id, storeId:storeId}
              }).then(async function(dst){
                if(categoryDetails.image && categoryDetails.image != '' && categoryDetails.image != null) {
    
                  if(fs.existsSync(__dirname + '/../../public/admin/category/'+ categoryId +'/'+categoryDetails.image)){
                    fs.unlink(__dirname +  '/../../public/admin/category/'+ categoryId +'/'+categoryDetails.image, (err) => {
                      if (err) throw err;
                      console.log('successfully deleted /tmp/hello');
                    });
                  }

                }
              })

            } else {
              models.categories.destroy({ 
                where:{id:categoryDetails.id, storeId:storeId}
              }).then(async function(dst){
                if(categoryDetails.image && categoryDetails.image != '' && categoryDetails.image != null) {
    
                  if(fs.existsSync(__dirname + '/../../public/admin/category/'+ categoryId +'/'+categoryDetails.image)){
                    fs.unlink(__dirname +  '/../../public/admin/category/'+ categoryId +'/'+categoryDetails.image, (err) => {
                      if (err) throw err;
                      console.log('successfully deleted /tmp/hello');
                    });
                  }

                }
              })
            }
          }
          return res.status(200).send({ data:{success:true, message:'Category successfully Deleted'}, errorNode:{errorCode:0, errorMsg:''}});
        } else {
          const productCategoryList = await models.productCategory.findAll({ attributes:['id','productId'], where: { storeId:storeId, categoryId:categoryDetails.id }})
          if(productCategoryList.length > 0){

            for(var i = 0; i < productCategoryList.length; i++) { 

              const categoryProductList = await models.productCategory.findAll({ attributes:['id','productId'], where: { storeId:storeId, productId: productCategoryList[i].productId, categoryId: { $ne: categoryDetails.id } }})
              if(categoryProductList.length > 0){
                models.productCategory.destroy({ 
                  where:{productId:productCategoryList[i].productId, categoryId: categoryDetails.id, storeId:storeId}
                })
              } else {
  
                models.productCategory.destroy({ 
                  where:{productId:productCategoryList[i].productId, storeId:storeId}
                }).then(async function(dst){
          
                  models.relatedProduct.destroy({ 
                    where:{productId:productCategoryList[i-1].productId, storeId:storeId}
                  });
            
                  models.relatedProduct.destroy({ 
                    where:{selectedProductId:productCategoryList[i-1].productId, storeId:storeId}
                  });
            
                  models.favouriteProduct.destroy({ 
                    where:{productId:productCategoryList[i-1].productId, storeId:storeId}
                  });
            
                  var productImagesDetails = await models.productImages.findOne({ attributes: ["file","id"], where: { storeId:storeId, productId: productCategoryList[i-1].productId } });
                  if(productImagesDetails.length > 0) {
                    for(var j = 0; j < productImagesDetails.length; j++){
            
                      if(productImagesDetails[j].file && productImagesDetails[j].file != '' && productImagesDetails[j].file != null) {
            
                        if(fs.existsSync(__dirname + '/../../public/admin/products/image/'+ productCategoryList[i-1].productId +'/'+productImagesDetails[j].file)){
                          fs.unlink(__dirname +  '/../../public/admin/products/image/'+ productCategoryList[i-1].productId +'/'+productImagesDetails[j].file, (err) => {
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
          
                  var optionProductValueDetails = await models.optionProduct.findAll({attributes: ['id','optionId', 'productId'], where:{storeId:storeId, productId:productCategoryList[i-1].productId}})
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
                  }
          
                  models.products.destroy({ 
                    where:{id:productCategoryList[i-1].productId, storeId:storeId}
                  });
          
                })

              }

            }

            models.categories.destroy({ 
              where:{id:categoryDetails.id, storeId:storeId}
            }).then(async function(dst){
              if(categoryDetails.image && categoryDetails.image != '' && categoryDetails.image != null) {
  
                if(fs.existsSync(__dirname + '/../../public/admin/category/'+ categoryId +'/'+categoryDetails.image)){
                  fs.unlink(__dirname +  '/../../public/admin/category/'+ categoryId +'/'+categoryDetails.image, (err) => {
                    if (err) throw err;
                    console.log('successfully deleted /tmp/hello');
                  });
                }

              }
            })

          } else {
            models.categories.destroy({ 
              where:{id:categoryDetails.id, storeId:storeId}
            }).then(async function(dst){
              if(categoryDetails.image && categoryDetails.image != '' && categoryDetails.image != null) {
  
                if(fs.existsSync(__dirname + '/../../public/admin/category/'+ categoryId +'/'+categoryDetails.image)){
                  fs.unlink(__dirname +  '/../../public/admin/category/'+ categoryId +'/'+categoryDetails.image, (err) => {
                    if (err) throw err;
                    console.log('successfully deleted /tmp/hello');
                  });
                }

              }
            })
          }
          return res.status(200).send({ data:{success:true, message:'Sub category successfully Deleted'}, errorNode:{errorCode:0, errorMsg:''}});
        }

      } else {
        return res.status(200).send({ data:{success:true, message:'No category found'}, errorNode:{errorCode:0, errorMsg:''}});
      }

    } else {
      return res.status(200).send({ data:{success:false,message:'Category Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};