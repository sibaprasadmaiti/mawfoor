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
 * Description: This function is developed for Coupon Transaction listing 
 * Developer: Surajit Gouri
 */

exports.list = async function(req, res){
    var sessionStoreId = req.session.user.storeId;
    //var sessionUserId = req.session.user.id;
    var role = req.session.role;
    var token= req.session.token;

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
            var customerList = await models.customers.findAll({attributes:['id','firstName','lastName'],where:{status:'Yes'}});
            var storeList = await models.stores.findAll({attributes:['id','storeName','storeCode'],where:{status:'Yes'}});

            if (sessionStoreId == null) {
                let listCount = await models.couponTransaction.count({ where:{
                    [Op.or]:[
                        {customerId: {[Op.like]:`%${search}%`}},
                        {couponType: {[Op.like]:`%${search}%`}},
                        {couponValue: {[Op.like]:`%${search}%`}},
                        {dateFrom: {[Op.like]:`%${search}%`}},
                        {dateTo: {[Op.like]:`%${search}%`}},
                        {couponCode: {[Op.like]:`%${search}%`}},
                        {status: {[Op.like]:`%${search}%`}}								
                    ]                         
                }})
                let pageCount = Math.ceil(listCount/pageSize);
                        
                let couponTransactionList = await models.couponTransaction.findAll({ where:{
                    [Op.or]:[
                        {customerId: {[Op.like]:`%${search}%`}},
                        {couponType: {[Op.like]:`%${search}%`}},
                        {couponValue: {[Op.like]:`%${search}%`}},
                        {dateFrom: {[Op.like]:`%${search}%`}},
                        {dateTo: {[Op.like]:`%${search}%`}},
                        {couponCode: {[Op.like]:`%${search}%`}},
                        {status: {[Op.like]:`%${search}%`}}								
                    ],                            
                },order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize})
    
                if(couponTransactionList){
                    return res.render('admin/couponTransaction/list', {
                        title: 'Cart Price Rule List',
                        arrData: couponTransactionList,
                        arrCustomer: customerList,
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
                    return res.render('admin/couponTransaction/list', {
                        title: 'Cart Price Rule List',
                        arrData: '',
                        arrCustomer: customerList,
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
                        return permission === 'CartPriceRuleList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let listCount = await models.couponTransaction.count({ where:{storeId: sessionStoreId,
                        [Op.or]:[
                            {customerId: {[Op.like]:`%${search}%`}},
                            {couponType: {[Op.like]:`%${search}%`}},
                            {couponValue: {[Op.like]:`%${search}%`}},
                            {dateFrom: {[Op.like]:`%${search}%`}},
                            {dateTo: {[Op.like]:`%${search}%`}},
                            {couponCode: {[Op.like]:`%${search}%`}},
                            {status: {[Op.like]:`%${search}%`}}								
                        ]                         
                    }})
                    let pageCount = Math.ceil(listCount/pageSize);
                            
                    let couponTransactionList = await models.couponTransaction.findAll({ where:{storeId: sessionStoreId,
                        [Op.or]:[
                            {customerId: {[Op.like]:`%${search}%`}},
                            {couponType: {[Op.like]:`%${search}%`}},
                            {couponValue: {[Op.like]:`%${search}%`}},
                            {dateFrom: {[Op.like]:`%${search}%`}},
                            {dateTo: {[Op.like]:`%${search}%`}},
                            {couponCode: {[Op.like]:`%${search}%`}},
                            {status: {[Op.like]:`%${search}%`}}								
                        ],                            
                    },order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize})
        
                    if(couponTransactionList){
                        return res.render('admin/couponTransaction/list', {
                            title: 'Cart Price Rule List',
                            arrData: couponTransactionList,
                            arrCustomer: customerList,
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
                        return res.render('admin/couponTransaction/list', {
                            title: 'Cart Price Rule List',
                            arrData: '',
                            arrCustomer: customerList,
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
 * Description: This function is developed for add/view for Coupon Transaction
 * Developer: Surajit Gouri
 */
exports.view = async function(req, res){
    var id = req.params.id;
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var role = req.session.role;
    var token= req.session.token;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {

            if(sessionStoreId==null){
                var stores = await models.stores.findAll({attributes:['id','storeName'],where:{status:'Yes'}});
            } else {
                var stores = await models.stores.findAll({attributes:['id','storeName'],where:{id:sessionStoreId,status:'Yes'}});        
            }
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
                        return permission === 'CartPriceRuleView'
                    })
                }
                if (id){
                    var storeIdChecking = await models.couponTransaction.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                var customers = await models.customers.findAll({ attributes: ['id', 'firstName','lastName'], where: { status: 'Yes' } });
                var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });

                if (!id) {
                    return res.render('admin/couponTransaction/addedit', {
                        title: 'Add Cart Price Rule',
                        arrData:'',
                        customers: customers,
                        stores: stores,
                        messages: req.flash('info'),
                        errors:req.flash('errors')
                    });
                } else {
                    models.couponTransaction.findOne({
                        where:{
                            id:id
                        }
                    }).then(async function (couponTransaction) {
                        if(couponTransaction) {
                            return res.render('admin/couponTransaction/addedit',{
                                title: 'Edit Cart Price Rule',
                                arrData: couponTransaction,
                                customers: customers,
                                stores: stores,
                                messages: req.flash('info'),
                                errors:req.flash('errors')
                            });
                        }
                    });
                }
            }
        
        }
    });
};

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
                var customers = await models.customers.findAll({ attributes: ['id', 'firstName','lastName'], where: { status: 'Yes' } });
                if (!id) {
                    return res.render('admin/couponTransaction/addedit', {
                        title: 'Add Cart Price Rule',
                        arrData: '',
                        stores: stores,
                        customers: customers,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var couponTransaction = await models.couponTransaction.findOne({ where: { id: id } });
                    if (couponTransaction) {
                        return res.render('admin/couponTransaction/addedit', {
                            title: 'Edit Cart Price Rule',
                            arrData: couponTransaction,
                            stores: stores,
                            customers: customers,
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
                        return permission === 'CartPriceRuleView'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.couponTransaction.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId, status: 'Yes' } });
                    var customers = await models.customers.findAll({ attributes: ['id', 'firstName','lastName'], where: { storeId:sessionStoreId, status: 'Yes' } });
                    if (!id) {
                        return res.render('admin/couponTransaction/addedit', {
                            title: 'Add Cart Price Rule',
                            arrData: '',
                            stores: stores,
                            customers: customers,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        var couponTransaction = await models.couponTransaction.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (couponTransaction) {
                            return res.render('admin/couponTransaction/addedit', {
                                title: 'Edit Cart Price Rule',
                                arrData: couponTransaction,
                                stores: stores,
                                customers: customers,
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
 * Description: This function is developed for add/update New Coupon Transaction
 * Developer:Surajit Gouri
 */
exports.addOrUpdate = function(req, res) {
   
    var sessionStoreId = req.session.user.storeId;
    //var sessionUserId = req.session.user.id;
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
                         return permission === 'CartPriceRuleAddEdit'
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
                            models.couponTransaction.create({
                                
                                customerId: fields.customerId[0],
                                storeId: fields.storeId[0],
                                couponId: fields.couponId[0],
                                appliedAmount: fields.appliedAmount[0],
                                couponType: fields.couponType[0],
                                couponValue: fields.couponValue[0],
                                dateFrom: fields.dateFrom[0],
                                dateTo: fields.dateTo[0],
                                timeFrom: fields.timeFrom[0],
                                timeTo: fields.timeTo[0],
                                couponCode: fields.couponCode[0],
                                purchaseLimit: fields.purchaseLimit[0],
                                isShare: fields.isShare[0],
                                status: fields.status[0],
                                createdBy: sessionUserId,
                            }).then(function(value) {
                                if(value) {
                                    req.flash('info','Successfully created');
                                    return res.redirect('/admin/couponTransaction/list/1');
                                } else {
                                    req.flash('errors','Something went wrong');
                                }
                            }).catch(function(error) {
                                req.flash('errors','Something went wrong');
                            });
                        } else {
                            models.couponTransaction.update({
                               
                                customerId: fields.customerId[0],
                                storeId: fields.storeId[0],
                                couponId: fields.couponId[0],
                                appliedAmount: fields.appliedAmount[0],
                                couponType: fields.couponType[0],
                                couponValue: fields.couponValue[0],
                                dateFrom: fields.dateFrom[0],
                                dateTo: fields.dateTo[0],
                                timeFrom: fields.timeFrom[0],
                                timeTo: fields.timeTo[0],
                                couponCode: fields.couponCode[0],
                                purchaseLimit: fields.purchaseLimit[0],
                                isShare: fields.isShare[0],
                                status: fields.status[0],
                                updatedBy: sessionUserId,
                            },{where:{id:id}}).then(function(value) {
                                if(value) {
                                    req.flash('info','Successfully updated');
                                    return res.redirect('/admin/couponTransaction/list/1');
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
 * This function is developed for delete Coupon Transaction
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
                        return permission === 'CartPriceRuleDelete'
                    })
                }
                var storeIdChecking = await models.couponTransaction.findOne({attributes:['storeId'],where:{id:id}});
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
                

                models.couponTransaction.destroy({ 
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