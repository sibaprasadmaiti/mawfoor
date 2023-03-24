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
 * Description: This function is developed for listing contentBlocks
 * Developer: Avijit Das
*/
exports.list = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role= req.session.role;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if(err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            if(sessionStoreId==null){
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                let column = req.query.column || 'id';
                let order = req.query.order || 'ASC';
                let pagesizes = req.query.pagesize || 10;
                let pageSize = parseInt(pagesizes);
                let page = req.params.page || 1;
                let search = req.query.search || '';
                var contentBlockList = await models.contentBlocks.findAll({where: {
                    [Op.or]: [
                      { slug: { [Op.like]: `%${search}%` } },
                      { group: { [Op.like]: `%${search}%` } },
                      { sequence: { [Op.like]: `%${search}%` } },
                      { title: { [Op.like]: `%${search}%` } },
                      { shortDescription: { [Op.like]: `%${search}%` } },
                      { description: { [Op.like]: `%${search}%` } },
                      { image: { [Op.like]: `%${search}%` } },
                      { link: { [Op.like]: `%${search}%` } },
                      { videoLink: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ], parentId: null
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize});

                let listCount = await models.contentBlocks.count({where: {  parentId: null,
                    [Op.or]: [
                        { slug: { [Op.like]: `%${search}%` } },
                        { group: { [Op.like]: `%${search}%` } },
                        { sequence: { [Op.like]: `%${search}%` } },
                        { title: { [Op.like]: `%${search}%` } },
                        { shortDescription: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } },
                        { image: { [Op.like]: `%${search}%` } },
                        { link: { [Op.like]: `%${search}%` } },
                        { videoLink: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                  }});
                let pageCount = Math.ceil(listCount/pageSize);

                if(contentBlockList){
                    return res.render('admin/contentBlocks/list', {
                        title: 'Content Block List',
                        arrData: contentBlockList,
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
                        errors:req.flash('errors'),
                        helper: helper
                    }); 
                } else {
                    return res.render('admin/contentBlocks/list', {
                        title: 'Content Block List',
                        arrData: '',
                        storeList: '',
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors:req.flash('errors'),
                        helper: helper
                    }); 
                } 
            } else {
                //*****Permission Start
                var userPermission =false;
                if(role=='admin'){
                    userPermission=true;
                }else{
                    userPermission =!! req.session.permissions.find(permission=>{
                        return permission ==='ContentBlockList'
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
                    var contentBlockList = await models.contentBlocks.findAll({order: [[column, order]], where: { parentId: null, storeId: sessionStoreId, [Op.or]: [
                        { slug: { [Op.like]: `%${search}%` } },
                        { group: { [Op.like]: `%${search}%` } },
                        { sequence: { [Op.like]: `%${search}%` } },
                        { title: { [Op.like]: `%${search}%` } },
                        { shortDescription: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } },
                        { image: { [Op.like]: `%${search}%` } },
                        { link: { [Op.like]: `%${search}%` } },
                        { videoLink: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                      ] }, limit:pageSize, offset:(page-1)*pageSize});

                    let listCount = await models.contentBlocks.count({where: { parentId: null, storeId: sessionStoreId, [Op.or]: [
                        { slug: { [Op.like]: `%${search}%` } },
                        { group: { [Op.like]: `%${search}%` } },
                        { sequence: { [Op.like]: `%${search}%` } },
                        { title: { [Op.like]: `%${search}%` } },
                        { shortDescription: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } },
                        { image: { [Op.like]: `%${search}%` } },
                        { link: { [Op.like]: `%${search}%` } },
                        { videoLink: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                      ] }});
                    let pageCount = Math.ceil(listCount/pageSize);

                    if(contentBlockList){
                        return res.render('admin/contentBlocks/list', {
                            title: 'Content Block List',
                            arrData: contentBlockList,
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
                            errors:req.flash('errors'),
                            helper: helper
                        }); 
                    } else {
                        return res.render('admin/contentBlocks/list', {
                            title: 'Content Block List',
                            arrData: '',
                            storeList: '',
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors:req.flash('errors'),
                            helper: helper
                        }); 
                    }
                }
            }
        }	
    });
}
/**
 * Description: This function is developed for view for contentBlocks
 * Developer: Avijit Das
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
                var pageList = await models.pages.findAll({ attributes: ['id', 'title'], where: { status: 'Yes' } });
                var parentList = await models.contentBlocks.findAll({ attributes: ['id', 'title'], where: {parentId: null, status: 'Yes' } });
                if (!id) {
                    return res.render('admin/contentBlocks/addedit', {
                        title: 'Add Content Block',
                        arrData: '',
                        stores: stores,
                        pageList: pageList,
                        parentList: parentList,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var contentBlocks = await models.contentBlocks.findOne({ where: { id: id } });
                    if (contentBlocks) {
                        return res.render('admin/contentBlocks/addedit', {
                            title: 'Edit Content Block',
                            arrData: contentBlocks,
                            stores: stores,
                            pageList: pageList,
                            parentList: parentList,
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
                        return permission === 'ContentBlockView'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.contentBlocks.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId, status: 'Yes' } });
                    var pageList = await models.pages.findAll({ attributes: ['id', 'title'], where: {storeId: sessionStoreId, status: 'Yes' } });
                    var parentList = await models.contentBlocks.findAll({ attributes: ['id', 'title'], where: {parentId: null, storeId: sessionStoreId, status: 'Yes' } });

                    if (!id) {
                        return res.render('admin/contentBlocks/addedit', {
                            title: 'Add Content Block',
                            arrData: '',
                            stores: stores,
                            pageList: pageList,
                            parentList: parentList,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        var contentBlocks = await models.contentBlocks.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (contentBlocks) {
                            return res.render('admin/contentBlocks/addedit', {
                                title: 'Edit Content Block',
                                arrData: contentBlocks,
                                stores: stores,
                                pageList: pageList,
                                parentList: parentList,
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
 * Description: This function is developed for add/update New contentBlocks
 * Developer: Avijit Das
*/
exports.addOrUpdate = function(req, res) {
    var token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    jwt.verify(token,SECRET, async function(error,decode){
        if(error){
            req.flash('info','Invalid Token');
            res.rediret('auth/signin');
        }else{
            //*****Permission Start
            var userPermission = false;
            if(sessionStoreId==null){
                userPermission=true;
            }else{
                if(role=='admin'){
                    userPermission=true;
                }else{
                    userPermission =!!req.session.permissions.find(permission=>{
                        return permission ==='ContentBlockAddEdit'
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
                    var contentTitle = fields.title[0];
                    var slug = fields.slug[0];
                    var pageId = fields.pageId[0] || null;
                    var parentId = fields.parentId[0]|| null;
                    var storeId = fields.storeId[0];
                    var sequence = fields.seq[0];
                    var groupTitle = fields.group[0];
                    var shortDescription = fields.shortDes[0];
                    var description = fields.description[0];
                    var url = fields.contentLink[0];
                    var videoUrl = fields.videoLink[0];
                    var status = fields.status[0];
                    if (!id) {
                        if (contentTitle != '' && storeId != '' && groupTitle != '') {
                            models.contentBlocks.create({
                                title: contentTitle,
                                storeId: storeId,
                                slug: slug,
                                pageId: pageId,
                                parentId: parentId,
                                sequence: sequence,
                                group: groupTitle,
                                shortDescription: shortDescription,
                                description: description,
                                link: url,
                                videoLink: videoUrl,
                                status: status
                            }).then(function (value) {
                                if (value) {
                                    if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                                        var contentImage = Date.now() + files.image[0].originalFilename;
                                        var ImageExt = contentImage.split('.').pop();
                                        var contentImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                                        var userFinalContentImage = contentImageWithEXT.replace("[object Object]", "");
                                        helper.createDirectory('public/admin/contentblock/image/' + value.id);
                                        var tempPath = files.image[0].path;
                                        var fileName = userFinalContentImage;
                                        var targetPath = "image/" + value.id + "/" + fileName;
                                        helper.uploadContentImageFiles(tempPath, targetPath);
                                    }
                                    models.contentBlocks.update({
                                        image: userFinalContentImage
                                    }, { where: { id: value.id } }).then(function (val) {
                                        if (val) {
                                            req.flash('info', 'Successfully content block created');
                                            return res.redirect('/admin/contentBlock/list/1');
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
                        var contentBlockImage = models.contentBlocks.findOne({ attributes: ['image'], where: { id: id } });
                        if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                            var contentImage = Date.now() + files.image[0].originalFilename;
                            var ImageExt = contentImage.split('.').pop();
                            var contentImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                            var userFinalContentImage = contentImageWithEXT.replace("[object Object]", "");
                            helper.createDirectory('public/admin/contentblock/image/' + id);
                            var tempPath = files.image[0].path;
                            var fileName = userFinalContentImage;
                            var targetPath = "image/" + id + "/" + fileName;
                            helper.uploadContentImageFiles(tempPath, targetPath);
                        }
                        var oldContentBlockImage = contentBlockImage.image;
                        models.contentBlocks.update({
                            title: contentTitle,
                            storeId: storeId,
                            slug: slug,
                            pageId: pageId,
                            parentId: parentId,
                            sequence: sequence,
                            group: groupTitle,
                            shortDescription: shortDescription,
                            description: description,
                            link: url,
                            videoLink: videoUrl,
                            status: status,
                            image: userFinalContentImage != '' ? userFinalContentImage : oldContentBlockImage
                        }, { where: { id: id } }).then(function (value) {
                            if (value) {
                                req.flash('info', 'Successfully content block updated');
                                return res.redirect('/admin/contentBlock/list/1');
                            }
                        }).catch(function (error) {
                            console.log(error);
                            req.flash('errors', 'Something went wrong');
                        });
                    }
                });
            }
        }
    });    
};


/**
 * This function is developed for delete contentBlocks
 * Developer: Avijit Das
*/
exports.delete = function(req, res) {
    var token = req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    var id = req.params.id;
    jwt.verify(token,SECRET, async function(error,decode){
        if(error){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            //*****Permission Start
            var userPermission =false;
            if (sessionStoreId==null){
                userPermission =true;
            }else{
                if(role=='admin'){
                    userPermission=true;
                }else{
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission ==='ContentBlockDelete'
                    })
                }
                var storeIdChecking = await models.contentBlocks.findOne({ attributes: ['storeId'], where: { id: id } });
                if (storeIdChecking.storeId != sessionStoreId) {
                    userPermission = false;
                }
            }            
            if(userPermission==false){
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            }else{
                models.contentBlocks.destroy({
                    where: { id: id }
                }).then(function (value) {
                    if (value) {
                        req.flash('info', 'Successfully content block deleted');
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
 * This function is developed for listing sub contentBlocks
 * Developer: Partha Mandal
*/
exports.subBlockList = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role= req.session.role;
    var id = req.params.id;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if(err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            if(sessionStoreId==null){
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                var contentBlockList = await models.contentBlocks.findAll({where: {parentId:id}});

                if(contentBlockList){
                    return res.render('admin/contentBlocks/subblocklist', {
                        title: 'Content Block List',
                        arrData: contentBlockList,
                        storeList: storeList,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors:req.flash('errors'),
                        helper: helper
                    }); 
                } else {
                    return res.render('admin/contentBlocks/subblocklist', {
                        title: 'Content Block List',
                        arrData: '',
                        storeList: '',
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors:req.flash('errors'),
                        helper: helper
                    }); 
                } 
            } else {
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId}});
                var contentBlockList = await models.contentBlocks.findAll({where: {parentId:id, storeId: sessionStoreId}});

                if(contentBlockList){
                    return res.render('admin/contentBlocks/subblocklist', {
                        title: 'Content Block List',
                        arrData: contentBlockList,
                        sessionStoreId: sessionStoreId,
                        messages: req.flash('info'),
                        errors:req.flash('errors'),
                        helper: helper
                    }); 
                } else {
                    return res.render('admin/contentBlocks/subblocklist', {
                        title: 'Content Block List',
                        arrData: '',
                        storeList: '',
                        sessionStoreId: sessionStoreId,
                        messages: req.flash('info'),
                        errors:req.flash('errors'),
                        helper: helper
                    }); 
                }
            }
        }	
    });
}