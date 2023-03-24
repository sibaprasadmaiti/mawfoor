const jwt = require('jsonwebtoken')
const SECRET = 'nodescratch'
const Sequelize = require("sequelize")
const Op = Sequelize.Op
const models = require('../../models')

exports.storeList = async (req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("errors", "Invalid Token");
            res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                
                const storeList = await models.stores.findAll({attributes:['id','storeCode','cCode','storeName','status']})

                return res.render('admin/imageresize/storelist', {
                    title: 'Stores List',
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

exports.imageSettingView = async (req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const id = req.params.id;
    jwt.verify(token,SECRET,async (err,decoded) => {
        if(err){
            req.flash('errors','Invalid Token');
            return res.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                if (!id) {
                    req.flash("errors", "Something went wrong!")
                    return res.redirect('back')
                } else {
                    const imageResizeDetails = await models.imageResize.findAll({ where: { storeId: id } });
                    if (imageResizeDetails) {
                        return res.render('admin/imageresize/manageimage', {
                            title: 'Manage Image Configurations',
                            data: imageResizeDetails,
                            storeId: id,
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

exports.imageSettingAddOrUpdate = async(req, res) => {
    const token = req.session.token;
    const sessionStoreId = req.session.user.storeId;
    const sessionUserId = req.session.user.id;
    jwt.verify(token, SECRET, async function (err, decoded) {
        if(err){
            res.flash('errors','Invalid Token');
            req.redirect('auth/signin');
        }else{
            if (sessionStoreId == null) {
                const {updateId, height, width} = req.body
                console.log("********************")
                console.log(req.body)
                console.log("********************")
                if (!updateId) {
                    req.flash("errors", "Something went wrong! Please try again")
                    return res.redirect('back')
                    
                } else {
                    try {
                        await models.imageResize.update({
                            height : height,
                            width : width,
                            createdBy : sessionUserId
                        },{where: {id : updateId}})

                        req.flash("info", "Successfully Updated")
                        return res.redirect('back')
                    } catch (error) {
                        req.flash("errors", "Something went wrong! Please try again")
                        return res.redirect('back')
                    }
                }
            } else {
                req.flash("errors", "You are not authorized to access this")
                res.redirect('back')
            }
        }
    })
}