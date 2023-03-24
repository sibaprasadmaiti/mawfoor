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
const Sequelize = require("sequelize");
const Op = Sequelize.Op
/**
 * Description: This function is developed for listing siteSettingsGroup
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
                let siteSettingsGroupList = await models.siteSettingsGroups.findAll({where: {
                    [Op.or]: [
                      { groupTitle: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.siteSettingsGroups.count({where: {
                    [Op.or]: [
                        { groupTitle: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                  }});

                let pageCount = Math.ceil(listCount/pageSize);

                if (siteSettingsGroupList) {
                    return res.render('admin/sitesettingsgroup/list', {
                        title: 'Site Setting Groups',
                        storeList: storeList,
                        arrData: siteSettingsGroupList,
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
                    return res.render('admin/sitesettingsgroup/list', {
                        title: 'Site Setting Groups',
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
                        return permission === 'SiteSettingsGroupList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: {id: sessionStoreId } });

                    let siteSettingsGroupList = await models.siteSettingsGroups.findAll({where: {storeId: sessionStoreId,
                        [Op.or]: [
                        { groupTitle: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                        ]
                    }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                    let listCount = await models.siteSettingsGroups.count({where: {storeId: sessionStoreId,
                        [Op.or]: [
                            { groupTitle: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                    }});

                    let pageCount = Math.ceil(listCount/pageSize);

                    if (siteSettingsGroupList) {
                        return res.render('admin/sitesettingsgroup/list', {
                            title: 'Site Setting Groups',
                            storeList: storeList,
                            arrData: siteSettingsGroupList,
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
                        return res.render('admin/sitesettingsgroup/list', {
                            title: 'Site Setting Groups',
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
 * Description: This function is developed for view for siteSettingsGroup
 * Developer: Avijit Das
 */
exports.view = async function(req, res){
    var token = req.session.token;
    var id = req.params.id;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    jwt.verify(token, SECRET, async function (err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            if (sessionStoreId == null) {
                var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                if (!id) {
                    return res.render('admin/sitesettingsgroup/addedit', {
                        title: 'Add SettingsGroup',
                        arrData: '',
                        stores: stores,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var siteSettingsGroupList = await models.siteSettingsGroups.findOne({ where: { id: id } });
                    if (siteSettingsGroupList) {
                        return res.render('admin/sitesettingsgroup/addedit', {
                            title: 'Edit SettingsGroup',
                            arrData: siteSettingsGroupList,
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
                        return permission === 'SiteSettingsGroupView'
                    })
                }
                if(id){
                    var storeIdChecking = await models.siteSettingsGroups.findOne({attributes:['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId,status: 'Yes' } });
                    if (!id) {
                        return res.render('admin/sitesettingsgroup/addedit', {
                            title: 'Add SettingsGroup',
                            arrData: '',
                            stores: stores,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        var siteSettingsGroupList = await models.siteSettingsGroups.findOne({ where: { id: id } });
                        if (siteSettingsGroupList) {
                            return res.render('admin/sitesettingsgroup/addedit', {
                                title: 'Edit SettingsGroup',
                                arrData: siteSettingsGroupList,
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
}

/**
 * Description: This function is developed for add/update New siteSettingsGroup
 * Developer: Avijit Das
 */
exports.addOrUpdate = function(req, res) {
    var token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    jwt.verify(token, SECRET, async function (err, decoded) {
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
                        return permission === 'SiteSettingsGroupAddEdit'
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
                    var groupTitle = fields.gTittle[0];
                    var storeId = fields.storeId[0];
                    var sequence = fields.seq[0];
                    if (!id) {
                        if (groupTitle != '' && storeId != '' && sequence != '') {
                            models.siteSettingsGroups.create({
                                groupTitle: groupTitle,
                                storeId: storeId,
                                sequence: sequence,
                                status: fields.status[0],
                            }).then(function (value) {
                                if (value) {
                                    req.flash('info', 'Successfully created');
                                    return res.redirect('/admin/sitesettingsgroup/list/1');
                                }
                            }).catch(function (error) {
                                    console.log(error);
                                    req.flash('errors', 'Something went wrong');
                            });
                        }
                    } else {
                        models.siteSettingsGroups.update({
                            groupTitle: fields.gTittle[0],
                            storeId: fields.storeId[0],
                            sequence: fields.seq[0],
                            status: fields.status[0],
                        }, { where: { id: id } }).then(function (value) {
                            if (value) {
                                req.flash('info', 'Successfully updated');
                                return res.redirect('/admin/sitesettingsgroup/list/1');
                            }
                        })
                            .catch(function (error) {
                                console.log(error);
                                req.flash('errors', 'Something went wrong');
                            });
                    }
                });
            }
        }
    });
    
};

/**
 * Description: This function is developed for delete  siteSettingsGroup
 * Developer: Avijit Das
 */
exports.delete = function(req, res) {
    var token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    var id = req.params.id;
    jwt.verify(token, SECRET, async function (err, decoded) {
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
                whereCondition = { id: id };
            } else {
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'StoreView'
                    })
                }
                var storeIdChecking = await models.siteSettingsGroups.findOne({ attributes: ['storeId'], where: { id: id } });
                if (storeIdChecking.storeId != sessionStoreId) {
                    userPermission = false;
                } else {
                    whereCondition = { storeId: sessionStoreId, id: id };
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.siteSettingsGroups.destroy({
                    where: whereCondition
                }).then(function (value) {
                    if (value) {
                        req.flash('info', 'Successfully site Settingsgroup deleted');
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