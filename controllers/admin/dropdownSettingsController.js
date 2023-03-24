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
const Sequelize = require("sequelize");
const Op = Sequelize.Op

/**
 * Description: This function is developed for listing dropdown settings
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
            if(sessionStoreId==null){
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                let dropdownList = await models.dropdownSettings.findAll({where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { slug: { [Op.like]: `%${search}%` } },
                        { type: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.dropdownSettings.count({where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { slug: { [Op.like]: `%${search}%` } },
                        { type: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                  }});

                let pageCount = Math.ceil(listCount/pageSize);

                if (dropdownList) {
                    return res.render('admin/dropdownSettings/list', {
                        title: 'Dropdown Settings',
                        arrData: dropdownList,
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
                        errors: req.flash('errors'),
                    });
                } else {
                    return res.render('admin/dropdownSettings/list', {
                        title: 'Dropdown Settings',
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
                        return permission === 'DropdownSettingList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where:{id : sessionStoreId} });
                    let dropdownList = await models.dropdownSettings.findAll({where: {storeId:sessionStoreId,
                        [Op.or]: [
                            { name: { [Op.like]: `%${search}%` } },
                            { slug: { [Op.like]: `%${search}%` } },
                            { type: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                    }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                    let listCount = await models.dropdownSettings.count({where: {storeId:sessionStoreId,
                        [Op.or]: [
                            { name: { [Op.like]: `%${search}%` } },
                            { slug: { [Op.like]: `%${search}%` } },
                            { type: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                    }});

                    let pageCount = Math.ceil(listCount/pageSize);

                    if(dropdownList){
                        return res.render('admin/dropdownSettings/list', {
                            title: 'Dropdown Settings',
                            arrData: dropdownList,
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
                        }); 
                    } else {
                        return res.render('admin/dropdownSettings/list', {
                            title: 'Dropdown Settings',
                            arrData: '',
                            storeList: storeList,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors:req.flash('errors'),
                        }); 
                    }
                }
            } 
        }	
    });
}

/**
 * Description: This function is developed for view of dropdown settings
 * Developer: Avijit Das
 */
exports.view = async function(req, res){
    var sessionStoreId = req.session.user.storeId;
    var role= req.session.role;
    var token = req.session.token;
    var id = req.params.id;
    jwt.verify(token,SECRET,async function(error,decode){
        if(error){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            if(sessionStoreId==null){
                var storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                if (!id) {
                    return res.render('admin/dropdownSettings/addedit', {
                        title: ' Add Dropdown Settings',
                        arrData: '',
                        arrOption: '',
                        stores: storeList,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } else {
                    var dropDownList = await models.dropdownSettings.findOne({ where: { id: id } });
                    var dropDownOptionList = await models.dropdownSettingsOptions.findAll({ where: { dropdownSettingId: id } });
                    if (dropDownList) {
                        return res.render('admin/dropdownSettings/addedit', {
                            title: ' Edit Dropdown Settings',
                            arrData: dropDownList,
                            stores: storeList,
                            arrOption: dropDownOptionList,
                            sessionStoreId: '',
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
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
                        return permission === 'DropdownSettingView'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.dropdownSettings.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    var storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes',id:sessionStoreId } });
                    if (!id) {
                        return res.render('admin/dropdownSettings/addedit', {
                            title: ' Add Dropdown Settings',
                            arrData: '',
                            arrOption: '',
                            stores: storeList,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                        });
                    } else {
                        var dropDownList = await models.dropdownSettings.findOne({ where: { id: id, storeId: sessionStoreId } });
                        var dropDownOptionList = await models.dropdownSettingsOptions.findAll({ where: { dropdownSettingId: id, storeId: sessionStoreId } });
                        if (dropDownList) {
                            return res.render('admin/dropdownSettings/addedit', {
                                title: ' Edit Dropdown Settings',
                                arrData: dropDownList,
                                stores: storeList,
                                arrOption: dropDownOptionList,
                                sessionStoreId: sessionStoreId,
                                messages: req.flash('info'),
                                errors: req.flash('errors'),
                            });
                        }
                    }
                }
            }
        }
    });    
};

/**
 * Description: This function is developed for add/update of dropdown settings
 * Developer: Avijit Das
 */
exports.addOrUpdate = function(req, res) {
    var token = req.session.token;
    var user = req.session.role;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    jwt.verify(token,SECRET,async function(error,decode){
        if(error){
            req.flash('error','Invalid Token');
            res.redirect('auth/signin');
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
                        return permission === 'DropdownSettingAddEdit'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                var form = new multiparty.Form();
                form.parse(req, function (err, fields, files) {
                    var id = fields.updatedId[0];
                    var name = fields.name[0];
                    var storeId = fields.storeId[0];
                    var slug = fields.slug[0];
                    var type = fields.type[0];
                    var status = fields.status[0];
                    var dropdownSettingsArrOptionValue = fields.optionValue;
                    if (!id) {
                        if (name != '' && type != '' && status != '') {
                            models.dropdownSettings.create({
                                name: name,
                                storeId: storeId,
                                type: type,
                                slug: slug,
                                status: status,
                            }).then(function (dropdownSettings) {
                                if (dropdownSettingsArrOptionValue) {
                                    var i = 0;
                                    dropdownSettingsArrOptionValue.forEach(function (element) {
                                        models.dropdownSettingsOptions.create({
                                            dropdownSettingId: dropdownSettings.id,
                                            storeId: storeId,
                                            optionValue: fields.optionValue[i],
                                            optionLabel: fields.optionLabel[i],
                                            optionOrder: fields.optionOrder[i],
                                        });
                                        i++;
                                    }, this);
                                } else {
                                    req.flash('info', 'Successfully Created');
                                    return res.redirect('/admin/dropdownSettings/list/1');
                                }
                                req.flash('info', 'Successfully Created');
                                return res.redirect('/admin/dropdownSettings/list/1');
                            }).catch(function (error) {
                                console.log(error);
                                req.flash('errors', 'Something went wrong');
                                return res.redirect('back');
                            });
                        }else{
                            req.flash('errors', 'Please fill the required fields');
                            return res.redirect('back');
                        }
                    } else {
                        models.dropdownSettings.update({
                            name: name,
                            storeId: storeId,
                            type: type,
                            slug: slug,
                            status: status,
                        }, { where: { id: id } }).then(function (dropdownSettings) {
                            if (dropdownSettingsArrOptionValue) {
                                models.dropdownSettingsOptions.destroy({ where: { dropdownSettingId: id } });
                                var i = 0;
                                dropdownSettingsArrOptionValue.forEach(function (element) {
                                    models.dropdownSettingsOptions.create({
                                        dropdownSettingId: id,
                                        storeId: storeId,
                                        optionValue: fields.optionValue[i],
                                        optionLabel: fields.optionLabel[i],
                                        optionOrder: fields.optionOrder[i],
                                    });
                                    i++;
                                }, this);
                            } else {
                                req.flash('info', 'Successfully updated');
                                return res.redirect('/admin/dropdownSettings/list/1');
                            }
                            req.flash('info', 'Successfully updated');
                            return res.redirect('/admin/dropdownSettings/list/1');
                        }).catch(function (error) {
                            req.flash('errors', 'Something went wrong');
                            return res.redirect('/admin/dropdownSettings/list/1');
                        });
                    }
                });
            }
        }
    });    
};



/**
 * Description: This function is developed for delete of dropdown settings
 * Developer: Avijit Das
 */
exports.delete =  function(req, res) {
    var token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var id = req.params.id;
    jwt.verify(token,SECRET,async function(error,decode){
        if(error){
            req.flash('error','Invalid Token');
            res.redirect('auth/signin');
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
                        return permission === 'DropdownSettingDelete'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.dropdownSettings.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.dropdownSettings.destroy({where: {id: id } }).then(function (dropdownSettings) {
                    if (dropdownSettings) {
                        req.flash('info', 'Successfully deleted');
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