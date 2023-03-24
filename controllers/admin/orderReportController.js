var models = require('../../models');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var fs = require("fs");
var formidable = require('formidable');
var multiparty = require('multiparty'); 
var bodyParser = require('body-parser');
var fetch = require('node-fetch');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
const paginate = require('express-paginate');
var helper = require('../../helpers/helper_functions');
const excel = require('exceljs');
const csv = require('fast-csv');
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
 * Description: This function is developed for listing Orders Report
 * Developer:Surajit Gouri
**/


exports.list = async function(req, res){
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
    let customerId = req.query.customer || '';
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
                // if (orderNo !='' && customerId !='' && fdate =='' && tdate =='' && orderStatus =='') {
                //     whereCondition = {customerId:customerId}
                // } else if(fdate !='' && tdate !='' && customerId =='' && orderStatus ==''){
                //     whereCondition = { createdAt : {$gte: start, $lte: end}}
                // }else if(orderStatus !='' && fdate =='' && tdate =='' && customerId ==''){
                //     whereCondition = {orderStatus:orderStatus}
                // }else if(customerId!='' && orderStatus !='' && fdate =='' && tdate ==''){
                //     whereCondition = {customerId:customerId,orderStatus:orderStatus}
                // }else if(customerId!='' && fdate !='' && tdate !='' && orderStatus ==''){
                //     whereCondition = {customerId:customerId,createdAt : {$gte: start, $lte: end}}
                // }else if(fdate !='' && tdate !='' && orderStatus !='' && customerId ==''){
                //     whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus}
                // }else if(customerId!='' && orderStatus !='' && fdate !='' && tdate ==''){
                //     whereCondition = {customerId:customerId,orderStatus:orderStatus, createdAt : {$gte: start, $lte: end}}
                // }
                let whereCondition
                    if (orderNo !='' && customerId =='' && fdate =='' && tdate =='' && orderStatus =='') {
                        whereCondition = {orderNo:orderNo}
                    } else if(fdate !='' && customerId =='' && tdate =='' && orderNo =='' && orderStatus ==''){
                        whereCondition = { createdAt : {$gte: start}}
                    } else if(tdate !='' && customerId =='' && fdate =='' && orderNo =='' && orderStatus ==''){
                        whereCondition = { createdAt : {$lte: end}}
                    } else if(orderStatus !='' && customerId =='' && fdate =='' && tdate =='' && orderNo ==''){
                        whereCondition = {orderStatus:orderStatus}
					} else if(customerId !='' && orderStatus =='' && fdate =='' && tdate =='' && orderNo ==''){
						whereCondition = {customerId:customerId}


                    } else if(orderNo !='' && fdate !='' && tdate =='' && orderStatus =='' && customerId ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start}}
                    } else if(orderNo !='' && tdate !='' && fdate =='' && orderStatus =='' && customerId ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$lte: end}}
                    }else if(orderNo!='' && orderStatus !='' && fdate =='' && tdate =='' && customerId ==''){
                        whereCondition = {orderNo:orderNo,orderStatus:orderStatus}
					}else if(orderNo!='' && customerId !='' && fdate =='' && tdate =='' && orderStatus ==''){
                        whereCondition = {orderNo:orderNo,customerId:customerId}
                    }else if(fdate !='' && tdate !='' && orderNo=='' && orderStatus ==''&& customerId ==''){
                        whereCondition = {createdAt : {$gte: start, $lte: end}}
                    }else if(fdate !='' && orderStatus !='' && orderNo=='' && tdate =='' && customerId ==''){
                        whereCondition = {createdAt : {$gte: start},orderStatus:orderStatus}
					}else if(fdate !='' && customerId !='' && orderNo=='' && orderStatus ==''&& tdate ==''){
                        whereCondition = {createdAt : {$gte: start},customerId:customerId}
                    }else if(tdate !='' && orderStatus !='' && orderNo=='' && fdate =='' && customerId ==''){
                        whereCondition = {createdAt : {$lte: end},orderStatus:orderStatus}
					}else if(tdate !='' && customerId !='' && orderNo=='' && orderStatus =='' && fdate ==''){
						whereCondition = {createdAt : {$lte: end},customerId:customerId}
					}else if(customerId !='' && orderStatus !='' && orderNo=='' && tdate =='' && fdate ==''){
						whereCondition = {customerId:customerId,orderStatus:orderStatus}
                    
					
					}else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus =='' && customerId ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end}}
					}else if(orderNo!='' && fdate !='' && orderStatus !='' && tdate =='' && customerId ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start},orderStatus:orderStatus}
					}else if(orderNo !='' && fdate !='' && customerId !='' && tdate =='' && orderStatus ==''){
                        whereCondition = {createdAt : {$gte: start},orderStatus:orderStatus}
					}else if(orderNo !=''  && tdate !='' && orderStatus !='' && fdate =='' && customerId ==''){	
                        whereCondition = {orderNo:orderNo,createdAt : { $lte: end},orderStatus:orderStatus}
					}else if(orderNo !=''  && tdate !='' && customerId !='' && fdate =='' && orderStatus ==''){	
                        whereCondition = {orderNo:orderNo,createdAt : { $lte: end},orderStatus:orderStatus}
					}else if(orderNo !='' && orderStatus !='' && customerId !='' && fdate =='' && tdate ==''){
                        whereCondition = {orderNo:orderNo,createdAt : { $lte: end},customerId:customerId}	
                    }else if( fdate !='' && tdate !='' && orderStatus !='' && orderNo =='' && customerId ==''){
                        whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus}
					}else if( fdate !='' && tdate =='' && customerId !='' && orderNo =='' && orderStatus ==''){
                        whereCondition = {createdAt : {$gte: start, $lte: end},customerId:customerId}
					}else if( fdate !='' && orderStatus !='' && customerId !='' && orderNo =='' && tdate ==''){
                        whereCondition = {createdAt : {$gte: start,},orderStatus:orderStatus,customerId:customerId}	
					
					
					}else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus !='' && customerId ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end},orderStatus:orderStatus}
					}else if(orderNo!='' && fdate !='' && tdate !='' && customerId !='' && orderStatus ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end},customerId:customerId}
					}else if(orderNo!='' && fdate !='' && orderStatus !='' && customerId !='' && tdate ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start},orderStatus:orderStatus,customerId:customerId}
					}else if(orderNo!='' && tdate !='' && orderStatus !='' && customerId !='' && fdate ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$lte: end},orderStatus:orderStatus,customerId:customerId}
                    }else if(fdate !='' && tdate !='' && orderStatus !='' && customerId !='' && orderNo ==''){
                        whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus,customerId:customerId}
                    
                
                    }else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus !='' && customerId !=''){
                        whereCondition = {orderNo:orderNo,createdAt:{$gte: start, $lte: end},orderStatus:orderStatus,customerId:customerId}
                    }

                let statusList = await models.dropdownSettings.findAll({ attributes: ['id', 'name'],where:{status: 'Yes'},
                                    include: [{model:  models.dropdownSettingsOptions, attributes: ['optionValue', 'optionLabel','optionOrder']}],
                                    // include: [{model:  models.dropdownSettingsOptions, attributes: [[Sequelize.literal('DISTINCT `optionValue`'), 'optionValue'],'optionValue', 'optionLabel','optionOrder']}],
                                    order: [[ models.dropdownSettingsOptions, 'optionOrder', 'ASC']] 
                                });
                var customerList = await models.customers.findAll({attributes:['id','firstName','lastName','mobile']});
               
                let ordersCustomers = await models.orders.findAll({attributes:[[Sequelize.literal('DISTINCT `customerId`'), 'customerId'],'customerId']})
               
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                let ordersList
                let listCount

                if(orderNo !=''|| customerId!=''|| fdate !=''|| tdate !=''|| orderStatus !=''){
                     ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'customerId','orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], where: whereCondition, limit:pageSize, offset:(page-1)*pageSize });
                     listCount = await models.orders.count({where: whereCondition})
                }else{
                    ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'customerId', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], where: {
                        [Op.or]: [
                            { orderNo: { [Op.like]: `%${search}%` } },
                            { customerId: { [Op.like]: `%${search}%` } },
                            { createdAt: { [Op.like]: `%${search}%` } },
                            { orderStatus: { [Op.like]: `%${search}%` } },
                            { amountPaid: { [Op.like]: `%${search}%` } },
                            { paymentStatus: { [Op.like]: `%${search}%` } },
                            { deliveryStatus: { [Op.like]: `%${search}%` } },
                            
                        ]
                      }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                      listCount = await models.orders.count({where: {
                        [Op.or]: [
                            { orderNo: { [Op.like]: `%${search}%` } },
                            { customerId: { [Op.like]: `%${search}%` } },
                            { createdAt: { [Op.like]: `%${search}%` } },
                            { orderStatus: { [Op.like]: `%${search}%` } },
                            { amountPaid: { [Op.like]: `%${search}%` } },
                            { paymentStatus: { [Op.like]: `%${search}%` } },
                            { deliveryStatus: { [Op.like]: `%${search}%` } },
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
                    return res.render('admin/orderReport/list', {
                        title: 'Order Report List',
                        statusList: statusList,
                        arrData: allOrders,
                        arrStore: storeList,
                        arrCustomer: customerList,
                        ordersCustomers:ordersCustomers,
                        sessionStoreId: '',
                        listCount: listCount,
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        searchItem: search,

                        orderFilter : orderNo,
                        customerFilter : customerId,
                        fdateFilter : fdate,
                        tdateFilter : tdate,
                        statusFilter : orderStatus,

                        pageSize: pageSize,
                        currentPage: parseInt(page),
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } else {
                    return res.render('admin/orderReport/list', {
                        title: 'Order Report List',
                        arrData: '',
                        statusList: statusList,
                        arrStore:'',
                        arrCustomer: customerList,
                        ordersCustomers:[],
                        sessionStoreId: '',
                        orderFilter : orderNo,
                        customerFilter : customerId,
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

                    // let whereCondition
                    // if (customerId !='' && fdate =='' && tdate =='' && orderStatus =='') {
                    //     whereCondition = {customerId:customerId}
                    // } else if(fdate !='' && tdate !='' && customerId =='' && orderStatus ==''){
                    //     whereCondition = { createdAt : {$gte: start, $lte: end}}
                    // }else if(orderStatus !='' && fdate =='' && tdate =='' && customerId ==''){
                    //     whereCondition = {orderStatus:orderStatus}
                    // }else if(customerId!='' && orderStatus !='' && fdate =='' && tdate ==''){
                    //     whereCondition = {customerId:customerId,orderStatus:orderStatus}
                    // }else if(customerId!='' && fdate !='' && tdate !='' && orderStatus ==''){
                    //     whereCondition = {customerId:customerId,createdAt : {$gte: start, $lte: end}}
                    // }else if(fdate !='' && tdate !='' && orderStatus !='' && customerId ==''){
                    //     whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus}
                    // }else if(customerId!='' && orderStatus !='' && fdate !='' && tdate ==''){
                    //     whereCondition = {customerId:customerId,orderStatus:orderStatus, createdAt : {$gte: start, $lte: end}}
                    // }

                    let whereCondition
                    if (orderNo !='' && customerId =='' && fdate =='' && tdate =='' && orderStatus =='') {
                        whereCondition = {orderNo:orderNo,storeId: sessionStoreId}
                    } else if(fdate !='' && customerId =='' && tdate =='' && orderNo =='' && orderStatus ==''){
                        whereCondition = { createdAt : {$gte: start},storeId: sessionStoreId}
                    } else if(tdate !='' && customerId =='' && fdate =='' && orderNo =='' && orderStatus ==''){
                        whereCondition = { createdAt : {$lte: end},storeId: sessionStoreId}
                    } else if(orderStatus !='' && customerId =='' && fdate =='' && tdate =='' && orderNo ==''){
                        whereCondition = {orderStatus:orderStatus,storeId: sessionStoreId}
					} else if(customerId !='' && orderStatus =='' && fdate =='' && tdate =='' && orderNo ==''){
						whereCondition = {customerId:customerId,storeId: sessionStoreId}

                    } else if(orderNo !='' && fdate !='' && tdate =='' && orderStatus =='' && customerId ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start},storeId: sessionStoreId}
                    } else if(orderNo !='' && tdate !='' && fdate =='' && orderStatus =='' && customerId ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$lte: end},storeId: sessionStoreId}
                    }else if(orderNo!='' && orderStatus !='' && fdate =='' && tdate =='' && customerId ==''){
                        whereCondition = {orderNo:orderNo,orderStatus:orderStatus,storeId: sessionStoreId}
					}else if(orderNo!='' && customerId !='' && fdate =='' && tdate =='' && orderStatus ==''){
                        whereCondition = {orderNo:orderNo,customerId:customerId,storeId: sessionStoreId}
                    }else if(fdate !='' && tdate !='' && orderNo=='' && orderStatus ==''&& customerId ==''){
                        whereCondition = {createdAt : {$gte: start, $lte: end},storeId: sessionStoreId}
                    }else if(fdate !='' && orderStatus !='' && orderNo=='' && tdate =='' && customerId ==''){
                        whereCondition = {createdAt : {$gte: start},orderStatus:orderStatus,storeId: sessionStoreId}
					}else if(fdate !='' && customerId !='' && orderNo=='' && orderStatus ==''&& tdate ==''){
                        whereCondition = {createdAt : {$gte: start},customerId:customerId,storeId: sessionStoreId}
                    }else if(tdate !='' && orderStatus !='' && orderNo=='' && fdate =='' && customerId ==''){
                        whereCondition = {createdAt : {$lte: end},orderStatus:orderStatus,storeId: sessionStoreId}
					}else if(tdate !='' && customerId !='' && orderNo=='' && orderStatus =='' && fdate ==''){
						whereCondition = {createdAt : {$lte: end},customerId:customerId,storeId: sessionStoreId}
					}else if(customerId !='' && orderStatus !='' && orderNo=='' && tdate =='' && fdate ==''){
						whereCondition = {customerId:customerId,orderStatus:orderStatus,storeId: sessionStoreId}
					
					}else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus =='' && customerId ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end},storeId: sessionStoreId}
					}else if(orderNo!='' && fdate !='' && orderStatus !='' && tdate =='' && customerId ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start},orderStatus:orderStatus,storeId: sessionStoreId}
					}else if(orderNo !='' && fdate !='' && customerId !='' && tdate =='' && orderStatus ==''){
                        whereCondition = {createdAt : {$gte: start},orderStatus:orderStatus,storeId: sessionStoreId}
					}else if(orderNo !=''  && tdate !='' && orderStatus !='' && fdate =='' && customerId ==''){	
                        whereCondition = {orderNo:orderNo,createdAt : { $lte: end},orderStatus:orderStatus,storeId: sessionStoreId}
					}else if(orderNo !=''  && tdate !='' && customerId !='' && fdate =='' && orderStatus ==''){	
                        whereCondition = {orderNo:orderNo,createdAt : { $lte: end},orderStatus:orderStatus,storeId: sessionStoreId}
					}else if(orderNo !='' && orderStatus !='' && customerId !='' && fdate =='' && tdate ==''){
                        whereCondition = {orderNo:orderNo,createdAt : { $lte: end},customerId:customerId,storeId: sessionStoreId}	
                    }else if( fdate !='' && tdate !='' && orderStatus !='' && orderNo =='' && customerId ==''){
                        whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus,storeId: sessionStoreId}
					}else if( fdate !='' && tdate =='' && customerId !='' && orderNo =='' && orderStatus ==''){
                        whereCondition = {createdAt : {$gte: start, $lte: end},customerId:customerId,storeId: sessionStoreId}
					}else if( fdate !='' && orderStatus !='' && customerId !='' && orderNo =='' && tdate ==''){
                        whereCondition = {createdAt : {$gte: start,},orderStatus:orderStatus,customerId:customerId,storeId: sessionStoreId}	
					
					}else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus !='' && customerId ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end},orderStatus:orderStatus,storeId: sessionStoreId}
					}else if(orderNo!='' && fdate !='' && tdate !='' && customerId !='' && orderStatus ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start, $lte: end},customerId:customerId,storeId: sessionStoreId}
					}else if(orderNo!='' && fdate !='' && orderStatus !='' && customerId !='' && tdate ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$gte: start},orderStatus:orderStatus,customerId:customerId,storeId: sessionStoreId}
					}else if(orderNo!='' && tdate !='' && orderStatus !='' && customerId !='' && fdate ==''){
                        whereCondition = {orderNo:orderNo,createdAt : {$lte: end},orderStatus:orderStatus,customerId:customerId,storeId: sessionStoreId}
                    }else if(fdate !='' && tdate !='' && orderStatus !='' && customerId !='' && orderNo ==''){
                        whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus,customerId:customerId,storeId: sessionStoreId}
                    
                    }else if(orderNo!='' && fdate !='' && tdate !='' && orderStatus !='' && customerId !=''){
                        whereCondition = {orderNo:orderNo,createdAt:{$gte: start, $lte: end},orderStatus:orderStatus,customerId:customerId,storeId: sessionStoreId}
                    }
    


                    let statusList = await models.dropdownSettings.findAll({ attributes: ['id', 'name'],where:{storeId: sessionStoreId, status: 'Yes'},
                                                                            include: [{model:  models.dropdownSettingsOptions, attributes: ['optionValue', 'optionLabel','optionOrder']}],
                                                                                order: [[ models.dropdownSettingsOptions, 'optionOrder', 'ASC']] 
                                                                            });
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });
                    var customerList = await models.customers.findAll({attributes:['id','firstName','lastName','mobile'],where:{status:'Yes'}});
                    let ordersCustomers = await models.orders.findAll({attributes:['customerId'], where:{id: sessionStoreId}})

                    let ordersList
                    let listCount
    
                    if(customerId!=''|| fdate !=''|| tdate !=''|| orderStatus !=''){
                        ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'customerId', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], where: whereCondition, limit:pageSize, offset:(page-1)*pageSize });
                        listCount = await models.orders.count({where:{whereCondition}})
                    }else{
                        ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'customerId', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'],
                         where: {storeId: sessionStoreId, 
                            [Op.or]: [
                                { orderNo: { [Op.like]: `%${search}%` } },
                                { customerId: { [Op.like]: `%${search}%` } },
                                { createdAt: { [Op.like]: `%${search}%` } },
                                { orderStatus: { [Op.like]: `%${search}%` } },
                                { amountPaid: { [Op.like]: `%${search}%` } },
                                { paymentStatus: { [Op.like]: `%${search}%` } },
                                { deliveryStatus: { [Op.like]: `%${search}%` } },
                            ] 
                        },order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize });

                        listCount = await models.orders.count({where: {
                            [Op.or]: [
                                { orderNo: { [Op.like]: `%${search}%` } },
                                    { customerId: { [Op.like]: `%${search}%` } },
                                    { createdAt: { [Op.like]: `%${search}%` } },
                                    { orderStatus: { [Op.like]: `%${search}%` } },
                                    { amountPaid: { [Op.like]: `%${search}%` } },
                                    { paymentStatus: { [Op.like]: `%${search}%` } },
                                    { deliveryStatus: { [Op.like]: `%${search}%` } },
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
                        return res.render('admin/orderReport/list', {
                            title: 'Order Report List',
                            statusList: statusList,
                            arrData: allOrders,
                            arrStore: storeList,
                            arrCustomer: customerList,
                            ordersCustomers:ordersCustomers,
                            sessionStoreId: sessionStoreId,
                            listCount: listCount,
                            pageCount: pageCount,
                            columnName: column,
                            orderType: order,
                            searchItem: search,
                            pageSize: pageSize,
                            orderFilter : orderNo,
                            customerFilter : customerId,
                            fdateFilter : fdate,
                            tdateFilter : tdate,
                            statusFilter : orderStatus,

                            currentPage: parseInt(page),
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                        });
                    } else {
                        return res.render('admin/orderReport/list', {
                            title: 'Order Report List',
                            arrData: '',
                            statusList: statusList,
                            arrStore: '',
                            arrCustomer: customerList,
                            ordersCustomers:[],
                            orderFilter : orderNo,
                            customerFilter : customerId,
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

/**
 * Description: This function is developed for Download Order Report
 * Developer:Surajit Gouri 
**/

exports.downloadOrderReport = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;

    let column = req.query.column || 'id';
    let order = req.query.order || 'DESC';
    let pagesizes = req.query.pagesize || 10;
    let pageSize = parseInt(pagesizes);
    let page = req.params.page || 1;

    let search = req.query.search || '';

    let customerId = req.query.customerId || '';
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

                let whereCondition
                if (customerId !='' && fdate =='' && tdate =='' && orderStatus =='') {
                    whereCondition = {customerId:customerId}
                } else if(fdate !='' && tdate !='' && customerId =='' && orderStatus ==''){
                    whereCondition = { createdAt : {$gte: start, $lte: end}}
                }else if(orderStatus !='' && fdate =='' && tdate =='' && customerId ==''){
                    whereCondition = {orderStatus:orderStatus}
                }else if(customerId!='' && orderStatus !='' && fdate =='' && tdate ==''){
                    whereCondition = {customerId:customerId,orderStatus:orderStatus}
                }else if(customerId!='' && fdate !='' && tdate !='' && orderStatus ==''){
                    whereCondition = {customerId:customerId,createdAt : {$gte: start, $lte: end}}
                }else if(fdate !='' && tdate !='' && orderStatus !='' && customerId ==''){
                    whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus}
                }else if(customerId!='' && orderStatus !='' && fdate !='' && tdate ==''){
                    whereCondition = {customerId:customerId,orderStatus:orderStatus, createdAt : {$gte: start, $lte: end}}
                }

                // let statusList = await models.dropdownSettings.findAll({ attributes: ['id', 'name'],where:{status: 'Yes'},
                //                     include: [{model:  models.dropdownSettingsOptions, attributes: ['optionValue', 'optionLabel','optionOrder']}],
                //                         order: [[ models.dropdownSettingsOptions, 'optionOrder', 'ASC']] 
                //                 });
                // var customerList = await models.customers.findAll({attributes:['id','firstName','lastName','mobile'],where:{status:'Yes'}});
                // let ordersCustomers = await models.orders.findAll({attributes:['customerId']})
                // let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });

                let ordersList

                if(customerId!=''|| fdate !=''|| tdate !=''|| orderStatus !=''){
                     ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'customerId','orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], where: whereCondition, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
                }else{
                    ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'customerId', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], where: {
                        [Op.or]: [
                            { orderNo: { [Op.like]: `%${search}%` } },
                            // { customerId: { [Op.like]: `%${search}%` } },
                            { createdAt: { [Op.like]: `%${search}%` } },
                            { orderStatus: { [Op.like]: `%${search}%` } },
                            { amountPaid: { [Op.like]: `%${search}%` } },
                            { paymentStatus: { [Op.like]: `%${search}%` } },
                            { deliveryStatus: { [Op.like]: `%${search}%` } },
                            
                        ]
                      },  });
                }

                // let listCount = await models.orders.count({where: {
                //     [Op.or]: [
                //         { orderNo: { [Op.like]: `%${search}%` } },
                //             { customerId: { [Op.like]: `%${search}%` } },
                //             { createdAt: { [Op.like]: `%${search}%` } },
                //             { orderStatus: { [Op.like]: `%${search}%` } },
                //             { amountPaid: { [Op.like]: `%${search}%` } },
                //             { paymentStatus: { [Op.like]: `%${search}%` } },
                //             { deliveryStatus: { [Op.like]: `%${search}%` } },
                //     ]
                //   }});
               
                // let pageCount = Math.ceil(listCount/pageSize);
                
                let allOrders = []

                for(let order of ordersList){
                    let orderItem = await models.orderItems.findAll({ attributes: ['id','orderId','productId','totalPrice'], where: { orderId: order.id }});
                    let store = await models.stores.findAll({ attributes:['id','storeName'], where:{id: order.storeId}});
                    let customers = await models.customers.findAll({ attributes: ['firstName','lastName','mobile'], where: { id: order.customerId}});

                    let orders = order.dataValues;

                    if(store){
                        orders.storeName = store[0].storeName
                    }
                    // if(customers.length>0){
                    //     orders.customerName = customers[0].firstName + ' ' + customers[0].lastName
                    //     orders.mobile = customers[0].mobile
                    // }

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
                let worksheet = workbook.addWorksheet("OrderReportList");
            
                worksheet.columns = [
                    { header: "Order No", key: "orderNo", width: 15 },
                    { header: "Store Name", key: "storeName", width: 15 },
                    { header: "Mobile", key: "mobile", width: 12 },
                    { header: "Date", key: "createdAt", width: 12 },
                    { header: "Status", key: "orderStatus", width: 15 },
                    { header: "Total", key: "amountPaid", width: 10 },
                    // { header: "Total", key: "amountPaid", width: 10 },
                    { header: "Payment Status", key: "paymentStatus", width:40 },
                    { header: "Delivery status", key: "deliveryStatus", width: 10 }
                    //{ header: "Order Item", key: "orderItems", width: 40 }
                   
                ];
            
                // Add Array Rows
               // worksheet.addRows(allOrders);
               worksheet.addRows(allOrders);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "OrderReportList.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })

                // if (ordersList) {
                //     return res.render('admin/orderReport/list', {
                //         title: 'Order Report List',
                //         statusList: statusList,
                //         arrData: allOrders,
                //         arrStore: storeList,
                //         arrCustomer: customerList,
                //         ordersCustomers:ordersCustomers,
                //         sessionStoreId: '',
                //         listCount: listCount,
                //         pageCount: pageCount,
                //         columnName: column,
                //         orderType: order,
                //         searchItem: search,

                //         customerFilter : customerId,
                //         fdateFilter : fdate,
                //         tdateFilter : tdate,
                //         statusFilter : orderStatus,

                //         pageSize: pageSize,
                //         currentPage: parseInt(page),
                //         messages: req.flash('info'),
                //         errors: req.flash('errors'),
                //     });
                // } else {
                //     return res.render('admin/orderReport/list', {
                //         title: 'Order Report List',
                //         arrData: '',
                //         statusList: statusList,
                //         arrStore:'',
                //         arrCustomer: customerList,
                //         ordersCustomers:[],
                //         sessionStoreId: '',

                //         customerFilter : customerId,
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

                    let whereCondition
                    if (customerId !='' && fdate =='' && tdate =='' && orderStatus =='') {
                        whereCondition = {customerId:customerId}
                    } else if(fdate !='' && tdate !='' && customerId =='' && orderStatus ==''){
                        whereCondition = { createdAt : {$gte: start, $lte: end}}
                    }else if(orderStatus !='' && fdate =='' && tdate =='' && customerId ==''){
                        whereCondition = {orderStatus:orderStatus}
                    }else if(customerId!='' && orderStatus !='' && fdate =='' && tdate ==''){
                        whereCondition = {customerId:customerId,orderStatus:orderStatus}
                    }else if(customerId!='' && fdate !='' && tdate !='' && orderStatus ==''){
                        whereCondition = {customerId:customerId,createdAt : {$gte: start, $lte: end}}
                    }else if(fdate !='' && tdate !='' && orderStatus !='' && customerId ==''){
                        whereCondition = {createdAt : {$gte: start, $lte: end},orderStatus:orderStatus}
                    }else if(customerId!='' && orderStatus !='' && fdate !='' && tdate ==''){
                        whereCondition = {customerId:customerId,orderStatus:orderStatus, createdAt : {$gte: start, $lte: end}}
                    }
    
                    // let statusList = await models.dropdownSettings.findAll({ attributes: ['id', 'name'],where:{storeId: sessionStoreId, status: 'Yes'},
                    //                                                         include: [{model:  models.dropdownSettingsOptions, attributes: ['optionValue', 'optionLabel','optionOrder']}],
                    //                                                             order: [[ models.dropdownSettingsOptions, 'optionOrder', 'ASC']] 
                    //                                                         });
                    // let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });
                    // var customerList = await models.customers.findAll({attributes:['id','firstName','lastName','mobile'],where:{status:'Yes'}});
                    // let ordersCustomers = await models.orders.findAll({attributes:['customerId'], where:{id: sessionStoreId}})

                    let ordersList
    
                    if(customerId!=''|| fdate !=''|| tdate !=''|| orderStatus !=''){
                         ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'customerId', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'], where: whereCondition, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
                    }else{
                        ordersList = await models.orders.findAll({ attributes: ['id', 'storeId', 'orderNo', 'customerId', 'orderStatus', 'shippingMethod', 'shippingAddress','amountPaid','createdAt'],
                         where: {storeId: sessionStoreId, 
                            [Op.or]: [
                                { orderNo: { [Op.like]: `%${search}%` } },
                                { customerId: { [Op.like]: `%${search}%` } },
                                { createdAt: { [Op.like]: `%${search}%` } },
                                { orderStatus: { [Op.like]: `%${search}%` } },
                                { amountPaid: { [Op.like]: `%${search}%` } },
                                { paymentStatus: { [Op.like]: `%${search}%` } },
                                { deliveryStatus: { [Op.like]: `%${search}%` } },
                            ] 
                        },order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize });
                    }


                    // let listCount = await models.orders.count({where: {
                    //     [Op.or]: [
                    //         { orderNo: { [Op.like]: `%${search}%` } },
                    //             { customerId: { [Op.like]: `%${search}%` } },
                    //             { createdAt: { [Op.like]: `%${search}%` } },
                    //             { orderStatus: { [Op.like]: `%${search}%` } },
                    //             { amountPaid: { [Op.like]: `%${search}%` } },
                    //             { paymentStatus: { [Op.like]: `%${search}%` } },
                    //             { deliveryStatus: { [Op.like]: `%${search}%` } },
                    //     ]
                    //   }});
                   
                   // let pageCount = Math.ceil(listCount/pageSize);

                    let allOrders = []

                    for(let order of ordersList){
                        let orderItem = await models.orderItems.findAll({ attributes: ['id','orderId','productId','totalPrice'], where: { orderId: order.id }});
                        let store = await models.stores.findAll({ attributes:['id','storeName'], where:{id: order.storeId}});
                        let customers = await models.customers.findAll({ attributes: ['firstName','lastName','mobile'], where: { id: order.customerId}});

                        let orders = order.dataValues;

                        if(store){
                            orders.storeName = store[0].storeName
                        }
                        if(customers){
                            orders.customerName = customers[0].firstName + ' ' + customers[0].lastName
                            orders.mobile = customers[0].mobile
                        }


                       
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

                                // let stores = await models.stores.findAll({ attributes:['id','storeName'], where:{id: items.storeId}});
                                // if(stores){
                                //     let storeName = storeName
                                // }
                            }
                            orders.orderItems = productName
                            orders.totalPrice = price
                        }
                        allOrders.push(orders)
                    }
                    let workbook = new excel.Workbook();
                    let worksheet = workbook.addWorksheet("OrderReportList");
                
                    worksheet.columns = [
                        { header: "Order No", key: "orderNo", width: 15 },
                        { header: "Store Name", key: "storeName", width: 15 },
                        { header: "Customer Name", key: "customerName", width: 15 },
                        { header: "Mobile", key: "mobile", width: 12 },
                        { header: "Date", key: "createdAt", width: 12 },
                        { header: "Status", key: "orderStatus", width: 15 },
                        { header: "Total", key: "amountPaid", width: 10 },
                        { header: "Shipping Address", key: "shippngAddress", width: 10 },
                        { header: "Payment Status", key: "paymentStatus", width:40 },
                        { header: "Delivery status", key: "deliveryStatus", width: 10 }
                    ];
                
                    // Add Array Rows
                    worksheet.addRows(allOrders);
                    worksheet.addRow({ 
                                    orderNo         : orderList[i].orderNo,
                                    storeName       : orderList[i].store.storeName ,                       
                                    customer        : orderList[i].customer.firstName,
                                    mobile          : orderList[i].mobile ,
                                    date            : orderList[i].createdAt ,
                                    orderStatus     : orderList[i].orderStatus ,
                                    amountPaid      : orderList[i].amountPaid ,
                                    shippingAddress : orderList[i].shippingAddress ,
                                    paymentStatus   : orderList[i].paymentStatus ,
                                    deliveryStatus  : orderList[i].deliveryStatus,
                                   
                                             
                                });
                
                    res.setHeader(
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    );
                    res.setHeader(
                        "Content-Disposition",
                        "attachment; filename=" + "OrderReportList.xlsx"
                    )

                    return workbook.xlsx.write(res).then(() => {
                        res.status(200).end();
                        return res.redirect('back');
                    })

                    // if (ordersList) {
                    //     return res.render('admin/orderReport/list', {
                    //         title: 'Order Report List',
                    //         statusList: statusList,
                    //         arrData: allOrders,
                    //         arrStore: storeList,
                    //         arrCustomer: customerList,
                    //         ordersCustomers:ordersCustomers,
                    //         sessionStoreId: sessionStoreId,
                    //         listCount: listCount,
                    //         pageCount: pageCount,
                    //         columnName: column,
                    //         orderType: order,
                    //         searchItem: search,
                    //         pageSize: pageSize,
                            
                    //         customerFilter : customerId,
                    //         fdateFilter : fdate,
                    //         tdateFilter : tdate,
                    //         statusFilter : orderStatus,

                    //         currentPage: parseInt(page),
                    //         messages: req.flash('info'),
                    //         errors: req.flash('errors'),
                    //     });
                    // } else {
                    //     return res.render('admin/orderReport/list', {
                    //         title: 'Order Report List',
                    //         arrData: '',
                    //         statusList: statusList,
                    //         arrStore: '',
                    //         arrCustomer: customerList,
                    //         ordersCustomers:[],

                    //         customerFilter : customerId,
                    //         fdateFilter : fdate,
                    //         tdateFilter : tdate,
                    //         statusFilter : orderStatus,

                    //         sessionStoreId: sessionStoreId,
                    //         messages: req.flash('info'),
                    //         errors: req.flash('errors'),
                    //     });
                    // }
                }                
            }            
        }	
    });
}


//  exports.downloadOrderReport1 = async function (req, res, next) {
//     var id = req.params.id;
//     var sessionStoreId = req.session.user.storeId;
//     var sessionUserId = req.session.user.id;
//     var role = req.session.role;
//     var token= req.session.token;
//     var workbook = new Excel.Workbook();

//     workbook.creator = 'Me';
//     workbook.lastModifiedBy = 'Her';
//     workbook.created = new Date(1985, 8, 30);
//     workbook.modified = new Date();
//     workbook.lastPrinted = new Date(2016, 9, 27);
//     workbook.properties.date1904 = true;

//     workbook.views = [
//         {
//             x: 0, y: 0, width: 10000, height: 20000,
//             firstSheet: 0, activeTab: 1, visibility: 'visible'
//         }
//     ];
//     var worksheet = workbook.addWorksheet('My Sheet');
//     worksheet.columns = [
//         { header: 'Store Name', key: 'storeName', width: 20 },
//         { header: 'Order No', key: 'orderNo', width: 20 },
//         { header: 'Customer', key: 'customer', width: 20 },
//         { header: 'Order Status', key: 'orderStatus', width: 20 },
//         { header: 'Payment Status', key: 'paymentStatus', width: 20 },
//         { header: 'Delivery Status', key: 'deliveryStatus', width: 20 },
//         { header: 'Total', key: 'total', width: 20 },
//         { header: 'Date', key: 'date', width: 20 }, 
             
//     ];

//     var form = new multiparty.Form();
//     form.parse(req, async function(err, fields, files) {
//         var fromDate = fields.fromDate[0];
//         var toDate = fields.toDate[0];

//         if(fields.fromDate[0] !='' && fields.toDate[0] !=''){
//             var orderList = await models.orders.findAll({
//                 attributes:['id','storeId','orderNo','customerId','orderStatus','paymentStatus','deliveryStatus','paymentMethod','total',
//                 [sequelize.fn('date_format', sequelize.col('orders.createdAt'), '%d-%m-%Y'), 'createdAt'],],
//                     where:{
//                         createdAt : {
//                             $gte: fromDate,
//                             $lte: toDate,
//                         }
//                     },
//                     include:[{
//                         model:models.stores,
//                         attributes:['storeName'],
//                         require:false,
                        
//                     },{
//                         model:models.customers,
//                         attributes:['firstName','lastName'],
//                         require:false,
//                     }],
//             })
//             // return res.send(orders);
//                 if(orderList.length>0){
//                     for(var i=0;i<orderList.length;i++){
//                         worksheet.addRow({ 
//                             storeName       : orderList[i].store.storeName ,
//                             orderNo         : orderList[i].orderNo,                            
//                             customer        : orderList[i].customer.firstName,
//                             orderStatus     : orderList[i].orderStatus ,
//                             paymentStatus   : orderList[i].paymentStatus ,
//                             deliveryStatus  : orderList[i].deliveryStatus,
//                             total           : orderList[i].total ,
//                             date           : orderList[i].createdAt          
//                         });
//                     }
//                 }
           
//             res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//             res.setHeader("Content-Disposition", "attachment; filename=" + "orderReport.xlsx");
//             workbook.xlsx.write(res)
//             .then(function (data) {
//                 res.end();
//                 console.log('File write done........');
//             });        
//         }else{
//             var orderList = await models.orders.findAll({
//                 attributes:['id','storeId','orderNo','customerId','orderStatus','paymentStatus','deliveryStatus','paymentMethod','total','createdAt',],
                  
//                     include:[{
//                         model:models.stores,
//                         attributes:['storeName'],
//                         require:false,
                        
//                     },{
//                         model:models.customers,
//                         attributes:['firstName','lastName'],
//                         require:false,
//                     }],
//             })
          
//                     if(orderList.length>0){
//                         for(var i=0;i<orderList.length;i++){
//                             worksheet.addRow({ 
//                                 storeName       : orderList[i].store.storeName ,
//                                 orderNo         : orderList[i].orderNo,                            
//                                 customer        : orderList[i].customer.firstName,
//                                 orderStatus     : orderList[i].orderStatus ,
//                                 paymentStatus   : orderList[i].paymentStatus ,
//                                 deliveryStatus  : orderList[i].deliveryStatus,
//                                 total           : orderList[i].total , 
//                                 date           : orderList[i].createdAt         
//                             });
//                         }
//                     }
              
//                 res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//                 res.setHeader("Content-Disposition", "attachment; filename=" + "orderReport.xlsx");
//                 workbook.xlsx.write(res)
//                 .then(function (data) {
//                     res.end();
//                     console.log('File write done........');
//                 });      
//         }

//     });
           
// };
