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
 * Description: This function is developed for listing faqGroups
 * Developer: Avijit Das
 */
exports.list = async function(req, res){
    var token= req.session.token;
    var role = req.session.role;
    var sessionStoreId = req.session.user.storeId;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash('error','Invalid Token');
            res.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                let column = req.query.column || 'id';
                let order = req.query.order || 'ASC';
                let pagesizes = req.query.pagesize || 10;
                let pageSize = parseInt(pagesizes);
                let page = req.params.page || 1;
                let search = req.query.search || '';

                let faqGroupList = await models.faqGroups.findAll({ where: {
                    [Op.or]: [
                      { name: { [Op.like]: `%${search}%` } },
                      { description: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                  let listCount = await models.faqGroups.count({where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } }
                    ]
                  }});
                let pageCount = Math.ceil(listCount/pageSize);

                if (faqGroupList) {
                    return res.render('admin/faqgroups/list', {
                        title: 'Faq Groups',
                        arrData: faqGroupList,
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
                        helper: helper
                    });
                } else {
                    return res.render('admin/faqgroups/list', {
                        title: 'Faq Groups',
                        arrData: '',
                        storeList: '',
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                        helper: helper
                    });
                }
            }else{
                //*****Permission Assign Start
                var userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'FaqList'
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

                    let faqGroupList = await models.faqGroups.findAll({ where: {storeId: sessionStoreId, [Op.or]: [
                          { name: { [Op.like]: `%${search}%` } },
                          { description: { [Op.like]: `%${search}%` } }
                        ]
                      }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
    
                      let listCount = await models.faqGroups.count({where: {storeId: sessionStoreId, [Op.or]: [
                            { name: { [Op.like]: `%${search}%` } },
                            { description: { [Op.like]: `%${search}%` } }
                        ]
                      }});
                    let pageCount = Math.ceil(listCount/pageSize);
                    
                    if (faqGroupList) {
                        return res.render('admin/faqgroups/list', {
                            title: 'Faq Groups',
                            arrData: faqGroupList,
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
                            helper: helper
                        });
                    } else {
                        return res.render('admin/faqgroups/list', {
                            title: 'Faq Groups',
                            arrData: '',
                            storeList: '',
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper: helper
                        });
                    }
                }
            }
            
        }	
    });
}



/**
 * Description: This function is developed for view for faqGroup
 * Developer: Avijit Das
 */
exports.view = async function(req, res){
    var token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    var id = req.params.id;
    /*
    var id = req.params.id;
    var token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;*/
    jwt.verify(token,SECRET,async function(error,decode){
    if(error){
        req.flash('error','Invalid Token');
        res.redirect('auth/signin');
    }else{
        if(sessionStoreId==null){
            var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
            var faqGroupList = await models.faqGroups.findAll({ attributes: ['id', 'storeId', 'name', 'parentId'] });
            var arrdropdown = [];
            var treeForDropDown = '';
            arrdropdown.push({
                "id": "0",
                "storeId": "",
                "title": "Select Faq Group",
                "parent": ""
            });
            faqGroupList.forEach(function (faqGroup) {
                arrdropdown.push({
                    "id": faqGroup.id,
                    "storeId": faqGroup.storeId,
                    "title": faqGroup.name,
                    "parent": faqGroup.parentId
                });
            })
            treeForDropDown = unflattenDRP(arrdropdown);
            if (!id) {
                return res.render('admin/faqgroups/addedit', {
                    title: 'Add FaqGroup',
                    arrData: '',
                    arrFaqGroup: JSON.stringify(treeForDropDown, null, " "),
                    stores: stores,
                    sessionStoreId: '',
                    helper: helper,
                    messages: req.flash('info'),
                    errors: req.flash('errors')
                });
            } else {
                var faqGroupDetails = await models.faqGroups.findOne({ attributes: ['id', 'storeId', 'name', 'parentId', 'description', 'icon'], where: { id: id } });
                if (faqGroupDetails) {
                    return res.render('admin/faqgroups/addedit', {
                        title: 'Edit FaqGroup',
                        arrData: faqGroupDetails,
                        arrFaqGroup: JSON.stringify(treeForDropDown, null, " "),
                        stores: stores,
                        sessionStoreId: '',
                        helper: helper,
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
                    return permission === 'FaqGroupView'
                })
            }
            if (id) {
                var storeIdChecking = await models.faqGroups.findOne({ attributes: ['storeId'], where: { id: id } });
                if (storeIdChecking.storeId != sessionStoreId) {
                    userPermission = false;
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes',id:sessionStoreId } });
                var faqGroupList = await models.faqGroups.findAll({ attributes: ['id', 'storeId', 'name', 'parentId'],where:{storeId:sessionStoreId} });
                var arrdropdown = [];
                var treeForDropDown = '';
                arrdropdown.push({
                    "id": "0",
                    "storeId": "",
                    "title": "Select Faq Group",
                    "parent": ""
                });
                faqGroupList.forEach(function (faqGroup) {
                    arrdropdown.push({
                        "id": faqGroup.id,
                        "storeId": faqGroup.storeId,
                        "title": faqGroup.name,
                        "parent": faqGroup.parentId
                    });
                })
                treeForDropDown = unflattenDRP(arrdropdown);
                if (!id) {
                    return res.render('admin/faqgroups/addedit', {
                        title: 'Add FaqGroup',
                        arrData: '',
                        arrFaqGroup: JSON.stringify(treeForDropDown, null, " "),
                        stores: stores,
                        sessionStoreId: sessionStoreId,
                        helper: helper,
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var faqGroupDetails = await models.faqGroups.findOne({ attributes: ['id', 'storeId', 'name', 'parentId', 'description', 'icon'], where: { id: id } });
                    if (faqGroupDetails) {
                        return res.render('admin/faqgroups/addedit', {
                            title: 'Edit FaqGroup',
                            arrData: faqGroupDetails,
                            arrFaqGroup: JSON.stringify(treeForDropDown, null, " "),
                            stores: stores,
                            sessionStoreId: sessionStoreId,
                            helper: helper,
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
 * Description: This function is developed for add/update New faqGroup
 * Developer: Avijit Das
 */
exports.addOrUpdate = function(req, res) {
    var token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    jwt.verify(token,SECRET,async function(error,decode){
        //*****Permission Assign Start
        var userPermission = false;
        if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
            userPermission = true;
        } else {
            if (role == 'admin') {
                userPermission = true;
            } else {
                userPermission = !!req.session.permissions.find(permission => {
                    return permission === 'FaqGroupAddEdit'
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
                var faqName = fields.faqName[0];
                var storeId = fields.storeId[0];
                var parentId = fields.parentId[0];
                var description = fields.description[0];
                if (!id) {
                    if (faqName != '' && storeId != '') {
                        models.faqGroups.create({
                            name: faqName,
                            storeId: storeId,
                            parentId: parentId ? parentId : null,
                            description: description,
                        }).then(function (value) {
                            if (value) {
                                if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                                    var faqIcon = Date.now() + files.image[0].originalFilename;
                                    var ImageExt = faqIcon.split('.').pop();
                                    var faqIconWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                                    userFinalFaqImage = faqIconWithEXT.replace("[object Object]", "");
                                    helper.createDirectory('public/admin/faq/icon/' + value.id);
                                    var tempPath = files.image[0].path;
                                    var fileName = userFinalFaqImage;
                                    var targetPath = "icon/" + value.id + "/" + fileName;
                                    helper.uploadIconFiles(tempPath, targetPath);
                                }
                                models.faqGroups.update({
                                    icon: userFinalFaqImage
                                }, { where: { id: value.id } }).then(function (val) {
                                    if (val) {
                                        req.flash('info', 'Successfully faqGroup created');
                                        return res.redirect('/admin/faqgroups/list/1');
                                    }
                                })
                            }
                        })
                            .catch(function (error) {
                                console.log(error);
                                req.flash('errors', 'Something went wrong');
                            });
                    }
                } else {
                    var faqImage = models.faqGroups.findOne({ attributes: ['icon'], where: { id: id } });
                    if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                        var faqIcon = Date.now() + files.image[0].originalFilename;
                        var ImageExt = faqIcon.split('.').pop();
                        var faqIconWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                        userFinalFaqImage = faqIconWithEXT.replace("[object Object]", "");
                        helper.createDirectory('public/admin/faq/icon/' + id);
                        var tempPath = files.image[0].path;
                        var fileName = userFinalFaqImage;
                        var targetPath = "icon/" + id + "/" + fileName;
                        helper.uploadIconFiles(tempPath, targetPath);
                    }
                    var oldFaqIcon = faqImage.icon;
                    models.faqGroups.update({
                        name: faqName,
                        storeId: storeId,
                        parentId: parentId ? parentId : null,
                        description: description,
                        icon: userFinalFaqImage != '' ? userFinalFaqImage : oldFaqIcon
                    }, { where: { id: id } }).then(function (value) {
                        if (value) {
                            req.flash('info', 'Successfully faqGroup updated');
                            return res.redirect('/admin/faqgroups/list/1');
                        }
                    })
                        .catch(function (error) {
                            console.log(error);
                            req.flash('errors', 'Something went wrong');
                        });
                }
            });
        }
    });    
};

/**
 * This function is developed for delete faqGroup
 * Developer: Avijit Das
 */
exports.delete = function(req, res, next) {
    var id = req.params.id;
    var token = req.session.token;
    var role = req.session.role;
    var sessionStoreId = req.session.user.storeId;
    jwt.verify(token,SECRET,async function(error,decode){
        if (error) {
            req.flash('error', 'Invalid Token');
            res.redirect('auth/signin');
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
                        return permission === 'FaqGroupDelete'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.faqGroups.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.faqGroups.destroy({
                    where: { id: id }
                }).then(function (value) {
                    if (value) {
                        req.flash('info', 'Successfully faqGroup deleted');
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

/**
 * This function is developed for arrayDrop down value
 * Developer: Avijit Das
 */
function unflattenDRP(arrdropdown) {
    var tree = [], mappedArr = {}, arrElem, mappedElem;
    // First map the nodes of the array to an object -> create a hash table.
    for (var i = 0, len = arrdropdown.length; i < len; i++) {
        arrElem = arrdropdown[i];
        mappedArr[arrElem.id] = arrElem;
        mappedArr[arrElem.id]['subs'] = [];
    }
    for (var id in mappedArr) {
        if (mappedArr.hasOwnProperty(id)) {
            mappedElem = mappedArr[id];
            if (mappedElem.parent) { // If the element is not at the root level, add it to its parent array of nodes.
                mappedArr[mappedElem['parent']]['subs'].push(mappedElem);
            } else { // If the element is at the root level, add it to first level elements array.
                tree.push(mappedElem);
            }
        }
    }
    return tree;
}