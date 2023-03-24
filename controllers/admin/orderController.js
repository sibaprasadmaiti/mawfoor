var helpers = require('../../helpers/helper_functions.js');
var models = require('../../models');
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
var flash = require('connect-flash');
var config = require('../../config/config.json');
const sms_controller = require('../sms/smsController.js');
var push_notifications = require('../../helpers/push_notifications');
var helper = require('../../helpers/helper_functions');
const excel = require('exceljs');
var Sequelize = require("sequelize");
const Op = Sequelize.Op
var sequelize = new Sequelize(
config.development.database, 
config.development.username,
config.development.password, {
    host: 'localhost',
    dialect: 'mysql',

    pool: {
    max: 5,
    min: 0,
    idle: 10000
    },
    // SQLite only
    //storage: 'path/to/database.sqlite'
});

// // For Mail Send Through MailGun
// const emailConfig = require('../../config/email-config')();
// const mailgun = require('mailgun-js')(emailConfig);
// // var sms_controller = require('../sms/smsController');
// const sms_controller = require('../sms/smsController.js');




/**
 * This function is developed for listing Orders
 * Developer: Partha Mandal
*/

exports.orderList = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;

    let column = req.query.column || 'id';
    let order = req.query.order || 'DESC';
    let pagesizes = req.query.pagesize || 10;
    let pageSize = parseInt(pagesizes);
    let page = req.params.page || 1;

    let search = req.query.search || '';

    let orderNo = req.query.orderNo || '';
    let fdate = req.query.fdate || '';
    let tdate = req.query.tdate || '';
    let orderStatus = req.query.status || '';

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

                 //let whereCondition
                // if (orderNo !='' && fdate =='' && tdate =='' && orderStatus =='') {
                //     whereCondition = {orderNo:orderNo}
                // } else if(fdate !='' && tdate =='' && orderNo =='' && orderStatus ==''){
                //     whereCondition = { createdAt : {$gte: start}}
                // } else if(tdate !='' && fdate =='' && orderNo =='' && orderStatus ==''){
                //     whereCondition = { createdAt : {$lte: end}}
                // } else if(fdate !='' && tdate !='' && orderNo =='' && orderStatus ==''){
                //     whereCondition = { createdAt : {$gte: start, $lte: end}}
                // }else if(orderStatus !='' && fdate =='' && tdate =='' && orderNo ==''){
                //     whereCondition = {orderStatus:orderStatus}
                // }else if(orderNo!='' && orderStatus !='' && fdate =='' && tdate ==''){
                //     whereCondition = {orderNo:orderNo,orderStatus:orderStatus}
                // }else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus ==''){
                //     whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end}}
                // }else if(fdate !='' && tdate !='' && orderStatus !='' && orderNo ==''){
                //     whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus}
                // }else if(orderNo!='' && orderStatus !='' && fdate !='' && tdate ==''){
                //     whereCondition = {orderNo:orderNo,orderStatus:orderStatus, createdAt : {$gte: start, $lte: end}}
                // }
                
            let whereCondition
                if (orderNo !='' && fdate =='' && tdate =='' && orderStatus =='') {
                    whereCondition = {orderNo:orderNo}
                } else if(fdate !='' && tdate =='' && orderNo =='' && orderStatus ==''){
                    whereCondition = { createdAt : {$gte: start}}
                } else if(tdate !='' && fdate =='' && orderNo =='' && orderStatus ==''){
                    whereCondition = { createdAt : {$lte: end}}
                } else if(orderStatus !='' && fdate =='' && tdate =='' && orderNo ==''){
                    whereCondition = {orderStatus:orderStatus}

                } else if(orderNo !='' && fdate !='' && tdate =='' && orderStatus ==''){
                    whereCondition = {orderNo:orderNo,createdAt : {$gte: start}}
                } else if(orderNo !='' && tdate !='' && fdate =='' && orderStatus ==''){
                    whereCondition = {orderNo:orderNo,createdAt : {$lte: end}}
                }else if(orderNo!='' && orderStatus !='' && fdate =='' && tdate ==''){
                    whereCondition = {orderNo:orderNo,orderStatus:orderStatus}

                }else if(fdate !='' && tdate !='' && orderNo=='' && orderStatus =='' ){
                    whereCondition = {createdAt : {$gte: start, $lte: end}}
                }else if(fdate !='' && orderStatus !='' && orderNo=='' && tdate =='' ){
                    whereCondition = {createdAt : {$gte: start},orderStatus:orderStatus}

                }else if(tdate !='' && orderStatus !='' && orderNo=='' && fdate =='' ){
                    whereCondition = {createdAt : {$lte: end},orderStatus:orderStatus}
                

                }else if( fdate !='' && tdate !='' && orderStatus !='' && orderNo ==''){
                    whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus}
                }else if(orderNo !=''  && tdate !='' && orderStatus !='' && fdate ==''){
                    whereCondition = {orderNo:orderNo,createdAt : { $lte: end},orderStatus:orderStatus}
                }else if(orderNo !='' && fdate !=''  && orderStatus !='' && tdate ==''){
                    whereCondition = {orderNo:orderNo,createdAt : {$gte: start},orderStatus:orderStatus}
                }else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus ==''){
                    whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end}}
               
                }else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus !=''){
                    whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end},orderStatus:orderStatus}
                }

                let statusList = await models.dropdownSettings.findAll({ attributes: ['id', 'name'],where:{status: 'Yes'},
                include: [{model:  models.dropdownSettingsOptions, attributes: ['optionValue', 'optionLabel','optionOrder']}],
                    order: [[ models.dropdownSettingsOptions, 'optionOrder', 'ASC']] 
                });
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                let ordersList
                let listCount

                if(orderNo!=''|| fdate !=''|| tdate !=''|| orderStatus !=''){
                     ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], where: whereCondition, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
                     listCount = await models.orders.count({where: whereCondition})
                }else{
                    ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt','deliveryID'], where: {
                        [Op.or]: [
                            { orderNo: { [Op.like]: `%${search}%` } },
                            { orderStatus: { [Op.like]: `%${search}%` } },
                            { shippingMethod: { [Op.like]: `%${search}%` } },
                            { shippingAddress: { [Op.like]: `%${search}%` } },
                            { createdAt: { [Op.like]: `%${search}%` } }
                        ]
                      }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                      listCount = await models.orders.count({where: {
                        [Op.or]: [
                            { orderNo: { [Op.like]: `%${search}%` } },
                            { orderStatus: { [Op.like]: `%${search}%` } },
                            { shippingMethod: { [Op.like]: `%${search}%` } },
                            { shippingAddress: { [Op.like]: `%${search}%` } },
                            { createdAt: { [Op.like]: `%${search}%` } }
                        ]
                      }});
                }
               

                let pageCount = Math.ceil(listCount/pageSize);
                
                let allOrders = []

                for(let order of ordersList){
                    let orderItem = await models.orderItems.findAll({ attributes: ['id','orderId','productId','totalPrice'], where: { orderId: order.id }});
                    let orders = order.dataValues;

                    if(orderItem){
                        let price = 0;
                        let productName = ''
                        for(let items of orderItem){
                            price += parseInt(items.dataValues.totalPrice);

                            let product = await models.products.find({attributes:['title'], where: {id:items.productId}})
                            console.log(product);
                            if(productName == ''){
                            	if(product!=null){
                                productName = productName + product!=null?product.dataValues!=null?product.dataValues.title:'':'';
                                }
                            }else{
                            if(product!=null){
                                productName = productName + ', ' + product!=null?product.dataValues!=null?product.dataValues.title:'':'';
                                }
                            }
                        }
                        orders.orderItems = productName
                        orders.totalPrice = price
                    }
                    allOrders.push(orders)
                }
                if (ordersList) {
                    
                    return res.render('admin/orders/list', {
                        title: 'Order List',
                        statusList: statusList,
                        arrData: allOrders,
                        storeList: storeList,
                        sessionStoreId: '',
                        listCount: listCount,
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        searchItem: search,
                        orderFilter : orderNo,
                        fdateFilter : fdate,
                        tdateFilter : tdate,
                        statusFilter : orderStatus,
                        pageSize: pageSize,
                        currentPage: parseInt(page),
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } else {
                    return res.render('admin/orders/list', {
                        title: 'Order List',
                        arrData: '',
                        statusList: statusList,
                        storeList: '',
                        sessionStoreId: '',
                        orderFilter : orderNo,
                        fdateFilter : fdate,
                        tdateFilter : tdate,
                        statusFilter : orderStatus,
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
                        return permission === 'OrderList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {

                    let whereCondition
                    // if (orderNo !='' && fdate =='' && tdate =='' && orderStatus =='') {
                    //     whereCondition = {orderNo:orderNo,storeId: sessionStoreId}
                    // } else if(fdate !='' && tdate !='' && orderNo =='' && orderStatus ==''){
                    //     whereCondition = { createdAt : {$gte: start, $lte: end},storeId: sessionStoreId}
                    // }else if(orderStatus !='' && fdate =='' && tdate =='' && orderNo ==''){
                    //     whereCondition = {orderStatus:orderStatus,storeId: sessionStoreId}
                    // }else if(orderNo!='' && orderStatus !='' && fdate =='' && tdate ==''){
                    //     whereCondition = {orderNo:orderNo,orderStatus:orderStatus,storeId: sessionStoreId}
                    // }else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus ==''){
                    //     whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end},storeId: sessionStoreId}
                    // }else if(fdate !='' && tdate !='' && orderStatus !='' && orderNo ==''){
                    //     whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus,storeId: sessionStoreId}
                    // }else if(orderNo!='' && orderStatus !='' && fdate !='' && tdate ==''){
                    //     whereCondition = {orderNo:orderNo,orderStatus:orderStatus, createdAt : {$gte: start, $lte: end},storeId: sessionStoreId}
                    // }

                    if (orderNo !='' && fdate =='' && tdate =='' && orderStatus =='') {
                        whereCondition = {orderNo:orderNo,storeId: sessionStoreId}
                    } else if(fdate !='' && tdate =='' && orderNo =='' && orderStatus ==''){
                        whereCondition = { createdAt : {$gte: start},storeId: sessionStoreId}
                    } else if(tdate !='' && fdate =='' && orderNo =='' && orderStatus ==''){
                        whereCondition = { createdAt : {$lte: end},storeId: sessionStoreId}
                    } else if(orderStatus !='' && fdate =='' && tdate =='' && orderNo ==''){
                        whereCondition = {orderStatus:orderStatus,storeId: sessionStoreId}
    
                    } else if(orderNo !='' && fdate !='' && tdate =='' && orderStatus ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start},storeId: sessionStoreId}
                    } else if(orderNo !='' && tdate !='' && fdate =='' && orderStatus ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$lte: end},storeId: sessionStoreId}
                    }else if(orderNo!='' && orderStatus !='' && fdate =='' && tdate ==''){
                        whereCondition = {orderNo:orderNo,orderStatus:orderStatus,storeId: sessionStoreId}
    
                    }else if(fdate !='' && tdate !='' && orderNo=='' && orderStatus =='' ){
                        whereCondition = {createdAt : {$gte: start, $lte: end},storeId: sessionStoreId}
                    }else if(fdate !='' && orderStatus !='' && orderNo=='' && orderStatus =='' ){
                        whereCondition = {createdAt : {$gte: start},orderStatus:orderStatus,storeId: sessionStoreId}
    
                    }else if(tdate !='' && orderStatus !='' && orderNo=='' && orderStatus =='' ){
                        whereCondition = {createdAt : {$lte: end},orderStatus:orderStatus,storeId: sessionStoreId}
                    
    
                    }else if( fdate !='' && tdate !='' && orderStatus !='' && orderNo ==''){
                        whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus,storeId: sessionStoreId}
                    }else if(orderNo !=''  && tdate !='' && orderStatus !='' && fdate ==''){
                        whereCondition = {orderNo:orderNo,createdAt : { $lte: end},orderStatus:orderStatus,storeId: sessionStoreId}
                    }else if(orderNo !='' && fdate !=''  && orderStatus !='' && tdate ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start},orderStatus:orderStatus,storeId: sessionStoreId}
                    }else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end},storeId: sessionStoreId}
                   
                    }else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus !=''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end},orderStatus:orderStatus,storeId: sessionStoreId}
                    }
    
                    let statusList = await models.dropdownSettings.findAll({ attributes: ['id', 'name'],where:{storeId: sessionStoreId, status: 'Yes'},
                                                                            include: [{model:  models.dropdownSettingsOptions, attributes: ['optionValue', 'optionLabel','optionOrder']}],
                                                                                order: [[ models.dropdownSettingsOptions, 'optionOrder', 'ASC']] 
                                                                            });
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });

                    let ordersList
                    let listCount
    
                    if(orderNo!=''|| fdate !=''|| tdate !=''|| orderStatus !=''){
                         ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], where: whereCondition, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
                         listCount = await models.orders.count({where: whereCondition})
                    }else{
                        ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'],
                         where: {storeId: sessionStoreId, 
                            [Op.or]: [
                                { orderNo: { [Op.like]: `%${search}%` } },
                                { orderStatus: { [Op.like]: `%${search}%` } },
                                { shippingMethod: { [Op.like]: `%${search}%` } },
                                { shippingAddress: { [Op.like]: `%${search}%` } },
                                { createdAt: { [Op.like]: `%${search}%` } }
                            ] 
                        // }});
                        }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                        listCount = await models.orders.count({where: {storeId: sessionStoreId,
                            [Op.or]: [
                                { orderNo: { [Op.like]: `%${search}%` } },
                                { orderStatus: { [Op.like]: `%${search}%` } },
                                { shippingMethod: { [Op.like]: `%${search}%` } },
                                { shippingAddress: { [Op.like]: `%${search}%` } },
                                { createdAt: { [Op.like]: `%${search}%` } }
                            ]
                          }});
                    }


                   
                   

                    let pageCount = Math.ceil(listCount/pageSize);

                    let allOrders = []

                    for(let order of ordersList){
                        let orderItem = await models.orderItems.findAll({ attributes: ['id','orderId','productId','totalPrice'], where: { orderId: order.id }});
                        let orders = order.dataValues;

                        if(orderItem){
                            let price = 0;
                            let productName = ''
                            for(let items of orderItem){
                                price += parseInt(items.dataValues.totalPrice);

                                let product = await models.products.findOne({attributes:['title'], where: {id:items.productId}})
                                if(productName == ''){
                                    productName = productName + product.title;
                                }else{
                                    productName = productName + ', ' + product.title;
                                }
                            }
                            orders.orderItems = productName
                            orders.totalPrice = price
                        }
                        allOrders.push(orders)
                    }
                    if (ordersList) {
                        return res.render('admin/orders/list', {
                            title: 'Order List',
                            statusList: statusList,
                            arrData: allOrders,
                            storeList: storeList,
                            sessionStoreId: sessionStoreId,
                            listCount: listCount,
                            pageCount: pageCount,
                            columnName: column,
                            orderType: order,
                            searchItem: search,
                            pageSize: pageSize,
                            orderFilter : orderNo,
                            fdateFilter : fdate,
                            tdateFilter : tdate,
                            statusFilter : orderStatus,
                            currentPage: parseInt(page),
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                        });
                    } else {
                        return res.render('admin/orders/list', {
                            title: 'Order List',
                            arrData: '',
                            statusList: statusList,
                            storeList: '',
                            orderFilter : orderNo,
                            fdateFilter : fdate,
                            tdateFilter : tdate,
                            statusFilter : orderStatus,
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

// exports.orderList = async function(req, res){
//     var token= req.session.token;
//     var sessionStoreId = req.session.user.storeId;
//     var role = req.session.role;

//     let option = req.query.option || '';
//     let startdate = req.query.startdate || '';
//     let enddate = req.query.enddate || '';
//     let searchItem = req.query.searchItem || '';
//     let status = req.query.status || '';
//     jwt.verify(token, SECRET, async function(err, decoded) {
//         if (err) {
//             req.flash("info", "Invalid Token");
//             res.redirect('/auth/signin');
//         }else{
//             if (sessionStoreId == null) {

//                 if(option==''){
//                     let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
//                     let column = req.query.column || 'id';
//                     let order = req.query.order || 'DESC';
//                     let pagesizes = req.query.pagesize || 10;
//                     let pageSize = parseInt(pagesizes);
//                     let page = req.params.page || 1;
//                     let search = req.query.search || '';
//                     let ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], where: {
//                         [Op.or]: [
//                             { orderNo: { [Op.like]: `%${search}%` } },
//                             { orderStatus: { [Op.like]: `%${search}%` } },
//                             { shippingMethod: { [Op.like]: `%${search}%` } },
//                             { shippingAddress: { [Op.like]: `%${search}%` } },
//                             { createdAt: { [Op.like]: `%${search}%` } }
//                         ]
//                     }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

//                     let listCount = await models.orders.count({where: {
//                         [Op.or]: [
//                             { orderNo: { [Op.like]: `%${search}%` } },
//                             { orderStatus: { [Op.like]: `%${search}%` } },
//                             { shippingMethod: { [Op.like]: `%${search}%` } },
//                             { shippingAddress: { [Op.like]: `%${search}%` } },
//                             { createdAt: { [Op.like]: `%${search}%` } }
//                         ]
//                     }});

//                     let pageCount = Math.ceil(listCount/pageSize);
                    
//                     let allOrders = []

//                     for(let order of ordersList){
//                         let orderItem = await models.orderItems.findAll({ attributes: ['id','orderId','productId','totalPrice'], where: { orderId: order.id }});
//                         let orders = order.dataValues;

//                         if(orderItem){
//                             let price = 0;
//                             let productName = ''
//                             for(let items of orderItem){
//                                 price += parseInt(items.dataValues.totalPrice);

//                                 let product = await models.products.findOne({attributes:['title'], where: {id:items.productId}})
//                                 if(productName == ''){
//                                     productName = productName + product.title;
//                                 }else{
//                                     productName = productName + ', ' + product.title;
//                                 }
//                             }
//                             orders.orderItems = productName
//                             orders.totalPrice = price
//                         }
//                         allOrders.push(orders)
//                     }
//                     if (ordersList) {
//                         return res.render('admin/orders/list', {
//                             title: 'Order List',
//                             statusList: '',
//                             arrData: allOrders,
//                             storeList: storeList,
//                             sessionStoreId: '',
//                             listCount: listCount,
//                             pageCount: pageCount,
//                             columnName: column,
//                             orderType: order,
//                             searchItem: search,
//                             pageSize: pageSize,
//                             currentPage: parseInt(page),
//                             messages: req.flash('info'),
//                             errors: req.flash('errors'),
//                         });
//                     } else {
//                         return res.render('admin/orders/list', {
//                             title: 'Order List',
//                             arrData: '',
//                             statusList: '',
//                             storeList: '',
//                             sessionStoreId: '',
//                             messages: req.flash('info'),
//                             errors: req.flash('errors'),
//                         });
//                     }

//                 }else if(option=='OrderId'){

//                     let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
//                     let column = req.query.column || 'id';
//                     let order = req.query.order || 'DESC';
//                     let pagesizes = req.query.pagesize || 10;
//                     let pageSize = parseInt(pagesizes);
//                     let page = req.params.page || 1;
//                     let search = req.query.search || '';

//                     let ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], where: {
//                         [Op.or]: [
//                             { id: { [Op.like]: `${searchItem}` } },
//                         ]
//                     }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

//                     let listCount = await models.orders.count({where: {
//                         [Op.or]: [
//                             { id: { [Op.like]: `%${searchItem}%` } },
//                         ]
//                     }});

//                     let pageCount = Math.ceil(listCount/pageSize);
                    
//                     let allOrders = []

//                     for(let order of ordersList){
//                         let orderItem = await models.orderItems.findAll({ attributes: ['id','orderId','productId','totalPrice'], where: { orderId: order.id }});
//                         let orders = order.dataValues;

//                         if(orderItem){
//                             let price = 0;
//                             let productName = ''
//                             for(let items of orderItem){
//                                 price += parseInt(items.dataValues.totalPrice);

//                                 let product = await models.products.findOne({attributes:['title'], where: {id:items.productId}})
//                                 if(productName == ''){
//                                     productName = productName + product.title;
//                                 }else{
//                                     productName = productName + ', ' + product.title;
//                                 }
//                             }
//                             orders.orderItems = productName
//                             orders.totalPrice = price
//                         }
//                         allOrders.push(orders)
//                     }
//                     if (ordersList) {
//                         return res.render('admin/orders/list', {
//                             title: 'Order List',
//                             statusList: '',
//                             arrData: allOrders,
//                             storeList: storeList,
//                             sessionStoreId: '',
//                             listCount: listCount,
//                             pageCount: pageCount,
//                             columnName: column,
//                             orderType: order,
//                             searchItem: search,
//                             pageSize: pageSize,
//                             currentPage: parseInt(page),
//                             messages: req.flash('info'),
//                             errors: req.flash('errors'),
//                         });
//                     } else {
//                         return res.render('admin/orders/list', {
//                             title: 'Order List',
//                             arrData: '',
//                             statusList: '',
//                             storeList: '',
//                             sessionStoreId: '',
//                             messages: req.flash('info'),
//                             errors: req.flash('errors'),
//                         });
//                     }

//                 }else if(option=='DateRange'){

//                     let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
//                     let column = req.query.column || 'id';
//                     let order = req.query.order || 'DESC';
//                     let pagesizes = req.query.pagesize || 10;
//                     let pageSize = parseInt(pagesizes);
//                     let page = req.params.page || 1;
//                     let search = req.query.search || '';

//                     let ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], where: { createdAt : {[Op.gte]: `${startdate}`, [Op.lte]: `${enddate}`} },
//                     order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

//                     let listCount = await models.orders.count({where: { createdAt : {[Op.gte]: `${startdate}`, [Op.lte]: `${enddate}`}}
//                     });

//                     let pageCount = Math.ceil(listCount/pageSize);
                    
//                     let allOrders = []

//                     for(let order of ordersList){
//                         let orderItem = await models.orderItems.findAll({ attributes: ['id','orderId','productId','totalPrice'], where: { orderId: order.id }});
//                         let orders = order.dataValues;

//                         if(orderItem){
//                             let price = 0;
//                             let productName = ''
//                             for(let items of orderItem){
//                                 price += parseInt(items.dataValues.totalPrice);

//                                 let product = await models.products.findOne({attributes:['title'], where: {id:items.productId}})
//                                 if(productName == ''){
//                                     productName = productName + product.title;
//                                 }else{
//                                     productName = productName + ', ' + product.title;
//                                 }
//                             }
//                             orders.orderItems = productName
//                             orders.totalPrice = price
//                         }
//                         allOrders.push(orders)
//                     }
//                     if (ordersList) {
//                         return res.render('admin/orders/list', {
//                             title: 'Order List',
//                             statusList: '',
//                             arrData: allOrders,
//                             storeList: storeList,
//                             sessionStoreId: '',
//                             listCount: listCount,
//                             pageCount: pageCount,
//                             columnName: column,
//                             orderType: order,
//                             searchItem: search,
//                             pageSize: pageSize,
//                             currentPage: parseInt(page),
//                             messages: req.flash('info'),
//                             errors: req.flash('errors'),
//                         });
//                     } else {
//                         return res.render('admin/orders/list', {
//                             title: 'Order List',
//                             arrData: '',
//                             statusList: '',
//                             storeList: '',
//                             sessionStoreId: '',
//                             messages: req.flash('info'),
//                             errors: req.flash('errors'),
//                         });
//                     }

//                 }
                       
//             }else{
//                 //*****Permission Assign Start
//                 var userPermission = false;
//                 if (role == 'admin') {
//                     userPermission = true;
//                 } else {
//                     userPermission = !!req.session.permissions.find(permission => {
//                         return permission === 'OrderList'
//                     })
//                 }
//                 if (userPermission == false) {
//                     req.flash('errors', 'Contact Your administrator for permission');
//                     res.redirect('/admin/dashboard');
//                 } else {

//                     if(option==''){

//                         let statusList = await models.dropdownSettings.findAll({ attributes: ['id', 'name'],where:{storeId: sessionStoreId, status: 'Yes'},
//                         include: [{
//                             model:  models.dropdownSettingsOptions, attributes: ['optionValue', 'optionLabel','optionOrder']
//                         }],
//                         order: [[ models.dropdownSettingsOptions, 'optionOrder', 'ASC']] 
//                         });

//                         let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });
//                         let column = req.query.column || 'id';
//                         let order = req.query.order || 'DESC';
//                         let pagesizes = req.query.pagesize || 10;
//                         let pageSize = parseInt(pagesizes);
//                         let page = req.params.page || 1;
//                         let search = req.query.search || '';

//                         let ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], order: [[column, order]], where: { storeId: sessionStoreId, [Op.or]: [
//                             { orderNo: { [Op.like]: `%${search}%` } },
//                             { orderStatus: { [Op.like]: `%${search}%` } },
//                             { shippingMethod: { [Op.like]: `%${search}%` } },
//                             { shippingAddress: { [Op.like]: `%${search}%` } },
//                             { createdAt: { [Op.like]: `%${search}%` } }
//                             ] },limit:pageSize, offset:(page-1)*pageSize });

//                         let listCount = await models.orders.count({where: { storeId: sessionStoreId, [Op.or]: [
//                                         { orderNo: { [Op.like]: `%${search}%` } },
//                                         { orderStatus: { [Op.like]: `%${search}%` } },
//                                         { shippingMethod: { [Op.like]: `%${search}%` } },
//                                         { shippingAddress: { [Op.like]: `%${search}%` } },
//                                         { createdAt: { [Op.like]: `%${search}%` } }
//                                     ] }});

//                             let pageCount = Math.ceil(listCount/pageSize);

//                             let allOrders = []

//                             for(let order of ordersList){
//                                 let orderItem = await models.orderItems.findAll({ attributes: ['id','orderId','productId','totalPrice'], where: { orderId: order.id }});
//                                 let orders = order.dataValues;

//                                 if(orderItem){
//                                     let price = 0;
//                                     let productName = ''
//                                     for(let items of orderItem){
//                                         price += parseInt(items.dataValues.totalPrice);

//                                         let product = await models.products.findOne({attributes:['title'], where: {id:items.productId}})
//                                         if(productName == ''){
//                                             productName = productName + product.title;
//                                         }else{
//                                             productName = productName + ', ' + product.title;
//                                         }
//                                     }
//                                     orders.orderItems = productName
//                                     orders.totalPrice = price
//                                 }
//                                 allOrders.push(orders)
//                             }
//                             if (ordersList) {
//                                 return res.render('admin/orders/list', {
//                                 title: 'Order List',
//                                 statusList: statusList,
//                                 arrData: allOrders,
//                                 storeList: storeList,
//                                 sessionStoreId: sessionStoreId,
//                                 listCount: listCount,
//                                 pageCount: pageCount,
//                                 columnName: column,
//                                 orderType: order,
//                                 searchItem: search,
//                                 pageSize: pageSize,
//                                 currentPage: parseInt(page),
//                                 messages: req.flash('info'),
//                                 errors: req.flash('errors'),
//                                 });
//                             } else {
//                                 return res.render('admin/orders/list', {
//                                 title: 'Order List',
//                                 arrData: '',
//                                 statusList: statusList,
//                                 storeList: '',
//                                 sessionStoreId: sessionStoreId,
//                                 messages: req.flash('info'),
//                                 errors: req.flash('errors'),
//                                 });
//                             }

//                     }else if(option=='OrderId'){

//                         let statusList = await models.dropdownSettings.findAll({ attributes: ['id', 'name'],where:{storeId: sessionStoreId, status: 'Yes'},
//                         include: [{
//                             model:  models.dropdownSettingsOptions, attributes: ['optionValue', 'optionLabel','optionOrder']
//                         }],
//                         order: [[ models.dropdownSettingsOptions, 'optionOrder', 'ASC']] 
//                         });

//                         let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });
//                         let column = req.query.column || 'id';
//                         let order = req.query.order || 'DESC';
//                         let pagesizes = req.query.pagesize || 10;
//                         let pageSize = parseInt(pagesizes);
//                         let page = req.params.page || 1;
//                         let search = req.query.search || '';

//                         let ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], 
//                         order: [[column, order]],
//                         where: { storeId: sessionStoreId, [Op.or]: [
//                                 { id: { [Op.like]: `%${searchItem}%` } },
//                             ] },
//                         limit:pageSize, offset:(page-1)*pageSize });

//                         let listCount = await models.orders.count({where: { storeId: sessionStoreId, [Op.or]: [
//                                         { id: { [Op.like]: `%${searchItem}%` } },
//                                     ] }});

//                             let pageCount = Math.ceil(listCount/pageSize);

//                             let allOrders = []

//                             for(let order of ordersList){
//                                 let orderItem = await models.orderItems.findAll({ attributes: ['id','orderId','productId','totalPrice'], where: { orderId: order.id }});
//                                 let orders = order.dataValues;

//                                 if(orderItem){
//                                     let price = 0;
//                                     let productName = ''
//                                     for(let items of orderItem){
//                                         price += parseInt(items.dataValues.totalPrice);

//                                         let product = await models.products.findOne({attributes:['title'], where: {id:items.productId}})
//                                         if(productName == ''){
//                                             productName = productName + product.title;
//                                         }else{
//                                             productName = productName + ', ' + product.title;
//                                         }
//                                     }
//                                     orders.orderItems = productName
//                                     orders.totalPrice = price
//                                 }
//                                 allOrders.push(orders)
//                             }
//                             if (ordersList) {
//                                 return res.render('admin/orders/list', {
//                                 title: 'Order List',
//                                 statusList: statusList,
//                                 arrData: allOrders,
//                                 storeList: storeList,
//                                 sessionStoreId: sessionStoreId,
//                                 listCount: listCount,
//                                 pageCount: pageCount,
//                                 columnName: column,
//                                 orderType: order,
//                                 searchItem: search,
//                                 pageSize: pageSize,
//                                 currentPage: parseInt(page),
//                                 messages: req.flash('info'),
//                                 errors: req.flash('errors'),
//                                 });
//                             } else {
//                                 return res.render('admin/orders/list', {
//                                 title: 'Order List',
//                                 arrData: '',
//                                 statusList: statusList,
//                                 storeList: '',
//                                 sessionStoreId: sessionStoreId,
//                                 messages: req.flash('info'),
//                                 errors: req.flash('errors'),
//                                 });
//                             }

//                     }else if(option=='DateRange'){

//                         let statusList = await models.dropdownSettings.findAll({ attributes: ['id', 'name'],where:{storeId: sessionStoreId, status: 'Yes'},
//                         include: [{
//                             model:  models.dropdownSettingsOptions, attributes: ['optionValue', 'optionLabel','optionOrder']
//                         }],
//                         order: [[ models.dropdownSettingsOptions, 'optionOrder', 'ASC']] 
//                         });

//                         let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });
//                         let column = req.query.column || 'id';
//                         let order = req.query.order || 'DESC';
//                         let pagesizes = req.query.pagesize || 10;
//                         let pageSize = parseInt(pagesizes);
//                         let page = req.params.page || 1;
//                         let search = req.query.search || '';

//                         let ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'],
                       
//                         where: { storeId: sessionStoreId, createdAt : {[Op.gte]: `${startdate}`, [Op.lte]: `${enddate}`}  },
//                         order: [[column, order]],
//                         limit:pageSize, offset:(page-1)*pageSize });

//                         let listCount = await models.orders.count({where: { storeId: sessionStoreId, createdAt : {[Op.gte]: `${startdate}`, [Op.lte]: `${enddate}`}}
//                     });

//                             let pageCount = Math.ceil(listCount/pageSize);

//                             let allOrders = []

//                             for(let order of ordersList){
//                                 let orderItem = await models.orderItems.findAll({ attributes: ['id','orderId','productId','totalPrice'], where: { orderId: order.id }});
//                                 let orders = order.dataValues;

//                                 if(orderItem){
//                                     let price = 0;
//                                     let productName = ''
//                                     for(let items of orderItem){
//                                         price += parseInt(items.dataValues.totalPrice);

//                                         let product = await models.products.findOne({attributes:['title'], where: {id:items.productId}})
//                                         if(productName == ''){
//                                             productName = productName + product.title;
//                                         }else{
//                                             productName = productName + ', ' + product.title;
//                                         }
//                                     }
//                                     orders.orderItems = productName
//                                     orders.totalPrice = price
//                                 }
//                                 allOrders.push(orders)
//                             }
//                             if (ordersList) {
//                                 return res.render('admin/orders/list', {
//                                 title: 'Order List',
//                                 statusList: statusList,
//                                 arrData: allOrders,
//                                 storeList: storeList,
//                                 sessionStoreId: sessionStoreId,
//                                 listCount: listCount,
//                                 pageCount: pageCount,
//                                 columnName: column,
//                                 orderType: order,
//                                 searchItem: search,
//                                 pageSize: pageSize,
//                                 currentPage: parseInt(page),
//                                 messages: req.flash('info'),
//                                 errors: req.flash('errors'),
//                                 });
//                             } else {
//                                 return res.render('admin/orders/list', {
//                                 title: 'Order List',
//                                 arrData: '',
//                                 statusList: statusList,
//                                 storeList: '',
//                                 sessionStoreId: sessionStoreId,
//                                 messages: req.flash('info'),
//                                 errors: req.flash('errors'),
//                                 });
//                             }

//                     }else if(option=='Status'){

//                         let statusList = await models.dropdownSettings.findAll({ attributes: ['id', 'name'],where:{storeId: sessionStoreId, status: 'Yes'},
//                         include: [{
//                             model:  models.dropdownSettingsOptions, attributes: ['optionValue', 'optionLabel','optionOrder']
//                         }],
//                         order: [[ models.dropdownSettingsOptions, 'optionOrder', 'ASC']] 
//                         });

//                         let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });
//                         let column = req.query.column || 'id';
//                         let order = req.query.order || 'DESC';
//                         let pagesizes = req.query.pagesize || 10;
//                         let pageSize = parseInt(pagesizes);
//                         let page = req.params.page || 1;
//                         let search = req.query.search || '';

//                         let ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'],
//                         where: { storeId: sessionStoreId,
//                                 [Op.or]: [
//                                             { orderStatus: { [Op.like]: `%${status}%` } },
//                                         ] 
//                         },
//                         order: [[column, order]],
//                         limit:pageSize, offset:(page-1)*pageSize });

//                         let listCount = await models.orders.count({where: { storeId: sessionStoreId,
//                                                                             [Op.or]: [
//                                                                                 { orderStatus: { [Op.like]: `%${status}%` } },
//                                                                             ]}
//                                                                 });


//                             let pageCount = Math.ceil(listCount/pageSize);

//                             let allOrders = []

//                             for(let order of ordersList){
//                                 let orderItem = await models.orderItems.findAll({ attributes: ['id','orderId','productId','totalPrice'], where: { orderId: order.id }});
//                                 let orders = order.dataValues;

//                                 if(orderItem){
//                                     let price = 0;
//                                     let productName = ''
//                                     for(let items of orderItem){
//                                         price += parseInt(items.dataValues.totalPrice);

//                                         let product = await models.products.findOne({attributes:['title'], where: {id:items.productId}})
//                                         if(productName == ''){
//                                             productName = productName + product.title;
//                                         }else{
//                                             productName = productName + ', ' + product.title;
//                                         }
//                                     }
//                                     orders.orderItems = productName
//                                     orders.totalPrice = price
//                                 }
//                                 allOrders.push(orders)
//                             }
//                             if (ordersList) {
//                                 return res.render('admin/orders/list', {
//                                 title: 'Order List',
//                                 statusList: statusList,
//                                 arrData: allOrders,
//                                 storeList: storeList,
//                                 sessionStoreId: sessionStoreId,
//                                 listCount: listCount,
//                                 pageCount: pageCount,
//                                 columnName: column,
//                                 orderType: order,
//                                 searchItem: search,
//                                 pageSize: pageSize,
//                                 currentPage: parseInt(page),
//                                 messages: req.flash('info'),
//                                 errors: req.flash('errors'),
//                                 });
//                             } else {
//                                 return res.render('admin/orders/list', {
//                                 title: 'Order List',
//                                 arrData: '',
//                                 statusList: statusList,
//                                 storeList: '',
//                                 sessionStoreId: sessionStoreId,
//                                 messages: req.flash('info'),
//                                 errors: req.flash('errors'),
//                                 });
//                             }

//                     }

//                 } 

//             }            
//         }	
//     });
// }
 



/**
 * This function is developed for Order status change
 * Developer: Partha Mandal
*/
exports.statusChange = async (req, res) => {
    let sessionStoreId = req.session.user.storeId;
    let sessionUserId = req.session.user.id;
    let token= req.session.token;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            let orderId = req.body.orderId;
            let orderStatus = req.body.orderStatus;
            if(orderId != '' && orderStatus != '' && sessionStoreId != '') {
                await models.orders.update({
                    orderStatus:orderStatus
                },{where:{id:orderId}}).then(async (success) => {

                    // if(sessionStoreId == 17 && orderStatus == 'Assigned for Delivery') {

                    //     var orderDetails = await models.orders.findOne({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'salesmanId'], where: {id: orderId, storeId:sessionStoreId}});

                    //     if(orderDetails.salesmanId != '' && orderDetails.salesmanId != null) {
                    //         var salesmanDetails = await models.salesman.findOne({ where: {id: orderDetails.salesmanId}});

                    //         // console.log("aaaaaaaaaaaaaaaaaa----");
                    //         if(salesmanDetails.pushToken != '' && salesmanDetails.pushToken != null) {
                    //             console.log("vvvvvvvvvvvvvvvvvvvvvvv----");
                    //         push_notifications.generateNotification(salesmanDetails.id,'',sessionStoreId,"order-accept",orderId);
                    //         }
                    //     }
                        
                    // } else if(orderStatus == 'Delivery Boy') {
                    //     var orderDetails = await models.orders.findOne({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'salesmanId'], where: {id: orderId, storeId:sessionStoreId}});

                    //     if(orderDetails.salesmanId != '' && orderDetails.salesmanId != null) {
                    //         var salesmanDetails = await models.salesman.findOne({ where: {id: orderDetails.salesmanId}});

                    //         // console.log("aaaaaaaaaaaaaaaaaa----");
                    //         if(salesmanDetails.pushToken != '' && salesmanDetails.pushToken != null) {
                    //             console.log("vvvvvvvvvvvvvvvvvvvvvvv----");
                    //         push_notifications.generateNotification(salesmanDetails.id,'',sessionStoreId,"order-accept",orderId);
                    //         }
                    //     }
                    // }

                    if(orderStatus == 'Delivered') {
                        var orderDetails = await models.orders.findOne({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'customerId'], where: {id: orderId, storeId:sessionStoreId}});

                        if(orderDetails.customerId != '' && orderDetails.customerId != null) {
                            var customersDetails = await models.customers.findOne({ attributes: ['id'], where: {id: orderDetails.customerId}});

                            // console.log("aaaaaaaaaaaaaaaaaa----");
                            if(customersDetails.pushToken != '' && customersDetails.pushToken != null) {
                                console.log("vvvvvvvvvvvvvvvvvvvvvvv----");
                            push_notifications.generateNotification(customersDetails.id,'',sessionStoreId,"order-delivered",orderId);
                            }
                        }
                    }

                    await models.orderStatusHistory.create({
                        orderId: orderId,
                        storeId: sessionStoreId,
                        orderStatus: orderStatus,
                        createdBy: sessionUserId,
                        sendEmail: 'No',
                        sendSMS: 'No',
                    }).then((ok)=>{
                        req.flash('info','Status updated successfully');
                        return res.redirect('back');
                    }).catch((err)=>{
                        req.flash('errors','Something wrong! Please try again');
                        return res.redirect('back');
                    })
                    
                }).catch((error) => {
                    req.flash('errors','Something wrong! Please try again');
                    return res.redirect('back');
                });  
            } else {
                req.flash('errors','Something wrong! Please try again');
                return res.redirect('back');
            }
            return res.redirect('back');
        }
    })
}

/**
 * This function is developed for Assign delivery boy
 * Developer: Partha Mandal
*/
exports.salesman = async (req, res) => {
    let sessionStoreId = req.session.user.storeId;
    let sessionUserId = req.session.user.id;
    let token= req.session.token;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            let orderId = req.body.orderId;
            let salesmanId = req.body.salesmanId;
            if(orderId != '' && salesmanId != '' && sessionStoreId != '') {
                await models.orders.update({
                    salesmanId:salesmanId
                },{where:{id:orderId}}).then(async (success) => {

                        // var orderDetails = await models.orders.findOne({ attributes: ['id', 'orderNo', 'orderStatus'], where: {id: orderId, storeId:sessionStoreId}});
                        // if(sessionStoreId == 17) {

                        //     if(orderDetails.orderStatus == 'Assigned for Delivery') {
                        //         var salesmanDetails = await models.salesman.findOne({ where: {id: salesmanId}});

                        //         console.log("aaaaaaaaaaaaaaaaaa----");
                        //         if(salesmanDetails.pushToken != '' && salesmanDetails.pushToken != null) {
                        //             console.log("vvvvvvvvvvvvvvvvvvvvvvv----");
                        //             push_notifications.generateNotification(salesmanDetails.id,sessionStoreId,"order-accept",orderId);
                        //         }
                        //     }

                        // } else {
                        //     if(orderDetails.orderStatus == 'Delivery Boy') {
                        //         var salesmanDetails = await models.salesman.findOne({ where: {id: salesmanId}});

                        //         console.log("aaaaaaaaaaaaaaaaaa----");
                        //         if(salesmanDetails.pushToken != '' && salesmanDetails.pushToken != null) {
                        //             console.log("vvvvvvvvvvvvvvvvvvvvvvv----");
                        //             push_notifications.generateNotification(salesmanDetails.id,sessionStoreId,"order-accept",orderId);
                        //         }
                        //     }
                        // }
                        var salesmanDetails = await models.salesman.findOne({ where: {id: salesmanId}});

                            console.log("aaaaaaaaaaaaaaaaaa----");
                        if(salesmanDetails.pushToken != '' && salesmanDetails.pushToken != null) {
                            console.log("vvvvvvvvvvvvvvvvvvvvvvv----");
                            push_notifications.generateNotification(salesmanDetails.id,'',sessionStoreId,"order-accept",orderId);
                        }

                    req.flash('info','Delivery boy updated successfully');
                    return res.redirect('back');
                }).catch((error) => {
                    // console.log("error----"+error);
                    req.flash('errors','Something wrong! Please try again11');
                    return res.redirect('back');
                });  
            } else {
                req.flash('errors','Something wrong! Please try again222');
                return res.redirect('back');
            }
            return res.redirect('back');
        }
    })
}

/**
 * This function is developed for Order View
 * Developer: Partha Mandal
*/
exports.orderView = async (req, res) => {
    let sessionStoreId = req.session.user.storeId;
    let sessionUserId = req.session.user.id;
    let token= req.session.token;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            const id = req.params.id
            if(!id){
                req.flash('errors','Something wrong! Please try again');
                return res.redirect('back');
            }else{
                var statusList
                var salesmanList
                if(sessionStoreId == null){
                    statusList = []
                    salesmanList = await models.salesman.findAll({attributes: ['name','id'],where:{status: 'active'}})
                }else{
                    salesmanList = await models.salesman.findAll({attributes: ['name','id'],where:{status: 'active',storeId: sessionStoreId}})

                    statusList = await models.dropdownSettings.findAll({ attributes: ['id', 'name'],where:{storeId: sessionStoreId, status: 'Yes'}, include: [{model:  models.dropdownSettingsOptions, attributes: ['optionValue', 'optionLabel','optionOrder']}], order: [[ models.dropdownSettingsOptions, 'optionOrder', 'ASC']] });
                }

                let orderDetails = await models.orders.findOne({attributes:['id','orderNo','customerId','orderStatus','shippingMethod','discountAmount','walletAmount','couponAmount','total','baseGrandTotal','tax','deliveryBoy','salesmanId','paymentMethod','shippingAmount','amountPaid','shippingCity','shippingState','shippingPin','shippingAddress','createdAt'], where: {id: id}})

                if(orderDetails){
                    let customerDetails = await models.customers.findOne({attributes:['firstName','lastName','mobile'], where:{id:orderDetails.customerId}})
                    //console.log(customerDetails); return false;

                    let allDetails = {}
                    allDetails.id = orderDetails.id
                    allDetails.orderNo = orderDetails.orderNo
                    allDetails.orderStatus = orderDetails.orderStatus
                    allDetails.shippingMethod = orderDetails.shippingMethod
                    allDetails.deliveryBoy = orderDetails.deliveryBoy
                    allDetails.salesmanId = orderDetails.salesmanId
                    allDetails.paymentMethod = orderDetails.paymentMethod
                    allDetails.shippingAmount = parseInt(orderDetails.shippingAmount)
                    allDetails.couponAmount = parseInt(orderDetails.couponAmount)
                    allDetails.walletAmount = parseInt(orderDetails.walletAmount)
                    allDetails.discountAmount = parseInt(orderDetails.discountAmount)
                    allDetails.amountPaid = parseInt(orderDetails.amountPaid)
                    allDetails.total = parseInt(orderDetails.total)
                    allDetails.baseGrandTotal = parseInt(orderDetails.baseGrandTotal)
                    allDetails.tax = parseInt(orderDetails.tax)
                    allDetails.shippingCity = orderDetails.shippingCity
                    allDetails.shippingAddress = orderDetails.shippingAddress
                    allDetails.shippingPin = orderDetails.shippingPin
                    allDetails.createdAt = orderDetails.createdAt
                    allDetails.customerName = customerDetails.firstName + ' ' + customerDetails.lastName
                    allDetails.customerMobile = customerDetails.mobile

                    let orderItemDetails = await models.orderItems.findAll({attributes:['productId','qty','price','totalPrice','wrapId'], where:{orderId:orderDetails.id}})

                    let productDetails = []
                    for (let items of orderItemDetails){
                        let productName = await models.products.findOne({attributes:['title'], where:{id:items.productId}})
                        let giftSetDetails = await models.giftSet.findOne({attributes:['title'], where:{id:items.wrapId}})
                        const giftSetName = giftSetDetails && giftSetDetails.title ? giftSetDetails.title : null
                        let product = {}
                        product.quantity = items.dataValues.qty;
                        product.price = parseInt(items.dataValues.price);
                        product.totalPrice = parseInt(items.dataValues.totalPrice);
                        if(productName){
                            product.productName = productName.dataValues.title;
                        }else{
                            product.productName = ''
                        }
                        product.giftSetName = giftSetName;
                        productDetails.push(product)
                    }
                    return res.render('admin/orders/viewdetails', {
                        title: 'Order Details',
                        productDetails: productDetails,
                        sessionStoreId: sessionStoreId,
                        allDetails: allDetails,
                        statusList: statusList,
                        salesmanList: salesmanList,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                }
            }
        }
    })
}

/**
 * This function is developed for Invoice
 * Developer: Partha Mandal
*/
exports.invoice = (req, res) => {
    const id = req.params.id
    let token= req.session.token;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            if(!id){
                req.flash('errors','Something wrong! Please try again');
                return res.redirect('back');
            }else{
                let orderDetails = await models.orders.findOne({attributes:['id','storeId','orderNo','customerId','orderStatus','shippingMethod','discountAmount','walletAmount','couponAmount','total','baseGrandTotal','tax','deliveryBoy','paymentMethod','shippingAmount','amountPaid','shippingCity','shippingState','shippingPin','shippingAddress','createdAt'], where: {id: id}})

                let storeDetails = await models.stores.findOne({attributes:['company','email','mobile','address'], where:{id:orderDetails.storeId}})

                if(orderDetails){
                    let customerDetails = await models.customers.findOne({attributes:['firstName','lastName','mobile'], where:{id:orderDetails.customerId}})

                    let allDetails = {}
                    allDetails.id = orderDetails.id
                    allDetails.orderNo = orderDetails.orderNo
                    allDetails.orderStatus = orderDetails.orderStatus
                    allDetails.shippingMethod = orderDetails.shippingMethod
                    allDetails.deliveryBoy = orderDetails.deliveryBoy
                    allDetails.paymentMethod = orderDetails.paymentMethod
                    allDetails.shippingAmount = parseInt(orderDetails.shippingAmount)
                    allDetails.couponAmount = parseInt(orderDetails.couponAmount)
                    allDetails.walletAmount = parseInt(orderDetails.walletAmount)
                    allDetails.discountAmount = parseInt(orderDetails.discountAmount)
                    allDetails.amountPaid = parseInt(orderDetails.amountPaid)
                    allDetails.total = parseInt(orderDetails.total)
                    allDetails.baseGrandTotal = parseInt(orderDetails.baseGrandTotal)
                    allDetails.tax = parseInt(orderDetails.tax)
                    allDetails.shippingCity = orderDetails.shippingCity
                    allDetails.shippingAddress = orderDetails.shippingAddress
                    allDetails.shippingPin = orderDetails.shippingPin
                    allDetails.createdAt = orderDetails.createdAt
                    allDetails.customerName = customerDetails.firstName + ' ' + customerDetails.lastName
                    allDetails.customerMobile = customerDetails.mobile

                    let orderItemDetails = await models.orderItems.findAll({attributes:['productId','qty','price','totalPrice','wrapId'], where:{orderId:orderDetails.id}})

                    let itemCount = await models.orderItems.count({where:{orderId:orderDetails.id}})

                    let productDetails = []
                    for (let items of orderItemDetails){
                        let productName = await models.products.findOne({attributes:['title'], where:{id:items.productId}})
                        let giftSetDetails = await models.giftSet.findOne({attributes:['title'], where:{id:items.wrapId}})
                        const giftSetName = giftSetDetails && giftSetDetails.title ? giftSetDetails.title : null
                        let product = {}
                        product.quantity = items.dataValues.qty;
                        product.price = parseInt(items.dataValues.price);
                        product.totalPrice = parseInt(items.dataValues.totalPrice);
                        if(productName){
                            product.productName = productName.dataValues.title;
                        }else{
                            product.productName = ''
                        }
                        product.giftSetName = giftSetName;
                        productDetails.push(product)
                    }
                    
                    let totalQuantity = 0
                    let grandTotal = 0
                    for(let items of orderItemDetails){
                        totalQuantity += parseInt(items.dataValues.qty);
                        grandTotal += parseInt(items.dataValues.totalPrice);
                    }

                    return res.render('admin/orders/invoice', {
                        title: 'Order Details',
                        productDetails: productDetails,
                        itemCount: itemCount,
                        totalQuantity: totalQuantity,
                        grandTotal: grandTotal,
                        companyDetails: storeDetails,
                        allDetails: allDetails,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                }
            }
        }
    })
}   


exports.downloadOrder = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;

    let column = req.query.column || 'id';
    let order = req.query.order || 'DESC';
    let pagesizes = req.query.pagesize || 10;
    let pageSize = parseInt(pagesizes);
    let page = req.params.page || 1;

    let search = req.query.search || '';

    let orderNo = req.query.orderNo || '';
    let fdate = req.query.fdate || '';
    let tdate = req.query.tdate || '';
    let orderStatus = req.query.status || '';

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

                // let whereCondition
                    // if (orderNo !='' && fdate =='' && tdate =='' && orderStatus =='') {
                    //     whereCondition = {orderNo:orderNo}
                    // } else if(fdate !='' && tdate !='' && orderNo =='' && orderStatus ==''){
                    //     whereCondition = { createdAt : {$gte: start, $lte: end}}
                    // }else if(orderStatus !='' && fdate =='' && tdate =='' && orderNo ==''){
                    //     whereCondition = {orderStatus:orderStatus}
                    // }else if(orderNo!='' && orderStatus !='' && fdate =='' && tdate ==''){
                    //     whereCondition = {orderNo:orderNo,orderStatus:orderStatus}
                    // }else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus ==''){
                    //     whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end}}
                    // }else if(fdate !='' && tdate !='' && orderStatus !='' && orderNo ==''){
                    //     whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus}
                    // }else if(orderNo!='' && orderStatus !='' && fdate !='' && tdate ==''){
                    //     whereCondition = {orderNo:orderNo,orderStatus:orderStatus, createdAt : {$gte: start, $lte: end}}
                    // }

                    // let statusList = await models.dropdownSettings.findAll({ attributes: ['id', 'name'],where:{status: 'Yes'},
                    // include: [{model:  models.dropdownSettingsOptions, attributes: ['optionValue', 'optionLabel','optionOrder']}],
                    //     order: [[ models.dropdownSettingsOptions, 'optionOrder', 'ASC']] 
                    // });
                    //let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });

                let whereCondition
                    if (orderNo !='' && fdate =='' && tdate =='' && orderStatus =='') {
                        whereCondition = {orderNo:orderNo}
                    } else if(fdate !='' && tdate =='' && orderNo =='' && orderStatus ==''){
                        whereCondition = { createdAt : {$gte: start}}
                    } else if(tdate !='' && fdate =='' && orderNo =='' && orderStatus ==''){
                        whereCondition = { createdAt : {$lte: end}}
                    } else if(orderStatus !='' && fdate =='' && tdate =='' && orderNo ==''){
                        whereCondition = {orderStatus:orderStatus}

                    } else if(orderNo !='' && fdate !='' && tdate =='' && orderStatus ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start}}
                    } else if(orderNo !='' && tdate !='' && fdate =='' && orderStatus ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$lte: end}}
                    }else if(orderNo!='' && orderStatus !='' && fdate =='' && tdate ==''){
                        whereCondition = {orderNo:orderNo,orderStatus:orderStatus}

                    }else if(fdate !='' && tdate !='' && orderNo=='' && orderStatus =='' ){
                        whereCondition = {createdAt : {$gte: start, $lte: end}}
                    }else if(fdate !='' && orderStatus !='' && orderNo=='' && orderStatus =='' ){
                        whereCondition = {createdAt : {$gte: start},orderStatus:orderStatus}

                    }else if(tdate !='' && orderStatus !='' && orderNo=='' && orderStatus =='' ){
                        whereCondition = {createdAt : {$lte: end},orderStatus:orderStatus}
                    

                    }else if( fdate !='' && tdate !='' && orderStatus !='' && orderNo ==''){
                        whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus}
                    }else if(orderNo !=''  && tdate !='' && orderStatus !='' && fdate ==''){
                        whereCondition = {orderNo:orderNo,createdAt : { $lte: end},orderStatus:orderStatus}
                    }else if(orderNo !='' && fdate !=''  && orderStatus !='' && tdate ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start},orderStatus:orderStatus}
                    }else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end}}
                
                    }else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus !=''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end},orderStatus:orderStatus}
                    }
                
                let ordersList

                if(orderNo!=''|| fdate !=''|| tdate !=''|| orderStatus !=''){
                     ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], where: whereCondition, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
                }else{
                    ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], where: {
                        [Op.or]: [
                            { orderNo: { [Op.like]: `%${search}%` } },
                            { orderStatus: { [Op.like]: `%${search}%` } },
                            { shippingMethod: { [Op.like]: `%${search}%` } },
                            { shippingAddress: { [Op.like]: `%${search}%` } },
                            { createdAt: { [Op.like]: `%${search}%` } }
                        ]
                      }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
                }

                // let listCount = await models.orders.count({where: {
                //     [Op.or]: [
                //         { orderNo: { [Op.like]: `%${search}%` } },
                //         { orderStatus: { [Op.like]: `%${search}%` } },
                //         { shippingMethod: { [Op.like]: `%${search}%` } },
                //         { shippingAddress: { [Op.like]: `%${search}%` } },
                //         { createdAt: { [Op.like]: `%${search}%` } }
                //     ]
                //   }});
               
               // let pageCount = Math.ceil(listCount/pageSize);
                
                let allOrders = []

                for(let order of ordersList){
                    let orderItem = await models.orderItems.findAll({ attributes: ['id','orderId','productId','totalPrice'], where: { orderId: order.id }});
                    let orders = order.dataValues;

                    if(orderItem){
                        let price = 0;
                        let productName = ''
                        for(let items of orderItem){
                            price += parseInt(items.dataValues.totalPrice);

                            let product = await models.products.findOne({attributes:['title'], where: {id:items.productId}})
                            if(productName == ''){
                                productName = productName + product.title;
                            }else{
                                productName = productName + ', ' + product.title;
                            }
                        }
                        orders.orderItems = productName
                        orders.totalPrice = price
                    }
                    allOrders.push(orders)
                }

                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("OrderList");
            
                worksheet.columns = [
                    { header: "Order No", key: "orderNo", width: 15 },
                    { header: "Date", key: "createdAt", width: 12 },
                    { header: "Customer Info", key: "shippingAddress", width:40 },
                    { header: "Order Item", key: "orderItems", width: 40 },
                    { header: "Total", key: "amountPaid", width: 10 },
                    // { header: "Store", key: "storeName", reply: 30 },
                    { header: "Status", key: "orderStatus", width: 15 },
                    
                ];
            
                // Add Array Rows
                worksheet.addRows(allOrders);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "OrderList.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })
                // if (ordersList) {
                //     return res.render('admin/orders/list', {
                //         title: 'Order List',
                //         statusList: statusList,
                //         arrData: allOrders,
                //         storeList: storeList,
                //         sessionStoreId: '',
                //         listCount: listCount,
                //         pageCount: pageCount,
                //         columnName: column,
                //         orderType: order,
                //         searchItem: search,
                //         orderFilter : orderNo,
                //         fdateFilter : fdate,
                //         tdateFilter : tdate,
                //         statusFilter : orderStatus,
                //         pageSize: pageSize,
                //         currentPage: parseInt(page),
                //         messages: req.flash('info'),
                //         errors: req.flash('errors'),
                //     });
                // } else {
                //     return res.render('admin/orders/list', {
                //         title: 'Order List',
                //         arrData: '',
                //         statusList: statusList,
                //         storeList: '',
                //         sessionStoreId: '',
                //         orderFilter : orderNo,
                //         fdateFilter : fdate,
                //         tdateFilter : tdate,
                //         statusFilter : orderStatus,
                //         messages: req.flash('info'),
                //         errors: req.flash('errors'),
                //     });
                // }
            }else{
                //*****Permission Assign Start
                var userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'OrderList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {

                    // let whereCondition
                    // if (orderNo !='' && fdate =='' && tdate =='' && orderStatus =='') {
                    //     whereCondition = {orderNo:orderNo,storeId: sessionStoreId}
                    // } else if(fdate !='' && tdate !='' && orderNo =='' && orderStatus ==''){
                    //     whereCondition = { createdAt : {$gte: start, $lte: end},storeId: sessionStoreId}
                    // }else if(orderStatus !='' && fdate =='' && tdate =='' && orderNo ==''){
                    //     whereCondition = {orderStatus:orderStatus,storeId: sessionStoreId}
                    // }else if(orderNo!='' && orderStatus !='' && fdate =='' && tdate ==''){
                    //     whereCondition = {orderNo:orderNo,orderStatus:orderStatus,storeId: sessionStoreId}
                    // }else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus ==''){
                    //     whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end},storeId: sessionStoreId}
                    // }else if(fdate !='' && tdate !='' && orderStatus !='' && orderNo ==''){
                    //     whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus,storeId: sessionStoreId}
                    // }else if(orderNo!='' && orderStatus !='' && fdate !='' && tdate ==''){
                    //     whereCondition = {orderNo:orderNo,orderStatus:orderStatus, createdAt : {$gte: start, $lte: end},storeId: sessionStoreId}
                    // }


                    if (orderNo !='' && fdate =='' && tdate =='' && orderStatus =='') {
                        whereCondition = {orderNo:orderNo,storeId: sessionStoreId}
                    } else if(fdate !='' && tdate =='' && orderNo =='' && orderStatus ==''){
                        whereCondition = { createdAt : {$gte: start},storeId: sessionStoreId}
                    } else if(tdate !='' && fdate =='' && orderNo =='' && orderStatus ==''){
                        whereCondition = { createdAt : {$lte: end},storeId: sessionStoreId}
                    } else if(orderStatus !='' && fdate =='' && tdate =='' && orderNo ==''){
                        whereCondition = {orderStatus:orderStatus,storeId: sessionStoreId}
    
                    } else if(orderNo !='' && fdate !='' && tdate =='' && orderStatus ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start},storeId: sessionStoreId}
                    } else if(orderNo !='' && tdate !='' && fdate =='' && orderStatus ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$lte: end},storeId: sessionStoreId}
                    }else if(orderNo!='' && orderStatus !='' && fdate =='' && tdate ==''){
                        whereCondition = {orderNo:orderNo,orderStatus:orderStatus,storeId: sessionStoreId}
    
                    }else if(fdate !='' && tdate !='' && orderNo=='' && orderStatus =='' ){
                        whereCondition = {createdAt : {$gte: start, $lte: end},storeId: sessionStoreId}
                    }else if(fdate !='' && orderStatus !='' && orderNo=='' && orderStatus =='' ){
                        whereCondition = {createdAt : {$gte: start},orderStatus:orderStatus,storeId: sessionStoreId}
    
                    }else if(tdate !='' && orderStatus !='' && orderNo=='' && orderStatus =='' ){
                        whereCondition = {createdAt : {$lte: end},orderStatus:orderStatus,storeId: sessionStoreId}
                    
    
                    }else if( fdate !='' && tdate !='' && orderStatus !='' && orderNo ==''){
                        whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus,storeId: sessionStoreId}
                    }else if(orderNo !=''  && tdate !='' && orderStatus !='' && fdate ==''){
                        whereCondition = {orderNo:orderNo,createdAt : { $lte: end},orderStatus:orderStatus,storeId: sessionStoreId}
                    }else if(orderNo !='' && fdate !=''  && orderStatus !='' && tdate ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start},orderStatus:orderStatus,storeId: sessionStoreId}
                    }else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end},storeId: sessionStoreId}
                   
                    }else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus !=''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end},orderStatus:orderStatus,storeId: sessionStoreId}
                    }
    
                    // let statusList = await models.dropdownSettings.findAll({ attributes: ['id', 'name'],where:{storeId: sessionStoreId, status: 'Yes'},
                    //                                                         include: [{model:  models.dropdownSettingsOptions, attributes: ['optionValue', 'optionLabel','optionOrder']}],
                    //                                                             order: [[ models.dropdownSettingsOptions, 'optionOrder', 'ASC']] 
                    //                                                         });
                    // let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });

                    let ordersList
    
                    if(orderNo!=''|| fdate !=''|| tdate !=''|| orderStatus !=''){
                         ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], where: whereCondition, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
                    }else{
                        ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'],
                         where: {storeId: sessionStoreId, 
                            [Op.or]: [
                                { orderNo: { [Op.like]: `%${search}%` } },
                                { orderStatus: { [Op.like]: `%${search}%` } },
                                { shippingMethod: { [Op.like]: `%${search}%` } },
                                { shippingAddress: { [Op.like]: `%${search}%` } },
                                { createdAt: { [Op.like]: `%${search}%` } }
                            ] 
                        },order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize });
                    }


                    // let listCount = await models.orders.count({where: {
                    //     [Op.or]: [
                    //         { orderNo: { [Op.like]: `%${search}%` } },
                    //         { orderStatus: { [Op.like]: `%${search}%` } },
                    //         { shippingMethod: { [Op.like]: `%${search}%` } },
                    //         { shippingAddress: { [Op.like]: `%${search}%` } },
                    //         { createdAt: { [Op.like]: `%${search}%` } }
                    //     ]
                    //   }});
                   
                    // let pageCount = Math.ceil(listCount/pageSize);

                    let allOrders = []

                    for(let order of ordersList){
                        let orderItem = await models.orderItems.findAll({ attributes: ['id','orderId','productId','totalPrice'], where: { orderId: order.id }});
                        let orders = order.dataValues;

                        if(orderItem){
                            let price = 0;
                            let productName = ''
                            for(let items of orderItem){
                                price += parseInt(items.dataValues.totalPrice);

                                let product = await models.products.findOne({attributes:['title'], where: {id:items.productId}})
                                if(productName == ''){
                                    productName = productName + product.title;
                                }else{
                                    productName = productName + ', ' + product.title;
                                }
                            }
                            orders.orderItems = productName
                            orders.totalPrice = price
                        }
                        allOrders.push(orders)
                    }

                    let workbook = new excel.Workbook();
                    let worksheet = workbook.addWorksheet("OrderList");
                
                    worksheet.columns = [
                        { header: "Order No", key: "orderNo", width: 15 },
                        { header: "Date", key: "createdAt", width: 12 },
                        { header: "Customer Info", key: "shippingAddress", width:40 },
                        { header: "Order Item", key: "orderItems", width: 40 },
                        { header: "Total", key: "amountPaid", width: 10 },
                        { header: "Status", key: "orderStatus", width: 15 },
                    ];
                
                    // Add Array Rows
                    worksheet.addRows(allOrders);
                
                    res.setHeader(
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    );
                    res.setHeader(
                        "Content-Disposition",
                        "attachment; filename=" + "OrderList.xlsx"
                    )
                
                    return workbook.xlsx.write(res).then(() => {
                        res.status(200).end();
                        return res.redirect('back');
                    })


                }                
            }            
        }	
    });
}

exports.deliveryCreate = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;    

    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            const id = req.params.id
            if(!id){
                req.flash('errors','Something wrong! Please try again');
                return res.redirect('back');
            }else{//console.log(process.env.shipadeliveryAPIKeys);return false;
                let orderDetails = await models.orders.findOne({attributes:['id','orderNo','customerId','orderStatus','customerMobile','shippingMethod','discountAmount','walletAmount','couponAmount','deliveryBoy','salesmanId','paymentMethod','shippingAmount','amountPaid','shippingCity','shippingState','shippingPin','shippingAddress','shippingCountry','shippingCity','createdAt'], where: {id: id}})
                if(orderDetails){
                    let customerDetails = await models.customers.findOne({attributes:['firstName','lastName','mobile'], where:{id:orderDetails.customerId}})

                    let origin={
                        "contactName": customerDetails.firstName + ' ' + customerDetails.lastName,
                        "contactNo": customerDetails.mobile,
                        "city": orderDetails.shippingCity,
                        "country": 'ARE',
                        "address": orderDetails.shippingAddress.slice(0,200)
                    };

                    let destination={
                        "contactName": customerDetails.firstName + ' ' + customerDetails.lastName,
                        "contactNo": customerDetails.mobile,
                        "city": orderDetails.shippingCity,
                        "country": 'ARE',
                        "address": orderDetails.shippingAddress.slice(0,200)
                    };

                    let orderItemDetails = await models.orderItems.findAll({attributes:['productId','qty','price','totalPrice'], where:{orderId:orderDetails.id}})
                    //let productDetails = []
                    let packageItem=[];
                    for (let items of orderItemDetails){
                        let productName = await models.products.findOne({attributes:['title'], where:{id:items.productId}})
                        // let product = {}
                        // product.quantity = items.dataValues.qty;
                        // product.price = parseInt(items.dataValues.price);
                        // product.totalPrice = parseInt(items.dataValues.totalPrice);
                        // if(productName){
                        //     product.productName = productName.dataValues.title;
                        // }else{
                        //     product.productName = ''
                        // }
                        //console.log(items.dataValues.qty);return false;
                        let products = {
                            "name":productName.dataValues.title,
                            "customerRef":orderDetails.orderNo,
                            "quantity":parseInt(items.dataValues.qty?items.dataValues.qty:0),
                            "goodsValue":parseInt(items.dataValues.totalPrice)
                        }
                        packageItem.push(products);

                        //productDetails.push(product)
                    }


                    const request = require('request');
                    function execute() {
                        const options = {
                            "url": `https://api.shipadelivery.com/v2/orders?apikey=${process.env.shipadeliveryAPIKeys}`,
                            "method": "POST",
                            "json": {
                                "customerRef": `${orderDetails.orderNo}`,
                                "type": "Delivery",
                                "category": "Next Day",
                                "origin": origin,
                                "destination": destination,
                                "packages": packageItem
                            },
                            "headers": {
                                "Accept": "application/json",
                                "Content-Type": "application/json"
                            }
                        };
                        request(options, function (err, responce, body) {
                            if (err) {
                                console.error(err);
                                req.flash('errors','Error Occured');
                                return res.redirect('back');
                            }else {console.log(body);
                                models.orders.update({
                                    deliveryID:body.shipaRef,
                                    orderStatus:'Accepted'
                                },{where:{id:id}}).then((success) => {
                                    sms_controller.orderSuccessMsg(orderDetails.customerMobile, orderDetails.orderNo);
                                    req.flash('info','Order Ready For Delivery');
                                    return res.redirect('back');
                                })
                            }
                        });
                    }
                    execute();
                }
            }
        }
    });
}


exports.orderCancelled = async (req, res) => {

    const id = req.params.id

    if(!id){
        req.flash('errors','Something wrong! Please try again');
        return res.redirect('back');
    }else{
        await models.orders.update({
            orderStatus:'Cancelled'
        },{where:{id:id}}).then(async (success) => {

            helper.orderCancelMailSend(id);

            req.flash('info','order successfully cancelled');
            return res.redirect('back');
        }).catch((error) => {
            req.flash('errors','Something wrong! Please try again');
            return res.redirect('back');
        });  
    }
}


