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


exports.giftSetList =async function(req, res, next){
  var sessionStoreId = 30;
  var currPage = req.query.page ? req.query.page : 0;
  var limit = req.query.limit ? req.query.limit : 10;
  var offset = currPage!=0 ? (currPage * limit) - limit : 0;
  var token= req.session.token;
  jwt.verify(token, SECRET, async function(err, decoded) {
      if (err) {
          res.status(200).send({data:{verified:false},errNode:{errMsg:"Invalid Token",errCode:"1"}});
      }else{
        console.log(sessionStoreId+"----------------------")
          existingItem = models.giftSet.findAndCountAll({where: { storeId: 30}, limit: limit, offset: offset,order: [['id', 'DESC']]});            
          existingItem.then(function (results) {
              const itemCount = results.count;
              const pageCount = Math.ceil(results.count / limit);
              const previousPageLink = paginate.hasNextPages(req)(pageCount);
              const startItemsNumber = currPage== 0 || currPage==1 ? 1 : (currPage - 1) * limit +1;
              const endItemsNumber = pageCount== currPage ||  pageCount== 1 ? itemCount : currPage * limit ;
              return res.render('admin/giftSet/list', { title: 'giftSet',arrData:results.rows,arrOption:'',messages:req.flash('info'),errors: req.flash('errors'),
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

exports.addeditGiftSet = function(req, res, next){
  var sessionStoreId = 30;
  var id = req.params.id;
  var existingItem = null;
  if(!id){	
      return res.render('admin/giftSet/addedit', {
          title: 'Add giftSet',
          messages:req.flash('info'),
          arrData:'',
          errors:'',
          helper: helper
      });
  }else{            
      existingItem = models.giftSet.findOne({ where: {id:id, storeId: 30} });
      existingItem.then(function (value) { 
          return res.render('admin/giftSet/addedit', {
              title: 'Edit giftSet',
              messages:req.flash('info'),
              arrData: value,
              errors:'',
              helper: helper
          });
      });
  }
};

exports.addGiftSet = function(req, res, next) {
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
          models.giftSet.create({ 
              storeId: 30, 
              title: fields.title ? fields.title[0] : null, 
              status: fields.status ? fields.status[0] : null, 
              message: fields.message ? fields.message[0] : null, 
              createdBy: logdetails ? logdetails.id : null,
              sequence: sequence
          }).then(function(giftSet) {

              if (giftSet) {
                  if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                      var categroiesImage = Date.now() + files.image[0].originalFilename;
                      var ImageExt = categroiesImage.split('.').pop();
                      var categoryImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                      var finalCategoryImage = categoryImageWithEXT.replace("[object Object]", "");
                      // helper.createDirectory('public/admin/brands/' + value.id);
                      helper.createDirectory('public/admin/giftSet/'+giftSet.id);
                      var tempPath = files.image[0].path;
                      var fileName = finalCategoryImage;
                      // var targetPath = value.id + "/" + fileName;
                      var targetPath = fileName;
                      helper.uploadGiftSetImageFiles(tempPath, targetPath, giftSet.id);
                  }

                  models.giftSet.update({
                      image: finalCategoryImage
                  }, { where: { id: giftSet.id } }).then(function (val) {
                      if (val) {
                          req.flash('info', 'Successfully Created');
                          return res.redirect('/admin/giftSet');
                      }
                  }).catch(function (error) {
                      req.flash('errors', 'Something went wrong');
                  });
              } else {
                  req.flash('errors', 'Something went wrong');
              }
          })
          .catch(function(error) {
              return res.send(error);
          });
      }else{

          var categroiesImage = models.giftSet.findOne({ attributes: ['image'], where: { id: id } });
          if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
              var categroiesImage = Date.now() + files.image[0].originalFilename;
              var ImageExt = categroiesImage.split('.').pop();
              var categoryImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
              var finalCategoryImage = categoryImageWithEXT.replace("[object Object]", "");
              // helper.createDirectory('public/admin/brands/' + id);
              helper.createDirectory('public/admin/giftSet/'+id+'/');
              var tempPath = files.image[0].path;
              var fileName = finalCategoryImage;
              // var targetPath = id + "/" + fileName;
              var targetPath = fileName;
              helper.uploadGiftSetImageFiles(tempPath, targetPath, id);
          }
          var oldCategoryImage = categroiesImage.image;

          models.giftSet.update({ 
            title: fields.title ? fields.title[0] : null, 
            status: fields.status ? fields.status[0] : null, 
            message: fields.message ? fields.message[0] : null, 
            createdBy: logdetails ? logdetails.id : null, 
            sequence: sequence,
            image: finalCategoryImage != '' ? finalCategoryImage : oldCategoryImage
          },{where:{id:id}}).then(function(giftSet) {
              req.flash('info','Successfully Updated');	  
              res.redirect('/admin/giftSet');      
          })
          .catch(function(error) {
              return res.send(error);
          });
      }
  });
};

exports.deleteGiftSet = function(req, res, next) {
  
  var id = req.params.id;
  var sessionStoreId = 30;   
  models.giftSet.destroy({ 
      where:{id:id, storeId: sessionStoreId}
  }).then(function(value) {
      req.flash('info','Successfully Deleted');
      res.redirect('back');
  });
};