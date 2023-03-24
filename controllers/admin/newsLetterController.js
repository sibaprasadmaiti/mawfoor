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
 * This function is developed for listing News Letter
 * Developer: Partha Mandal
 */
exports.list = async (req, res) => {
    const token= req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const role = req.session.role;
    const column = req.query.column || 'id';
    const order = req.query.order || 'ASC';
    const pagesizes = req.query.pagesize || 10;
    const pageSize = parseInt(pagesizes);
    const page = req.params.page || 1;
    const search = req.query.search || '';
    const fdate = req.query.fdate || '';
    const tdate = req.query.tdate || '';

    const start = new Date(fdate)
    start.setHours(0,0,0,0)
    const end = new Date(tdate)
    end.setHours(23,59,59,999)
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                const storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                let whereCondition
                if (fdate !='' && tdate =='') {
                    whereCondition = {createdAt: {$gte: start}}
                }else if(fdate =='' && tdate !=''){
                    whereCondition = {createdAt: {$lte: end}}
                }else if(fdate !='' && tdate !=''){
                    whereCondition = {createdAt:{$gte: start, $lte: end}}
                }

                let newsLetterList
                let listCount

                if(fdate !='' || tdate !=''){
                    newsLetterList = await models.newsLetter.findAll({ where: whereCondition , order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                    listCount = await models.newsLetter.count({ where: whereCondition});
                }else{
                    newsLetterList = await models.newsLetter.findAll({where: {
                        [Op.or]: [
                            { heading: { [Op.like]: `%${search}%` } },
                            { scheduleTime: { [Op.like]: `%${search}%` } },
                            { sendingStatus: { [Op.like]: `%${search}%` } },
                            { description: { [Op.like]: `%${search}%` } },
                        ]
                      }, include: [{model: models.newsLetterEmail, required: false}], order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                    listCount = await models.newsLetter.count({ where: {
                        [Op.or]: [
                            { heading: { [Op.like]: `%${search}%` } },
                            { scheduleTime: { [Op.like]: `%${search}%` } },
                            { sendingStatus: { [Op.like]: `%${search}%` } },
                            { description: { [Op.like]: `%${search}%` } }, 
                        ]
                    }});
                }

                const pageCount = Math.ceil(listCount/pageSize);

                if (newsLetterList) {
                    return res.render('admin/newsletter/list', {
                        title: 'Newsletter List',
                        arrData: newsLetterList,
                        storeList: storeList,
                        sessionStoreId: '',
                        fdateFilter: fdate,
                        tdateFilter: tdate,
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
                    return res.render('admin/newsletter/list', {
                        title: 'Newsletter List',
                        arrData: '',
                        storeList: '',
                        sessionStoreId: '',
                        fdateFilter: fdate,
                        tdateFilter: tdate,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                }
            }else{
                //*****Permission Assign Start
                let userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'NewsLetterList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    const storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });
                    let whereCondition
                    if (fdate !='' && tdate =='') {
                        whereCondition = {createdAt: {$gte: start}, storeId: sessionStoreId}
                    }else if(fdate =='' && tdate !=''){
                        whereCondition = {createdAt: {$lte: end}, storeId: sessionStoreId}
                    }else if(fdate !='' && tdate !=''){
                        whereCondition = {createdAt:{$gte: start, $lte: end}, storeId: sessionStoreId}
                    }

                    let newsLetterList
                    let listCount

                    if(fdate !='' || tdate !=''){
                        newsLetterList = await models.newsLetter.findAll({ where: whereCondition , order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                        listCount = await models.newsLetter.count({ where: whereCondition});
                    }else{
                        newsLetterList = await models.newsLetter.findAll({where: {storeId: sessionStoreId,
                            [Op.or]: [
                                { heading: { [Op.like]: `%${search}%` } },
                                { scheduleTime: { [Op.like]: `%${search}%` } },
                                { sendingStatus: { [Op.like]: `%${search}%` } },
                                { description: { [Op.like]: `%${search}%` } },
                            ]
                        }, include: [{model: models.newsLetterEmail, required: false}], order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                        listCount = await models.newsLetter.count({ where: { storeId: sessionStoreId,
                            [Op.or]: [
                                { heading: { [Op.like]: `%${search}%` } },
                                { scheduleTime: { [Op.like]: `%${search}%` } },
                                { sendingStatus: { [Op.like]: `%${search}%` } },
                                { description: { [Op.like]: `%${search}%` } }, 
                            ]
                        }});
                    }

                    const pageCount = Math.ceil(listCount/pageSize);

                    if (newsLetterList) {
                        return res.render('admin/newsletter/list', {
                            title: 'Newsletter List',
                            arrData: newsLetterList,
                            storeList: storeList,
                            sessionStoreId: sessionStoreId,
                            fdateFilter: fdate,
                            tdateFilter: tdate,
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
                        return res.render('admin/newsletter/list', {
                            title: 'Newsletter List',
                            arrData: '',
                            storeList: '',
                            fdateFilter: fdate,
                            tdateFilter: tdate,
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
 * This function is developed for view News Letter
 * Developer: Partha Mandal
 */
exports.view = async (req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const role = req.session.role;
    jwt.verify(token,SECRET,async (err,decoded) => {
        if(err){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                const stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                const customersList = await models.customers.findAll({ attributes: ['firstName', 'lastName','email'], where: { status: 'Yes', email: !null } });
                const emailList = await models.emailList.findAll({ attributes: ['name','email'], where:{email: !null} });
               
                return res.render('admin/newsletter/add', {
                    title: 'Send Email',
                    arrData: '',
                    stores: stores,
                    customersList: customersList,
                    emailList: emailList,
                    sessionStoreId: '',
                    messages: req.flash('info'),
                    errors: req.flash('errors')
                });
            }else{
                //*****Permission Assign Start
                let userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'NewsLetterView'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    const stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId, status: 'Yes' } });
                    const customersList = await models.customers.findAll({ attributes: ['firstName', 'lastName','email'], where: { status: 'Yes', storeId : sessionStoreId } });
                    const emailList = await models.emailList.findAll({ attributes: ['name','email'], where: {storeId : sessionStoreId} });

                    return res.render('admin/newsletter/add', {
                        title: 'Send Email',
                        arrData: '',
                        stores: stores,
                        customersList: customersList,
                        emailList: emailList,
                        sessionStoreId: sessionStoreId,
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                }
            }
        }
    });    
};

/**
 * This function is developed for send New email
 * Developer: Partha Mandal
 */
exports.add = async(req, res, next) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const sessionUserId = req.session.user.id;
    const role = req.session.role;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            //*****Permission Assign Start
            let userPermission = false;
            //*****If SupperAdmin Login
            if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
                userPermission = true;
            } else {
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'NewsLetterSend'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                const form = new multiparty.Form();
                form.parse(req, async (err, fields, files) => {
                    const heading = fields.heading[0];
                    const description = fields.description[0];
                    const emails = fields.emails;
                    const storeId = fields.storeId[0];
                    
                    if (heading != '' && description != '' && emails != '') {
                        await models.newsLetter.create({
                            heading: heading,
                            storeId: storeId,
                            description: description,
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
                                    //     user:'bluehorsetest@gmail.com', 
                                    //     pass:'coxfvopxotwuqwzz',
                                    //     }
                                    // });
                                      
                                    let mailOptions = {
                                        from: '"Tezcommerce" <iamnodedeveloper@gmail.com>',
                                        to: email,
                                        subject: heading,
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
                                        <body style="background-color: rgb(229, 250, 249); font-family: 'STIX Two Text', serif;"> ${description} </body>
                                        </html>`

                                        // html: `<!DOCTYPE html>
                                        // <html lang="en">
                                        // <head>
                                        //     <meta charset="UTF-8">
                                        //     <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                        //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                        //     <link rel="preconnect" href="https://fonts.googleapis.com">
                                        //     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                                        //     <link href="https://fonts.googleapis.com/css2?family=STIX+Two+Text:ital@1&display=swap" rel="stylesheet">
                                        // </head>
                                        // <body style="background-color: rgb(229, 250, 249); font-family: 'STIX Two Text', serif;">
                                        //     <center>
                                        //     <br><br><br>
                                        //         <div style="background-color: white; margin:10px 5vw; border-radius: 10px; box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);">
                                        //         <img style="padding-top: 30px; height:60px" src="https://wip.tezcommerce.com:3304/admin/images/logo.png">
                                        //             <h1 style="padding-top: 30px; padding-left: 2vw; padding-right: 2vw;">Thanks for using Tezcommerce</h1>
                                        //             <p style="padding-left: 2vw; padding-right: 2vw; margin-top: 40px; margin-bottom: 30px;">${description}</p>
                                        //         </div>
                                        //     <br><br><br>
                                        //     </center>
                                        // </body>
                                        // </html>`
                                      };

                                      mailgun.messages().send(mailOptions, function (error, body) {
                                        console.log(body);
                                      });
                                      
                                    //   transporter.sendMail(mailOptions, (error, info) => {
                                    //     if (error) {
                                    //         console.log(error);
                                    //         return res.redirect('back');
                                    //     }
                                    //   });

                                    models.newsLetterEmail.create({
                                        newsLetterId: value.id,
                                        storeId: storeId,
                                        emails: email
                                    })
                                }
                                req.flash('info', 'Successfully mail sent');
                                return res.redirect('back');
                            }
                        }).catch((error) => {
                            console.log(error);
                            req.flash('errors', 'Somethings went wrong');
                            return res.redirect('back');
                        });
                    }else{
                        req.flash('errors', 'Please fill the required fields.')
                        return res.redirect('back')
                    }
                });
            }
        }
    })
    
};

/**
 * This function is developed for delete News Letter
 * Developer: Partha Mandal
 */
exports.delete = async(req, res, next) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const role = req.session.role;
    const id = req.params.id;
    jwt.verify(token,SECRET,async (err,decoded) =>{
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            let userPermission = false;
            if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
                userPermission = true;
            } else {
                //*****Permission Assign Start
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'NewsLetterDelete'
                    })
                }
                if (id) {
                    const storeIdChecking = await models.newsLetter.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                await models.newsLetter.destroy({
                    where: { id: id }
                }).then((value) => {
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

/**
 * This function is developed for listing New added eamils
 * Developer: Partha Mandal
*/
exports.newEmailList = async (req, res) => {
    const token= req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const role = req.session.role;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                const storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                const column = req.query.column || 'id';
                const order = req.query.order || 'ASC';
                const pagesizes = req.query.pagesize || 10;
                const pageSize = parseInt(pagesizes);
                const page = req.params.page || 1;
                const search = req.query.search || '';
                const newsLetterList = await models.emailList.findAll({where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                const listCount = await models.emailList.count({where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                    ]
                  }});

                const pageCount = Math.ceil(listCount/pageSize);

                if (newsLetterList) {
                    return res.render('admin/newsletter/emaillist', {
                        title: 'Emails List',
                        arrData: newsLetterList,
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
                    return res.render('admin/newsletter/emaillist', {
                        title: 'Emails List',
                        arrData: '',
                        storeList: '',
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                }
            }else{
                //*****Permission Assign Start
                let userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'NewsLetterList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    const storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });
                    const column = req.query.column || 'id';
                    const order = req.query.order || 'ASC';
                    const pagesizes = req.query.pagesize || 10;
                    const pageSize = parseInt(pagesizes);
                    const page = req.params.page || 1;
                    const search = req.query.search || '';
                    const newsLetterList = await models.emailList.findAll({order: [[column, order]], where: { storeId: sessionStoreId, [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                      ] }, limit:pageSize, offset:(page-1)*pageSize });

                    const listCount = await models.emailList.count({where: { storeId: sessionStoreId, [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                      ] }});

                    const pageCount = Math.ceil(listCount/pageSize);

                    if (newsLetterList) {
                        return res.render('admin/newsletter/emaillist', {
                            title: 'Emails List',
                            arrData: newsLetterList,
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
                        return res.render('admin/newsletter/emaillist', {
                            title: 'Emails List',
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

exports.deleteEmail = async(req, res, next) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const role = req.session.role;
    const id = req.params.id;
    jwt.verify(token,SECRET,async (err,decoded) =>{
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            let userPermission = false;
            if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
                userPermission = true;
            } else {
                //*****Permission Assign Start
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'NewsLetterList'
                    })
                }
                if (id) {
                    const storeIdChecking = await models.emailList.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                await models.emailList.destroy({
                    where: { id: id }
                }).then((value) => {
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
}

exports.addNewEmail = async(req, res, next) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const sessionUserId = req.session.user.id;
    const role = req.session.role;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            //*****Permission Assign Start
            let userPermission = false;
            //*****If SupperAdmin Login
            if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
                userPermission = true;
            } else {
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'NewsLetterList'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                const form = new multiparty.Form();
                form.parse(req, async (err, fields, files) => {
                    const name = fields.name;
                    const email = fields.email;
                    const storeId = fields.storeId[0];

                    if (name != '' && email != '' && storeId != '') {
                        for(let i =0; i< email.length; i++){
                            await models.emailList.create({
                                storeId: storeId,
                                name: name[i],
                                email: email[i],
                                createdBy: sessionUserId
                            })
                        }
                        req.flash('info', 'Successfully added');
                        return res.redirect('/admin/newsletter/newemail/list/1');
                    }else{
                        req.flash('errors', 'Please fill the required fields.')
                        return res.redirect('back')
                    }
                });
            }
        }
    })
    
}

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
                            directory = __dirname + '/../../public/admin/uploadcsv/';
                            filePath = __dirname + '/../../public/admin/uploadcsv/' + file.name;
                            if (!fs.existsSync(directory)){
                                fs.mkdirSync(directory, (err) => {
                                if (err) throw err;
                                });
                                file.path = __dirname + '/../../public/admin/uploadcsv/' + file.name;
                            }else{
                                file.path = __dirname + '/../../public/admin/uploadcsv/' + file.name;
                            }
                        }
                    }
                });	
            
                formnew.on('end', function () {
                    csvtojson().fromFile(filePath).then(async source => { 
                        for (var i = 0; i < source.length; i++) { 
                            await models.emailList.create({
                                storeId: sessionStoreId,
                                name: source[i]["Name"],
                                email: source[i]["Email"],
                                createdBy: sessionUserId
                            })
                        } 
                        req.flash('info', 'Successfully uploaded')
                        return res.redirect('/admin/newsletter/newemail/list/1')
                    }).catch(err=>{
                        req.flash('errors', 'Something went wrong')
                        return res.redirect('back')
                    })
                })
            }else{
                req.flash('errors', 'You are not authorized to upload')
                return res.redirect('back')
            }
        }
    })
}

exports.downloadSample = async (req, res) => {
    const arrData = [{'Name' : 'John Doe', 'Email' : 'john@gmail.com'},
                    {'Name' : 'Jone Roe', 'Email' : 'jone@gmail.com'},
                    {'Name' : 'John Smith', 'Email' : 'smith@gmail.com'}]
    const jsonStudents = JSON.parse(JSON.stringify(arrData));
    const csvFields = [ 'Name', 'Email'];
    const json2csvParser = new Json2csvParser({ csvFields });
    const csvData = json2csvParser.parse(jsonStudents);

    res.setHeader('Content-disposition', 'attachment; filename=Sample.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).end(csvData);
}

exports.viewDetails = async (req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const id = req.params.id;
    jwt.verify(token,SECRET,async (err,decoded) =>{
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            if (id) {
                let title = await models.newsLetter.findOne({attributes: ['heading'],where:{id: id}})
                let details = await models.newsLetterEmail.findAll({where:{newsLetterId: id}})
                return res.render('admin/newsletter/details', {
                    title: `Details of ${title.heading}`,
                    arrData: details,
                    messages: req.flash('info'),
                    errors: req.flash('errors'),
                })
            } else {
                req.flash('errors', 'Something went wrong');
                res.redirect('back');
            }
        }
    })
}

exports.exportData = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    let search = req.query.search || '';
    let fdate = req.query.fdate || '';
    let tdate = req.query.tdate || '';

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
                let whereCondition
                if (fdate !='' && tdate =='') {
                    whereCondition = {createdAt: {$gte: start}}
                }else if(fdate =='' && tdate !=''){
                    whereCondition = {createdAt: {$lte: end}}
                }else if(fdate !='' && tdate !=''){
                    whereCondition = {createdAt:{$gte: start, $lte: end}}
                }

                let newsLetterList

                if(fdate !='' || tdate !=''){
                    newsLetterList = await models.newsLetter.findAll({ where: whereCondition});
                }else{
                    newsLetterList = await models.newsLetter.findAll({where: {
                        [Op.or]: [
                            { heading: { [Op.like]: `%${search}%` } },
                            { scheduleTime: { [Op.like]: `%${search}%` } },
                            { sendingStatus: { [Op.like]: `%${search}%` } },
                            { description: { [Op.like]: `%${search}%` } },
                        ]
                    }})
                }
                
                let arrData = [];
                if (newsLetterList) {
                    for(let emailList of newsLetterList){
                        let emails = await models.newsLetterEmail.findAll({ attributes: ['emails'], where: {newsLetterId: emailList.id}})

                        let datas = emailList.dataValues;
                        if(emails.length>0){
                            let email = ''
                            for(let e of emails){
                                if (email == '') {
                                    email = e.emails
                                } else {
                                    email = email + ', ' + e.emails
                                }
                            }
                            datas.email = email
                        }else{
                            datas.email = ''
                        }

                        arrData.push(datas)
                    }
                }

                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Newsletter");
            
                worksheet.columns = [
                    { header: "Subject", key: "heading", width:25 },
                    { header: "Date", key: "createdAt", width: 15 },
                    { header: "Emails", key: "email", width: 100 },
                ];
            
                // Add Array Rows
                worksheet.addRows(arrData);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Newsletter.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })


            }else{

                let whereCondition
                if (fdate !='' && tdate =='') {
                    whereCondition = {createdAt: {$gte: start},storeId: sessionStoreId}
                }else if(fdate =='' && tdate !=''){
                    whereCondition = {createdAt: {$lte: end},storeId: sessionStoreId}
                }else if(fdate !='' && tdate !=''){
                    whereCondition = {createdAt:{$gte: start, $lte: end},storeId: sessionStoreId}
                }

                let newsLetterList

                if(fdate !='' || tdate !=''){
                    newsLetterList = await models.newsLetter.findAll({ where: whereCondition});
                }else{
                    newsLetterList = await models.newsLetter.findAll({where: {storeId: sessionStoreId,
                        [Op.or]: [
                            { heading: { [Op.like]: `%${search}%` } },
                            { scheduleTime: { [Op.like]: `%${search}%` } },
                            { sendingStatus: { [Op.like]: `%${search}%` } },
                            { description: { [Op.like]: `%${search}%` } },
                        ]
                    }})
                }
                
                let arrData = [];
                if (newsLetterList) {
                    for(let emailList of newsLetterList){
                        let emails = await models.newsLetterEmail.findAll({ attributes: ['emails'], where: {newsLetterId: emailList.id}})

                        let datas = emailList.dataValues;
                        if(emails.length>0){
                            let email = ''
                            for(let e of emails){
                                if (email == '') {
                                    email = e.emails
                                } else {
                                    email = email + ', ' + e.emails
                                }
                            }
                            datas.email = email
                        }else{
                            datas.email = ''
                        }

                        arrData.push(datas)
                    }
                }
                
                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Newsletter");
            
                worksheet.columns = [
                    { header: "Subject", key: "heading", width:25 },
                    { header: "Date", key: "createdAt", width: 15 },
                    { header: "Emails", key: "email", width: 100 },
                ];
            
                // Add Array Rows
                worksheet.addRows(arrData);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Newsletter.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })

                    
            }            
        }	
    });
}