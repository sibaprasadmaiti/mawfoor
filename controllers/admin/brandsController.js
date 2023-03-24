var models = require('../../models');
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
var Sequelize = require("sequelize");
const excel = require("exceljs");
const Op = Sequelize.Op
/**
 * Description: This function is developed for listing brands
 * Developer:Partha Mandal
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
    let title = req.query.title || '';
    let status = req.query.status || '';

    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {

                let whereCondition
                if (title !='' && status =='') {
                    whereCondition = {title:title}
                }else if(title =='' && status !=''){
                    whereCondition = {status: status}
                }else if(title !='' && status !=''){
                    whereCondition = {title:title, status: status}
                }
                
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });
                let brandTitles = await models.brands.findAll({ attributes: ['title'] });
                let brandList
                let listCount

                if(title!='' || status !=''){
                    brandList = await models.brands.findAll({ where: whereCondition , order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                    listCount = await models.brands.count({ where: whereCondition});
                }else{
                    brandList = await models.brands.findAll({ where: {
                        [Op.or]: [
                            {title: {[Op.like]:`%${search}%`}},
                            {image: {[Op.like]:`%${search}%`}},
                            {shortDescriptions: {[Op.like]:`%${search}%`}},
                            {descriptions: {[Op.like]:`%${search}%`}},
                            {status: {[Op.like]:`%${search}%`}} 
                        ]
                    }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                    listCount = await models.brands.count({ where: {
                        [Op.or]: [
                            {title: {[Op.like]:`%${search}%`}},
                            {image: {[Op.like]:`%${search}%`}},
                            {shortDescriptions: {[Op.like]:`%${search}%`}},
                            {descriptions: {[Op.like]:`%${search}%`}}, 
                            {status: {[Op.like]:`%${search}%`}}, 
                        ]
                    }});
                } 

                let pageCount = Math.ceil(listCount/pageSize);

                if (brandList) {
                    return res.render('admin/brands/list', {
                        title: 'Brand List',
                        arrData: brandList,
                        arrStore: storeList,
                        brandTitles: brandTitles,
                        sessionStoreId: '',
                        listCount: listCount,
                        pageCount: pageCount,
                        columnName: column,
                        orderType: order,
                        searchItem: search,
                        titleFilter: title,
                        statusFilter: status,
                        pageSize: pageSize,
                        currentPage: parseInt(page),
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } else {
                    return res.render('admin/brands/list', {
                        title: 'Brand List',
                        arrData: [],
                        brandTitles: brandTitles,
                        arrStore: storeList,
                        sessionStoreId: '',
                        titleFilter: title,
                        statusFilter: status,
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
                        return permission === 'BrandList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {

                    let whereCondition
                    if (title !='' && status =='') {
                        whereCondition = {title:title, storeId: sessionStoreId}
                    }else if(title =='' && status !=''){
                        whereCondition = {status: status, storeId: sessionStoreId}
                    }else if(title !='' && status !=''){
                        whereCondition = {title:title, status: status, storeId: sessionStoreId}
                    }

                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where:{id: sessionStoreId} });
                    let brandTitles = await models.brands.findAll({ attributes: ['title'],storeId: sessionStoreId });
                    let brandList
                    let listCount

                    if(title!='' || status !=''){
                        brandList = await models.brands.findAll({ where: whereCondition , order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                        listCount = await models.brands.count({ where: whereCondition});
                    }else{
                        brandList = await models.brands.findAll({ where: {storeId: sessionStoreId,
                            [Op.or]: [
                                {title: {[Op.like]:`%${search}%`}},
                                {image: {[Op.like]:`%${search}%`}},
                                {shortDescriptions: {[Op.like]:`%${search}%`}},
                                {descriptions: {[Op.like]:`%${search}%`}},
                                {status: {[Op.like]:`%${search}%`}},
                            ]
                        }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                        listCount = await models.brands.count({ where: {storeId: sessionStoreId,
                            [Op.or]: [
                                {title: {[Op.like]:`%${search}%`}},
                                {image: {[Op.like]:`%${search}%`}},
                                {shortDescriptions: {[Op.like]:`%${search}%`}},
                                {descriptions: {[Op.like]:`%${search}%`}}, 
                                {status: {[Op.like]:`%${search}%`}}, 
                            ]
                        }});
                    } 

                    let pageCount = Math.ceil(listCount/pageSize);

                    if (brandList) {
                        return res.render('admin/brands/list', {
                            title: 'Brand List',
                            arrData: brandList,
                            arrStore: storeList,
                            brandTitles: brandTitles,
                            sessionStoreId: sessionStoreId,
                            listCount: listCount,
                            pageCount: pageCount,
                            columnName: column,
                            orderType: order,
                            searchItem: search,
                            titleFilter: title,
                            statusFilter: status,
                            pageSize: pageSize,
                            currentPage: parseInt(page),
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                        });
                    } else {
                        return res.render('admin/brands/list', {
                            title: 'Brand List',
                            arrData: [],
                            brandTitles: brandTitles,
                            arrStore: storeList,
                            titleFilter: title,
                            statusFilter: status,
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
 * Description: This function is developed for view for brands
 * Developer:Susanta Kumar Das
 */
exports.view = async function(req, res){
    var id = req.params.id;
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    var role = req.session.role;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
			
			let storeId = ''
            if(sessionStoreId==null){
                storeId = ''
                var stores = await models.stores.findAll({attributes:['id','storeName'],where:{status:'Yes'}});
            } else {
                storeId = sessionStoreId
                var stores = await models.stores.findAll({attributes:['id','storeName'],where:{id:sessionStoreId,status:'Yes'}});        
            }
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
                if (id){
                    var storeIdChecking = await models.brands.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                if (!id) {
                    return res.render('admin/brands/addedit', {
                        title: 'Add Brand',
                        arrData: '',
                        stores: stores,
                        sessionStoreId: storeId,
                        helper: helper,
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    var brandDetails = models.brands.findOne({
                        attributes: ['id', 'storeId', 'title', 'slug', 'image', 'shortDescriptions', 'descriptions', 'address', 'email', 'phone', 'isoName', 'rating', 'status','sequence'],
                        where: {
                            id: id
                        },
                        include: [{
                            model: models.brandsIsoImage,
                            attributes: ['id', 'isoImage'],
                            require: false
                        }]
                    }).then(async function (brands) {
                        if (brands) {
                            return res.render('admin/brands/addedit', {
                                title: 'Edit Brands',
                                arrData: brands,
                                sessionStoreId: storeId,
                                stores: stores,
                                helper: helper,
                                messages: req.flash('info'),
                                errors: req.flash('errors')
                            });
                        }
                    });
                }
            } 

			
        }
    });
};
/**
 * Description: This function is developed for add/update New Labs
 * Developer:Susanta Kumar Das
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
                        return permission === 'StoreView'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                var form = new multiparty.Form();
                form.parse(req, function (err, fields, files) {
                    var id = fields.updateId[0];
                    if (!id) {
                        models.brands.create({
                            title: fields.title[0],
                            storeId: fields.storeId[0],
                            slug: fields.slug[0],
                            shortDescriptions: fields.shortDescriptions[0],
                            descriptions: fields.descriptions[0],
                            address: fields.address[0],
                            email: fields.email[0],
                            phone: fields.phone[0],
                            isoName: fields.isoName[0],
                            rating: fields.rating[0],
                            status: fields.status[0],
                            sequence: fields.sequence ? fields.sequence[0] : null,
                            createdBy: sessionUserId
                        }).then(function (value) {
                            if (value) {
                                if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                                    var brandImage = Date.now() + files.image[0].originalFilename;
                                    var ImageExt = brandImage.split('.').pop();
                                    var brandImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                                    var finalBrandImage = brandImageWithEXT.replace("[object Object]", "");
                                    // helper.createDirectory('public/admin/brands/' + value.id);
                                    helper.createDirectory('public/admin/brands/');
                                    var tempPath = files.image[0].path;
                                    var fileName = finalBrandImage;
                                    // var targetPath = value.id + "/" + fileName;
                                    var targetPath = fileName;
                                    helper.uploadBrandImageFiles(tempPath, targetPath);
                                }
                                models.brands.update({
                                    image: finalBrandImage
                                }, { where: { id: value.id } }).then(function (val) {
                                    if (val) {
                                        req.flash('info', 'Successfully our lab created');
                                        return res.redirect('/admin/brands/list/1');
                                    }
                                }).catch(function (error) {
                                    req.flash('errors', 'Something went wrong');
                                });
                            } else {
                                req.flash('errors', 'Something went wrong');
                            }
                        }).catch(function (error) {
                            req.flash('errors', 'Something went wrong');
                        });
                    } else {
                        var brandImage = models.brands.findOne({ attributes: ['image'], where: { id: id } });
                        if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                            var brandImage = Date.now() + files.image[0].originalFilename;
                            var ImageExt = brandImage.split('.').pop();
                            var brandImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                            var finalBrandImage = brandImageWithEXT.replace("[object Object]", "");
                            // helper.createDirectory('public/admin/brands/' + id);
                            helper.createDirectory('public/admin/brands/');
                            var tempPath = files.image[0].path;
                            var fileName = finalBrandImage;
                            // var targetPath = id + "/" + fileName;
                            var targetPath = fileName;
                            helper.uploadBrandImageFiles(tempPath, targetPath);
                        }
                        var oldBrandsImage = brandImage.image;
                        models.brands.update({
                            title: fields.title[0],
                            storeId: fields.storeId[0],
                            // slug: fields.slug[0],
                            shortDescriptions: fields.shortDescriptions[0],
                            descriptions: fields.descriptions[0],
                            address: fields.address[0],
                            email: fields.email[0],
                            phone: fields.phone[0],
                            isoName: fields.isoName[0],
                            rating: fields.rating[0],
                            status: fields.status[0],
                            updatedBy: sessionUserId,
                            sequence: fields.sequence ? fields.sequence[0] : null,
                            image: finalBrandImage != '' ? finalBrandImage : oldBrandsImage
                        }, { where: { id: id } }).then(function (value) {
                            if (value) {
                                req.flash('info', 'Successfully our lab updated');
                                return res.redirect('/admin/brands/list/1');
                            } else {
                                req.flash('errors', 'Something went wrong');
                            }
                        }).catch(function (error) {
                            req.flash('errors', 'Something went wrong');
                        });
                    }
                });
            }
            
        }
    });
};
/**
 * This function is developed for delete Brands
 * Developer:Susanta Kumar Das
 */
// exports.delete = function(req, res) {
//     var token= req.session.token;
//     var sessionStoreId = req.session.user.storeId;
//     var role = req.session.role;
//     jwt.verify(token, SECRET, async function(err, decoded) {
//         if(err){
//             req.flash("info", "Invalid Token");
//             res.redirect('/auth/signin');
//         } else {
			
			
//             var id = req.params.id;
//             var whereCondition='';
//             //*****Permission Assign Start
//             var userPermission = false;
//             //*****If SupperAdmin Login
//             if (req.session.permissions.length == 0 && req.session.role == '' && sessionStoreId == null) {
//                 userPermission = true;
//                 whereCondition ={id:id};
//             } else {
//                 if (role == 'admin') {
//                     userPermission = true;
//                 } else {
//                     userPermission = !!req.session.permissions.find(permission => {
//                         return permission === 'StoreView'
//                     })
//                 }
//                 var storeIdChecking = await models.brands.findOne({attributes:['storeId'],where:{id:id}});
//                 if (storeIdChecking.storeId != sessionStoreId){
//                     userPermission = false;
//                 }else{
//                     whereCondition = { storeId: sessionStoreId,id: id };
//                 }
//             }
//             if (userPermission == false) {
//                 req.flash('errors', 'Contact Your administrator for permission');
//                 res.redirect('/admin/dashboard');
//             } else {
                
//                 models.brands.destroy({
//                     where: whereCondition
//                 }).then(function (value) {
//                     if (value) {
//                         req.flash('info', 'Successfully our lab deleted');
//                         res.redirect('back');
//                     } else {
//                         req.flash('errors', 'Something went wrong');
//                         res.redirect('back');
//                     }
//                 });
//             }

            
//         }
//     });
// }; 

exports.delete = async function(req, res) {
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
                        return permission === 'StoreView'
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
                const products = await models.products.findAll({where:{brand:id}})
                if(products.length>0){
                    for(var i=0;i<products.length;i++){
                        if(products[i].id && products[i].id != null && products[i].id != '' ){

                            models.productImages.destroy({ 
                                where:{productId:products[i].id }
                            })

                            models.productCategory.destroy({ 
                                where:{productId:products[i].id }
                            })

                            models.products.destroy({ 
                                where:{id:products[i].id }
                            })

                        }

                    }

                    models.brands.destroy({
                        where: whereCondition
                    }).then(function (value) {
                        if (value) {
                            req.flash('info', 'Successfully brand deleted');
                            res.redirect('back');
                        } else {
                            req.flash('errors', 'Something went wrong');
                            res.redirect('back');
                        }
                    });
                }
            }

            
        }
    });
}; 

/**
 * This function is developed for iso image Brands
 * Developer:Susanta Kumar Das
 */
exports.addIsoImage = function(req, res) {
    var token= req.session.token;
    var sessionUserId = req.session.user.id;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if(err){
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            var form = new multiparty.Form();
            form.parse(req, async function (err, fields, files) {
                var isoImages = files.isoImage;
                var brandId= fields.brandId[0];
                var storeId= fields.storeId[0];
                if(brandId !=null && brandId !=''){
                    if(isoImages !='' || isoImages != undefined || isoImages != null){
                        var isoImageFiles = [];
                        helper.createDirectory('public/admin/brands/iso/'+brandId+'/');
                        isoImages.forEach(async function(img){
                            if(img.originalFilename !='' && img.originalFilename != null){
                                var brandIsoImage = Date.now()+img.originalFilename;
                                var ImageIsoExt = brandIsoImage.split('.').pop();
                                var brandIsoImageWithEXT = Date.now()+img+"."+ImageIsoExt;
                                var finalBrandIsoImage = brandIsoImageWithEXT.replace("[object Object]", "");
                                var tempPath = img.path;
                                var fileName = finalBrandIsoImage;
                                isoImageFiles.push({iso:fileName});
                                var targetPath = 'iso/'+brandId+'/'+fileName;
                                helper.uploadBrandImageFiles(tempPath, targetPath);
                            }
                        });
                        for(var i= 0; i < isoImageFiles.length; i++){
                            models.brandsIsoImage.create({brandId:brandId, storeId:storeId, isoImage:isoImageFiles[i].iso, createdBy: sessionUserId });
                        };
                        req.flash("info", "Brand iso images Saved Successfully.");
                        return res.redirect("/admin/brands/view/"+brandId);
                    } else {
                        req.flash("errors", "Brand iso images Not Upload.");
                        return res.redirect("/admin/brands/view/"+brandId);
                    }
                } else {
                    req.flash("errors", "Brand iso images Not Upload.");
                    return res.redirect("/admin/brands/view/"+brandId);
                }
            });
        }
    });
};
/**
 * Description: This function is developed for remove iso image each Lab
 * Developer:Susanta Kumar Das
 */
exports.removeIsoImages = async function(req,res){
    var token= req.session.token;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if(err){
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        } else {
            var brandId = req.params.brandId;
            var imgId = req.params.imgId;
            if(brandId!='' && imgId !=''){
                var isoImageDetails = await models.brandsIsoImage.findOne({where:{id:imgId,brandId:brandId}});
                var fileName = isoImageDetails.file;
                fs.unlink('public/admin/brands/iso/'+brandId+'/'+fileName, function (err) {});
                models.brandsIsoImage.destroy({where:{id:imgId,brandId:brandId}}).then(function(dst){
                    if(dst){
                        req.flash("info", "Iso Image Successfully Removed");
                        return res.redirect("/admin/brands/view/"+brandId);
                    } else {
                        req.flash("errors", "Something Worng! Please try again.");
                        return res.redirect("/admin/brands/view/"+brandId);
                    }
                });
            } else {
                req.flash("errors", "Something Worng! Please try again.");
                return res.redirect("/admin/brands/list");
            }
        }
    });
}

/**
 * Description: This function is developed for Brands export 
 * Developer: Partha Mandal
 */
exports.exportData = async function(req, res){
    var token= req.session.token;
    var sessionStoreId = req.session.user.storeId;
    let search = req.query.search || '';
    let title = req.query.title || '';
    let status = req.query.status || '';

    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {

                let whereCondition
                if (title !='' && status =='') {
                    whereCondition = {title:title}
                }else if(title =='' && status !=''){
                    whereCondition = {status: status}
                }else if(title !='' && status !=''){
                    whereCondition = {title:title, status: status}
                }
                
                let brandList

                if(title!='' || status !=''){
                    brandList = await models.brands.findAll({ where: whereCondition});
                }else{
                    brandList = await models.brands.findAll({ where: {
                        [Op.or]: [
                            {title: {[Op.like]:`%${search}%`}},
                            {image: {[Op.like]:`%${search}%`}},
                            {shortDescriptions: {[Op.like]:`%${search}%`}},
                            {descriptions: {[Op.like]:`%${search}%`}},
                            {status: {[Op.like]:`%${search}%`}},
                        ]
                    }});
                }

                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Brands");
            
                worksheet.columns = [
                    { header: "Title", key: "title", width:15 },
                    { header: "Descriptions", key: "descriptions", width: 35 },
                    { header: "Status", key: "status", width: 15 },
                    { header: "Created Date", key: "createdAt", width: 15 },
                ];
            
                // Add Array Rows
                worksheet.addRows(brandList);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Brands.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })


            }else{

                let whereCondition
                if (title !='' && status =='') {
                    whereCondition = {title:title, storeId: sessionStoreId}
                }else if(title =='' && status !=''){
                    whereCondition = {status: status, storeId: sessionStoreId}
                }else if(title !='' && status !=''){
                    whereCondition = {title:title, status: status, storeId: sessionStoreId}
                }
                
                let brandList

                if(title!='' || status !=''){
                    brandList = await models.brands.findAll({ where: whereCondition});
                }else{
                    brandList = await models.brands.findAll({ where: {storeId: sessionStoreId,
                        [Op.or]: [
                            {title: {[Op.like]:`%${search}%`}},
                            {image: {[Op.like]:`%${search}%`}},
                            {shortDescriptions: {[Op.like]:`%${search}%`}},
                            {descriptions: {[Op.like]:`%${search}%`}},
                            {status: {[Op.like]:`%${search}%`}},
                        ]
                    }});
                }
                
                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet("Brands");
            
                worksheet.columns = [
                    { header: "Title", key: "title", width:15 },
                    { header: "Descriptions", key: "descriptions", width: 35 },
                    { header: "Status", key: "status", width: 15 },
                    { header: "Created Date", key: "createdAt", width: 15 },
                ];
            
                // Add Array Rows
                worksheet.addRows(brandList);
            
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "Brands.xlsx"
                )
            
                return workbook.xlsx.write(res).then(() => {
                    res.status(200).end();
                    return res.redirect('back');
                })

                    
            }            
        }	
    });
}