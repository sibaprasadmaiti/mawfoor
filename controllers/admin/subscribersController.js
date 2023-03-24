const models = require("../../models");
const multiparty = require('multiparty'); 
const flash = require('connect-flash');
const jwt = require('jsonwebtoken');
const SECRET = 'nodescratch';
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const excel = require("exceljs");


/**
 * Description: This function is developed for listing Subscribers
 * Developer: Partha Mandal
 */
exports.list = async function(req, res){
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    var token= req.session.token;

    let column = req.query.column || 'id';
    let order = req.query.order || 'ASC';
    let pagesizes = req.query.pagesize || 10;
    let pageSize = parseInt(pagesizes);
    let page = req.params.page || 1;
    let search = req.query.search || '';
    let email = req.query.email || '';
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
			var storeList = await models.stores.findAll({attributes:['id','storeName']});

            if (sessionStoreId == null) {
                let whereCondition

                if (email !='' && status =='' && fdate =='' && tdate =='') {
                    whereCondition = {email:email}
                }else if(fdate !='' && email =='' && status =='' && tdate ==''){
                    whereCondition = {createdAt: {$gte: start}}
                }else if(fdate =='' && email =='' && status =='' && tdate !=''){
                    whereCondition = {createdAt: {$lte: end}}
                }else if(status !='' && fdate =='' && email =='' && tdate ==''){
                    whereCondition = {status:status}
                }else if(email!='' && status !='' && fdate =='' && tdate ==''){
                    whereCondition = {email:email,status:status}
                }else if(email!='' && fdate !='' && status =='' && tdate ==''){
                    whereCondition = {email:email,createdAt:{$gte: start}}
                }else if(email!='' && fdate =='' && status =='' && tdate !=''){
                    whereCondition = {email:email,createdAt:{$lte: end}}
                }else if(fdate!='' && status !='' && email =='' && tdate ==''){
                    whereCondition = {createdAt:{$gte: start},status:status}
                }else if(fdate=='' && status !='' && email =='' && tdate !=''){
                    whereCondition = {createdAt:{$lte: end},status:status}
                }else if(fdate!='' && status =='' && email =='' && tdate !=''){
                    whereCondition = {createdAt:{$gte: start, $lte: end}}
                }else if(email !='' && status !='' && fdate !='' && tdate ==''){
                    whereCondition = {email:email,status:status,createdAt:{$gte: start}}
                }else if(email !='' && status =='' && fdate !='' && tdate !=''){
                    whereCondition = {email:email,createdAt:{$gte: start, $lte: end}}
                }else if(email =='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {status:status,createdAt:{$gte: start, $lte: end}}
                }else if(email !='' && status !='' && fdate =='' && tdate !=''){
                    whereCondition = {status:status,email:email,createdAt:{$lte: end}}
                }else if(email!='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {email:email,status:status, createdAt:{$gte: start, $lte: end}}
                }

                let subscribers = await models.subscribers.findAll({attributes:['email']})
                let subscribersList
                let listCount

                if(email!='' || status !='' || fdate !='' || tdate !=''){
                    subscribersList = await models.subscribers.findAll({ where: whereCondition , order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                    listCount = await models.subscribers.count({ where: whereCondition})
                }else{
                    subscribersList = await models.subscribers.findAll({ where: { email: {[Op.like]:`%${search}%`} }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize })
                    
                    listCount = await models.subscribers.count({ where: { email: {[Op.like]:`%${search}%`} }})
                }

                let pageCount = Math.ceil(listCount/pageSize);
    
                if(subscribersList){
                    return res.render('admin/subscribers/list', {
                        title: 'Subscriber List',
                        arrData: subscribersList,
                        storeList: storeList,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                        listCount: listCount,
                        pageCount: pageCount,
                        subscribers: subscribers,
                        columnName: column,
                        orderType: order,
                        emailFilter: email,
                        fdateFilter: fdate,
                        tdateFilter: tdate,
                        statusFilter: status,
                        searchItem: search,
                        pageSize: pageSize,
                        currentPage: parseInt(page),
                    })
                } else {
                    return res.render('admin/subscribers/list', {
                        title: 'Subscriber List',
                        arrData: '',
                        storeList: storeList,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                        listCount: listCount,
                        subscribers: [],
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        emailFilter: email,
                        fdateFilter: fdate,
                        tdateFilter: tdate,
                        statusFilter: status,
                        searchItem: search,
                        pageSize: pageSize,
                        currentPage: parseInt(page),
                    }); 
                }               
            } else {
                //*****Permission Assign Start
                var userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'SubscriberList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {

                    let whereCondition
                    if (email !='' && status =='' && fdate =='' && tdate =='') {
                        whereCondition = {email:email, storeId: sessionStoreId}
                    }else if(fdate !='' && email =='' && status =='' && tdate ==''){
                        whereCondition = {createdAt: {$gte: start}, storeId: sessionStoreId}
                    }else if(fdate =='' && email =='' && status =='' && tdate !=''){
                        whereCondition = {createdAt: {$lte: end}, storeId: sessionStoreId}
                    }else if(status !='' && fdate =='' && email =='' && tdate ==''){
                        whereCondition = {status:status, storeId: sessionStoreId}
                    }else if(email!='' && status !='' && fdate =='' && tdate ==''){
                        whereCondition = {email:email,status:status, storeId: sessionStoreId}
                    }else if(email!='' && fdate !='' && status =='' && tdate ==''){
                        whereCondition = {email:email,createdAt:{$gte: start}, storeId: sessionStoreId}
                    }else if(email!='' && fdate =='' && status =='' && tdate !=''){
                        whereCondition = {email:email,createdAt:{$lte: end}, storeId: sessionStoreId}
                    }else if(fdate!='' && status !='' && email =='' && tdate ==''){
                        whereCondition = {createdAt:{$gte: start},status:status, storeId: sessionStoreId}
                    }else if(fdate=='' && status !='' && email =='' && tdate !=''){
                        whereCondition = {createdAt:{$lte: end},status:status, storeId: sessionStoreId}
                    }else if(fdate!='' && status =='' && email =='' && tdate !=''){
                        whereCondition = {createdAt:{$gte: start, $lte: end}, storeId: sessionStoreId}
                    }else if(email !='' && status !='' && fdate !='' && tdate ==''){
                        whereCondition = {email:email,status:status,createdAt:{$gte: start}, storeId: sessionStoreId}
                    }else if(email !='' && status =='' && fdate !='' && tdate !=''){
                        whereCondition = {email:email,createdAt:{$gte: start, $lte: end}, storeId: sessionStoreId}
                    }else if(email =='' && status !='' && fdate !='' && tdate !=''){
                        whereCondition = {status:status,createdAt:{$gte: start, $lte: end}, storeId: sessionStoreId}
                    }else if(email !='' && status !='' && fdate =='' && tdate !=''){
                        whereCondition = {status:status,email:email,createdAt:{$lte: end}, storeId: sessionStoreId}
                    }else if(email!='' && status !='' && fdate !='' && tdate !=''){
                        whereCondition = {email:email,status:status, createdAt:{$gte: start, $lte: end}, storeId: sessionStoreId}
                    }

                    let subscribers = await models.subscribers.findAll({attributes:['email'], storeId: sessionStoreId})
                    let subscribersList
                    let listCount

                    if(email!='' || status !='' || fdate !='' || tdate !=''){
                        subscribersList = await models.subscribers.findAll({ where: whereCondition , order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize })

                        listCount = await models.subscribers.count({ where: whereCondition})
                    }else{
                        subscribersList = await models.subscribers.findAll({ where: { email: {[Op.like]:`%${search}%`}, storeId: sessionStoreId }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize })

                        listCount = await models.subscribers.count({ where: { email: {[Op.like]:`%${search}%`}, storeId: sessionStoreId }})
                    }

                    let pageCount = Math.ceil(listCount/pageSize);
        
                    if(subscribersList){
                        return res.render('admin/subscribers/list', {
                            title: 'Subscriber List',
                            arrData: subscribersList,
                            storeList: storeList,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            listCount: listCount,
                            pageCount: pageCount,
                            columnName: column,
                            orderType: order,
                            searchItem: search,
                            emailFilter: email,
                            fdateFilter: fdate,
                            tdateFilter: tdate,
                            statusFilter: status,
                            subscribers: subscribers,
                            pageSize: pageSize,
                            currentPage: parseInt(page),
                        })
                    } else {
                        return res.render('admin/subscribers/list', {
                            title: 'Subscriber List',
                            arrData: '',
                            storeList: storeList,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            listCount: listCount,
                            subscribers: [],
                            pageCount: pageCount,
                            columnName: column,
                            orderType: order,
                            emailFilter: email,
                            fdateFilter: fdate,
                            tdateFilter: tdate,
                            statusFilter: status,
                            searchItem: search,
                            pageSize: pageSize,
                            currentPage: parseInt(page),
                        }); 
                    }                     
                }          
            }
            
        }	
    });
}

/**
 * Description: This function is developed for Update Status Subscribers
 * Developer: Ramchandra Jana
 */
exports.update = async function(req, res) {
    var sessionStoreId = req.session.user.storeId;
    var token= req.session.token;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            var subscriber_id = req.body.subscriber_id;
            var status = req.body.status;
            if(subscriber_id != '' && status != '') {
                await models.subscribers.update({
                    status:status
                },{where:{id:subscriber_id}}).then(function(affected_rows) {
                    if(affected_rows > 0) {
                        req.flash('info','Subscribe status updated successfully');
                        return res.redirect('back');
                    } else {
                        req.flash('errors','Failed to update subscriber status! Please try again');
                        return res.redirect('back');
                    }
                }).catch(function(error) {
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
 * Description: This function is developed for Delete Subscribers
 * Developer: Partha Mandal
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
                        return permission === 'SubscriberDelete'
                    })
                }
                var storeIdChecking = await models.subscribers.findOne({attributes:['storeId'],where:{id:id}});
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
                models.subscribers.destroy({ 
                    where:{id:id}
                }).then(function(value) {
                    if(value) {
                        req.flash('info','Successfully deleted');
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

/**
 * Description: This function is developed for Subscriber export 
 * Developer: Partha Mandal
*/
exports.exportData = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    let search = req.query.search || '';
    let email = req.query.email || '';
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
        }else{
            if (sessionStoreId == null) {

                if (email !='' && status =='' && fdate =='' && tdate =='') {
                    whereCondition = {email:email}
                }else if(fdate !='' && email =='' && status =='' && tdate ==''){
                    whereCondition = {createdAt: {$gte: start}}
                }else if(fdate =='' && email =='' && status =='' && tdate !=''){
                    whereCondition = {createdAt: {$lte: end}}
                }else if(status !='' && fdate =='' && email =='' && tdate ==''){
                    whereCondition = {status:status}
                }else if(email!='' && status !='' && fdate =='' && tdate ==''){
                    whereCondition = {email:email,status:status}
                }else if(email!='' && fdate !='' && status =='' && tdate ==''){
                    whereCondition = {email:email,createdAt:{$gte: start}}
                }else if(email!='' && fdate =='' && status =='' && tdate !=''){
                    whereCondition = {email:email,createdAt:{$lte: end}}
                }else if(fdate!='' && status !='' && email =='' && tdate ==''){
                    whereCondition = {createdAt:{$gte: start},status:status}
                }else if(fdate=='' && status !='' && email =='' && tdate !=''){
                    whereCondition = {createdAt:{$lte: end},status:status}
                }else if(fdate!='' && status =='' && email =='' && tdate !=''){
                    whereCondition = {createdAt:{$gte: start, $lte: end}}
                }else if(email !='' && status !='' && fdate !='' && tdate ==''){
                    whereCondition = {email:email,status:status,createdAt:{$gte: start}}
                }else if(email !='' && status =='' && fdate !='' && tdate !=''){
                    whereCondition = {email:email,createdAt:{$gte: start, $lte: end}}
                }else if(email =='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {status:status,createdAt:{$gte: start, $lte: end}}
                }else if(email !='' && status !='' && fdate =='' && tdate !=''){
                    whereCondition = {status:status,email:email,createdAt:{$lte: end}}
                }else if(email!='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {email:email,status:status, createdAt:{$gte: start, $lte: end}}
                }

                let subscribersList

                if(email!='' || status !='' || fdate !='' || tdate !=''){
                    subscribersList = await models.subscribers.findAll({ where: whereCondition});
                }else{
                    subscribersList = await models.subscribers.findAll({ where: { email: {[Op.like]:`%${search}%`} }})
                }
                

                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Subscribers");
            
                worksheet.columns = [
                    { header: "Email", key: "email", width:25 },
                    { header: "Status", key: "status", width: 15 },
                    { header: "Date", key: "createdAt", width: 15 },
                ];
            
                // Add Array Rows
                worksheet.addRows(subscribersList);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Subscribers.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })


            }else{

                let whereCondition
                if (email !='' && status =='' && fdate =='' && tdate =='') {
                    whereCondition = {email:email, storeId: sessionStoreId}
                }else if(fdate !='' && email =='' && status =='' && tdate ==''){
                    whereCondition = {createdAt: {$gte: start}, storeId: sessionStoreId}
                }else if(fdate =='' && email =='' && status =='' && tdate !=''){
                    whereCondition = {createdAt: {$lte: end}, storeId: sessionStoreId}
                }else if(status !='' && fdate =='' && email =='' && tdate ==''){
                    whereCondition = {status:status, storeId: sessionStoreId}
                }else if(email!='' && status !='' && fdate =='' && tdate ==''){
                    whereCondition = {email:email,status:status, storeId: sessionStoreId}
                }else if(email!='' && fdate !='' && status =='' && tdate ==''){
                    whereCondition = {email:email,createdAt:{$gte: start}, storeId: sessionStoreId}
                }else if(email!='' && fdate =='' && status =='' && tdate !=''){
                    whereCondition = {email:email,createdAt:{$lte: end}, storeId: sessionStoreId}
                }else if(fdate!='' && status !='' && email =='' && tdate ==''){
                    whereCondition = {createdAt:{$gte: start},status:status, storeId: sessionStoreId}
                }else if(fdate=='' && status !='' && email =='' && tdate !=''){
                    whereCondition = {createdAt:{$lte: end},status:status, storeId: sessionStoreId}
                }else if(fdate!='' && status =='' && email =='' && tdate !=''){
                    whereCondition = {createdAt:{$gte: start, $lte: end}, storeId: sessionStoreId}
                }else if(email !='' && status !='' && fdate !='' && tdate ==''){
                    whereCondition = {email:email,status:status,createdAt:{$gte: start}, storeId: sessionStoreId}
                }else if(email !='' && status =='' && fdate !='' && tdate !=''){
                    whereCondition = {email:email,createdAt:{$gte: start, $lte: end}, storeId: sessionStoreId}
                }else if(email =='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {status:status,createdAt:{$gte: start, $lte: end}, storeId: sessionStoreId}
                }else if(email !='' && status !='' && fdate =='' && tdate !=''){
                    whereCondition = {status:status,email:email,createdAt:{$lte: end}, storeId: sessionStoreId}
                }else if(email!='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {email:email,status:status, createdAt:{$gte: start, $lte: end}, storeId: sessionStoreId}
                }

                let subscribersList

                if(email!='' || status !='' || fdate !='' || tdate !=''){
                    subscribersList = await models.subscribers.findAll({ where: whereCondition});
                }else{
                    subscribersList = await models.subscribers.findAll({ where: { email: {[Op.like]:`%${search}%`}, storeId: sessionStoreId} })
                }
                

                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Subscribers");
            
                worksheet.columns = [
                    { header: "Email", key: "email", width:25 },
                    { header: "Status", key: "status", width: 15 },
                    { header: "Date", key: "createdAt", width: 15 },
                ];
            
                // Add Array Rows
                worksheet.addRows(subscribersList);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Subscribers.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })
                    
            }            
        }	
    });
}