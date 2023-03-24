const models = require('../../models');
const bcrypt = require('bcrypt-nodejs');
const multiparty = require('multiparty'); 
const jwt = require('jsonwebtoken');
const SECRET = 'nodescratch';
const paginate = require('express-paginate');
const config = require('../../config/config.json');
const Sequelize = require("sequelize");
const Op = Sequelize.Op
const helper = require('../../helpers/helper_functions');
const emailConfig = require('../../config/email-config')();
const mailgun = require("mailgun-js")(emailConfig);
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
 * This function is developed for listing Store
 * @param req
 * @param res 
 * Developer: Avijit Das
 */
exports.list = function(req, res){
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var role = req.session.role;

    //console.log(sessionStoreId);
    var currPage = req.query.page ? req.query.page : 0;
    var limit = req.query.limit ? req.query.limit : 10;
    var offset = currPage!=0 ? (currPage * limit) - limit : 0;
    var token= req.session.token;
        jwt.verify(token, SECRET, function(err, decoded) {
            if (err) {
                req.flash("info", "Invalid Token");
                res.redirect('/auth/signin');
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
                            return permission === 'StoreList'
                        })
                    }
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                }else{
                    var whereCondition='';
                    if (sessionStoreId==null){
                        whereCondition = { status: { $ne: 'Archive' }};
                    } else {
                        whereCondition = [{ status: { $ne: 'Archive' } }, { id: sessionStoreId }];
                    }
                    var storeList = models.stores.findAndCountAll({ where: whereCondition,limit: limit, offset: offset});
                    storeList.then(function (results) {
                        const itemCount = results.count;
                        const pageCount = Math.ceil(results.count / limit);
                        const previousPageLink = paginate.hasNextPages(req)(pageCount);
                        const startItemsNumber = currPage== 0 || currPage==1 ? 1 : (currPage - 1) * limit +1;
                        const endItemsNumber = pageCount== currPage ||  pageCount== 1 ? itemCount : currPage * limit ;
                        return res.render('admin/stores/list', {
                            title: 'Stores',
                            arrData: results.value,
                            arrData:results.rows,
                            arrOption:'',
                            messages: req.flash('info'),
                            errors:req.flash('errors'),
                            pageCount,
                            itemCount,
                            currentPage: currPage,
                            previousPage : previousPageLink	,
                            startingNumber: startItemsNumber,
                            endingNumber: endItemsNumber,
                            pages: paginate.getArrayPages(req)(limit, pageCount, currPage)	
                        }); 
                    })
                }
            }	
        });
}

/**
 * This function is developed for addedit Store
 * @param req
 * @param res 
 * Developer: Avijit Das
 */
exports.view = async function(req, res){
    var id = req.params.id;
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var role = req.session.role;
    var token = req.session.token;
    jwt.verify(token, SECRET, async function (err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
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
                        return permission === 'StoreView'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                if (!id && sessionStoreId==null){
                    const permissionGroupList = await models.permissionGroup.findAll({attributes:['id','groupName']})
                    return res.render('admin/stores/addedit',{
                        title: 'Add Stores',
                        logDetails: [],
                        permissionGroupList: permissionGroupList,
                        arrData:'',
                        messages: req.flash('info'),
                        errors:req.flash('errors')
                    });
                }else{
                    if (sessionStoreId == id || (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null)){
                        var storeList = models.stores.findOne({ where: { id: sessionStoreId == null ? id : sessionStoreId} });
                        const permissionLog = await models.permissionLog.findAll({ where: { storeId: id } })
                        const permissionGroupList = await models.permissionGroup.findAll({attributes:['id','groupName']})
                        const logDetails = []
                        if(permissionLog.length>0){
                            for(let log of permissionLog){
                                const group = await models.permissionGroup.findOne({attributes:['groupName'], where: { id: log.permissionGroupId } })
                                logDetails.push({id:log.permissionGroupId, groupName:group.groupName})
                            }
                        }
                        storeList.then(function (value) {
                            return res.render('admin/stores/addedit',{    
                                title: 'Edit Stores',
                                logDetails: logDetails,
                                permissionGroupList: permissionGroupList,
                                arrData: value,
                                messages: req.flash('info'),
                                errors:req.flash('errors')
                            });
                        });	
                    }else{
                        req.flash('errors', 'Contact Your administrator for permission');
                        return res.redirect('/admin/dashboard');
                    }
                }
            }
        }
    })
};


/**
 * This function is developed for add/update New Store
 * @param req
 * @param res 
 * Developer: Avijit Das
 */
exports.addOrUpdate = async function(req, res) {
    var token = req.session.token;
    var form = new multiparty.Form();
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var role = req.session.role;
    jwt.verify(token, SECRET, async function (err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
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
                        return permission === 'StoreAddEdit'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                form.parse(req, async function(err, fields, files) {
                    const id = fields.update_id[0];
                    const str = fields.storeName ? fields.storeName[0] : '';
                    const store = str.replace(" ", "").substr(0, 3).toUpperCase();
                    const storeCode = store;
                    const storeName = fields.storeName[0];
                    const sSlug = fields.slug[0];
                    const company = fields.company[0];
                    const storeOwner = fields.sOwnerName[0];
                    const email = fields.sEmail[0];
                    const address = fields.address[0];
                    const mobile = fields.mobile[0];
                    const fax = fields.fax[0];
                    const cCode = fields.cCode[0];
                    const gstn = fields.gstn[0];
                    const siteURL = fields.siteURL[0];
                    const sslRedirect = fields.sslRedirect[0];
                    const copyright = fields.copyright[0];
                    const version = fields.version[0];
                    const location = fields.location[0];
                    const country = fields.country[0];
                    const latitude = fields.latitude[0];
                    const longitude = fields.longitude[0];
                    const facebookLink = fields.facebookLink[0];
                    const instagramLink = fields.instagramLink[0];
                    const twitterLink = fields.twitterLink[0];
                    const youtubeLink = fields.youtubeLink[0];
                    const otherLink = fields.otherLink[0];
                    const permission = fields.permission || []
                    
                    if (storeName != '' && sSlug != '' && email != '' && mobile != '') {
                        if(!id){
                            const currentTime = Date.now()
                            var hash = bcrypt.hashSync(currentTime);
                            var uniqueMobileEmail = await models.admins.count({ where: { email: email, mobile: mobile } });
                            if (uniqueMobileEmail == 0) {
                                await models.stores.create({
                                    storeName: storeName,
                                    slug: sSlug,
                                    company:company,
                                    storeOwner:storeOwner,
                                    email:email,
                                    address:address,
                                    mobile:mobile,
                                    fax:fax,
                                    cCode:cCode,
                                    gstn:gstn,
                                    siteURL:siteURL,
                                    sslRedirect:sslRedirect,
                                    copyright:copyright,
                                    version:version,
                                    location:location,
                                    country:country,
                                    latitude:latitude,
                                    longitude:longitude,
                                    facebookLink:facebookLink,
                                    instagramLink:instagramLink,
                                    twitterLink:twitterLink,
                                    youtubeLink:youtubeLink,
                                    otherLink:otherLink,
                                    status:fields.status[0],
                                }).then(async(stores) =>{
                                    const resizeDetails = [
                                        {moduleName: "product", width: null, height: 300},
                                        {moduleName: "brand", width: null, height: 300},
                                        {moduleName: "gallery", width:null, height: 300},
                                        {moduleName: "module", width:null, height: 300},
                                        {moduleName: "moduleItem", width:null, height: 300},
                                        {moduleName: "dynamicSection", width:null, height: 300},
                                        {moduleName: "subSection", width:null, height: 300},
                                        {moduleName: "store", width:null, height: 300},
                                        {moduleName: "blog", width:null, height: 300}
                                    ]

                                    for(let rd of resizeDetails){
                                        await models.imageResize.create({
                                            storeId: stores.id,
                                            moduleName: rd.moduleName,
                                            height: rd.height,
                                            width: rd.width,
                                            createdBy: sessionUserId
                                        })
                                    }
                                    
                                    if(permission.length>0){
                                        await models.permissionLog.destroy({where:{storeId:stores.id}})
                                        for(let i=0; i<permission.length; i++){
                                            await models.permissionLog.create({
                                                storeId:stores.id,
                                                permissionGroupId:permission[i],
                                                createdBy:sessionUserId
                                            })
                                        }
                                    }

                                    let logoImageName = null
                                    let fabIconName = null
                                    if (files.logo[0].originalFilename != '' && files.logo[0].originalFilename != null) {
                                        let logoImage = Date.now() + files.logo[0].originalFilename;
                                        let ImageExt = logoImage.split('.').pop();
                                        let logoImageWithEXT = Date.now() + files.logo[0] + "." + ImageExt;
                                        let finallogoImage = logoImageWithEXT.replace("[object Object]", "");
                                        helper.createDirectory('public/admin/stores/' + stores.id);
                                        let tempPath = files.logo[0].path;
                                        let fileName = finallogoImage;
                                        logoImageName = fileName
                                        let targetPath = stores.id + "/" + fileName;
                                        helper.uploadLogoImage(tempPath, targetPath);
                                    }

                                    if (files.fabIcon[0].originalFilename != '' && files.fabIcon[0].originalFilename != null) {
                                        let fabIconImage = Date.now() + files.fabIcon[0].originalFilename;
                                        let ImageExt = fabIconImage.split('.').pop();
                                        let fabIconImageWithEXT = Date.now() + files.fabIcon[0] + "." + ImageExt;
                                        let finalfabIconImage = fabIconImageWithEXT.replace("[object Object]", "");
                                        helper.createDirectory('public/admin/stores/' + stores.id);
                                        let tempPath = files.fabIcon[0].path;
                                        let fileName = finalfabIconImage;
                                        fabIconName = fileName
                                        let targetPath = stores.id + "/" + fileName;
                                        helper.uploadLogoImage(tempPath, targetPath);
                                    }

                                    var storeId = stores.id
                                    var newStoresCode = storeCode + storeId;
                                    await models.stores.update({ 
                                        storeCode: newStoresCode,                        
                                        logo: logoImageName,                        
                                        fabIcon: fabIconName,                        
                                    }, { where: { id: stores.id } }).then(async function (storesUpdate) {
                                        await models.admins.create({
                                            storeId: storeId,
                                            adminName: storeOwner,
                                            email: email,
                                            username: email,
                                            mobile: mobile,
                                            password: hash,
                                            status: 'active'
                                        }).then(async function(userCreate){
                                            if (userCreate) {
                                                //*****Role Create Start
                                                await models.roles.create({
                                                    name: 'Admin',
                                                    storeId: storeId,
                                                    slug: 'admin',
                                                    description: 'admin',
                                                    status: 'Yes',
                                                    createdBy: sessionUserId
                                                }).then(async function (roleCreate) {
                                                    if (roleCreate) {
                                                //*****Assign Role Start
                                                        await models.modelHasRoles.create({
                                                            storeId: storeId,
                                                            roleId: roleCreate.id,
                                                            userId: userCreate.id,
                                                            createdBy: sessionUserId
                                                        }).then(function (assignRole) {
                                                            if (assignRole) {
                                                                const url = "https://partner.tezcommerce.com/home"
                                                                const from = "bluehorsetest@gmail.com"
                                                                let mailOptions = {
                                                                    from: `"Tezcommerce | iUdyog" <${from}>`,
                                                                    to: email,
                                                                    subject: "Login Credentials",
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
                                                                    <body style="background-color: rgb(229, 250, 249); font-family: 'STIX Two Text', serif;">
                                                                    Please use below details for login admin dashboard <br />
                                                                    Username: ${email} <br />
                                                                    Password: ${currentTime} <br />
                                                                    Hostname: ${cCode} <br /><br />
                                                                    <a href="${url}" style="text-decoration: none; color: blue;">Click here</a>
                                                                    </body>
                                                                    </html>`
                                                                };

                                                                mailgun.messages().send(mailOptions, function (error, body) {
                                                                    console.log(body);
                                                                });

                                                                req.flash('info', 'Successfully stores created');
                                                                return res.redirect('/admin/stores');
                                                            }
                                                        })
                                                    }
                                                })
                                                //req.flash('info', 'Successfully stores created');
                                                //return res.redirect('/admin/stores/list');
                                            }
                                        })                        
                                    }).catch(function(error) {
                                        req.flash('errors','Something went wrong');
                                        console.log(error);
                                    });
                                }).catch(function(error) {
                                    console.log(error);
                                    req.flash('error','Something went wrong');
                                });
                            } else {
                                req.flash('errors', 'Email Id or Mobile already exist');
                                return res.redirect('/admin/stores/view');
                            }
                        } else{
                            var uniqueMobileEmail = await models.stores.count({ where: { id: { $ne: id }, $or: [{ email: email }, { mobile: mobile }] } });
                            if (uniqueMobileEmail == 0) {
                                var newStoresCode = storeCode + id;
                                models.stores.update({
                                    storeCode:newStoresCode,
                                    storeName: storeName,
                                    slug: sSlug,
                                    company:company,
                                    storeOwner:storeOwner,
                                    email:email,
                                    address:address,
                                    mobile:mobile,
                                    fax:fax,
                                    cCode:cCode,
                                    gstn:gstn,
                                    siteURL:siteURL,
                                    sslRedirect:sslRedirect,
                                    copyright:copyright,
                                    version:version,
                                    location:location,
                                    country:country,
                                    latitude:latitude,
                                    longitude:longitude,
                                    facebookLink:facebookLink,
                                    instagramLink:instagramLink,
                                    twitterLink:twitterLink,
                                    youtubeLink:youtubeLink,
                                    otherLink:otherLink,
                                    status:fields.status[0],
                                }, { where: { id: id}}).then(async (stores) => {
                                    if(stores) {

                                        if(permission.length>0){
                                            await models.permissionLog.destroy({where:{storeId: id}})
                                            for(let i=0; i<permission.length; i++){
                                                await models.permissionLog.create({
                                                    storeId: id,
                                                    permissionGroupId:permission[i],
                                                    createdBy:sessionUserId
                                                })
                                            }
                                        }

                                        let logoImageName = null
                                        let fabIconName = null
                                        if (files.logo[0].originalFilename != '' && files.logo[0].originalFilename != null) {
                                            let logoImage = Date.now() + files.logo[0].originalFilename;
                                            let ImageExt = logoImage.split('.').pop();
                                            let logoImageWithEXT = Date.now() + files.logo[0] + "." + ImageExt;
                                            let finallogoImage = logoImageWithEXT.replace("[object Object]", "");
                                            helper.createDirectory('public/admin/stores/' + id);
                                            let tempPath = files.logo[0].path;
                                            let fileName = finallogoImage;
                                            logoImageName = fileName
                                            let targetPath = id + "/" + fileName;
                                            helper.uploadLogoImage(tempPath, targetPath);
                                        }

                                        if (files.fabIcon[0].originalFilename != '' && files.fabIcon[0].originalFilename != null) {
                                            let fabIconImage = Date.now() + files.fabIcon[0].originalFilename;
                                            let ImageExt = fabIconImage.split('.').pop();
                                            let fabIconImageWithEXT = Date.now() + files.fabIcon[0] + "." + ImageExt;
                                            let finalfabIconImage = fabIconImageWithEXT.replace("[object Object]", "");
                                            helper.createDirectory('public/admin/stores/' + id);
                                            let tempPath = files.fabIcon[0].path;
                                            let fileName = finalfabIconImage;
                                            fabIconName = fileName
                                            let targetPath = id + "/" + fileName;
                                            helper.uploadLogoImage(tempPath, targetPath);
                                        }

                                        await models.stores.update({
                                            logo: logoImageName,
                                            fabIcon: fabIconName
                                        }, { where: { id: id } })

                                        req.flash('info','Successfully stores updated');
                                        return res.redirect('/admin/stores');
                                    }
                                })
                                .catch(function(error) {
                                    console.log(error);
                                    req.flash('errors','Something went wrong')
                                });
                            } else {
                                req.flash('errors', 'Email Id or Mobile already exist');
                                return res.redirect('/admin/stores/view');
                            }
                        }
                    }else{
                        req.flash('errors', 'Mandatory Fields Are Required');
                        return res.redirect('/admin/stores/view');
                    }
                });
            }
        }
    })
};

/**
 * This function is developed for delete Store
 * @param req
 * @param res
 * Developer: Avijit Das
 */
exports.delete = async function(req, res) {
    var id = req.params.id;
    var sessionStoreId = req.session.user.storeId;
    var sessionUserId = req.session.user.id;
    var token = req.session.token;
    jwt.verify(token, SECRET, async function (err, decoded) {
        if (err) {
            req.flash("errors", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            if (sessionStoreId==null){
                try {
                    await models.admins.destroy({
                        where: { storeId: id }
                    })
                    await models.stores.destroy({
                        where: { id: id }
                    })
                    
                    req.flash('info', 'Successfully stores deleted');
                    return res.redirect('back');
                } catch (error) {
                    req.flash('errors', 'Something went wrong');
                    return res.redirect('back');
                }
                
            }else{
                req.flash('errors', 'Contact Your administrator for permission');
                return res.redirect('/admin/dashboard');
            }
        }
    });
};   

const sendEmail = async (req, res) => {
    try {
        const storeIds = [22]
        const password = "123456"
        const url = "https://partner.tezcommerce.com/home"
        const storeDetails = await models.stores.findAll({attributes:['storeName','email','cCode'], where:{id: {[Op.in]: storeIds}}})
        for(let sd of storeDetails){
            console.log(sd)
            const from = "bluehorsetest@gmail.com"
            let mailOptions = {
                from: `"Partner App | iUdyog" <${from}>`,
                to: sd.email,
                subject: "Login Credentials",
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
                <body style="background-color: rgb(229, 250, 249); font-family: 'STIX Two Text', serif;">
                Please use below details for login admin dashboard <br />
                Username: ${sd.email} <br />
                Password: ${password} <br />
                Hostname: ${sd.cCode} <br /><br />
                <a href="${url}" style="text-decoration: none; color: blue;">Click here to login</a>
                </body>
                </html>`
            };

            mailgun.messages().send(mailOptions, function (error, body) {
                console.log(body);
            });
        }
    } catch (error) {
        console.log(error)
    }
}

// sendEmail()