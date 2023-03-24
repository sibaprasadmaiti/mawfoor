let models = require('../../models');
let passport = require('passport');
let bcrypt = require('bcrypt-nodejs');
let cookieParser = require('cookie-parser');
let flash = require('connect-flash');
let formidable = require('formidable');
let multiparty = require('multiparty'); 
let bodyParser = require('body-parser');
let fetch = require('node-fetch');
let jwt = require('jsonwebtoken');
let SECRET = 'nodescratch';
const paginate = require('express-paginate');
const Sequelize = require("sequelize");
var helper = require('../../helpers/helper_functions');
const Op = Sequelize.Op

/**
 * This function is developed for listing news
 * Developer: Partha Mandal
 */
exports.list = async function(req, res){
    let token= req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
    jwt.verify(token, SECRET, async function(err, decoded) {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName']});
                // let authorList = await models.blogauthor.findAll({ attributes: ['id', 'firstName', 'lastName']});
                // let categoryList = await models.blogcategory.findAll({ attributes: ['id', 'categoryName']});
                let column = req.query.column || 'id';
                let order = req.query.order || 'ASC';
                let pagesizes = req.query.pagesize || 10;
                let pageSize = parseInt(pagesizes);
                let page = req.params.page || 1;
                let search = req.query.search || '';
                let newslist = await models.news.findAll({ where: {
                    [Op.or]: [
                      { title: { [Op.like]: `%${search}%` } },
                      { slug: { [Op.like]: `%${search}%` } },
                      { sequence: { [Op.like]: `%${search}%` } },
                      { image: { [Op.like]: `%${search}%` } },
                      { description: { [Op.like]: `%${search}%` } },
                      { shortDescription: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
                //   return res.send(blogslist);
                let listCount = await models.news.count({where: {
                    [Op.or]: [
                      { title: { [Op.like]: `%${search}%` } },
                      { slug: { [Op.like]: `%${search}%` } },
                      { sequence: { [Op.like]: `%${search}%` } },
                      { image: { [Op.like]: `%${search}%` } },
                      { description: { [Op.like]: `%${search}%` } },
                      { shortDescription: { [Op.like]: `%${search}%` } }
                    ]
                  }});
                let pageCount = Math.ceil(listCount/pageSize);
                if (newslist) {
                    return res.render('admin/news/list', {
                        title: 'News List',
                        arrData: newslist,
                        storeList: storeList,
                        // authorList: authorList,
                        // categoryList: categoryList,
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
                    return res.render('admin/news/list', {
                        title: 'News List',
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
                        return permission === 'newsList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId, 'status' : 'Yes'} });
                    // let authorList = await models.blogauthor.findAll({ attributes: ['id', 'firstName', 'lastName'] ,where:{storeId: sessionStoreId}});
                    // let categoryList = await models.blogcategory.findAll({ attributes: ['id', 'categoryName'],where:{storeId: sessionStoreId}});
                    let column = req.query.column || 'id';
                    let order = req.query.order || 'ASC';
                    let pagesizes = req.query.pagesize || 10;
                    let pageSize = parseInt(pagesizes);
                    let page = req.params.page || 1;
                    let search = req.query.search || '';
                    let newslist = await models.news.findAll({ order: [[column, order]], where: { storeId: sessionStoreId, [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { slug: { [Op.like]: `%${search}%` } },
                        { sequence: { [Op.like]: `%${search}%` } },
                        { image: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } },
                        { shortDescription: { [Op.like]: `%${search}%` } }
                    ] }, limit:pageSize, offset:(page-1)*pageSize });

                    let listCount = await models.news.count({where: { storeId: sessionStoreId, [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { slug: { [Op.like]: `%${search}%` } },
                        { sequence: { [Op.like]: `%${search}%` } },
                        { image: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } },
                        { shortDescription: { [Op.like]: `%${search}%` } }
                    ] }});
                    let pageCount = Math.ceil(listCount/pageSize);
                    if (newslist) {
                        return res.render('admin/news/list', {
                            title: 'news List',
                            arrData: newslist,
                            storeList: storeList,
                            // authorList: authorList,
                            // categoryList: categoryList,
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
                        return res.render('admin/news/list', {
                            title: 'News List',
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

/**
 * This function is developed for view news
 * Developer: Partha Mandal
 */
exports.view = async function(req, res){
    let token = req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
    let id = req.params.id;
    jwt.verify(token,SECRET,async function(err,decoded){
        if(err){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                let stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                // let category = await models.blogcategory.findAll({ attributes: ['id', 'categoryName'], where: { status: 'Yes' } });
                // let author = await models.blogauthor.findAll({ attributes: ['id', 'firstName', 'lastName'], where: { status: 'Yes' } });
                // let selectedCategory = await models.blogselectedcategory.findAll({ where: { blogId: id } });  
                if (!id) {
                    return res.render('admin/news/addedit', {
                        title: 'Add News',
                        arrData: '',
                        selectedCategory: '',
                        stores: stores,
                        // category: category,
                        // author: author,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                        helper: helper
                    });
                } else {
                    let newslist = await models.news.findOne({ where: { id: id } });
                    if (newslist) {
                        return res.render('admin/news/addedit', {
                            title: 'Edit News',
                            // selectedCategory: selectedCategory,
                            arrData: newslist,
                            stores: stores,
                            // category: category,
                            // author: author,
                            sessionStoreId: '',
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper: helper
                        });
                    }
                }
            }else{
                //*****Permission Assign Start
                let userPermission = false;
                if (role == 'admin') {
                    userPermission = true;
                } else {
                    userPermission = !!req.session.permissions.find(permission => {
                        return permission === 'newsView'
                    })
                }
                if (id) {
                    let storeIdChecking = await models.news.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId, status: 'Yes' } });
                    // let category = await models.blogcategory.findAll({ attributes: ['id', 'categoryName'], where: { storeId: sessionStoreId, status: 'Yes' } });
                    // let author = await models.blogauthor.findAll({ attributes: ['id', 'firstName', 'lastName'], where: { storeId: sessionStoreId, status: 'Yes' } });
                    // let selectedCategory = await models.blogselectedcategory.findAll({ where: { blogId: id, storeId: sessionStoreId } }); 
                    if (!id) {
                        return res.render('admin/news/addedit', {
                            title: 'Add news',
                            arrData: '',
                            selectedCategory: '',
                            stores: stores,
                            // category: category,
                            // author: author,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper: helper
                        });
                    } else {
                        let newslist = await models.news.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (newslist) {
                            return res.render('admin/news/addedit', {
                                title: 'Edit news',
                                // selectedCategory: selectedCategory,
                                arrData: newslist,
                                stores: stores,
                                // category: category,
                                // author: author,
                                sessionStoreId: sessionStoreId,
                                messages: req.flash('info'),
                                errors: req.flash('errors'),
                                helper: helper
                            });
                        }
                    }
                }
            }
        }
    });    
};

/**
 * This function is developed for add/update New news
 * Developer: Partha Mandal
 */
exports.addOrUpdate = function(req, res, next) {
    let token = req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let sessionUserId = req.session.user.id;
    let role = req.session.role;
    jwt.verify(token, SECRET, async function (err, decoded) {
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
                        return permission === 'newsAddEdit'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                let form = new multiparty.Form();
                form.parse(req, function (err, fields, files) {
                    // return res.send(req);
                    let id = fields.updateId[0];
                    let title = fields.title[0];
                    let slug = fields.slug[0];
                    let shortDescription = fields.shortDescription[0];
                    let description = fields.description[0];
                    let sequence = fields.sequence[0];
                    let storeId = fields.storeId[0];
                    let status = fields.status[0];
                    if (!id) {
                        if (title != '' && storeId != '' && status != '') {
                            models.news.create({
                                title: title,
                                slug: slug,
                                shortDescription: shortDescription,
                                description: description,
                                sequence: sequence,
                                storeId: storeId,
                                status: status,
                                createdBy: sessionUserId
                            }).then(function (value) {
                                if (value) {

                                    // for(let catId of categoryId){
                                    //     models.blogselectedcategory.create({
                                    //         blogId: value.id,
                                    //         storeId: storeId,
                                    //         categoryId: catId
                                    //     })
                                    // }

                                    if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                                        var blogsImage = Date.now() + files.image[0].originalFilename;
                                        var ImageExt = blogsImage.split('.').pop();
                                        var blogsImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                                        var finalblogsImage = blogsImageWithEXT.replace("[object Object]", "");
                                        helper.createDirectory('public/admin/news/' + storeId +"/" + value.id);
                                        var tempPath = files.image[0].path;
                                        var fileName = finalblogsImage;
                                        var targetPath = storeId +"/" + value.id + "/" + fileName;
                                        helper.uploadNewsImageFiles(tempPath, targetPath);
                                    }
                                    models.news.update({
                                        image: finalblogsImage
                                    }, { where: { id: value.id } }).then(function (val) {
                                        if (val) {
                                            req.flash('info', 'Successfully news created');
                                            return res.redirect('/admin/news/list/1');
                                        }
                                    }).catch(function (error) {
                                        req.flash('errors', 'Something went wrong');
                                    });
                                } else {
                                    req.flash('errors', 'Something went wrong');
                                }
                            }).catch(function (error) {
                                console.log(error);
                                req.flash('errors', 'Somethings went wrong');
                            });
                        }else{
                            req.flash('errors', 'Please fill the required fields.')
                            return res.redirect('back')
                        }
                    } else {
                        if (title != '' && storeId != '' && status != '') {
                            let newsImage = models.news.findOne({ attributes: ['image'], where: { id: id } });
                            if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                                let blogsImage = Date.now() + files.image[0].originalFilename;
                                let ImageExt = blogsImage.split('.').pop();
                                let blogsImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                                let finalblogsImage = blogsImageWithEXT.replace("[object Object]", "");
                                helper.createDirectory('public/admin/news/' + storeId +"/" + id);
                                let tempPath = files.image[0].path;
                                let fileName = finalblogsImage;
                                let targetPath = storeId +"/" + id + "/" + fileName;
                                helper.uploadNewsImageFiles(tempPath, targetPath);

                                models.news.update({
                                    image: finalblogsImage
                                }, { where: { id: id } })
                            }
                            models.news.update({
                                title: title,
                                slug: slug,
                                shortDescription: shortDescription,
                                description: description,
                                sequence: sequence,
                                storeId: storeId,
                                status: status,
                                updatedBy: sessionUserId,
                                // image: finalblogsImage != '' ? finalblogsImage : newsImage
                            }, { where: { id: id } }).then(function (value) {
                                if (value) {
                                    // if(categoryId != ''){
                                    //     models.blogselectedcategory.destroy({ 
                                    //         where: { blogId: id }
                                    //     })
                                    // }

                                    // for(let catId of categoryId){
                                    //     models.blogselectedcategory.create({
                                    //         blogId: id,
                                    //         storeId: storeId,
                                    //         categoryId: catId
                                    //     })
                                    // }

                                    req.flash('info', 'Successfully news updated');
                                    return res.redirect('/admin/news/list/1');
                                }
                            }).catch(function (error) {
                                console.log(error);
                                req.flash('errors', 'Somethings went wrong');
                            });
                        }else{
                            req.flash('errors', 'Please fill the required fields.')
                            return res.redirect('back')
                        }
                    }
                });
            }
        }
    })
    
};

/**
 * This function is developed for delete blogs
 * Developer: Partha Mandal
 */
exports.delete = function(req, res, next) {
    let token = req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
    let id = req.params.id;
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
                        return permission === 'BlogsDelete'
                    })
                }
                if (id) {
                    let storeIdChecking = await models.news.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.news.destroy({
                    where: { id: id }
                }).then(function (value) {
                    if (value) {
                        req.flash('info', 'Successfully blog deleted');
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