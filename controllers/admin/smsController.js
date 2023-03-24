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
 * Description: This function is developed for listing sms
 * Developer: Partha Mandal
 */
exports.list = async function(req, res){
    var id = req.params.id;
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var role = req.session.role;
    var token= req.session.token;

    var currPage = req.query.page ? req.query.page : 0;
    var limit = req.query.limit ? req.query.limit <= 10 ? 10 : req.query.limit : 10;
    var offset = currPage != 0 ? currPage * limit - limit : 0;
    var keyword = req.query.search ? req.query.search.trim() : "";

    let column = req.query.column || 'id';
    let order = req.query.order || 'ASC';
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            if (sessionStoreId == null) {
                models.sms.count({                            
                    // where:{
                    //     title:{
                    //         [Op.like]:'%' + keyword+'%'    
                    //         }
                    // }, 
                    where:{
                        //storeId: sessionStoreId,
                        [Op.or]:[
                            {sms: {[Op.like]:`%${keyword}%`}}								
                        ],                            
                    },
                }).then(async function(smsCount){
                    if(smsCount){
                        models.sms.findAll({
                            attributes: ['id','customerId','sms'],
                            // where: {
                            //     title:{
                            //         [Op.like]:'%' + keyword+'%'            
                            //     }
                            // },
                            where:{
                                //storeId: sessionStoreId,
                                [Op.or]:[
                                    {sms: {[Op.like]:`%${keyword}%`}}								
                                ],                            
                            },
                            order: [[column, order]],
                            offset:offset,
                            limit : limit,
                        }).then(async function (sms) {
                            if(sms){
                                const itemCount = smsCount > 0 ? smsCount: 0;
                                const pageCount = smsCount > 0 ? Math.ceil(smsCount / limit): 1;
                                const previousPageLink = paginate.hasNextPages(req)(pageCount);
                                const startItemsNumber =currPage == 0 || currPage == 1 ? 1 : (currPage - 1) * limit + 1;
                                const endItemsNumber = pageCount == currPage || pageCount == 1 ? itemCount : currPage * limit;
                                return res.render('admin/sendSMS/list', {
                                    title: 'Our SMS',
                                    arrData: sms,
                                    
                                    messages: req.flash('info'),
                                    errors: req.flash('errors'),
                                    helper: helper,
                                    pageCount,
                                    itemCount,
                                    orderType: order,
                                    columnName: column,
                                    keyword: keyword,
                                    limit: limit,
                                    currentPage: currPage,
                                    previousPage: previousPageLink,
                                    startingNumber: startItemsNumber,
                                    endingNumber: endItemsNumber,
                                    pages: paginate.getArrayPages(req)(
                                        limit,
                                        pageCount,
                                        currPage
                                    ),
                                });
                            }
                        });
                    } else {
                        return res.render('admin/sendSMS/list', {
                            title: 'Our sms',
                            arrData: '',
                            
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper: helper,
                            pageCount: 0,
                            itemCount: 0,
                            orderType: order,
                            columnName: column,
                            keyword: keyword,
                            limit: limit,
                            currentPage: currPage,
                            previousPage: '',
                            startingNumber: '',
                            endingNumber: '',                                
                            pages: paginate.getArrayPages(req)(
                                limit,
                                0,
                                currPage,
                                keyword
                            ),
                        }); 
                    }
                });                
            } else {
                //*****Permission Assign Start
                var userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'SMSList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    models.sms.count({                            
                        // where:{
                        //     //storeId:sessionStoreId,
                        //     title:{
                        //         [Op.like]:'%' + keyword+'%'    
                        //         }
                        // },
                        where:{
                            storeId: sessionStoreId,
                            [Op.or]:[
                                {sms: {[Op.like]:`%${keyword}%`}}								
                            ],                            
                        },
                    }).then(async function(smsCount){
                    if(smsCount) {
                            models.sms.findAll({
                                attributes: ['id','customerId','sms'],
                                // where: {
                                //     storeId: sessionStoreId,
                                //     title:{
                                //         [Op.like]:'%' + keyword+'%'            
                                //     }
                                // },
                                where:{
                                    storeId: sessionStoreId,
                                    [Op.or]:[
                                        {sms: {[Op.like]:`%${keyword}%`}}							
                                    ],                            
                                },
                                order: [[column, order]],
                                offset:offset,
                                limit : limit,
                            }).then(async function (sms) {
                                if (sms) {
                                    const itemCount = smsCount > 0 ? smsCount: 0;
                                    const pageCount = smsCount > 0 ? Math.ceil(smsCount / limit): 1;
                                    const previousPageLink = paginate.hasNextPages(req)(pageCount);
                                    const startItemsNumber =currPage == 0 || currPage == 1 ? 1 : (currPage - 1) * limit + 1;
                                    const endItemsNumber = pageCount == currPage || pageCount == 1 ? itemCount : currPage * limit;
                                    return res.render('admin/sendSMS/list', {
                                        title: 'Our SMS',
                                        arrData: sms,
                                        arrCustomer: customerList,
                                        messages: req.flash('info'),
                                        errors: req.flash('errors'),
                                        helper: helper,
                                        pageCount,
                                        itemCount,
                                        orderType: order,
                                        columnName: column,
                                        keyword: keyword,
                                        limit: limit,
                                        currentPage: currPage,
                                        previousPage: previousPageLink,
                                        startingNumber: startItemsNumber,
                                        endingNumber: endItemsNumber,
                                        pages: paginate.getArrayPages(req)(
                                            limit,
                                            pageCount,
                                            currPage
                                        ),
                                    });
                                }
                            });
                    } else {
                            return res.render('admin/sendSMS/list', {
                                title: 'Our SMS',
                                arrData: '',
                                arrCustomer: customerList,
                                messages: req.flash('info'),
                                errors: req.flash('errors'),
                                helper: helper,
                                pageCount: 0,
                                itemCount: 0,
                                orderType: order,
                                columnName: column,
                                keyword: keyword,
                                limit: limit,
                                currentPage: currPage,
                                previousPage: '',
                                startingNumber: '',
                                endingNumber: '',
                                pages: paginate.getArrayPages(req)(
                                limit,
                                0,
                                currPage,
                                keyword
                            ),
                            });
                        }
                    });                    
                }          
            }
        }
	
    });
}

/**
 * Description: This function is developed for view for sms
 * Developer: Partha Mandal
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
                        return permission === 'SMSView'
                    })
                }
                if (id){
                    var storeIdChecking = await models.sms.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {

                var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                var customers = await models.customers.findAll({ attributes: ['id', 'firstName','lastName'], where: { status: 'Yes' } });
                var selectedCustomers = await models.smsstore.findAll({ where: { smId: id } });       

                if (!id) {
                    return res.render('admin/sendSMS/addedit', {
                        title: 'Manage SMS',
                        arrData:'',
                        stores: stores,
                        selectedCustomers:'',
                        customers: customers,
                        messages: req.flash('info'),
                        errors:req.flash('errors')
                    });
                } else {
                    models.sms.findOne({attributes: ['id','storeId','sms'],
                    where: {
                        id:id
                    },include: [
                        { model: models.smsstore}
                        ]
                    }).then(async function (sms) {
                        if(sms) {
                            return res.render('admin/sendSMS/addedit',{
                                title: 'Manage SMS',
                                arrData: sms,
                                stores: stores,
                                selectedCustomers: selectedCustomers,
                                customers: customers,
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

/**
 * Description: This function is developed for add/update New student
 * Developer: Partha Mandal
 */
exports.addOrUpdate = function(req, res) {
    var token= req.session.token;
    var customerId = req.session.user.customerId;
    var sessionUserId = req.session.user.id;
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
                        return permission === 'SMSAddEdit'
                    })                    
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {

                // var id = fields.updateId[0];
                var form = new multiparty.Form();
                form.parse(req, async function(err, fields, files) {
                            var id = fields.updateId[0];
                        if(!id){
                            models.sms.create({
                                sms: fields.sms[0],
                
                            }).then(function(value) {
                                for(let customerId of fields.customerId){
                                    models.smsstore.create({
                                        smId: value.id,
                                        customerId: customerId
                                    })
                                }
                                req.flash('info','Successfully SMS created');
                                return res.redirect('/admin/sendSMS/list/1');
                            }).catch(function(error) {
                                req.flash('errors','Something went wrong');
                            });
                        } else{   

                            if(fields.customerId != ''){
                                models.smsstore.destroy({ 
                                    where: { smId: id }
                                })
                            }
                            models.sms.update({
                                sms: fields.sms[0],
                
                            },{where:{id:id}}).then(function(value) {
                                
                                for(let customerId of fields.customerId){
                                    models.smsstore.create({
                                        smId: id,
                                        customerId: customerId
                                    })
                                }
                                if(value) {
                                    req.flash('info','Successfully SMS updated');
                                    return res.redirect('/admin/sendSMS/list/1');
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
 * This function is developed for delete student
 * Developer: Partha Mandal
 */
exports.delete = function(req, res) {

    var sessionStoreId = req.session.user.storeId;
    var token= req.session.token;
    var role = req.session.role;
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
                        return permission === 'SMSDelete'
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
                
                models.sms.destroy({ 
                    where: { id: id }
                }).then(function(value) {
                    if(value) {
                        req.flash('info','Successfully sms deleted');
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