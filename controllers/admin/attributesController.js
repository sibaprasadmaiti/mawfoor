const models = require('../../models');
const multiparty = require('multiparty'); 
const jwt = require('jsonwebtoken');
const SECRET = 'nodescratch';
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
var helper = require('../../helpers/helper_functions');

/**
 * This function is developed for listing Attribute Setting
 * Developer: Partha Mandal
*/
exports.attrList = async (req, res) => {
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

                 let attrSettingList = await models.attributesetting.findAll({ where: {
                    [Op.or]: [
                        { attrName: { [Op.like]: `%${search}%` } },
                        { fieldName: { [Op.like]: `%${search}%` } },
                        { displayName: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.attributesetting.count({where: {
                    [Op.or]: [
                        { attrName: { [Op.like]: `%${search}%` } },
                        { fieldName: { [Op.like]: `%${search}%` } },
                        { displayName: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                  }});

                let pageCount = Math.ceil(listCount/pageSize);

                if (attrSettingList) {
                    return res.render('admin/attributes/attrsettinglist', {
                        title: 'Attribute Setting List',
                        arrData: attrSettingList,
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
                    return res.render('admin/attributes/attrsettinglist', {
                        title: 'Attribute Setting List',
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
                        return permission === 'AttributeSettingList'
                    })
                }
                if (userPermission == false) {
                    req.flash('errors', 'Contact Your administrator for permission');
                    res.redirect('/admin/dashboard');
                } else {
                    let storeList = await models.stores.findAll({ attributes: ['id', 'storeName'],where:{id: sessionStoreId} });

                    let attrSettingList = await models.attributesetting.findAll({ where: { storeId: sessionStoreId,
                        [Op.or]: [
                            { attrName: { [Op.like]: `%${search}%` } },
                            { fieldName: { [Op.like]: `%${search}%` } },
                            { displayName: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                      }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
    
                    let listCount = await models.attributesetting.count({where: {storeId: sessionStoreId,
                        [Op.or]: [
                            { attrName: { [Op.like]: `%${search}%` } },
                            { fieldName: { [Op.like]: `%${search}%` } },
                            { displayName: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                      }});
    
                    let pageCount = Math.ceil(listCount/pageSize);

                    if (attrSettingList) {
                        return res.render('admin/attributes/attrsettinglist', {
                            title: 'Attribute Setting List',
                            arrData: attrSettingList,
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
                        return res.render('admin/attributes/attrsettinglist', {
                            title: 'Attribute Setting List',
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
 * This function is developed for add/update Attribute Setting
 * Developer: Partha Mandal
*/
exports.attrAdd = (req, res, next) => {
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
                        return permission === 'AttributeSettingAddEdit'
                    })
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                let form = new multiparty.Form();
                form.parse(req,  async(err, fields, files) => {
                    let attrName = fields.attrName[0];
                    let fieldName = fields.fieldName[0];
                    let displayName = fields.displayName[0];
                    let dataType = fields.dataType[0] || 'text';
                    let storeId = fields.storeId[0];

                    if (attrName != '' && displayName !='' && storeId != '') {
                        let attrChecking = await models.attributesetting.count({where:{storeId: storeId, attrName: attrName}});
                        if(attrChecking){
                            req.flash('errors', `You have already use this attribute, please select another one.` )
                            return res.redirect('back')
                        }else{
                            await models.attributesetting.create({
                                attrName: attrName,
                                fieldName: fieldName,
                                displayName: displayName,
                                dataType: dataType,
                                storeId: storeId,
                                status: 'Yes',
                                createdBy: sessionUserId
                            }).then((value) =>{
                                req.flash('info', 'Successfully setting created');
                                return res.redirect('back')
                            }).catch((error)=> {
                                req.flash('errors', 'Somethings went wrong');
                            });  return res.redirect('back')
                        }
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
 * This function is developed for delete Attribute Setting
 * Developer: Partha Mandal
*/
exports.attrDelete = (req, res, next) => {
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
                        return permission === 'AttributeSettingDelete'
                    })
                }
                if (id) {
                    let storeIdChecking = await models.attributesetting.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.attributesetting.destroy({
                    where: { id: id }
                }).then((value) => {
                    req.flash('info', 'Successfully setting deleted');
                    res.redirect('back');
                }).catch((error) => {
                    req.flash('errors', 'Something went wrong');
                    res.redirect('back');
                })           
            }
        }
    });
};  

/**
 * This function is developed for status change of Attribute Setting
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
                        return permission === 'AttributeSettingStatusChange'
                    })
                }
                if (id) {
                    let storeIdChecking = await models.attributesetting.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                let status = await models.attributesetting.findOne({ attributes: ['status'], where: { id: id } });
                if(status.status == 'Yes' || status.status == 'yes'){
                    models.attributesetting.update({status:'No'},{where: { id: id }
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
                    models.attributesetting.update({status:'Yes'},{where: { id: id }
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
 * This function is developed for listing Attribute value
 * Developer: Partha Mandal
*/
exports.valueList = async (req, res) =>{
    let token= req.session.token;
    let id = req.query.sid;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            let attrSetting = await models.attributesetting.findOne({attributes:['displayName','storeId','attrName'], where: { id: id } });
            let attrValueList = await models.attributevalue.findAll({ where: { attrSettingId: id } });
            if(!attrSetting){
                res.redirect('back');
            }else{
                if (attrValueList) {
                    return res.render('admin/attributes/attrvaluelist', {
                        title: 'Attribute Value List',
                        arrData: attrValueList,
                        attrSettingId: id,
                        attrSetting: attrSetting,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } else {
                    return res.render('admin/attributes/attrvaluelist', {
                        title: 'Attribute Value List',
                        arrData: '',
                        attrSettingId: id,
                        attrSetting: attrSetting,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } 
            }   
        }	
    });
}


/**
 * This function is developed for create Attribute Value
 * Developer: Partha Mandal
*/
exports.valueAdd = async (req, res) => {
    let token= req.session.token;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            let form = new multiparty.Form();
            form.parse(req, (err, fields, files) => {
                let attrSettingId = fields.attrSettingId[0];
                let attrName = fields.attrName[0];
                let label = fields.label[0];
                let value = fields.value[0];
                let storeId = fields.storeId[0];
                let slug = value.toString().toLowerCase().replace(/\s+/g, '-')+"-"+storeId;
                let description = fields.description[0];

                if (label != '' && value != '') 
                {
                    models.attributevalue.create({
                        attrSettingId: attrSettingId,
                        attrName: attrName,
                        value: value,
                        label: label,
                        slug: slug,
                        description: description,
                        storeId: storeId
                    }).then((value) => 
                    {
                        if (value) 
                        {
                            if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                                var attrValueImage = Date.now() + files.image[0].originalFilename;
                                var ImageExt = attrValueImage.split('.').pop();
                                var attrValueImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                                var finalattrValueImage = attrValueImageWithEXT.replace("[object Object]", "");
                                helper.createDirectory('public/admin/attributes/'+storeId);
                                var tempPath = files.image[0].path;
                                var fileName = finalattrValueImage;
                                var targetPath = storeId + "/" + fileName;
                                helper.uploadattrValueImageFiles(tempPath, targetPath);
                            }
                            models.attributevalue.update({
                                image: finalattrValueImage
                            }, { where: { id: value.id } }).then(function (val)
                         {
                                if (val) {
                            req.flash('info', 'Successfully value added');
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
    })
}

/**
 * This function is developed for delete Attribute Value
 * Developer: Partha Mandal
*/
exports.valueDelete = (req, res, next) => {
    let token = req.session.token;
    let id = req.params.id;
    jwt.verify(token,SECRET,async (err,decoded) => {
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            models.attributevalue.destroy({
                where: { id: id }
            }).then((value) => {
                if (value) {
                    req.flash('info', 'Successfully value deleted');
                    res.redirect('back');
                } else {
                    req.flash('errors', 'Something went wrong');
                    res.redirect('back');
                }
            });
        }
    });
    
};  
