const models = require('../../models');
const jwt = require('jsonwebtoken');
const SECRET = 'nodescratch';
const excel = require("exceljs");
const PDFDocument  = require("pdfkit");
const Sequelize = require("sequelize");
const Op = Sequelize.Op
/**
 * This function is developed for listing Customer Report
 * Developer: Partha Mandal
 */
exports.list = async (req, res) => {
    let token= req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
    let column = req.query.column || 'id';
    let order = req.query.order || 'ASC';
    let pagesizes = req.query.pagesize || 10;
    let pageSize = parseInt(pagesizes);
    let page = req.params.page || 1;
    let search = req.query.search || '';
    let customer = req.query.customer || '';
    let fdate = req.query.fdate || '';
    let tdate = req.query.tdate || '';
    let status = req.query.status || '';

    const start = new Date(fdate)
    start.setHours(0,0,0,0)
    const end = new Date(tdate)
    end.setHours(23,59,59,999)
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null || sessionStoreId == '') {
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                let customerName = await models.customers.findAll({attributes:['id','firstName','lastName']})

                let whereCondition
                if (customer !='' && status =='' && fdate =='' && tdate =='') {
                    whereCondition = {id:customer}
                }else if(fdate !='' && customer =='' && status =='' && tdate ==''){
                    whereCondition = {createdAt: {$gte: start}}
                }else if(fdate =='' && customer =='' && status =='' && tdate !=''){
                    whereCondition = {createdAt: {$lte: end}}
                }else if(status !='' && fdate =='' && customer =='' && tdate ==''){
                    whereCondition = {status:status}
                }else if(customer!='' && status !='' && fdate =='' && tdate ==''){
                    whereCondition = {id:customer,status:status}
                }else if(customer!='' && fdate !='' && status =='' && tdate ==''){
                    whereCondition = {id:customer,createdAt:{$gte: start}}
                }else if(customer!='' && fdate =='' && status =='' && tdate !=''){
                    whereCondition = {id:customer,createdAt:{$lte: end}}
                }else if(fdate!='' && status !='' && customer =='' && tdate ==''){
                    whereCondition = {createdAt:{$gte: start},status:status}
                }else if(fdate=='' && status !='' && customer =='' && tdate !=''){
                    whereCondition = {createdAt:{$lte: end},status:status}
                }else if(fdate!='' && status =='' && customer =='' && tdate !=''){
                    whereCondition = {createdAt:{$gte: start, $lte: end}}
                }else if(customer !='' && status !='' && fdate !='' && tdate ==''){
                    whereCondition = {id:customer,status:status,createdAt:{$gte: start}}
                }else if(customer !='' && status =='' && fdate !='' && tdate !=''){
                    whereCondition = {id:customer,createdAt:{$gte: start, $lte: end}}
                }else if(customer =='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {status:status,createdAt:{$gte: start, $lte: end}}
                }else if(customer !='' && status !='' && fdate =='' && tdate !=''){
                    whereCondition = {status:status,id:customer,createdAt:{$lte: end}}
                }else if(customer!='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {id:customer,status:status, createdAt:{$gte: start, $lte: end}}
                }

                let customers
                let listCount

                if(customer!='' || status !='' || fdate !='' || tdate !=''){
                    customers = await models.customers.findAll({ attributes: ['id','storeId', 'firstName', 'lastName', 'status', 'email', 'mobile', 'gender'], where: whereCondition , order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                    listCount = await models.customers.count({ where: whereCondition});
                }else{
                    customers = await models.customers.findAll({ attributes: ['id','storeId', 'firstName', 'lastName', 'status', 'email', 'mobile', 'gender'], where: {
                        [Op.or]: [
                            { firstName: { [Op.like]: `%${search}%` } },
                            { lastName: { [Op.like]: `%${search}%` } },
                            { email: { [Op.like]: `%${search}%` } },
                            { mobile: { [Op.like]: `%${search}%` } },
                            { gender: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                    }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize})
    
                    listCount = await models.customers.count({where: {
                        [Op.or]: [
                            { firstName: { [Op.like]: `%${search}%` } },
                            { lastName: { [Op.like]: `%${search}%` } },
                            { email: { [Op.like]: `%${search}%` } },
                            { mobile: { [Op.like]: `%${search}%` } },
                            { gender: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                    }})
                }
                

                let pageCount = Math.ceil(listCount/pageSize);
                var arrData = [];
                if (customers) {
                    for(let customer of customers){
                        var address = await models.customerAddresses.findOne({ attributes: ['id', 'customerId', 'address', 'locality', 'city', 'state', 'pin', 'country'], where: { customerId: customer.id}});

                        let cs = customer.dataValues;
                        if(address){
                            cs.address = address.dataValues.address;
                            cs.locality = address.dataValues.locality;
                            cs.city = address.dataValues.city;
                            cs.state = address.dataValues.state;
                            cs.pin = address.dataValues.pin;
                            cs.country = address.dataValues.country;
                        }
                        arrData.push(cs)
                    }
                    return res.render('admin/customersreport/list', {
                        title: 'Customers Report List',
                        arrData: arrData,
                        storeList: storeList,
                        customerName:customerName,
                        sessionStoreId: '',
                        listCount: listCount,
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        searchItem: search,
                        pageSize: pageSize,
                        currentPage: parseInt(page),
                        customerFilter: customer,
                        fdateFilter: fdate,
                        tdateFilter: tdate,
                        statusFilter: status,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } else {
                    return res.render('admin/customersreport/list', {
                        title: 'Customers Report List',
                        arrData: '',
                        storeList: '',
                        sessionStoreId: '',
                        customerName:customerName,
                        customerFilter: customer,
                        fdateFilter: fdate,
                        tdateFilter: tdate,
                        statusFilter: status,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                }
            }else{
                let userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'CustomersReportList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });
                    let customerName = await models.customers.findAll({attributes:['id','firstName','lastName'],where:{storeId: sessionStoreId}})

                    let whereCondition
                    if (customer !='' && status =='' && fdate =='' && tdate =='') {
                        whereCondition = {id:customer,storeId: sessionStoreId}
                    }else if(fdate !='' && customer =='' && status =='' && tdate ==''){
                        whereCondition = {createdAt: {$gte: start},storeId: sessionStoreId}
                    }else if(fdate =='' && customer =='' && status =='' && tdate !=''){
                        whereCondition = {createdAt: {$lte: end},storeId: sessionStoreId}
                    }else if(status !='' && fdate =='' && customer =='' && tdate ==''){
                        whereCondition = {status:status,storeId: sessionStoreId}
                    }else if(customer!='' && status !='' && fdate =='' && tdate ==''){
                        whereCondition = {id:customer,status:status,storeId: sessionStoreId}
                    }else if(customer!='' && fdate !='' && status =='' && tdate ==''){
                        whereCondition = {id:customer,createdAt:{$gte: start},storeId: sessionStoreId}
                    }else if(customer!='' && fdate =='' && status =='' && tdate !=''){
                        whereCondition = {id:customer,createdAt:{$lte: end},storeId: sessionStoreId}
                    }else if(fdate!='' && status !='' && customer =='' && tdate ==''){
                        whereCondition = {createdAt:{$gte: start},status:status,storeId: sessionStoreId}
                    }else if(fdate=='' && status !='' && customer =='' && tdate !=''){
                        whereCondition = {createdAt:{$lte: end},status:status,storeId: sessionStoreId}
                    }else if(fdate!='' && status =='' && customer =='' && tdate !=''){
                        whereCondition = {createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }else if(customer !='' && status !='' && fdate !='' && tdate ==''){
                        whereCondition = {id:customer,status:status,createdAt:{$gte: start},storeId: sessionStoreId}
                    }else if(customer !='' && status =='' && fdate !='' && tdate !=''){
                        whereCondition = {id:customer,createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }else if(customer =='' && status !='' && fdate !='' && tdate !=''){
                        whereCondition = {status:status,createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }else if(customer !='' && status !='' && fdate =='' && tdate !=''){
                        whereCondition = {status:status,id:customer,createdAt:{$lte: end},storeId: sessionStoreId}
                    }else if(customer!='' && status !='' && fdate !='' && tdate !=''){
                        whereCondition = {id:customer,status:status, createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                    }

                    let customers
                    let listCount

                    if(customer!='' || status !='' || fdate !='' || tdate !=''){
                        customers = await models.customers.findAll({ attributes: ['id','storeId', 'firstName', 'lastName', 'status', 'email', 'mobile', 'gender'], where: whereCondition , order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
    
                        listCount = await models.customers.count({ where: whereCondition});
                    }else{
                        customers = await models.customers.findAll({ attributes: ['id','storeId', 'firstName', 'lastName', 'status', 'email', 'mobile', 'gender'], where: {storeId: sessionStoreId,
                            [Op.or]: [
                                { firstName: { [Op.like]: `%${search}%` } },
                                { lastName: { [Op.like]: `%${search}%` } },
                                { email: { [Op.like]: `%${search}%` } },
                                { mobile: { [Op.like]: `%${search}%` } },
                                { gender: { [Op.like]: `%${search}%` } },
                                { status: { [Op.like]: `%${search}%` } }
                            ]
                        }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize})
        
                        listCount = await models.customers.count({where: {storeId: sessionStoreId,
                            [Op.or]: [
                                { firstName: { [Op.like]: `%${search}%` } },
                                { lastName: { [Op.like]: `%${search}%` } },
                                { email: { [Op.like]: `%${search}%` } },
                                { mobile: { [Op.like]: `%${search}%` } },
                                { gender: { [Op.like]: `%${search}%` } },
                                { status: { [Op.like]: `%${search}%` } }
                            ]
                        }})
                    }

                    let pageCount = Math.ceil(listCount/pageSize);
                    var arrData = [];
                    if (customers) {
                        for(let customer of customers){
                            var address = await models.customerAddresses.findOne({ attributes: ['id', 'customerId', 'address', 'locality', 'city', 'state', 'pin', 'country'], where: { customerId: customer.id}});

                            let cs = customer.dataValues;
                            if(address){
                                cs.address = address.dataValues.address;
                                cs.locality = address.dataValues.locality;
                                cs.city = address.dataValues.city;
                                cs.state = address.dataValues.state;
                                cs.pin = address.dataValues.pin;
                                cs.country = address.dataValues.country;
                            }
                            arrData.push(cs)
                        }
                        return res.render('admin/customersreport/list', {
                            title: 'Customers Report List',
                            arrData: arrData,
                            storeList: storeList,
                            sessionStoreId: sessionStoreId,
                            customerName:customerName,
                            listCount: listCount,
                            pageCount: pageCount,
                            pageSize: pageSize,
                            columnName: column,
                            orderType: order,
                            searchItem: search,
                            currentPage: parseInt(page),
                            customerFilter: customer,
                            fdateFilter: fdate,
                            tdateFilter: tdate,
                            statusFilter: status,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                        });
                    } else {
                        return res.render('admin/customersreport/list', {
                            title: 'Customers Report List',
                            arrData: '',
                            storeList: '',
                            sessionStoreId: sessionStoreId,
                            customerName:customerName,
                            customerFilter: customer,
                            fdateFilter: fdate,
                            tdateFilter: tdate,
                            statusFilter: status,
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
 * This function is developed for Export Customer Report
 * Developer: Partha Mandal
 */

// exports.downloadCsv = async (req, res) => {
//     let token= req.session.token;
//     let sessionStoreId = req.session.user.storeId;
//     jwt.verify(token, SECRET, async (err, decoded) => {
//         if (err) {
//             req.flash("info", "Invalid Token");
//             res.redirect('/auth/signin');
//         }else{
//             if (sessionStoreId == null || sessionStoreId == '') {
//                 let customers = await models.customers.findAll({ attributes: ['id', 'firstName', 'lastName', 'email', 'mobile', 'gender']});

//                 let arrData = [];
//                 if (customers) {
//                     for(let customer of customers){
//                         var address = await models.customerAddresses.findOne({ attributes: ['address', 'locality', 'city', 'state', 'pin', 'country'], where: { customerId: customer.id, isPrimary: 'yes' }});

//                         let cs = customer.dataValues;
//                         if(address){
//                             cs.address = address.dataValues.address;
//                             cs.locality = address.dataValues.locality;
//                             cs.city = address.dataValues.city;
//                             cs.state = address.dataValues.state;
//                             cs.pin = address.dataValues.pin;
//                             cs.country = address.dataValues.country;
//                         }
//                         arrData.push(cs)
//                     }
//                 }

//                 let workbook = new excel.Workbook();
//                 let worksheet = workbook.addWorksheet("Custmer Report");
            
//                 worksheet.columns = [
//                     { header: "Id", key: "id", width: 10 },
//                     { header: "First Name", key: "firstName", width:15 },
//                     { header: "Last Name", key: "lastName", width: 15 },
//                     { header: "Email", key: "email", width: 20 },
//                     { header: "Mobile No", key: "mobile", width: 15 },
//                     { header: "Gender", key: "gender", width: 15 },
//                     { header: "Address", key: "address", width: 15 },
//                     { header: "Locality", key: "locality", width: 15 },
//                     { header: "City", key: "city", width: 15 },
//                     { header: "State", key: "state", width: 15 },
//                     { header: "Pin Code", key: "pin", width: 15 },
//                     { header: "Country", key: "country", width: 15 }
//                 ];
            
//                 // Add Array Rows
//                 worksheet.addRows(arrData);
            
//                 res.setHeader(
//                     "Content-Type",
//                     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//                 );
//                 res.setHeader(
//                     "Content-Disposition",
//                     "attachment; filename=" + "Custmer Report.xlsx"
//                 );
            
//                 return workbook.xlsx.write(res).then(() => {
//                     res.status(200).end();
//                 });

//             }else{

//                 let customers = await models.customers.findAll({ attributes: ['id', 'firstName', 'lastName', 'email', 'mobile', 'gender'], where: {storeId: sessionStoreId}});

//                 let arrData = [];
//                 if (customers) {
//                     for(let customer of customers){
//                         var address = await models.customerAddresses.findOne({ attributes: ['address', 'locality', 'city', 'state', 'pin', 'country'], where: { customerId: customer.id, isPrimary: 'yes' }});

//                         let cs = customer.dataValues;
//                         if(address){
//                             cs.address = address.dataValues.address;
//                             cs.locality = address.dataValues.locality;
//                             cs.city = address.dataValues.city;
//                             cs.state = address.dataValues.state;
//                             cs.pin = address.dataValues.pin;
//                             cs.country = address.dataValues.country;
//                         }
//                         arrData.push(cs)
//                     }
//                 }
                      
//                 let workbook = new excel.Workbook();
//                 let worksheet = workbook.addWorksheet("Custmer Report");
            
//                 worksheet.columns = [
//                     { header: "Id", key: "id", width: 10 },
//                     { header: "First Name", key: "firstName", width:15 },
//                     { header: "Last Name", key: "lastName", width: 15 },
//                     { header: "Email", key: "email", width: 20 },
//                     { header: "Mobile No", key: "mobile", width: 15 },
//                     { header: "Gender", key: "gender", width: 15 },
//                     { header: "Address", key: "address", width: 15 },
//                     { header: "Locality", key: "locality", width: 15 },
//                     { header: "City", key: "city", width: 15 },
//                     { header: "State", key: "state", width: 15 },
//                     { header: "Pin Code", key: "pin", width: 15 },
//                     { header: "Country", key: "country", width: 15 }
//                 ];
            
//                 // Add Array Rows
//                 worksheet.addRows(arrData);
            
//                 res.setHeader(
//                     "Content-Type",
//                     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//                 );
//                 res.setHeader(
//                     "Content-Disposition",
//                     "attachment; filename=" + "Custmer Report.xlsx"
//                 );
            
//                 return workbook.xlsx.write(res).then(() => {
//                     res.status(200).end();
//                 });
//             }            
//         }	
//     });
// }

exports.downloadCsv = async (req, res) => {
    let token= req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let search = req.query.search || '';
    let customer = req.query.customer || '';
    let fdate = req.query.fdate || '';
    let tdate = req.query.tdate || '';
    let status = req.query.status || '';
    const start = new Date(fdate)
    start.setHours(0,0,0,0)
    const end = new Date(tdate)
    end.setHours(23,59,59,999)
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null || sessionStoreId == '') {

                let whereCondition
                if (customer !='' && status =='' && fdate =='' && tdate =='') {
                    whereCondition = {id:customer}
                }else if(fdate !='' && customer =='' && status =='' && tdate ==''){
                    whereCondition = {createdAt: {$gte: start}}
                }else if(fdate =='' && customer =='' && status =='' && tdate !=''){
                    whereCondition = {createdAt: {$lte: end}}
                }else if(status !='' && fdate =='' && customer =='' && tdate ==''){
                    whereCondition = {status:status}
                }else if(customer!='' && status !='' && fdate =='' && tdate ==''){
                    whereCondition = {id:customer,status:status}
                }else if(customer!='' && fdate !='' && status =='' && tdate ==''){
                    whereCondition = {id:customer,createdAt:{$gte: start}}
                }else if(customer!='' && fdate =='' && status =='' && tdate !=''){
                    whereCondition = {id:customer,createdAt:{$lte: end}}
                }else if(fdate!='' && status !='' && customer =='' && tdate ==''){
                    whereCondition = {createdAt:{$gte: start},status:status}
                }else if(fdate=='' && status !='' && customer =='' && tdate !=''){
                    whereCondition = {createdAt:{$lte: end},status:status}
                }else if(fdate!='' && status =='' && customer =='' && tdate !=''){
                    whereCondition = {createdAt:{$gte: start, $lte: end}}
                }else if(customer !='' && status !='' && fdate !='' && tdate ==''){
                    whereCondition = {id:customer,status:status,createdAt:{$gte: start}}
                }else if(customer !='' && status =='' && fdate !='' && tdate !=''){
                    whereCondition = {id:customer,createdAt:{$gte: start, $lte: end}}
                }else if(customer =='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {status:status,createdAt:{$gte: start, $lte: end}}
                }else if(customer !='' && status !='' && fdate =='' && tdate !=''){
                    whereCondition = {status:status,id:customer,createdAt:{$lte: end}}
                }else if(customer!='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {id:customer,status:status, createdAt:{$gte: start, $lte: end}}
                }

                let customers

                if(customer!='' || status !='' || fdate !='' || tdate !=''){
                    customers = await models.customers.findAll({ attributes: ['id','storeId', 'firstName', 'lastName', 'status', 'email', 'mobile', 'gender'], where: whereCondition})
                }else{
                    customers = await models.customers.findAll({ attributes: ['id','storeId', 'firstName', 'lastName', 'status', 'email', 'mobile', 'gender'], where: {
                        [Op.or]: [
                            { firstName: { [Op.like]: `%${search}%` } },
                            { lastName: { [Op.like]: `%${search}%` } },
                            { email: { [Op.like]: `%${search}%` } },
                            { mobile: { [Op.like]: `%${search}%` } },
                            { gender: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                    }})
                }
                
                let arrData = [];
                if (customers) {
                    for(let customer of customers){
                        const address = await models.customerAddresses.findOne({ attributes: ['id', 'customerId', 'address', 'locality', 'city', 'state', 'pin', 'country'], where: { customerId: customer.id}})

                        const amountPaid = await models.orders.findAll({attributes: ['id','amountPaid'], where: {customerId: customer.id}})

                        const lastOrder = await models.orders.findOne({attributes: ['id','createdAt'], where: {customerId: customer.id},order: [['id', 'DESC']]})

                        let cs = customer.dataValues;
                        if(address){
                            cs.address = address.dataValues.address;
                            cs.locality = address.dataValues.locality;
                            cs.city = address.dataValues.city;
                            cs.state = address.dataValues.state;
                            cs.pin = address.dataValues.pin;
                            cs.country = address.dataValues.country;
                        }

                        let totalAmount = 0
                        if(amountPaid.length > 0){
                            for(let amount of amountPaid){
                                totalAmount += parseInt(amount.dataValues.amountPaid)
                            }
                        }

                        let orderDate
                        if(lastOrder){
                            orderDate = lastOrder.dataValues.createdAt
                        }

                        cs.totalAmount = totalAmount
                        cs.orderDate = orderDate
                        arrData.push(cs)
                    }
                }

                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Custmer Report");
            
                worksheet.columns = [
                    { header: "First Name", key: "firstName", width:15 },
                    { header: "Last Name", key: "lastName", width: 15 },
                    { header: "Email", key: "email", width: 20 },
                    { header: "Mobile No", key: "mobile", width: 15 },
                    { header: "Gender", key: "gender", width: 10 },
                    { header: "Address", key: "address", width: 25 },
                    { header: "Locality", key: "locality", width: 15 },
                    { header: "City", key: "city", width: 15 },
                    { header: "State", key: "state", width: 15 },
                    { header: "Pin Code", key: "pin", width: 15 },
                    { header: "Country", key: "country", width: 15 },
                    { header: "Total Order Price", key: "totalAmount", width: 10 },
                    { header: "Last Order", key: "orderDate", width: 15 },
                ]
            
                // Add Array Rows
                worksheet.addRows(arrData)
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                )
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Custmer Report.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end()
                    return res.send('back')
                })

            }else{

                let whereCondition
                if (customer !='' && status =='' && fdate =='' && tdate =='') {
                    whereCondition = {id:customer,storeId: sessionStoreId}
                }else if(fdate !='' && customer =='' && status =='' && tdate ==''){
                    whereCondition = {createdAt: {$gte: start},storeId: sessionStoreId}
                }else if(fdate =='' && customer =='' && status =='' && tdate !=''){
                    whereCondition = {createdAt: {$lte: end},storeId: sessionStoreId}
                }else if(status !='' && fdate =='' && customer =='' && tdate ==''){
                    whereCondition = {status:status,storeId: sessionStoreId}
                }else if(customer!='' && status !='' && fdate =='' && tdate ==''){
                    whereCondition = {id:customer,status:status,storeId: sessionStoreId}
                }else if(customer!='' && fdate !='' && status =='' && tdate ==''){
                    whereCondition = {id:customer,createdAt:{$gte: start},storeId: sessionStoreId}
                }else if(customer!='' && fdate =='' && status =='' && tdate !=''){
                    whereCondition = {id:customer,createdAt:{$lte: end},storeId: sessionStoreId}
                }else if(fdate!='' && status !='' && customer =='' && tdate ==''){
                    whereCondition = {createdAt:{$gte: start},status:status,storeId: sessionStoreId}
                }else if(fdate=='' && status !='' && customer =='' && tdate !=''){
                    whereCondition = {createdAt:{$lte: end},status:status,storeId: sessionStoreId}
                }else if(fdate!='' && status =='' && customer =='' && tdate !=''){
                    whereCondition = {createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                }else if(customer !='' && status !='' && fdate !='' && tdate ==''){
                    whereCondition = {id:customer,status:status,createdAt:{$gte: start},storeId: sessionStoreId}
                }else if(customer !='' && status =='' && fdate !='' && tdate !=''){
                    whereCondition = {id:customer,createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                }else if(customer =='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {status:status,createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                }else if(customer !='' && status !='' && fdate =='' && tdate !=''){
                    whereCondition = {status:status,id:customer,createdAt:{$lte: end},storeId: sessionStoreId}
                }else if(customer!='' && status !='' && fdate !='' && tdate !=''){
                    whereCondition = {id:customer,status:status, createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                }

                let customers

                if(customer!='' || status !='' || fdate !='' || tdate !=''){
                    customers = await models.customers.findAll({ attributes: ['id','storeId', 'firstName', 'lastName', 'status', 'email', 'mobile', 'gender'], where: whereCondition});
                }else{
                    customers = await models.customers.findAll({ attributes: ['id','storeId', 'firstName', 'lastName', 'status', 'email', 'mobile', 'gender'], where: {storeId: sessionStoreId,
                        [Op.or]: [
                            { firstName: { [Op.like]: `%${search}%` } },
                            { lastName: { [Op.like]: `%${search}%` } },
                            { email: { [Op.like]: `%${search}%` } },
                            { mobile: { [Op.like]: `%${search}%` } },
                            { gender: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                    }})
                }

                let arrData = [];
                if (customers) {
                    for(let customer of customers){
                        const address = await models.customerAddresses.findOne({ attributes: ['id', 'customerId', 'address', 'locality', 'city', 'state', 'pin', 'country'], where: { customerId: customer.id}})

                        const amountPaid = await models.orders.findAll({attributes: ['id','amountPaid'], where: {customerId: customer.id}})

                        const lastOrder = await models.orders.findOne({attributes: ['id','createdAt'], where: {customerId: customer.id},order: [['id', 'DESC']]})

                        let cs = customer.dataValues;
                        if(address){
                            cs.address = address.dataValues.address;
                            cs.locality = address.dataValues.locality;
                            cs.city = address.dataValues.city;
                            cs.state = address.dataValues.state;
                            cs.pin = address.dataValues.pin;
                            cs.country = address.dataValues.country;
                        }

                        let totalAmount = 0
                        if(amountPaid.length > 0){
                            for(let amount of amountPaid){
                                totalAmount += parseInt(amount.dataValues.amountPaid)
                            }
                        }

                        let orderDate
                        if(lastOrder){
                            orderDate = lastOrder.dataValues.createdAt
                        }

                        cs.totalAmount = totalAmount
                        cs.orderDate = orderDate
                        arrData.push(cs)
                    }
                }

                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Custmer Report");
            
                worksheet.columns = [
                    { header: "First Name", key: "firstName", width:15 },
                    { header: "Last Name", key: "lastName", width: 15 },
                    { header: "Email", key: "email", width: 20 },
                    { header: "Mobile No", key: "mobile", width: 15 },
                    { header: "Gender", key: "gender", width: 10 },
                    { header: "Address", key: "address", width: 25 },
                    { header: "Locality", key: "locality", width: 15 },
                    { header: "City", key: "city", width: 15 },
                    { header: "State", key: "state", width: 15 },
                    { header: "Pin Code", key: "pin", width: 15 },
                    { header: "Country", key: "country", width: 15 },
                    { header: "Total Order Price", key: "totalAmount", width: 10 },
                    { header: "Last Order", key: "orderDate", width: 15 },
                ]
            
                // Add Array Rows
                worksheet.addRows(arrData)
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                )
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Custmer Report.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end()
                    return res.send('back')
                })          
            }            
        }	
    });
}

/**
 * This function is developed for download single Customer Report in PDF
 * Developer: Partha Mandal
 */
exports.downloadOne = async (req, res) => {
    let token= req.session.token;
    let id = req.params.id;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            const doc = new PDFDocument();
            let customers = await models.customers.findAll({ attributes: ['id', 'firstName', 'lastName', 'email', 'mobile', 'gender'], where: { id: id }});
            var result = [];
            if (customers) {
                for(let customer of customers){
                    const address = await models.customerAddresses.findOne({ attributes: ['address', 'locality', 'city', 'state', 'pin', 'country'], where: { customerId: customer.id, isPrimary: 'yes' }});
                    const amountPaid = await models.orders.findAll({attributes: ['id','amountPaid'], where: {customerId: customer.id}})

                    const lastOrder = await models.orders.findOne({attributes: ['id','createdAt'], where: {customerId: customer.id},order: [['id', 'DESC']]})
                    let cs = customer.dataValues;
                    if(address){
                        cs.address = address.dataValues.address;
                        cs.locality = address.dataValues.locality;
                        cs.city = address.dataValues.city;
                        cs.state = address.dataValues.state;
                        cs.pin = address.dataValues.pin;
                        cs.country = address.dataValues.country;
                    }

                    let totalAmount = 0
                    if(amountPaid.length > 0){
                        for(let amount of amountPaid){
                            totalAmount += parseInt(amount.dataValues.amountPaid)
                        }
                    }

                    let orderDate
                    if(lastOrder){
                        orderDate = new Date(lastOrder.dataValues.createdAt).toISOString().replace(/T/,' ').replace(/\..+/,' ')
                    }

                    cs.totalAmount = totalAmount
                    cs.orderDate =  orderDate
                    result.push(cs)
                }
            }

            if (result){
                const firstName   = result[0]['firstName'];
                const lastName    = result[0]['lastName'];
                const email       = result[0]['email'];
                const mobile      = result[0]['mobile'];
                const gender      = result[0]['gender'];
                const address     = result[0]['address'];
                const city         = result[0]['city'];
                const pin         = result[0]['pin'];
                const totalAmount     = result[0]['totalAmount'];
                const orderDate     = result[0]['orderDate'];

                let filename
                if(firstName && lastName){
                    filename = encodeURIComponent(firstName +' ' + lastName) + '.pdf';
                }
                if(firstName && !lastName){
                    filename = encodeURIComponent(firstName) + '.pdf';
                }
                if(!firstName && lastName){
                    filename = encodeURIComponent(lastName) + '.pdf';
                }
                if(!firstName && !lastName){
                    filename = encodeURIComponent('Customer Report') + '.pdf';
                }

                res.setHeader('Content-disposition', 'attachment; filename="' + filename +'"');
                res.setHeader('Content-type', 'application/pdf');

                if(firstName && lastName){
                    doc.font('Times-Roman', 18).fontSize(25).text(firstName + ' ' + lastName, 100, 50);
                }
                if(firstName && !lastName){
                    doc.font('Times-Roman', 18).fontSize(25).text(firstName, 100, 50);
                }
                if(!firstName && lastName){
                    doc.font('Times-Roman', 18).fontSize(25).text(lastName, 100, 50);
                }

                if(email){
                    doc.fontSize(15).fillColor('blue').text('Email Id : ', 100, 100);
                    doc.fontSize(15).fillColor('green').text(email, 200, 100);
                }
            
                if(mobile){
                    doc.fontSize(15).fillColor('blue').text('Mobile No : ', 100, 130);
                    doc.fontSize(15).fillColor('green').text(mobile, 200, 130);
                }

                if(gender){
                    doc.fontSize(15).fillColor('blue').text('Gender : ', 100, 160);
                    doc.fontSize(15).fillColor('green').text(gender, 200, 160);
                }
                if (address && city && pin) {
                    doc.fontSize(15).fillColor('blue').text('Address : ', 100, 190);
                    doc.fontSize(15).fillColor('green').text(address + ', ' + city + ', ' + pin, 200, 190);
                } else if(address && !city && !pin) {
                    doc.fontSize(15).fillColor('blue').text('Address : ', 100, 190);
                    doc.fontSize(15).fillColor('green').text(address , 200, 190);
                }else if(!address && city && !pin) {
                    doc.fontSize(15).fillColor('blue').text('Address : ', 100, 190);
                    doc.fontSize(15).fillColor('green').text(city, 200, 190);
                }else if(!address && !city && pin) {
                    doc.fontSize(15).fillColor('blue').text('Address : ', 100, 190);
                    doc.fontSize(15).fillColor('green').text(pin, 200, 190);
                }else if(address && city && !pin) {
                    doc.fontSize(15).fillColor('blue').text('Address : ', 100, 190);
                    doc.fontSize(15).fillColor('green').text(address + ', ' + city, 200, 190);
                }else if(address && !city && pin) {
                    doc.fontSize(15).fillColor('blue').text('Address : ', 100, 190);
                    doc.fontSize(15).fillColor('green').text(address + ', ' +pin, 200, 190);
                }else if(!address && city && pin) {
                    doc.fontSize(15).fillColor('blue').text('Address : ', 100, 190);
                    doc.fontSize(15).fillColor('green').text(city + ', ' +pin, 200, 190);
                }
                
                if(!address && !city && !pin){
                    doc.fontSize(15).fillColor('blue').text('Total Price : ', 100, 190);
                    doc.fontSize(15).fillColor('green').text(totalAmount, 200, 190);
                    if(orderDate){
                        doc.fontSize(15).fillColor('blue').text('Last Order : ', 100, 220);
                        doc.fontSize(15).fillColor('green').text(orderDate, 200, 220);
                    }
                }else{
                    doc.fontSize(15).fillColor('blue').text('Total Price : ', 100, 220);
                    doc.fontSize(15).fillColor('green').text(totalAmount, 200, 220);
                    if(orderDate){
                        doc.fontSize(15).fillColor('blue').text('Last Order : ', 100, 250);
                        doc.fontSize(15).fillColor('green').text(orderDate, 200, 250);
                    }
                }
                

            doc.pipe(res);
                
            doc.end();
            }     
        }	
    });
}

