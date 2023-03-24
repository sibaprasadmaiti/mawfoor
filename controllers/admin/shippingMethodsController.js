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

/**
 * Description: This function is developed for listing shipping method
 * Developer: Avijit Das
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
            if(sessionStoreId==null){
                var shippingList = await models.shippingMethods.findAll({ attributes: ['id', 'name', 'price', 'fromTime', 'toTime'], where: { active: 'Yes' } });
                if (shippingList) {
                    return res.render('admin/shippingMethods/list', {
                        title: 'Shipping Methods',
                        arrData: shippingList,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } else {
                    return res.render('admin/shippingMethods/list', {
                        title: 'Shipping Methods',
                        arrData: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                }
            }else{
                //*****Permission start
                var userPermission = false;
                if(role=='admin'){
                    userPermission=true;
                }else{
                    userPermission = !!req.session.permissions.find(permission=>{
                        return permission ==='ShippingMethodList'
                    })                    
                }
                if(userPermission==false){
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                }else{
                    var shippingList = await models.shippingMethods.findAll({ attributes: ['id', 'name', 'price', 'fromTime', 'toTime'], where: { active: 'Yes',storeId:sessionStoreId } });
                    if (shippingList) {
                        return res.render('admin/shippingMethods/list', {
                            title: 'Shipping Methods',
                            arrData: shippingList,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                        });
                    } else {
                        return res.render('admin/shippingMethods/list', {
                            title: 'Shipping Methods',
                            arrData: '',
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
 * Description: This function is developed for view shipping methods
 * Developer: Avijit Das
 */
exports.view= async function(req, res){
    var id = req.params.id;
    var token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    jwt.verify(token,SECRET, async function(error,decode){
        if(error){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            if(sessionStoreId==null){
                var storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                if (!id) {
                    return res.render('admin/shippingMethods/addedit', {
                        title: 'Add Shipping Method',
                        messages: req.flash('info'),
                        arrData: '',
                        stores: storeList,
                        errors: req.flash('errors'),
                    });
                } else {
                    var shippingList = models.shippingMethods.findOne({ where: { id: id } });
                    shippingList.then(function (value) {
                        return res.render('admin/shippingMethods/addedit', {
                            title: 'Edit Shipping Method',
                            messages: req.flash('info'),
                            arrData: value,
                            stores: storeList,
                            errors: req.flash('errors'),
                        });

                    });
                }
            }else{
                //*****Permission Start
                var userPermission = false;
                if(role=='admin'){
                    userPermission=true;
                }else{
                    userPermission =!! req.session.permissions.find(permission=>{
                        return permission =='ShippingMethodView'
                    })
                    if(id){
                        var storeIdChecking = await models.shippingMethods.findOne({ attributes: ['storeId'], where: { id: id } });
                        if(storeIdChecking.storeId==sessionStoreId){
                            userPermission = true;
                        }else{
                            userPermission = false;
                        }
                    }
                }
                if(userPermission == false){
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                }else{
                    var storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes', id:sessionStoreId } });
                    if (!id) {
                        return res.render('admin/shippingMethods/addedit', {
                            title: 'Add Shipping Method',
                            messages: req.flash('info'),
                            arrData: '',
                            stores: storeList,
                            errors: req.flash('errors'),
                        });
                    } else {
                        var shippingList = models.shippingMethods.findOne({ where: { id: id, storeId:sessionStoreId } });
                        shippingList.then(function (value) {
                            return res.render('admin/shippingMethods/addedit', {
                                title: 'Edit Shipping Method',
                                messages: req.flash('info'),
                                arrData: value,
                                stores: storeList,
                                errors: req.flash('errors'),
                            });

                        });
                    }
                }
            }
        }
    });    
};



/**
 * Description: This function is developed for add/update of shipping methods
 * Developer: Avijit Das
 */
exports.addOrUpdate = function(req, res) {
    var token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    jwt.verify(token,SECRET, async function(error,decode){
        if(error){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            //*****Permission Start
            var userPermission = false;
            if(sessionStoreId==null){
                userPermission = true;
            }else{
                if(role == 'admin'){
                    userPermission =true;
                }else{
                    userPermission =!! req.session.permissions.find(permission=>{
                        return permission === 'ShippingMethodAddEdit'
                    })
                }
            }            
        }
        if(userPermission==true){
            var form = new multiparty.Form();
            form.parse(req, function (err, fields, files) {
                var id = fields.updatedId[0];
                var shippingName = fields.name[0];
                var storeId = fields.storeId[0];
                var shippingNameslug = fields.slug[0];
                var shippingToTime = fields.toTime[0];
                var shippingFromTime = fields.fromTime[0];
                var shippingPrice = fields.price[0];
                var status = fields.active[0];
                if (!id) {
                    if (shippingName != '') {
                        models.shippingMethods.create({
                            name: shippingName,
                            slug: shippingNameslug,
                            storeId: storeId,
                            fromTime: shippingFromTime,
                            toTime: shippingToTime,
                            price: shippingPrice,
                            active: status,
                        }).then(function (value) {
                            if (value) {
                                req.flash('info', 'Successfully shipping methods Created');
                                return res.redirect('/admin/shippingMethods/list');
                            }
                        })
                            .catch(function (error) {
                                console.log(error);
                                req.flash('errors', 'Something went wrong');
                            });
                    }
                } else {
                    models.shippingMethods.update({
                        name: shippingName,
                        slug: shippingNameslug,
                        storeId: storeId,
                        fromTime: shippingFromTime,
                        toTime: shippingToTime,
                        price: shippingPrice,
                        active: status,
                    }, { where: { id: id } }).then(function (updateValue) {
                        if (updateValue) {
                            req.flash('info', 'Successfully shipping methods updated');
                            return res.redirect('/admin/shippingMethods/list');
                        }
                    })
                        .catch(function (error) {
                            req.flash('errors', 'Something went wrong');
                            console.log(error);
                        });
                }
            });
        }
    });
    
};



/**
 * Description: This function is developed for delete of shipping methods
 * Developer: Avijit Das
 */
exports.delete = function(req, res) {
    var token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    var id = req.params.id;
    jwt.verify(token,SECRET,async function(error,decode){
        if(error){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            //*****Permission Start
            var userPermission = false;
            if(sessionStoreId==null){
                userPermission=true;
            }else{
                if(role=='admin'){
                    userPermission=true;
                }else{
                    userPermission =!! req.session.permissions.find(permission=>{
                        return permission ==='ShippingMethodDelete'
                    })
                }
            }
            if (id) {
                var storeIdChecking = await models.shippingMethods.findOne({ attributes: ['storeId'], where: { id: id } });
                if (storeIdChecking.storeId == sessionStoreId) {
                    userPermission = true;
                } else {
                    userPermission = false;
                }
            }
        }
        if (userPermission==false){
            req.flash('errors', 'Contact Your administrator for permission');
            res.redirect('/admin/dashboard');
        }else{            
            models.shippingMethods.update({
                active: 'No',
            }, {
                where: { id: id }
            }).then(function (value) {
                if (value) {
                    req.flash('info', 'Successfully shipping methods deleted');
                    res.redirect('back');
                } else {
                    req.flash('errors', 'Something went wrong');
                    res.redirect('back');
                }
            });
        }
    });    
};