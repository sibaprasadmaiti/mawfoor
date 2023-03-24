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
 * This function is developed for listing blogauthor
 * Developer: Partha Mandal
 */
exports.list = async function(req, res){
    let token= req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                let column = req.query.column || 'id';
                let order = req.query.order || 'ASC';
                let pagesizes = req.query.pagesize || 10;
                let pageSize = parseInt(pagesizes);
                let page = req.params.page || 1;
                let search = req.query.search || '';
                let author = await models.blogauthor.findAll({ where: {
                    [Op.or]: [
                      { firstName: { [Op.like]: `%${search}%` } },
                      { lastName: { [Op.like]: `%${search}%` } },
                      { email: { [Op.like]: `%${search}%` } },
                      { facebook: { [Op.like]: `%${search}%` } },
                      { linkedin: { [Op.like]: `%${search}%` } },
                      { twitter: { [Op.like]: `%${search}%` } },
                      { github: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.blogauthor.count({where: {
                    [Op.or]: [
                      { firstName: { [Op.like]: `%${search}%` } },
                      { lastName: { [Op.like]: `%${search}%` } },
                      { email: { [Op.like]: `%${search}%` } },
                      { facebook: { [Op.like]: `%${search}%` } },
                      { linkedin: { [Op.like]: `%${search}%` } },
                      { twitter: { [Op.like]: `%${search}%` } },
                      { github: { [Op.like]: `%${search}%` } }
                    ]
                  }});
                let pageCount = Math.ceil(listCount/pageSize);
                if (author) {
                    return res.render('admin/blogAuthor/list', {
                        title: 'Blog Author List',
                        arrData: author,
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
                    return res.render('admin/blogAuthor/list', {
                        title: 'Blog Author List',
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
                        return permission === 'BlogAuthorList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId, 'status' : 'Yes'} });
                    let column = req.query.column || 'id';
                    let order = req.query.order || 'ASC';
                    let pagesizes = req.query.pagesize || 10;
                    let pageSize = parseInt(pagesizes);
                    let page = req.params.page || 1;
                    let search = req.query.search || '';
                    let author = await models.blogauthor.findAll({ order: [[column, order]], where: { storeId: sessionStoreId, [Op.or]: [
                        { firstName: { [Op.like]: `%${search}%` } },
                        { lastName: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                        { facebook: { [Op.like]: `%${search}%` } },
                        { linkedin: { [Op.like]: `%${search}%` } },
                        { twitter: { [Op.like]: `%${search}%` } },
                        { github: { [Op.like]: `%${search}%` } }
                    ] },limit:pageSize, offset:(page-1)*pageSize });

                    let listCount = await models.blogauthor.count({where: { storeId: sessionStoreId, [Op.or]: [
                        { firstName: { [Op.like]: `%${search}%` } },
                        { lastName: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                        { facebook: { [Op.like]: `%${search}%` } },
                        { linkedin: { [Op.like]: `%${search}%` } },
                        { twitter: { [Op.like]: `%${search}%` } },
                        { github: { [Op.like]: `%${search}%` } }
                    ] }});
                    let pageCount = Math.ceil(listCount/pageSize);
                    if (author) {
                        return res.render('admin/blogAuthor/list', {
                            title: 'Blog Author List',
                            arrData: author,
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
                        return res.render('admin/blogAuthor/list', {
                            title: 'Blog Author List',
                            arrData: '',
                            storeList: '',
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
 * This function is developed for view blogauthor
 * Developer: Partha Mandal
 */
exports.view = async function(req, res){
    let token = req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
    let id = req.params.id;
    jwt.verify(token,SECRET,async function(err,decoded){
        if(err){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                let stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                if (!id) {
                    return res.render('admin/blogAuthor/addedit', {
                        title: 'Add Blog Author',
                        arrData: '',
                        stores: stores,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    let blogauthor = await models.blogauthor.findOne({ where: { id: id } });
                    if (blogauthor) {
                        return res.render('admin/blogAuthor/addedit', {
                            title: 'Edit Blog Author',
                            arrData: blogauthor,
                            stores: stores,
                            sessionStoreId: '',
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
                        return permission === 'BlogAuthorView'
                    })
                }
                if (id) {
                    let storeIdChecking = await models.blogauthor.findOne({ attributes: ['storeId'], where: { id: id } });
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
                        return res.render('admin/blogAuthor/addedit', {
                            title: 'Add Blog Author',
                            arrData: '',
                            stores: stores,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        let blogauthor = await models.blogauthor.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (blogauthor) {
                            return res.render('admin/blogAuthor/addedit', {
                                title: 'Edit Blog Author',
                                arrData: blogauthor,
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
};

/**
 * This function is developed for add/update New blogauthor
 * Developer: Partha Mandal
 */
exports.addOrUpdate = function(req, res, next) {
    let token = req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let sessionUserId = req.session.user.id;
    let role = req.session.role;
    jwt.verify(token, SECRET, async function (err, decoded) {
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
                        return permission === 'BlogAuthorAddEdit'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                let form = new multiparty.Form();
                form.parse(req, function (err, fields, files) {
                    let id = fields.update_id[0];
                    let firstName = fields.firstName[0];
                    let lastName = fields.lastName[0];
                    let email = fields.email[0];
                    let facebook = fields.facebook[0];
                    let linkedin = fields.linkedin[0];
                    let twitter = fields.twitter[0];
                    let github = fields.github[0];
                    let storeId = fields.storeId[0];
                    let status = fields.status[0];
                    if (!id) {
                        if (firstName != '' && storeId != '' && status != '') {
                            models.blogauthor.create({
                                firstName: firstName,
                                lastName: lastName,
                                email: email,
                                facebook: facebook,
                                linkedin: linkedin,
                                twitter: twitter,
                                github: github,
                                storeId: storeId,
                                status: status,
                                createdBy: sessionUserId
                            }).then(function (value) {
                                if (value) {
                                    req.flash('info', 'Successfully blog author created');
                                    return res.redirect('/admin/blogAuthor/list/1');
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
                        if (firstName != '' && storeId != '' && status != '') {
                        models.blogauthor.update({
                            firstName: firstName,
                            lastName: lastName,
                            email: email,
                            facebook: facebook,
                            linkedin: linkedin,
                            twitter: twitter,
                            github: github,
                            storeId: storeId,
                            status: status,
                            updatedBy: sessionUserId
                        }, { where: { id: id } }).then(function (value) {
                            if (value) {
                                req.flash('info', 'Successfully blog author updated');
                                return res.redirect('/admin/blogauthor/list/1');
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
 * This function is developed for delete blogauthor
 * Developer: Partha Mandal
 */
exports.delete = function(req, res, next) {
    let token = req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
    let id = req.params.id;
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
                        return permission === 'BlogAuthorDelete'
                    })
                }
                if (id) {
                    let storeIdChecking = await models.blogauthor.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.blogauthor.destroy({
                    where: { id: id }
                }).then(function (value) {
                    if (value) {
                        req.flash('info', 'Successfully blog author deleted');
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