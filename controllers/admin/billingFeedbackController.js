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
const Sequelize = require("sequelize");
const Op = Sequelize.Op

/**
 * This function is developed for listing BillingFeedback
 * Developer: Ahin Subhra Das
 */
exports.list = async function(req, res){
    let token= req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
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
        }else{
            if (sessionStoreId == null) {
                let customerList = []
                let billingfeedbackCustomers = await models.billingFeedback.findAll({attributes:['customerId']})

                if(billingfeedbackCustomers.length>0){
                    for(let customer of billingfeedbackCustomers){
                        let customerName = await models.customers.findAll({attributes:['id','firstName','lastName'], where:{id: customer.customerId}});

                        let c = {}
                        c.id = customerName[0].id
                        c.name = customerName[0].firstName + ' ' + customerName[0].lastName
                        customerList.push(c)
                    }
                }
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                let billingFeedbackList = await models.billingFeedback.findAll({where: {
                    [Op.or]: [
                      { billingNo: { [Op.like]: `%${search}%` } },
                          { customerId: { [Op.like]: `%${search}%` } },
                          { amount: { [Op.like]: `%${search}%` } },
                          { status: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.billingFeedback.count({where: {
                    [Op.or]: [
                        { billingNo: { [Op.like]: `%${search}%` } },
                          { customerId: { [Op.like]: `%${search}%` } },
                          { amount: { [Op.like]: `%${search}%` } },
                          { status: { [Op.like]: `%${search}%` } }
                    ]
                  }});

                let pageCount = Math.ceil(listCount/pageSize);

                if (billingFeedbackList) {
                    return res.render('admin/billingFeedback/list', {
                        title: 'Billing Feedback',
                        storeList: storeList,
                        arrData: billingFeedbackList,
                        arrCustomer: customerList,
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
                    return res.render('admin/billingFeedback/list', {
                        title: 'Billing Feedback',
                        arrData: '',
                        storeList: storeList,
                        arrCustomer: customerList,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                }
            }else{
                //*****Permission Assign Start
              
               
                    let customerList = []
                    let billingfeedbackCustomers = await models.billingFeedback.findAll({attributes:['customerId']})

                    if(billingfeedbackCustomers.length>0){
                        for(let customer of billingfeedbackCustomers){
                            let customerName = await models.customers.findAll({attributes:['id','firstName','lastName'], where:{id: customer.customerId}});
    
                            let c = {}
                            c.id = customerName[0].id
                            c.name = customerName[0].firstName + ' ' + customerName[0].lastName
                            customerList.push(c)
                        }
                    }
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId } });
                    let billingFeedbackList = await models.billingFeedback.findAll({where: {storeId: sessionStoreId,
                        [Op.or]: [
                          { billingNo: { [Op.like]: `%${search}%` } },
                          { customerId: { [Op.like]: `%${search}%` } },
                          { amount: { [Op.like]: `%${search}%` } },
                          { status: { [Op.like]: `%${search}%` } }
                        ]
                      }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
    
                    let listCount = await models.billingFeedback.count({where: {storeId: sessionStoreId,
                        [Op.or]: [
                            { billingNo: { [Op.like]: `%${search}%` } },
                            { customerId: { [Op.like]: `%${search}%` } },
                            { amount: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                      }});
    
                    let pageCount = Math.ceil(listCount/pageSize);

                    if (billingFeedbackList) {
                        return res.render('admin/billingFeedback/list', {
                            title: 'Billing Feedback',
                            arrData: billingFeedbackList,
                            storeList: storeList,
                            arrCustomer: customerList,
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
                        return res.render('admin/billingFeedback/list', {
                            title: 'Billing Feedback',
                            arrData: '',
                            arrCustomer: customerList,
                            storeList: storeList,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                        });
                    }
                              
            }            
        }	
    });
}



/**
 * This function is developed for view Billing Feedback
 * Developer: Ahin Subhra Das
 */
//  exports.view = async function(req, res){
//     var token = req.session.token;
//     var sessionStoreId = req.session.user.storeId;
//     var role = req.session.role;
//     var id = req.params.id;
//     jwt.verify(token,SECRET,async function(err,decoded){
//         if(err){
//             req.flash('info','Invalid Token');
//             res.redirect('auth/signin');
//         }else{
//             if (sessionStoreId == null) {
//                 var billingFeedbackList = await models.billingFeedback.findOne({ where: { id: id } });
//                 var stores = await models.stores.findAll({ attributes: ['storeName'], where: {id: billingFeedbackList.storeId }});
//                 var customers = await models.customers.findOne({ attributes: ['firstName','lastName'], where: { id: billingFeedbackList.customerId } });

//                 if (!id) {
//                     req.flash('errors', 'Id is required');
//                     res.redirect('back');
//                 } else {
//                     var billingFeedbackList = await models.billingFeedback.findOne({ where: { id: id } });
//                     if (billingFeedbackList) {
//                         return res.render('admin/billingFeedback/addedit', {
//                             title: 'View Billing Feedback',
//                             arrData: billingFeedbackList,
//                             storeName: stores.storeName,
//                             customerName:customers.firstName + ' ' +customers.lastName,
//                             sessionStoreId: '',
//                             messages: req.flash('info'),
//                             errors: req.flash('errors')
//                         });
//                     }else{
//                         req.flash('errors', 'No data found');
//                         res.redirect('back');
//                     }
//                 }
//             }else{
//                 //*****Permission Assign Start
//                 var userPermission =false;
//                 if (id) {
//                     var storeIdChecking = await models.billingFeedback.findOne({ attributes: ['storeId'], where: { id: id } });
//                     if (storeIdChecking.storeId == sessionStoreId) {
//                         userPermission = true;
//                     }
//                 }
//                 if (userPermission == false) {
//                     req.flash('errors', 'Contact Your administrator for permission');
//                     res.redirect('/admin/dashboard');
//                 } else {
//                     if (!id) {
//                         req.flash('errors', 'Id is required');
//                         res.redirect('back');
//                     } else {
//                         var billingFeedbackList = await models.billingFeedback.findOne({ where: { id: id } });
//                         var stores = await models.stores.findAll({ attributes: ['storeName'], where: {id: billingFeedbackList.storeId }});
//                         var customers = await models.customers.findOne({ attributes: ['firstName','lastName'], where: { id: billingFeedbackList.customerId } });
//                         if (billingFeedbackList) {
//                             return res.render('admin/billingFeedback/addedit', {
//                                 title: 'View Billing FeedbackList',
//                                 arrData: billingFeedbackList,
//                                 storeName: stores.storeName,
//                                 customerName:customers.firstName + ' ' +customers.lastName,
//                                 sessionStoreId: sessionStoreId,
//                                 messages: req.flash('info'),
//                                 errors: req.flash('errors')
//                             });
//                         }else{
//                             req.flash('errors', 'No data found');
//                             res.redirect('back');
//                         }
//                     }
//                 }
//             }
//         }
//     });    
// };

exports.view = (req, res) => {
    let token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    let id = req.params.id;
    console.log(id)
    jwt.verify(token,SECRET,async (err,decoded) => {
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            let storeId = ''
            if(sessionStoreId != '' && sessionStoreId != null){
                storeId = sessionStoreId
            }

            const details = await models.billingFeedback.findOne({where: { id: id } })
            let storeName = ''
            let customerName = ''
            if(details != null && details != ''){
                const store = await models.stores.findOne({ attributes: ['storeName'], where: {id: details.storeId }});
                const customer = await models.customers.findOne({ attributes: ['firstName','lastName'], where: { id: details.customerId } });
                console.log(store)
                if(store != null && store != '') storeName = store.storeName
                if(customer != null && customer != '') customerName = customer.firstName + ' '+customer.lastName
            }
            let data = {}
            data.id = details.id
            data.billingNo = details.billingNo
            data.amount = details.amount
            data.image = (details.image != null && details.image != '') ? req.app.locals.baseurl+'admin/feedback/'+details.id+'/'+details.image : req.app.locals.baseurl+'admin/category/no_image.jpg',
            data.foodQualityRating = details.foodQualityRating
            data.foodQualityRemarks = details.foodQualityRemarks
            data.serviceRating = details.serviceRating
            data.serviceRemarks = details.serviceRemarks
            data.ambienceRating = details.ambienceRating
            data.ambienceRemarks = details.ambienceRemarks
            data.overallRating = details.overallRating
            data.overallRemarks = details.overallRemarks
            data.createdAt = details.createdAt
            data.storeName = storeName
            data.customerName = customerName
            data.sessionStoreId= storeId

            res.send(data)
        }
    });
};