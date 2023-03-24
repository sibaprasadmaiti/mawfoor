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
const paginate = require('express-paginate');
var helper = require('../../helpers/helper_functions');
const Sequelize = require("sequelize");
const Op = Sequelize.Op


/**
 * Description: This function is developed for listing pages
 * Developer: Avijit Das
 */
exports.list = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            if(sessionStoreId==null){
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                let column = req.query.column || 'id';
                let order = req.query.order || 'ASC';
                let pagesizes = req.query.pagesize || 10;
                let pageSize = parseInt(pagesizes);
                let page = req.params.page || 1;
                let search = req.query.search || '';
                let pagesList = await models.pages.findAll({ where: {
                    [Op.or]: [
                      { title: { [Op.like]: `%${search}%` } },
                      { slug: { [Op.like]: `%${search}%` } },
                      { urlKey: { [Op.like]: `%${search}%` } },
                      { heading: { [Op.like]: `%${search}%` } },
                      { shortDescription: { [Op.like]: `%${search}%` } },
                      { content: { [Op.like]: `%${search}%` } },
                      { image: { [Op.like]: `%${search}%` } },
                      { metaTitle: { [Op.like]: `%${search}%` } },
                      { metaKeyword: { [Op.like]: `%${search}%` } },
                      { metaDescription: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.pages.count({where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { slug: { [Op.like]: `%${search}%` } },
                        { urlKey: { [Op.like]: `%${search}%` } },
                        { heading: { [Op.like]: `%${search}%` } },
                        { shortDescription: { [Op.like]: `%${search}%` } },
                        { content: { [Op.like]: `%${search}%` } },
                        { image: { [Op.like]: `%${search}%` } },
                        { metaTitle: { [Op.like]: `%${search}%` } },
                        { metaKeyword: { [Op.like]: `%${search}%` } },
                        { metaDescription: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                  }});
                let pageCount = Math.ceil(listCount/pageSize);

                if (pagesList) {
                    return res.render('admin/pages/list', {
                        title: 'Pages',
                        arrData: pagesList,
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
                        helper: helper
                    });
                } else {
                    return res.render('admin/pages/list', {
                        title: 'Pages',
                        arrData: '',
                        storeList: '',
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                        helper: helper
                    });
                }
            }else{
                //*****Permission Start
                var userPermission = false;
                if(role=='admin'){
                    userPermission =true;
                }else{
                    userPermission =!! req.session.permissions.find(permission=>{
                        return permission ==='PageList'
                    })
                }
                if(userPermission==false){
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                }else{
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });
                    let column = req.query.column || 'id';
                    let order = req.query.order || 'ASC';
                    let pagesizes = req.query.pagesize || 10;
                    let pageSize = parseInt(pagesizes);
                    let page = req.params.page || 1;
                    let search = req.query.search || '';
                    let pagesList = await models.pages.findAll({ order: [[column, order]], where: { storeId: sessionStoreId, [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { slug: { [Op.like]: `%${search}%` } },
                        { urlKey: { [Op.like]: `%${search}%` } },
                        { heading: { [Op.like]: `%${search}%` } },
                        { shortDescription: { [Op.like]: `%${search}%` } },
                        { content: { [Op.like]: `%${search}%` } },
                        { image: { [Op.like]: `%${search}%` } },
                        { metaTitle: { [Op.like]: `%${search}%` } },
                        { metaKeyword: { [Op.like]: `%${search}%` } },
                        { metaDescription: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                      ] }, limit:pageSize, offset:(page-1)*pageSize });

                      let listCount = await models.pages.count({where: { storeId: sessionStoreId, [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { slug: { [Op.like]: `%${search}%` } },
                        { urlKey: { [Op.like]: `%${search}%` } },
                        { heading: { [Op.like]: `%${search}%` } },
                        { shortDescription: { [Op.like]: `%${search}%` } },
                        { content: { [Op.like]: `%${search}%` } },
                        { image: { [Op.like]: `%${search}%` } },
                        { metaTitle: { [Op.like]: `%${search}%` } },
                        { metaKeyword: { [Op.like]: `%${search}%` } },
                        { metaDescription: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                      ] }});
                      let pageCount = Math.ceil(listCount/pageSize);

                    if (pagesList) {
                        return res.render('admin/pages/list', {
                            title: 'Pages',
                            arrData: pagesList,
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
                            helper: helper
                        });
                    } else {
                        return res.render('admin/pages/list', {
                            title: 'Pages',
                            arrData: '',
                            storeList: '',
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper: helper
                        });
                    }
                }                
            }            
        }	
    });
}


/**
 * Description: This function is developed for view for pages
 * Developer: Avijit Das
 */
exports.view = async function(req, res){
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    var id = req.params.id;
    var token = req.session.token;
    jwt.verify(token,SECRET,async function(error,decode){
        if(error){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            if(sessionStoreId==null){
                var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                if (!id) {
                    return res.render('admin/pages/addedit', {
                        title: 'Add Page',
                        arrData: '',
                        stores: stores,
                        sessionStoreId: '',
                        helper: helper,
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var pageDetails = await models.pages.findOne({ where: { id: id } });
                    if (pageDetails) {
                        return res.render('admin/pages/addedit', {
                            title: 'Edit Page',
                            arrData: pageDetails,
                            stores: stores,
                            sessionStoreId: '',
                            helper: helper,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    }
                }
            }else{
                //*****Permission Start
                var userPermission = false;
                if(role=='admin'){
                    userPermission=true;
                }else{
                    userPermission =!! req.session.permissions.find(permission=>{
                        return permission ==='PageView'
                    })
                    if (id) {                        
                        var storeIdChecking = await models.pages.findOne({ attributes: ['storeId'], where: { id: id } }); 
                        //console.log(storeIdChecking.storeId + '====' + sessionStoreId); return false;
                        if (storeIdChecking.storeId != sessionStoreId) {
                            userPermission = false;
                        }
                    }
                }
                
                if(userPermission==false){
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                }else{
                    var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes',id:sessionStoreId } });
                    if (!id) {
                        return res.render('admin/pages/addedit', {
                            title: 'Add Page',
                            arrData: '',
                            stores: stores,
                            sessionStoreId: sessionStoreId,
                            helper: helper,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        var pageDetails = await models.pages.findOne({ where: { id: id } });
                        if (pageDetails) {
                            return res.render('admin/pages/addedit', {
                                title: 'Edit Page',
                                arrData: pageDetails,
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
 * Description: This function is developed for add/update New pages
 * Developer: Avijit Das
 */
exports.addOrUpdate = function(req, res) {
    var token = req.session.token;
    var role= req.session.token;
    var sessionStoreId = req.session.user.storeId;    
    jwt.verify(token,SECRET,async function(error,decode){
        if(error){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            //Permission Start
            var userPermission =false;
            if(sessionStoreId==null){
                userPermission=true;
            }else{
                if(role=='admin'){
                    userPermission=true;
                }else{
                    userPermission =!! req.session.permissions.find(permission=>{
                        return permission ==='PageAddEdit'
                    })
                }
            }
            if(userPermission==false){
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            }else{
                var form = new multiparty.Form();
                form.parse(req, function (err, fields, files) {
                    var id = fields.update_id[0];
                    var urlKey = fields.urlKey[0];
                    var pageTitle = fields.title[0];
                    var slug = fields.slug[0];
                    var storeId = fields.storeId[0];
                    var pageHeading = fields.pageHeading[0];
                    var pagecontent = fields.content[0];
                    var shortDescription = fields.shortDes[0];
                    var pagemetaTitle = fields.metaTitle[0];
                    var pageMetaKeyword = fields.metaKeyword[0];
                    var pageMetaDescription = fields.metaDescription[0];
                    var status = fields.status[0];
                    if (!id) {
                        if (pageTitle != '' && storeId != '' && pageHeading != '') {
                            models.pages.create({
                                title: pageTitle,
                                urlKey: urlKey,
                                storeId: storeId,
                                slug: slug,
                                heading: pageHeading,
                                content: pagecontent,
                                shortDescription: shortDescription,
                                metaTitle: pagemetaTitle,
                                metaKeyword: pageMetaKeyword,
                                metaDescription: pageMetaDescription,
                                status: status
                            }).then(function (value) {
                                if (value) {
                                    //this function is for image
                                    if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                                        var pageImage = Date.now() + files.image[0].originalFilename;
                                        var ImageExt = pageImage.split('.').pop();
                                        var pageImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                                        var userFinalPageImage = pageImageWithEXT.replace("[object Object]", "");
                                        helper.createDirectory('public/admin/pages/image/' + value.id);
                                        var tempPath = files.image[0].path;
                                        var fileName = userFinalPageImage;
                                        var targetPath = "image/" + value.id + "/" + fileName;
                                        helper.uploadPageImageFiles(tempPath, targetPath);
                                    }
                                    //this function  is for metaimage
                                    if (files.metaImage[0].originalFilename != '' && files.metaImage[0].originalFilename != null) {
                                        var pageMetaImage = Date.now() + files.image[0].originalFilename;
                                        var ImageExt = pageMetaImage.split('.').pop();
                                        var pageMetaImageWithEXT = Date.now() + files.metaImage[0] + "." + ImageExt;
                                        var userFinalMetaImage = pageMetaImageWithEXT.replace("[object Object]", "");
                                        helper.createDirectory('public/admin/pages/metaimage/' + value.id);
                                        var tempPath = files.metaImage[0].path;
                                        var fileName = userFinalMetaImage;
                                        var targetPath = "metaimage/" + value.id + "/" + fileName;
                                        helper.uploadPageImageFiles(tempPath, targetPath);
                                    }
                                    models.pages.update({
                                        image: userFinalPageImage,
                                        metaImage: userFinalMetaImage
                                    }, { where: { id: value.id } }).then(function (val) {
                                        if (val) {
                                            req.flash('info', 'Successfully page created');
                                            return res.redirect('/admin/pages/list/1');
                                        }
                                    })
                                }
                            })
                                .catch(function (error) {
                                    console.log(error);
                                    req.flash('errors', 'Something went wrong');
                                });
                        }
                    } else {
                        var pageImageList = models.pages.findOne({ attributes: ['image', 'metaImage'], where: { id: id } });
                        //this function is for image
                        if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                            var pageImage = Date.now() + files.image[0].originalFilename;
                            var ImageExt = pageImage.split('.').pop();
                            var pageImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                            var userFinalPageImage = pageImageWithEXT.replace("[object Object]", "");
                            helper.createDirectory('public/admin/pages/image/' + id);
                            var tempPath = files.image[0].path;
                            var fileName = userFinalPageImage;
                            var targetPath = "image/" + id + "/" + fileName;
                            helper.uploadPageImageFiles(tempPath, targetPath);
                        }
                        //this function  is for metaimage
                        if (files.metaImage[0].originalFilename != '' && files.metaImage[0].originalFilename != null) {
                            var pageMetaImage = Date.now() + files.image[0].originalFilename;
                            var ImageExt = pageMetaImage.split('.').pop();
                            var pageMetaImageWithEXT = Date.now() + files.metaImage[0] + "." + ImageExt;
                            var userFinalMetaImage = pageMetaImageWithEXT.replace("[object Object]", "");
                            helper.createDirectory('public/admin/pages/metaimage/' + id);
                            var tempPath = files.metaImage[0].path;
                            var fileName = userFinalMetaImage;
                            var targetPath = "metaimage/" + id + "/" + fileName;
                            helper.uploadPageImageFiles(tempPath, targetPath);
                        }
                        var oldpageImage = pageImageList.image;
                        var oldpageMetaImage = pageImageList.metaImage;
                        models.pages.update({
                            title: pageTitle,
                            urlKey: urlKey,
                            storeId: storeId,
                            slug: slug,
                            heading: pageHeading,
                            content: pagecontent,
                            shortDescription: shortDescription,
                            metaTitle: pagemetaTitle,
                            metaKeyword: pageMetaKeyword,
                            metaDescription: pageMetaDescription,
                            status: status,
                            image: userFinalPageImage != '' ? userFinalPageImage : oldpageImage,
                            metaImage: userFinalMetaImage != '' ? userFinalMetaImage : oldpageMetaImage
                        }, { where: { id: id } }).then(function (value) {
                            if (value) {
                                req.flash('info', 'Successfully page updated');
                                return res.redirect('/admin/pages/list/1');
                            }
                        })
                            .catch(function (error) {
                                console.log(error);
                                req.flash('errors', 'Something went wrong');
                            });
                    }
                });
            }
        }
    })
    
};


/**
 * This function is developed for delete contentBlocks
 * Developer: Avijit Das
 */
exports.delete = function(req, res) {
    var id = req.params.id;
    var token = req.session.token;
    var role = req.session.role;
    var sessionStoreId = req.session.user.storeId;
    jwt.verify(token,SECRET, async function(error,decode){
        if(error){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            //*****Permissio Start
            var userPermission = false;
            if(sessionStoreId==null){
                userPermission=true;
            }else{
                if(role=='admin'){
                    userPermission=true;                    
                }else{
                    userPermission =!! req.session.permissions.find(permission=>{
                        return permission ==='PageDelete'
                    })                    
                }
                var storeIdChecking = await models.pages.findOne({attributes:['storeId'],where:{id:id}});
                if(storeIdChecking.storeId!=sessionStoreId){
                    userPermission=false;
                }
            }
            if(userPermission==false){
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            }else{
                models.pages.destroy({
                    where: { id: id }
                }).then(function (value) {
                    if (value) {
                        req.flash('info', 'Successfully page deleted');
                        res.redirect('back');
                    } else {
                        req.flash('errors', 'Something went wrong');
                        res.redirect('back');
                    }
                });
            }
        }
    })    	
};  