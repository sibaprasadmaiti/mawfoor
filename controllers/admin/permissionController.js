const jwt = require('jsonwebtoken');
const SECRET = 'nodescratch';
const Sequelize = require("sequelize");
const Op = Sequelize.Op
const models = require('../../models');

exports.gropuList = async (req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const search = req.query.search || '';
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("errors", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                
                const groupList = await models.permissionGroup.findAll({ where: {
                    [Op.or]: [
                      { groupName: { [Op.like]: `%${search}%` } },
                      { slug: { [Op.like]: `%${search}%` } },
                      { description: { [Op.like]: `%${search}%` } },
                      { sequence: { [Op.like]: `%${search}%` } },
                      { status: { [Op.like]: `%${search}%` } }
                    ]
                }})

                return res.render('admin/permission/grouplist', {
                    title: 'Permission Group List',
                    arrData: groupList,
                    messages: req.flash('info'),
                    errors: req.flash('errors'),
                })
            }else{
                req.flash("errors", "You are not authorized to access this")
                res.redirect('back')
            }
        }
    })
}

exports.groupView = async (req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const id = req.params.id;
    jwt.verify(token,SECRET,async (err,decoded) => {
        if(err){
            req.flash('errors','Invalid Token');
            res.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                if (!id) {
                    return res.render('admin/permission/addgroup', {
                        title: 'Add Permission Group',
                        data: '',
                        messages: req.flash('info'),
                        errors: req.flash('errors')
                    });
                } else {
                    const permissionGroup = await models.permissionGroup.findOne({ where: { id: id } });
                    if (permissionGroup) {
                        return res.render('admin/permission/addgroup', {
                            title: 'Edit Permission Group',
                            data: permissionGroup,
                            messages: req.flash('info'),
                            errors: req.flash('errors')
                        });
                    }
                }
            }else{
                req.flash("errors", "You are not authorized to access this")
                res.redirect('back')
            }
        }
    });    
}

exports.groupAddOrUpdate = async(req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const sessionUserId = req.session.user.id;
    jwt.verify(token, SECRET, async function (err, decoded) {
        if(err){
            res.flash('errors','Invalid Token');
            req.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                const {updateId, groupName, description, sequence, status} = req.body
                const slug = groupName.toString().toLowerCase().replace(/\s+/g, '-')
                if (!updateId) {
                    try {
                        await models.permissionGroup.create({
                            groupName:groupName,
                            slug:slug,
                            description:description,
                            sequence:sequence,
                            status:status,
                            createdBy:sessionUserId
                        })

                        req.flash("info", "Successfully Created")
                        return res.redirect('/admin/permission-group/list')
                    } catch (error) {
                        req.flash("errors", "Something went wrong! Please try again")
                        return res.redirect('back')
                    }
                } else {
                    try {
                        await models.permissionGroup.update({
                            groupName:groupName,
                            // slug:slug,
                            description:description,
                            sequence:sequence,
                            status:status,
                            updatedBy:sessionUserId
                        }, {where:{id:updateId}})

                        req.flash("info", "Successfully Updated")
                        return res.redirect('/admin/permission-group/list')
                    } catch (error) {
                        req.flash("errors", "Something went wrong! Please try again")
                        res.redirect('back')
                    }
                }
            } else {
                req.flash("errors", "You are not authorized to access this")
                res.redirect('back')
            }
        }
    })
}

exports.logList = async (req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("errors", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                
                const storeList = await models.stores.findAll({ attributes:['id','storeCode','cCode','storeName','status']})

                return res.render('admin/permission/loglist', {
                    title: 'Permission Log List',
                    arrData: storeList,
                    messages: req.flash('info'),
                    errors: req.flash('errors'),
                })
            }else{
                req.flash("errors", "You are not authorized to access this")
                res.redirect('back')
            }
        }
    })
}

exports.logView = async (req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const storeId = req.params.id;
    jwt.verify(token,SECRET,async (err,decoded) => {
        if(err){
            req.flash('errors','Invalid Token');
            res.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                const store = await models.stores.findOne({ attributes:['id','storeName'], where:{id:storeId}})
                const permissionLog = await models.permissionLog.findAll({ where: { storeId: storeId } })
                const permissionGroupList = await models.permissionGroup.findAll({attributes:['id','groupName']})
                const logDetails = []
                if(permissionLog.length>0){
                    for(let log of permissionLog){
                        const group = await models.permissionGroup.findOne({attributes:['groupName'], where: { id: log.permissionGroupId } })
                        logDetails.push({id:log.permissionGroupId, groupName:group.groupName})
                    }
                }
                console.log(logDetails)
                return res.render('admin/permission/addlog', {
                    title: 'Edit Permission Log',
                    logDetails: logDetails,
                    permissionGroupList: permissionGroupList,
                    storeId: storeId,
                    storeName: store.storeName,
                    messages: req.flash('info'),
                    errors: req.flash('errors')
                })
            }else{
                req.flash("errors", "You are not authorized to access this")
                res.redirect('back')
            }
        }
    })
}

exports.logAddOrUpdate = async(req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const sessionUserId = req.session.user.id;
    jwt.verify(token, SECRET, async function (err, decoded) {
        if(err){
            res.flash('errors','Invalid Token');
            req.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                const storeId = req.body.storeId || ''
                const permission = req.body.permission || []
                console.log(storeId+ permission)

                try {
                    if(permission.length>0){
                        await models.permissionLog.destroy({where:{storeId:storeId}})
                        for(let i=0; i<permission.length; i++){
                            await models.permissionLog.create({
                                storeId:storeId,
                                permissionGroupId:permission[i],
                                createdBy:sessionUserId
                            })
                        }

                        req.flash("info", "Successfully Created")
                        return res.redirect('/admin/assign-permission/list')
                    }
                } catch (error) {
                    req.flash("errors", "Something went wrong! Please try again")
                    return res.redirect('back')
                }
            } else {
                req.flash("errors", "You are not authorized to access this")
                res.redirect('back')
            }
        }
    })
}