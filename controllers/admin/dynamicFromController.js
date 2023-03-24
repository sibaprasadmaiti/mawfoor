const models = require('../../models');
const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const formidable = require('formidable');
const multiparty = require('multiparty'); 
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const config = require('../../config/config.json');
const SECRET = 'nodescratch';
const paginate = require('express-paginate');
const Sequelize = require("sequelize");
const fs = require('fs');
const helper = require('../../helpers/helper_functions');
const Op = Sequelize.Op;
const sequelizee = new Sequelize(
    config.development.database, 
    config.development.username,
    config.development.password, {
      host: 'localhost',
      dialect: 'mysql',
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
    }
  );

/**
 * This function is developed for listing Dynamic Form
 * Developer: Partha Mandal
 */
exports.list = async (req, res) => {
    let token= req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
    let column = req.query.column || 'id';
    let order = req.query.order || 'ASC';
    let pagesizes = req.query.pagesize || 10;
    let pageSize = parseInt(pagesizes);
    let page = req.params.page || 1;
    let search = req.query.search || '';
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'] });

                let dynamicforms = await models.dynamicforms.findAll({ where: {
                    [Op.or]: [
                      { formName: { [Op.like]: `%${search}%` } },
                      { title: { [Op.like]: `%${search}%` } },
                      { slug: { [Op.like]: `%${search}%` } },
                      { image: { [Op.like]: `%${search}%` } },
                      { description: { [Op.like]: `%${search}%` } },
                      { metaTitle: { [Op.like]: `%${search}%` } },
                      { metaDescription: { [Op.like]: `%${search}%` } },
                      { metaKeyword: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.dynamicforms.count({where: {
                    [Op.or]: [
                        { formName: { [Op.like]: `%${search}%` } },
                        { title: { [Op.like]: `%${search}%` } },
                        { slug: { [Op.like]: `%${search}%` } },
                        { image: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } },
                        { metaTitle: { [Op.like]: `%${search}%` } },
                        { metaDescription: { [Op.like]: `%${search}%` } },
                        { metaKeyword: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                  }});

                let pageCount = Math.ceil(listCount/pageSize);

                if (dynamicforms) {
                    return res.render('admin/dynamicForm/list', {
                        title: 'Form List',
                        arrData: dynamicforms,
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
                    return res.render('admin/dynamicForm/list', {
                        title: 'Form List',
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
                        return permission === 'DynamicFormList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });

                    let dynamicforms = await models.dynamicforms.findAll({ where: { storeId: sessionStoreId,
                        [Op.or]: [
                          { formName: { [Op.like]: `%${search}%` } },
                          { title: { [Op.like]: `%${search}%` } },
                          { slug: { [Op.like]: `%${search}%` } },
                          { image: { [Op.like]: `%${search}%` } },
                          { description: { [Op.like]: `%${search}%` } },
                          { metaTitle: { [Op.like]: `%${search}%` } },
                          { metaDescription: { [Op.like]: `%${search}%` } },
                          { metaKeyword: { [Op.like]: `%${search}%` } },
                          { status: { [Op.like]: `%${search}%` } }
                        ]
                      }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
    
                    let listCount = await models.dynamicforms.count({where: { storeId: sessionStoreId,
                        [Op.or]: [
                            { formName: { [Op.like]: `%${search}%` } },
                            { title: { [Op.like]: `%${search}%` } },
                            { slug: { [Op.like]: `%${search}%` } },
                            { image: { [Op.like]: `%${search}%` } },
                            { description: { [Op.like]: `%${search}%` } },
                            { metaTitle: { [Op.like]: `%${search}%` } },
                            { metaDescription: { [Op.like]: `%${search}%` } },
                            { metaKeyword: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                      }});
    
                    let pageCount = Math.ceil(listCount/pageSize);
                    
                    if (dynamicforms) {
                        return res.render('admin/dynamicForm/list', {
                            title: 'Form List',
                            arrData: dynamicforms,
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
                        return res.render('admin/dynamicForm/list', {
                            title: 'Form List',
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
 * This function is developed for View Dynamic Form
 * Developer: Partha Mandal
 */
exports.view = async (req, res) => {
    let token = req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
    let id = req.params.id;
    jwt.verify(token,SECRET,async (err,decoded) => {
        if(err){
            req.flash('info','Invalid Token');
            res.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                let stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { status: 'Yes' } });
                if (!id) {
                    return res.render('admin/dynamicForm/formaddedit', {
                        title: 'Create Dynamic Form',
                        arrData: '',
                        stores: stores,
                        sessionStoreId: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    let dynamicforms = await models.dynamicforms.findOne({ where: { id: id } });
                    if (dynamicforms) {
                        return res.render('admin/dynamicForm/formaddedit', {
                            title: 'Edit Dynamic Form',
                            arrData: dynamicforms,
                            stores: stores,
                            sessionStoreId: '',
                            messages: req.flash('info'),
                            errors: req.flash('errors')
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
                        return permission === 'DynamicFormView'
                    })
                }
                if (id) {
                    let storeIdChecking = await models.dynamicforms.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let stores = await models.stores.findAll({ attributes: ['id', 'storeName'], where: { id: sessionStoreId, status: 'Yes' } });
                    if (!id) {
                        return res.render('admin/dynamicForm/formaddedit', {
                            title: 'Create Dynamic Form',
                            arrData: '',
                            stores: stores,
                            sessionStoreId: sessionStoreId,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    } else {
                        let dynamicforms = await models.dynamicforms.findOne({ where: { storeId: sessionStoreId, id: id } });
                        if (dynamicforms) {
                            return res.render('admin/dynamicForm/formaddedit', {
                                title: 'Edit Dynamic Form',
                                arrData: dynamicforms,
                                stores: stores,
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
 * This function is developed for add/update Dynamic Form
 * Developer: Partha Mandal
 */
exports.addOrUpdate = (req, res, next) => {
    let token = req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let sessionUserId = req.session.user.id;
    let role = req.session.role;
    jwt.verify(token, SECRET, async  (err, decoded) => {
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
                        return permission === 'DynamicFormAddEdit'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                let form = new multiparty.Form();
                form.parse(req,  (err, fields, files) => {
                    let id = fields.updateId[0];
                    let formName = fields.formName[0];
                    let tableName = fields.tableName[0];
                    let title = fields.title[0];
                    let slug = fields.slug[0];
                    let storeId = fields.storeId[0];
                    let status = fields.status[0];
                    let description = fields.description[0];
                    let metaTitle = fields.metaTitle[0];
                    let metaKeyword = fields.metaKeyword[0];
                    let metaDescription = fields.metaDescription[0];
                    if (!id) {
                        if (formName != '' && storeId != '' && status != '') {
                            models.dynamicforms.create({
                                formName: formName,
                                tableName: tableName,
                                title: title,
                                slug: slug,
                                storeId: storeId,
                                status: status,
                                metaTitle: metaTitle,
                                metaKeyword: metaKeyword,
                                metaDescription: metaDescription,
                                description: description,
                                createdBy: sessionUserId
                            }).then((value) =>{
                                if (value) {
                                    if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                                        var formImage = Date.now() + files.image[0].originalFilename;
                                        var ImageExt = formImage.split('.').pop();
                                        var formImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                                        var finalformImage = formImageWithEXT.replace("[object Object]", "");
                                        helper.createDirectory('public/admin/dynamicform/' + storeId +"/" + value.id);
                                        var tempPath = files.image[0].path;
                                        var fileName = finalformImage;
                                        var targetPath = storeId +"/" + value.id + "/" + fileName;
                                        helper.uploadDynamicFormImage(tempPath, targetPath);
                                    }
                                    models.dynamicforms.update({
                                        image: fileName
                                    }, { where: { id: value.id } }).then((val)=> {
                                        req.flash('info', 'Successfully form created');
                                        return res.redirect('/admin/dynamicForm/list/1');
                                    }).catch((error)=> {
                                        req.flash('errors', 'Something went wrong');
                                    });  
                                } else {
                                    req.flash('errors', 'Something went wrong');
                                }
                            }).catch((error)=> {
                                req.flash('errors', 'Somethings went wrong');
                            });
                        }else{
                            req.flash('errors', 'Please fill the required fields.')
                            return res.redirect('back')
                        }
                    } else {
                        if (formName != '' && storeId != '' && status != '') {
                            let dynamicImage = models.dynamicforms.findOne({ attributes: ['image'], where: { id: id } });

                            if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                                var formImage = Date.now() + files.image[0].originalFilename;
                                var ImageExt = formImage.split('.').pop();
                                var formImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                                var finalformImage = formImageWithEXT.replace("[object Object]", "");
                                helper.createDirectory('public/admin/dynamicform/' + storeId +"/" + id);
                                var tempPath = files.image[0].path;
                                var fileName = finalformImage;
                                var targetPath = storeId +"/" + id + "/" + fileName;
                                helper.uploadDynamicFormImage(tempPath, targetPath);
                            }

                        models.dynamicforms.update({
                            formName: formName,
                            tableName: tableName,
                            title: title,
                            slug: slug,
                            storeId: storeId,
                            status: status,
                            metaTitle: metaTitle,
                            metaKeyword: metaKeyword,
                            metaDescription: metaDescription,
                            description: description,
                            updatedBy: sessionUserId,
                            image: fileName != '' ? fileName : dynamicImage
                        }, { where: { id: id } }).then((value) => {
                            req.flash('info', 'Successfully form updated');
                            return res.redirect('/admin/dynamicForm/list/1');
                        }).catch((error) => {
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
 * This function is developed for delete Dynamic Form
 * Developer: Partha Mandal
*/
exports.delete = (req, res, next) => {
    let token = req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
    let id = req.params.id;
    jwt.verify(token,SECRET,async (err,decoded) => {
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
                        return permission === 'DynamicFormDelete'
                    })
                }
                if (id) {
                    let storeIdChecking = await models.dynamicforms.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.dynamicforms.destroy({
                    where: { id: id }
                }).then((value) => {
                    if (value) {
                        req.flash('info', 'Successfully  form deleted');
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
 * This function is developed for status change of Dynamic Form
 * Developer: Partha Mandal
*/
exports.statusChange = (req, res, next) => {
    let token = req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let role = req.session.role;
    let id = req.params.id;
    jwt.verify(token,SECRET,async (err,decoded) => {
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
                        return permission === 'DynamicFormStatusChange'
                    })
                }
                if (id) {
                    let storeIdChecking = await models.dynamicforms.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                let status = await models.dynamicforms.findOne({ attributes: ['status'], where: { id: id } });
                if(status.status == 'Yes' || status.status == 'yes'){
                    models.dynamicforms.update({status:'No'},{where: { id: id }
                    }).then((value) => {
                        if (value) {
                            req.flash('info', 'Successfully status changed');
                            res.redirect('back');
                        } else {
                            req.flash('errors', 'Something went wrong');
                            res.redirect('back');
                        }
                    });
                }else{
                    models.dynamicforms.update({status:'Yes'},{where: { id: id }
                    }).then((value) => {
                        if (value) {
                            req.flash('info', 'Successfully status changed');
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
 * This function is developed for listing Dynamic Form Fields
 * Developer: Partha Mandal
*/
exports.fieldList = async (req, res) =>{
    let token= req.session.token;
    let id = req.query.formId;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            let dynamicFormName = await models.dynamicforms.findOne({attributes:['formName','storeId'], where: { id: id } });
            let dynamicforms = await models.dynamicformfields.findAll({ where: { dynamicFormId: id }, order: [['position', 'ASC']] });
            if(!id){
                res.redirect('back');
            }else{
                if (dynamicforms) {
                    return res.render('admin/dynamicForm/formfield', {
                        title: 'Form Field List',
                        arrData: dynamicforms,
                        dynamicFormId: id,
                        dynamicFormName: dynamicFormName,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } else {
                    return res.render('admin/dynamicForm/formfield', {
                        title: 'Form Field List',
                        arrData: '',
                        dynamicFormId: id,
                        dynamicFormName: dynamicFormName,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } 
            }   
        }	
    });
}


/**
 * This function is developed for create Dynamic Form Fields
 * Developer: Partha Mandal
*/
exports.fieldAdd = async (req, res) => {
    let token= req.session.token;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            let form = new multiparty.Form();
            form.parse(req, (err, fields, files) => {
                let dynamicFormId = fields.dynamicFormId[0];
                let displayName = fields.displayName[0];
                let fieldName = fields.fieldName[0];
                let dataType = fields.dataType[0];
                let fileType = fields.fileType[0];
                let multiSelect = fields.multiSelect[0];
                let storeId = fields.storeId[0];

                if (fieldName != '') {
                    models.dynamicformfields.create({
                        dynamicFormId: dynamicFormId,
                        fieldName: fieldName,
                        displayName: displayName,
                        label: displayName,
                        dataType: dataType,
                        fileType: fileType,
                        storeId: storeId,
                        multiSelect: multiSelect
                    }).then((value) => {
                        if (value) {
                            req.flash('info', 'Successfully field created');
                            return res.redirect('back');
                        }
                    }).catch((error) => {
                        req.flash('errors', 'Somethings went wrong');
                    });
                }else{
                    req.flash('errors', 'Please fill the required fields.')
                    return res.redirect('back')
                }
            });
        }	
    });
}

/**
 * This function is developed for delete Dynamic Form Field
 * Developer: Partha Mandal
*/
exports.fieldDelete = (req, res, next) => {
    let token = req.session.token;
    let id = req.params.id;
    jwt.verify(token,SECRET,async (err,decoded) => {
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            models.dynamicformfields.destroy({
                where: { id: id }
            }).then((value) => {
                if (value) {
                    req.flash('info', 'Successfully field deleted');
                    res.redirect('back');
                } else {
                    req.flash('errors', 'Something went wrong');
                    res.redirect('back');
                }
            });
        }
    });
};  

/**
 * This function is developed for fetch Dynamic Form Field Value
 * Developer: Partha Mandal
*/
exports.findFieldData = (req, res, next) => {
    let token = req.session.token;
    let id = req.params.id;
    jwt.verify(token,SECRET,async (err,decoded) => {
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            models.dynamicformfields.findOne({where: { id: id } }).then((value)=>{
                res.send(value)
            });
        }
    });
};  


/**
 * This function is developed for create Dynamic Form properties
 * Developer: Partha Mandal
*/
exports.propertiesAdd = async (req, res) => {
    let token= req.session.token;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            let form = new multiparty.Form();
            form.parse(req, (err, fields, files) => {
                let id = fields.id[0];
                let label = fields.label[0];
                let required = fields.required || 'No';
                let requiredMessage = fields.requiredMessage[0];
                let regularExpression = fields.regularExpression[0];
                let regexMessage = fields.regexMessage[0];
                let placeholder = fields.placeholder[0];
                let multiSelect = fields.multiSelect || 'No';

                if (id != '') {
                    models.dynamicformfields.update({
                        label: label,
                        required: required,
                        requiredMessage: required =='Yes' ? requiredMessage : '',
                        regularExpression: regularExpression,
                        regexMessage:regexMessage,
                        placeholder:placeholder,
                        multiSelect: multiSelect
                    }, { where: { id: id } }).then((value) => {
                        if (value) {
                            req.flash('info', 'Successfully properties created');
                            return res.redirect('back');
                        }
                    }).catch((error) => {
                        req.flash('errors', 'Somethings went wrong');
                    });
                }else{
                    req.flash('errors', 'Wrong Id')
                    return res.redirect('back')
                }
            });
        }	
    });
}

/**
 * This function is developed for sorting Dynamic Form Field
 * Developer: Partha Mandal
*/
exports.sortingFelds = (req, res, next) => {
    let token = req.session.token;
    let position = req.body.position;
    jwt.verify(token,SECRET,async (err,decoded) => {
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            position.forEach((id, value) => {
                models.dynamicformfields.update({
                    position: value,
                }, { where: { id: id } })
               
            })
        }
    });
};

/**
 * This function is developed for listing Dynamic Form Field Choices
 * Developer: Partha Mandal
*/
exports.choiceList = async (req, res) => {
    let token= req.session.token;
    let formId = req.query.formId;
    let fieldId = req.query.fieldId;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            let dynamicFormName = await models.dynamicforms.findOne({attributes:['formName','storeId',], where: { id: formId } });
            let fieldDisplayName = await models.dynamicformfields.findOne({ where: { id: fieldId } });
            let dynamicformfieldvalues = await models.dynamicformfieldvalues.findAll({ where: { dynamicFormFieldId: fieldId } });
            if(!formId && !fieldId){
                res.redirect('back');
            }else{
                if (dynamicformfieldvalues) {
                    return res.render('admin/dynamicForm/fieldchoice', {
                        title: 'Field Choice List',
                        arrData: dynamicformfieldvalues,
                        dynamicFormId: formId,
                        dynamicFormFieldId: fieldId,
                        dynamicFormName: dynamicFormName,
                        fieldDisplayName: fieldDisplayName,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } else {
                    return res.render('admin/dynamicForm/fieldchoice', {
                        title: 'Field Choice List',
                        arrData: '',
                        dynamicFormId: formId,
                        dynamicFormFieldId: fieldId,
                        dynamicFormName: dynamicFormName,
                        fieldDisplayName: fieldDisplayName,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } 
            }   
        }	
    });
}


/**
 * This function is developed for create Dynamic Form Field Choice
 * Developer: Partha Mandal
*/
exports.choiceAdd = async (req, res) => {
    let token= req.session.token;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            let form = new multiparty.Form();
            form.parse(req, (err, fields, files) => {
                let dynamicFormFieldId = fields.dynamicFormFieldId[0];
                let values = fields.values[0];
                let label = fields.label[0];
                let dynamicFormId = fields.dynamicFormId[0];
                let storeId = fields.storeId[0];
                if (values != '' && label != '') {
                    models.dynamicformfieldvalues.create({
                        dynamicFormFieldId: dynamicFormFieldId,
                        dynamicFormId: dynamicFormId,
                        storeId: storeId,
                        values: values,
                        label: label
                    }).then((value) => {
                        if (value) {
                            req.flash('info', 'Successfully choice created');
                            return res.redirect('back');
                        }
                    }).catch((error) => {
                        req.flash('errors', 'Somethings went wrong');
                    });
                }else{
                    req.flash('errors', 'Please fill the required fields.')
                    return res.redirect('back')
                }
            });
        }	
    });
}

/**
 * This function is developed for delete Dynamic Form Field Choice
 * Developer: Partha Mandal
*/
exports.choiceDelete = (req, res, next) => {
    let token = req.session.token;
    let id = req.params.id;
    jwt.verify(token,SECRET,async (err,decoded) =>{
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            models.dynamicformfieldvalues.destroy({
                where: { id: id }
            }).then((value) => {
                req.flash('info', 'Successfully choice deleted');
                res.redirect('back');
            }).catch((error) => {
                req.flash('errors', 'Something went wrong');
                res.redirect('back');
            });
        }
    });
};  


/**
 * This function is developed for view form
 * Developer: Partha Mandal
*/
exports.applyForm = async (req, res) => {
    let token= req.session.token;
    let id = req.params.id;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            let dynamicFormName = await models.dynamicforms.findOne({attributes:['formName','tableName'], where: { id: id } });
            let fieldCount = await models.dynamicformfields.count({where: { dynamicFormId: id } });
            let dynamicFormData = await models.dynamicforms.findAll({ where: { id: id },  include: [{model:  models.dynamicformfields, include: [{model: models.dynamicformfieldvalues, required: false }]}], order: [[ models.dynamicformfields, 'position', 'ASC']] });
            if(!id){
                res.redirect('back');
            }else{
                if (dynamicFormData) {
                    return res.render('admin/dynamicForm/viewform', {
                        title: dynamicFormName.formName,
                        arrData: dynamicFormData,
                        fieldCount: fieldCount,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });

                } else {
                    req.flash('errors', 'Something went wrong');
                    res.redirect('back');
                } 
            }   
        }	
    });
}


/**
 * This function is developed for Submit form data
 * Developer: Partha Mandal
*/
exports.submitForm = async (req, res) => {
    let token= req.session.token;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            let form = new multiparty.Form();
            form.parse(req, async (err, fields, files) => {
                // return res.send(files)
                let id = fields.id[0];
                let tableName = fields.tableName[0];

                sequelizee.query(`SELECT * FROM ${tableName} LIMIT 1`, { type: sequelizee.QueryTypes.SELECT }).then(async(jsonData)=>{
                    
                    delete fields.tableName;
                    let commingColumns = Object.keys(fields); // Create an array of Fields Name coming from frontend

                    let existColumns = []; 

                    // Get all fields name which is already exist into table and create an array
                    for(let obj in jsonData){
                        if(jsonData.hasOwnProperty(obj)){
                            for(let prop in jsonData[obj]){
                                existColumns.push(prop);
                            }
                        }
                    }
                    
                    // This function is created for compare 2 arrays
                    const sub = (x, y) => {
                        myArray = x.filter((el) => {
                            return y.indexOf(el) < 0;
                        });
                        return myArray;
                    };
                    
                    // Pass 2 arrays and get the new fields 
                    let newFields = sub(commingColumns, existColumns);
                    
                    // If get any new fields then alter table and after that insert into table
                    if(newFields){
                        for(let item of newFields){
                            await sequelizee.query(`ALTER TABLE ${tableName} ADD COLUMN ${item} VARCHAR(255)`)
                        }
                        let query = `INSERT INTO ${tableName} (`
                        let value = '';
                        delete fields.id;
                        delete fields.tableName;
                        Object.keys(fields).forEach((item, index) => {
                            if(index === Object.keys(fields).length -1){
                                query+= `${item} `;
                                value += `'${fields[item]}'`
                            }else{
                                query+= `${item}, `;
                                value += `'${fields[item]}',`
                            }
                        })
                        query +=') VALUES ('+ value + ');';
                        sequelizee.query(query).then((success)=>{
                            req.flash('info', 'Successfully data inserted');
                            res.redirect('back');
                        }).catch((error)=>{
                            req.flash('errors', 'Something went wrong');
                            res.redirect('back');
                        })
                        
                    // If not get any new field then directly insert into existing table
                    }else{
                        let query = `INSERT INTO ${tableName} (`
                        let value = '';
                        delete fields.id;
                        delete fields.tableName;
                        Object.keys(fields).forEach((item, index) => {
                            if(index === Object.keys(fields).length -1){
                                query+= `${item} `;
                                value += `'${fields[item]}'`
                            }else{
                                query+= `${item}, `;
                                value += `'${fields[item]}',`
                            }
                        })
                        query +=') VALUES ('+ value + ');';
                        sequelizee.query(query).then((success)=>{
                            req.flash('info', 'Successfully data inserted');
                            res.redirect('back');
                        }).catch((error)=>{
                            req.flash('errors', 'Something went wrong');
                            res.redirect('back');
                        })
                    }       
                
                // If table not exist then create table first and after that insert data into table
                }).catch(async(error)=>{
                    let arr = await models.dynamicformfields.findAll({attributes: ['fieldName', 'dataType'], where: { dynamicFormId: id } });
                    let query = '';
                    for(let item of arr){
                        query+= `, ${item.fieldName} VARCHAR(255) `;
                    }
                    sequelizee.query(`CREATE TABLE IF NOT EXISTS ${tableName}(id int NOT NULL PRIMARY KEY AUTO_INCREMENT ${query})`).then((ok)=>{
                        let query = `INSERT INTO ${tableName} (`
                        let value = '';
                        delete fields.id;
                        delete fields.tableName;
                        Object.keys(fields).forEach((item, index) => {
                            // console.log(index + " :: " + Object.keys(fields).length)
                            if(index === Object.keys(fields).length -1){
                                query+= `${item} `;
                                value += `'${fields[item]}'`
                            }else{
                                query+= `${item}, `;
                                value += `'${fields[item]}',`
                            }
                        })
                        query +=') VALUES ('+ value + ');';
                        sequelizee.query(query).then((success)=>{
                            req.flash('info', 'Successfully data inserted');
                            res.redirect('back');
                        }).catch((error)=>{
                            req.flash('errors', 'Something went wrong');
                            res.redirect('back');
                        })
                    });
                });


                // ===========================================

                // if(files){
                //     console.log(files);
                //     let query = `UPDATE ${tableName} SET (`
                //     let value = '';
                    
                //     // Object.keys(files).forEach((item, index) => {

                //         // console.log("Files " + item +' ' + index);
                //         let dynamicImage = Date.now() + files.imageupload[0].originalFilename;
                //         let ImageExt = dynamicImage.split('.').pop();
                //         let dynamicImageWithEXT = Date.now() + files.imageupload[0] + "." + ImageExt;
                //         helper.createDirectory('public/admin/dynamicform/files/');
                //         let tempPath = files.dynamicImage.path;
                //         var fileName = dynamicImageWithEXT.replace("[object Object]", "");
                //         console.log("*************" + fileName);
                //         let targetPath = "/" + fileName;
                //         console.log("********** " + tempPath + " " + targetPath + " " + fileName);
                //         helper.uploadDynamicFiles(tempPath, targetPath);

                //         // if(index === Object.keys(files).length -1){
                //         //     query+= `${item} `;
                //         //     value += `'${files[item]}'`
                //         // }else{
                //         //     query+= `${item}, `;
                //         //     value += `'${files[item]}',`
                //         // }
                //     // })

                //     query +=') VALUES ('+ value + ');';
                //     // sequelizee.query(query).then((success)=>{
                //     //     req.flash('info', 'Successfully data inserted');
                //     //     res.redirect('back');
                //     // }).catch((error)=>{
                //     //     req.flash('errors', 'Something went wrong');
                //     //     res.redirect('back');
                //     // })
 
                // }else{

                // }
            });  
        }	
    });
}

/**
 * This function is developed for listing Dynamic Form Datas
 * Developer: Partha Mandal
*/
exports.viewFormData = async (req, res) => {
    let token= req.session.token;
    let id = req.params.id;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if(!id){
                res.redirect('back');
            }else{
                let tableName = await models.dynamicforms.findOne({attributes:['tableName'], where: { id: id } });
                let dynamicforms = await models.dynamicformfields.findAll({attributes:['fieldName','displayName'], where: { dynamicFormId: id } });

                sequelizee.query(`SELECT * FROM ${tableName.tableName}`,{ type: sequelizee.QueryTypes.SELECT }).then((datas)=>{
                    return res.render('admin/dynamicForm/viewformdata', {
                        title: 'Data List',
                        arrData: datas,
                        dynamicforms: dynamicforms,
                        tableId: id,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                }).catch((nothing)=>{
                    req.flash('errors', 'There was no data found');
                    res.redirect('back');
                });
            }    
        }	
    });
}

/**
 * This function is developed for delete Dynamic Form Data
 * Developer: Partha Mandal
*/
exports.deleteFormData = (req, res, next) => {
    let token = req.session.token;
    let id = req.params.id;
    let tableId = req.query.tid;
    jwt.verify(token,SECRET,async (err,decoded) => {
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            let tableName = await models.dynamicforms.findOne({attributes:['tableName'], where: { id: tableId } });
            console.log(tableName + id + tableId);
            sequelizee.query(`DELETE FROM ${tableName.tableName} WHERE id=${id}`).then((success)=>{
                req.flash('info', 'Successfully data deleted');
                res.redirect('back');
            }).catch((error)=>{
                req.flash('errors', 'Something went wrong');
                res.redirect('back');
            });
        }
    });
};  