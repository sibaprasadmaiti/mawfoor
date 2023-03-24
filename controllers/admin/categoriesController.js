var models = require("../../models");
var bcrypt = require("bcrypt-nodejs");
var cookieParser = require("cookie-parser");
var flash = require("connect-flash");
var formidable = require("formidable");
var multiparty = require("multiparty");
var bodyParser = require("body-parser");
const Excel = require("exceljs");
var fetch = require("node-fetch");
var jwt = require("jsonwebtoken");
var helper = require('../../helpers/helper_functions');
var SECRET = "nodescratch";
const paginate = require("express-paginate");
var config = require("../../config/config.json");
var Sequelize = require("sequelize");
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
* Description: Category lists
* Developer:Susanta Kumar Das
**/
// exports.loadPage = async  function(req,res){
//   var token= req.session.token;
//   var sessionStoreId = req.session.user.storeId;
//   var role = req.session.role;
//   jwt.verify(token, SECRET, async function(err, decoded) {
//     if (err) {
//       req.flash("info", "Invalid Token");
//       res.redirect('/auth/signin');
//     } else {
//       var selectCatId = req.params.id;
//       var sessionStoreId = req.session.user.storeId;
//       var selectCategoryDetails ='';
//       var productListCatWise ='';
//       var tree='';
//       if(sessionStoreId==null){
//         var stores = await models.stores.findAll({attributes:['id','storeName'],where:{status:'Yes'}});
//         var treeForDropDown='';
//         if(selectCatId !='' && selectCatId !=null){
//           selectCategoryDetails = await models.categories.findOne({where:{id:selectCatId}});
//         }
//         var categoryDetails = await models.categories.findAll({
//           order: [
//             ['storeId', 'ASC'],
//             ['position', 'ASC'],
//           ]
//         });
//         var arr=[];
//         var arrdropdown =[];
//         arrdropdown.push({
//           "id":"0",
//           "storeId":"",
//           "title":"Select Parent Category",
//           "parent":""
//         });
//         categoryDetails.forEach(function (cat) {
//           arr.push({
//             "id": cat.id,
//             "storeId": cat.storeId,
//             "text": cat.title,
//             "parent": cat.parentCategoryId,
//             "href" : req.app.locals.baseurl+'admin/categories/'+cat.id
//           });
//           arrdropdown.push({
//             "id": cat.id,
//             "storeId": cat.storeId,
//             "title": cat.title,
//             "parent": cat.parentCategoryId
//           });
//         })
//         tree = unflatten(arr);
//         treeForDropDown = unflattenDRP(arrdropdown);
//         if(selectCategoryDetails){
//           return res.render("admin/categories/addedit", {
//             title: "Categories",
//             arrCategoryDetails : categoryDetails,
//             arrSelectCategoryDetails: selectCategoryDetails,
//             arrProductListCatWise : productListCatWise,
//             stores : stores,
//             storeId: sessionStoreId,
//             arrTree : JSON.stringify(tree, null, " "),
//             arrtreeForDropDown : JSON.stringify(treeForDropDown, null, " "),
//             helper : helper,
//             messages: req.flash("info"),
//             errors: req.flash("errors")
//           })
//         } else {
//           return res.render("admin/categories/addedit", {
//             title: "Category",
//             arrCategoryDetails : categoryDetails,
//             arrSelectCategoryDetails: '',
//             arrProductListCatWise:'',
//             stores:stores,
//             storeId: sessionStoreId,
//             arrTree : JSON.stringify(tree, null, " "),
//             arrtreeForDropDown : JSON.stringify(treeForDropDown, null, " "),
//             helper : helper,
//             messages: req.flash("info"),
//             errors: req.flash("errors")
//           })
//         }
//       } else {
//         var stores = await models.stores.findAll({attributes:['id','storeName'],where:{id:sessionStoreId,status:'Yes'}});
//         var treeForDropDown='';
//         if(selectCatId !='' && selectCatId !=null){
//           //*****Permission Assign Start
//           if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
//             userPermission = true;
//           } else {
//             if (role == 'admin') {
//               userPermission = true;
//             } else {
//               userPermission = !!req.session.permissions.find(permission => {
//                 return permission === 'CategoryAddEdit'
//               })
//             }
//           }
//           if (userPermission == false) {
//             req.flash('errors', 'Contact Your administrator for permission');
//             res.redirect('/admin/dashboard');
//           }else{
//             selectCategoryDetails = await models.categories.findOne({where:{storeId:sessionStoreId,id:selectCatId}});
//             if (selectCategoryDetails==null){
//               req.flash('errors', 'Contact Your administrator for permission');
//               res.redirect('/admin/dashboard');
//             }
//           }
//         }
//         var categoryDetails = await models.categories.findAll({
//           where:{
//             storeId:sessionStoreId
//           },
//           order: [
//             ['storeId', 'ASC'],
//             ['position', 'ASC'],
//           ]
//         });
//         var arr=[];
//         var arrdropdown =[];
//         arrdropdown.push({
//           "id":"0",
//           "storeId":"",
//           "title":"Select Parent Category",
//           "parent":""
//         });
//         categoryDetails.forEach(function (cat) {
//           arr.push({
//             "id": cat.id,
//             "storeId": cat.storeId,
//             "text": cat.title,
//             "parent": cat.parentCategoryId,
//             "href" : req.app.locals.baseurl+'admin/categories/'+cat.id
//           });
//           arrdropdown.push({
//             "id": cat.id,
//             "storeId": cat.storeId,
//             "title": cat.title,
//             "parent": cat.parentCategoryId
//           });
//         })
//         tree = unflatten(arr);
//         treeForDropDown = unflattenDRP(arrdropdown);
//         if(selectCategoryDetails){
//           return res.render("admin/categories/addedit", {
//             title: "Categories",
//             arrCategoryDetails : categoryDetails,
//             arrSelectCategoryDetails: selectCategoryDetails,
//             arrProductListCatWise : productListCatWise,
//             stores : stores,
//             storeId: sessionStoreId,
//             arrTree : JSON.stringify(tree, null, " "),
//             arrtreeForDropDown : JSON.stringify(treeForDropDown, null, " "),
//             helper : helper,
//             messages: req.flash("info"),
//             errors: req.flash("errors")
//           })
//         } else {
//           return res.render("admin/categories/addedit", {
//             title: "Category",
//             arrCategoryDetails : categoryDetails,
//             arrSelectCategoryDetails: '',
//             arrProductListCatWise:'',
//             stores:stores,
//             storeId: sessionStoreId,
//             arrTree : JSON.stringify(tree, null, " "),
//             arrtreeForDropDown : JSON.stringify(treeForDropDown, null, " "),
//             helper : helper,
//             messages: req.flash("info"),
//             errors: req.flash("errors")
//           })
//         }
//       }
//     }
//   });
// }
// /**
// * Description: Category Status Change
// * Developer:Susanta Kumar Das
// **/
// exports.statusChange = async function(req,res){
//   var token= req.session.token;
//   jwt.verify(token, SECRET, function(err, decoded) {
//     if(err){
//       req.flash("info", "Invalid Token");
//       res.redirect('/auth/signin');
//     } else {
//       var categoryId = req.body.categoryId;
//       var statusValue = req.body.statusValue;
//       if(categoryId !='' && statusValue !=''){
//         models.categories.update({
//           status : statusValue
//         },{where:{id:categoryId}}).then(function(upd){
//           if(upd){
//             req.flash("info", "Status Successfully Changed");
//             return res.status(200).send({status:true,messages:"Status Successfully Changed"});
//           }
//         }).catch(function(error) {
//           return res.send(error);
//         });
//       } else {
//         req.flash("info", "Id: "+categoryId+" value: "+statusValue+" not found");
//         return res.status(200).send({status:false,messages:"Id: "+categoryId+" value: "+statusValue+" not found"});
//       }
//     }
//   });
// }
// /**
// * Description: Category Include Menu Change
// * Developer:Susanta Kumar Das
// **/
// exports.includeMenuChange = async function(req,res){
//   var token= req.session.token;
//   jwt.verify(token, SECRET, function(err, decoded) {
//     if(err){
//       req.flash("info", "Invalid Token");
//       res.redirect('/auth/signin');
//     } else {
//       var categoryId = req.body.categoryId;
//       var statusValue = req.body.statusValue;
//       if(categoryId !='' && statusValue !=''){
//         models.categories.update({
//           includeInMenu : statusValue
//         },{where:{id:categoryId}}).then(function(upd){
//           if(upd){
//             req.flash("info", "Include Menu Successfully Changed");
//             return res.status(200).send({status:false,messages:"Include Menu Successfully Changed"});
//           }
//         }).catch(function(error) {
//           return res.send(error);
//         });
//       } else {
//         req.flash("info", "Id: "+categoryId+" value: "+statusValue+" not found");
//         return res.status(200).send({status:false,messages:"Id: "+categoryId+" value: "+statusValue+" not found"});
//       }
//     }
//   });
// }
// /**
// * Description: Category Include Footer Change
// * Developer:Susanta Kumar Das
// **/
// exports.includeFooterChange = async function(req,res){
//   var token= req.session.token;
//   jwt.verify(token, SECRET, function(err, decoded) {
//     if(err){
//       req.flash("info", "Invalid Token");
//       res.redirect('/auth/signin');
//     } else {
//       var categoryId = req.body.categoryId;
//       var statusValue = req.body.statusValue;
//       if(categoryId !='' && statusValue !=''){
//         models.categories.update({
//           includeInFooter : statusValue
//         },{where:{id:categoryId}}).then(function(upd){
//           if(upd){
//             req.flash("info", "Include Menu Successfully Changed");
//             return res.status(200).send({status:false,messages:"Include Menu Successfully Changed"});
//           }
//         }).catch(function(error) {
//           return res.send(error);
//         });
//       } else {
//         req.flash("info", "Id: "+categoryId+" value: "+statusValue+" not found");
//         return res.status(200).send({status:false,messages:"Id: "+categoryId+" value: "+statusValue+" not found"});
//       }
//     }
//   });
// }
// /**
// * Description: Category Include Home Change
// * Developer:Susanta Kumar Das
// **/
// exports.includeHomeChange = async function(req,res){
//   var token= req.session.token;
//   jwt.verify(token, SECRET, function(err, decoded) {
//     if(err){
//       req.flash("info", "Invalid Token");
//       res.redirect('/auth/signin');
//     } else {
//       var categoryId = req.body.categoryId;
//       var statusValue = req.body.statusValue;
//       if(categoryId !='' && statusValue !=''){
//         models.categories.update({
//           includeInHome : statusValue
//         },{where:{id:categoryId}}).then(function(upd){
//           if(upd){
//             req.flash("info", "Include Menu Successfully Changed");
//             return res.status(200).send({status:false,messages:"Include Menu Successfully Changed"});
//           }
//         }).catch(function(error) {
//           return res.send(error);
//         });
//       } else {
//         req.flash("info", "Id: "+categoryId+" value: "+statusValue+" not found");
//         return res.status(200).send({status:false,messages:"Id: "+categoryId+" value: "+statusValue+" not found"});
//       }
//     }
//   });
// }
// /**
// * Description: Category Include Anchor Change
// * Developer:Susanta Kumar Das
// **/
// exports.includeAnchorChange = async function(req,res){
//   var token= req.session.token;
//   jwt.verify(token, SECRET, function(err, decoded) {
//     if(err){
//       req.flash("info", "Invalid Token");
//       res.redirect('/auth/signin');
//     } else {
//       var categoryId = req.body.categoryId;
//       var statusValue = req.body.statusValue;
//       if(categoryId !='' && statusValue !=''){
//         models.categories.update({
//           anchor : statusValue
//         },{where:{id:categoryId}}).then(function(upd){
//           if(upd){
//             req.flash("info", "Include Menu Successfully Changed");
//             return res.status(200).send({status:false,messages:"Include Menu Successfully Changed"});
//           }
//         }).catch(function(error) {
//           return res.send(error);
//         });
//       } else {
//         req.flash("info", "Id: "+categoryId+" value: "+statusValue+" not found");
//         return res.status(200).send({status:false,messages:"Id: "+categoryId+" value: "+statusValue+" not found"});
//       }
//     }
//   });
// }
// /**
// * Description: Category Add/Update Content Details
// * Developer:Susanta Kumar Das
// **/
// exports.contentAdd = async function(req,res){
//   var token= req.session.token;
//   jwt.verify(token, SECRET, function(err, decoded) {
//     if(err){
//       req.flash("info", "Invalid Token");
//       res.redirect('/auth/signin');
//     } else {
//       var form = new multiparty.Form();
//       form.parse(req,async function(err, fields, files) {
//         var categoryId = fields.contentCategory[0];
//         if(categoryId !='' && categoryId !=null){
//           if(files.image[0].originalFilename !='' && files.image[0].originalFilename != null){
//             var catImage = Date.now()+files.image[0].originalFilename;
//             var ImageExt = catImage.split('.').pop();
//             var catImagewithEXT = Date.now()+files.image[0]+"."+ImageExt;
//             var userFinalImage = catImagewithEXT.replace("[object Object]", "");
//           }  
//           //var slug = fields.name.toString().toLowerCase().replace(/\s+/g, '-');
//           models.categories.update({
//             //slug : slug,
//             title: fields.name[0],
//             storeId: fields.editStoreId[0],
//             position: fields.position[0],
//             parentCategoryId: fields.editParentCategoryId[0] ? fields.editParentCategoryId[0] : null,
//             description : fields.description[0]
//           },{where:{id:categoryId}}).then(async function(udt){
//             if(files.image[0].originalFilename !='' && files.image[0].originalFilename != null){
//               helper.createDirectory('public/admin/category/'+categoryId); 
//               var tempPath = files.image[0].path;
//               var fileName = userFinalImage;
//               var targetPath = categoryId+"/"+fileName;
//               helper.uploadCategoryFiles(tempPath, targetPath); 
//               var cat = await models.categories.findOne({where:{id:categoryId}});
//               var oldIcon = cat.image;
//               models.categories.update({
//                 image   : userFinalImage  ? userFinalImage : oldIcon,
//               },{where:{id:categoryId}});                      
//             }        
//             req.flash('info','Content Successfully Updated');
//             return res.redirect('/admin/categories/'+categoryId);
//           }).catch(function(error) {
//             req.flash('info',error);
//             return res.redirect('/admin/categories/'+categoryId);
//           });
//         }
//       });
//     }
//   });
// }
// /**
// * Description: Category Add/Update SEO Details
// * Developer:Susanta Kumar Das
// **/
// exports.addSEO = async function(req,res){
//   var token= req.session.token;
//   jwt.verify(token, SECRET, function(err, decoded) {
//     if(err){
//       req.flash("info", "Invalid Token");
//       res.redirect('/auth/signin');
//     } else {
//       var form = new multiparty.Form();
//       form.parse(req,async function(err, fields, files) {
//         var categoryId = fields.seoCategory[0];
//         var userFinalMetaImage='';
//         if(categoryId != '' && categoryId != null){
//         var cat = await models.categories.findOne({attributes:['metaImage'],where:{id:categoryId}});
//           if(files.metaImage[0].originalFilename !='' && files.metaImage[0].originalFilename != null){
//             var catMetaImage = Date.now()+files.metaImage[0].originalFilename;
//             var ImageExt = catMetaImage.split('.').pop();
//             var catMetaImagewithEXT = Date.now()+files.metaImage[0]+"."+ImageExt;
//             userFinalMetaImage = catMetaImagewithEXT.replace("[object Object]", "");
//             helper.createDirectory('public/admin/category/metaimage/'+categoryId); 
//             var tempPath = files.metaImage[0].path;
//             var fileName = userFinalMetaImage;
//             var targetPath = "metaimage/"+categoryId+"/"+fileName;
//             helper.uploadCategoryFiles(tempPath, targetPath); 
//           }  
//           var oldMetaImage = cat.metaImage;
//           models.categories.update({
//             metaTitle : fields.metaTitle[0],
//             metaKey : fields.metaKey[0],
//             metaDescription : fields.metaDescription[0],
//             metaImage : userFinalMetaImage!='' ? userFinalMetaImage : oldMetaImage,
//           },{where:{id:categoryId}}).then(function(upd){
//             req.flash('info','SEO Successfully Updated');
//             return res.redirect('/admin/categories/'+categoryId);
//           }).catch(function(error) {
//             req.flash('info',error);
//             return res.redirect('/admin/categories/'+categoryId);
//           });
//         }
//       })
//     }
//   });
// }
// /**
// * Description: Category Add
// * Developer:Susanta Kumar Das
// **/
// exports.saveNew = async function(req,res){
//   var token= req.session.token;
//   jwt.verify(token, SECRET, function(err, decoded) {
//     if(err){
//       req.flash("info", "Invalid Token");
//       res.redirect('/auth/signin');
//     } else {
//       var form = new multiparty.Form();
//       form.parse(req,async function(err, fields, files) {
//         var newCategoryName = fields.catName[0];
//         var storeId = fields.storeId[0];
//         var slugName = fields.catSlug[0];
//         var currentCategoryId = fields.currentCategoryId[0];
//         if(newCategoryName !=''){
//           models.categories.create({
//             title: newCategoryName,
//             slug : slugName,
//             position : 1,
//             storeId : storeId,
//             parentCategoryId : currentCategoryId ? currentCategoryId : null,
//             createdAt : Date.now(),
//           }).then(function(crt){
//             if(crt){
//               req.flash('info','Successfully Created');
//               return res.redirect('/admin/categories');
//             }
//           }).catch(function(error) {
//             req.flash('info',error);
//             return res.redirect('/admin/categories/'+categoryId);
//           });
//         } else {
//           req.flash('errors','Category name is required!');
//           return res.redirect('/admin/categories');
//         }
//       })
//     }
//   });
// }
// /**
// * Description: Category Add/Update Other Details
// * Developer:Susanta Kumar Das
// **/
// exports.addOther = async function(req,res){
//   var token= req.session.token;
//   jwt.verify(token, SECRET, function(err, decoded) {
//     if(err){
//       req.flash("info", "Invalid Token");
//       res.redirect('/auth/signin');
//     } else {
//       var form = new multiparty.Form();
//       form.parse(req,async function(err, fields, files) {
//         var categoryId = fields.otCategory[0];
//         if(categoryId!=''){
//           models.categories.update({
//             url : fields.url[0]
//           },{where:{id:categoryId}}).then(function(crt){
//             if(crt){
//               req.flash('info','Successfully Upadted');
//               return res.redirect('/admin/categories/'+categoryId);
//             }
//           }).catch(function(error) {
//             req.flash('info',error);
//             return res.redirect('/admin/categories/'+categoryId);
//           });
//         } else {
//           models.categories.create({
//             url : fields.url[0]
//           }).then(function(crt){
//             if(crt){
//               req.flash('info','Successfully Created');
//               return res.redirect('/admin/categories');
//             }
//           }).catch(function(error) {
//             req.flash('info',error);
//             return res.redirect('/admin/categories');
//           });
//         }
//       })
//     }
//   });
// }
// /**
// * Description: Category Unflatten Tree Details
// * Developer:Susanta Kumar Das
// **/
// function unflatten(arr) {
//   var tree = [], mappedArr = {}, arrElem, mappedElem;
//   // First map the nodes of the array to an object -> create a hash table.
//   for (var i = 0, len = arr.length; i < len; i++) {
//     arrElem = arr[i];
//     mappedArr[arrElem.id] = arrElem;
//     mappedArr[arrElem.id]['nodes'] = [];
//   }
//   for (var id in mappedArr) {
//     if (mappedArr.hasOwnProperty(id)) {
//       mappedElem = mappedArr[id];
//       // If the element is not at the root level, add it to its parent array of nodes.
//       if (mappedElem.parent) {
//         mappedArr[mappedElem['parent']]['nodes'].push(mappedElem);
//       }
//       // If the element is at the root level, add it to first level elements array.
//       else {
//         tree.push(mappedElem);
//       }
//     }
//   }
//   //console.log(JSON.stringify(tree, null, " "));
//   return tree;
// }
// /**
// * Description: Category Unflatten DRP Tree Details
// * Developer:Susanta Kumar Das
// **/
// function unflattenDRP(arrdropdown) {
//   var tree = [], mappedArr = {}, arrElem, mappedElem;
//   // First map the nodes of the array to an object -> create a hash table.
//   for (var i = 0, len = arrdropdown.length; i < len; i++) {
//     arrElem = arrdropdown[i];
//     mappedArr[arrElem.id] = arrElem;
//     mappedArr[arrElem.id]['subs'] = [];
//   }
//   for (var id in mappedArr) {
//     if (mappedArr.hasOwnProperty(id)) {
//       mappedElem = mappedArr[id];
//       // If the element is not at the root level, add it to its parent array of nodes.
//       if (mappedElem.parent) {
//         mappedArr[mappedElem['parent']]['subs'].push(mappedElem);
//       }
//       // If the element is at the root level, add it to first level elements array.
//       else {
//         tree.push(mappedElem);
//       }
//     }
//   }
//   //console.log(JSON.stringify(tree, null, " "));
//   return tree;
// }


exports.categoryList =async function(req, res, next){
  var sessionStoreId = req.session.user.storeId;
  var currPage = req.query.page ? req.query.page : 0;
  var limit = req.query.limit ? req.query.limit : 10;
  var offset = currPage!=0 ? (currPage * limit) - limit : 0;
  var token= req.session.token;
  jwt.verify(token, SECRET, async function(err, decoded) {
      if (err) {
          res.status(200).send({data:{verified:false},errNode:{errMsg:"Invalid Token",errCode:"1"}});
      }else{
        console.log(sessionStoreId+"----------------------")
          existingItem = models.categories.findAndCountAll({where: { storeId: 30}, limit: limit, offset: offset,order: [['id', 'DESC']]});            
          existingItem.then(function (results) {
              const itemCount = results.count;
              const pageCount = Math.ceil(results.count / limit);
              const previousPageLink = paginate.hasNextPages(req)(pageCount);
              const startItemsNumber = currPage== 0 || currPage==1 ? 1 : (currPage - 1) * limit +1;
              const endItemsNumber = pageCount== currPage ||  pageCount== 1 ? itemCount : currPage * limit ;
              return res.render('admin/categories/list', { title: 'categories',arrData:results.rows,arrOption:'',messages:req.flash('info'),errors: req.flash('errors'),
                  pageCount,
                  itemCount,
                  currentPage: currPage,
                  previousPage : previousPageLink	,
                  startingNumber: startItemsNumber,
                  endingNumber: endItemsNumber,
                  pages: paginate.getArrayPages(req)(limit, pageCount, currPage),
                  helper: helper	
              }); 
          })
      }	
  });
}

exports.addeditCategory = function(req, res, next){
  var sessionStoreId = req.session.user.storeId;
  var id = req.params.id;
  var existingItem = null;
  if(!id){	
      return res.render('admin/categories/addedit', {
          title: 'Add categories',
          messages:req.flash('info'),
          arrData:'',
          errors:'',
          helper: helper
      });
  }else{            
      existingItem = models.categories.findOne({ where: {id:id, storeId: 30} });
      existingItem.then(function (value) { 
          return res.render('admin/categories/addedit', {
              title: 'Edit categories',
              messages:req.flash('info'),
              arrData: value,
              errors:'',
              helper: helper
          });
      });
  }
};

exports.addCategory = function(req, res, next) {
  var sessionStoreId = req.session.user.storeId;
  var d = new Date();
  var n = d.getTime();
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) { 
      var id = fields.update_id[0];
      var logdetails = req.session.user 
      var slug = fields.title[0].toString().toLowerCase().replace(/\s+/g, '-');

      if(fields.sequence[0] != "" && fields.sequence[0] != null ){
        var sequence = fields.sequence[0]; 
      } else {
        var sequence = null;
      }

      if(!id)
      {
          models.categories.create({ 
              storeId: 30, 
              title: fields.title ? fields.title[0] : null, 
              status: fields.status ? fields.status[0] : null, 
              description: fields.description ? fields.description[0] : null, 
              createdBy: logdetails ? logdetails.id : null,
              sequence: sequence,
              slug:slug
          }).then(function(categroies) {

              if (categroies) {
                  if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                      var categroiesImage = Date.now() + files.image[0].originalFilename;
                      var ImageExt = categroiesImage.split('.').pop();
                      var categoryImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                      var finalCategoryImage = categoryImageWithEXT.replace("[object Object]", "");
                      // helper.createDirectory('public/admin/brands/' + value.id);
                      helper.createDirectory('public/admin/categories/'+categroies.id);
                      var tempPath = files.image[0].path;
                      var fileName = finalCategoryImage;
                      // var targetPath = value.id + "/" + fileName;
                      var targetPath = fileName;
                      helper.uploadCategoryImageFiles(tempPath, targetPath, categroies.id);
                  }

                  models.categories.update({
                      image: finalCategoryImage
                  }, { where: { id: categroies.id } }).then(function (val) {
                      if (val) {
                          req.flash('info', 'Successfully Created');
                          return res.redirect('/admin/categories');
                      }
                  }).catch(function (error) {
                      req.flash('errors', 'Something went wrong');
                  });

                  // req.flash('info','Successfully Created');	  
                  // res.redirect('/admin/salesman');
              } else {
                  req.flash('errors', 'Something went wrong');
              }
          })
          .catch(function(error) {
              return res.send(error);
          });
      }else{

          var categroiesImage = models.categories.findOne({ attributes: ['image'], where: { id: id } });
          if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
              var categroiesImage = Date.now() + files.image[0].originalFilename;
              var ImageExt = categroiesImage.split('.').pop();
              var categoryImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
              var finalCategoryImage = categoryImageWithEXT.replace("[object Object]", "");
              // helper.createDirectory('public/admin/brands/' + id);
              helper.createDirectory('public/admin/categories/'+id+'/');
              var tempPath = files.image[0].path;
              var fileName = finalCategoryImage;
              // var targetPath = id + "/" + fileName;
              var targetPath = fileName;
              helper.uploadCategoryImageFiles(tempPath, targetPath, id);
          }
          var oldCategoryImage = categroiesImage.image;

          models.categories.update({ 
            title: fields.title ? fields.title[0] : null, 
            status: fields.status ? fields.status[0] : null, 
            description: fields.description ? fields.description[0] : null, 
            createdBy: logdetails ? logdetails.id : null, 
            sequence: sequence,
            image: finalCategoryImage != '' ? finalCategoryImage : oldCategoryImage
          },{where:{id:id}}).then(function(categroies) {
              req.flash('info','Successfully Updated');	  
              res.redirect('/admin/categories');      
          })
          .catch(function(error) {
              return res.send(error);
          });
      }
  });
};

// exports.deleteCategory = function(req, res, next) {
  
//   var id = req.params.id;
//   var sessionStoreId = req.session.user.storeId;   
//   models.categories.destroy({ 
//       where:{id:id, storeId: sessionStoreId}
//   }).then(function(value) {
//       req.flash('info','Successfully Deleted');
//       res.redirect('back');
//   });
// };

exports.deleteCategory =async function(req, res, next) {
  
    var id = req.params.id;
    //   var sessionStoreId = req.session.user.storeId; 

    console.log(id+"------------------------------qqqq")
  
    // var productCategory = models.productCategory.findAll({ where: { categoryId: id } });
    // const productCategory = await sequelize.query("SELECT * FROM `productCategory`  WHERE categoryId = "+id+" ORDER BY `productCategory`.`categoryId`  DESC",{ type: Sequelize.QueryTypes.SELECT });
    const productCategory = await models.productCategory.findAll({where:{categoryId:id}})
    console.log(productCategory.length+"------------------------------productCategory")

    if(productCategory.length>0){
        for(var i=0;i<productCategory.length;i++){
            if(productCategory[i].productId && productCategory[i].productId != null && productCategory[i].productId != '' ){
                console.log(productCategory[i].productId+"------------------------------productCategory[i].productId")
                models.products.destroy({ 
                    where:{id:productCategory[i].productId }
                })

                models.productImages.destroy({ 
                    where:{productId:productCategory[i].productId }
                })
                
            }
            if( Number(i+1) == Number(productCategory.length) ){
                console.log(productCategory.length+"------------------------------pproductCategory.length")
                console.log(Number(i+1)+"------------------------------Number(i+1)")
                models.productCategory.destroy({ 
                    where:{categoryId:id }
                })

                models.categories.destroy({ 
                    where:{id:id}
                }).then(function(value) {
                    req.flash('info','Successfully Deleted');
                    res.redirect('back');
                });
            }
        }
    } else {
        models.categories.destroy({ 
            where:{id:id }
        }).then(function(value) {
            req.flash('info','Successfully Deleted');
            res.redirect('back');
        });
    } 
};