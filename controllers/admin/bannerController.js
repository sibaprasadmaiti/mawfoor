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
const Sequelize = require("sequelize");
const Op = Sequelize.Op

/**
 * Description: This function is developed for listing banners
 * Developer:Partha Mandal
 */
exports.list = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            if (sessionStoreId == null) {
                // let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                let storeList = await models.brands.findAll({ attributes: ['id', 'title'] });
                let column = req.query.column || 'id';
                let order = req.query.order || 'ASC';
                let pagesizes = req.query.pagesize || 10;
                let pageSize = parseInt(pagesizes);
                let page = req.params.page || 1;
                let search = req.query.search || '';
                let banners = await models.banner.findAll({attributes:['id','storeId','title','image','coverImage','status','categoryId'], where: {
                    [Op.or]: [
                      { title: { [Op.like]: `%${search}%` } },
                      { image: { [Op.like]: `%${search}%` } },
                      { coverImage: { [Op.like]: `%${search}%` } },
                      { shortDescription: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize});

                let listCount = await models.banner.count({where: {
                    [Op.or]: [
                      { title: { [Op.like]: `%${search}%` } },
                      { image: { [Op.like]: `%${search}%` } },
                      { coverImage: { [Op.like]: `%${search}%` } },
                      { shortDescription: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ]
                  },});
                let pageCount = Math.ceil(listCount/pageSize);
                if(banners){
                    return res.render('admin/banner/list', {
                        title: 'Banner List',
                        arrData: banners,
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
                    return res.render('admin/banner/list', {
                        title: 'Banner List',
                        arrData: '',
                        storeList: '',
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors:req.flash('errors'),
                        helper: helper
                    }); 
                }
            } else {
                //*****Permission Assign Start
                var userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'BannerList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    // let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });
                    let storeList = await models.brands.findAll({ attributes: ['id', 'title'] });
                    let column = req.query.column || 'id';
                    let order = req.query.order || 'ASC';
                    let pagesizes = req.query.pagesize || 10;
                    let pageSize = parseInt(pagesizes);
                    let page = req.params.page || 1;
                    let search = req.query.search || '';
                    let banners = await models.banner.findAll({attributes:['id','storeId','title','image','coverImage','status','categoryId'],  order: [[column, order]], where:{storeId: sessionStoreId,  [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { image: { [Op.like]: `%${search}%` } },
                        { coverImage: { [Op.like]: `%${search}%` } },
                        { shortDescription: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                      ]}, limit:pageSize, offset:(page-1)*pageSize});

                    let listCount = await models.banner.count({where:{storeId: sessionStoreId,  [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { image: { [Op.like]: `%${search}%` } },
                        { coverImage: { [Op.like]: `%${search}%` } },
                        { shortDescription: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                      ]}});
                      
                    let pageCount = Math.ceil(listCount/pageSize);
                    if(banners){
                        return res.render('admin/banner/list', {
                            title: 'Banner List',
                            arrData: banners,
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
                        return res.render('admin/banner/list', {
                            title: 'Banner List',
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
 * Description: This function is developed for view for banners
 * Developer:Partha Mandal
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
                var categories = await models.categories.findAll({attributes:['id','title'],where:{status:'Yes'}});
                var brands = await models.brands.findAll({attributes:['id','title'],where:{storeId: 30, status:'Yes'}});
                var bannerSection = await models.bannersection.findAll({attributes:['id','title'],where:{status:'Yes'},order : [['sequence', 'ASC']]});
                var bannerDisplay = await models.bannerdisplay.findAll({attributes:['id','title'],where:{status:'Yes'}});
                if (!id) {
                    return res.render('admin/banner/addedit', {
                        title: 'Add Banner',
                        arrData: '',
                        stores: stores,
                        categories:categories,
                        bannerSection:bannerSection,
                        bannerDisplay:bannerDisplay,
                        brands:brands,
                        sessionStoreId: '',
                        helper: helper,
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var banner = await models.banner.findOne({ where: { id: id } });
                    if (banner) {
                        return res.render('admin/banner/addedit', {
                            title: 'Edit Banner',
                            arrData: banner,
                            stores: stores,
                            categories:categories,
                            brands:brands,
                            bannerSection:bannerSection,
                            bannerDisplay:bannerDisplay,
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
                        return permission === 'bannerView'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.banner.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId, status: 'Yes' } });
                    var categories = await models.categories.findAll({attributes:['id','title'],where:{status:'Yes'}});
                    var brands = await models.brands.findAll({attributes:['id','title'],where:{storeId: 30, status:'Yes'}});
                    var bannerSection = await models.bannersection.findAll({attributes:['id','title'],where:{storeId: sessionStoreId, status:'Yes'},order : [['sequence', 'ASC']]});
                    var bannerDisplay = await models.bannerdisplay.findAll({attributes:['id','title'],where:{storeId: sessionStoreId, status:'Yes'}});
                    if (!id) {
                        return res.render('admin/banner/addedit', {
                            title: 'Add Banner',
                            arrData: '',
                            stores: stores,
                            categories:categories,
                            brands:brands,
                            bannerSection:bannerSection,
                            bannerDisplay:bannerDisplay,
                            sessionStoreId: sessionStoreId,
                            helper: helper,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        var banner = await models.banner.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (banner) {
                            return res.render('admin/banner/addedit', {
                                title: 'Edit Banner',
                                arrData: banner,
                                stores: stores,
                                categories:categories,
                                brands:brands,
                                bannerSection:bannerSection,
                                bannerDisplay:bannerDisplay,
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
 * Description: This function is developed for add/update Banners
 * Developer:Partha Mandal
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
            if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
                userPermission = true;
            } else {
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'BannerAddEdit'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                var form = new multiparty.Form();
                form.parse(req, function (err, fields, files) {
                    // return res.send(files);
                    var id = fields.updateId[0];
                    var title = fields.title[0];
                    var storeId = fields.storeId[0];
                    var categoryId = fields.categoryId[0] ? fields.categoryId[0] : null;
                    var brandId = fields.brandId[0] ? fields.brandId[0] : null;
                    var shortDescription = fields.shortDescription[0];
                    var type = fields.type[0];
                    // var section = fields.section[0];
                    // var displayType = fields.displayType[0];
                    var sequence = fields.sequence[0];
                    var status = fields.status[0];
                    if (!id) {
                        if (title != '' && storeId != '' && sequence != '' && status != '') {
                        models.banner.create({
                            title: title,
                            storeId: storeId,
                            shortDescription: shortDescription,
                            type: type,
                            // type: 'slider',
                            sequence: sequence,
                            status: status,
                            categoryId: categoryId,
                            brandId: brandId,
                            createdBy: sessionUserId,
                        }).then((value)=> {
                            if (value) {
                               //this function is for image
                               if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                                var bannerImage = Date.now() + files.image[0].originalFilename;
                                var ImageExt = bannerImage.split('.').pop();
                                var bannerImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                                var userFinalbannerImage = bannerImageWithEXT.replace("[object Object]", "");
                                helper.createDirectory('public/admin/banner/image/' + value.id);
                                var tempPath = files.image[0].path;
                                var fileName = userFinalbannerImage;
                                var targetPath = "image/" + value.id + "/" + fileName;
                                helper.uploadBannerImageFiles(tempPath, targetPath);
                            }
                            //this function  is for coverImage
                            if (files.coverImage[0].originalFilename != '' && files.coverImage[0].originalFilename != null) {
                                var bannercoverImage = Date.now() + files.coverImage[0].originalFilename;
                                var ImageExt = bannercoverImage.split('.').pop();
                                var bannercoverImageWithEXT = Date.now() + files.coverImage[0] + "." + ImageExt;
                                var userFinalcoverImage = bannercoverImageWithEXT.replace("[object Object]", "");
                                helper.createDirectory('public/admin/banner/coverImage/' + value.id);
                                var tempPath = files.coverImage[0].path;
                                var fileName = userFinalcoverImage;
                                var targetPath = "coverImage/" + value.id + "/" + fileName;
                                helper.uploadBannerImageFiles(tempPath, targetPath);
                            }  models.banner.update({
                                image: userFinalbannerImage,
                                coverImage: userFinalcoverImage
                            }, { where: { id: value.id } }).then(function (val) {
                                if (val) {
                                    req.flash('info', 'Successfully banner created');
                                    return res.redirect('/admin/banner/list/1');
                                }
                            })
                        }
                        }).catch((error) => {
                            req.flash('errors', 'Something went wrong');
                        });
                        }else{
                            req.flash('errors', 'Please fill the required fields.')
                            return res.redirect('back')
                        }
                    } else {
                        if (title != '' && sequence != '') {
                            if ((categoryId && categoryId != null && categoryId != '') || (brandId && brandId != null && brandId != '')) {
                                var bannerImageList = models.banner.findOne({ attributes: ['image', 'coverImage'], where: { id: id } });
                                //this function is for image
                                if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                                    var bannerImage = Date.now() + files.image[0].originalFilename;
                                    var ImageExt = bannerImage.split('.').pop();
                                    var bannerImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                                    var userFinalbannerImage = bannerImageWithEXT.replace("[object Object]", "");
                                    helper.createDirectory('public/admin/banner/image/' + id);
                                    var tempPath = files.image[0].path;
                                    var fileName = userFinalbannerImage;
                                    var targetPath = "image/" + id + "/" + fileName;
                                    helper.uploadBannerImageFiles(tempPath, targetPath);
                                }
                                //this function  is for bannerimage
                                if (files.coverImage[0].originalFilename != '' && files.coverImage[0].originalFilename != null) {
                                    var bannercoverImage = Date.now() + files.image[0].originalFilename;
                                    var ImageExt = bannercoverImage.split('.').pop();
                                    var bannercoverImageWithEXT = Date.now() + files.coverImage[0] + "." + ImageExt;
                                    var userFinalcoverImage = bannercoverImageWithEXT.replace("[object Object]", "");
                                    helper.createDirectory('public/admin/banner/coverImage/' + id);
                                    var tempPath = files.coverImage[0].path;
                                    var fileName = userFinalcoverImage;
                                    var targetPath = "coverImage/" + id + "/" + fileName;
                                    helper.uploadBannerImageFiles(tempPath, targetPath);
                                }
                                var oldbannerImage = bannerImageList.image;
                                var oldbannercoverImage = bannerImageList.coverImage;

                                models.banner.update({
                                    title: title,
                                    storeId: storeId,
                                    shortDescription: shortDescription,
                                    type: type,
                                    // type: 'slider',
                                    sequence: sequence,
                                    status: status,
                                    updatedBy: sessionUserId,
                                    categoryId: categoryId,
                                    brandId: brandId,
                                    image: userFinalbannerImage ? userFinalbannerImage : oldbannerImage,
                                    coverImage: userFinalcoverImage ? userFinalcoverImage : oldbannercoverImage
                                }, { where: { id: id } }).then((value) => {
                                    if (value) {
                                        req.flash('info', 'Successfully banner updated');
                                        return res.redirect('/admin/banner/list/1');
                                    }

                                }).catch((error)=> {
                                    req.flash('errors', 'Something went wrong');
                                });
                            }else{
                                req.flash('errors', 'Category or Brand is required.')
                                return res.redirect('back')
                            }
                        }else{
                            req.flash('errors', 'Title and Sequence is required fields.')
                            return res.redirect('back')
                        }
                    }
                });
            }
            
        }
    });
};
/**
 * This function is developed for delete bannres
 * Developer:Partha Mandal
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
                        return permission === 'BannerDelete'
                    })
                }
                var storeIdChecking = await models.banner.findOne({attributes:['storeId'],where:{id:id}});
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
                
                models.banner.destroy({
                    where: whereCondition
                }).then(function (value) {
                    if (value) {
                        req.flash('info', 'Successfully Banner deleted');
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

