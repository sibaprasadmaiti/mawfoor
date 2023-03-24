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
var multer = require('multer');
var fs = require('fs');

/**
 * Description: This function is developed for deliveyTimeSlot listing 
 * Developer: Surajit Gouri
 */
 exports.list = async function(req, res){
    var id = req.params.id;
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var role = req.session.role;
    var token= req.session.token;
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
                    if (role == 'admin') {
                        userPermission = true;
                    } else {
                        userPermission = !!req.session.permissions.find(permission => {
                            return permission === 'FileUploadList'
                        })
                    }
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {

                var customerList = await models.customers.findAll({attributes:['id','firstName','lastName'],where:{status:'Yes'}});
                let fileUpload = await models.fileUploads.findAll({ attributes: ['id','customerId','image'] });
                    if(fileUpload){
                        return res.render('admin/fileUpload/list', {
                            title: 'File List',
                            arrData: fileUpload,
                            arrCustomer: customerList,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper: helper
                        }); 
                    } else {
                        return res.render('admin/fileUpload/list', {
                            title: 'File List',
                            arrData: '',
                            arrCustomer: customerList,
                            messages: req.flash('info'),
                            errors:req.flash('errors'),
                            helper: helper
                        }); 
                    }
                }
        }	
    });
}


/**
 * Description: This function is developed for view for banners
 * Developer:Surajit
 */
 exports.view = async function(req, res){
    var id = req.params.id;
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var role = req.session.role;
    var token= req.session.token;
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
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'FileUploadView'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {

                var customers = await models.customers.findAll({ attributes: ['id', 'firstName','lastName'], where: { status: 'Yes' } });

                if (!id) {
                    return res.render('admin/fileUpload/addedit', {
                        title: 'Add File',
                        arrData: '',
                        customers: customers,
                        helper: helper,
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                     models.fileUploads.findOne({
                        attributes: ['id','customerId','image'],
                        where: { id: id }
                    }).then(async function (fileUpload) {
                        if (fileUpload) {
                            return res.render('admin/fileUpload/addedit', {
                                title: 'Edit Banner',
                                arrData: fileUpload,
                                customers: customers,

                                helper: helper,
                                messages: req.flash('info'),
                                errors: req.flash('errors')
                            });
                        }
                    });
                }
            }          
        }
    });
};


/**
 * Description: This function is developed for add/update Banners
 * Developer:Surajit
 */

// //  exports.add = function(req, res) {
// //     var token= req.session.token;
// //     var sessionUserId = req.session.user.id;
// //     jwt.verify(token, SECRET, async function(err, decoded) {
// //         if (err) {
// //             req.flash("info", "Invalid Token");
// //             res.redirect('/auth/signin');
// //         } else { 
            
// //                     var storage = multer.diskStorage({
// //                         destination: function (req, file, callback){ 
// //                             var dir = "public/admin/multiplefiles"; 
// //                             if (!fs.existsSync(dir)){
// //                                 fs.mkdirSync(dir);
// //                             }
// //                             callback(null, dir);
// //                         },

// //                         filename: function (req, file,callback){
// //                             var imagename = `${Date.now()}-${file.originalname}`;
// //                             callback(null, imagename);
// //                             models.fileUpload.create({
// //                                 image: imagename,
// //                                 title: fields.title[0]
// //                             })
// //                         }
// //                     })

// //                     var upload = multer({ storage: storage}).array('files',10);
// //                     upload(req,res,function(err){
// //                         if(err){
// //                             req.flash('errors','Something went wrong');
// //                             res.redirect('back');
// //                         } else {
// //                             req.flash('info','Successfully Image uploaded');
// //                             res.redirect('back');
// //                         }
// //                     })
// //         }
// //     });
// // };

exports.add = function(req, res) {
    // var data = req.body;
    // return res.send(data);
    var id = req.params.id;
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var role = req.session.role;
    var token= req.session.token;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else { 
            //*****Permission Assign Start
            var userPermission = false;
            //*****If SupperAdmin Login
            if (req.session.permissions.length == 0 && req.session.role == ''  && sessionStoreId == null) {
                userPermission = true;
            } else {
                if (role == 'admin') {                    
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'FileUploadAddEdit'
                    })                    
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {

                    var storage = multer.diskStorage({
                        destination: function (req, file, callback){ 
                            var dir = "public/admin/multiplefiles"; 
                            if (!fs.existsSync(dir)){
                                fs.mkdirSync(dir);
                            }
                            callback(null, dir);
                        },

                        filename: function (req, file,callback){
                            var imagename = `${Date.now()}-${file.originalname}`;
                            callback(null, imagename);
                            models.fileUploads.create({
                                customerId: req.body.customerId,
                                image: imagename
                            })
                        }  
                    })

                   var upload = multer({ storage: storage}).array('files',10);

                    upload(req,res,function(err){
                        if(err){
                            req.flash('errors','Something went wrong');
                            res.redirect('back');
                        } else {
                            req.flash('info','Successfully Image uploaded');
                            return res.redirect('/admin/fileUpload/list');
                        }
                    })
            }
        }
    });
};



/**
 * This function is developed for delete bannres
 * Developer:Surajit
 */
exports.delete = function(req, res) {
    
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    var token= req.session.token;
   
    jwt.verify(token, SECRET, async function(err, decoded) {
        if(err){
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {

            var id = req.params.id;
            var whereCondition='';
            //*****Permission Assign Start
            var userPermission = false;
            //*****If SupperAdmin Login
            if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
                userPermission = true;
                whereCondition ={id:id};
            } else {
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'StoreView'
                    })
                }
                var storeIdChecking = await models.brands.findOne({attributes:['storeId'],where:{id:id}});
                if (storeIdChecking.storeId != sessionStoreId){
                    userPermission = false;
                }else{
                    whereCondition = { storeId: sessionStoreId,id: id };
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                
                models.fileUploads.destroy({
                    where:{id:id}
                }).then(function (value) {
                    if (value) {
                        req.flash('info', 'Successfully File deleted');
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


