var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var formidable = require('formidable');
var multiparty = require('multiparty'); 
var bodyParser = require('body-parser');
var fetch = require('node-fetch');
var jwt = require('jsonwebtoken');
const e = require('express');
var SECRET = 'nodescratch';

/**
 * Description: This function is developed for listing Form Master
 * Developer: Avijit Das
 */
exports.list = async function(req, res) {
  var token = req.session.token;
  var sessionStoreId = req.session.user.storeId;
  var role = req.session.role;

  jwt.verify(token, SECRET, function(err, decoded) {
    if (err) {
        req.flash("info", "Invalid Token");
        res.redirect('/auth/signin');
    } else {
        if(sessionStoreId==null){
            models.formMasters.findAll({
                attributes:['id','title','description']
            }).then(async function (formMaster) {
                if(formMaster){
                    return res.render('admin/formMasters/list', {
                        title: 'Form Master',
                        arrData: formMaster,
                        messages: req.flash('info'),
                        errors:req.flash('errors'),
                    }); 
                } else {
                    return res.render('admin/formMasters/list', {
                        title: 'Form Master',
                        arrData: '',
                        messages: req.flash('info'),
                        errors:req.flash('errors'),
                    }); 
                }
            }); 
        } else {
            //*****Premission Start
            var userPermission = false;
            if(role=='admin'){
                userPermission=true;
            }else{
                userPermission =!! req.session.permissions.find(permission=>{
                    return permission ==='FormMasterList'
                })
            }
            if(userPermission==false){
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            }else{
                models.formMasters.findAll({
                    attributes: ['id', 'title', 'description'],
                    where: {
                        storeId: sessionStoreId
                    }
                }).then(async function (formMaster) {
                    if (formMaster) {
                        return res.render('admin/formMasters/list', {
                            title: 'Form Master',
                            arrData: formMaster,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                        });
                    } else {
                        return res.render('admin/formMasters/list', {
                            title: 'Form Master',
                            arrData: '',
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                        });
                    }
                });
            }            
        }
    }
  });
};

/**
 * Description: This function is developed for view for Form Master
 * Developer: Avijit Das
 */
exports.view = async function(req, res){
    var id = req.params.id;
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            //*****Permission Start
            var userPermission = false;

            if(sessionStoreId==null){
                var stores = await models.stores.findAll({attributes:['id','storeName'],where:{status:'Yes'}});
                userPermission=true;
            } else {
                if(role=='admin'){
                    userPermission=true;
                }else{
                    userPermission =!! req.session.permissions.find(permission=>{
                        return permission ==='FormMasterView'
                    })
                }
                if(id){
                    var storeIdChecking = await models.formMasters.findOne({attributes:['storeId'],where:{id:id}});
                    if(storeIdChecking.storeId==sessionStoreId){
                        userPermission=true;
                    }else{
                        userPermission = false;
                    }
                }
                var stores = await models.stores.findAll({attributes:['id','storeName'],where:{id:sessionStoreId,status:'Yes'}});        
            }
            if(userPermission==false){
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            }else{
                if(!id){
                    return res.render('admin/formMasters/addedit',{
                        title: 'Add Form Master',
                        arrData:'',
                        stores: stores,
                        messages: req.flash('info'),
                        errors:req.flash('errors')
                    });
                } else {
                    models.formMasters.findOne({
                        attributes:['id','storeId','title','description','notifyEmailMessage','notifyEmailId','notifySmsMessage','notifyMobileNo','senderEmailMessage','senderSmsMessage'],
                        where:{
                            id:id
                        }
                    }).then(async function (formMaster) {
                        if(formMaster) {
                            return res.render('admin/formMasters/addedit',{
                                title: 'Edit Form Master',
                                arrData: formMaster,
                                stores: stores,
                                messages: req.flash('info'),
                                errors:req.flash('errors')
                            });
                        }
                    });
                }
            }
        }
    });
};

/**
 * Description: This function is developed for add/update New Form Master
 * Developer: Avijit Das
 */
exports.addOrUpdate = function(req, res){	
    var sessionUserId = req.session.user.id;
    var token= req.session.token;
    var role = req.session.role;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            //*****Permission Start
            var userPermission=false;
            if(sessionUserId==null){
                userPermission=true;
            }else{
                if(role=='admin'){
                    userPermission=true;
                }else{
                    userPermission =!! req.session.permissions.find(permission=>{
                        return permission ==='FormMasterAddEdit'
                    })
                }
            }
            if(userPermission==false){
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            }else{
                var form = new multiparty.Form();
                form.parse(req, function (err, fields, files) {
                    var id = fields.updatedId[0];
                    var title = fields.title[0];
                    var description = fields.description[0];
                    var notifyEmailMessage = fields.notifyEmailMessage[0];
                    var storeId = fields.storeId[0];
                    var notifyEmailId = fields.notifyEmailId[0];
                    var notifySmsMessage = fields.notifySmsMessage[0];
                    var notifyMobileNo = fields.notifyMobileNo[0];
                    var senderEmailMessage = fields.senderEmailMessage[0];
                    var senderSmsMessage = fields.senderSmsMessage[0];
                    if (!id) {
                        if (title != '') {
                            models.formMasters.create({
                                title: title,
                                storeId: storeId,
                                description: description,
                                notifyEmailMessage: notifyEmailMessage,
                                notifyEmailId: notifyEmailId,
                                notifySmsMessage: notifySmsMessage,
                                notifyMobileNo: notifyMobileNo,
                                senderEmailMessage: senderEmailMessage,
                                senderSmsMessage: senderSmsMessage,
                                createdBy: sessionUserId,
                            }).then(function (value) {
                                if (value) {
                                    req.flash('info', 'Successfully form master created');
                                    res.redirect('/admin/forMmasters/list');
                                } else {
                                    req.flash('errors', 'Something went wrong');
                                }
                            })
                                .catch(function (error) {
                                    req.flash('errors', 'Something went wrong');
                                });
                        }
                    } else {
                        models.formMasters.update({
                            title: title,
                            storeId: storeId,
                            description: description,
                            notifyEmailMessage: notifyEmailMessage,
                            notifyEmailId: notifyEmailId,
                            notifySmsMessage: notifySmsMessage,
                            notifyMobileNo: notifyMobileNo,
                            senderEmailMessage: senderEmailMessage,
                            senderSmsMessage: senderSmsMessage,
                            updatedBy: sessionUserId,
                        }, { where: { id: id } }).then(function (val) {
                            if (val) {
                                req.flash('info', 'Successfully form master updated');
                                res.redirect('/admin/forMmasters/list');
                            } else {
                                req.flash('errors', 'Something went wrong');
                            }
                        })
                            .catch(function (error) {
                                req.flash('errors', 'Something went wrong');
                            });
                    }
                });
            }            
         }
    }); 
}

/**
 * This function is developed for delete FormMaster
 * Developer: Avijit Das
 */
exports.delete = function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.storeId;
    var id = req.params.id;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if(err){
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else{
            //*****Permission start
            var userPermission=false;
            if(sessionStoreId==null){
                userPermission =true;
            }else{
                if(role=='admin'){
                    userPermission=true;
                }else{
                    userPermission =!!req.session.permissions.find(permission=>{
                        return permission ==='FormMasterDelete'
                    })
                }
                var storeIdChecking =await models.formMasters.findOne({attributes:['storeId'],where:{id:id}});
                if(storeIdChecking.storeId!=sessionStoreId){
                    userPermission=false;
                }
                if(userPermission==false){
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                }else{
                    models.formMasters.destroy({
                        where: { id: id }
                    }).then(function (value) {
                        if (value) {
                            req.flash('info', 'Successfully form master deleted');
                            res.redirect('back');
                        } else {
                            req.flash('errors', 'Something went wrong');
                            res.redirect('back');
                        }
                    });
                }
            }
      }
  });
}