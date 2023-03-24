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
const Sequelize = require("sequelize");
const Op = Sequelize.Op


/**
 * This function is developed for listng Coupon
 * Developer: Partha Mandal
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
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                
                let couponList = await models.coupon.findAll({ where: {
                    [Op.or]: [
                      { couponType: { [Op.like]: `%${search}%` } },
                      { couponValue: { [Op.like]: `%${search}%` } },
                      { image: { [Op.like]: `%${search}%` } },
                      { dateFrom: { [Op.like]: `%${search}%` } },
                      { dateTo: { [Op.like]: `%${search}%` } },
                      { description: { [Op.like]: `%${search}%` } },
                      { shortDescription: { [Op.like]: `%${search}%` } },
                      { couponCode: { [Op.like]: `%${search}%` } },
                      { purchaseLimit: { [Op.like]: `%${search}%` } },
                      { termsAndConditions: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.coupon.count({where: {
                    [Op.or]: [
                        { couponType: { [Op.like]: `%${search}%` } },
                        { couponValue: { [Op.like]: `%${search}%` } },
                        { image: { [Op.like]: `%${search}%` } },
                        { dateFrom: { [Op.like]: `%${search}%` } },
                        { dateTo: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } },
                        { shortDescription: { [Op.like]: `%${search}%` } },
                        { couponCode: { [Op.like]: `%${search}%` } },
                        { purchaseLimit: { [Op.like]: `%${search}%` } },
                        { termsAndConditions: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                  }});

                let pageCount = Math.ceil(listCount/pageSize);

                if (couponList) {
                    return res.render('admin/coupon/list', {
                        title: 'Coupon List',
                        arrData: couponList,
                        storeList: storeList,
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
                    return res.render('admin/coupon/list', {
                        title: 'Coupon List',
                        arrData: '',
                        storeList: '',
                        sessionStoreId: '',
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
                        return permission === 'CouponList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });

                    let couponList = await models.coupon.findAll({order: [[column, order]], where: { storeId: sessionStoreId, [Op.or]: [
                        { couponType: { [Op.like]: `%${search}%` } },
                        { couponValue: { [Op.like]: `%${search}%` } },
                        { image: { [Op.like]: `%${search}%` } },
                        { dateFrom: { [Op.like]: `%${search}%` } },
                        { dateTo: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } },
                        { shortDescription: { [Op.like]: `%${search}%` } },
                        { couponCode: { [Op.like]: `%${search}%` } },
                        { purchaseLimit: { [Op.like]: `%${search}%` } },
                        { termsAndConditions: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                      ] },limit:pageSize, offset:(page-1)*pageSize });

                    let listCount = await models.coupon.count({where: { storeId: sessionStoreId, [Op.or]: [
                        { couponType: { [Op.like]: `%${search}%` } },
                        { couponValue: { [Op.like]: `%${search}%` } },
                        { image: { [Op.like]: `%${search}%` } },
                        { dateFrom: { [Op.like]: `%${search}%` } },
                        { dateTo: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } },
                        { shortDescription: { [Op.like]: `%${search}%` } },
                        { couponCode: { [Op.like]: `%${search}%` } },
                        { purchaseLimit: { [Op.like]: `%${search}%` } },
                        { termsAndConditions: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                      ] }});

                    let pageCount = Math.ceil(listCount/pageSize);

                    if (couponList) {
                        return res.render('admin/coupon/list', {
                            title: 'Coupon List',
                            arrData: couponList,
                            storeList: storeList,
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
                        return res.render('admin/coupon/list', {
                            title: 'Coupon List',
                            arrData: '',
                            storeList: '',
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
 * This function is developed for view Coupon
 * Developer: Partha Mandal
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
                var customer = await models.customers.findAll({ attributes: ['id', 'fullName'], where: { status: 'Yes' } });

                if (!id) {
                    return res.render('admin/coupon/addedit', {
                        title: 'Add Coupon',
                        arrData: '',
                        stores: stores,
                        arrCustomers: customer,
                        selectedCustomer:'',
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var coupon = await models.coupon.findOne({ where: { id: id } });
                    var selectedCustomerList = await models.couponCustomer.findAll({ attributes: ['id', 'couponId','customerId'], where: { couponId: id } });
                    if (coupon) {
                        return res.render('admin/coupon/addedit', {
                            title: 'Edit Coupon',
                            arrData: coupon,
                            stores: stores,
                            arrCustomers: customer,
                            selectedCustomer:selectedCustomerList,
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
                        return permission === 'CouponView'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.coupon.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId, status: 'Yes' } });
                    var customer = await models.customers.findAll({ attributes: ['id', 'fullName'], where: { status: 'Yes' } });
                    if (!id) {
                        return res.render('admin/coupon/addedit', {
                            title: 'Add Coupon',
                            arrData: '',
                            stores: stores,
                            arrCustomers: customer,
                            selectedCustomer:'',
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        var coupon = await models.coupon.findOne({ where: { storeId: sessionStoreId, id: id } });
                        var selectedCustomerList = await models.couponCustomer.findAll({ attributes: ['id', 'couponId','customerId'], where: { couponId: id } });
                        if (coupon) {
                            return res.render('admin/coupon/addedit', {
                                title: 'Edit Coupon',
                                arrData: coupon,
                                stores: stores,
                                arrCustomers: customer,
                                selectedCustomer:selectedCustomerList,
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
 * This function is developed for add/update New Coupon
 * Developer: Partha Mandal
 */
 exports.addOrUpdate = function(req, res, next) {
    var token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var role = req.session.role;
    jwt.verify(token, SECRET, async function (err, decoded) {
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
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
                        return permission === 'CouponAddEdit'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                let form = new multiparty.Form();
                form.parse(req, function (err, fields, files) {
                    let id = fields.update_id[0];
                    let couponType = fields.couponType[0] ? fields.couponType[0] : null;
                    let couponValue = fields.couponValue[0] ? fields.couponValue[0] : null;
                    let description = fields.description[0] ? fields.description[0] : null;
                    let shortDescription = fields.shortDescription[0] ? fields.shortDescription[0] : null;
                    let dateFrom = fields.dateFrom[0] ? fields.dateFrom[0] : null;
                    let dateTo = fields.dateTo[0] ? fields.dateTo[0] : null;
                    let couponCode = fields.couponCode[0] ? fields.couponCode[0] : null;
                    let purchaseLimit = fields.purchaseLimit[0] ? fields.purchaseLimit[0] : null;
                    let termsAndConditions = fields.termsAndConditions[0] ? fields.termsAndConditions[0] : null;
                    let storeId = fields.storeId[0] ? fields.storeId[0] : 30;
                    let status = fields.status[0] ? fields.status[0] : null;
                    let customerType = fields.customerType[0] ? fields.customerType[0] : 'all';
                    var cuponCustomerArr=fields.cuponCustomerId ;
                    if (!id) {
                        if (couponType != '' && storeId != '' && status != '' && couponValue != '' && couponCode != '') {
                            models.coupon.create({
                                couponType: couponType,
                                couponValue: couponValue,
                                description: description,
                                shortDescription: shortDescription,
                                dateFrom: dateFrom,
                                dateTo: dateTo,
                                couponCode: couponCode,
                                purchaseLimit: purchaseLimit,
                                termsAndConditions: termsAndConditions,
                                storeId: storeId,
                                status: status,
                                customerType: customerType,
                                createdBy: sessionUserId
                            }).then(function (value) {                              
                                
                                if (value) {

                                     // cuponCustomer  start
                                    if(cuponCustomerArr){ 
                                        cuponCustomerArr.forEach(function(couCus){
                                            couCus=couCus.split("~");
                                            couCusId=couCus[0];
                                            customerName=couCus[1];
                                            models.couponCustomer.create({
                                                couponId:value.id,
                                                customerId:couCusId,
                                                couponCode:couponCode,
                                                customerName :customerName                         	
                                            });		
                                        }, this);
                                    }
                                    // cuponCustomer  end
                                    
                                    req.flash('info', 'Successfully created');
                                    return res.redirect('/admin/coupon/list/1');
                                }
                            }).catch(function (error) {
                                console.log(error);
                                req.flash('errors', 'Somethings went wrong');
                            });
                        }else{
                            req.flash('errors', 'Please fill the required fields.')
                            return res.redirect('back')
                        }
                    } else {
                        if (couponType != '' && storeId != '' && status != '' && couponValue != '' && couponCode != '') {
                        models.coupon.update({
                            couponType: couponType,
                            couponValue: couponValue,
                            description: description,
                            shortDescription: shortDescription,
                            dateFrom: dateFrom,
                            dateTo: dateTo,
                            couponCode: couponCode,
                            purchaseLimit: purchaseLimit,
                            termsAndConditions: termsAndConditions,
                            storeId: storeId,
                            status: status,
                            customerType: customerType,
                            updatedBy: sessionUserId
                        }, { where: { id: id } }).then(function (value) {
                            if (value) {

                                // cuponCustomer  start
                                if(cuponCustomerArr){ 
                                    models.couponCustomer.destroy({ where:{couponId: id}});
                                    cuponCustomerArr.forEach(function(couCus){
                                        couCus=couCus.split("~");
                                        couCusId=couCus[0];
                                        customerName=couCus[1];
                                        models.couponCustomer.create({
                                            couponId:id,
                                            customerId:couCusId,
                                            couponCode:couponCode,
                                            customerName :customerName                         	
                                        });		
                                    }, this);
                                }
                                // cuponCustomer  end

                                req.flash('info', 'Successfully updated');
                                return res.redirect('/admin/coupon/list/1');
                            }
                        }).catch(function (error) {
                            console.log(error);
                            req.flash('errors', 'Somethings went wrong');
                        });
                        }else{
                            req.flash('errors', 'Please fill the required fields.')
                            return res.redirect('back')
                        }
                    }
                });
            }
        }
    })
    
};

/**
 * This function is developed for delete Coupon
 * Developer: Partha Mandal
 */
exports.delete = function(req, res, next) {
    var token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    var id = req.params.id;
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
                        return permission === 'CouponDelete'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.coupon.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.coupon.destroy({
                    where: { id: id }
                }).then(function (value) {
                    if (value) {
                        req.flash('info', 'Successfully deleted');
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
