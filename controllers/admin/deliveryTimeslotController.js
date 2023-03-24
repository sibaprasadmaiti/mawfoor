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
 * Description: This function is developed for deliveyTimeSlot listing 
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
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                
                let deliveryTimeSlotList = await models.deliveryTimeSlot.findAll({ where: {
                    [Op.or]: [
                        {label: {[Op.like]:`%${search}%`}},
                        {sequence: {[Op.like]:`%${search}%`}},
                        {fromTime: {[Op.like]:`%${search}%`}},
                        {toTime: {[Op.like]:`%${search}%`}},
                        {status: {[Op.like]:`%${search}%`}} 
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.deliveryTimeSlot.count({where: {
                    [Op.or]: [
                        {label: {[Op.like]:`%${search}%`}},
                        {sequence: {[Op.like]:`%${search}%`}},
                        {fromTime: {[Op.like]:`%${search}%`}},
                        {toTime: {[Op.like]:`%${search}%`}},
                        {status: {[Op.like]:`%${search}%`}}
                    ]
                  }});

                let pageCount = Math.ceil(listCount/pageSize);

                if (deliveryTimeSlotList) {
                    return res.render('admin/deliveryTimeSlot/list', {
                        title: 'Delivery TimeSlot List',
                        arrData: deliveryTimeSlotList,
                        arrStore: storeList,
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
                    return res.render('admin/deliveryTimeSlot/list', {
                        title: 'Delivery TimeSlot List',
                        arrData: '',
                        arrStore: storeList,
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
                        return permission === 'DeliveryTimeSlotList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });

                    let deliveryTimeSlotList = await models.deliveryTimeSlot.findAll({ order: [[column, order]], where: { storeId: sessionStoreId, [Op.or]: [
                        {label: {[Op.like]:`%${search}%`}},
                        {sequence: {[Op.like]:`%${search}%`}},
                        {fromTime: {[Op.like]:`%${search}%`}},
                        {toTime: {[Op.like]:`%${search}%`}},
                        {status: {[Op.like]:`%${search}%`}}
                      ] },limit:pageSize, offset:(page-1)*pageSize });

                    let listCount = await models.deliveryTimeSlot.count({where: { storeId: sessionStoreId, [Op.or]: [
                        {label: {[Op.like]:`%${search}%`}},
                        {sequence: {[Op.like]:`%${search}%`}},
                        {fromTime: {[Op.like]:`%${search}%`}},
                        {toTime: {[Op.like]:`%${search}%`}},
                        {status: {[Op.like]:`%${search}%`}}
                      ] }});

                    let pageCount = Math.ceil(listCount/pageSize);

                    if (deliveryTimeSlotList) {
                        return res.render('admin/deliveryTimeSlot/list', {
                            title: 'Delivery TimeSlot List',
                            arrData: deliveryTimeSlotList,
                            arrStore: storeList,
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
                        return res.render('admin/deliveryTimeSlot/list', {
                            title: 'Delivery TimeSlot List',
                            arrData: '',
                            arrStore: storeList,
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
 * Description: This function is developed for add/view for deliveyTimeSlot
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
                if (!id) {
                    return res.render('admin/deliveryTimeSlot/addedit', {
                        title: 'Add DeliveryTimeSlot',
                        arrData: '',
                        stores: stores,
                        sessionStoreId: '',
                        helper: helper,
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var deliveryTimeSlot = await models.deliveryTimeSlot.findOne({ where: { id: id } });
                    if (deliveryTimeSlot) {
                        return res.render('admin/deliveryTimeSlot/addedit', {
                            title: 'Edit DeliveryTimeSlot',
                            arrData: deliveryTimeSlot,
                            stores: stores,
                            sessionStoreId: '',
                            helper: helper,
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
                        return permission === 'DeliveryTimeSlotView'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.deliveryTimeSlot.findOne({ attributes: ['storeId'], where: { id: id } });
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
                        return res.render('admin/deliveryTimeSlot/addedit', {
                            title: 'Add DeliveryTimeSlot',
                            arrData: '',
                            stores: stores,
                            sessionStoreId: sessionStoreId,
                            helper: helper,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        var deliveryTimeSlot = await models.deliveryTimeSlot.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (deliveryTimeSlot) {
                            return res.render('admin/deliveryTimeSlot/addedit', {
                                title: 'Edit DeliveryTimeSlot',
                                arrData: deliveryTimeSlot,
                                stores: stores,
                                sessionStoreId: sessionStoreId,
                                helper: helper,
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
 * Description: This function is developed for add/update New deliveryTime Slot
 * Developer: Surajit Gouri
 */

 exports.addOrUpdate = function(req, res) {
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var role = req.session.role;
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
                        return permission === 'DeliveryTimeSlotAddEdit'
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
                                models.deliveryTimeSlot.create({
                                    storeId: fields.storeId[0],
                                    label: fields.label[0],
                                    fromTime: fields.fromTime[0],
                                    toTime: fields.toTime[0],
                                    sequence: fields.seq[0],
                                    status: fields.status[0],
                                    createdBy: sessionUserId,
                                }).then(function(value) {
                                    if(value) {
                                        req.flash('info','Successfully timeslot created');
                                        return res.redirect('/admin/deliveryTimeSlot/list/1');
                                    } else {
                                        req.flash('errors','Something went wrong');
                                    }
                                }).catch(function(error) {
                                    req.flash('errors','Something went wrong');
                                });
                            } else{
                                models.deliveryTimeSlot.update({
                                    storeId: fields.storeId[0],
                                    label: fields.label[0],
                                    fromTime: fields.fromTime[0],
                                    toTime: fields.toTime[0],
                                    sequence: fields.seq[0],
                                    status: fields.status[0],
                                    updatedBy: sessionUserId,
                                },{where:{id:id}}).then(function(value) {
                                    if(value) {
                                        req.flash('info','Successfully timeslot updated');
                                        return res.redirect('/admin/deliveryTimeSlot/list/1');
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
 * This function is developed for delete deliveyTimeSlot
 * Developer:Surajit Gouri
 */
 exports.delete = function(req, res) {

    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;

    jwt.verify(token, SECRET, async function(err, decoded) {
        if(err){
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            var id = req.params.id;

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
                        return permission === 'DeliveryTimeSlotDelete'
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
                
                models.deliveryTimeSlot.destroy({ 
                    where:{id:id}
                }).then(function(value) {
                    if(value) {
                        req.flash('info','Successfully  timeslot deleted');
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