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
 * This function is developed for listing blogs
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
                let authorList = await models.blogauthor.findAll({ attributes: ['id', 'firstName', 'lastName']});
                let categoryList = await models.blogcategory.findAll({ attributes: ['id', 'categoryName']});
                let column = req.query.column || 'id';
                let order = req.query.order || 'ASC';
                let pagesizes = req.query.pagesize || 10;
                let pageSize = parseInt(pagesizes);
                let page = req.params.page || 1;
                let search = req.query.search || '';
                let blogslist = await models.blogs.findAll({ where: {
                    [Op.or]: [
                      { blogTitle: { [Op.like]: `%${search}%` } },
                      { slug: { [Op.like]: `%${search}%` } },
                      { summary: { [Op.like]: `%${search}%` } },
                      { blogImage: { [Op.like]: `%${search}%` } },
                      { blogDescription: { [Op.like]: `%${search}%` } },
                      { metaTitle: { [Op.like]: `%${search}%` } },
                      { metaDescription: { [Op.like]: `%${search}%` } },
                      { metaKeywords: { [Op.like]: `%${search}%` } }
                    ]
                  },include: { model: models.blogselectedcategory }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
                //   return res.send(blogslist);
                let listCount = await models.blogs.count({where: {
                    [Op.or]: [
                      { blogTitle: { [Op.like]: `%${search}%` } },
                      { slug: { [Op.like]: `%${search}%` } },
                      { summary: { [Op.like]: `%${search}%` } },
                      { blogImage: { [Op.like]: `%${search}%` } },
                      { blogDescription: { [Op.like]: `%${search}%` } },
                      { metaTitle: { [Op.like]: `%${search}%` } },
                      { metaDescription: { [Op.like]: `%${search}%` } },
                      { metaKeywords: { [Op.like]: `%${search}%` } }
                    ]
                  }});
                let pageCount = Math.ceil(listCount/pageSize);
                if (blogslist) {
                    return res.render('admin/blogs/list', {
                        title: 'Blogs List',
                        arrData: blogslist,
                        storeList: storeList,
                        authorList: authorList,
                        categoryList: categoryList,
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
                    return res.render('admin/blogs/list', {
                        title: 'Blogs List',
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
                        return permission === 'BlogsList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId, 'status' : 'Yes'} });
                    let authorList = await models.blogauthor.findAll({ attributes: ['id', 'firstName', 'lastName'] ,where:{storeId: sessionStoreId}});
                    let categoryList = await models.blogcategory.findAll({ attributes: ['id', 'categoryName'],where:{storeId: sessionStoreId}});
                    let column = req.query.column || 'id';
                    let order = req.query.order || 'ASC';
                    let pagesizes = req.query.pagesize || 10;
                    let pageSize = parseInt(pagesizes);
                    let page = req.params.page || 1;
                    let search = req.query.search || '';
                    let blogslist = await models.blogs.findAll({ order: [[column, order]], where: { storeId: sessionStoreId, [Op.or]: [
                        { blogTitle: { [Op.like]: `%${search}%` } },
                        { slug: { [Op.like]: `%${search}%` } },
                        { summary: { [Op.like]: `%${search}%` } },
                        { blogImage: { [Op.like]: `%${search}%` } },
                        { blogDescription: { [Op.like]: `%${search}%` } },
                        { metaTitle: { [Op.like]: `%${search}%` } },
                        { metaDescription: { [Op.like]: `%${search}%` } },
                        { metaKeywords: { [Op.like]: `%${search}%` } }
                    ] }, include: { model: models.blogselectedcategory }, limit:pageSize, offset:(page-1)*pageSize });

                    let listCount = await models.blogs.count({where: { storeId: sessionStoreId, [Op.or]: [
                        { blogTitle: { [Op.like]: `%${search}%` } },
                        { slug: { [Op.like]: `%${search}%` } },
                        { summary: { [Op.like]: `%${search}%` } },
                        { blogImage: { [Op.like]: `%${search}%` } },
                        { blogDescription: { [Op.like]: `%${search}%` } },
                        { metaTitle: { [Op.like]: `%${search}%` } },
                        { metaDescription: { [Op.like]: `%${search}%` } },
                        { metaKeywords: { [Op.like]: `%${search}%` } }
                    ] }});
                    let pageCount = Math.ceil(listCount/pageSize);
                    if (blogslist) {
                        return res.render('admin/blogs/list', {
                            title: 'Blogs List',
                            arrData: blogslist,
                            storeList: storeList,
                            authorList: authorList,
                            categoryList: categoryList,
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
                        return res.render('admin/blogs/list', {
                            title: 'Blogs List',
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
 * This function is developed for view blogs
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
                let category = await models.blogcategory.findAll({ attributes: ['id', 'categoryName'], where: { status: 'Yes' } });
                let author = await models.blogauthor.findAll({ attributes: ['id', 'firstName', 'lastName'], where: { status: 'Yes' } });
                let selectedCategory = await models.blogselectedcategory.findAll({ where: { blogId: id } });  
                if (!id) {
                    return res.render('admin/blogs/addedit', {
                        title: 'Add Blog',
                        arrData: '',
                        selectedCategory: '',
                        stores: stores,
                        category: category,
                        author: author,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                        helper: helper
                    });
                } else {
                    let blogslist = await models.blogs.findOne({ where: { id: id } });
                    if (blogslist) {
                        return res.render('admin/blogs/addedit', {
                            title: 'Edit Blog',
                            selectedCategory: selectedCategory,
                            arrData: blogslist,
                            stores: stores,
                            category: category,
                            author: author,
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
                        return permission === 'BlogsView'
                    })
                }
                if (id) {
                    let storeIdChecking = await models.blogs.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId, status: 'Yes' } });
                    let category = await models.blogcategory.findAll({ attributes: ['id', 'categoryName'], where: { storeId: sessionStoreId, status: 'Yes' } });
                    let author = await models.blogauthor.findAll({ attributes: ['id', 'firstName', 'lastName'], where: { storeId: sessionStoreId, status: 'Yes' } });
                    let selectedCategory = await models.blogselectedcategory.findAll({ where: { blogId: id, storeId: sessionStoreId } }); 
                    if (!id) {
                        return res.render('admin/blogs/addedit', {
                            title: 'Add Blog',
                            arrData: '',
                            selectedCategory: '',
                            stores: stores,
                            category: category,
                            author: author,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors'),
                            helper: helper
                        });
                    } else {
                        let blogslist = await models.blogs.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (blogslist) {
                            return res.render('admin/blogs/addedit', {
                                title: 'Edit Blog',
                                selectedCategory: selectedCategory,
                                arrData: blogslist,
                                stores: stores,
                                category: category,
                                author: author,
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
 * This function is developed for add/update New blogs
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
                        return permission === 'BlogsAddEdit'
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
                    let categoryId = fields.categoryId;
                    let authorId = fields.authorId[0];
                    let blogTitle = fields.blogTitle[0];
                    let slug = fields.slug[0];
                    let summary = fields.summary[0];
                    let blogDescription = fields.blogDescription[0];
                    let metaTitle = fields.metaTitle[0];
                    let metaDescription = fields.metaDescription[0];
                    let metaKeywords = fields.metaKeywords[0];
                    let storeId = fields.storeId[0];
                    let status = fields.status[0];
                    if (!id) {
                        if (blogTitle != '' && storeId != '' && status != '') {
                            models.blogs.create({
                                authorId: authorId,
                                blogTitle: blogTitle,
                                slug: slug,
                                summary: summary,
                                blogDescription: blogDescription,
                                metaTitle: metaTitle,
                                metaDescription: metaDescription,
                                metaKeywords: metaKeywords,
                                storeId: storeId,
                                status: status,
                                createdBy: sessionUserId
                            }).then(function (value) {
                                if (value) {

                                    for(let catId of categoryId){
                                        models.blogselectedcategory.create({
                                            blogId: value.id,
                                            storeId: storeId,
                                            categoryId: catId
                                        })
                                    }

                                    if (files.blogImage[0].originalFilename != '' && files.blogImage[0].originalFilename != null) {
                                        var blogsImage = Date.now() + files.blogImage[0].originalFilename;
                                        var ImageExt = blogsImage.split('.').pop();
                                        var blogsImageWithEXT = Date.now() + files.blogImage[0] + "." + ImageExt;
                                        var finalblogsImage = blogsImageWithEXT.replace("[object Object]", "");
                                        helper.createDirectory('public/admin/blogs/' + storeId +"/" + value.id);
                                        var tempPath = files.blogImage[0].path;
                                        var fileName = finalblogsImage;
                                        var targetPath = storeId +"/" + value.id + "/" + fileName;
                                        helper.uploadBlogImageFiles(tempPath, targetPath);
                                    }
                                    models.blogs.update({
                                        blogImage: finalblogsImage
                                    }, { where: { id: value.id } }).then(function (val) {
                                        if (val) {
                                            req.flash('info', 'Successfully blog created');
                                            return res.redirect('/admin/blogs/list/1');
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
                        if (blogTitle != '' && storeId != '' && status != '') {
                            let blogImage = models.blogs.findOne({ attributes: ['blogImage'], where: { id: id } });
                            if (files.blogImage[0].originalFilename != '' && files.blogImage[0].originalFilename != null) {
                                let blogsImage = Date.now() + files.blogImage[0].originalFilename;
                                let ImageExt = blogsImage.split('.').pop();
                                let blogsImageWithEXT = Date.now() + files.blogImage[0] + "." + ImageExt;
                                let finalblogsImage = blogsImageWithEXT.replace("[object Object]", "");
                                helper.createDirectory('public/admin/blogs/' + storeId +"/" + id);
                                let tempPath = files.blogImage[0].path;
                                let fileName = finalblogsImage;
                                let targetPath = storeId +"/" + id + "/" + fileName;
                                helper.uploadBlogImageFiles(tempPath, targetPath);
                            }
                            models.blogs.update({
                                authorId: authorId,
                                blogTitle: blogTitle,
                                slug: slug,
                                summary: summary,
                                blogDescription: blogDescription,
                                metaTitle: metaTitle,
                                metaDescription: metaDescription,
                                metaKeywords: metaKeywords,
                                storeId: storeId,
                                status: status,
                                updatedBy: sessionUserId,
                                blogImage: finalblogsImage != '' ? finalblogsImage : blogImage
                            }, { where: { id: id } }).then(function (value) {
                                if (value) {
                                    if(categoryId != ''){
                                        models.blogselectedcategory.destroy({ 
                                            where: { blogId: id }
                                        })
                                    }

                                    for(let catId of categoryId){
                                        models.blogselectedcategory.create({
                                            blogId: id,
                                            storeId: storeId,
                                            categoryId: catId
                                        })
                                    }

                                    req.flash('info', 'Successfully blog updated');
                                    return res.redirect('/admin/blogs/list/1');
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
                    let storeIdChecking = await models.blogs.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.blogs.destroy({
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