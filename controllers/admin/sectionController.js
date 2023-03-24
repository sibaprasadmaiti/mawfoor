var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var formidable = require('formidable');
var multiparty = require('multiparty'); 
var bodyParser = require('body-parser');
var fetch = require('node-fetch');
const Excel = require('exceljs');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
const paginate = require('express-paginate');

var config = require('../../config/config.json');

var Sequelize = require("sequelize");
const Op = Sequelize.Op
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

/**
 * This function is developed for listing section
 * Developer: Partha Mandal
*/
exports.list = async function(req, res){
  var token= req.session.token;
  var sessionStoreId = req.session.user.storeId;
  var role = req.session.role;
  jwt.verify(token, SECRET, async function(err, decoded) {
      if (err) {
          req.flash("info", "Invalid Token");
          res.redirect('/auth/signin');
      }else{
          if (sessionStoreId == null) {
              let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
              let column = req.query.column || 'id';
              let order = req.query.order || 'ASC';
              let pagesizes = req.query.pagesize || 10;
              let pageSize = parseInt(pagesizes);
              let page = req.params.page || 1;
              let search = req.query.search || '';

              let sectionList = await models.section.findAll({  where: {
                  [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                    { content: { [Op.like]: `%${search}%` } },
                    { status: { [Op.like]: `%${search}%` } },
                    { shortDescription: { [Op.like]: `%${search}%` } }
                  ]
                }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

              let listCount = await models.section.count({where: {
                  [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                    { content: { [Op.like]: `%${search}%` } },
                    { status: { [Op.like]: `%${search}%` } },
                    { shortDescription: { [Op.like]: `%${search}%` } }
                  ]
                }});
              let pageCount = Math.ceil(listCount/pageSize);

              if (sectionList) {
                  return res.render('admin/section/list', {
                      title: 'Section List',
                      arrData: sectionList,
                      storeList: storeList,
                      sessionStoreId: '',
                      listCount: listCount,
                      pageCount: pageCount,
                      columnName: column,
                      orderType: order,
                      searchItem: search,
                      pageSize: pageSize,
                      currentPage: parseInt(page),
                      messages: req.flash('info'),
                      errors: req.flash('errors'),
                  });
              } else {
                  return res.render('admin/section/list', {
                      title: 'Section List',
                      arrData: '',
                      storeList: '',
                      sessionStoreId: '',
                      messages: req.flash('info'),
                      errors: req.flash('errors'),
                  });
              }
          }else{
              //*****Permission Assign Start
              var userPermission = false;
              if (role == 'admin') {
                  userPermission = true;
              } else {
                  userPermission = !!req.session.permissions.find(permission => {
                      return permission === 'SectionList'
                  })
              }
              if (userPermission == false) {
                  req.flash('errors', 'Contact Your administrator for permission');
                  res.redirect('/admin/dashboard');
              } else {
                  let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });
                  let column = req.query.column || 'id';
                  let order = req.query.order || 'ASC';
                  let pagesizes = req.query.pagesize || 10;
                  let pageSize = parseInt(pagesizes);
                  let page = req.params.page || 1;
                  let search = req.query.search || '';

                  let sectionList = await models.section.findAll({ order: [[column, order]], where: { storeId: sessionStoreId, [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { content: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } },
                        { shortDescription: { [Op.like]: `%${search}%` } }
                        ] },limit:pageSize, offset:(page-1)*pageSize });

                  let listCount = await models.section.count({where: { storeId: sessionStoreId, [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { content: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } },
                        { shortDescription: { [Op.like]: `%${search}%` } }
                    ] }});

                  let pageCount = Math.ceil(listCount/pageSize);

                  if (sectionList) {
                      return res.render('admin/section/list', {
                          title: 'Section List',
                          arrData: sectionList,
                          storeList: storeList,
                          sessionStoreId: sessionStoreId,
                          listCount: listCount,
                          pageCount: pageCount,
                          columnName: column,
                          orderType: order,
                          searchItem: search,
                          pageSize: pageSize,
                          currentPage: parseInt(page),
                          messages: req.flash('info'),
                          errors: req.flash('errors'),
                      });
                  } else {
                      return res.render('admin/section/list', {
                          title: 'Section List',
                          arrData: '',
                          storeList: '',
                          sessionStoreId: sessionStoreId,
                          messages: req.flash('info'),
                          errors: req.flash('errors'),
                      });
                  }
              }                
          }            
      }	
  });
}

/**
 * This function is developed for view Section
 * Developer: Partha Mandal
*/
exports.view = async function(req, res){
  var token = req.session.token;
  var sessionStoreId = req.session.user.storeId;
  var role = req.session.role;
  var id = req.params.id;
  jwt.verify(token,SECRET,async function(err,decoded){
      if(err){
          req.flash('info','Invalid Token');
          res.redirect('auth/signin');
      }else{
          if (sessionStoreId == null) {
              var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });

              if (!id) {
                  return res.render('admin/section/addedit', {
                      title: 'Add Section',
                      arrData: '',
                      stores: stores,
                      sessionStoreId: '',
                      messages: req.flash('info'),
                      errors: req.flash('errors')
                  });
              } else {
                  var section = await models.section.findOne({ where: { id: id } });
                  if (section) {
                      return res.render('admin/section/addedit', {
                          title: 'Edit Section',
                          arrData: section,
                          stores: stores,
                          sessionStoreId: '',
                          messages: req.flash('info'),
                          errors: req.flash('errors')
                      });
                  }
              }
          }else{
              //*****Permission Assign Start
              var userPermission = false;
              if (role == 'admin') {
                  userPermission = true;
              } else {
                  userPermission = !!req.session.permissions.find(permission => {
                      return permission === 'SectionView'
                  })
              }
              if (id) {
                  var storeIdChecking = await models.section.findOne({ attributes: ['storeId'], where: { id: id } });
                  if (storeIdChecking.storeId != sessionStoreId) {
                      userPermission = false;
                  }
              }
              if (userPermission == false) {
                  req.flash('errors', 'Contact Your administrator for permission');
                  res.redirect('/admin/dashboard');
              } else {
                  var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId, status: 'Yes' } });

                  if (!id) {
                      return res.render('admin/section/addedit', {
                          title: 'Add Section',
                          arrData: '',
                          stores: stores,
                          sessionStoreId: sessionStoreId,
                          messages: req.flash('info'),
                          errors: req.flash('errors')
                      });
                  } else {
                      var section = await models.section.findOne({ where: { storeId: sessionStoreId, id: id } });
                      if (section) {
                          return res.render('admin/section/addedit', {
                              title: 'Edit Section',
                              arrData: section,
                              stores: stores,
                              sessionStoreId: sessionStoreId,
                              messages: req.flash('info'),
                              errors: req.flash('errors')
                          });
                      }
                  }
              }
          }
      }
  });    
};



/**
 * This function is developed for add/update Section
 * Developer: Partha Mandal
 */
exports.addOrUpdate = function(req, res, next) {
  var token = req.session.token;
  var sessionStoreId = req.session.user.storeId;
  var sessionUserId = req.session.user.id;
  var role = req.session.role;
  jwt.verify(token, SECRET, async function (err, decoded) {
      if(err){
          res.flash('error','Invalid Token');
          req.redirect('auth/signin');
      }else{
          //*****Permission Assign Start
          var userPermission = false;
          //*****If SupperAdmin Login
          if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
              userPermission = true;
          } else {
              if (role == 'admin') {
                  userPermission = true;
              } else {
                  userPermission = !!req.session.permissions.find(permission => {
                      return permission === 'SectionAddEdit'
                  })
              }
          }
          if (userPermission == false) {
              req.flash('errors', 'Contact Your administrator for permission');
              res.redirect('/admin/dashboard');
          } else {
              var form = new multiparty.Form();
              form.parse(req, async function (err, fields, files) {
                  var id = fields.update_id[0];
                  var title = fields.title[0];
                  var content = fields.content[0];
                  var shortDescription = fields.shortDescription[0];
                  var storeId = fields.storeId[0];
                  var status = fields.status[0];
                  var slug = title.toString().toLowerCase().replace(/\s+/g, '-');
                  if (!id) {
                      if (title != '' && status != '') {
                          await models.section.create({
                              title: title,
                              slug: slug,
                              shortDescription: shortDescription,
                              content: content,
                              storeId: storeId,
                              status: status,
                              createdBy: sessionUserId
                          }).then(function (value) {
                              if (value) {
                                  req.flash('info', 'Successfully created');
                                  return res.redirect('/admin/section/list/1');
                              }
                          }).catch(function (error) {
                              console.log(error);
                              req.flash('errors', 'Somethings went wrong');
                              return res.redirect('back')
                          });
                      }else{
                          req.flash('errors', 'Please fill the required fields.')
                          return res.redirect('back')
                      }
                  } else {
                      if (title != '' && status != '') {
                        await models.section.update({
                          title: title,
                          slug: slug,
                          content: content,
                          shortDescription: shortDescription,
                          storeId: storeId,
                          status: status,
                          updatedBy: sessionUserId
                      }, { where: { id: id } }).then(function (value) {
                          if (value) {
                              req.flash('info', 'Successfully updated');
                              return res.redirect('/admin/section/list/1');
                          }
                      }).catch(function (error) {
                          console.log(error);
                          req.flash('errors', 'Somethings went wrong');
                          return res.redirect('back')
                      });
                      }else{
                          req.flash('errors', 'Please fill the required fields.')
                          return res.redirect('back')
                      }
                  }
              });
          }
      }
  })
  
};


/**
 * This function is developed for delete Section
 * Developer: Partha Mandal
*/
exports.delete = function(req, res, next) {
  var token = req.session.token;
  var sessionStoreId = req.session.user.storeId;
  var role = req.session.role;
  var id = req.params.id;
  jwt.verify(token,SECRET,async function(err,decoded){
      if(err){
          res.flash('error','Invalid Token');
          req.redirect('auth/signin');
      }else{
          if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
              userPermission = true;
          } else {
              //*****Permission Assign Start
              var userPermission = false;
              if (role == 'admin') {
                  userPermission = true;
              } else {
                  userPermission = !!req.session.permissions.find(permission => {
                      return permission === 'SectionDelete'
                  })
              }
              if (id) {
                  var storeIdChecking = await models.section.findOne({ attributes: ['storeId'], where: { id: id } });
                  if (storeIdChecking.storeId != sessionStoreId) {
                      userPermission = false;
                  }
              }
          }
          if (userPermission == false) {
              req.flash('errors', 'Contact Your administrator for permission');
              res.redirect('/admin/dashboard');
          } else {
              models.section.destroy({
                  where: { id: id }
              }).then(function (value) {
                  if (value) {
                      req.flash('info', 'Successfully deleted');
                      res.redirect('back');
                  } else {
                      req.flash('errors', 'Something went wrong');
                      res.redirect('back');
                  }
              });
          }
      }
  });
};  
