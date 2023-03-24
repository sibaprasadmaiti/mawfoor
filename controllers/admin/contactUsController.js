const models = require('../../models');
const multiparty = require('multiparty'); 
const flash = require('connect-flash');
const jwt = require('jsonwebtoken');
const SECRET = 'nodescratch';
const Sequelize = require("sequelize");
const Op = Sequelize.Op

/**
 * This function is developed for listing ContactUs
 * Developer: Partha Mandal
*/
exports.list = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });

                let column = req.query.column || 'id';
                let order = req.query.order || 'ASC';
                let pagesizes = req.query.pagesize || 10;
                let pageSize = parseInt(pagesizes);
                let page = req.params.page || 1;
                let search = req.query.search || '';
                
                let contactUsList = await models.contactUs.findAll({ where: {
                    [Op.or]: [
                        { firstName: { [Op.like]: `%${search}%` } },
                        { lastName: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                        { contactNo: { [Op.like]: `%${search}%` } },
                        { address: { [Op.like]: `%${search}%` } },
                        { message: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.contactUs.count({where: {
                    [Op.or]: [
                        { firstName: { [Op.like]: `%${search}%` } },
                        { lastName: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                        { contactNo: { [Op.like]: `%${search}%` } },
                        { address: { [Op.like]: `%${search}%` } },
                        { message: { [Op.like]: `%${search}%` } }
                    ]
                  }});

                let pageCount = Math.ceil(listCount/pageSize);

                if (contactUsList) {
                    return res.render('admin/contactUs/list', {
                        title: 'Contact-Us List',
                        arrData: contactUsList,
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
                    return res.render('admin/contactUs/list', {
                        title: 'Contact-Us List',
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
                        return permission === 'ContactUsList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });
                    let column = req.query.column || 'id';
                    let order = req.query.order || 'ASC';
                    let pagesizes = req.query.pagesize || 10;
                    let pageSize = parseInt(pagesizes);
                    let page = req.params.page || 1;
                    let search = req.query.search || '';

                    let contactUsList = await models.contactUs.findAll({ order: [[column, order]], where: { storeId: sessionStoreId, [Op.or]: [
                        { firstName: { [Op.like]: `%${search}%` } },
                        { lastName: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                        { contactNo: { [Op.like]: `%${search}%` } },
                        { address: { [Op.like]: `%${search}%` } },
                        { message: { [Op.like]: `%${search}%` } }
                    ] },limit:pageSize, offset:(page-1)*pageSize });

                    let listCount = await models.contactUs.count({where: { storeId: sessionStoreId, [Op.or]: [
                        { firstName: { [Op.like]: `%${search}%` } },
                        { lastName: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                        { contactNo: { [Op.like]: `%${search}%` } },
                        { address: { [Op.like]: `%${search}%` } },
                        { message: { [Op.like]: `%${search}%` } }
                    ] }});

                    let pageCount = Math.ceil(listCount/pageSize);

                    if (contactUsList) {
                        return res.render('admin/contactUs/list', {
                            title: 'Contact-Us List',
                            arrData: contactUsList,
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
                        return res.render('admin/contactUs/list', {
                            title: 'Contact-Us List',
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
 * This function is developed for view ContactUs
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
                if (!id) {
                    return res.render('admin/contactUs/addedit', {
                        title: 'Add Contact-Us',
                        arrData: '',
                        stores: stores,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var contactUs = await models.contactUs.findOne({ where: { id: id } });
                    if (contactUs) {
                        return res.render('admin/contactUs/addedit', {
                            title: 'Edit Contact-Us',
                            arrData: contactUs,
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
                        return permission === 'ContactUsView'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.contactUs.findOne({ attributes: ['storeId'], where: { id: id } });
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
                        return res.render('admin/contactUs/addedit', {
                            title: 'Add Contact-Us',
                            arrData: '',
                            stores: stores,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        var contactUs = await models.contactUs.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (contactUs) {
                            return res.render('admin/contactUs/addedit', {
                                title: 'Edit Contact-Us',
                                arrData: contactUs,
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
 * This function is developed for add/update New ContactUs
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
                        return permission === 'ContactUsAddEdit'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                var form = new multiparty.Form();
                form.parse(req, async function (err, fields, files) {
                    var id = fields.updateId[0];
                    var firstName = fields.firstName[0];
                    var lastName = fields.lastName[0];
                    var storeId = fields.storeId[0];
                    var email = fields.email[0];
                    var contactNo = fields.contactNo[0];
                    var address = fields.address[0];
                    var message = fields.message[0];
                    if (!id) {
                        if (firstName != '') {
                            await models.contactUs.create({
                                firstName: firstName,
                                lastName: lastName,
                                storeId: storeId,
                                email: email,
                                contactNo: contactNo,
                                address: address,
                                message: message,
                                createdBy: sessionUserId
                            }).then(function (value) {
                                if (value) {
                                    req.flash('info', 'Successfully created');
                                    return res.redirect('/admin/contactUs/list/1');
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
                        if (firstName != '') {
                        await models.contactUs.update({
                            firstName: firstName,
                            lastName: lastName,
                            storeId: storeId,
                            email: email,
                            contactNo: contactNo,
                            address: address,
                            message: message,
                            updatedBy: sessionUserId
                        }, { where: { id: id } }).then(function (value) {
                            if (value) {
                                req.flash('info', 'Successfully updated');
                                return res.redirect('/admin/contactUs/list/1');
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
 * This function is developed for delete ContactUs
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
                        return permission === 'ContactUsDelete'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.contactUs.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                await models.contactUs.destroy({
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