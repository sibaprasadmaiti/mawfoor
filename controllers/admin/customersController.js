var models = require('../../models');
var excel = require('exceljs');
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
const { request } = require('http');
const Op = Sequelize.Op

/**
 * Description: This function is developed for list for customer
 * Developer:Ahin Subhra  Das
*/

// exports.list = async function(req, res){
//     var token= req.session.token;
//     var sessionStoreId = req.session.user.storeId;
//     var role = req.session.role;
//     jwt.verify(token, SECRET, async function(err, decoded) {
//         if (err) {
//             req.flash("info", "Invalid Token");
//             res.redirect('/auth/signin');
//         }else{

//             if (sessionStoreId == null) {
//                 let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
//                 var customeraddress = await models.customerAddresses.findAll({attributes:['customerId','city','country'],});

//                 let column = req.query.column || 'id';
//                 let order = req.query.order || 'DESC';
//                 let pagesizes = req.query.pazesize || 10;
//                 let pageSize = parseInt(pagesizes);
//                 let page = req.params.page || 1;
//                 let search = req.query.search || '';


//                 let email =req.query.email || '';
//                 let mobile = req.query.mobile || '';
//                 let custid = req.query.id || '';
//                 let gender = req.query.gender || '';
//                 let city =req.query.city || '';
//                 let country=req.query.country || '';

                
//                 if(city!='' && country!=''){
//                     var customerlist = await models.customers.findAll( { order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize, include:[{model: models.customerAddresses, where:{
//                         [Op.or]:[
//                             { city: { [Op.like]: `%${city}%` }}
//                         ],
//                         [Op.or]:[
//                             { country: { [Op.like]: `%${country}%` }}
//                         ],
//                     }}] });

//                     var listCount = await models.customers.count({include:[{model: models.customerAddresses, where:{
//                         [Op.or]:[
//                             { city: { [Op.like]: `%${city}%` }}
//                         ],
//                         [Op.or]:[
//                             { country: { [Op.like]: `%${country}%` }}
//                         ]
//                     } }]});
//                 }else if(city!='' && country==''){
//                     var customerlist = await models.customers.findAll( { order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize, include:[{model: models.customerAddresses, where:{
//                         [Op.or]:[
//                             { city: { [Op.like]: `%${city}%` }}
//                         ]
//                     }}]});

//                     var listCount = await models.customers.count({include:[{model: models.customerAddresses, where:{
//                         [Op.or]:[
//                             { city: { [Op.like]: `%${city}%` }}
//                         ]
//                     } }]});
//                 }else if(city=='' && country!=''){
//                     var customerlist = await models.customers.findAll( { order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize, include:[{model: models.customerAddresses, where:{
//                         [Op.or]:[
//                             { country: { [Op.like]: `%${country}%` }}
//                         ],
//                     }}]});

//                     var listCount = await models.customers.count({include:[{model: models.customerAddresses, where:{
//                         [Op.or]:[
//                             { country: { [Op.like]: `%${country}%` }}
//                         ]
//                     } }]});
//                 }else if(city=='' && country=='' && custid!=''){
//                     var customerlist = await models.customers.findAll( { order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize, where:{
//                         [Op.or]:[
//                             { id: { [Op.eq]: `${custid}` }}
//                         ]
//                     } });
//                     var listCount = await models.customers.count({where:{
//                         [Op.or]:[
//                             { id: { [Op.eq]: `${custid}` }}
//                         ]
//                     }});
//                 }else if(city=='' && country=='' && email!=''){
//                     var customerlist = await models.customers.findAll( { order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize, where:{
//                         [Op.or]:[
//                             { email: { [Op.like]: `%${email}%` }}
//                         ]

//                     } });
//                     var listCount = await models.customers.count({where:{
//                         [Op.or]:[
//                             { email: { [Op.like]: `%${email}%` }}
//                         ]
//                     }});
//                 }else if(city=='' && country=='' && mobile!=''){
//                     var customerlist = await models.customers.findAll( { order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize, where:{
//                         [Op.or]:[
//                             { mobile: { [Op.like]: `%${mobile}%` }}
//                         ]

//                     } });
//                     var listCount = await models.customers.count({where:{
//                         [Op.or]:[
//                             { mobile: { [Op.like]: `%${mobile}%` }}
//                         ]
//                     }});
//                 }else if(city=='' && country=='' && gender!=''){
//                     var customerlist = await models.customers.findAll( { order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize, where:{
//                         [Op.or]:[
//                             { gender: { [Op.like]: `%${gender}%` }}
//                         ]

//                     } });
//                     var listCount = await models.customers.count({where:{
//                         [Op.or]:[
//                             { gender: { [Op.like]: `%${gender}%` }}
//                         ]
//                     }});
//                 }else{
//                     var customerlist = await models.customers.findAll( { order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize });
//                     var listCount = await models.customers.count({});
//                 }
                
//                 let pageCount = Math.ceil(listCount/pageSize);
//                 if (customerlist) {
//                     return res.render('admin/customers/list', {
//                         title: 'Customer List',
//                         arrData: customerlist,
//                         storeList: storeList,
//                         arrcustomeraddress: customeraddress,
//                         listCount: listCount,
//                         pageCount: pageCount,
//                         columnName: column,
//                         orderType: order,
//                         searchItem: search,
//                         pageSize: pageSize,
//                         currentPage: parseInt(page),
//                         messages: req.flash('info'),
//                         errors: req.flash('errors'),
//                         helper:helper
//                     });
//                 } else {
//                     return res.render('admin/customers/list', {
//                         title: 'Customer List',
//                         arrData: '',
//                         storeList: '',
//                         arrcustomeraddress: customeraddress,

//                         messages: req.flash('info'),
//                         errors: req.flash('errors'),
//                         helper:helper
//                     });
//                 }
//             }else{
//                 //*****Permission Assign Start
//                 var userPermission = false;
//                 if (role == 'admin') {
//                     userPermission = true;
//                 } else {
//                     userPermission = !!req.session.permissions.find(permission => {
//                         return permission === 'CustomerList'
//                     })
//                 }
//                 if (userPermission == false) {
//                     req.flash('errors', 'Contact Your administrator for permission');
//                     res.redirect('/admin/dashboard');
//                 } else {
//                     let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });
//                     var customeraddress = await models.customerAddresses.findAll({attributes:['id','city','country']});

//                     let column = req.query.column || 'id';
//                     let order = req.query.order || 'DESC';
//                     let pagesizes = req.query.pazesize || 10;
//                     let pageSize = parseInt(pagesizes);
//                     let page = req.params.page || 1;
//                     let search = req.query.search || '';

//                     let email =req.query.email || '';
//                     let mobile = req.query.mobile || '';
//                     let custid = req.query.id || '';
//                     let gender = req.query.gender || '';
//                     let city =req.query.city || '';
//                     let country=req.query.country || '';

//                     if(city!='' && country!=''){
//                         var customerlist = await models.customers.findAll( { order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize, include:[{model: models.customerAddresses, where:{
//                             [Op.or]:[
//                                 { city: { [Op.like]: `%${city}%` }}
//                             ],
//                             [Op.or]:[
//                                 { country: { [Op.like]: `%${country}%` }}
//                             ],
//                         }}] });

//                         var listCount = await models.customers.count({include:[{model: models.customerAddresses, where:{
//                             [Op.or]:[
//                                 { city: { [Op.like]: `%${city}%` }}
//                             ],
//                             [Op.or]:[
//                                 { country: { [Op.like]: `%${country}%` }}
//                             ]
//                         } }]});
//                     }else if(city!='' && country==''){
//                         var customerlist = await models.customers.findAll( { order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize, include:[{model: models.customerAddresses, where:{
//                             [Op.or]:[
//                                 { city: { [Op.like]: `%${city}%` }}
//                             ]
//                         }}]});

//                         var listCount = await models.customers.count({include:[{model: models.customerAddresses, where:{
//                             [Op.or]:[
//                                 { city: { [Op.like]: `%${city}%` }}
//                             ]
//                         } }]});
//                     }else if(city=='' && country!=''){
//                         var customerlist = await models.customers.findAll( { order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize, include:[{model: models.customerAddresses, where:{
//                             [Op.or]:[
//                                 { country: { [Op.like]: `%${country}%` }}
//                             ],
//                         }}]});

//                         var listCount = await models.customers.count({include:[{model: models.customerAddresses, where:{
//                             [Op.or]:[
//                                 { country: { [Op.like]: `%${country}%` }}
//                             ]
//                         } }]});
//                     }else if(city=='' && country=='' && custid!=''){
//                         var customerlist = await models.customers.findAll( { order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize, where:{
//                             storeId: sessionStoreId,
//                             [Op.or]:[
//                                 { id: { [Op.eq]: `${custid}` }}
//                             ]

//                         } });
//                         var listCount = await models.customers.count({where:{
//                             storeId: sessionStoreId,
//                             [Op.or]:[
//                                 { id: { [Op.eq]: `${custid}` }}
//                             ]
//                         }});
//                     }else if(city=='' && country=='' && email!=''){
//                         var customerlist = await models.customers.findAll( { order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize, where:{
//                             storeId: sessionStoreId,
//                             [Op.or]:[
//                                 { email: { [Op.like]: `%${email}%` }}
//                             ]

//                         } });
//                         var listCount = await models.customers.count({where:{
//                             storeId: sessionStoreId,
//                             [Op.or]:[
//                                 { email: { [Op.like]: `%${email}%` }}
//                             ]
//                         }});
//                     }else if(city=='' && country=='' && mobile!=''){
//                         var customerlist = await models.customers.findAll( { order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize, where:{
//                             storeId: sessionStoreId,
//                             [Op.or]:[
//                                 { mobile: { [Op.like]: `%${mobile}%` }}
//                             ]

//                         } });
//                         var listCount = await models.customers.count({where:{
//                             storeId: sessionStoreId,
//                             [Op.or]:[
//                                 { mobile: { [Op.like]: `%${mobile}%` }}
//                             ]
//                         }});
//                     }else if(city=='' && country=='' && gender!=''){
//                         var customerlist = await models.customers.findAll( { order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize, where:{
//                             storeId: sessionStoreId,
//                             [Op.or]:[
//                                 { gender: { [Op.like]: `%${gender}%` }}
//                             ]

//                         } });
//                         var listCount = await models.customers.count({where:{
//                             storeId: sessionStoreId,
//                             [Op.or]:[
//                                 { gender: { [Op.like]: `%${gender}%` }}
//                             ]
//                         }});
//                     }else{
//                         var customerlist = await models.customers.findAll( {where:{storeId: sessionStoreId}, order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize });
//                         var listCount = await models.customers.count({where:{storeId: sessionStoreId}});
//                     }
                    
//                     let pageCount = Math.ceil(listCount/pageSize);
//                     if (customerlist) {
//                         return res.render('admin/customers/list', {
//                             title: 'Customer List',
//                             arrData: customerlist,
//                             storeList: storeList,
//                             arrcustomeraddress: customeraddress,

//                             listCount: listCount,
//                             pageCount: pageCount,
//                             currentPage: parseInt(page),
//                             columnName: column,
//                             orderType: order,
//                             searchItem: search,
//                             pageSize: pageSize,
//                             messages: req.flash('info'),
//                             errors: req.flash('errors'),
//                             helper:helper
//                         });
//                     } else {
//                         return res.render('admin/customer/list', {
//                             title: 'Customer List',
//                             arrData: '',
//                             storeList: '',
//                             arrcustomeraddress: customeraddress,

//                             messages: req.flash('info'),
//                             errors: req.flash('errors'),
//                             helper:helper
//                         });
//                     }
//                 }                
//             }            
//         }
//     });
// }

/**
 * Description: This function is developed for list for brands
 * Developer:Partha Mandal
*/
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
    let customer =req.query.customer || '';
    let email =req.query.email || '';
    let mobile = req.query.mobile || '';
    let city =req.query.city || '';
    let status=req.query.status || '';

    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{

            if (sessionStoreId == null) {
                const storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                const customeraddress = await models.customerAddresses.findAll({attributes:[[Sequelize.literal('DISTINCT `city`'), 'city'],'city']});
                const customerDetails = await models.customers.findAll()

                let whereCondition
                let whereCondition2

                if (customer !='' && status =='' && email =='' && mobile =='' && city == '') {
                    whereCondition = {id:customer}

                }else if(email !='' && customer =='' && status =='' && mobile =='' && city == ''){
                    whereCondition = {email: email}

                }else if(email =='' && customer =='' && status =='' && mobile !='' && city == ''){
                    whereCondition = {mobile: mobile}

                }else if(status !='' && email =='' && customer =='' && mobile =='' && city == ''){
                    whereCondition = {status:status}

                }else if(status =='' && email =='' && customer =='' && mobile =='' && city != ''){
                    whereCondition2 = {city:city}
                    
                }else if(customer!='' && status !='' && email =='' && mobile =='' && city == ''){
                    whereCondition = {id:customer,status:status}

                }else if(customer!='' && email !='' && status =='' && mobile =='' && city == ''){
                    whereCondition = {id:customer,email:email}

                }else if(customer!='' && email =='' && status =='' && mobile !='' && city == ''){
                    whereCondition = {id:customer,mobile:mobile}

                }else if(customer!='' && email =='' && status =='' && mobile =='' && city != ''){
                    whereCondition = {id:customer}
                    whereCondition2 = {city:city}
                    
                }else if(email!='' && status !='' && customer =='' && mobile =='' && city == ''){
                    whereCondition = {email:email,status:status}

                }else if(email=='' && status !='' && customer =='' && mobile !='' && city == ''){
                    whereCondition = {mobile:mobile,status:status}

                }else if(email=='' && status !='' && customer =='' && mobile =='' && city != ''){
                    whereCondition = {status:status}
                    whereCondition2 = {city:city}
                    
                }else if(email!='' && status =='' && customer =='' && mobile !='' && city == ''){
                    whereCondition = {email:email,mobile:mobile}

                }else if(email!='' && status =='' && customer =='' && mobile =='' && city != ''){
                    whereCondition = {email:email}
                    whereCondition2 = {city:city}
                    
                }else if(email=='' && status =='' && customer =='' && mobile !='' && city != ''){
                    whereCondition = {mobile:mobile}
                    whereCondition2 = {city:city}
                    
                }else if(customer !='' && status !='' && email !='' && mobile =='' && city == ''){
                    whereCondition = {id:customer,status:status,email:email}

                }else if(customer !='' && status =='' && email !='' && mobile !='' && city == ''){
                    whereCondition = {id:customer,email:email,mobile:mobile}

                }else if(customer !='' && status !='' && email =='' && mobile !='' && city != ''){
                    whereCondition = {status:status,id:customer,mobile:mobile}

                }else if(customer !='' && status =='' && email !='' && mobile =='' && city != ''){
                    whereCondition = {email:email,id:customer}
                    whereCondition2 = {city:city}

                }else if(customer!='' && status =='' && email =='' && mobile !='' && city != ''){
                    whereCondition = {id:customer,mobile:mobile}
                    whereCondition2 = {city:city}

                }else if(customer=='' && status !='' && email !='' && mobile !='' && city == ''){
                    whereCondition = {email:email,status:status, mobile:mobile}

                }else if(customer=='' && status !='' && email !='' && mobile =='' && city != ''){
                    whereCondition = {status:status, email:email}
                    whereCondition2 = {city:city}

                }else if(customer =='' && status !='' && email =='' && mobile !='' && city != ''){
                    whereCondition = {status:status,mobile:mobile}
                    whereCondition2 = {city:city}

                }else if(customer=='' && status =='' && email !='' && mobile !='' && city != ''){
                    whereCondition = {email:email, mobile:mobile}
                    whereCondition2 = {city:city}

                }else if(customer!='' && status !='' && email !='' && mobile !='' && city == ''){
                    whereCondition = {id:customer,status:status, email:email, mobile:mobile}

                }else if(customer!='' && status !='' && email !='' && mobile =='' && city != ''){
                    whereCondition = {id:customer,status:status, email:email}
                    whereCondition2 = {city:city}

                }else if(customer!='' && status =='' && email !='' && mobile !='' && city != ''){
                    whereCondition = {id:customer,email:email, mobile:mobile}
                    whereCondition2 = {city:city}

                }else if(customer!='' && status !='' && email =='' && mobile !='' && city != ''){
                    whereCondition = {id:customer,status:status, mobile:mobile}
                    whereCondition2 = {city:city}

                }else if(customer=='' && status !='' && email !='' && mobile !='' && city != ''){
                    whereCondition = {email:email,status:status, mobile:mobile}
                    whereCondition2 = {city:city}

                }else if(customer!='' && status !='' && email !='' && mobile !='' && city != ''){
                    whereCondition = {id:customer,status:status, email:email, mobile:mobile}
                    whereCondition2 = {city:city}

                }

                let customerlist
                let listCount

                if (customer !='' || status !='' || email !='' || mobile !='' || city != '') {
                    if (city !='') {
                        customerlist = await models.customers.findAll({where:whereCondition, include:[{model: models.customerAddresses, where:whereCondition2}],order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize })

                        let listCount1 = await models.customers.findAll({where:whereCondition, include:[{model: models.customerAddresses, where:whereCondition2}]})

                        listCount =  listCount1.length                       
                    } else {
                        customerlist = await models.customers.findAll({where:whereCondition, include:[{model: models.customerAddresses,required:false, where:whereCondition2}],order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize })

                        listCount = await models.customers.count({where:whereCondition, include:[{model: models.customerAddresses, where:whereCondition2}]})
                    }
                } else {

                    customerlist = await models.customers.findAll({where: { [Op.or]:[
                        { firstName: { [Op.like]: `%${search}%` }},
                        { lastName: { [Op.like]: `%${search}%` }},
                        { email: { [Op.like]: `%${search}%` }},
                        { mobile: { [Op.like]: `%${search}%` }},
                        { gender: { [Op.like]: `%${search}%` }},
                        { status: { [Op.like]: `%${search}%` }},
                    ]}, include:[{model: models.customerAddresses,required:false}],order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize })

                    listCount = await models.customers.count({where: { [Op.or]:[
                        { firstName: { [Op.like]: `%${search}%` }},
                        { lastName: { [Op.like]: `%${search}%` }},
                        { email: { [Op.like]: `%${search}%` }},
                        { mobile: { [Op.like]: `%${search}%` }},
                        { gender: { [Op.like]: `%${search}%` }},
                        { status: { [Op.like]: `%${search}%` }},
                    ]}})
                    
                }
                
                let pageCount = Math.ceil(listCount/pageSize);
                if (customerlist) {
                    return res.render('admin/customers/list', {
                        title: 'Customer List',
                        arrData: customerlist,
                        storeList: storeList,
                        customerDetails:customerDetails,
                        arrcustomeraddress: customeraddress,
                        listCount: listCount,
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        searchItem: search,
                        pageSize: pageSize,
                        currentPage: parseInt(page),
                        customerFilter: customer,
                        emailFilter: email,
                        mobileFilter: mobile,
                        cityFilter: city,
                        statusFilter: status,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                        helper:helper
                    });
                } else {
                    return res.render('admin/customers/list', {
                        title: 'Customer List',
                        arrData: '',
                        storeList: '',
                        arrcustomeraddress: customeraddress,
                        customerFilter: customer,
                        emailFilter: email,
                        mobileFilter: mobile,
                        cityFilter: city,
                        statusFilter: status,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                        helper:helper
                    });
                }
            }else{
                //*****Permission Assign Start
                var userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'CustomerList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    const storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where:{id:sessionStoreId} });
                    const customeraddress = await models.customerAddresses.findAll({attributes:['customerId','city','country'], where:{storeId:sessionStoreId}});
                    const customerDetails = await models.customers.findAll({where:{storeId:sessionStoreId}})

                    let whereCondition
                    let whereCondition2

                    if (customer !='' && status =='' && email =='' && mobile =='' && city == '') {
                        whereCondition = {id:customer, storeId:sessionStoreId}

                    }else if(email !='' && customer =='' && status =='' && mobile =='' && city == ''){
                        whereCondition = {email: email, storeId:sessionStoreId}

                    }else if(email =='' && customer =='' && status =='' && mobile !='' && city == ''){
                        whereCondition = {mobile: mobile, storeId:sessionStoreId}

                    }else if(status !='' && email =='' && customer =='' && mobile =='' && city == ''){
                        whereCondition = {status:status, storeId:sessionStoreId}

                    }else if(status =='' && email =='' && customer =='' && mobile =='' && city != ''){
                        whereCondition2 = {city:city, storeId:sessionStoreId}
                        
                    }else if(customer!='' && status !='' && email =='' && mobile =='' && city == ''){
                        whereCondition = {id:customer,status:status, storeId:sessionStoreId}

                    }else if(customer!='' && email !='' && status =='' && mobile =='' && city == ''){
                        whereCondition = {id:customer,email:email, storeId:sessionStoreId}

                    }else if(customer!='' && email =='' && status =='' && mobile !='' && city == ''){
                        whereCondition = {id:customer,mobile:mobile, storeId:sessionStoreId}

                    }else if(customer =='' && status !='' && email =='' && mobile !='' && city != ''){
                        whereCondition = {status:status,mobile:mobile,storeId:sessionStoreId}
                        whereCondition2 = {city:city,storeId:sessionStoreId}
    
                    }else if(customer!='' && email =='' && status =='' && mobile =='' && city != ''){
                        whereCondition = {id:customer, storeId:sessionStoreId}
                        whereCondition2 = {city:city, storeId:sessionStoreId}
                        
                    }else if(email!='' && status !='' && customer =='' && mobile =='' && city == ''){
                        whereCondition = {email:email,status:status, storeId:sessionStoreId}

                    }else if(email=='' && status !='' && customer =='' && mobile !='' && city == ''){
                        whereCondition = {mobile:mobile,status:status, storeId:sessionStoreId}

                    }else if(email=='' && status !='' && customer =='' && mobile =='' && city != ''){
                        whereCondition = {status:status, storeId:sessionStoreId}
                        whereCondition2 = {city:city, storeId:sessionStoreId}
                        
                    }else if(email!='' && status =='' && customer =='' && mobile !='' && city == ''){
                        whereCondition = {email:email,mobile:mobile, storeId:sessionStoreId}

                    }else if(email!='' && status =='' && customer =='' && mobile =='' && city != ''){
                        whereCondition = {email:email, storeId:sessionStoreId}
                        whereCondition2 = {city:city, storeId:sessionStoreId}
                        
                    }else if(email=='' && status =='' && customer =='' && mobile !='' && city != ''){
                        whereCondition = {mobile:mobile, storeId:sessionStoreId}
                        whereCondition2 = {city:city, storeId:sessionStoreId}
                        
                    }else if(customer !='' && status !='' && email !='' && mobile =='' && city == ''){
                        whereCondition = {id:customer,status:status,email:email, storeId:sessionStoreId}

                    }else if(customer !='' && status =='' && email !='' && mobile !='' && city == ''){
                        whereCondition = {id:customer,email:email,mobile:mobile, storeId:sessionStoreId}

                    }else if(customer !='' && status !='' && email =='' && mobile !='' && city != ''){
                        whereCondition = {status:status,id:customer,mobile:mobile, storeId:sessionStoreId}

                    }else if(customer !='' && status =='' && email !='' && mobile =='' && city != ''){
                        whereCondition = {email:email,id:customer, storeId:sessionStoreId}
                        whereCondition2 = {city:city, storeId:sessionStoreId}

                    }else if(customer!='' && status =='' && email =='' && mobile !='' && city != ''){
                        whereCondition = {id:customer,mobile:mobile, storeId:sessionStoreId}
                        whereCondition2 = {city:city, storeId:sessionStoreId}

                    }else if(customer=='' && status !='' && email !='' && mobile !='' && city == ''){
                        whereCondition = {email:email,status:status, mobile:mobile, storeId:sessionStoreId}

                    }else if(customer=='' && status !='' && email !='' && mobile =='' && city != ''){
                        whereCondition = {status:status, email:email, storeId:sessionStoreId}
                        whereCondition2 = {city:city, storeId:sessionStoreId}

                    }else if(customer=='' && status =='' && email !='' && mobile !='' && city != ''){
                        whereCondition = {email:email, mobile:mobile, storeId:sessionStoreId}
                        whereCondition2 = {city:city, storeId:sessionStoreId}

                    }else if(customer!='' && status !='' && email !='' && mobile !='' && city == ''){
                        whereCondition = {id:customer,status:status, email:email, mobile:mobile, storeId:sessionStoreId}

                    }else if(customer!='' && status !='' && email !='' && mobile =='' && city != ''){
                        whereCondition = {id:customer,status:status, email:email, storeId:sessionStoreId}
                        whereCondition2 = {city:city, storeId:sessionStoreId}

                    }else if(customer!='' && status =='' && email !='' && mobile !='' && city != ''){
                        whereCondition = {id:customer,email:email, mobile:mobile, storeId:sessionStoreId}
                        whereCondition2 = {city:city, storeId:sessionStoreId}

                    }else if(customer!='' && status !='' && email =='' && mobile !='' && city != ''){
                        whereCondition = {id:customer,status:status, mobile:mobile, storeId:sessionStoreId}
                        whereCondition2 = {city:city, storeId:sessionStoreId}

                    }else if(customer=='' && status !='' && email !='' && mobile !='' && city != ''){
                        whereCondition = {email:email,status:status, mobile:mobile, storeId:sessionStoreId}
                        whereCondition2 = {city:city, storeId:sessionStoreId}

                    }else if(customer!='' && status !='' && email !='' && mobile !='' && city != ''){
                        whereCondition = {id:customer,status:status, email:email, mobile:mobile, storeId:sessionStoreId}
                        whereCondition2 = {city:city, storeId:sessionStoreId}

                    }

                    let customerlist
                    let listCount

                    if (customer !='' || status !='' || email !='' || mobile !='' || city != '') {
                        if (city !='') {
                            customerlist = await models.customers.findAll({where:whereCondition, include:[{model: models.customerAddresses, where:whereCondition2}],order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize })

                            let listCount1 = await models.customers.findAll({where:whereCondition, include:[{model: models.customerAddresses, where:whereCondition2}]})

                            listCount =  listCount1.length
                        } else {
                            customerlist = await models.customers.findAll({where:whereCondition, include:[{model: models.customerAddresses,required:false, where:whereCondition2}],order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize })

                            listCount = await models.customers.count({where:whereCondition, include:[{model: models.customerAddresses,required:false, where:whereCondition2}]})
                        }
                    } else {

                        customerlist = await models.customers.findAll({where: {storeId:sessionStoreId, [Op.or]:[
                            { firstName: { [Op.like]: `%${search}%` }},
                            { lastName: { [Op.like]: `%${search}%` }},
                            { email: { [Op.like]: `%${search}%` }},
                            { mobile: { [Op.like]: `%${search}%` }},
                            { gender: { [Op.like]: `%${search}%` }},
                            { status: { [Op.like]: `%${search}%` }},
                        ]}, include:[{model: models.customerAddresses,required:false}],order: [[column, order]],limit:pageSize, offset:(page-1)*pageSize })

                        listCount = await models.customers.count({where: {storeId:sessionStoreId, [Op.or]:[
                            { firstName: { [Op.like]: `%${search}%` }},
                            { lastName: { [Op.like]: `%${search}%` }},
                            { email: { [Op.like]: `%${search}%` }},
                            { mobile: { [Op.like]: `%${search}%` }},
                            { gender: { [Op.like]: `%${search}%` }},
                            { status: { [Op.like]: `%${search}%` }},
                        ]}, include:[{model: models.customerAddresses,required:false}]})
                        
                    }
                    
                    let pageCount = Math.ceil(listCount/pageSize);
                    if (customerlist) {
                        return res.render('admin/customers/list', {
                            title: 'Customer List',
                            arrData: customerlist,
                            storeList: storeList,
                            customerDetails:customerDetails,
                            arrcustomeraddress: customeraddress,
                            listCount: listCount,
                            pageCount: pageCount,
                            columnName: column,
                            orderType: order,
                            searchItem: search,
                            pageSize: pageSize,
                            currentPage: parseInt(page),
                            customerFilter: customer,
                            emailFilter: email,
                            mobileFilter: mobile,
                            cityFilter: city,
                            statusFilter: status,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper:helper
                        });
                    } else {
                        return res.render('admin/customers/list', {
                            title: 'Customer List',
                            arrData: '',
                            storeList: '',
                            arrcustomeraddress: customeraddress,
                            customerFilter: customer,
                            emailFilter: email,
                            mobileFilter: mobile,
                            cityFilter: city,
                            statusFilter: status,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper:helper
                        });
                    }
                }                
            }            
        }
    });
}

/**
 * Description: This function is developed for view for brands
 * Developer:Susanta Kumar Das
 */
exports.view = async function(req, res){
    var id = req.params.id;
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            if(sessionStoreId==''){
                var stores = await models.stores.findAll({attributes:['id','storeName'],where:{status:'Yes'}});
            } else {
                var stores = await models.stores.findAll({attributes:['id','storeName'],where:{id:sessionStoreId,status:'Yes'}});        
            }
            if(!id){
                return res.render('admin/customers/addedit',{
                    title: 'Add Customers',
                    arrData:'',
                    stores: stores,
                    helper: helper,
                    arrAddress: '',
                    arrProduct: '',
                    customerOrder: '',
                    customerWallet: '',
                    totalBalance: '',
                    customefeedback: '',
                    totalCredit: '',
                    totalDebit: '',
                    availableBalance: '',
                    numberofOrder: '',
                    messages: req.flash('info'),
                    errors:req.flash('errors')
                });
            } else {
                models.customers.findOne({
                    attributes:['id', 'storeId', 'firstName', 'lastName', 'email', 'mobile', 'image', 'dob', 'doa', 'gender', 'status', 'lastOrder', 'lastLogin', 'referredBy', 'orderValue', 'mobileVerified', 'emailVerified'],
                    where:{
                        id:id
                    }
                }).then(async function (customers) {
                    if(customers) {
                        var customerAddress = await models.customerAddresses.findAll({attributes:['id', 'storeId', 'customerId', 'isPrimary', 'fullName', 'label', 'mobile', 'address', 'locality', 'city', 'state', 'pin', 'country'],where:{customerId:customers.id}});
                        
                        let customerOrder = await models.orders.findAll({attributes:['id','orderNo','customerId','orderStatus','shippingMethod','discountAmount','walletAmount','couponAmount','deliveryBoy','paymentMethod','shippingAmount','amountPaid','shippingCity','shippingState','shippingPin','shippingAddress','createdAt'], where: {customerId: customers.id}})

                        let numberofOrder = await models.orders.count({ where: {customerId: customers.id}})

                        let feedbacks = await models.feedback.findAll({where:{customerId:customers.id}})
                        let customefeedback = []
                        for (let feedback of feedbacks){
                            let order =  await models.orders.findOne({attributes:['orderNo'], where:{id : feedback.orderId}})
                            let feed = {}
                            feed.rating = feedback.dataValues.rating;
                            feed.message = feedback.dataValues.message;
                            feed.createdAt = feedback.dataValues.createdAt;
                            feed.orderNo = order.orderNo
                            customefeedback.push(feed)
                        }
                        
                        return res.render('admin/customers/addedit',{
                            title: 'Edit Customers',
                            arrData: customers,
                            stores: stores,
                            helper: helper,
                            arrAddress: customerAddress,
                            arrProduct: '',
                            customerOrder: customerOrder,
                            customerWallet: '',
                            totalBalance: '',
                            customefeedback: customefeedback,
                            totalCredit: '',
                            totalDebit: '',
                            availableBalance: '',
                            numberofOrder: numberofOrder,
                            messages: req.flash('info'),
                            errors:req.flash('errors')
                        });
                    }
                });
            }
        }
    });
}
/**
 * Description: This function is developed for add/update Customer
 * Developer:Susanta Kumar Das
 */
exports.addOrUpdate = function(req, res) {
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                var id = fields.updateId[0];
                if(!id){
                    models.customers.create({
                        firstName: fields.firstName[0],
                        lastName: fields.lastName[0],
                        email: fields.email[0],
                        mobile: fields.mobile[0],
                        dob: fields.dob ? fields.dob[0] : null,
                        doa: fields.doa ? fields.doa[0] : null,
                        lastLogin: fields.lastLogin ? fields.lastLogin[0] : null,
                        gender: fields.gender[0],
                        lastOrder: fields.lastOrder[0],
                        referredBy: fields.referredBy[0],
                        orderValue: fields.orderValue[0],
                        mobileVerified: fields.mobileVerified[0],
                        emailVerified: fields.emailVerified[0],
                        createdBy: sessionUserId
                    }).then(function(value) {
                        if(value) {
                            if(files.image[0].originalFilename !='' && files.image[0].originalFilename != null){
                                var customerImage = Date.now()+files.image[0].originalFilename;
                                var ImageExt = customerImage.split('.').pop();
                                var customerImageWithEXT = Date.now()+files.image[0]+"."+ImageExt;
                                var finalCustomerImage = customerImageWithEXT.replace("[object Object]", "");
                                helper.createDirectory('public/admin/customers/'+value.id); 
                                var tempPath = files.image[0].path;
                                var fileName = finalCustomerImage;
                                var targetPath = value.id+"/"+fileName;
                                helper.uploadCustomersImageFiles(tempPath, targetPath);
                            }
                            models.customers.update({
                                image: finalCustomerImage
                            },{where:{id : value.id}}).then(function(val){
                                if(val) {
                                    req.flash('info','Successfully customer created');
                                    return res.redirect('/admin/customers/view'+value.id);
                                } else {
                                    req.flash('errors','Something went wrong');
                                    return res.redirect('/admin/customers/view'+value.id);                                    
                                }
                            }).catch(function(error) {
                                req.flash('errors','Something went wrong');
                                return res.redirect('/admin/customers/view'+value.id);
                            });
                        } else {
                            req.flash('errors','Something went wrong');
                            return res.redirect('/admin/customers/list');
                        }
                    }).catch(function(error) {
                        req.flash('errors','Something went wrong');
                        return res.redirect('/admin/customers/list');
                    });
                } else{
                    var customersImage = models.customers.findOne({attributes:['image'],where:{id:id}});
                    if(files.image[0].originalFilename !='' && files.image[0].originalFilename != null){
                        var customerImage = Date.now()+files.image[0].originalFilename;
                        var ImageExt = customerImage.split('.').pop();
                        var customerImageWithEXT = Date.now()+files.image[0]+"."+ImageExt;
                        var finalCustomersImage =customerImageWithEXT.replace("[object Object]", "");
                        helper.createDirectory('public/admin/customers/'+id); 
                        var tempPath = files.image[0].path;
                        var fileName = finalCustomersImage;
                        var targetPath = id+"/"+fileName;
                        helper.uploadCustomersImageFiles(tempPath, targetPath);
                    }
                    var oldCustomerImage = customersImage.image;
                    models.customers.update({
                        firstName: fields.firstName[0],
                        lastName: fields.lastName[0],
                        email: fields.email[0],
                        mobile: fields.mobile[0],
                        dob: fields.dob ? fields.dob[0] : null,
                        doa: fields.doa ? fields.doa[0] : null,
                        doa: fields.lastLogin ? fields.lastLogin[0] : null,
                        gender: fields.gender[0],
                        lastOrder: fields.lastOrder[0],
                        referredBy: fields.referredBy[0],
                        orderValue: fields.orderValue[0],
                        mobileVerified: fields.mobileVerified[0],
                        emailVerified: fields.emailVerified[0],
                        updatedBy: sessionUserId,
                        image: finalCustomersImage != ''? finalCustomersImage : oldCustomerImage
                    },{where:{id:id}}).then(function(value) {
                        if(value) {
                            req.flash('info','Successfully customer updated');
                            return res.redirect('/admin/customers/view/'+id);
                        } else {
                            req.flash('errors','Something went wrong');
                            return res.redirect('/admin/customers/view/'+id);
                        }
                    }).catch(function(error) {
                        req.flash('errors','Something went wrong');
                        return res.redirect('/admin/customers/view/'+id);
                    });
                }
            });
        }
    });
}
/**
 * Description: This function is developed for add/update addresses Info
 * Developer:Susanta Kumar Das
 */
exports.addressesInfo = function(req, res) {
    var token= req.session.token;
    var sessionUserId = req.session.user.id;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                var customerAddressId = fields.customerAddressId[0];
                var id = fields.updateId[0];
                if(!customerAddressId){
                    models.customerAddresses.create({
                        storeId: fields.storeId[0],
                        customerId: id,
                        fullName: fields.fullName[0],
                        label: fields.label[0],
                        mobile: fields.mobile[0],
                        address: fields.address[0],
                        locality: fields.locality[0],
                        city: fields.city[0],
                        state: fields.state[0],
                        pin: fields.pin[0],
                        country: fields.country[0],
                        isPrimary: fields.isPrimary[0],
                        createdBy: sessionUserId
                    }).then(function(value) {
                        if(value) {
                            req.flash('info','Successfully customer updated');
                            return res.redirect('/admin/customers/view/'+id);
                        } else {
                            req.flash('errors','Something went wrong');
                            return res.redirect('/admin/customers/view/'+id);
                        }
                    }).catch(function(error) {
                        req.flash('errors','Something went wrong');
                        return res.redirect('/admin/customers/view/'+id);
                    });
                } else{
                    models.customerAddresses.update({
                        storeId: fields.storeId[0],
                        customerId: id,
                        fullName: fields.fullName[0],
                        label: fields.label[0],
                        mobile: fields.mobile[0],
                        address: fields.address[0],
                        locality: fields.locality[0],
                        city: fields.city[0],
                        state: fields.state[0],
                        pin: fields.pin[0],
                        country: fields.country[0],
                        isPrimary: fields.isPrimary[0],
                        updatedBy: sessionUserId
                    },{where:{id:customerAddressId}}).then(function(value) {
                        if(value) {
                            req.flash('info','Successfully customer updated');
                            return res.redirect('/admin/customers/view/'+id);
                        } else {
                            req.flash('errors','Something went wrong');
                            return res.redirect('/admin/customers/view/'+id);
                        }
                    }).catch(function(error) {
                        req.flash('errors','Something went wrong');
                        return res.redirect('/admin/customers/view/'+id);
                    });
                }
            });
        }
    });
}
/**
 * Description: This function is developed for add/update password
 * Developer:Susanta Kumar Das
 */
exports.password = function(req, res) {
    var token= req.session.token;
    var sessionUserId = req.session.user.id;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                var id = fields.updateId[0];
                if(!id){
                    req.flash('errors','Something went wrong');
                    return res.redirect('/admin/customers/view/'+id);
                } else{
                    models.customers.update({
                        password: bcrypt.hashSync(fields.password[0]),
                        updatedBy: sessionUserId
                    },{where:{id:id}}).then(function(value) {
                        if(value) {
                            req.flash('info','Successfully customer updated');
                            return res.redirect('/admin/customers/view/'+id);
                        } else {
                            req.flash('errors','Something went wrong');
                            return res.redirect('/admin/customers/view/'+id);
                        }
                    }).catch(function(error) {
                        req.flash('errors','Something went wrong');
                        return res.redirect('/admin/customers/view/'+id);
                    });
                }
            });
        }
    });
}
/**
 * Description: This function is developed for add/update status change
 * Developer:Susanta Kumar Das
 */
exports.statusChange = function(req, res) {
    var token= req.session.token;
    var sessionUserId = req.session.user.id;
    const { cusID, statuValue } = req.body;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Invalid Token"}});
        } else {
            if((cusID=='' && cusID==null && cusID==undefined) && (statuValue=='' && statuValue==null && statuValue==undefined)){
                return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Customer id & status value missing"}});
            } else if(cusID=='' && cusID==null && cusID==undefined){
                return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Customer id missing"}});
            } else if(statuValue=='' && statuValue==null && statuValue==undefined){
                return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Status value missing"}});
            } else{
                models.customers.update({
                    status: statuValue,
                    updatedBy: sessionUserId
                },{where:{id:cusID}}).then(function(value) {
                    if(value) {
                        return res.status(200).send({ data:{success:true, details:""}, errorNode:{errorCode:0, errorMsg:""}});
                    } else {
                        return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Something went wrong"}});
                    }
                }).catch(function(error) {
                    return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Something went wrong"}});
                });
            }
        }
    });
}
/**
 * Description: This function is developed for add/update status change
 * Developer:Susanta Kumar Das
 */
exports.addressDetails = function(req, res) {
    var token= req.session.token;
    var sessionUserId = req.session.user.id;
    const { customerAddressId, customerId } = req.body;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Invalid Token"}});
        } else {
            if((customerAddressId=='' && customerAddressId==null && customerAddressId==undefined) && (customerId=='' && customerId==null && customerId==undefined)){
                return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Customer id & customer address id missing"}});
            } else if(customerId=='' && customerId==null && customerId==undefined){
                return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Customer id missing"}});
            } else if(customerAddressId=='' && customerAddressId==null && customerAddressId==undefined){
                return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Customer address id missing"}});
            } else{
                models.customerAddresses.findOne({
                    attributes:['id', 'storeId', 'customerId', 'isPrimary', 'fullName', 'label', 'mobile', 'address', 'locality', 'city', 'state', 'pin', 'country'],
                    where:{
                        id:customerAddressId,
                        customerId:customerId,
                    }
                }).then(function(value) {
                    if(value) {
                        return res.status(200).send({ data:{success:true, details:value}, errorNode:{errorCode:0, errorMsg:""}});
                    } else {
                        return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Something went wrong"}});
                    }
                }).catch(function(error) {
                    return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Something went wrong"}});
                });
            }
        }
    });
}
/**
 * This function is developed for delete Labs
 * Developer:Susanta Kumar Das
 */
exports.delete = function(req, res) {
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if(err){
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            var id = req.params.id;
            models.customers.destroy({ 
                where:{id:id}
            }).then(function(value) {
                if(value) {
                    req.flash('info','Successfully our lab deleted');
                    res.redirect('back');
                } else {
                    req.flash('errors','Something went wrong');
                    res.redirect('back');
                }
            });
        }
    });
}
/**
 * Description: This function is developed for download Customer List
 * Developer:Susanta Kumar Das
*/
// exports.downloadCustomerList = async function (req, res, next) {
//     var workbook = new Excel.Workbook();
//     workbook.creator = 'Me';
//     workbook.lastModifiedBy = 'Her';
//     workbook.created = new Date(1985, 8, 30);
//     workbook.modified = new Date();
//     workbook.lastPrinted = new Date(2016, 9, 27);
//     workbook.properties.date1904 = true;
//     workbook.views = [{
//         x: 0, y: 0, width: 10000, height: 20000,firstSheet: 0, 
//         activeTab: 1, visibility: 'visible'
//     }];
//     var worksheet = workbook.addWorksheet('My Sheet');
//     worksheet.columns = [{ 
//         header: 'Sl. No.', key: 'Slno', width: 10 
//     }, { 
//         header: 'Customer Name ', key: 'Name', width: 30 
//     }, { 
//         header: 'Email Id ', key: 'email', width: 33 
//     }, { 
//         header: 'Phone No ', key: 'Phone', width: 25 
//     }];
//     var customerlist = await models.customers.findAll({attributes:['firstName', 'lastName', 'email', 'mobile']});
//     for (var i = 0; i < customerlist.length; i++) {
//         worksheet.addRow({ Slno: i+1, Name :(customerlist[i].firstName+' '+customerlist[i].lastName), email:customerlist[i].email, Phone:customerlist[i].mobile  });
//     }
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader("Content-Disposition", "attachment; filename=" + "Customer-list.xlsx");
//     workbook.xlsx.write(res).then(function (data) {
//         res.end();
//         console.log('File write done........');
//     });
// }

/**
 * Description: This function is developed for download Customer List
 * Developer:Partha Mandal
*/
exports.downloadCustomerList = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    let search = req.query.search || '';
    let customer =req.query.customer || '';
    let email =req.query.email || '';
    let mobile = req.query.mobile || '';
    let city =req.query.city || '';
    let status=req.query.status || '';

    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{

            if (sessionStoreId == null) {

                let whereCondition
                let whereCondition2

                if (customer !='' && status =='' && email =='' && mobile =='' && city == '') {
                    whereCondition = {id:customer}

                }else if(email !='' && customer =='' && status =='' && mobile =='' && city == ''){
                    whereCondition = {email: email}

                }else if(email =='' && customer =='' && status =='' && mobile !='' && city == ''){
                    whereCondition = {mobile: mobile}

                }else if(status !='' && email =='' && customer =='' && mobile =='' && city == ''){
                    whereCondition = {status:status}

                }else if(status =='' && email =='' && customer =='' && mobile =='' && city != ''){
                    whereCondition2 = {city:city}
                    
                }else if(customer!='' && status !='' && email =='' && mobile =='' && city == ''){
                    whereCondition = {id:customer,status:status}

                }else if(customer!='' && email !='' && status =='' && mobile =='' && city == ''){
                    whereCondition = {id:customer,email:email}

                }else if(customer!='' && email =='' && status =='' && mobile !='' && city == ''){
                    whereCondition = {id:customer,mobile:mobile}

                }else if(customer!='' && email =='' && status =='' && mobile =='' && city != ''){
                    whereCondition = {id:customer}
                    whereCondition2 = {city:city}
                    
                }else if(email!='' && status !='' && customer =='' && mobile =='' && city == ''){
                    whereCondition = {email:email,status:status}

                }else if(email=='' && status !='' && customer =='' && mobile !='' && city == ''){
                    whereCondition = {mobile:mobile,status:status}

                }else if(email=='' && status !='' && customer =='' && mobile =='' && city != ''){
                    whereCondition = {status:status}
                    whereCondition2 = {city:city}
                    
                }else if(email!='' && status =='' && customer =='' && mobile !='' && city == ''){
                    whereCondition = {email:email,mobile:mobile}

                }else if(email!='' && status =='' && customer =='' && mobile =='' && city != ''){
                    whereCondition = {email:email}
                    whereCondition2 = {city:city}
                    
                }else if(email=='' && status =='' && customer =='' && mobile !='' && city != ''){
                    whereCondition = {mobile:mobile}
                    whereCondition2 = {city:city}
                    
                }else if(customer !='' && status !='' && email !='' && mobile =='' && city == ''){
                    whereCondition = {id:customer,status:status,email:email}

                }else if(customer !='' && status =='' && email !='' && mobile !='' && city == ''){
                    whereCondition = {id:customer,email:email,mobile:mobile}

                }else if(customer !='' && status !='' && email =='' && mobile !='' && city != ''){
                    whereCondition = {status:status,id:customer,mobile:mobile}

                }else if(customer !='' && status =='' && email !='' && mobile =='' && city != ''){
                    whereCondition = {email:email,id:customer}
                    whereCondition2 = {city:city}

                }else if(customer =='' && status !='' && email =='' && mobile !='' && city != ''){
                    whereCondition = {status:status,mobile:mobile}
                    whereCondition2 = {city:city}

                }else if(customer!='' && status =='' && email =='' && mobile !='' && city != ''){
                    whereCondition = {id:customer,mobile:mobile}
                    whereCondition2 = {city:city}

                }else if(customer=='' && status !='' && email !='' && mobile !='' && city == ''){
                    whereCondition = {email:email,status:status, mobile:mobile}

                }else if(customer=='' && status !='' && email !='' && mobile =='' && city != ''){
                    whereCondition = {status:status, email:email}
                    whereCondition2 = {city:city}

                }else if(customer=='' && status =='' && email !='' && mobile !='' && city != ''){
                    whereCondition = {email:email, mobile:mobile}
                    whereCondition2 = {city:city}

                }else if(customer!='' && status !='' && email !='' && mobile !='' && city == ''){
                    whereCondition = {id:customer,status:status, email:email, mobile:mobile}

                }else if(customer!='' && status !='' && email !='' && mobile =='' && city != ''){
                    whereCondition = {id:customer,status:status, email:email}
                    whereCondition2 = {city:city}

                }else if(customer!='' && status =='' && email !='' && mobile !='' && city != ''){
                    whereCondition = {id:customer,email:email, mobile:mobile}
                    whereCondition2 = {city:city}

                }else if(customer!='' && status !='' && email =='' && mobile !='' && city != ''){
                    whereCondition = {id:customer,status:status, mobile:mobile}
                    whereCondition2 = {city:city}

                }else if(customer=='' && status !='' && email !='' && mobile !='' && city != ''){
                    whereCondition = {email:email,status:status, mobile:mobile}
                    whereCondition2 = {city:city}

                }else if(customer!='' && status !='' && email !='' && mobile !='' && city != ''){
                    whereCondition = {id:customer,status:status, email:email, mobile:mobile}
                    whereCondition2 = {city:city}

                }

                let customerlist

                if (customer !='' || status !='' || email !='' || mobile !='' || city != '') {
                    if (city !='') {
                        customerlist = await models.customers.findAll({where:whereCondition, include:[{model: models.customerAddresses, where:whereCondition2}]})
                    } else {
                        customerlist = await models.customers.findAll({where:whereCondition, include:[{model: models.customerAddresses,required:false, where:whereCondition2}]})
                    }
                } else {
                    customerlist = await models.customers.findAll({where: { [Op.or]:[
                        { firstName: { [Op.like]: `%${search}%` }},
                        { lastName: { [Op.like]: `%${search}%` }},
                        { email: { [Op.like]: `%${search}%` }},
                        { mobile: { [Op.like]: `%${search}%` }},
                        { gender: { [Op.like]: `%${search}%` }},
                        { status: { [Op.like]: `%${search}%` }},
                    ]}, include:[{model: models.customerAddresses,required:false}]})
                }

                let arrData = [];
                if (customerlist) {
                    for(let customer of customerlist){
                        let customerAddresses = await models.customerAddresses.findAll({ attributes: ['address','locality','city','state','pin'], where: { customerId: customer.id}});

                        let customersDetails = customer.dataValues;
                        if(customerAddresses.length>0){
                            customersDetails.address = customerAddresses[0].address
                            customersDetails.locality = customerAddresses[0].locality
                            customersDetails.city = customerAddresses[0].city
                            customersDetails.state = customerAddresses[0].state
                            customersDetails.pin = customerAddresses[0].pin
                        }else{
                            customersDetails.address = ''
                            customersDetails.locality = ''
                            customersDetails.city = ''
                            customersDetails.state = ''
                            customersDetails.pin = ''
                        }

                        arrData.push(customersDetails)
                    }
                }

                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Customers");
            
                worksheet.columns = [
                    { header: "First Name", key: "firstName", width:10 },
                    { header: "Last Name", key: "lastName", width: 10 },
                    { header: "Email", key: "email", width: 25 },
                    { header: "Mobile", key: "mobile", width: 15 },
                    { header: "Gender", key: "gender", reply: 10 },
                    { header: "Status", key: "status", width: 10 },
                    { header: "Address", key: "address", width: 30 },
                    { header: "Locality", key: "locality", width: 15 },
                    { header: "City", key: "city", width: 10 },
                    { header: "State", key: "state", width: 10 },
                    { header: "Pin", key: "pin", width: 10 },
                ];
            
                // Add Array Rows
                worksheet.addRows(arrData);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Customers.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })


            }else{
                let whereCondition
                let whereCondition2

                if (customer !='' && status =='' && email =='' && mobile =='' && city == '') {
                    whereCondition = {id:customer, storeId:sessionStoreId}

                }else if(email !='' && customer =='' && status =='' && mobile =='' && city == ''){
                    whereCondition = {email: email, storeId:sessionStoreId}

                }else if(email =='' && customer =='' && status =='' && mobile !='' && city == ''){
                    whereCondition = {mobile: mobile, storeId:sessionStoreId}

                }else if(status !='' && email =='' && customer =='' && mobile =='' && city == ''){
                    whereCondition = {status:status, storeId:sessionStoreId}

                }else if(status =='' && email =='' && customer =='' && mobile =='' && city != ''){
                    whereCondition2 = {city:city, storeId:sessionStoreId}
                    
                }else if(customer!='' && status !='' && email =='' && mobile =='' && city == ''){
                    whereCondition = {id:customer,status:status, storeId:sessionStoreId}

                }else if(customer!='' && email !='' && status =='' && mobile =='' && city == ''){
                    whereCondition = {id:customer,email:email, storeId:sessionStoreId}

                }else if(customer!='' && email =='' && status =='' && mobile !='' && city == ''){
                    whereCondition = {id:customer,mobile:mobile, storeId:sessionStoreId}

                }else if(customer!='' && email =='' && status =='' && mobile =='' && city != ''){
                    whereCondition = {id:customer, storeId:sessionStoreId}
                    whereCondition2 = {city:city, storeId:sessionStoreId}
                    
                }else if(email!='' && status !='' && customer =='' && mobile =='' && city == ''){
                    whereCondition = {email:email,status:status, storeId:sessionStoreId}

                }else if(email=='' && status !='' && customer =='' && mobile !='' && city == ''){
                    whereCondition = {mobile:mobile,status:status, storeId:sessionStoreId}

                }else if(customer =='' && status !='' && email =='' && mobile !='' && city != ''){
                    whereCondition = {status:status,mobile:mobile,storeId:sessionStoreId}
                    whereCondition2 = {city:city,storeId:sessionStoreId}

                }else if(email=='' && status !='' && customer =='' && mobile =='' && city != ''){
                    whereCondition = {status:status, storeId:sessionStoreId}
                    whereCondition2 = {city:city, storeId:sessionStoreId}
                    
                }else if(email!='' && status =='' && customer =='' && mobile !='' && city == ''){
                    whereCondition = {email:email,mobile:mobile, storeId:sessionStoreId}

                }else if(email!='' && status =='' && customer =='' && mobile =='' && city != ''){
                    whereCondition = {email:email, storeId:sessionStoreId}
                    whereCondition2 = {city:city, storeId:sessionStoreId}
                    
                }else if(email=='' && status =='' && customer =='' && mobile !='' && city != ''){
                    whereCondition = {mobile:mobile, storeId:sessionStoreId}
                    whereCondition2 = {city:city, storeId:sessionStoreId}
                    
                }else if(customer !='' && status !='' && email !='' && mobile =='' && city == ''){
                    whereCondition = {id:customer,status:status,email:email, storeId:sessionStoreId}

                }else if(customer !='' && status =='' && email !='' && mobile !='' && city == ''){
                    whereCondition = {id:customer,email:email,mobile:mobile, storeId:sessionStoreId}

                }else if(customer !='' && status !='' && email =='' && mobile !='' && city != ''){
                    whereCondition = {status:status,id:customer,mobile:mobile, storeId:sessionStoreId}

                }else if(customer !='' && status =='' && email !='' && mobile =='' && city != ''){
                    whereCondition = {email:email,id:customer, storeId:sessionStoreId}
                    whereCondition2 = {city:city, storeId:sessionStoreId}

                }else if(customer!='' && status =='' && email =='' && mobile !='' && city != ''){
                    whereCondition = {id:customer,mobile:mobile, storeId:sessionStoreId}
                    whereCondition2 = {city:city, storeId:sessionStoreId}

                }else if(customer=='' && status !='' && email !='' && mobile !='' && city == ''){
                    whereCondition = {email:email,status:status, mobile:mobile, storeId:sessionStoreId}

                }else if(customer=='' && status !='' && email !='' && mobile =='' && city != ''){
                    whereCondition = {status:status, email:email, storeId:sessionStoreId}
                    whereCondition2 = {city:city, storeId:sessionStoreId}

                }else if(customer=='' && status =='' && email !='' && mobile !='' && city != ''){
                    whereCondition = {email:email, mobile:mobile, storeId:sessionStoreId}
                    whereCondition2 = {city:city, storeId:sessionStoreId}

                }else if(customer!='' && status !='' && email !='' && mobile !='' && city == ''){
                    whereCondition = {id:customer,status:status, email:email, mobile:mobile, storeId:sessionStoreId}

                }else if(customer!='' && status !='' && email !='' && mobile =='' && city != ''){
                    whereCondition = {id:customer,status:status, email:email, storeId:sessionStoreId}
                    whereCondition2 = {city:city, storeId:sessionStoreId}

                }else if(customer!='' && status =='' && email !='' && mobile !='' && city != ''){
                    whereCondition = {id:customer,email:email, mobile:mobile, storeId:sessionStoreId}
                    whereCondition2 = {city:city, storeId:sessionStoreId}

                }else if(customer!='' && status !='' && email =='' && mobile !='' && city != ''){
                    whereCondition = {id:customer,status:status, mobile:mobile, storeId:sessionStoreId}
                    whereCondition2 = {city:city, storeId:sessionStoreId}

                }else if(customer=='' && status !='' && email !='' && mobile !='' && city != ''){
                    whereCondition = {email:email,status:status, mobile:mobile, storeId:sessionStoreId}
                    whereCondition2 = {city:city, storeId:sessionStoreId}

                }else if(customer!='' && status !='' && email !='' && mobile !='' && city != ''){
                    whereCondition = {id:customer,status:status, email:email, mobile:mobile, storeId:sessionStoreId}
                    whereCondition2 = {city:city, storeId:sessionStoreId}

                }

                let customerlist

                if (customer !='' || status !='' || email !='' || mobile !='' || city != '') {
                    if (city !='') {
                        customerlist = await models.customers.findAll({where:whereCondition, include:[{model: models.customerAddresses, where:whereCondition2}]})
                    } else {
                        customerlist = await models.customers.findAll({where:whereCondition, include:[{model: models.customerAddresses,required:false, where:whereCondition2}]})
                    }
                } else {
                    customerlist = await models.customers.findAll({where: {storeId:sessionStoreId, [Op.or]:[
                        { firstName: { [Op.like]: `%${search}%` }},
                        { lastName: { [Op.like]: `%${search}%` }},
                        { email: { [Op.like]: `%${search}%` }},
                        { mobile: { [Op.like]: `%${search}%` }},
                        { gender: { [Op.like]: `%${search}%` }},
                        { status: { [Op.like]: `%${search}%` }},
                    ]}, include:[{model: models.customerAddresses,required:false}]})

                    listCount = await models.customers.count({where: {storeId:sessionStoreId, [Op.or]:[
                        { firstName: { [Op.like]: `%${search}%` }},
                        { lastName: { [Op.like]: `%${search}%` }},
                        { email: { [Op.like]: `%${search}%` }},
                        { mobile: { [Op.like]: `%${search}%` }},
                        { gender: { [Op.like]: `%${search}%` }},
                        { status: { [Op.like]: `%${search}%` }},
                    ]}, include:[{model: models.customerAddresses,required:false}]})
                }

                let arrData = [];
                if (customerlist) {
                    for(let customer of customerlist){
                        let customerAddresses = await models.customerAddresses.findAll({ attributes: ['address','locality','city','state','pin'], where: { customerId: customer.id}});

                        let customersDetails = customer.dataValues;
                        if(customerAddresses.length>0){
                            customersDetails.address = customerAddresses[0].address
                            customersDetails.locality = customerAddresses[0].locality
                            customersDetails.city = customerAddresses[0].city
                            customersDetails.state = customerAddresses[0].state
                            customersDetails.pin = customerAddresses[0].pin
                        }else{
                            customersDetails.address = ''
                            customersDetails.locality = ''
                            customersDetails.city = ''
                            customersDetails.state = ''
                            customersDetails.pin = ''
                        }

                        arrData.push(customersDetails)
                    }
                }

                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Customers");
            
                worksheet.columns = [
                    { header: "First Name", key: "firstName", width:10 },
                    { header: "Last Name", key: "lastName", width: 10 },
                    { header: "Email", key: "email", width: 25 },
                    { header: "Mobile", key: "mobile", width: 15 },
                    { header: "Gender", key: "gender", reply: 10 },
                    { header: "Status", key: "status", width: 10 },
                    { header: "Address", key: "address", width: 30 },
                    { header: "Locality", key: "locality", width: 15 },
                    { header: "City", key: "city", width: 10 },
                    { header: "State", key: "state", width: 10 },
                    { header: "Pin", key: "pin", width: 10 },
                ];
            
                // Add Array Rows
                worksheet.addRows(arrData);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Customers.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })
            }            
        }
    })
}