var models = require('../../models');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var fs = require("fs");
var formidable = require('formidable');
var multiparty = require('multiparty'); 
var bodyParser = require('body-parser');
var fetch = require('node-fetch');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
const paginate = require('express-paginate');
var helper = require('../../helpers/helper_functions');
var config = require("../../config/config.json");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;

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


exports.list = async function(req, res){
  var token= req.session.token;
  var sessionStoreId = req.session.user.storeId;
  var role = req.session.role;
  let column = req.query.column || 'id';
  let order = req.query.order || 'DESC';
  let pagesizes = req.query.pagesize || 10;
  let pageSize = parseInt(pagesizes);
  let page = req.params.page || 1;
  let search = req.query.search || '';
  jwt.verify(token, SECRET, async function(err, decoded) {
      if (err) {
          req.flash("info", "Invalid Token");
          res.redirect('/auth/signin');
      }else{
          if (sessionStoreId == null) {
              let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
              
              let invitationList = await models.invitation.findAll({ where: {
                  [Op.or]: [
                      {name: {[Op.like]:`%${search}%`}},
                      {email: {[Op.like]:`%${search}%`}},
                      {mobile: {[Op.like]:`%${search}%`}},
                      {message: {[Op.like]:`%${search}%`}},
                      {status: {[Op.like]:`%${search}%`}} 
                  ]
                }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

              let listCount = await models.invitation.count({where: {
                  [Op.or]: [
                    {name: {[Op.like]:`%${search}%`}},
                    {email: {[Op.like]:`%${search}%`}},
                    {mobile: {[Op.like]:`%${search}%`}},
                    {message: {[Op.like]:`%${search}%`}},
                    {status: {[Op.like]:`%${search}%`}} 
                  ]
                }});

              let pageCount = Math.ceil(listCount/pageSize);

              if (invitationList) {
                  return res.render('admin/invitation/list', {
                      title: 'Invitation List',
                      arrData: invitationList,
                      arrStore: storeList,
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
                  return res.render('admin/invitation/list', {
                      title: 'InvitationList List',
                      arrData: '',
                      arrStore: storeList,
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
                      return permission === 'InvitationList'
                  })
              }
              if (userPermission == false) {
                  req.flash('errors', 'Contact Your administrator for permission');
                  res.redirect('/admin/dashboard');
              } else {
                  let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });

                  let invitationList = await models.invitation.findAll({ order: [[column, order]], where: { storeId: sessionStoreId, [Op.or]: [
                    {name: {[Op.like]:`%${search}%`}},
                    {email: {[Op.like]:`%${search}%`}},
                    {mobile: {[Op.like]:`%${search}%`}},
                    {message: {[Op.like]:`%${search}%`}},
                    {status: {[Op.like]:`%${search}%`}} 
                    ] },limit:pageSize, offset:(page-1)*pageSize });

                  let listCount = await models.invitation.count({where: { storeId: sessionStoreId, [Op.or]: [
                    {name: {[Op.like]:`%${search}%`}},
                    {email: {[Op.like]:`%${search}%`}},
                    {mobile: {[Op.like]:`%${search}%`}},
                    {message: {[Op.like]:`%${search}%`}},
                    {status: {[Op.like]:`%${search}%`}} 
                    ] }});

                  let pageCount = Math.ceil(listCount/pageSize);

                  if (invitationList) {
                      return res.render('admin/invitation/list', {
                          title: 'InvitationList List',
                          arrData: invitationList,
                          arrStore: storeList,
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
                      return res.render('admin/invitation/list', {
                          title: 'Delivery TimeSlot List',
                          arrData: '',
                          arrStore: storeList,
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

exports.addedit = function (req, res, next) {
  var id = req.params.id;
  var existingItem = null;
  if (!id) {
    //res.status(200).send({
    res.render("admin/invitation/addedit", {
      title: "Invitation",
      arrData: "",        
      messages: req.flash("info"),
      errors: req.flash("errors"),
    });
  } else {
    existingItem = models.invitation.findOne({ where: { id: id } });
    existingItem.then(function (value) {
      // res.status(200).send({
      res.render("admin/invitation/addedit", {
        title: "View Invitation",
        arrData: value,
        messages: req.flash("info"),
        errors: req.flash("errors"),
      });
    });
  }
};

// exports.delete = async function(req, res, next) {
// 	var id = req.params.id;
// 	console.log(id);
// 	models.invitation.destroy({
// 		where: { id: id }
// 	}).then(function(value) {
// 		req.flash("info", "Successfully Deleted");
// 		res.redirect("back");
// 	});
// };