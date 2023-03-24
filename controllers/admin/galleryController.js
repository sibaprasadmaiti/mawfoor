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
var fs = require("fs");
var config = require("../../config/config.json");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;

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
 * Description: This function is developed for listing galleriess
 * Developer:Surajit Gouri
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

    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            
            if (sessionStoreId == null) {
                var storeList = await models.stores.findAll({attributes:['id','storeName','storeCode'],where:{status:'Yes'}});

                let galleryList = await models.galleries.findAll({ where: {
                    [Op.or]: [
                      { image: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.galleries.count({where: {
                    [Op.or]: [
                      { image: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ]
                  }});

                let pageCount = Math.ceil(listCount/pageSize);

                if (galleryList) {
                    return res.render('admin/gallery/list', {
                        title: 'Gallery List',
                        arrData: galleryList,
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
                        helper: helper,
                    });
                } else {
                    return res.render('admin/gallery/list', {
                        title: 'Gallery List',
                        arrData: '',
                        storeList: '',
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                        helper: helper,
                    });
                }               
            } else {
                //*****Permission Assign Start
                var userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'GalleryList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    var storeList = await models.stores.findAll({attributes:['id','storeName','storeCode'],where:{id:sessionStoreId,status:'Yes'}});

                    let galleryList = await models.galleries.findAll({ where: {storeId: sessionStoreId,
                        [Op.or]: [
                        { image: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                        ]
                    }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                    let listCount = await models.galleries.count({where: {storeId: sessionStoreId,
                        [Op.or]: [
                        { image: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                        ]
                    }});

                    let pageCount = Math.ceil(listCount/pageSize);

                    if (galleryList) {
                        return res.render('admin/gallery/list', {
                            title: 'Gallery List',
                            arrData: galleryList,
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
                            helper: helper,
                        });
                    } else {
                        return res.render('admin/gallery/list', {
                            title: 'Gallery List',
                            arrData: '',
                            storeList: '',
                            sessionStoreId: '',
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper: helper,
                        });
                    }         
                }
            }
        }	
    });
}


/**
 * Description: This function is developed for view galleriess
 * Developer:Surajit Gouri
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
            var brands = await models.brands.findAll({attributes:['id','title'],where:{storeId: 30, status:'Yes'}});
            if (sessionStoreId == null) {
                var stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                if (!id) {
                    return res.render('admin/gallery/addedit', {
                        title: 'Add Gallery',
                        arrData: '',
                        stores: stores,
                        brands: brands,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var gallery = await models.galleries.findOne({ where: { id: id } });
                    if (gallery) {
                        return res.render('admin/gallery/addedit', {
                            title: 'Edit Gallery',
                            arrData: gallery,
                            stores: stores,
                            brands: brands,
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
                        return permission === 'GalleryView'
                    })
                }
                if (id) {
                    var storeIdChecking = await models.galleries.findOne({ attributes: ['storeId'], where: { id: id } });
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
                        return res.render('admin/gallery/addedit', {
                            title: 'Add Gallery',
                            arrData: '',
                            stores: stores,
                            brands: brands,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        var gallery = await models.galleries.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (gallery) {
                            return res.render('admin/gallery/addedit', {
                                title: 'Edit Gallery',
                                arrData: gallery,
                                stores: stores,
                                brands: brands,
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
 * Description: This function is developed for add/Edit for Gallery
 * Developer: Surajit Gouri
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
                    if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
                        userPermission = true;
                    } else {
                        if (role == 'admin') {
                            userPermission = true;
                        } else {
                            userPermission = !!req.session.permissions.find(permission => {
                                return permission === 'GalleryAddEdit'
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
                            
                            if (!id) {
                                models.galleries.create({
                                    storeId: fields.storeId[0],
                                    status: fields.status[0],
                                    catId: fields.catId[0],
                                    createdBy: sessionUserId,
                                    sequence: fields.sequence ? fields.sequence[0] : null,
                                }).then( function(value) {
                                   
                                    if(value) {
                                        if(files.image !=undefined && files.image[0].originalFilename !='' && files.image[0].originalFilename != null){
                                            var galleryimage = Date.now()+files.image[0].originalFilename;
                                            var ImageExt = galleryimage.split('.').pop();
                                            var galleryimageWithEXT = Date.now()+files.image[0]+"."+ImageExt;
                                            var finalgalleryimage = galleryimageWithEXT.replace("[object Object]", "");
                                            helper.createDirectory('public/admin/gallery/image/'+value.id); 
                                            var tempPath = files.image[0].path;
                                            var fileName = finalgalleryimage;
                                            var targetPath = "image/"+value.id+"/"+fileName;
                                            helper.uploadgalleryImageFiles(tempPath, targetPath);
                                        }
                                            models.galleries.update({ 
                                                image: finalgalleryimage 
                                            }, { where: { id: value.id } }).then(function (val) {
                                                if (val) {
                                                    req.flash('info', 'Successfully gallery created');
                                                    return res.redirect('/admin/gallery/list/1');
                                                }
                                             }).catch(function(error) {
                                                 req.flash('errors','Something went wrong');
                                                });
                                    } else{
                                     req.flash('errors','Something went wrong');
                                    }
                                }).catch(function(error) {
                                    req.flash('errors', 'Something went wrong');
                                    });
                            } else {
                                var galleryfindImage = models.galleries.findOne({attributes:['image'],where:{id:id}});
                                if(files.image !=undefined && files.image[0].originalFilename !='' && files.image[0].originalFilename != null){
                                    var galleryimage = Date.now()+files.image[0].originalFilename;
                                    var ImageExt = galleryimage.split('.').pop();
                                    var galleryimageWithEXT = Date.now()+files.image[0]+"."+ImageExt;
                                    var finalgalleryimage = galleryimageWithEXT.replace("[object Object]", "");
                                    helper.createDirectory('public/admin/gallery/image/'+id); 
                                    var tempPath = files.image[0].path;
                                    var fileName = finalgalleryimage;
                                    var targetPath = "image/"+id+"/"+fileName;
                                    helper.uploadgalleryImageFiles(tempPath, targetPath);
                                }
                               
                                var oldGalleryImage = galleryfindImage.image;
        
                                models.galleries.update({
                                    storeId: fields.storeId[0],
                                    status: fields.status[0],
                                    catId: fields.catId[0],
                                    updatedBy: sessionUserId,
                                    sequence: fields.sequence ? fields.sequence[0] : null,
                                    image: finalgalleryimage != ''? finalgalleryimage : oldGalleryImage
                                }, { where: {id:id} }).then( function(value) {
                                        if (value) {
                                            req.flash('info', 'Successfully galleries updated');
                                            return res.redirect('/admin/gallery/list/1');
                                        } else {
                                            req.flash('errors','Something went wrong');
                                        }
        
                                }).catch( function(error) {
                                    req.flash('errors', 'Something went wrong');
                                });
                            }
                        });
                }
                
            }
        });
    };
    



/**
 * Description: This function is developed for delete Gallery
 * Developer: Surajit Gouri
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
                        return permission === 'GalleryDelete'
                    })
                }
                var storeIdChecking = await models.brands.findOne({attributes:['storeId'],where:{id:id}});
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
                
               
                models.galleries.destroy({
                    where:{id:id}
                }).then(function (value) {
                    if (value) {
                        req.flash('info', 'Successfully galleries deleted');
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

