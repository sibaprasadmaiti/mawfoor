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
var fs = require("fs");
var config = require("../../config/config.json");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;

var sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password, 
    {
        host: "localhost",
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        }
    }
);

/**
 * Description: This function is developed for transactionsOffer listing 
 * Developer: Surajit Gouri
 */
 exports.list = async function(req, res){
    let sessionStoreId = req.session.user.storeId;
    let sessionUserId = req.session.user.id;
    let role = req.session.role;
    let token= req.session.token;

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
        } else {
            var storeList = await models.stores.findAll({attributes:['id','storeName','storeCode'],where:{status:'Yes'}});

          if (sessionStoreId == null) {
            let listCount = await models.transactionsOffer.count({ where:{
                [Op.or]:[
                    {offerStatus: {[Op.like]:`%${search}%`}},
                    {credit: {[Op.like]:`%${search}%`}},
                    {offerFrom: {[Op.like]:`%${search}%`}},
                    {offerTo: {[Op.like]:`%${search}%`}},
                    {status: {[Op.like]:`%${search}%`}},								
                ]                         
            }})
            let pageCount = Math.ceil(listCount/pageSize);
                    
            let transactionsOfferList = await models.transactionsOffer.findAll({ where:{
                [Op.or]:[
                    {offerStatus: {[Op.like]:`%${search}%`}},
                    {credit: {[Op.like]:`%${search}%`}},
                    {offerFrom: {[Op.like]:`%${search}%`}},
                    {offerTo: {[Op.like]:`%${search}%`}},
                    {status: {[Op.like]:`%${search}%`}},								
                ],                            
            },order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize})

            if(transactionsOfferList){
                return res.render('admin/transactionsOffer/list', {
                    title: 'Catalog Price Rule List',
                    arrData: transactionsOfferList,
                    arrStore: storeList,
                    sessionStoreId: '',
                    messages: req.flash('info'),
                    errors: req.flash('errors'),
                    helper: helper,
                    listCount: listCount,
                    pageCount: pageCount,
                    columnName: column,
                    orderType: order,
                    searchItem: search,
                    pageSize: pageSize,
                    currentPage: parseInt(page)
                })
            } else {
                return res.render('admin/transactionsOffer/list', {
                    title: 'Catalog Price Rule List',
                    arrData: '',
                    arrStore: storeList,
                    sessionStoreId: '',
                    messages: req.flash('info'),
                    errors: req.flash('errors'),
                    helper: helper,
                    listCount: listCount,
                    pageCount: pageCount,
                    columnName: column,
                    orderType: order,
                    searchItem: search,
                    pageSize: pageSize,
                    currentPage: parseInt(page)
                }); 
            }            
        } else {
                //*****Permission Assign Start
                var userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'CatalogPriceRuleList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let listCount = await models.transactionsOffer.count({ where:{storeId: sessionStoreId,
                        [Op.or]:[
                            {offerStatus: {[Op.like]:`%${search}%`}},
                            {credit: {[Op.like]:`%${search}%`}},
                            {offerFrom: {[Op.like]:`%${search}%`}},
                            {offerTo: {[Op.like]:`%${search}%`}},
                            {status: {[Op.like]:`%${search}%`}},								
                        ]                         
                    }})
                    let pageCount = Math.ceil(listCount/pageSize);

                    let transactionsOfferList = await models.transactionsOffer.findAll({ where:{storeId: sessionStoreId,
                        [Op.or]:[
                            {offerStatus: {[Op.like]:`%${search}%`}},
                            {credit: {[Op.like]:`%${search}%`}},
                            {offerFrom: {[Op.like]:`%${search}%`}},
                            {offerTo: {[Op.like]:`%${search}%`}},
                            {status: {[Op.like]:`%${search}%`}},								
                        ],                            
                    },order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize})

                    if (transactionsOfferList) {
                        return res.render('admin/transactionsOffer/list', {
                            title: 'Catalog Price Rule List',
                            arrData: transactionsOfferList,
                            arrStore: storeList,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper: helper,
                            listCount: listCount,
                            pageCount: pageCount,
                            columnName: column,
                            orderType: order,
                            searchItem: search,
                            pageSize: pageSize,
                            currentPage: parseInt(page)
                        })
                    } else {
                        return res.render('admin/transactionsOffer/list', {
                            title: 'Catalog Price Rule List',
                            arrData: '',
                            arrStore: storeList,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper: helper,
                            listCount: listCount,
                            pageCount: pageCount,
                            columnName: column,
                            orderType: order,
                            searchItem: search,
                            pageSize: pageSize,
                            currentPage: parseInt(page)
                        });
                    }                   
                }          
            }
        }	
    });
}


/**
 * Description: This function is developed for add/view for transactionsOffer
 * Developer: Surajit Gouri
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
                    return res.render('admin/transactionsOffer/addedit', {
                        title: 'Add Catalog Price Rule',
                        arrData: '',
                        stores: stores,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var transactionsOffer = await models.transactionsOffer.findOne({ where: { id: id } });
                    if (transactionsOffer) {
                        return res.render('admin/transactionsOffer/addedit', {
                            title: 'Edit Catalog Price Rule',
                            arrData: transactionsOffer,
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
                        return permission === 'CatalogPriceRuleView'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.transactionsOffer.findOne({ attributes: ['storeId'], where: { id: id } });
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
                        return res.render('admin/transactionsOffer/addedit', {
                            title: 'Add Catalog Price Rule',
                            arrData: '',
                            stores: stores,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        var transactionsOffer = await models.transactionsOffer.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (transactionsOffer) {
                            return res.render('admin/transactionsOffer/addedit', {
                                title: 'Edit Catalog Price Rule',
                                arrData: transactionsOffer,
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
 * Description: This function is developed for add/update New transactionsOffer
 * Developer:Surajit Gouri
 */

exports.addOrUpdate = function(req, res) {
   
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
                         return permission === 'CatalogPriceRuleAddEdit'
                     })                    
                 }
             }
             if (userPermission == false) {
                 req.flash('errors', 'Contact Your administrator for permission');
                 res.redirect('/admin/dashboard');
             } else {

                    var form = new multiparty.Form();
                    form.parse(req, function(err, fields, files) {
                    // return res.send(fields);
                    var id = fields.updateId[0];
                        if(!id){
                            models.transactionsOffer.create({ 
                                storeId: fields.storeId[0],
                                offerStatus: fields.offerStatus[0],
                                credit: fields.credit[0],
                                offerFrom: fields.offerFrom[0], 
                                offerTo: fields.offerTo[0],
                                status: fields.status[0],
                                createdBy: sessionUserId,
                            }).then(function(value) {
                                if(value) {
                                    req.flash('info','Successfully created');
                                    return res.redirect('/admin/transactionsOffer/list/1');
                                } else {
                                    req.flash('errors','Something went wrong');
                                }
                            }).catch(function(error) {
                                req.flash('errors','Something went wrong');
                            });
                        } else{
                            models.transactionsOffer.update({
                                storeId: fields.storeId[0],
                                offerStatus: fields.offerStatus[0],
                                credit: fields.credit[0],
                                offerFrom: fields.offerFrom[0], 
                                offerTo: fields.offerTo[0],
                                status: fields.status[0],
                                updatedBy: sessionUserId,
                            },{where:{id:id}}).then(function(value) {
                                if(value) {
                                    req.flash('info','Successfully updated');
                                    return res.redirect('/admin/transactionsOffer/list/1');
                                } else {
                                    req.flash('errors','Something went wrong');
                                }
                            }).catch(function(error) {
                                req.flash('errors','Something went wrong');
                            });
                        }
                    });

                }
        }

    });
};



/**
 * This function is developed for delete transactionsOffer
 * Developer:Surajit Gouri
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
                        return permission === 'CatalogPriceRuleDelete'
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
                
               
			    models.transactionsOffer.destroy({ 
                    where:{id:id}
                }).then(function(value) {
                    if(value) {
                        req.flash('info','Successfully deleted');
                        res.redirect('back');
                    } else {
                        req.flash('errors','Something went wrong');
                        res.redirect('back');
                    }
                });
			   
			   
			   
            }

        }
    });
}; 