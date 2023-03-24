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

/**
 * Description: This function is developed for listing role
 * Developer: Avijit Das
 */
exports.list = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var role = req.session.role;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            
            //*****Permission Assign Start
            var userPermission = false;
            //*****If SupperAdmin Login
            if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
                userPermission = true;
                var adminDetails = await sequelize.query("SELECT a.id,a.email,a.adminName,a.mobile,a.status,r.name,s.storeName FROM `admins` a LEFT JOIN modelHasRoles mhr ON mhr.userId = a.id LEFT JOIN roles r ON r.id = mhr.roleId LEFT JOIN stores s ON s.id = a.storeId", { type: Sequelize.QueryTypes.SELECT });
            } else {
                var whereCondition = '';
                if (role == 'admin') {
                    userPermission = true;
                    //whereCondition = { storeId: sessionStoreId };
                    var adminDetails = await sequelize.query("SELECT a.id,a.email,a.adminName,a.mobile,a.status,r.name,s.storeName FROM `admins` a LEFT JOIN modelHasRoles mhr ON mhr.userId = a.id LEFT JOIN roles r ON r.id = mhr.roleId LEFT JOIN stores s ON s.id = a.storeId where a.storeId=" + sessionStoreId, { type: Sequelize.QueryTypes.SELECT });
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'AdminUserList'
                    })
                    if (userPermission==true){
                        var arrayId = [];
                        await models.admins.findAll({ attributes: ['id'], where: { parentId: sessionUserId } })
                            .then(async function (admins) {
                                if (admins) {
                                    for (var i = 0; i < admins.length; i++) {
                                        arrayId.push(admins[i].id);
                                    }
                                }
                            });
                        arrayId.push(sessionUserId);
                        whereCondition = { storeId: sessionStoreId, id: { $in: arrayId } };
                        var adminDetails = await sequelize.query("SELECT a.id,a.email,a.adminName,a.mobile,a.status,r.name,s.storeName FROM `admins` a LEFT JOIN modelHasRoles mhr ON mhr.userId = a.id LEFT JOIN roles r ON r.id = mhr.roleId LEFT JOIN stores s ON s.id = a.storeId where a.storeId=" + sessionStoreId + " and a.id in (" + arrayId+")", { type: Sequelize.QueryTypes.SELECT });
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                //var adminIds = await sequelize.query("SELECT a.userName, r.name FROM `admins` a LEFT JOIN modelHasRoles mhr ON mhr.userId = a.id LEFT JOIN roles r ON r.id = mhr.roleId where a.storeId = " + sessionStoreId, { type: Sequelize.QueryTypes.SELECT });
                //console.log(adminDetails);return false;
                
                if (adminDetails) {
                        return res.render('admin/adminUser/list', {
                            title: 'Admin User',
                            arrData: adminDetails,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper: helper
                        });
                    } else {
                        return res.render('admin/adminUser/list', {
                            title: 'Admin User',
                            arrData: '',
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper: helper
                        });
                    }
            }
        }	
    });
}

/**
 * Description: This function is developed for view for Role
 * Developer: Avijit Das
 */
exports.view = async function(req, res){
    var id = req.params.id;
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
                if (id) {
                    whereCondition = { id:id };
                }
            } else {
                //var whereCondition = '';
                if (id) {
                    var accessCount = await models.admins.count({ where: { id: id, storeId: sessionStoreId}});
                    if (accessCount==0){
                        req.flash('errors', 'Contact Your administrator for permission');
                        res.redirect('/admin/dashboard');
                    }
                    whereCondition = { storeId: sessionStoreId, id: id };
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
                if(!id){
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

exports.getRoleStoreWise = async function (req, res) {
    var storeId = req.body.storeId;
    var sessionStoreId = req.session.user.storeId;
    if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
        storeId = req.body.storeId;
    } else {
        storeId = sessionStoreId;
    }
    var roles = await models.roles.findAll({ attributes: ['id', 'name'], where: { storeId: storeId } });
    var arrayDataRole = [];
    for (var i = 0; i < roles.length; i++) {
        var subDataRole = { 'id': roles[i].id, 'name': roles[i].name };
        arrayDataRole.push(subDataRole);
    }
    var adminDetails = await models.admins.findAll({ attributes: ['id', 'adminName'], where: { storeId: storeId } });
    var arrayDataAdmin = [];
    for (var i = 0; i < adminDetails.length; i++) {
        var subDataAdmin = { 'id': adminDetails[i].id, 'adminName': adminDetails[i].adminName };
        arrayDataAdmin.push(subDataAdmin);
    }
    var mainArray = { 'roles': arrayDataRole, 'admins': arrayDataAdmin};
    return res.json(mainArray);
}
/**
 * Description: This function is developed for add/update New role
 * Developer: Avijit Das
 */
exports.addOrUpdate = function(req, res) {
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var role = req.session.role;
    var hash = '';
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            //*****Permission Assign Start
            var userPermission = false;
            //*****If SupperAdmin Login
            if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
                userPermission = true;
            } else {
                //*****If Another Stores Login
                if (role == 'admin') {
                    userPermission = true;
                    whereCondition = { storeId: sessionStoreId };
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'AdminUserAddEdit'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            }else{
                var form = new multiparty.Form();
                form.parse(req, async function (err, fields, files) {
                    var email = fields.email[0];
                    var mobile = fields.mobile[0];
                    if (sessionStoreId == null) {
                        sessionStoreId = fields.store[0];
                    }
                    //*****Email and Mobile No wise Current Store Unique Checking
                    var uniqueMobileEmail = await models.admins.count({ where: { /*storeId: sessionStoreId, */ id: { $ne: id }, $or: [{ email: email }, { mobile: mobile }] } });
                    //*****If Super Admin login then Which Store now select this become sessionStoreId                    
                    var id = fields.updateId[0];
                    if (!id) {
                        if (uniqueMobileEmail == 0) {
                            //*****Password Field Blank and Has Convert Start
                            if (fields.password[0] != fields.confirmPassword[0]) {
                                req.flash('errors', 'Password Not Match');
                                res.redirect('back');
                            }
                            hash = bcrypt.hashSync(fields.password[0]);
                            //*****Password Field Blank and Has Convert End
                            //*****Admin User Insert Start
                            models.admins.create({
                                storeId: sessionStoreId,
                                // parentId: fields.assignTo == undefined ? null : fields.assignTo[0],
                                parentId: fields.assignTo ? fields.assignTo[0] : null,
                                username: fields.email[0],
                                password: hash,
                                adminName: fields.adminName[0],
                                email: fields.email[0],
                                mobile: fields.mobile[0],
                                address: fields.address[0],
                                status: fields.status[0],
                                createdBy: sessionUserId,
                            }).then(function (value) {
                                if (value) {
                                    //*****Assign Role
                                    models.modelHasRoles.create({
                                        storeId: sessionStoreId,
                                        roleId: fields.role[0],
                                        userId: value.id,
                                        createdBy: sessionUserId
                                    }).then(function (assignRole) {
                                        if (assignRole) {
                                            req.flash('info', 'Successfully roles created');
                                            return res.redirect('/admin/adminUser');
                                        }
                                    })
                                } else {
                                    req.flash('errors', 'Something went wrong');
                                    res.redirect('back');
                                }
                            }).catch(function (error) {
                                req.flash('errors', 'Something went wrong');
                                res.redirect('back');
                            });
                        } else {
                            req.flash('errors', 'Email Id or Mobile already exist');
                            res.redirect('back');
                        }
                    } else {
                        //*****Email and Mobile Unique Checking
                        var uniqueMobileEmail = await models.admins.count({ where: { /*storeId: sessionStoreId, */id: { $ne: id }, $or: [{ email: fields.email }, { mobile: fields.mobile }] } });
                        if (uniqueMobileEmail == 0) {
                            //*****Password Field Blank and Has Convert Start
                            if (fields.password[0] != '' || fields.confirmPassword[0]!=''){
                                if (fields.password[0] != fields.confirmPassword[0]) {
                                    req.flash('errors', 'Password Not Match');
                                    res.redirect('back');
                                }else{
                                    hash = bcrypt.hashSync(fields.password[0]);
                                }
                            }else{
                                var adminPassWordCheck = await models.admins.findOne({ attributes: ['password'], where: { id: id } });
                                hash = adminPassWordCheck.password;
                            }
                            //*****Password Field Blank and Has Convert End
                            //*****Admin User Update Start
                            models.admins.update({
                                storeId: sessionStoreId,
                                // parentId: fields.assignTo[0] == undefined ? null : fields.assignTo[0],
                                parentId: fields.assignTo ? fields.assignTo[0] : null,
                                username: fields.email[0],
                                password: hash,
                                adminName: fields.adminName[0],
                                email: fields.email[0],
                                mobile: fields.mobile[0],
                                address: fields.address[0],
                                status: fields.status[0],
                                updatedBy: sessionUserId
                            }, { where: { id: id } }).then(function (value) {
                                if (value) {
                                    //*****Model Has Role Table Destroy Start
                                    models.modelHasRoles.destroy({ where: { userId: id } }).then(function (dst) {
                                        if (dst) {
                                            //*****Assign Role
                                            models.modelHasRoles.create({
                                                storeId: sessionStoreId,
                                                roleId: fields.role[0],
                                                userId: id,
                                                createdBy: sessionUserId
                                            }).then(function (assignRole) {
                                                if (assignRole) {
                                                    req.flash('info', 'Successfully user updated');
                                                    return res.redirect('/admin/adminUser');
                                                }
                                            })
                                        } else {
                                            //*****Assign Role
                                            models.modelHasRoles.create({
                                                storeId: sessionStoreId,
                                                roleId: fields.role[0],
                                                userId: id,
                                                createdBy: sessionUserId
                                            }).then(function (assignRole) {
                                                if (assignRole) {
                                                    req.flash('info', 'Successfully user updated');
                                                    return res.redirect('/admin/adminUser');
                                                }
                                            })
                                        }
                                    })
                                    req.flash('info', 'Successfully user updated');
                                    return res.redirect('/admin/adminUser');
                                } else {
                                    req.flash('errors', 'Something went wrong');
                                }
                            }).catch(function (error) {
                                req.flash('errors', 'Something went wrong');
                            });
                        } else {
                            req.flash('errors', 'Email Id or Mobile already exist');
                            return res.redirect('/admin/adminUser');
                        }
                    }
                });
            }                
        }
    });
};

/**
 * This function is developed for delete role
 * Developer: Avijit Das
 */
exports.delete = function(req, res) {
    var token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var role = req.session.role;
    var id = req.params.id;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if(err){
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            //*****Permission Assign Start
            var userPermission = false;
            //*****If SupperAdmin Login
            if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
                userPermission = true;
            } else {
                //*****If Another Stores Login

                if (role == 'admin') {
                    models.admins.findOne({
                        attributes: ['storeId'], where: { id: id }
                    }).then(async function (admin) {
                        if (admin.length == 1) {
                            if (admin.storeId == sessionStoreId) {
                                userPermission = true;
                            }
                        } else {
                            userPermission = false;
                        }
                    });
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'AdminUserDelete'
                    })
                    models.admins.findOne({attributes:['id'],where:{id:id}
                    }).then(async function(admin){
                        if (admin.length==1){
                            if (admin.id==id){
                                userPermission = true;
                            }
                        }else{
                            userPermission = false;
                        }
                    });

                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                //*****User wise role allocate delete
                models.modelHasRoles.destroy({
                    where: { userId: id }
                }).then(function (destroyModelHasRoles) {
                    if (destroyModelHasRoles) {
                        //*****Admin delete
                        models.admins.destroy({
                            where: { id: id }
                        }).then(function (destroyAdmin) {
                            if (destroyAdmin) {
                                req.flash('info', 'Successfully deleted');
                                res.redirect('back');
                            }
                        })
                    }
                })
            }
        }
    });
};