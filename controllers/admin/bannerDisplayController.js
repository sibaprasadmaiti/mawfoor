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
const Sequelize = require("sequelize");
const Op = Sequelize.Op


/**
 * This function is developed for listing banner display
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
                let bannerdisplayList = await models.bannerdisplay.findAll({ attributes: ['id', 'storeId', 'title', 'sequence', 'status'], where: {
                    [Op.or]: [
                      { title: { [Op.like]: `%${search}%` } },
                      { sequence: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.bannerdisplay.count({where: {
                    [Op.or]: [
                      { title: { [Op.like]: `%${search}%` } },
                      { sequence: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ]
                  }});

                let pageCount = Math.ceil(listCount/pageSize);
                if (bannerdisplayList) {
                    return res.render('admin/bannerdisplay/list', {
                        title: 'Banner Display List',
                        arrData: bannerdisplayList,
                        storeList: storeList,
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
                    return res.render('admin/bannerdisplay/list', {
                        title: 'Banner Display List',
                        arrData: '',
                        storeList: '',
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
                        return permission === 'BannerDisplayList'
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
                    let bannerdisplayList = await models.bannerdisplay.findAll({ attributes: ['id', 'storeId', 'title', 'sequence', 'status'],  order: [[column, order]], where: { storeId: sessionStoreId,  [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { sequence: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                      ] }, limit:pageSize, offset:(page-1)*pageSize });

                    let listCount = await models.bannerdisplay.count({where: { storeId: sessionStoreId,  [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { sequence: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                      ] } });
                      
                    let pageCount = Math.ceil(listCount/pageSize);
                    if (bannerdisplayList) {
                        return res.render('admin/bannerdisplay/list', {
                            title: 'Banner Display List',
                            arrData: bannerdisplayList,
                            storeList: storeList,
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
                        return res.render('admin/bannerdisplay/list', {
                            title: 'Banner Display List',
                            arrData: '',
                            storeList: '',
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
 * This function is developed for view banner display
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
                    return res.render('admin/bannerdisplay/addedit', {
                        title: 'Add Banner Display',
                        arrData: '',
                        stores: stores,
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var bannerdisplay = await models.bannerdisplay.findOne({ where: { id: id } });
                    if (bannerdisplay) {
                        return res.render('admin/bannerdisplay/addedit', {
                            title: 'Edit Banner Display',
                            arrData: bannerdisplay,
                            stores: stores,
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
                        return permission === 'BannerDisplayView'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.bannerdisplay.findOne({ attributes: ['storeId'], where: { id: id } });
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
                        return res.render('admin/bannerdisplay/addedit', {
                            title: 'Add Banner Display',
                            arrData: '',
                            stores: stores,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        var bannerdisplay = await models.bannerdisplay.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (bannerdisplay) {
                            return res.render('admin/bannerdisplay/addedit', {
                                title: 'Edit Banner Display',
                                arrData: bannerdisplay,
                                stores: stores,
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
 * This function is developed for add/update New banner display
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
                        return permission === 'BannerDisplayAddEdit'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                var form = new multiparty.Form();
                form.parse(req, function (err, fields, files) {
                    var id = fields.update_id[0];
                    var title = fields.title[0];
                    var sequence = fields.sequence[0];
                    var storeId = fields.storeId[0];
                    var status = fields.status[0];
                    if (!id) {
                        if (title != '' && storeId != '' && sequence != '' && status != '') {
                            models.bannerdisplay.create({
                                title: title,
                                sequence: sequence,
                                storeId: storeId,
                                status: status,
                                createdBy: sessionUserId
                            }).then(function (value) {
                                if (value) {
                                    req.flash('info', 'Successfully Banner Display created');
                                    return res.redirect('/admin/bannerDiaplay/list/1');
                                }
                            }).catch(function (error) {
                                console.log(error);
                                req.flash('errors', 'Somethings went wrong');
                            });
                        }else{
                            req.flash('errors', 'Please fill the required fields.')
                            return res.redirect('back')
                        }
                    } else {
                        if (title != '' && storeId != '' && sequence != '' && status != '') {
                        models.bannerdisplay.update({
                            title: title,
                            sequence: sequence,
                            storeId: storeId,
                            status: status,
                            updatedBy: sessionUserId
                        }, { where: { id: id } }).then(function (value) {
                            if (value) {
                                req.flash('info', 'Successfully Banner Display updated');
                                return res.redirect('/admin/bannerDiaplay/list/1');
                            }
                        }).catch(function (error) {
                            console.log(error);
                            req.flash('errors', 'Somethings went wrong');
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
 * This function is developed for delete banner display
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
                        return permission === 'BannerDisplayDelete'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.bannerdisplay.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.bannerdisplay.destroy({
                    where: { id: id }
                }).then(function (value) {
                    if (value) {
                        req.flash('info', 'Successfully  banner display deleted');
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