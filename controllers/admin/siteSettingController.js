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
 * This function is developed for listing siteSettings
 * Developer: Avijit Das
 */
exports.list = async function(req, res){
    let token= req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
    let column = req.query.column || 'id';
    let order = req.query.order || 'ASC';
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
                let siteSettingsList = await models.siteSettings.findAll({where: {
                    [Op.or]: [
                      { title: { [Op.like]: `%${search}%` } },
                      { value: { [Op.like]: `%${search}%` } },
                      { isSystem: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.siteSettings.count({where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { value: { [Op.like]: `%${search}%` } },
                        { isSystem: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                  }});

                let pageCount = Math.ceil(listCount/pageSize);

                if (siteSettingsList) {
                    return res.render('admin/sitesettings/list', {
                        title: 'Site Settings',
                        storeList: storeList,
                        arrData: siteSettingsList,
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
                    return res.render('admin/sitesettings/list', {
                        title: 'Site Settings',
                        arrData: '',
                        storeList: storeList,
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
                        return permission === 'SiteSettingsList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId } });
                    let siteSettingsList = await models.siteSettings.findAll({where: {storeId: sessionStoreId,
                        [Op.or]: [
                          { title: { [Op.like]: `%${search}%` } },
                          { value: { [Op.like]: `%${search}%` } },
                          { isSystem: { [Op.like]: `%${search}%` } },
                          { status: { [Op.like]: `%${search}%` } }
                        ]
                      }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
    
                    let listCount = await models.siteSettings.count({where: {storeId: sessionStoreId,
                        [Op.or]: [
                            { title: { [Op.like]: `%${search}%` } },
                            { value: { [Op.like]: `%${search}%` } },
                            { isSystem: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                      }});
    
                    let pageCount = Math.ceil(listCount/pageSize);

                    if (siteSettingsList) {
                        return res.render('admin/sitesettings/list', {
                            title: 'Site Settings',
                            arrData: siteSettingsList,
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
                        return res.render('admin/sitesettings/list', {
                            title: 'Site Settings',
                            arrData: '',
                            storeList: storeList,
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
 * This function is developed for view siteSettings
 * Developer: Avijit Das
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
                var groupTitle = await models.siteSettingsGroups.findAll({ attributes: ['id', 'groupTitle'], where: { status: 'Yes' } });
                if (!id) {
                    return res.render('admin/sitesettings/addedit', {
                        title: 'Add Settings',
                        arrData: '',
                        stores: stores,
                        groups: groupTitle,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var siteSettingsList = await models.siteSettings.findOne({ where: { id: id } });
                    if (siteSettingsList) {
                        return res.render('admin/sitesettings/addedit', {
                            title: 'Edit Settings',
                            arrData: siteSettingsList,
                            stores: stores,
                            groups: groupTitle,
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
                        return permission === 'SiteSettingsView'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.siteSettings.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId, status: 'Yes' } });
                    var groupTitle = await models.siteSettingsGroups.findAll({ attributes: ['id', 'groupTitle'], where: { storeId:sessionStoreId,status: 'Yes' } });
                    if (!id) {
                        return res.render('admin/sitesettings/addedit', {
                            title: 'Add Settings',
                            arrData: '',
                            stores: stores,
                            groups: groupTitle,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        var siteSettingsList = await models.siteSettings.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (siteSettingsList) {
                            return res.render('admin/sitesettings/addedit', {
                                title: 'Edit Settings',
                                arrData: siteSettingsList,
                                stores: stores,
                                groups: groupTitle,
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
 * This function is developed for add/update New siteSettings
 * Developer: Avijit Das
 */
exports.addOrUpdate = function(req, res, next) {
    var token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaa");
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
                        return permission === 'SiteSettingsAddEdit'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                var form = new multiparty.Form();
                form.parse(req, function (err, fields, files) {
                    console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
                    var id = fields.update_id[0];
                    var storeId = fields.storeId[0];
                    var siteSettingsgroupId = fields.groupId[0];
                    var title = fields.title[0];
                    var label = fields.label[0];
                    var sValue = fields.sValue[0];
                    // var siteName = fields.siteName[0];
                    // var tagline = fields.tagline[0];
                    // var email = fields.email[0];
                    // var mobileNo = fields.mobileNo[0];
                    // var appVersion = fields.appVersion[0];
                    // var fax = fields.fax[0];
                    // var siteUrl = fields.siteUrl[0];
                    // var address = fields.address[0];
                    // var siteDescription = fields.siteDescription[0];
                    // var feature = fields.feature[0];
                    // var shippingCharges = fields.shippingCharges[0];
                    // var freeShippingLimit =fields.freeShippingLimit[0];
                    // var facebook = fields.facebook[0];
                    // var twitter = fields.twitter[0];
                    // var linkedin = fields.linkedin[0];
                    // var instagram = fields.instagram[0];
                    // var latitude = fields.latitude[0];
                    // var longitude = fields.longitude[0];
                    // var googleUrl = fields.googleUrl[0];
                    var sequence = fields.seq[0];
                    var isSystem = fields.isSystem[0];
                    var status = fields.status[0];
                    if (!id) {
                        console.log("cccccccccccccccccccccccc");
                        if (title != '' && storeId != '' && siteSettingsgroupId != ' ' && sequence != '' && sValue != '') {
                            models.siteSettings.create({
                                storeId: storeId,
                                siteSettingsGroupId: siteSettingsgroupId,
                                title: title,
                                label: label,
                                value: sValue,
                                // siteName:siteName,
                                // tagline : tagline,
                                // email : email,
                                // mobileNo: mobileNo,
                                // appVersion: appVersion,
                                // fax: fax,
                                // siteUrl : siteUrl,
                                // address: address,
                                // siteDescription : siteDescription,
                                // feature: feature,
                                // shippingCharges: shippingCharges,
                                // freeShippingLimit: freeShippingLimit,
                                // facebook: facebook,
                                // twitter: twitter,
                                // linkedin: linkedin,
                                // instagram: instagram,
                                // latitude: latitude,
                                // longitude: longitude,
                                // googleUrl: googleUrl,
                                sequence: sequence,
                                isSystem: isSystem,
                                status: status
                            }).then(function (value) {
                                if (value) {
                                    req.flash('info', 'Successfully created');
                                    return res.redirect('/admin/sitesettings/list/1');
                                }
                            })
                                .catch(function (error) {
                                    console.log(error);
                                    req.flash('errors', 'Somethings went wrong');
                                });
                        }
                    } else {
                        console.log("dddddddddddddddddddddddddddd");
                        models.siteSettings.update({
                            storeId: storeId,
                                siteSettingsGroupId: siteSettingsgroupId,
                                title: title,
                                value: sValue,
                                // siteName:siteName,
                                // tagline : tagline,
                                // email : email,
                                // mobileNo: mobileNo,
                                // appVersion: appVersion,
                                // fax: fax,
                                // siteUrl : siteUrl,
                                // address: address,
                                // siteDescription : siteDescription,
                                // feature: feature,
                                // shippingCharges: shippingCharges,
                                // freeShippingLimit: freeShippingLimit,
                                // facebook: facebook,
                                // twitter: twitter,
                                // linkedin: linkedin,
                                // instagram: instagram,
                                // latitude: latitude,
                                // longitude: longitude,
                                // googleUrl: googleUrl,
                                sequence: sequence,
                                isSystem: isSystem,
                                status: status
                        }, { where: { id: id } }).then(function (value) {
                            if (value) {
                                req.flash('info', 'Successfully updated');
                                return res.redirect('/admin/sitesettings/list/1');
                            }
                        }).catch(function (error) {
                            console.log(error);
                            req.flash('errors', 'Somethings went wrong');
                        });
                    }
                });
            }
        }
    })
    
};

/**
 * This function is developed for delete siteSettings
 * Developer: Avijit Das
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
                        return permission === 'SiteSettingsDelete'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.siteSettings.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.siteSettings.destroy({
                    where: { id: id }
                }).then(function (value) {
                    if (value) {
                        req.flash('info', 'Successfully  sitesettings deleted');
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