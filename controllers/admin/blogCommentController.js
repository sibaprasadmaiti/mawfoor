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
var helper = require('../../helpers/helper_functions');
const Op = Sequelize.Op

/**
 * This function is developed for listing blog comment
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
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName']});
                let titleList = await models.blogs.findAll({ attributes: ['id', 'blogTitle']});
                let column = req.query.column || 'id';
                let order = req.query.order || 'ASC';
                let pagesizes = req.query.pagesize || 10;
                let pageSize = parseInt(pagesizes);
                let page = req.params.page || 1;
                let search = req.query.search || '';
                let commentList = await models.blogcomments.findAll({ where: {
                    [Op.or]: [
                      { commentDescription: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.blogcomments.count({where: {
                    [Op.or]: [
                      { commentDescription: { [Op.like]: `%${search}%` } }
                    ]
                  }});
                let pageCount = Math.ceil(listCount/pageSize);
                if (commentList) {
                    return res.render('admin/blogComment/list', {
                        title: 'Blog Comment List',
                        arrData: commentList,
                        storeList: storeList,
                        sessionStoreId:'',
                        titleList: titleList,
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
                    return res.render('admin/blogComment/list', {
                        title: 'Blog Comment List',
                        arrData: '',
                        storeList: '',
                        sessionStoreId:'',
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
                        return permission === 'BlogCommentList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId, 'status' : 'Yes'} });
                    let titleList = await models.blogs.findAll({ attributes: ['id', 'blogTitle'], where:{storeId: sessionStoreId}});
                    let column = req.query.column || 'id';
                    let order = req.query.order || 'ASC';
                    let pagesizes = req.query.pagesize || 10;
                    let pageSize = parseInt(pagesizes);
                    let page = req.params.page || 1;
                    let search = req.query.search || '';
                    let commentList = await models.blogcomments.findAll({ order: [[column, order]], where: { storeId: sessionStoreId, [Op.or]: [
                        { commentDescription: { [Op.like]: `%${search}%` } }
                    ] },limit:pageSize, offset:(page-1)*pageSize });

                    let listCount = await models.blogcomments.count({where: { storeId: sessionStoreId, [Op.or]: [
                        { commentDescription: { [Op.like]: `%${search}%` } }
                    ] }});
                    let pageCount = Math.ceil(listCount/pageSize);
                    if (commentList) {
                        return res.render('admin/blogComment/list', {
                            title: 'Blog Comment List',
                            arrData: commentList,
                            storeList: storeList,
                            sessionStoreId:sessionStoreId,
                            titleList: titleList,
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
                        return res.render('admin/blogComment/list', {
                            title: 'Blog Comment List',
                            arrData: '',
                            storeList: '',
                            sessionStoreId:sessionStoreId,
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
 * This function is developed for delete blog comment
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
                        return permission === 'BlogCommentDelete'
                    })
                }
                if (id) {
                    let storeIdChecking = await models.blogcomments.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.blogcomments.destroy({
                    where: { id: id }
                }).then(function (value) {
                    if (value) {
                        req.flash('info', 'Successfully blog comment deleted');
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