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


/**
 * Description: This function is developed for listing role
 * Developer: Avijit Das
 */
exports.list = async function(req, res){
    var token= req.session.token;
    var storeId = req.session.user.storeId;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            var whereCondition='';
            //*****Permission Assign Start
            var userPermission=false;
            //*****If SupperAdmin Login
            if (req.session.permissions.length == 0 && req.session.role == '') {
                userPermission = true;                
            }else{
                userPermission = !! req.session.permissions.find(permission => { 
                    return permission === 'RoleList'
                })
                whereCondition = { storeId: storeId };
            }
            if(userPermission==false){
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            }else{
            //*****Permission Assign End                
               /*if (storeId==''){
                    models.roles.findAll({
                        attributes: ['id','storeId','name','slug','description','status'],
                    }).then(async function (roles) {
                        if(roles){
                            return res.render('admin/role/list', {
                                title: 'Roles',
                                arrData: roles,
                                messages: req.flash('info'),
                                errors:req.flash('errors'),
                                helper: helper
                            }); 
                        } else {
                            return res.render('admin/role/list', {
                                title: 'Roles',
                                arrData: '',
                                messages: req.flash('info'),
                                errors:req.flash('errors'),
                                helper: helper
                            }); 
                        }
                    }); 
                } else {*/
                    models.roles.findAll({
                        attributes: ['id','storeId','name','slug','description','status'],
                        where: whereCondition,
                        include: [{
                            model: models.stores,
                            attributes: ['storeName'],
                            required: false,
                        }]
                    }).then(async function (roles) {
                        if(roles){
                            return res.render('admin/role/list', {
                                title: 'Roles',
                                arrData: roles,
                                messages: req.flash('info'),
                                errors:req.flash('errors'),
                                helper: helper
                            }); 
                        } else {
                            return res.render('admin/role/list', {
                                title: 'Roles',
                                arrData: '',
                                messages: req.flash('info'),
                                errors:req.flash('errors'),
                                helper: helper
                            }); 
                        }
                    }); 
                //}
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
    var storeId = req.session.user.storeId;
    var role = req.session.role;
    var stores ='';

    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            var permissions = await models.permissions.findAll({ attributes: ['id', 'name'] });
            var whereCondition = '';
            //*****Permission Assign Start
            var userPermission = false;
            //*****If SupperAdmin Login
            if(id){
                var editRoleStoredId = await models.roles.findOne({ attributes: ['storeId'], where: { id: id } });
            }            
            //console.log(editRoleStoredId);return false;
            if (req.session.permissions.length == 0 && req.session.role == '') {
                userPermission = true;
                stores = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                if (id){
                    whereCondition = {
                        id: id
                    };                    
                    roleHasPermissions = await models.roleHasPermissions.findAll({
                        attributes: ['permissionId'],
                        where: {
                            storeId: editRoleStoredId['storeId'],
                            roleId: id,
                        }
                    });
                }
            } else {
                //*****If User Login
                whereCondition = { id: storeId };
                
                if (id) {
                    stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: editRoleStoredId['storeId'] } });
                    if (editRoleStoredId['storeId'] == storeId){
                        if (role=='admin'){                            
                            userPermission = true;
                        }else{
                            userPermission = !!req.session.permissions.find(permission => {
                                return permission === 'RoleAddEdit'
                            })
                        }
                        
                        var roleHasPermissions = await models.roleHasPermissions.findAll({
                            attributes: ['permissionId'],
                            where: {
                                storeId: storeId,
                                roleId: id,
                            }
                        });
                    }else{
                        req.flash('errors', 'Contact Your administrator for permission');
                        res.redirect('/admin/dashboard');
                    }
                }else{
                    if (role == 'admin') {
                        userPermission = true;
                    } else {
                        userPermission = !!req.session.permissions.find(permission => {
                            return permission === 'RoleAddEdit'
                        })
                    }
                }
            } //console.log(stores);return false;
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
            //*****Permission Assign End                
                if(!id){
                    return res.render('admin/role/addedit',{
                        title: 'Add Roles',
                        arrData:'',
                        permissions: permissions,
                        roleHasPermissions: '',
                        stores: stores,
                        helper: helper,
                        messages: req.flash('info'),
                        errors:req.flash('errors')
                    });
                } else {
                    models.roles.findOne({
                        attributes: ['id','storeId','name','slug','description','status'],
                        where: {
                            id:id
                        }
                    }).then(async function (roles) {
                        if(roles) {
                            return res.render('admin/role/addedit',{
                                title: 'Edit Roles',
                                arrData: roles,
                                permissions: permissions,
                                roleHasPermissions: roleHasPermissions,
                                stores: stores,
                                helper: helper,
                                messages: req.flash('info'),
                                errors:req.flash('errors')
                            });
                        }else{
                            req.flash('errors', 'Contact Your administrator for permission');
                            res.redirect('/admin/dashboard');
                        }
                    });
                }
            }
        }
    });
};
/**
 * Description: This function is developed for add/update New role
 * Developer: Avijit Das
 */
exports.addOrUpdate = function(req, res) {
    var token= req.session.token;
    var storeId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var role = req.session.role;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {

            var whereCondition = '';
            //*****Permission Assign Start
            var userPermission = false;
            //*****If SupperAdmin Login
            if (req.session.permissions.length == 0 && req.session.role == '') {//console.log('asd');return false;
                userPermission = true;
            } else {
                if (role == 'admin') {                    
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'RoleAddEdit'
                    })                    
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                //if(role=='Admin'){
                    var form = new multiparty.Form();
                    form.parse(req, async function(err, fields, files) {
                        var id = fields.updateId[0];
                        if (storeId == null){
                            if (fields.storeId[0] == ''){
                                storeId == null;
                            }else{
                                storeId = fields.storeId[0];
                            }
                        }else{
                            storeId = fields.storeId[0];
                        }
                        //storeId == null ? fields.storeId[0] == '' ? null : fields.storeId[0] : storeId;
                        //console.log(storeId);return false;
                        if(!id){
                            var roleNameChecking = await models.roles.count({ where: { name: fields.name[0], storeId: storeId}});
                            if (roleNameChecking==0){
                                models.roles.create({
                                    name: fields.name[0],
                                    storeId: storeId,
                                    slug: fields.slug[0],
                                    description: fields.description[0],                                
                                    status: fields.status[0],
                                    createdBy: sessionUserId
                                }).then(function(value) {
                                    if(value) {
                                        //*****Assign Of Permission of Role
                                        if (fields.permission.length>0){
                                            for(var i=0;i<fields.permission.length;i++){
                                                models.roleHasPermissions.create({
                                                    storeId: storeId,
                                                    permissionId: fields.permission[i],
                                                    roleId: value.id,
                                                    createdBy: sessionUserId
                                                });
                                            }
                                        }
                                        req.flash('info','Successfully roles created');
                                        return res.redirect('/admin/roles');
                                    } else {
                                        req.flash('errors','Something went wrong');
                                    }
                                }).catch(function(error) {
                                    req.flash('errors','Something went wrong');
                                });
                            }else{
                                req.flash('errors', 'Role Name Already Exist');
                                res.redirect('back');
                            }
                        } else{
                            var roleNameChecking = await models.roles.count({ where: { name: fields.name[0], storeId: storeId, id: { $ne: id } } });
                            //console.log(roleNameChecking);return false;
                            if (roleNameChecking == 0) {                                
                                models.roles.update({
                                    name: fields.name[0],
                                    storeId: storeId,
                                    slug: fields.slug[0],
                                    description: fields.description[0],
                                    status: fields.status[0],
                                    updatedBy: sessionUserId
                                },{where:{id:id}}).then(function(value) {
                                    if(value) {
                                        models.roleHasPermissions.destroy({ where: { roleId: id, storeId: storeId}}).then(function(dst){
                                            if(dst){
                                                //*****Assign Of Permission of Role
                                                for(var i=0;i<fields.permission.length;i++){
                                                    models.roleHasPermissions.create({
                                                        storeId: storeId,
                                                        permissionId: fields.permission[i],
                                                        roleId: id,
                                                        createdBy: sessionUserId
                                                    });
                                                }
                                            }else{
                                                //*****Assign Of Permission of Role
                                                for(var i=0;i<fields.permission.length;i++){
                                                    models.roleHasPermissions.create({
                                                        storeId: storeId,
                                                        permissionId: fields.permission[i],
                                                        roleId: id,
                                                        createdBy: sessionUserId
                                                    });
                                                }
                                            }
                                        })
                                        req.flash('info','Successfully roles updated');
                                        return res.redirect('/admin/roles');
                                    } else {
                                        req.flash('errors','Something went wrong');
                                    }
                                }).catch(function(error) {
                                    req.flash('errors','Something went wrong');
                                });
                            } else {
                                req.flash('errors', 'Role Name Already Exist');
                                res.redirect('back');
                            }
                        }
                    });
                /*}else{
                    res.redirect('/admin/dashboard');
                }*/
            }
        }
    });
};


/**
 * This function is developed for delete role
 * Developer: Avijit Das
 */
exports.delete = function(req, res) {
    var token= req.session.token;
    var storeId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var role = req.session.role;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if(err){
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            var id = req.params.id;

            var whereCondition = '';
            //*****Permission Assign Start
            var userPermission = false;
            //*****If SupperAdmin Login
            if (req.session.permissions.length == 0 && req.session.role == '' && storeId==null) {
                userPermission = true;
                whereCondition = { id: id };
            } else {
                var editRoleStoredId = await models.roles.findOne({ attributes: ['storeId'], where: { id: id } });
                if (editRoleStoredId.storeId == storeId) {
                    if (role == admin) {
                        userPermission = true;
                    }else{
                        userPermission = !!req.session.permissions.find(permission => {
                            return permission === 'RoleDelete'
                        })
                    }
                    whereCondition = { storeId: storeId, id: id };
                }
                
            }
            if (userPermission==true){                
                models.roles.destroy({ 
                    where: whereCondition
                }).then(function(value) {
                    if(value) {
                        req.flash('info','Successfully role deleted');
                        res.redirect('back');
                    } else {
                        req.flash('errors','Something went wrong');
                        res.redirect('back');
                    }
                });
            }else{
                req.flash('errors','Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            }
        }
    });
};