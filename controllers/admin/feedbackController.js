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
const excel = require("exceljs");

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
 * Description: This function is developed for Feedback listing 
 * Developer: Surajit Gouri
 */
exports.list = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    let column = req.query.column || 'id';
    let order = req.query.order || 'ASC';
    let pagesizes = req.query.pagesize || 10;
    let pageSize = parseInt(pagesizes);
    let page = req.params.page || 1;
    let search = req.query.search || '';
    let customer = req.query.customer || '';
    let fdate = req.query.fdate || '';
    let tdate = req.query.tdate || '';
    let status = req.query.status || '';

    const start = new Date(fdate)
    start.setHours(0,0,0,0)
    const end = new Date(tdate)
    end.setHours(23,59,59,999)

    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {

                let whereCondition
                if (customer !='' && status =='' && fdate =='' && tdate =='') {
                    whereCondition = {customerId:customer}
                }else if(fdate !='' && customer =='' && status =='' && tdate ==''){
                    whereCondition = {createdAt: {$gte: start}}
                }else if(fdate =='' && customer =='' && status =='' && tdate !=''){
                    whereCondition = {createdAt: {$lte: end}}
                }else if(status !='' && fdate =='' && customer =='' && tdate ==''){
                    whereCondition = {status:status}
                }else if(customer!='' && status !='' && fdate =='' && tdate ==''){
                    whereCondition = {customerId:customer,status:status}
                }else if(customer!='' && fdate !='' && status =='' && tdate ==''){
                    whereCondition = {customerId:customer,createdAt:{$gte: start}}
                }else if(customer!='' && fdate =='' && status =='' && tdate !=''){
                    whereCondition = {customerId:customer,createdAt:{$lte: end}}
                }else if(fdate!='' && status !='' && customer =='' && tdate ==''){
                    whereCondition = {createdAt:{$gte: start},status:status}
                }else if(fdate=='' && status !='' && customer =='' && tdate !=''){
                    whereCondition = {createdAt:{$lte: end},status:status}
                }else if(fdate!='' && status =='' && customer =='' && tdate !=''){
                    whereCondition = {createdAt:{$gte: start, $lte: end}}
                }else if(customer !='' && status !='' && fdate !='' && tdate ==''){
                    whereCondition = {customerId:customer,status:status,createdAt:{$gte: start}}
                }else if(customer !='' && status =='' && fdate !='' && tdate !=''){
                    whereCondition = {customerId:customer,createdAt:{$gte: start, $lte: end}}
                }else if(customer =='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {status:status,createdAt:{$gte: start, $lte: end}}
                }else if(customer !='' && status !='' && fdate =='' && tdate !=''){
                    whereCondition = {status:status,customerId:customer,createdAt:{$lte: end}}
                }else if(customer!='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {customerId:customer,status:status, createdAt:{$gte: start, $lte: end}}
                }

                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                let orderList = await models.orders.findAll({ attributes: ['id', 'orderNo'] });
                let feedbackCustomers = await models.feedback.findAll({attributes:['customerId']})
                let customerList = []

                if(feedbackCustomers.length>0){
                    for(let customer of feedbackCustomers){
                        let customerName = await models.customers.findAll({attributes:['id','firstName','lastName'], where:{id: customer.customerId}});

                        let c = {}
                        c.id = customerName[0].id
                        c.name = customerName[0].firstName + ' ' + customerName[0].lastName
                        customerList.push(c)
                    }
                }
                let feedbackList
                let listCount

                if(customer!='' || status !='' || fdate !='' || tdate !=''){
                    feedbackList = await models.feedback.findAll({ where: whereCondition , order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                    listCount = await models.feedback.count({ where: whereCondition});
                }else{
                    feedbackList = await models.feedback.findAll({ where: {
                        [Op.or]: [
                            {rating: {[Op.like]:`%${search}%`}},
                            {message: {[Op.like]:`%${search}%`}},
                            {reply: {[Op.like]:`%${search}%`}},
                            {status: {[Op.like]:`%${search}%`}} 
                        ]
                    }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                    listCount = await models.feedback.count({ where: {
                        [Op.or]: [
                            {rating: {[Op.like]:`%${search}%`}},
                            {message: {[Op.like]:`%${search}%`}},
                            {reply: {[Op.like]:`%${search}%`}},
                            {status: {[Op.like]:`%${search}%`}} 
                        ]
                    }});
                } 

                let pageCount = Math.ceil(listCount/pageSize);

                if (feedbackList) {
                    return res.render('admin/feedback/list', {
                        title: 'Feedback List',
                        arrData: feedbackList,
                        arrStore: storeList,
                        arrCustomer: customerList,
                        orderList: orderList,
                        sessionStoreId: '',
                        listCount: listCount,
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        searchItem: search,
                        customerFilter: customer,
                        fdateFilter: fdate,
                        tdateFilter: tdate,
                        statusFilter: status,
                        pageSize: pageSize,
                        currentPage: parseInt(page),
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } else {
                    return res.render('admin/feedback/list', {
                        title: 'Feedback List',
                        arrData: [],
                        arrStore: storeList,
                        arrCustomer: customerList,
                        orderList: [],
                        sessionStoreId: '',
                        customerFilter: customer,
                        fdateFilter: fdate,
                        tdateFilter: tdate,
                        statusFilter: status,
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
                        return permission === 'FeedbackList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {

                    let whereCondition
                    if (customer !='' && status =='' && fdate =='' && tdate =='') {
                        whereCondition = {customerId:customer,storeId: sessionStoreId}
                    }else if(fdate !='' && customer =='' && status =='' && tdate ==''){
                        whereCondition = {createdAt: {$gte: start},storeId: sessionStoreId}
                    }else if(fdate =='' && customer =='' && status =='' && tdate !=''){
                        whereCondition = {createdAt: {$lte: end},storeId: sessionStoreId}
                    }else if(status !='' && fdate =='' && customer =='' && tdate ==''){
                        whereCondition = {status:status,storeId: sessionStoreId}
                    }else if(customer!='' && status !='' && fdate =='' && tdate ==''){
                        whereCondition = {customerId:customer,status:status,storeId: sessionStoreId}
                    }else if(customer!='' && fdate !='' && status =='' && tdate ==''){
                        whereCondition = {customerId:customer,createdAt:{$gte: start},storeId: sessionStoreId}
                    }else if(customer!='' && fdate =='' && status =='' && tdate !=''){
                        whereCondition = {customerId:customer,createdAt:{$lte: end},storeId: sessionStoreId}
                    }else if(fdate!='' && status !='' && customer =='' && tdate ==''){
                        whereCondition = {createdAt:{$gte: start},status:status,storeId: sessionStoreId}
                    }else if(fdate=='' && status !='' && customer =='' && tdate !=''){
                        whereCondition = {createdAt:{$lte: end},status:status,storeId: sessionStoreId}
                    }else if(fdate!='' && status =='' && customer =='' && tdate !=''){
                        whereCondition = {createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }else if(customer !='' && status !='' && fdate !='' && tdate ==''){
                        whereCondition = {customerId:customer,status:status,createdAt:{$gte: start},storeId: sessionStoreId}
                    }else if(customer !='' && status =='' && fdate !='' && tdate !=''){
                        whereCondition = {customerId:customer,createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }else if(customer =='' && status !='' && fdate !='' && tdate !=''){
                        whereCondition = {status:status,createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }else if(customer !='' && status !='' && fdate =='' && tdate !=''){
                        whereCondition = {status:status,customerId:customer,createdAt:{$lte: end},storeId: sessionStoreId}
                    }else if(customer!='' && status !='' && fdate !='' && tdate !=''){
                        whereCondition = {customerId:customer,status:status, createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }

                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} })
                    let orderList = await models.orders.findAll({ attributes: ['id', 'orderNo'], where:{storeId: sessionStoreId} });
                    let feedbackCustomers = await models.feedback.findAll({attributes:['customerId'], where:{storeId: sessionStoreId}})

                    let customerList = []

                    if(feedbackCustomers.length>0){
                        for(let customer of feedbackCustomers){
                            let customerName = await models.customers.findAll({attributes:['id','firstName','lastName'], where:{id: customer.customerId}});

                            let c = {}
                            c.id = customerName[0].id
                            c.name = customerName[0].firstName + ' ' + customerName[0].lastName
                            customerList.push(c)
                        }
                    }

                    let feedbackList
                    let listCount

                    if(customer!='' || status !='' || fdate !='' || tdate !=''){
                        feedbackList = await models.feedback.findAll({ where: whereCondition , order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                        listCount = await models.feedback.count({ where: whereCondition })
                    }else{
                        feedbackList = await models.feedback.findAll({ where: {storeId: sessionStoreId,
                            [Op.or]: [
                                {rating: {[Op.like]:`%${search}%`}},
                                {message: {[Op.like]:`%${search}%`}},
                                {reply: {[Op.like]:`%${search}%`}},
                                {status: {[Op.like]:`%${search}%`}} 
                            ]
                        }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                        listCount = await models.feedback.count({ where: {storeId: sessionStoreId,
                            [Op.or]: [
                                {rating: {[Op.like]:`%${search}%`}},
                                {message: {[Op.like]:`%${search}%`}},
                                {reply: {[Op.like]:`%${search}%`}},
                                {status: {[Op.like]:`%${search}%`}} 
                            ]
                        }})
                    }

                    let pageCount = Math.ceil(listCount/pageSize);

                    if (feedbackList) {
                        return res.render('admin/feedback/list', {
                            title: 'Feedback List',
                            arrData: feedbackList,
                            arrStore: storeList,
                            arrCustomer: customerList,
                            orderList: orderList,
                            sessionStoreId: sessionStoreId,
                            listCount: listCount,
                            pageCount: pageCount,
                            columnName: column,
                            orderType: order,
                            searchItem: search,
                            customerFilter: customer,
                            fdateFilter: fdate,
                            tdateFilter: tdate,
                            statusFilter: status,
                            pageSize: pageSize,
                            currentPage: parseInt(page),
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                        });
                    } else {
                        return res.render('admin/feedback/list', {
                            title: 'Feedback List',
                            arrData: [],
                            customerFilter: customer,
                            orderList: [],
                            fdateFilter: fdate,
                            tdateFilter: tdate,
                            statusFilter: status,
                            arrStore: storeList,
                            arrCustomer: customerList,
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
 * Description: This function is developed for add/view for Feedback
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
                var customers = await models.customers.findAll({ attributes: ['id', 'firstName','lastName'], where: { status: 'Yes' } });
                var orders = await models.orders.findAll({ attributes: ['id'] });
                if (!id) {
                    return res.render('admin/feedback/addedit', {
                        title: 'Add Feedback',
                        arrData: '',
                        stores: stores,
                        customers: customers,
                        orders: orders,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var feedback = await models.feedback.findOne({ where: { id: id } });
                    if (feedback) {
                        return res.render('admin/feedback/addedit', {
                            title: 'Edit Feedback',
                            arrData: feedback,
                            stores: stores,
                            customers: customers,
                            orders: orders,
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
                        return permission === 'FeedbackView'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.feedback.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId, status: 'Yes' } });
                    var customers = await models.customers.findAll({ attributes: ['id', 'firstName','lastName'], where: { storeId: sessionStoreId, status: 'Yes' } });
                    var orders = await models.orders.findAll({ attributes: ['id'], where: { storeId: sessionStoreId, status: 'Yes' } });

                    if (!id) {
                        return res.render('admin/feedback/addedit', {
                            title: 'Add Feedback',
                            arrData: '',
                            stores: stores,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        var feedback = await models.feedback.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (feedback) {
                            return res.render('admin/feedback/addedit', {
                                title: 'Edit Feedback',
                                arrData: feedback,
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
 * Description: This function is developed for add/update New feedback
 * Developer:Surajit Gouri
 */

exports.addOrUpdate = function(req, res) {
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
                        return permission === 'FeedbackAddEdit'
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
                            models.feedback.create({ 
                                storeId: fields.storeId[0],
                                customerId: fields.customerId[0],
                                orderId: fields.orderId[0],
                                rating: fields.rating[0], 
                                message: fields.message[0],
                                reply: fields.reply[0],
                                status: fields.status[0],
                                createdBy: sessionUserId,
                            }).then(function(value) {
                                if(value) {
                                    req.flash('info','Successfully feedback created');
                                    return res.redirect('/admin/feedback/list/1');
                                } else {
                                    req.flash('errors','Something went wrong');
                                }
                            }).catch(function(error) {
                                req.flash('errors','Something went wrong');
                            });
                        } else{
                            models.feedback.update({
                                storeId: fields.storeId[0],
                                customerId: fields.customerId[0],
                                orderId: fields.orderId[0],
                                rating: fields.rating[0], 
                                message: fields.message[0],
                                reply: fields.reply[0],
                                status: fields.status[0],
                                updatedBy: sessionUserId,
                            },{where:{id:id}}).then(function(value) {
                                if(value) {
                                    req.flash('info','Successfully feedback updated');
                                    return res.redirect('/admin/feedback/list/1');
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
 * This function is developed for delete feedback
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
                        return permission === 'FeedbackDelete'
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
                
               
			    models.feedback.destroy({ 
                    where:{id:id}
                }).then(function(value) {
                    if(value) {
                        req.flash('info','Successfully  feedback deleted');
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


/**
 * Description: This function is developed for Feedback export 
 * Developer: Partha Mandal
 */
exports.exportData = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    let search = req.query.search || '';
    let customer = req.query.customer || '';
    let fdate = req.query.fdate || '';
    let tdate = req.query.tdate || '';
    let status = req.query.status || '';

    const start = new Date(fdate)
    start.setHours(0,0,0,0)
    const end = new Date(tdate)
    end.setHours(23,59,59,999)

    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {

                let whereCondition
                if (customer !='' && status =='' && fdate =='' && tdate =='') {
                    whereCondition = {customerId:customer}
                }else if(fdate !='' && customer =='' && status =='' && tdate ==''){
                    whereCondition = {createdAt: {$gte: start}}
                }else if(fdate =='' && customer =='' && status =='' && tdate !=''){
                    whereCondition = {createdAt: {$lte: end}}
                }else if(status !='' && fdate =='' && customer =='' && tdate ==''){
                    whereCondition = {status:status}
                }else if(customer!='' && status !='' && fdate =='' && tdate ==''){
                    whereCondition = {customerId:customer,status:status}
                }else if(customer!='' && fdate !='' && status =='' && tdate ==''){
                    whereCondition = {customerId:customer,createdAt:{$gte: start}}
                }else if(customer!='' && fdate =='' && status =='' && tdate !=''){
                    whereCondition = {customerId:customer,createdAt:{$lte: end}}
                }else if(fdate!='' && status !='' && customer =='' && tdate ==''){
                    whereCondition = {createdAt:{$gte: start},status:status}
                }else if(fdate=='' && status !='' && customer =='' && tdate !=''){
                    whereCondition = {createdAt:{$lte: end},status:status}
                }else if(fdate!='' && status =='' && customer =='' && tdate !=''){
                    whereCondition = {createdAt:{$gte: start, $lte: end}}
                }else if(customer !='' && status !='' && fdate !='' && tdate ==''){
                    whereCondition = {customerId:customer,status:status,createdAt:{$gte: start}}
                }else if(customer !='' && status =='' && fdate !='' && tdate !=''){
                    whereCondition = {customerId:customer,createdAt:{$gte: start, $lte: end}}
                }else if(customer =='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {status:status,createdAt:{$gte: start, $lte: end}}
                }else if(customer !='' && status !='' && fdate =='' && tdate !=''){
                    whereCondition = {status:status,customerId:customer,createdAt:{$lte: end}}
                }else if(customer!='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {customerId:customer,status:status, createdAt:{$gte: start, $lte: end}}
                }

                let feedbackList

                if(customer!='' || status !='' || fdate !='' || tdate !=''){
                    feedbackList = await models.feedback.findAll({ where: whereCondition});
                }else{
                    feedbackList = await models.feedback.findAll({ where: {
                        [Op.or]: [
                            {rating: {[Op.like]:`%${search}%`}},
                            {message: {[Op.like]:`%${search}%`}},
                            {reply: {[Op.like]:`%${search}%`}},
                            {status: {[Op.like]:`%${search}%`}} 
                        ]
                    } });
                }
                
                let arrData = [];
                if (feedbackList) {
                    for(let feedback of feedbackList){
                        let customers = await models.customers.findAll({ attributes: ['firstName','lastName'], where: { id: feedback.customerId}});

                        let feed = feedback.dataValues;
                        if(customers.length>0){
                        feed.customerName = customers[0].firstName + ' ' + customers[0].lastName
                        }else{
                        feed.customerName = ''
                        }

                        let orders = await models.orders.findAll({ attributes: ['orderNo'], where: { id: feedback.orderId}});

                        if(orders.length>0){
                        feed.orderNo = '#'+orders[0].orderNo
                        }else{
                        feed.orderNo = ''
                        }

                        arrData.push(feed)
                    }
                }

                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Feedbacks");
            
                worksheet.columns = [
                    { header: "Customer Name", key: "customerName", width:15 },
                    { header: "Order No", key: "orderNo", width: 15 },
                    { header: "Rating", key: "rating", width: 5 },
                    { header: "Message", key: "message", width: 30 },
                    { header: "Reply", key: "message", reply: 30 },
                    { header: "Status", key: "status", width: 15 },
                    { header: "Date", key: "createdAt", width: 15 },
                ];
            
                // Add Array Rows
                worksheet.addRows(arrData);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Feedbacks.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })


            }else{

                let whereCondition
                if (customer !='' && status =='' && fdate =='' && tdate =='') {
                    whereCondition = {customerId:customer,storeId: sessionStoreId}
                }else if(fdate !='' && customer =='' && status =='' && tdate ==''){
                    whereCondition = {createdAt: {$gte: start},storeId: sessionStoreId}
                }else if(fdate =='' && customer =='' && status =='' && tdate !=''){
                    whereCondition = {createdAt: {$lte: end},storeId: sessionStoreId}
                }else if(status !='' && fdate =='' && customer =='' && tdate ==''){
                    whereCondition = {status:status,storeId: sessionStoreId}
                }else if(customer!='' && status !='' && fdate =='' && tdate ==''){
                    whereCondition = {customerId:customer,status:status,storeId: sessionStoreId}
                }else if(customer!='' && fdate !='' && status =='' && tdate ==''){
                    whereCondition = {customerId:customer,createdAt:{$gte: start},storeId: sessionStoreId}
                }else if(customer!='' && fdate =='' && status =='' && tdate !=''){
                    whereCondition = {customerId:customer,createdAt:{$lte: end},storeId: sessionStoreId}
                }else if(fdate!='' && status !='' && customer =='' && tdate ==''){
                    whereCondition = {createdAt:{$gte: start},status:status,storeId: sessionStoreId}
                }else if(fdate=='' && status !='' && customer =='' && tdate !=''){
                    whereCondition = {createdAt:{$lte: end},status:status,storeId: sessionStoreId}
                }else if(fdate!='' && status =='' && customer =='' && tdate !=''){
                    whereCondition = {createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                }else if(customer !='' && status !='' && fdate !='' && tdate ==''){
                    whereCondition = {customerId:customer,status:status,createdAt:{$gte: start},storeId: sessionStoreId}
                }else if(customer !='' && status =='' && fdate !='' && tdate !=''){
                    whereCondition = {customerId:customer,createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                }else if(customer =='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {status:status,createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                }else if(customer !='' && status !='' && fdate =='' && tdate !=''){
                    whereCondition = {status:status,customerId:customer,createdAt:{$lte: end},storeId: sessionStoreId}
                }else if(customer!='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {customerId:customer,status:status, createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                }
                
                let feedbackList

                if(customer!='' || status !='' || fdate !='' || tdate !=''){
                    feedbackList = await models.feedback.findAll({ where: whereCondition});
                }else{
                    feedbackList = await models.feedback.findAll({ where: {storeId: sessionStoreId,
                        [Op.or]: [
                            {rating: {[Op.like]:`%${search}%`}},
                            {message: {[Op.like]:`%${search}%`}},
                            {reply: {[Op.like]:`%${search}%`}},
                            {status: {[Op.like]:`%${search}%`}} 
                        ]
                    } });
                }

                let arrData = [];
                if (feedbackList) {
                    for(let feedback of feedbackList){
                        let customers = await models.customers.findAll({ attributes: ['firstName','lastName'], where: { id: feedback.customerId}});

                        let feed = feedback.dataValues;
                        if(customers.length>0){
                        feed.customerName = customers[0].firstName + ' ' + customers[0].lastName
                        }else{
                        feed.customerName = ''
                        }

                        let orders = await models.orders.findAll({ attributes: ['orderNo'], where: { id: feedback.orderId}});

                        if(orders.length>0){
                        feed.orderNo = '#'+orders[0].orderNo
                        }else{
                        feed.orderNo = ''
                        }

                        arrData.push(feed)
                    }
                }
                
                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Feedbacks");
            
                worksheet.columns = [
                    { header: "Customer Name", key: "customerName", width:15 },
                    { header: "Order No", key: "orderNo", width: 15 },
                    { header: "Rating", key: "rating", width: 5 },
                    { header: "Message", key: "message", width: 30 },
                    { header: "Reply", key: "message", reply: 30 },
                    { header: "Status", key: "status", width: 15 },
                    { header: "Date", key: "createdAt", width: 15 },
                ];
            
                // Add Array Rows
                worksheet.addRows(arrData);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Feedbacks.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })

                    
            }            
        }	
    });
}