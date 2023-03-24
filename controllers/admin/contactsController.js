const models = require('../../models');
const flash = require('connect-flash');
const multiparty = require('multiparty');
const jwt = require('jsonwebtoken');
const SECRET = 'nodescratch';
const nodemailer = require("nodemailer");
const csvtojson = require('csvtojson'); 
const Sequelize = require("sequelize");
const formidable = require('formidable');
const fs = require('file-system');
const Json2csvParser = require('json2csv').Parser;
const Op = Sequelize.Op
const excel = require("exceljs");
var config = require('../../config/config.json');
const emailConfig = require('../../config/email-config')();
const mailgun = require("mailgun-js")(emailConfig);

/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.contactList = async (req, res) => {
    const token= req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const role = req.session.role;
    const column = req.query.column || 'id';
    const order = req.query.order || 'ASC';
    const pagesizes = req.query.pagesize || 10;
    const pageSize = parseInt(pagesizes);
    const page = req.params.page || 1;
    const search = req.query.search || '';

    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                let arrData = []
               
                const contactList = await models.contacts.findAll({where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                    }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize })
                
                const listCount = await models.contacts.count({ where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                }})
                if(contactList.length>0){
                    for(let contact of contactList){
                        let details = contact.dataValues
                        const storeName = await models.stores.findOne({attributes: ['storeName'],where:{id: contact.storeId}})
                        const totalSubscriber = await models.contactsEmail.count({where:{contactId: contact.id}})
                        details.storeName = storeName.storeName
                        details.totalSubscriber = totalSubscriber
                        arrData.push(details)
                    }
                }

                const pageCount = Math.ceil(listCount/pageSize)

                if (arrData.length>0) {
                    return res.render('admin/contacts/contactlist', {
                        title: 'Contact List',
                        arrData: arrData,
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
                    })
                } else {
                    return res.render('admin/contacts/contactlist', {
                        title: 'Contact List',
                        arrData: [],
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
                    })
                }
            }else{
                //*****Permission Assign Start
                let userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'ContactList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission')
                    res.redirect('/admin/dashboard')
                } else {
                    let arrData = []

                    const contactList = await models.contacts.findAll({where: {storeId: sessionStoreId,
                        [Op.or]: [
                            { title: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                    }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize })

                    const listCount = await models.contacts.count({where: {storeId: sessionStoreId,
                        [Op.or]: [
                            { title: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } } 
                        ]
                    }})

                    if(contactList.length>0){
                        for(let contact of contactList){
                            let details = contact.dataValues
                            const storeName = await models.stores.findOne({attributes: ['storeName'],where:{id: contact.storeId}})
                            const totalSubscriber = await models.contactsEmail.count({where:{contactId: contact.id}})
                            details.storeName = storeName.storeName
                            details.totalSubscriber = totalSubscriber
                            arrData.push(details)
                        }
                    }

                    const pageCount = Math.ceil(listCount/pageSize);

                    if (arrData.length>0) {
                        return res.render('admin/contacts/contactlist', {
                            title: 'Contact List',
                            arrData: arrData,
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
                        })
                    } else {
                        return res.render('admin/contacts/contactlist', {
                            title: 'Contact List',
                            arrData: [],
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
                        })
                    }
                }                
            }            
        }	
    })
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.contactEmailList = async (req, res) => {
    const token= req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const role = req.session.role;
    const column = req.query.column || 'id';
    const order = req.query.order || 'ASC';
    const pagesizes = req.query.pagesize || 10;
    const pageSize = parseInt(pagesizes);
    const page = req.params.page || 1;
    const search = req.query.search || '';
    const id = req.query.id || '';

    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (!id) {
                req.flash('errors','Something went wrong!');
                res.redirect('/contacts/contactlist/1');
            } else {
                const title = await models.contacts.findOne({attributes:['title'], where: {id: id}})
                const total = await models.contactsEmail.count({where: {contactId: id}})
                const totalActive = await models.contactsEmail.count({where: {contactId: id, status: 'Active'}})
                const totalInactive = await models.contactsEmail.count({where: {contactId: id, status: 'Inactive'}})
                const totalUnsubscribe = await models.contactsEmail.count({where: {contactId: id, status: 'Unsubscribe'}})
                
                const contactEmailList = await models.contactsEmail.findAll({where: {contactId: id,
                    [Op.or]: [
                        { email: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `${search}%` } }
                    ]
                    }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize })
                
                const listCount = await models.contactsEmail.count({ where: {contactId: id,
                    [Op.or]: [
                        { email: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `${search}%` } }
                    ]
                }})
    
                const pageCount = Math.ceil(listCount/pageSize)
    
                if (contactEmailList.length>0) {
                    return res.render('admin/contacts/contactemaillist', {
                        title: `${title.title}`,
                        arrData: contactEmailList,
                        total:total,
                        totalActive:totalActive,
                        totalInactive:totalInactive,
                        totalUnsubscribe:totalUnsubscribe,
                        contactId: id,
                        listCount: listCount,
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        searchItem: search,
                        pageSize: pageSize,
                        currentPage: parseInt(page),
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    })
                } else {
                    return res.render('admin/contacts/contactemaillist', {
                        title: `${title.title}`,
                        arrData: [],
                        total:total,
                        totalActive:totalActive,
                        totalInactive:totalInactive,
                        totalUnsubscribe:totalUnsubscribe,
                        contactId: id,
                        listCount: listCount,
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        searchItem: search,
                        pageSize: pageSize,
                        currentPage: parseInt(page),
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    })
                }
            }         
        }	
    })
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.contactAddEdit = async (req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const id = req.params.id;
    jwt.verify(token,SECRET,async (err,decoded) => {
        if(err){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                req.flash('errors','You are not authorized to create');
                res.redirect('/contacts/contactlist/1');
            }else{
                if (!id) {
                    return res.render('admin/contacts/createcontactlist', {
                        title: 'Create a new Contact List',
                        details: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    })
                } else {
                    const details =  await models.contacts.findOne({where:{id:id}})
                    return res.render('admin/contacts/createcontactlist', {
                        title: 'Update Contact List',
                        details: details,
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    })
                }
            }
        }
    });    
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.downloadSample = async (req, res) => {
    const arrData = [{'Email' : 'john@gmail.com'}, {'Email' : 'jone@gmail.com'}, {'Email' : 'smith@gmail.com'}]
    const jsonStudents = JSON.parse(JSON.stringify(arrData));
    const csvFields = ['Email'];
    const json2csvParser = new Json2csvParser({ csvFields });
    const csvData = json2csvParser.parse(jsonStudents);

    res.setHeader('Content-disposition', 'attachment; filename=Sample.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).end(csvData);
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.addeditTitle = async(req, res, next) => { 
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const sessionUserId = req.session.user.id;
    const title = req.body.title;
    const id = req.body.updateId;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            if(sessionStoreId){
                if(!id){
                    await models.contacts.create({
                        storeId: sessionStoreId,
                        title: title,
                        createdBy: sessionUserId
                    }).then(ok=>{
                        req.flash('info', 'Successfully title created')
                        return res.redirect(`/admin/contacts/addedit/${ok.id}`)
                    }).catch(err=>{
                        req.flash('errors', 'Something went wrong !')
                        return res.redirect('back')
                    })
                }else{
                    await models.contacts.update({
                        storeId: sessionStoreId,
                        title: title,
                        updatedBy: sessionUserId
                    }, {where:{id:id}}).then(ok=>{
                        req.flash('info', 'Successfully title created')
                        return res.redirect('back')
                    }).catch(err=>{
                        req.flash('errors', 'Something went wrong !')
                        return res.redirect('back')
                    })
                }
            }else{
                req.flash('errors', 'You are not authorized to create')
                return res.redirect('back')
            }
        }
    })
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.uploadCSV = async(req, res, next) => { 
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const sessionUserId = req.session.user.id;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            if(sessionStoreId){
                let directory ='';
                let filePath ='';

                let formnew = new formidable.IncomingForm();
                formnew.parse(req);
                formnew.on('fileBegin', function (name, file) {
                    let csvFile = file.name;
                    let extension = csvFile.split('.').pop();
                    if(extension != 'csv'){
                        req.flash('errors', 'Only accept CSV file')
                        return res.redirect('back')
                    }else{
                        if (file.name && file.name != '') {
                            directory = __dirname + '/../../public/admin/csvcontact/';
                            filePath = __dirname + '/../../public/admin/csvcontact/' + file.name;
                            if (!fs.existsSync(directory)){
                                fs.mkdirSync(directory, (err) => {
                                if (err) throw err;
                                });
                                file.path = __dirname + '/../../public/admin/csvcontact/' + file.name;
                            }else{
                                file.path = __dirname + '/../../public/admin/csvcontact/' + file.name;
                            }
                        }
                    }
                })
            
                formnew.on('field', function(name, field) {
                var id = field;
                formnew.on('end', function () {
                    csvtojson().fromFile(filePath).then(async source => {
                        if (!id) {
                            req.flash('errors', 'Please create title first')
                            return res.redirect('back')
                        } else {
                            for (var i = 0; i < source.length; i++) { 
                                await models.contactsEmail.create({
                                    storeId: sessionStoreId,
                                    contactId: id,
                                    email: source[i]["Email"]
                                })
                            } 
                            req.flash('info', 'Successfully uploaded')
                            return res.redirect('/admin/contacts/contactlist/1')
                        }
                    }).catch(err=>{
                        req.flash('errors', 'Something went wrong')
                        return res.redirect('back')
                    })
                })
            })
            }else{
                req.flash('errors', 'You are not authorized to upload')
                return res.redirect('back')
            }
        }
    })
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.uploadManually = async(req, res, next) => { 
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const sessionUserId = req.session.user.id;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            if(sessionStoreId){
                const id = req.body.updateId
                const email = req.body.email
                if(!id){
                    req.flash('errors', 'Please create title first')
                    return res.redirect('back')
                }else{
                    for(let i =0; i< email.length; i++){
                        await models.contactsEmail.create({
                            storeId: sessionStoreId,
                            email: email[i],
                            contactId: id
                        })
                    }
                    req.flash('info', 'Successfully added');
                    return res.redirect('/admin/contacts/contactlist/1')
                }
            }else{
                req.flash('errors', 'You are not authorized to upload')
                return res.redirect('back')
            }
        }
    })
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.deleteContact = async(req, res, next) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const id = req.params.id;
    jwt.verify(token,SECRET,async function(err,decoded){
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                req.flash('errors', 'You are not authorized to delete');
                res.redirect('back');
            } else {
                await models.contacts.destroy({
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
    })
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.exportContactList = async(req, res) =>{
    const token= req.session.token;
    const search = req.query.search || '';
    const id = req.query.id;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            const contactEmailList = await models.contactsEmail.findAll({where: {contactId: id,
                [Op.or]: [
                    { email: { [Op.like]: `%${search}%` } },
                    { status: { [Op.like]: `${search}%` } }
                ]
            }})
            const title = await models.contacts.findOne({attributes:['title'], where:{id:id}})
            const arrData = contactEmailList.map(contact => {
                return Object.assign(
                    {
                        id : contact.id,
                        title : title.title,
                        email : contact.email,
                        status : contact.status,
                        date : contact.createdAt,
                    }
                )
            })

            let workbook = new excel.Workbook();
            let worksheet = workbook.addWorksheet("Contact List");
        
            worksheet.columns = [
                { header: "Contact Title", key: "title", width:30 },
                { header: "Emails", key: "email", width: 40 },
                { header: "Status", key: "status", width: 10 },
                { header: "Added", key: "date", width: 15 }
            ];
        
            // Add Array Rows
            worksheet.addRows(arrData);
        
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=" + "Contact List.xlsx"
            )
        
            return workbook.xlsx.write(res).then(() => {
                res.status(200).end();
                return res.redirect('back');
            })
        }	
    })
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.deleteEmail = async(req, res, next) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const id = req.params.id;
    jwt.verify(token,SECRET,async function(err,decoded){
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                req.flash('errors', 'You are not authorized to delete');
                res.redirect('back');
            } else {
                await models.contactsEmail.destroy({
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
    })
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.statusChange = async(req, res, next) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const id = req.params.id;
    jwt.verify(token,SECRET,async function(err,decoded){
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                req.flash('errors', 'You are not authorized to change status');
                res.redirect('back');
            } else {
                const status = await models.contactsEmail.findOne({attributes:['status'],where:{ id: id }})
                if (status.status == 'Active') {
                    await models.contactsEmail.update({ status: 'Inactive',},{where:{ id: id }})
                    .then(function (value) {
                        req.flash('info', 'Status Successfully Changed')
                        res.redirect('back')
                    }).catch(err=>{
                        req.flash('errors', 'Something went wrong')
                        res.redirect('back')
                    })
                } else if(status.status == 'Inactive') {
                    await models.contactsEmail.update({ status: 'Active',},{where:{ id: id }})
                    .then(function (value) {
                        req.flash('info', 'Status Successfully Changed')
                        res.redirect('back')
                    }).catch(err=>{
                        req.flash('errors', 'Something went wrong')
                        res.redirect('back')
                    })
                } else {
                    req.flash('errors', 'Something went wrong');
                    res.redirect('back');
                }
                
            }  
        }
    })
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.emailConfigList = async (req, res) => {
    const token= req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const role = req.session.role;
    const column = req.query.column || 'id';
    const order = req.query.order || 'ASC';
    const pagesizes = req.query.pagesize || 10;
    const pageSize = parseInt(pagesizes);
    const page = req.params.page || 1;
    const search = req.query.search || '';

    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                let arrData = []
                
                const contactList = await models.emailConfiguration.findAll({where: {
                    [Op.or]: [
                        { domain: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } }
                    ]
                    }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize })
                
                const listCount = await models.emailConfiguration.count({ where: {
                    [Op.or]: [
                        { domain: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } }
                    ]
                }})

                if(contactList.length>0){
                    for(let contact of contactList){
                        let details = contact.dataValues
                        const storeName = await models.stores.findOne({attributes: ['storeName'],where:{id: contact.storeId}})
                        details.storeName = storeName.storeName
                        arrData.push(details)
                    }
                }

                const pageCount = Math.ceil(listCount/pageSize)

                if (arrData.length>0) {
                    return res.render('admin/contacts/emaillist', {
                        title: 'Email Config List',
                        arrData: arrData,
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
                    })
                } else {
                    return res.render('admin/contacts/emaillist', {
                        title: 'Email Config List',
                        arrData: [],
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
                    })
                }
            }else{
                //*****Permission Assign Start
                let userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'EmailConfigList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission')
                    res.redirect('/admin/dashboard')
                } else {
                    let arrData = []
                    
                    const contactList = await models.emailConfiguration.findAll({where: {storeId: sessionStoreId,
                        [Op.or]: [
                            { domain: { [Op.like]: `%${search}%` } },
                            { email: { [Op.like]: `%${search}%` } }
                        ]
                    }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize })

                    const listCount = await models.emailConfiguration.count({where: {storeId: sessionStoreId,
                        [Op.or]: [
                            { domain: { [Op.like]: `%${search}%` } },
                            { email: { [Op.like]: `%${search}%` } } 
                        ]
                    }})

                    if(contactList.length>0){
                        for(let contact of contactList){
                            let details = contact.dataValues
                            const storeName = await models.stores.findOne({attributes: ['storeName'],where:{id: contact.storeId}})
                            details.storeName = storeName.storeName
                            arrData.push(details)
                        }
                    }

                    const pageCount = Math.ceil(listCount/pageSize);

                    if (arrData.length>0) {
                        return res.render('admin/contacts/emaillist', {
                            title: 'Email Config List',
                            arrData: arrData,
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
                        })
                    } else {
                        return res.render('admin/contacts/emaillist', {
                            title: 'Email Config List',
                            arrData: [],
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
                        })
                    }
                }                
            }            
        }	
    })
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.viewEmailConfig = async(req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const id = req.params.id;
    jwt.verify(token,SECRET,async function(err,decoded){
        if(err){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                const stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                if (!id) {
                    return res.render('admin/contacts/emailcreate', {
                        title: 'Create Configuration',
                        arrData: '',
                        stores: stores,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    const emailConfiguration = await models.emailConfiguration.findOne({ where: { id: id } });
                    if (emailConfiguration) {
                        return res.render('admin/contacts/emailcreate', {
                            title: 'Edit Configuration',
                            arrData: emailConfiguration,
                            stores: stores,
                            sessionStoreId: '',
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    }else{
                        req.flash('errors','Something went wrong');
                        res.redirect('back');
                    }
                }
            }else{
                if (!id) {
                    return res.render('admin/contacts/emailcreate', {
                        title: 'Create Configuration',
                        arrData: '',
                        stores: [],
                        sessionStoreId: sessionStoreId,
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    const emailConfiguration = await models.emailConfiguration.findOne({ where: { storeId: sessionStoreId, id: id } });
                    if (emailConfiguration) {
                        return res.render('admin/contacts/emailcreate', {
                            title: 'Edit Configuration',
                            arrData: emailConfiguration,
                            stores: [],
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        })
                    }else{
                        req.flash('errors','Something went wrong');
                        res.redirect('back');
                    }
                }
            }
        }
    });    
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.createEmailConfig = async(req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    jwt.verify(token,SECRET,async function(err,decoded){
        if(err){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            const id = req.body.updateId
            const email = req.body.email
            const domain = req.body.domain
            const status = req.body.status
            const storeId = req.body.storeId
            if (!id) {
                await models.emailConfiguration.create({
                    email:email,
                    domain:domain,
                    status:status,
                    storeId:storeId
                }).then(()=>{
                    req.flash('info','Successfully created')
                    res.redirect('/admin/emailconfig/list/1')
                }).catch((err)=>{
                    req.flash('errors','Something went wrong!')
                    res.redirect('back')
                })
            } else {
                await models.emailConfiguration.update({
                    email:email,
                    domain:domain,
                    status:status,
                    storeId:storeId
                }, {where:{id:id}}).then(()=>{
                    req.flash('info','Successfully updated')
                    res.redirect('/admin/emailconfig/list/1')
                }).catch((err)=>{
                    req.flash('errors','Something went wrong!')
                    res.redirect('back')
                })
            }
        }
    }) 
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.deleteEmailConfig = async(req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    jwt.verify(token,SECRET,async function(err,decoded){
        if(err){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            const id = req.params.id
            if (!id) {
                req.flash('errors','Something went wrong!')
                res.redirect('back')
            } else {
                await models.emailConfiguration.destroy({where:{id:id}})
                .then(()=>{
                    req.flash('info','Successfully deleted')
                    res.redirect('back')
                }).catch((err)=>{
                    req.flash('errors','Something went wrong!')
                    res.redirect('back')
                })
            }
        }
    }) 
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.campaignList = async (req, res) => {
    const token= req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const column = req.query.column || 'id';
    const order = req.query.order || 'ASC';
    const pagesizes = req.query.pagesize || 10;
    const pageSize = parseInt(pagesizes);
    const page = req.params.page || 1;
    const search = req.query.search || '';

    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                let arrData = []
               
                const campaignList = await models.campaignDetails.findAll({where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { subject: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } },
                    ]
                    }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize })
                
                const listCount = await models.campaignDetails.count({ where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { subject: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } },
                    ]
                }})

                if(campaignList.length>0){
                    for(let campaign of campaignList){
                        let details = campaign.dataValues
                        const storeName = await models.stores.findOne({attributes: ['storeName'],where:{id: campaign.storeId}})
                        const totalEmail = await models.campaignDetailsEmail.count({where:{campaignId: campaign.id}})
                        details.storeName = storeName.storeName
                        details.totalEmail = totalEmail
                        arrData.push(details)
                    }
                }

                const pageCount = Math.ceil(listCount/pageSize)

                if (arrData.length>0) {
                    return res.render('admin/contacts/campaignlist', {
                        title: 'My Campaigns',
                        arrData: arrData,
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
                    })
                } else {
                    return res.render('admin/contacts/campaignlist', {
                        title: 'My Campaigns',
                        arrData: [],
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
                    })
                }
            }else{
                let arrData = []

                const campaignList = await models.campaignDetails.findAll({where: {storeId: sessionStoreId,
                    [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { subject: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } },
                    ]
                }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize })

                const listCount = await models.campaignDetails.count({where: {storeId: sessionStoreId,
                    [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { subject: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } },
                    ]
                }})

                if(campaignList.length>0){
                    for(let campaign of campaignList){
                        let details = campaign.dataValues
                        const storeName = await models.stores.findOne({attributes: ['storeName'],where:{id: campaign.storeId}})
                        const totalEmail = await models.campaignDetailsEmail.count({where:{campaignId: campaign.id}})
                        details.storeName = storeName.storeName
                        details.totalEmail = totalEmail
                        arrData.push(details)
                    }
                }

                const pageCount = Math.ceil(listCount/pageSize);

                if (arrData.length>0) {
                    return res.render('admin/contacts/campaignlist', {
                        title: 'My Campaigns',
                        arrData: arrData,
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
                    })
                } else {
                    return res.render('admin/contacts/campaignlist', {
                        title: 'My Campaigns',
                        arrData: [],
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
                    })
                }            
            }            
        }	
    })
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.deleteCampaign = async(req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    jwt.verify(token,SECRET,async function(err,decoded){
        if(err){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            const id = req.params.id
            if (!id) {
                req.flash('errors','Something went wrong!')
                res.redirect('back')
            } else {
                await models.campaignDetails.destroy({where:{id:id}})
                .then(()=>{
                    req.flash('info','Successfully deleted')
                    res.redirect('back')
                }).catch((err)=>{
                    req.flash('errors','Something went wrong!')
                    res.redirect('back')
                })
            }
        }
    }) 
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.viewCampaign = async(req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    jwt.verify(token,SECRET,async function(err,decoded){
        if(err){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                const emailConfig = await models.emailConfiguration.findAll({where:{status: 'Active'}})
                const contactList = await models.contacts.findAll()

                return res.render('admin/contacts/campaigncreate', {
                    title: 'Campaign Details',
                    emailConfig: emailConfig,
                    contactList: contactList,
                    messages: req.flash('info'),
                    errors: req.flash('errors'),
                })
            } else {
                const emailConfig = await models.emailConfiguration.findAll({where:{status: 'Active', storeId:sessionStoreId}})
                const contactList = await models.contacts.findAll({where:{storeId:sessionStoreId}})

                return res.render('admin/contacts/campaigncreate', {
                    title: 'Campaign Details',
                    emailConfig: emailConfig,
                    contactList: contactList,
                    messages: req.flash('info'),
                    errors: req.flash('errors'),
                })
            }
        }
    }) 
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.createCampaign = async(req, res, next) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const sessionUserId = req.session.user.id;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if(err){
            res.flash('errors','Invalid Token');
            req.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                res.flash('errors','You are not authorized to send email');
                req.redirect('back');
            } else {
                const form = new multiparty.Form();
                form.parse(req, async (err, fields,) => {
                    const title = fields.title[0];
                    const content = fields.content[0];
                    const subject = fields.subject[0];
                    const fromId = fields.fromId[0];
                    const contactId = fields.contactId[0];
                    
                    if (title != '' && content != '' && subject != '' && fromId != '' && contactId != '') {
                        const emails = await models.contactsEmail.findAll({attributes:['email'],where:{status:'Active', contactId: contactId, storeId:sessionStoreId}})

                        const from = await models.emailConfiguration.findAll({attributes:['email'],where:{id:fromId}})

                        await models.campaignDetails.create({
                            title: title,
                            subject: subject,
                            storeId: sessionStoreId,
                            content: content,
                            contactId:contactId,
                            createdBy: sessionUserId
                        }).then((value)=> {
                            if (value) {
                                for(let email of emails){
                                    // let transporter = nodemailer.createTransport({
                                    //     // service: 'gmail',
                                    //     // auth: {
                                    //     //   user: 'iamnodedeveloper@gmail.com',
                                    //     //   pass: 'Developer@node'
                                    //     host: "smtp.gmail.com",
                                    //     port: 587,
                                    //     secure: false, 
                                    //     auth: {
                                    //     user:`${from[0].email}`, 
                                    //     pass:'coxfvopxotwuqwzz',
                                    //     }
                                    // })
                                    let link =req.app.locals.baseurl +"admin/contacts/unsubscribe/" +sessionStoreId +"/" +email.email;

                                    let mailOptions = {
                                        // from: `"Tezcommerce" <${from[0].email}>`,
                                        from: `${title} <${from[0].email}>`,
                                        to: email.email,
                                        subject: subject,
                                        html: `<!DOCTYPE html>
                                        <html lang="en">
                                        <head>
                                            <meta charset="UTF-8">
                                            <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                            <link rel="preconnect" href="https://fonts.googleapis.com">
                                            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                                            <link href="https://fonts.googleapis.com/css2?family=STIX+Two+Text:ital@1&display=swap" rel="stylesheet">
                                        </head>
                                        <body style="background-color: rgb(229, 250, 249); font-family: 'STIX Two Text', serif;"> ${content} 
                                            <div style="padding-bottom: 40px; padding-top: 40px; text-align: center;">
                                            <a href="${link}" style="text-decoration: none; color: black;" onMouseOver="this.style.color='red'" onMouseOut="this.style.color='black'" class="demo">Unsubscribe</a>
                                            </div>
                                        </body>
                                        </html>`
                                        };
                                        
                                        // transporter.sendMail(mailOptions, (error, info) => {
                                        // if (error) {
                                        //     console.log(error);
                                        //     return res.redirect('back');
                                        // }
                                        // })

                                        mailgun.messages().send(mailOptions, function (error, body) {
                                            console.log(body);
                                          });

                                    models.campaignDetailsEmail.create({
                                        campaignId: value.id,
                                        storeId: sessionStoreId,
                                        email: email.email
                                    })
                                }
                                req.flash('info', 'Successfully mail sent');
                                return res.redirect('back');
                            }
                        }).catch((error) => {
                            console.log(error);
                            req.flash('errors', 'Somethings went wrong');
                            return res.redirect('back');
                        })
                    }else{
                        req.flash('errors', 'Please fill the required fields.')
                        return res.redirect('back')
                    }
                })
            }
        }
    })
}
/**
 * This function is developed for listing Contacts
 * Developer: Partha Mandal
*/
exports.campaignEmailList = async (req, res) => {
    const token= req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const role = req.session.role;
    const column = req.query.column || 'id';
    const order = req.query.order || 'ASC';
    const pagesizes = req.query.pagesize || 10;
    const pageSize = parseInt(pagesizes);
    const page = req.params.page || 1;
    const search = req.query.search || '';
    const id = req.query.id || '';

    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (!id) {
                req.flash('errors','Something went wrong!');
                res.redirect('/contacts/contactlist/1');
            } else {
                const title = await models.campaignDetails.findOne({attributes:['title'], where: {id: id}})

                const campaignEmailList = await models.campaignDetailsEmail.findAll({where: {campaignId: id,
                    [Op.or]: [
                        { email: { [Op.like]: `%${search}%` } }
                    ]
                    }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize })
                
                const listCount = await models.campaignDetailsEmail.count({ where: {campaignId: id,
                    [Op.or]: [
                        { email: { [Op.like]: `%${search}%` } }
                    ]
                }})
    
                const pageCount = Math.ceil(listCount/pageSize)
    
                if (campaignEmailList.length>0) {
                    return res.render('admin/contacts/campaignemails', {
                        title: `${title.title}`,
                        arrData: campaignEmailList,
                        campaignId: id,
                        listCount: listCount,
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        searchItem: search,
                        pageSize: pageSize,
                        currentPage: parseInt(page),
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    })
                } else {
                    return res.render('admin/contacts/campaignemails', {
                        title: `${title.title}`,
                        arrData: [],
                        campaignId: id,
                        listCount: listCount,
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        searchItem: search,
                        pageSize: pageSize,
                        currentPage: parseInt(page),
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    })
                }
            }         
        }	
    })
}



exports.unsubscribeView = async (req, res) => {
    return res.render("admin/contacts/unsubscribe", {
      messages: req.flash("infos"),
      errors: req.flash("errors"),
    });
};
  
exports.unsubscribe = async (req, res) => {
    const storeId = req.params.storeId;
    const email = req.params.email;
    const reason = req.body.reason;
    const reason2 = req.body.reason2;
  
    if (storeId != "" && email != "") {
      if (reason != "" && reason != undefined) {
        if (reason == "Other") {
          if (reason2 != "" && reason2 != undefined) {
            const count = await models.contactsEmail.count({
              where: { storeId: storeId, email: email },
            });
            if (count > 0) {
              await models.contactsEmail
                .update(
                  { status: "Unsubscribe", unsubscribeReason: reason2 },
                  { where: { storeId: storeId, email: email } }
                )
                .then((success) => {
                  req.flash("infos", "Successfully unsubscribe");
                  res.redirect("back");
                })
                .catch((err) => {
                  req.flash("errors", "Something went wrong! Please try again");
                  res.redirect("back");
                });
            } else {
              req.flash("errors", "Something went wrong! Please try again");
              res.redirect("back");
            }
          } else {
            req.flash("errors", "Please write why are you unsubscribing?");
            res.redirect("back");
          }
        } else {
          const count = await models.contactsEmail.count({
            where: { storeId: storeId, email: email },
          });
          if (count > 0) {
            await models.contactsEmail
              .update(
                { status: "Unsubscribe", unsubscribeReason: reason },
                { where: { storeId: storeId, email: email } }
              )
              .then((success) => {
                req.flash("infos", "Successfully unsubscribe");
                res.redirect("back");
              })
              .catch((err) => {
                req.flash("errors", "Something went wrong! Please try again");
                res.redirect("back");
              });
          } else {
            req.flash("errors", "Something went wrong! Please try again");
            res.redirect("back");
          }
        }
      } else {
        req.flash("errors", "Please select any reason");
        res.redirect("back");
      }
    } else {
      req.flash("errors", "Something went wrong! Please try again");
      res.redirect("back");
    }
};