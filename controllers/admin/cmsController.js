let models = require('../../models');
let passport = require('passport');
let bcrypt = require('bcrypt-nodejs');
let cookieParser = require('cookie-parser');
let flash = require('connect-flash');
let formidable = require('formidable');
let multiparty = require('multiparty'); 
let bodyParser = require('body-parser');
let fetch = require('node-fetch');
let jwt = require('jsonwebtoken');
let SECRET = 'nodescratch';
const paginate = require('express-paginate');
const Sequelize = require("sequelize");
const Op = Sequelize.Op
/**
 * This function is developed for listing About us
 * Developer: Partha Mandal
 */
exports.list = async (req, res) => {
    let token= req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null || sessionStoreId == '') {
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                let column = req.query.column || 'id';
                let order = req.query.order || 'ASC';
                let pagesizes = req.query.pagesize || 10;
                let pageSize = parseInt(pagesizes);
                let page = req.params.page || 1;
                let search = req.query.search || '';
                let cmsList = await models.cms.findAll({ attributes: ['id', 'storeId','slug', 'title', 'status'], where: {
                    [Op.or]: [
                      { title: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize});
                let listCount = await models.cms.count({where: {
                    [Op.or]: [
                      { title: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ]
                  }});
                let pageCount = Math.ceil(listCount/pageSize);
                if (cmsList) {
                    return res.render('admin/cms/list', {
                        title: 'About Us List',
                        arrData: cmsList,
                        sessionStoreId: '',
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
                    return res.render('admin/cms/list', {
                        title: 'About Us List',
                        arrData: '',
                        storeList: '',
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                }
            }else{
                //*****Permission Assign Start
                let userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'AboutUsList'
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
                    let cmsList = await models.cms.findAll({ attributes: ['id', 'storeId', 'title','slug', 'status'], order: [[column, order]], where: { storeId: sessionStoreId, [Op.or]: [
                      { title: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ] }, limit:pageSize, offset:(page-1)*pageSize });

                    let listCount = await models.cms.count({where: { storeId: sessionStoreId, [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                      ] }});
                    let pageCount = Math.ceil(listCount/pageSize);
                    if (cmsList) {
                        return res.render('admin/cms/list', {
                            title: 'About Us List',
                            arrData: cmsList,
                            sessionStoreId: sessionStoreId,
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
                        return res.render('admin/cms/list', {
                            title: 'About Us List',
                            arrData: '',
                            sessionStoreId: sessionStoreId,
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
 * This function is developed for view About Us
 * Developer: Partha Mandal
 */
exports.view = async(req, res)=>{
    let token = req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
    let id = req.params.id;
    jwt.verify(token,SECRET,async(err,decoded)=>{
        if(err){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                let stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                if (!id) {
                    return res.render('admin/cms/addedit', {
                        title: 'Add About Us',
                        arrData: '',
                        sessionStoreId: '',
                        stores: stores,
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    let cms = await models.cms.findOne({ where: { id: id } });
                    if (cms) {
                        return res.render('admin/cms/addedit', {
                            title: 'Edit About Us',
                            arrData: cms,
                            sessionStoreId: '',
                            stores: stores,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    }
                }
            }else{
                //*****Permission Assign Start
                let userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'AboutUsView'
                    })
                }
                if (id) {
                    let storeIdChecking = await models.cms.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId, status: 'Yes' } });
                    if (!id) {
                        return res.render('admin/cms/addedit', {
                            title: 'Add About Us',
                            arrData: '',
                            sessionStoreId: sessionStoreId,
                            stores: stores,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        let cms = await models.cms.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (cms) {
                            return res.render('admin/cms/addedit', {
                                title: 'Edit About Us',
                                arrData: cms,
                                sessionStoreId: sessionStoreId,
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
 * This function is developed for add/update New About Us
 * Developer: Partha Mandal
 */
exports.addOrUpdate = (req, res, next) => {
    let token = req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let sessionUserId = req.session.user.id;
    let role = req.session.role;
    jwt.verify(token, SECRET, async(err, decoded) => {
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            //*****Permission Assign Start
            let userPermission = false;
            //*****If SupperAdmin Login
            if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
                userPermission = true;
            } else {
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'AboutUsAddEdit'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                let form = new multiparty.Form();
                form.parse(req, (err, fields, files) => {
                    let id = fields.updateId[0];
                    let title = fields.title[0];
                    // let slug = fields.slug[0];
                    let storeId = fields.storeId[0];
                    let status = fields.status[0];
                    let content = fields.content[0];
                    let contentDescription = fields.contentDescription[0];
                    if (!id) {
                        if (title != '' && storeId != '' && status != '' && contentDescription != '') {

                            models.cms.findAndCountAll({ where:{title:title}}).then(function (cms_names){
                                if(cms_names.count >= 1){														
                                  var slug = title.toString().toLowerCase().replace(/\s+/g, '-');
                                  slug+= "-"+(cms_names.count+1);	
                                }else{
                                  var slug = title.toString().toLowerCase().replace(/\s+/g, '-');
                                }
                                models.cms.create({
                                    title: title,
                                    slug: slug,
                                    storeId: storeId,
                                    content: content,
                                    contentDescription: contentDescription,
                                    status: status,
                                    createdBy: sessionUserId
                                }).then((value) => {
                                    if (value) {
                                        req.flash('info', 'Successfully created');
                                        return res.redirect('/admin/cms/list/1');
                                    }
                                }).catch((error) => {
                                    console.log(error);
                                    req.flash('errors', 'Somethings went wrong');
                                });
                            });
                        }else{
                            req.flash('errors','Please fill the required field')
                            return res.redirect('back')
                        }
                    } else {
                        if (title != '' && storeId != '' && status != '' && contentDescription != '') {
                        models.cms.update({
                            title: title,
                            // slug: slug,
                            storeId: storeId,
                            content: content,
                            contentDescription: contentDescription,
                            status: status,
                            updatedBy: sessionUserId
                        }, { where: { id: id } }).then((value) =>{
                            if (value) {
                                req.flash('info', 'Successfully updated');
                                return res.redirect('/admin/cms/list/1');
                            }
                        }).catch((error) => {
                            console.log(error);
                            req.flash('errors', 'Somethings went wrong');
                        });
                        }else{
                            req.flash('errors','Please fill the required field')
                            return res.redirect('back')
                        }
                    }
                });
            }
        }
    })
    
};

/**
 * This function is developed for delete About Us
 * Developer: Partha Mandal
 */
exports.delete = (req, res, next) => {
    let token = req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
    let id = req.params.id;
    jwt.verify(token,SECRET,async(err,decoded) => {
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
                        return permission === 'AboutUsDelete'
                    })
                }
                if (id) {
                    let storeIdChecking = await models.cms.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.cms.destroy({
                    where: { id: id }
                }).then((value) => {
                    if (value) {
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