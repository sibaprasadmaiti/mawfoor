var models = require('../../models');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var formidable = require('formidable');
var multiparty = require('multiparty'); 
var bodyParser = require('body-parser');
var fetch = require('node-fetch');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
const paginate = require('express-paginate');
var helper = require('../../helpers/helper_functions');
const { and } = require('sequelize');
const { chownSync } = require('fs');
const { json } = require('body-parser');
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

exports.view = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var fullPermission = false;
    var role = req.session.role;
    /*var roles = await models.roles.findAll({attributes:['id','name'],
        where:{
            storeId: sessionStoreId,
            status: 'Yes',
        }
    });*/
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            var whereCondition = '';
            //*****Permission Assign Start
            var userPermission = false;
            //*****If SupperAdmin Login
            if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
                userPermission = true;
                fullPermission = true;
                var roles = await models.roles.findAll({
                    attributes: ['id', 'name'],
                    where: {
                        status: 'Yes',
                    },
                    include:[{
                        model: models.stores,
                        attributes: ['id','storeCode'],
                        required:false,
                    }]
                });
                var stores = await models.stores.findAll({ attributes: ['id','storeName'],where:{'status':'Yes'}});
                if (sessionStoreId) {
                    whereCondition = { storeId: sessionStoreId };
                }
            } else {
                //var whereCondition = '';
                if (sessionStoreId) {
                    var accessCount = await models.admins.count({ where: {storeId: sessionStoreId}});
                    if (accessCount==0){
                        req.flash('errors', 'Contact Your administrator for permission');
                        res.redirect('/admin/dashboard');
                    }
                    whereCondition = { storeId: sessionStoreId};
                }
                if (role == 'admin') {
                    userPermission = true;
                    //whereCondition = { storeId: sessionStoreId };
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'AdminUserList'
                    })
                }
                if (userPermission == true) {
                    //whereCondition = { storeId: sessionStoreId, id: id };
                    var roles = await models.roles.findAll({
                        attributes: ['id', 'name'],
                        where: {
                            storeId: sessionStoreId,
                            status: 'Yes',
                        }
                    });
                    var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { 'status': 'Yes', id: sessionStoreId } });
                }
            }
            if(userPermission==false){
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            }else{
                if(!sessionStoreId){
                    var assignTo = await models.admins.findAll({ attributes: ['id', 'adminName'], where: { status: 'active', storeId: sessionStoreId}});
                    return res.render('admin/adminUser/addedit',{
                        title: 'Add Admin User',
                        arrData:'',
                        fullPermission: fullPermission,
                        roles: roles,
                        stores: stores,
                        assignTo: assignTo,
                        helper: helper,
                        messages: req.flash('info'),
                        errors:req.flash('errors')
                    });
                } else {
                    var assignTo = await models.admins.findAll({ attributes: ['id', 'adminName'], where: { status: 'active', storeId: sessionStoreId}});
                    
                    models.modelHasRoles.findOne({attributes:['roleId'],
                        include:[{
                            model:models.admins,
                            attributes:['id','storeId','parentId','email','adminName','mobile','address','image','status'],
                            where:whereCondition
                        },{
                            model:models.roles,
                            attributes:['name'],
                            required:false,
                    }]
                    }).then(async function (admins) {
                        if (admins) {
                            console.log(roles);
                            return res.render('admin/adminUser/addedit',{
                                title: 'Edit Admin User',
                                arrData: admins,
                                fullPermission: fullPermission,
                                roles: roles,
                                stores: stores,
                                assignTo: assignTo,
                                helper: helper,
                                messages: req.flash('info'),
                                errors:req.flash('errors')
                            });
                        }else{
                            models.admins.findOne({
                                attributes: ['id', 'storeId', 'parentId', 'email', 'adminName', 'mobile', 'address', 'image', 'status'],
                                where: whereCondition
                            }).then(async function (admins) {
                                //console.log(admins);
                                return res.render('admin/adminUser/addedit', {
                                    title: 'Edit Admin User',
                                    arrData: admins,
                                    fullPermission: fullPermission,
                                    roles: roles,
                                    stores: stores,
                                    assignTo: assignTo,
                                    helper: helper,
                                    messages: req.flash('info'),
                                    errors: req.flash('errors')
                                });
                            })                            
                        }
                    });
                }
            }
        }
    });
};
