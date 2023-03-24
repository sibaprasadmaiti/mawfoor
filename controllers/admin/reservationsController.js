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
 * Description: This function is developed for Reservations listing 
 * Developer: Surajit Gouri
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

    //let customer = req.query.customer || '';
    let name = req.query.name || '';
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
        } else {
			
            if (sessionStoreId == null) {

                let whereCondition
                if (name !='' && status =='' && fdate =='' && tdate =='') {
                    whereCondition = {name:name}
                }else if(fdate !='' && name =='' && status =='' && tdate ==''){
                    whereCondition = {date: {$gte: start}}
                }else if(fdate =='' && name =='' && status =='' && tdate !=''){
                    whereCondition = {date: {$lte: end}}
                }else if(status !='' && fdate =='' && name =='' && tdate ==''){
                    whereCondition = {status:status}
                }else if(name!='' && status !='' && fdate =='' && tdate ==''){
                    whereCondition = {name:name,status:status}
                }else if(name!='' && fdate !='' && status =='' && tdate ==''){
                    whereCondition = {name:name,date:{$gte: start}}
                }else if(name!='' && fdate =='' && status =='' && tdate !=''){
                    whereCondition = {name:name,date:{$lte: end}}
                }else if(fdate!='' && status !='' && name =='' && tdate ==''){
                    whereCondition = {date:{$gte: start},status:status}
                }else if(fdate=='' && status !='' && name =='' && tdate !=''){
                    whereCondition = {date:{$lte: end},status:status}
                }else if(fdate!='' && status =='' && name =='' && tdate !=''){
                    whereCondition = {date:{$gte: start, $lte: end}}
                }else if(name !='' && status !='' && fdate !='' && tdate ==''){
                    whereCondition = {name:name,status:status,date:{$gte: start}}
                }else if(name !='' && status =='' && fdate !='' && tdate !=''){
                    whereCondition = {name:name,date:{$gte: start, $lte: end}}
                }else if(name =='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {status:status,date:{$gte: start, $lte: end}}
                }else if(name !='' && status !='' && fdate =='' && tdate !=''){
                    whereCondition = {status:status,name:name,date:{$lte: end}}
                }else if(name!='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {name:name,status:status, date:{$gte: start, $lte: end}}
                }

                let storeList = await models.stores.findAll({attributes:['id','storeName','storeCode'],where:{status:'Yes'}});
                let reservationsCustomers = await models.reservations.findAll({attributes:['name']})

                let reservationsList
                let listCount

                if(name!='' || status !='' || fdate !='' || tdate !=''){
                    reservationsList = await models.reservations.findAll({ where: whereCondition , order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
                   // return res.send(reservationsList); return false;
                    listCount = await models.reservations.count({ where: whereCondition});
                }else{
                    reservationsList = await models.reservations.findAll({ where:{
                        [Op.or]:[
                            {storeId: {[Op.like]:`%${search}%`}},
                            {date: {[Op.like]:`%${search}%`}},
                            {name: {[Op.like]:`%${search}%`}},
                            {noPeople: {[Op.like]:`%${search}%`}},
                            {mobile: {[Op.like]:`%${search}%`}},
                            {massage: {[Op.like]:`%${search}%`}},
                            {purpose: {[Op.like]:`%${search}%`}},
                            {status: {[Op.like]:`%${search}%`}}								
                        ],                            
                    },order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize})

                    listCount = await models.reservations.count({ where:{
                        [Op.or]:[
                            {storeId: {[Op.like]:`%${search}%`}},
                            {date: {[Op.like]:`%${search}%`}},
                            {name: {[Op.like]:`%${search}%`}},
                            {noPeople: {[Op.like]:`%${search}%`}},
                            {mobile: {[Op.like]:`%${search}%`}},
                            {massage: {[Op.like]:`%${search}%`}},
                            {purpose: {[Op.like]:`%${search}%`}},
                            {status: {[Op.like]:`%${search}%`}}								
                        ]                         
                    }})

                }
                let pageCount = Math.ceil(listCount/pageSize);            
                    
                if(reservationsList){
                    return res.render('admin/reservations/list', {
                        title: 'Reservation List',
                        arrData: reservationsList,
                        arrStore: storeList,
                        arrCustomer: reservationsCustomers,
                        sessionStoreId: '',
                        helper: helper,

                        listCount: listCount,
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        searchItem: search,

                        customerFilter: name,
                        fdateFilter: fdate,
                        tdateFilter: tdate,
                        statusFilter: status,

                        pageSize: pageSize,
                        currentPage: parseInt(page),
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    })
                } else {
                    return res.render('admin/reservations/list', {
                        title: 'Reservation List',
                        arrData: [],
                        arrStore: storeList,
                        arrCustomer: reservationsCustomers,
                        sessionStoreId: '',

                        customerFilter: name,
                        fdateFilter: fdate,
                        tdateFilter: tdate,
                        statusFilter: status,

                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    }); 
                }               
            } else {
                //*****Permission Assign Start
                var userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'ReservationList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {

                    let whereCondition
                    if (name !='' && status =='' && fdate =='' && tdate =='') {
                        whereCondition = {name:name,storeId: sessionStoreId}
                    }else if(fdate !='' && name =='' && status =='' && tdate ==''){
                        whereCondition = {date: {$gte: start},storeId: sessionStoreId}
                    }else if(fdate =='' && name =='' && status =='' && tdate !=''){
                        whereCondition = {date: {$lte: end},storeId: sessionStoreId}
                    }else if(status !='' && fdate =='' && name =='' && tdate ==''){
                        whereCondition = {status:status,storeId: sessionStoreId}
                    }else if(name!='' && status !='' && fdate =='' && tdate ==''){
                        whereCondition = {name:name,status:status,storeId: sessionStoreId}
                    }else if(name!='' && fdate !='' && status =='' && tdate ==''){
                        whereCondition = {name:name,date:{$gte: start},storeId: sessionStoreId}
                    }else if(name!='' && fdate =='' && status =='' && tdate !=''){
                        whereCondition = {name:name,date:{$lte: end},storeId: sessionStoreId}
                    }else if(fdate!='' && status !='' && name =='' && tdate ==''){
                        whereCondition = {date:{$gte: start},status:status,storeId: sessionStoreId}
                    }else if(fdate=='' && status !='' && name =='' && tdate !=''){
                        whereCondition = {date:{$lte: end},status:status,storeId: sessionStoreId}
                    }else if(fdate!='' && status =='' && name =='' && tdate !=''){
                        whereCondition = {date:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }else if(name !='' && status !='' && fdate !='' && tdate ==''){
                        whereCondition = {name:name,status:status,date:{$gte: start},storeId: sessionStoreId}
                    }else if(name !='' && status =='' && fdate !='' && tdate !=''){
                        whereCondition = {name:name,date:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }else if(name =='' && status !='' && fdate !='' && tdate !=''){
                        whereCondition = {status:status,date:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }else if(name !='' && status !='' && fdate =='' && tdate !=''){
                        whereCondition = {status:status,name:name,date:{$lte: end},storeId: sessionStoreId}
                    }else if(name!='' && status !='' && fdate !='' && tdate !=''){
                        whereCondition = {name:name,status:status, date:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }

                    let storeList = await models.stores.findAll({attributes:['id','storeName','storeCode'],where:{storeId: sessionStoreId}});
                    let reservationsCustomers = await models.reservations.findAll({attributes:['name'],where:{storeId: sessionStoreId}})
    
                    let reservationsList
                    let listCount

                    if(name!='' || status !='' || fdate !='' || tdate !=''){
                        reservationsList = await models.reservations.findAll({ where: whereCondition, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
    
                        listCount = await models.reservations.count({ where: whereCondition});
                    }else{
                        reservationsList = await models.reservations.findAll({ where:{ storeId: sessionStoreId,
                            [Op.or]:[
                                {storeId: {[Op.like]:`%${search}%`}},
                                {date: {[Op.like]:`%${search}%`}},
                                {name: {[Op.like]:`%${search}%`}},
                                {noPeople: {[Op.like]:`%${search}%`}},
                                {mobile: {[Op.like]:`%${search}%`}},
                                {massage: {[Op.like]:`%${search}%`}},
                                {purpose: {[Op.like]:`%${search}%`}},
                                {status: {[Op.like]:`%${search}%`}}								
                            ],                            
                        },order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize})
    
                        listCount = await models.reservations.count({ where:{ storeId: sessionStoreId,
                            [Op.or]:[
                                {storeId: {[Op.like]:`%${search}%`}},
                                {date: {[Op.like]:`%${search}%`}},
                                {name: {[Op.like]:`%${search}%`}},
                                {noPeople: {[Op.like]:`%${search}%`}},
                                {mobile: {[Op.like]:`%${search}%`}},
                                {massage: {[Op.like]:`%${search}%`}},
                                {purpose: {[Op.like]:`%${search}%`}},
                                {status: {[Op.like]:`%${search}%`}}								
                            ]                         
                        }})
    
                    }
                    let pageCount = Math.ceil(listCount/pageSize);
                    
        
                    if(reservationsList){
                        return res.render('admin/reservations/list', {
                            title: 'Reservation List',
                            arrData: reservationsList,
                            arrStore: storeList,
                            arrCustomer: reservationsCustomers,
                            sessionStoreId: '',
                            helper: helper,
    
                            listCount: listCount,
                            pageCount: pageCount,
                            columnName: column,
                            orderType: order,
                            searchItem: search,
    
                            customerFilter: name,
                            fdateFilter: fdate,
                            tdateFilter: tdate,
                            statusFilter: status,
    
                            pageSize: pageSize,
                            currentPage: parseInt(page),
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                        })
                    } else {
                        return res.render('admin/reservations/list', {
                            title: 'Reservation List',
                            arrData: [],
                            arrStore: storeList,
                            arrCustomer: reservationsCustomers,
                            sessionStoreId: '',
    
                            customerFilter: name,
                            fdateFilter: fdate,
                            tdateFilter: tdate,
                            statusFilter: status,
    
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        }); 
                    }                     
                }          
            }
            
        }	
    });
}



/**
 * Description: This function is developed for add/view for Reservations
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
                var times = await models.reservationTimeSlot.findAll({ attributes: ['id','fromTime','toTime'], where: {status: 'Yes'}});

                if (!id) {
                    return res.render('admin/reservations/addedit', {
                        title: 'Add Reservations',
                        arrData: '',
                        stores: stores,
                        times: times,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var reservations = await models.reservations.findOne({ where: { id: id } });
                    if (reservations) {
                        return res.render('admin/reservations/addedit', {
                            title: 'Edit Reservations',
                            arrData: reservations,
                            stores: stores,
                            times: times,
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
                        return permission === 'ReservationView'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.reservations.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId, status: 'Yes' } });
                    var times = await models.reservationTimeSlot.findAll({ attributes: ['id','fromTime','toTime'], where: { storeId:sessionStoreId, status: 'Yes'}});

                    if (!id) {
                        return res.render('admin/reservations/addedit', {
                            title: 'Add Reservations',
                            arrData: '',
                            stores: stores,
                            times: times,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        var reservations = await models.reservations.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (reservations) {
                            return res.render('admin/reservations/addedit', {
                                title: 'Edit Reservations',
                                arrData: reservations,
                                stores: stores,
                                times: times,
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
 * Description: This function is developed for add/update New Reservations
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
                        return permission === 'ReservationAddEdit'
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
                            models.reservations.create({
                                //userId: fields.userId[0],
                                storeId: fields.storeId[0],
                                timeId: fields.timeId[0],
                                date: fields.date[0],
                                name: fields.name[0],
                                noPeople: fields.noPeople[0],
                                mobile: fields.mobile[0],
                                massage: fields.massage[0],
                                purpose: fields.purpose[0],
                                status: fields.status[0],
                                createdBy: sessionUserId,
                            }).then(function(value) {
                                if(value) {
                                    req.flash('info','Successfully Reservations created');
                                    return res.redirect('/admin/reservations/list/1');
                                } else {
                                    req.flash('errors','Something went wrong');
                                }
                            }).catch(function(error) {
                                req.flash('errors','Something went wrong');
                            });
                        } else{
                            models.reservations.update({
                                //userId: fields.userId[0],
                                storeId: fields.storeId[0],
                                timeId: fields.timeId[0],
                                date: fields.date[0],
                                name: fields.name[0],
                                noPeople: fields.noPeople[0],
                                mobile: fields.mobile[0],
                                massage: fields.massage[0],
                                purpose: fields.purpose[0],
                                status: fields.status[0],
                                updatedBy: sessionUserId,
                            },{where:{id:id}}).then(function(value) {
                                if(value) {
                                    req.flash('info','Successfully Reservations updated');
                                    return res.redirect('/admin/reservations/list/1');
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
 * This function is developed for delete Reservations
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
                        return permission === 'ReservationDelete'
                    })
                }
                var storeIdChecking = await models.reservations.findOne({attributes:['storeId'],where:{id:id}});
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
                
                var id = req.params.id;
                models.reservations.destroy({ 
                    where:{id:id}
                }).then(function(value) {
                    if(value) {
                        req.flash('info','Successfully  Reservations deleted');
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


exports.downloadReservations = async function(req, res){

    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;

    let search = req.query.search || '';

    let name = req.query.name || '';
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
        } else {
			
            if (sessionStoreId == null) {

                let whereCondition
                if (name !='' && status =='' && fdate =='' && tdate =='') {
                    whereCondition = {name:name}
                }else if(fdate !='' && name =='' && status =='' && tdate ==''){
                    whereCondition = {date: {$gte: start}}
                }else if(fdate =='' && name =='' && status =='' && tdate !=''){
                    whereCondition = {date: {$lte: end}}
                }else if(status !='' && fdate =='' && name =='' && tdate ==''){
                    whereCondition = {status:status}
                }else if(name!='' && status !='' && fdate =='' && tdate ==''){
                    whereCondition = {name:name,status:status}
                }else if(name!='' && fdate !='' && status =='' && tdate ==''){
                    whereCondition = {name:name,date:{$gte: start}}
                }else if(name!='' && fdate =='' && status =='' && tdate !=''){
                    whereCondition = {name:name,date:{$lte: end}}
                }else if(fdate!='' && status !='' && name =='' && tdate ==''){
                    whereCondition = {date:{$gte: start},status:status}
                }else if(fdate=='' && status !='' && name =='' && tdate !=''){
                    whereCondition = {date:{$lte: end},status:status}
                }else if(fdate!='' && status =='' && name =='' && tdate !=''){
                    whereCondition = {date:{$gte: start, $lte: end}}
                }else if(name !='' && status !='' && fdate !='' && tdate ==''){
                    whereCondition = {name:name,status:status,date:{$gte: start}}
                }else if(name !='' && status =='' && fdate !='' && tdate !=''){
                    whereCondition = {name:name,date:{$gte: start, $lte: end}}
                }else if(name =='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {status:status,date:{$gte: start, $lte: end}}
                }else if(name !='' && status !='' && fdate =='' && tdate !=''){
                    whereCondition = {status:status,name:name,date:{$lte: end}}
                }else if(name!='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {name:name,status:status, date:{$gte: start, $lte: end}}
                }


                let reservationsList

                if(name!='' || status !='' || fdate !='' || tdate !=''){
                    reservationsList = await models.resrvations.findAll({ where: whereCondition });
                }else{
                    reservationsList = await models.reservations.findAll({ where:{
                        [Op.or]:[
                            {storeId: {[Op.like]:`%${search}%`}},
                            {date: {[Op.like]:`%${search}%`}},
                            {name: {[Op.like]:`%${search}%`}},
                            {noPeople: {[Op.like]:`%${search}%`}},
                            {mobile: {[Op.like]:`%${search}%`}},
                            {massage: {[Op.like]:`%${search}%`}},
                            {purpose: {[Op.like]:`%${search}%`}},
                            {status: {[Op.like]:`%${search}%`}}								
                        ],                            
                    } });
                }

                let arrData =[];
                if(reservationsList){
                    for(let reservations of reservationsList){

                        let data = reservations.dataValues;

                        let storeList = await models.stores.findAll({attributes:['id','storeName','storeCode'],where:{ id: reservations.storeId}});
                        if(storeList.length>0){
                        data.storeName = storeList[0].storeName
                        }else{
                            data.storeName = ''
                        }

                        let reservationTime = await models.reservationTimeSlot.findAll({attributes:['id','fromTime','toTime'],where:{ id: reservations.timeId}});
                        if(reservationTime.length>0){
                        data.timeId = reservationTime[0].fromTime + ' to ' + reservationTime[0].toTime
                        }else{
                            data.timeId = ''
                        }

                        arrData.push(data)
                    }
                }  
                
                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Feedbacks");
            
                worksheet.columns = [

                    { header: "Date", key: "date", width: 12 },
                    { header: "Time", key: "timeId", width: 12 },
                    { header: "Name", key: "name", width: 12 },
                    { header: "No OfPeople", key: "noPeople", width: 12 },
                    { header: "Mobile", key: "mobile", width: 12 },
                    { header: "Massage", key: "massage", width: 12 },
                    { header: "Purpose", key: "purpose", width: 12 },
                    { header: "Status", key: "status", width: 15 },
                ];
                // Add Array Rows
                worksheet.addRows(arrData);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Reservations.xlsx"
                )
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })
                
            } else {

                let whereCondition
                    if (name !='' && status =='' && fdate =='' && tdate =='') {
                        whereCondition = {name:name,storeId: sessionStoreId}
                    }else if(fdate !='' && name =='' && status =='' && tdate ==''){
                        whereCondition = {date: {$gte: start},storeId: sessionStoreId}
                    }else if(fdate =='' && name =='' && status =='' && tdate !=''){
                        whereCondition = {date: {$lte: end},storeId: sessionStoreId}
                    }else if(status !='' && fdate =='' && name =='' && tdate ==''){
                        whereCondition = {status:status,storeId: sessionStoreId}
                    }else if(name!='' && status !='' && fdate =='' && tdate ==''){
                        whereCondition = {name:name,status:status,storeId: sessionStoreId}
                    }else if(name!='' && fdate !='' && status =='' && tdate ==''){
                        whereCondition = {name:name,date:{$gte: start},storeId: sessionStoreId}
                    }else if(name!='' && fdate =='' && status =='' && tdate !=''){
                        whereCondition = {name:name,date:{$lte: end},storeId: sessionStoreId}
                    }else if(fdate!='' && status !='' && name =='' && tdate ==''){
                        whereCondition = {date:{$gte: start},status:status,storeId: sessionStoreId}
                    }else if(fdate=='' && status !='' && name =='' && tdate !=''){
                        whereCondition = {date:{$lte: end},status:status,storeId: sessionStoreId}
                    }else if(fdate!='' && status =='' && name =='' && tdate !=''){
                        whereCondition = {date:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }else if(name !='' && status !='' && fdate !='' && tdate ==''){
                        whereCondition = {name:name,status:status,date:{$gte: start},storeId: sessionStoreId}
                    }else if(name !='' && status =='' && fdate !='' && tdate !=''){
                        whereCondition = {name:name,date:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }else if(name =='' && status !='' && fdate !='' && tdate !=''){
                        whereCondition = {status:status,date:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }else if(name !='' && status !='' && fdate =='' && tdate !=''){
                        whereCondition = {status:status,name:name,date:{$lte: end},storeId: sessionStoreId}
                    }else if(name!='' && status !='' && fdate !='' && tdate !=''){
                        whereCondition = {name:name,status:status, date:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }

                
                let reservationsList

                if(name!='' || status !='' || fdate !='' || tdate !=''){
                    reservationsList = await models.resrvations.findAll({ where: whereCondition });
                }else{
                    reservationsList = await models.reservations.findAll({ where:{
                        [Op.or]:[
                            {storeId: {[Op.like]:`%${search}%`}},
                            {date: {[Op.like]:`%${search}%`}},
                            {name: {[Op.like]:`%${search}%`}},
                            {noPeople: {[Op.like]:`%${search}%`}},
                            {mobile: {[Op.like]:`%${search}%`}},
                            {massage: {[Op.like]:`%${search}%`}},
                            {purpose: {[Op.like]:`%${search}%`}},
                            {status: {[Op.like]:`%${search}%`}}								
                        ],                            
                    } });
                }

                let arrData =[];
                if(reservationsList){
                    for(let reservations of reservationsList){

                        let data = reservations.dataValues;

                        let storeList = await models.stores.findAll({attributes:['id','storeName','storeCode'],where:{ id: reservations.storeId}});
                        if(storeList.length>0){
                        data.storeName = storeList[0].storeName
                        }else{
                            data.storeName = ''
                        }

                        let reservationTime = await models.reservationTimeSlot.findAll({attributes:['id','fromTime','toTime'],where:{ id: reservations.timeId}});
                        if(reservationTime.length>0){
                        data.timeId = reservationTime[0].fromTime + ' to ' + reservationTime[0].toTime
                        }else{
                            data.timeId = ''
                        }
                        arrData.push(data)
                    }
                }  
                
                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Feedbacks");
            
                worksheet.columns = [
                    { header: "Date", key: "date", width: 12 },
                    { header: "Time", key: "timeId", width: 12 },
                    { header: "Name", key: "name", width: 12 },
                    { header: "No OfPeople", key: "noPeople", width: 12 },
                    { header: "Mobile", key: "mobile", width: 12 },
                    { header: "Massage", key: "massage", width: 12 },
                    { header: "Purpose", key: "purpose", width: 12 },
                    { header: "Status", key: "status", width: 15 },
                ];
                // Add Array Rows
                worksheet.addRows(arrData);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Reservations.xlsx"
                )
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })
                       
            }
            
        }	
    });
}