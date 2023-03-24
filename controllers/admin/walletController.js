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
 * Description: This function is developed for wallet listing 
 * Developer: Surajit Gouri
*/

// exports.walletList = async function(req, res){
//     var token= req.session.token;
//     var sessionStoreId = req.session.user.storeId;
//     var role = req.session.role;

//     let column = req.query.column || 'id';
//     let order = req.query.order || 'ASC';
//     let pagesizes = req.query.pagesize || 10;
//     let pageSize = parseInt(pagesizes);
//     let page = req.params.page || 1;

//     let search = req.query.search || '';
//     let option = req.query.option || '';
//     let startdate = req.query.startdate || '';
//     let enddate = req.query.enddate || '';
//     let searchItem = req.query.searchItem || '';
//     jwt.verify(token, SECRET, async function(err, decoded) {
//         if (err) {
//             req.flash("info", "Invalid Token");
//             res.redirect('/auth/signin');
//         }else{
//             if (sessionStoreId == null) {
//              if(option == ''){
//                var storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
//                 var customerList = await models.customers.findAll({attributes:['id','firstName','lastName'],where:{status:'Yes'}});
                
//                 let walletTransactionList = await models.walletTransaction.findAll({ where: {
//                     [Op.or]: [
//                         {orderId: {[Op.like]:`%${search}%`}},
//                         {transactionType: {[Op.like]:`%${search}%`}},
//                         {amount: {[Op.like]:`%${search}%`}},
//                         {remarks: {[Op.like]:`%${search}%`}},
//                         {balance: {[Op.like]:`%${search}%`}},
//                         {createdBy: {[Op.like]:`%${search}%`}} 
//                     ]
//                   }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

//                 let listCount = await models.walletTransaction.count({where: {
//                     [Op.or]: [
//                         {orderId: {[Op.like]:`%${search}%`}},
//                         {transactionType: {[Op.like]:`%${search}%`}},
//                         {amount: {[Op.like]:`%${search}%`}},
//                         {remarks: {[Op.like]:`%${search}%`}},
//                         {balance: {[Op.like]:`%${search}%`}},
//                         {createdBy: {[Op.like]:`%${search}%`}} 
//                     ]
//                   }});

//                 let pageCount = Math.ceil(listCount/pageSize);

//                 if (walletTransactionList) {
//                     return res.render('admin/walletTransaction/list', {
//                         title: 'Wallet Transaction List',
//                         arrData: walletTransactionList,
//                         arrStore: storeList,
//                         arrCustomer: customerList,
//                         sessionStoreId: '',
//                         listCount: listCount,
//                         pageCount: pageCount,
//                         columnName: column,
//                         orderType: order,
//                         searchItem: search,
//                         pageSize: pageSize,
//                         option: '',
//                         currentPage: parseInt(page),
//                         messages: req.flash('info'),
//                         errors: req.flash('errors'),
//                     });
//                 } else {
//                     return res.render('admin/wallet/list', {
//                         title: 'Wallet Transaction List',
//                         arrData: [],
//                         option: '',
//                         arrStore: storeList,
//                         arrCustomer: customerList,
//                         sessionStoreId: '',
//                         messages: req.flash('info'),
//                         errors: req.flash('errors'),
//                     });
//                 }
//             }else if(option == 'Name'){
//                 var storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
//                 var customerList = await models.customers.findAll({attributes:['id','firstName','lastName'],where:{status:'Yes'}});

//                 let walletTransactionList = await models.customers.findAll({ where:{[Op.or]: [ 
//                    { firstName: {[Op.like]:`%${searchItem}%`}}, {lastName: {[Op.like]:`%${searchItem}%`}}
//                 ]}, include: [{
//                     model: models.walletTransaction,
//                     required: false
//                 }], order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

//                 // return res.send(walletTransactionList)
//                 let listCount = walletTransactionList.length;
//                 let pageCount = Math.ceil(listCount/pageSize);
                

//                 if (walletTransactionList.length>0) {
//                     return res.render('admin/walletTransaction/list', {
//                         title: 'Wallet Transaction List',
//                         arrData: walletTransactionList,
//                         arrStore: storeList,
//                         arrCustomer: customerList,
//                         sessionStoreId: '',
//                         listCount: listCount,
//                         pageCount: pageCount,
//                         columnName: column,
//                         orderType: order,
//                         searchItem: search,
//                         option: 'Name',
//                         pageSize: pageSize,
//                         currentPage: parseInt(page),
//                         messages: req.flash('info'),
//                         errors: req.flash('errors'),
//                     });
//                 } else {
//                     return res.render('admin/walletTransaction/list', {
//                         title: 'Wallet Transaction List',
//                         arrData: [],
//                         arrStore: storeList,
//                         arrCustomer: customerList,
//                         option: 'Name',
//                         sessionStoreId: '',
//                         listCount: '',
//                         pageCount: '',
//                         columnName: '',
//                         orderType: '',
//                         searchItem: '',
//                         pageSize: '',
//                         currentPage:'',
//                         messages: req.flash('info'),
//                         errors: req.flash('errors'),
//                     });
//                 }
//             }else if(option == 'DateRange'){
//                 var storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
//                 var customerList = await models.customers.findAll({attributes:['id','firstName','lastName'],where:{status:'Yes'}});

//                 let walletTransactionList = await models.walletTransaction.findAll({ where:{
//                     createdAt : {[Op.gte]: `${startdate}`, [Op.lte]: `${enddate}`}
//                 },order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

//                 // return res.send(walletTransactionList)
//                 let listCount = walletTransactionList.length;
//                 let pageCount = Math.ceil(listCount/pageSize);
                

//                 if (walletTransactionList.length>0) {
//                     return res.render('admin/walletTransaction/list', {
//                         title: 'Wallet Transaction List',
//                         arrData: walletTransactionList,
//                         arrStore: storeList,
//                         arrCustomer: customerList,
//                         sessionStoreId: '',
//                         listCount: listCount,
//                         pageCount: pageCount,
//                         columnName: column,
//                         orderType: order,
//                         searchItem: search,
//                         option: '',
//                         pageSize: pageSize,
//                         currentPage: parseInt(page),
//                         messages: req.flash('info'),
//                         errors: req.flash('errors'),
//                     });
//                 } else {
//                     return res.render('admin/walletTransaction/list', {
//                         title: 'Wallet Transaction List',
//                         arrData: [],
//                         arrStore: storeList,
//                         arrCustomer: customerList,
//                         option: '',
//                         sessionStoreId: '',
//                         listCount: '',
//                         pageCount: '',
//                         columnName: '',
//                         orderType: '',
//                         searchItem: '',
//                         pageSize: '',
//                         currentPage:'',
//                         messages: req.flash('info'),
//                         errors: req.flash('errors'),
//                     });
//                 }
//             }
//             }else{
//                 //*****Permission Assign Start
//                 var userPermission = false;
//                 if (role == 'admin') {
//                     userPermission = true;
//                 } else {
//                     userPermission = !!req.session.permissions.find(permission => {
//                         return permission === 'WalletList'
//                     })
//                 }
//                 if (userPermission == false) {
//                     req.flash('errors', 'Contact Your administrator for permission');
//                     res.redirect('/admin/dashboard');
//                 } else {


//                     var customerList = await models.customers.findAll({attributes:['id','firstName','lastName'],where:{status:'Yes', storeId: sessionStoreId}});
//                     let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });

//                     let walletTransactionList = await models.walletTransaction.findAll({ order: [[column, order]], where: { storeId: sessionStoreId, [Op.or]: [
//                         {orderId: {[Op.like]:`%${search}%`}},
//                         {transactionType: {[Op.like]:`%${search}%`}},
//                         {amount: {[Op.like]:`%${search}%`}},
//                         {remarks: {[Op.like]:`%${search}%`}},
//                         {balance: {[Op.like]:`%${search}%`}},
//                         {createdBy: {[Op.like]:`%${search}%`}} 
//                       ] },limit:pageSize, offset:(page-1)*pageSize });

//                     let listCount = await models.walletTransaction.count({where: { storeId: sessionStoreId, [Op.or]: [
//                         {orderId: {[Op.like]:`%${search}%`}},
//                         {transactionType: {[Op.like]:`%${search}%`}},
//                         {amount: {[Op.like]:`%${search}%`}},
//                         {remarks: {[Op.like]:`%${search}%`}},
//                         {balance: {[Op.like]:`%${search}%`}},
//                         {createdBy: {[Op.like]:`%${search}%`}} 
//                       ] }});

//                     let pageCount = Math.ceil(listCount/pageSize);

//                     if (walletTransactionList) {
//                         return res.render('admin/walletTransaction/list', {
//                             title: 'Wallet Transaction List',
//                             arrData: walletTransactionList,
//                             arrStore: storeList,
//                             arrCustomer: customerList,
//                             sessionStoreId: sessionStoreId,
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
//                         return res.render('admin/walletTransaction/list', {
//                             title: 'Wallet Transaction List',
//                             arrData: '',
//                             arrStore: storeList,
//                             arrCustomer: customerList,
//                             sessionStoreId: sessionStoreId,
//                             messages: req.flash('info'),
//                             errors: req.flash('errors'),
//                         });
//                     }
//                 }                
//             }            
//         }	
//     });
// }



exports.walletList = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;

    let column = req.query.column || 'id';
    let order = req.query.order || 'ASC';
    let pagesizes = req.query.pagesize || 10;
    let pageSize = parseInt(pagesizes);
    let page = req.params.page || 1;

    let search = req.query.search || '';
    let option = req.query.option || '';
    let startdate = req.query.startdate || '';
    let enddate = req.query.enddate || '';
    let searchItem = req.query.searchItem || '';
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
             if(option == ''){
               var storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                var customerList = await models.customers.findAll({attributes:['id','firstName','lastName'],where:{status:'Yes'}});
                
                let walletTransactionList = await models.walletTransaction.findAll({ where: {
                    [Op.or]: [
                        {orderId: {[Op.like]:`%${search}%`}},
                        {transactionType: {[Op.like]:`%${search}%`}},
                        {amount: {[Op.like]:`%${search}%`}},
                        {remarks: {[Op.like]:`%${search}%`}},
                        {balance: {[Op.like]:`%${search}%`}},
                        {createdBy: {[Op.like]:`%${search}%`}} 
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.walletTransaction.count({where: {
                    [Op.or]: [
                        {orderId: {[Op.like]:`%${search}%`}},
                        {transactionType: {[Op.like]:`%${search}%`}},
                        {amount: {[Op.like]:`%${search}%`}},
                        {remarks: {[Op.like]:`%${search}%`}},
                        {balance: {[Op.like]:`%${search}%`}},
                        {createdBy: {[Op.like]:`%${search}%`}} 
                    ]
                  }});

                let pageCount = Math.ceil(listCount/pageSize);

                if (walletTransactionList) {
                    return res.render('admin/walletTransaction/list', {
                        title: 'Wallet Transaction List',
                        arrData: walletTransactionList,
                        arrStore: storeList,
                        arrCustomer: customerList,
                        sessionStoreId: '',
                        listCount: listCount,
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        searchItem: search,
                        pageSize: pageSize,
                        option: '',
                        currentPage: parseInt(page),
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } else {
                    return res.render('admin/wallet/list', {
                        title: 'Wallet Transaction List',
                        arrData: [],
                        option: '',
                        arrStore: storeList,
                        arrCustomer: customerList,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                }
            }else if(option == 'Name'){
                var storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                var customerList = await models.customers.findAll({attributes:['id','firstName','lastName'],where:{status:'Yes'}});

                let walletTransactionList = await models.customers.findAll({ 
                where:{
                    [Op.or]: [ 
                        { firstName: {[Op.like]:`%${searchItem}%`} },
                        {lastName: {[Op.like]:`%${searchItem}%`} }
                    ]
                }, 
                include: [{
                    model: models.walletTransaction,
                    required: false
                }],
                order: [[column, order]],
                limit:pageSize,
                offset:(page-1)*pageSize });

                // return res.send(walletTransactionList)
                let listCount = walletTransactionList.length;
                let pageCount = Math.ceil(listCount/pageSize);
                

                if (walletTransactionList.length>0) {
                    return res.render('admin/walletTransaction/list', {
                        title: 'Wallet Transaction List',
                        arrData: walletTransactionList,
                        arrStore: storeList,
                        arrCustomer: customerList,
                        sessionStoreId: '',
                        listCount: listCount,
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        searchItem: search,
                        option: 'Name',
                        pageSize: pageSize,
                        currentPage: parseInt(page),
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } else {
                    return res.render('admin/walletTransaction/list', {
                        title: 'Wallet Transaction List',
                        arrData: [],
                        arrStore: storeList,
                        arrCustomer: customerList,
                        option: 'Name',
                        sessionStoreId: '',
                        listCount: '',
                        pageCount: '',
                        columnName: '',
                        orderType: '',
                        searchItem: '',
                        pageSize: '',
                        currentPage:'',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                }
            }else if(option == 'DateRange'){
                var storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                var customerList = await models.customers.findAll({attributes:['id','firstName','lastName'],where:{status:'Yes'}});

                let walletTransactionList = await models.walletTransaction.findAll({ where:{
                    createdAt : {[Op.gte]: `${startdate}`, [Op.lte]: `${enddate}`}
                },order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                // return res.send(walletTransactionList)
                let listCount = walletTransactionList.length;
                let pageCount = Math.ceil(listCount/pageSize);
                

                if (walletTransactionList.length>0) {
                    return res.render('admin/walletTransaction/list', {
                        title: 'Wallet Transaction List',
                        arrData: walletTransactionList,
                        arrStore: storeList,
                        arrCustomer: customerList,
                        sessionStoreId: '',
                        listCount: listCount,
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        searchItem: search,
                        option: '',
                        pageSize: pageSize,
                        currentPage: parseInt(page),
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } else {
                    return res.render('admin/walletTransaction/list', {
                        title: 'Wallet Transaction List',
                        arrData: [],
                        arrStore: storeList,
                        arrCustomer: customerList,
                        option: '',
                        sessionStoreId: '',
                        listCount: '',
                        pageCount: '',
                        columnName: '',
                        orderType: '',
                        searchItem: '',
                        pageSize: '',
                        currentPage:'',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
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
                        return permission === 'WalletList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {


                    // var customerList = await models.customers.findAll({attributes:['id','firstName','lastName'],where:{status:'Yes', storeId: sessionStoreId}});
                    // let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });

                    // let walletTransactionList = await models.walletTransaction.findAll({ order: [[column, order]], where: { storeId: sessionStoreId, [Op.or]: [
                    //     {orderId: {[Op.like]:`%${search}%`}},
                    //     {transactionType: {[Op.like]:`%${search}%`}},
                    //     {amount: {[Op.like]:`%${search}%`}},
                    //     {remarks: {[Op.like]:`%${search}%`}},
                    //     {balance: {[Op.like]:`%${search}%`}},
                    //     {createdBy: {[Op.like]:`%${search}%`}} 
                    //   ] },limit:pageSize, offset:(page-1)*pageSize });

                    // let listCount = await models.walletTransaction.count({where: { storeId: sessionStoreId, [Op.or]: [
                    //     {orderId: {[Op.like]:`%${search}%`}},
                    //     {transactionType: {[Op.like]:`%${search}%`}},
                    //     {amount: {[Op.like]:`%${search}%`}},
                    //     {remarks: {[Op.like]:`%${search}%`}},
                    //     {balance: {[Op.like]:`%${search}%`}},
                    //     {createdBy: {[Op.like]:`%${search}%`}} 
                    //   ] }});

                    // let pageCount = Math.ceil(listCount/pageSize);

                    // if (walletTransactionList) {
                    //     return res.render('admin/walletTransaction/list', {
                    //         title: 'Wallet Transaction List',
                    //         arrData: walletTransactionList,
                    //         arrStore: storeList,
                    //         arrCustomer: customerList,
                    //         sessionStoreId: sessionStoreId,
                    //         listCount: listCount,
                    //         pageCount: pageCount, 
                    //         columnName: column,
                    //         orderType: order,
                    //         searchItem: search,
                    //         pageSize: pageSize,
                    //         currentPage: parseInt(page),
                    //         messages: req.flash('info'),
                    //         errors: req.flash('errors'),
                    //     });
                    // } else {
                    //     return res.render('admin/walletTransaction/list', {
                    //         title: 'Wallet Transaction List',
                    //         arrData: '',
                    //         arrStore: storeList,
                    //         arrCustomer: customerList,
                    //         sessionStoreId: sessionStoreId,
                    //         messages: req.flash('info'),
                    //         errors: req.flash('errors'),
                    //     });
                    // }

                    if(option == ''){
                        var storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                         var customerList = await models.customers.findAll({attributes:['id','firstName','lastName'],where:{status:'Yes'}});
                         
                         let walletTransactionList = await models.walletTransaction.findAll({ where: {storeId: sessionStoreId,
                             [Op.or]: [
                                 {orderId: {[Op.like]:`%${search}%`}},
                                 {transactionType: {[Op.like]:`%${search}%`}},
                                 {amount: {[Op.like]:`%${search}%`}},
                                 {remarks: {[Op.like]:`%${search}%`}},
                                 {balance: {[Op.like]:`%${search}%`}},
                                 {createdBy: {[Op.like]:`%${search}%`}} 
                             ]
                           }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
         
                         let listCount = await models.walletTransaction.count({where: {storeId: sessionStoreId,
                             [Op.or]: [
                                 {orderId: {[Op.like]:`%${search}%`}},
                                 {transactionType: {[Op.like]:`%${search}%`}},
                                 {amount: {[Op.like]:`%${search}%`}},
                                 {remarks: {[Op.like]:`%${search}%`}},
                                 {balance: {[Op.like]:`%${search}%`}},
                                 {createdBy: {[Op.like]:`%${search}%`}} 
                             ]
                           }});
         
                         let pageCount = Math.ceil(listCount/pageSize);
         
                         if (walletTransactionList) {
                             return res.render('admin/walletTransaction/list', {
                                 title: 'Wallet Transaction List',
                                 arrData: walletTransactionList,
                                 arrStore: storeList,
                                 arrCustomer: customerList,
                                 sessionStoreId: '',
                                 listCount: listCount,
                                 pageCount: pageCount,
                                 columnName: column,
                                 orderType: order,
                                 searchItem: search,
                                 pageSize: pageSize,
                                 option: '',
                                 currentPage: parseInt(page),
                                 messages: req.flash('info'),
                                 errors: req.flash('errors'),
                             });
                         } else {
                             return res.render('admin/wallet/list', {
                                 title: 'Wallet Transaction List',
                                 arrData: [],
                                 option: '',
                                 arrStore: storeList,
                                 arrCustomer: customerList,
                                 sessionStoreId: '',
                                 messages: req.flash('info'),
                                 errors: req.flash('errors'),
                             });
                         }
                     }else if(option == 'Name'){
                         var storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                         var customerList = await models.customers.findAll({attributes:['id','firstName','lastName'],where:{status:'Yes'}});
         
                         let walletTransactionList = await models.customers.findAll({ where:{storeId: sessionStoreId,[Op.or]: [ 
                            { firstName: {[Op.like]:`%${searchItem}%`}}, {lastName: {[Op.like]:`%${searchItem}%`}}
                         ]}, include: [{
                             model: models.walletTransaction,
                             required: false
                         }], order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
         
                         // return res.send(walletTransactionList)
                         let listCount = walletTransactionList.length;
                         let pageCount = Math.ceil(listCount/pageSize);
                         
         
                         if (walletTransactionList.length>0) {
                             return res.render('admin/walletTransaction/list', {
                                 title: 'Wallet Transaction List',
                                 arrData: walletTransactionList,
                                 arrStore: storeList,
                                 arrCustomer: customerList,
                                 sessionStoreId: '',
                                 listCount: listCount,
                                 pageCount: pageCount,
                                 columnName: column,
                                 orderType: order,
                                 searchItem: search,
                                 option: 'Name',
                                 pageSize: pageSize,
                                 currentPage: parseInt(page),
                                 messages: req.flash('info'),
                                 errors: req.flash('errors'),
                             });
                         } else {
                             return res.render('admin/walletTransaction/list', {
                                 title: 'Wallet Transaction List',
                                 arrData: [],
                                 arrStore: storeList,
                                 arrCustomer: customerList,
                                 option: 'Name',
                                 sessionStoreId: '',
                                 listCount: '',
                                 pageCount: '',
                                 columnName: '',
                                 orderType: '',
                                 searchItem: '',
                                 pageSize: '',
                                 currentPage:'',
                                 messages: req.flash('info'),
                                 errors: req.flash('errors'),
                             });
                         }
                     }else if(option == 'DateRange'){
                         var storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                         var customerList = await models.customers.findAll({attributes:['id','firstName','lastName'],where:{status:'Yes'}});
         
                         let walletTransactionList = await models.walletTransaction.findAll({ where:{storeId: sessionStoreId,
                             createdAt : {[Op.gte]: `${startdate}`, [Op.lte]: `${enddate}`}
                         },order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
         
                         // return res.send(walletTransactionList)
                         let listCount = walletTransactionList.length;
                         let pageCount = Math.ceil(listCount/pageSize);
                         
         
                         if (walletTransactionList.length>0) {
                             return res.render('admin/walletTransaction/list', {
                                 title: 'Wallet Transaction List',
                                 arrData: walletTransactionList,
                                 arrStore: storeList,
                                 arrCustomer: customerList,
                                 sessionStoreId: '',
                                 listCount: listCount,
                                 pageCount: pageCount,
                                 columnName: column,
                                 orderType: order,
                                 searchItem: search,
                                 option: '',
                                 pageSize: pageSize,
                                 currentPage: parseInt(page),
                                 messages: req.flash('info'),
                                 errors: req.flash('errors'),
                             });
                         } else {
                             return res.render('admin/walletTransaction/list', {
                                 title: 'Wallet Transaction List',
                                 arrData: [],
                                 arrStore: storeList,
                                 arrCustomer: customerList,
                                 option: '',
                                 sessionStoreId: '',
                                 listCount: '',
                                 pageCount: '',
                                 columnName: '',
                                 orderType: '',
                                 searchItem: '',
                                 pageSize: '',
                                 currentPage:'',
                                 messages: req.flash('info'),
                                 errors: req.flash('errors'),
                             });
                         }
                     }


                }                
            }            
        }	
    });
}