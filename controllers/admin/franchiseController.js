const models = require('../../models');
const multiparty = require('multiparty'); 
const jwt = require('jsonwebtoken');
const SECRET = 'nodescratch';
const excel = require("exceljs");
const Sequelize = require("sequelize");
const Op = Sequelize.Op

/**
 * This function is developed for listing franchise
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
    let name = req.query.name || '';
    let businessType = req.query.businessType || '';
    let status = req.query.status || '';

    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                let nameList = await models.franchise.findAll({attributes:['id', 'name']})

                let whereCondition
                if (name !='' && status =='' && businessType =='') {
                    whereCondition = {id:name}
                }else if(businessType !='' && name =='' && status ==''){
                    whereCondition = {businessType:businessType}
                }else if(businessType =='' && name =='' && status !=''){
                    whereCondition = {status:status}
                }else if(status !='' && businessType !='' && name ==''){
                    whereCondition = {status:status, businessType:businessType}
                }else if(name!='' && status !='' && businessType ==''){
                    whereCondition = {id:name,status:status}
                }else if(name!='' && businessType !='' && status ==''){
                    whereCondition = {id:name, businessType:businessType}
                }else if(name!='' && businessType !='' && status !=''){
                    whereCondition = {id:name, businessType:businessType,status:status}
                }

                let franchiseList
                let listCount
                if (name!='' || businessType !='' || status !='') {
                    franchiseList = await models.franchise.findAll({where:whereCondition, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize})

                    listCount = await models.franchise.count({where:whereCondition})
                } else {
                    franchiseList = await models.franchise.findAll({ where: {
                        [Op.or]: [
                          { name: { [Op.like]: `%${search}%` } },
                          { email: { [Op.like]: `%${search}%` } },
                          { contactNo: { [Op.like]: `%${search}%` } },
                          { address: { [Op.like]: `%${search}%` } },
                          { preferredLocation: { [Op.like]: `%${search}%` } },
                          { businessType: { [Op.like]: `%${search}%` } },
                          { status: { [Op.like]: `%${search}%` } }
                        ]
                    }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                    listCount = await models.franchise.count({where: {
                        [Op.or]: [
                          { name: { [Op.like]: `%${search}%` } },
                          { email: { [Op.like]: `%${search}%` } },
                          { contactNo: { [Op.like]: `%${search}%` } },
                          { address: { [Op.like]: `%${search}%` } },
                          { preferredLocation: { [Op.like]: `%${search}%` } },
                          { businessType: { [Op.like]: `%${search}%` } },
                          { status: { [Op.like]: `%${search}%` } }
                        ]
                    }});
                }
                
                let pageCount = Math.ceil(listCount/pageSize);
                if (franchiseList) {
                    return res.render('admin/franchise/list', {
                        title: 'Franchise List',
                        arrData: franchiseList,
                        storeList: storeList,
                        nameList:nameList,
                        sessionStoreId: '',
                        listCount: listCount,
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        searchItem: search,
                        pageSize: pageSize,
                        currentPage: parseInt(page),
                        nameFilter:name,
                        typeFilter:businessType,
                        statusFilter:status,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } else {
                    return res.render('admin/franchise/list', {
                        title: 'Franchise List',
                        arrData: '',
                        storeList: '',
                        sessionStoreId: '',
                        nameList:nameList,
                        nameFilter:name,
                        typeFilter:businessType,
                        statusFilter:status,
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
                        return permission === 'FranchiseList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });
                    let nameList = await models.franchise.findAll({attributes:['id', 'name'],where:{storeId: sessionStoreId}})

                    let whereCondition
                    if (name !='' && status =='' && businessType =='') {
                        whereCondition = {id:name, storeId: sessionStoreId}
                    }else if(businessType !='' && name =='' && status ==''){
                        whereCondition = {businessType:businessType, storeId: sessionStoreId}
                    }else if(businessType =='' && name =='' && status !=''){
                        whereCondition = {status:status, storeId: sessionStoreId}
                    }else if(status !='' && businessType !='' && name ==''){
                        whereCondition = {status:status, businessType:businessType, storeId: sessionStoreId}
                    }else if(name!='' && status !='' && businessType ==''){
                        whereCondition = {id:name,status:status, storeId: sessionStoreId}
                    }else if(name!='' && businessType !='' && status ==''){
                        whereCondition = {id:name, businessType:businessType, storeId: sessionStoreId}
                    }else if(name!='' && businessType !='' && status !=''){
                        whereCondition = {id:name, businessType:businessType,status:status, storeId: sessionStoreId}
                    }

                    let franchiseList
                    let listCount
                    if (name!='' || businessType !='' || status !='') {
                        franchiseList = await models.franchise.findAll({where:whereCondition, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize})

                        listCount = await models.franchise.count({where:whereCondition})
                    } else {
                        franchiseList = await models.franchise.findAll({ where: {storeId: sessionStoreId,
                            [Op.or]: [
                            { name: { [Op.like]: `%${search}%` } },
                            { email: { [Op.like]: `%${search}%` } },
                            { contactNo: { [Op.like]: `%${search}%` } },
                            { address: { [Op.like]: `%${search}%` } },
                            { preferredLocation: { [Op.like]: `%${search}%` } },
                            { businessType: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                            ]
                        }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                        listCount = await models.franchise.count({where: {storeId: sessionStoreId,
                            [Op.or]: [
                            { name: { [Op.like]: `%${search}%` } },
                            { email: { [Op.like]: `%${search}%` } },
                            { contactNo: { [Op.like]: `%${search}%` } },
                            { address: { [Op.like]: `%${search}%` } },
                            { preferredLocation: { [Op.like]: `%${search}%` } },
                            { businessType: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                            ]
                        }});
                    }

                    let pageCount = Math.ceil(listCount/pageSize);

                    if (franchiseList) {
                        return res.render('admin/franchise/list', {
                            title: 'Franchise List',
                            arrData: franchiseList,
                            storeList: storeList,
                            sessionStoreId: sessionStoreId,
                            nameList:nameList,
                            listCount: listCount,
                            pageCount: pageCount,
                            currentPage: parseInt(page),
                            columnName: column,
                            orderType: order,
                            searchItem: search,
                            pageSize: pageSize,
                            nameFilter:name,
                            typeFilter:businessType,
                            statusFilter:status,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                        });
                    } else {
                        return res.render('admin/franchise/list', {
                            title: 'Franchise List',
                            arrData: '',
                            storeList: '',
                            nameList:nameList,
                            sessionStoreId: sessionStoreId,
                            nameFilter:name,
                            typeFilter:businessType,
                            statusFilter:status,
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
 * This function is developed for view franchise
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
                    return res.render('admin/franchise/addedit', {
                        title: 'Add Franchise',
                        arrData: '',
                        stores: stores,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var franchise = await models.franchise.findOne({ where: { id: id } });
                    if (franchise) {
                        return res.render('admin/franchise/addedit', {
                            title: 'Edit Franchise',
                            arrData: franchise,
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
                        return permission === 'FranchiseView'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.franchise.findOne({ attributes: ['storeId'], where: { id: id } });
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
                        return res.render('admin/franchise/addedit', {
                            title: 'Add Franchise',
                            arrData: '',
                            stores: stores,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        var franchise = await models.franchise.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (franchise) {
                            return res.render('admin/franchise/addedit', {
                                title: 'Edit Franchise',
                                arrData: franchise,
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
 * This function is developed for add/update New franchise
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
                        return permission === 'FranchiseAddEdit'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                var form = new multiparty.Form();
                form.parse(req, function (err, fields, files) {
                    var id = fields.update_id[0];
                    var name = fields.name[0];
                    var email = fields.email[0];
                    var contact = fields.contactNo[0];
                    var business = fields.businessType[0];
                    var storeId = fields.storeId[0];
                    var status = fields.status[0];
                    var address = fields.address[0];
                    var pLocation = fields.preferredLocation[0];
                    if (!id) {
                        if (name != '' && email != '' && contact != ' ' && business != '' && storeId != '' && status != '' && address != '' && pLocation != '') {
                            models.franchise.create({
                                name: name,
                                email: email,
                                contactNo: contact,
                                businessType: business,
                                storeId: storeId,
                                status: status,
                                address: address,
                                preferredLocation: pLocation,
                                createdBy: sessionUserId
                            }).then(function (value) {
                                if (value) {
                                    req.flash('info', 'Successfully franchise created');
                                    return res.redirect('/admin/franchise/list/1');
                                }
                            }).catch(function (error) {
                                console.log(error);
                                req.flash('errors', 'Somethings went wrong');
                            });
                        }else{
                            req.flash('errors','Please fill the required fields.')
                            return res.redirect('back')
                        }
                    } else {
                        if (name != '' && email != '' && contact != ' ' && business != '' && storeId != '' && status != '' && address != '' && pLocation != '') {
                        models.franchise.update({
                            name: name,
                            email: email,
                            contactNo: contact,
                            businessType: business,
                            storeId: storeId,
                            status: status,
                            address: address,
                            preferredLocation: pLocation,
                            updatedBy: sessionUserId
                        }, { where: { id: id } }).then(function (value) {
                            if (value) {
                                req.flash('info', 'Successfully franchise updated');
                                return res.redirect('/admin/franchise/list/1');
                            }
                        }).catch(function (error) {
                            console.log(error);
                            req.flash('errors', 'Somethings went wrong');
                        });
                        }else{
                            req.flash('errors','Please fill the required fields.')
                            return res.redirect('back')
                        }
                    }
                });
            }
        }
    })
    
};

/**
 * This function is developed for delete franchise
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
                        return permission === 'FranchiseDelete'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.franchise.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.franchise.destroy({
                    where: { id: id }
                }).then(function (value) {
                    if (value) {
                        req.flash('info', 'Successfully  franchise deleted');
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

/**
 * This function is developed for exports franchise
 * Developer: Partha Mandal
*/
exports.exportData = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    let search = req.query.search || '';
    let name = req.query.name || '';
    let businessType = req.query.businessType || '';
    let status = req.query.status || '';

    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {

                let whereCondition
                if (name !='' && status =='' && businessType =='') {
                    whereCondition = {id:name}
                }else if(businessType !='' && name =='' && status ==''){
                    whereCondition = {businessType:businessType}
                }else if(businessType =='' && name =='' && status !=''){
                    whereCondition = {status:status}
                }else if(status !='' && businessType !='' && name ==''){
                    whereCondition = {status:status, businessType:businessType}
                }else if(name!='' && status !='' && businessType ==''){
                    whereCondition = {id:name,status:status}
                }else if(name!='' && businessType !='' && status ==''){
                    whereCondition = {id:name, businessType:businessType}
                }else if(name!='' && businessType !='' && status !=''){
                    whereCondition = {id:name, businessType:businessType,status:status}
                }

                let franchiseList
                if (name!='' || businessType !='' || status !='') {
                    franchiseList = await models.franchise.findAll({where:whereCondition})
                } else {
                    franchiseList = await models.franchise.findAll({ where: {
                        [Op.or]: [
                            { name: { [Op.like]: `%${search}%` } },
                            { email: { [Op.like]: `%${search}%` } },
                            { contactNo: { [Op.like]: `%${search}%` } },
                            { address: { [Op.like]: `%${search}%` } },
                            { preferredLocation: { [Op.like]: `%${search}%` } },
                            { businessType: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                    }})
                }
                
                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Franchise");
            
                worksheet.columns = [
                    { header: "Name", key: "name", width:15 },
                    { header: "Email", key: "email", width: 20 },
                    { header: "Contact No", key: "contactNo", width: 13 },
                    { header: "Address", key: "address", width: 40 },
                    { header: "Preferred Location", key: "preferredLocation", width: 25 },
                    { header: "Business Type", key: "businessType", width: 15 },
                    { header: "Status", key: "status", width: 15 },
                ];
            
                // Add Array Rows
                worksheet.addRows(franchiseList);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Franchise.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })

            }else{
                let whereCondition
                if (name !='' && status =='' && businessType =='') {
                    whereCondition = {id:name, storeId: sessionStoreId}
                }else if(businessType !='' && name =='' && status ==''){
                    whereCondition = {businessType:businessType, storeId: sessionStoreId}
                }else if(businessType =='' && name =='' && status !=''){
                    whereCondition = {status:status, storeId: sessionStoreId}
                }else if(status !='' && businessType !='' && name ==''){
                    whereCondition = {status:status, businessType:businessType, storeId: sessionStoreId}
                }else if(name!='' && status !='' && businessType ==''){
                    whereCondition = {id:name,status:status, storeId: sessionStoreId}
                }else if(name!='' && businessType !='' && status ==''){
                    whereCondition = {id:name, businessType:businessType, storeId: sessionStoreId}
                }else if(name!='' && businessType !='' && status !=''){
                    whereCondition = {id:name, businessType:businessType,status:status, storeId: sessionStoreId}
                }

                let franchiseList

                if (name!='' || businessType !='' || status !='') {
                    franchiseList = await models.franchise.findAll({where:whereCondition})
                } else {
                    franchiseList = await models.franchise.findAll({ where: {storeId: sessionStoreId,
                        [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                        { contactNo: { [Op.like]: `%${search}%` } },
                        { address: { [Op.like]: `%${search}%` } },
                        { preferredLocation: { [Op.like]: `%${search}%` } },
                        { businessType: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                        ]
                    }})
                }  
                
                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Franchise");
            
                worksheet.columns = [
                    { header: "Name", key: "name", width:15 },
                    { header: "Email", key: "email", width: 20 },
                    { header: "Contact No", key: "contactNo", width: 13 },
                    { header: "Address", key: "address", width: 40 },
                    { header: "Preferred Location", key: "preferredLocation", width: 25 },
                    { header: "Business Type", key: "businessType", width: 15 },
                    { header: "Status", key: "status", width: 15 },
                ];
            
                // Add Array Rows
                worksheet.addRows(franchiseList);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Franchise.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })
            }            
        }	
    });
}