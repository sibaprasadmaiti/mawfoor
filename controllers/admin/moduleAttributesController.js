const models = require('../../models');
const multiparty = require('multiparty'); 
const jwt = require('jsonwebtoken');
const SECRET = 'nodescratch';
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// * This function is developed for listing Module Attributes

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

                 let attrSettingList = await models.moduleAttrSetting.findAll({ where: {
                    [Op.or]: [
                        { attrName: { [Op.like]: `%${search}%` } },
                        { fieldName: { [Op.like]: `%${search}%` } },
                        { displayName: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                  }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });

                let listCount = await models.moduleAttrSetting.count({where: {
                    [Op.or]: [
                        { attrName: { [Op.like]: `%${search}%` } },
                        { fieldName: { [Op.like]: `%${search}%` } },
                        { displayName: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                  }});

                let pageCount = Math.ceil(listCount/pageSize);

                if (attrSettingList) {
                    return res.render('admin/moduleattributes/attrsettinglist', {
                        title: 'Modules Attribute List',
                        arrData: attrSettingList,
                        storeList: storeList,
                        isView: 'Yes',
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
                    return res.render('admin/moduleattributes/attrsettinglist', {
                        title: 'Modules Attribute List',
                        arrData: '',
                        storeList: '',
                        isView: 'Yes',
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

                    let attrSettingList = await models.moduleAttrSetting.findAll({ where: { storeId: sessionStoreId,
                        [Op.or]: [
                            { attrName: { [Op.like]: `%${search}%` } },
                            { fieldName: { [Op.like]: `%${search}%` } },
                            { displayName: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                      }, order: [[column, order]], limit:pageSize, offset:(page-1)*pageSize });
    
                    let listCount = await models.moduleAttrSetting.count({where: {storeId: sessionStoreId,
                        [Op.or]: [
                            { attrName: { [Op.like]: `%${search}%` } },
                            { fieldName: { [Op.like]: `%${search}%` } },
                            { displayName: { [Op.like]: `%${search}%` } },
                            { status: { [Op.like]: `%${search}%` } }
                        ]
                      }});
    
                    let pageCount = Math.ceil(listCount/pageSize);

                    let attrChecking = await models.moduleAttrSetting.count({where:{storeId: sessionStoreId, attrName: 'attr10'}})
                    let isView = 'Yes'
                    if (attrChecking > 0) {
                        isView = 'No'
                    }

                    if (attrSettingList) {
                        return res.render('admin/moduleattributes/attrsettinglist', {
                            title: 'Modules Attributes List',
                            arrData: attrSettingList,
                            storeList: storeList,
                            isView: isView,
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
                        return res.render('admin/moduleattributes/attrsettinglist', {
                            title: 'Modules Attributes List',
                            arrData: '',
                            storeList: '',
                            isView: 'Yes',
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

// * This function is developed for Add Module Attributes

exports.attrAdd = (req, res, next) => {
    let token = req.session.token;
    let sessionStoreId = req.session.user.storeId;
    let sessionUserId = req.session.user.id;
    let role = req.session.role;
    jwt.verify(token, SECRET, async  (err, decoded) => {
        if(err){
            res.flash('errors','Invalid Token');
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
                    let fieldName = fields.fieldName[0];
                    let displayName = fields.displayName[0];
                    let dataType = fields.dataType[0] || 'text';
                    let storeId = fields.storeId[0];

                    if (displayName !='' && storeId != '') {
                    
                        let attrChecking = await models.moduleAttrSetting.findAll({attributes:['attrName'],where:{storeId: storeId},order:[['id','DESC']], limit:1})
    
                        if(attrChecking.length > 0){
                            let attrName
                            if(attrChecking[0].attrName == 'attr1'){
                                attrName = 'attr2'
                            }else if(attrChecking[0].attrName == 'attr2'){
                                attrName = 'attr3'
                            }else if(attrChecking[0].attrName == 'attr3'){
                                attrName = 'attr4'
                            }else if(attrChecking[0].attrName == 'attr4'){
                                attrName = 'attr5'
                            }else if(attrChecking[0].attrName == 'attr5'){
                                attrName = 'attr6'
                            }else if(attrChecking[0].attrName == 'attr6'){
                                attrName = 'attr7'
                            }else if(attrChecking[0].attrName == 'attr7'){
                                attrName = 'attr8'
                            }else if(attrChecking[0].attrName == 'attr8'){
                                attrName = 'attr9'
                            }else if(attrChecking[0].attrName == 'attr9'){
                                attrName = 'attr10'
                            }else{
                                req.flash('errors', 'You have used all attributes');
                                return res.redirect('back')
                            }
    
                            await models.moduleAttrSetting.create({
                                attrName: attrName,
                                fieldName: fieldName,
                                displayName: displayName,
                                dataType: dataType,
                                storeId: storeId,
                                createdBy: sessionUserId
                            }).then((value) =>{
                                req.flash('info', 'Successfully setting created');
                                return res.redirect('back')
                            }).catch((error)=> {
                                req.flash('errors', 'Somethings went wrong');
                                return res.redirect('back')
                            })
                        }else{
                            await models.moduleAttrSetting.create({
                                attrName: 'attr1',
                                fieldName: fieldName,
                                displayName: displayName,
                                dataType: dataType,
                                storeId: storeId,
                                createdBy: sessionUserId
                            }).then((value) =>{
                                req.flash('info', 'Successfully setting created');
                                return res.redirect('back')
                            }).catch((error)=> {
                                req.flash('errors', 'Somethings went wrong');
                                return res.redirect('back')
                            })
                        }
                    }else{
                        req.flash('errors', 'Please fill the required fields.')
                        return res.redirect('back')
                    }
                })
            }
        }
    })
}

// * This function is developed for Delete Module Attributes

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
                    let storeIdChecking = await models.moduleAttrSetting.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                models.moduleAttrSetting.destroy({
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

// * This function is developed for Status Change Module Attributes

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
                    let storeIdChecking = await models.moduleAttrSetting.findOne({ attributes: ['storeId'], where: { id: id } });
                    if (storeIdChecking.storeId != sessionStoreId) {
                        userPermission = false;
                    }
                }
            }
            if (userPermission == false) {
                req.flash('errors', 'Contact Your administrator for permission');
                res.redirect('/admin/dashboard');
            } else {
                let status = await models.moduleAttrSetting.findOne({ attributes: ['status'], where: { id: id } });
                if(status.status == 'Active'){
                    models.moduleAttrSetting.update({status:'Inactive'},{where: { id: id }
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
                    models.moduleAttrSetting.update({status:'Active'},{where: { id: id }
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
// * This function is developed for listing Attributes Values

exports.valueList = async (req, res) =>{
    let token= req.session.token;
    let id = req.query.sid;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("info", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            let attrSetting = await models.moduleAttrSetting.findOne({attributes:['displayName','storeId','attrName'], where: { id: id } });
            let attrValueList = await models.moduleAttrValue.findAll({ where: { attrSettingId: id } });
            if(!attrSetting){
                res.redirect('back');
            }else{
                if (attrValueList) {
                    return res.render('admin/moduleattributes/attrvaluelist', {
                        title: 'Attribute Value List',
                        arrData: attrValueList,
                        attrSettingId: id,
                        attrSetting: attrSetting,
                        messages: req.flash('info'),
                        errors: req.flash('errors'),
                    });
                } else {
                    return res.render('admin/moduleattributes/attrvaluelist', {
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

// * This function is developed for Add Attributes Value

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

                if (label != '' && value != '') {
                    models.moduleAttrValue.create({
                        attrSettingId: attrSettingId,
                        attrName: attrName,
                        value: value,
                        label: label,
                        storeId: storeId
                    }).then((value) => {
                        if (value) {
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

// * This function is developed for Delete Attributes Values

exports.valueDelete = (req, res, next) => {
    let token = req.session.token;
    let id = req.params.id;
    jwt.verify(token,SECRET,async (err,decoded) => {
        if(err){
            res.flash('error','Invalid Token');
            req.redirect('auth/signin');
        }else{
            models.moduleAttrValue.destroy({
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
