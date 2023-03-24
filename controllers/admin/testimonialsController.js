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
const Sequelize = require("sequelize");
const Op = Sequelize.Op
/**
 * Description: This function is developed for listing brands
 * Developer:Avijit Das
 */
exports.list = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            if(sessionStoreId==null){
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                let column = req.query.column || 'id';
                let order = req.query.order || 'ASC';
                let pagesizes = req.query.pagesize || 10;
                let pageSize = parseInt(pagesizes);
                let page = req.params.page || 1;
                let search = req.query.search || '';

                let testimonials = await models.testimonials.findAll({ where: {
                    [Op.or]: [
                      { title: { [Op.like]: `%${search}%` } },
                      { image: { [Op.like]: `%${search}%` } },
                      { company: { [Op.like]: `%${search}%` } },
                      { designation: { [Op.like]: `%${search}%` } },
                      { description: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
                let listCount = await models.testimonials.count({where: {
                    [Op.or]: [
                        {title: { [Op.like]: `%${search}%` } },
                        { image: { [Op.like]: `%${search}%` } },
                        { company: { [Op.like]: `%${search}%` } },
                        { designation: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                  }});
                let pageCount = Math.ceil(listCount/pageSize);

                if(testimonials){
                    return res.render('admin/testimonials/list', {
                        title: 'Testimonials',
                        arrData: testimonials,
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
                        errors:req.flash('errors'),
                        helper: helper
                    }); 
                } else {
                    return res.render('admin/testimonials/list', {
                        title: 'Testimonials',
                        arrData: '',
                        storeList: '',
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors:req.flash('errors'),
                        helper: helper
                    }); 
                }
            } else {
                //*****Permission Assign Start
                var userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'TestimonialList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                    let column = req.query.column || 'id';
                    let order = req.query.order || 'ASC';
                    let pagesizes = req.query.pagesize || 10;
                    let pageSize = parseInt(pagesizes);
                    let page = req.params.page || 1;
                    let search = req.query.search || '';

                    let testimonials = await models.testimonials.findAll({ where: {storeId: sessionStoreId, [Op.or]: [
                          { title: { [Op.like]: `%${search}%` } },
                          { image: { [Op.like]: `%${search}%` } },
                          { company: { [Op.like]: `%${search}%` } },
                          { designation: { [Op.like]: `%${search}%` } },
                          { description: { [Op.like]: `%${search}%` } },
                          { status: { [Op.like]: `%${search}%` } }
                        ]
                      }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
                    let listCount = await models.testimonials.count({where: {storeId: sessionStoreId, [Op.or]: [
                            {title: { [Op.like]: `%${search}%` } },
                            { image: { [Op.like]: `%${search}%` } },
                            { company: { [Op.like]: `%${search}%` } },
                            { designation: { [Op.like]: `%${search}%` } },
                            { description: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                      }});
                    let pageCount = Math.ceil(listCount/pageSize);

                    if(testimonials){
                        return res.render('admin/testimonials/list', {
                            title: 'Testimonials',
                            arrData: testimonials,
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
                            errors:req.flash('errors'),
                            helper: helper
                        }); 
                    } else {
                        return res.render('admin/testimonials/list', {
                            title: 'Testimonials',
                            arrData: '',
                            storeList: '',
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors:req.flash('errors'),
                            helper: helper
                        }); 
                    }
                } 
            }
        }	
    });
}
/**
 * Description: This function is developed for view for brands
 * Developer:Avijit Das
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
                    return res.render('admin/testimonials/addedit', {
                        title: 'Add Testimonial',
                        arrData: '',
                        stores: stores,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                        helper: helper,
                    });
                } else {
                    var testimonials = await models.testimonials.findOne({ where: { id: id } });
                    if (testimonials) {
                        return res.render('admin/testimonials/addedit', {
                            title: 'Edit Testimonial',
                            arrData: testimonials,
                            stores: stores,
                            sessionStoreId: '',
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper: helper,
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
                        return permission === 'TestimonialView'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.testimonials.findOne({ attributes: ['storeId'], where: { id: id } });
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
                        return res.render('admin/testimonials/addedit', {
                            title: 'Add Testimonial',
                            arrData: '',
                            stores: stores,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper: helper,
                        });
                    } else {
                        var testimonials = await models.testimonials.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (testimonials) {
                            return res.render('admin/testimonials/addedit', {
                                title: 'Edit Testimonial',
                                arrData: testimonials,
                                stores: stores,
                                sessionStoreId: sessionStoreId,
                                messages: req.flash('info'),
                                errors: req.flash('errors'),
                                helper: helper,
                            });
                        }
                    }
                }
            }
        }
    });    
};
/**
 * Description: This function is developed for add/update New Labs
 * Developer:Avijit Das
 */
exports.addOrUpdate = function(req, res) {
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
            if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
                userPermission = true;
            } else {
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'TestimonialAddEdit'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                var form = new multiparty.Form();
                form.parse(req, function (err, fields, files) {
                    var id = fields.updateId[0];
                    if (!id) {
                        models.testimonials.create({
                            title: fields.title[0],
                            storeId: fields.storeId[0],
                            description: fields.description[0],
                            company: fields.company[0],
                            designation: fields.designation[0],
                            status: fields.status[0],
                            createdBy: sessionUserId
                        }).then(function (value) {
                            if (value) {
                                if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                                    var testimonialImage = Date.now() + files.image[0].originalFilename;
                                    var ImageExt = testimonialImage.split('.').pop();
                                    var testimonialImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                                    var finalTestimonialImage = testimonialImageWithEXT.replace("[object Object]", "");
                                    helper.createDirectory('public/admin/testimonials/' + value.id);
                                    var tempPath = files.image[0].path;
                                    var fileName = finalTestimonialImage;
                                    var targetPath = value.id + "/" + fileName;
                                    helper.uploadTestimonialsImageFiles(tempPath, targetPath);
                                }
                                models.testimonials.update({
                                    image: finalTestimonialImage
                                }, { where: { id: value.id } }).then(function (val) {
                                    if (val) {
                                        req.flash('info', 'Successfully testimonial created');
                                        return res.redirect('/admin/testimonials/list/1');
                                    }
                                }).catch(function (error) {
                                    req.flash('errors', 'Something went wrong');
                                });
                            } else {
                                req.flash('errors', 'Something went wrong');
                            }
                        }).catch(function (error) {
                            req.flash('errors', 'Something went wrong');
                        });
                    } else {
                        var testimonialsImage = models.testimonials.findOne({ attributes: ['image'], where: { id: id } });
                        if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                            var testimonialImage = Date.now() + files.image[0].originalFilename;
                            var ImageExt = testimonialImage.split('.').pop();
                            var testimonialImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                            var finalTestimonialsImage = testimonialImageWithEXT.replace("[object Object]", "");
                            helper.createDirectory('public/admin/testimonials/' + id);
                            var tempPath = files.image[0].path;
                            var fileName = finalTestimonialsImage;
                            var targetPath = id + "/" + fileName;
                            helper.uploadTestimonialsImageFiles(tempPath, targetPath);
                        }
                        var oldTestimonialImage = testimonialsImage.image;
                        models.testimonials.update({
                            title: fields.title[0],
                            storeId: fields.storeId[0],
                            description: fields.description[0],
                            company: fields.company[0],
                            designation: fields.designation[0],
                            status: fields.status[0],
                            updatedBy: sessionUserId,
                            image: finalTestimonialsImage != '' ? finalTestimonialsImage : oldTestimonialImage
                        }, { where: { id: id } }).then(function (value) {
                            if (value) {
                                req.flash('info', 'Successfully testimonial updated');
                                return res.redirect('/admin/testimonials/list/1');
                            } else {
                                req.flash('errors', 'Something went wrong');
                            }
                        }).catch(function (error) {
                            req.flash('errors', 'Something went wrong');
                        });
                    }
                });
            }
        }
    });
};
/**
 * This function is developed for delete Labs
 * Developer:Avijit Das
 */
exports.delete = function(req, res) {
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    var id = req.params.id;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if(err){
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            //*****Permission Assign Start
            var userPermission = false;
            if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
                userPermission = true;
            } else {
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'TestimonialDelete'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.testimonials.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.testimonials.destroy({
                    where: { id: id }
                }).then(function (value) {
                    if (value) {
                        req.flash('info', 'Successfully our lab deleted');
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