var models = require("../../models");
var config = require("../../config/config.json");
var Sequelize = require("sequelize");
var sequelize = new Sequelize(
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
});

var fs = require('fs')
var fs = require('file-system');

exports.bannerList = async (req, res) => {
    let storeId = req.body.data.storeId;
    console.log(storeId);
    try {
        if (storeId && storeId != '') {
            let order = await models.banner.findAll({ attribute: ['title', 'link', 'target', 'sequence', 'image', 'mobileBannerImage', 'tabBannerImage', 'status'], where: { storeId: storeId } });
            if (order) {
                return res.status(200).send({
                    data: {
                        success: true,
                        details: order,
                    },
                    errorNode: { errorCode: 0, errorMsg: "No error" },
                });
            } else {
                res.status(400).send({
                    data: {
                        success: false,
                        details: {},
                        message: "Invalid store Id",
                    },
                    errorNode: {
                        errorCode: 1,
                        errorMsg: "Invalid store Id",
                    },
                });
            }
        } else {
            return res.status(200).send({ data: { success: false, message: 'store Id is required' }, errorNode: { errorCode: 1, errorMsg: '' } });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            data: { success: false, message: "Something went wrong" },
            errorNode: { errorCode: 1, errorMsg: error },
        });
    }
}

exports.bannerAdd_bkp_20_05 = async (req, res) => {
    const storeId = req.body.data.storeId;
    const title = req.body.data.title;
    const link = req.body.data.link;
    const target = req.body.data.target;
    const sequence = req.body.data.sequence;
    const image = req.body.data.image;
    const imageExt = req.body.data.imageExt;
    const mobileBannerImage = req.body.data.mobileBannerImage;
    const mobileBannerImageExt = req.body.data.mobileBannerImageExt;
    const tabBannerImage = req.body.data.tabBannerImage;
    const tabBannerImageExt = req.body.data.tabBannerImageExt;

    if (storeId && storeId != '') {
        try {
            const createBanner = models.banner.create({
                title: title,
                link: link,
                target: target,
                sequence: sequence
            })
            if (createBanner) {
                if (image && imageExt) {
                    var imageTitle = Date.now();
                    var directory = 'public/admin/banner/image/' + createBanner.id;
                    if (!fs.existsSync(directory)) {
                        helper.createDirectory(directory);
                    }
                    var path = `public/admin/banner/image/${createBanner.id}/${imageTitle}.${imageExt}`;
                    var newImage = `banner/${createBanner.id}/${imageTitle}.${imageExt}`;
                    try {
                        var imageData = image;
                        var base64Data = imageData.replace(
                            /^data:([A-Za-z-+/]+);base64,/,
                            ""
                        );
                        // fs.writeFileSync(path, base64Data, { encoding: "base64" });
                        await models.banner.update({
                            image: newImage
                        }, { where: { id: createBanner.id } })
                    } catch (error) {
                        next(error);
                    }
                }

                if (mobileBannerImage && mobileBannerImageExt) {
                    var mobileBannerImageTitle = Date.now();
                    var directory = 'public/admin/banner/image/' + createBanner.id;
                    if (!fs.existsSync(directory)) {
                        helper.createDirectory(directory);
                    }
                    var path = `public/admin/banner/image/${createBanner.id}/${mobileBannerImageTitle}.${mobileBannerImageExt}`;
                    var newmobileBannerImage = `banner/${createBanner.id}/${mobileBannerImageTitle}.${mobileBannerImageExt}`;
                    try {
                        var mobileBannerImageData = mobileBannerImage;
                        var base64Data = mobileBannerImageData.replace(
                            /^data:([A-Za-z-+/]+);base64,/,
                            ""
                        );
                        // fs.writeFileSync(path, base64Data, { encoding: "base64" });
                        await models.banner.update({
                            mobileBannerImage: newmobileBannerImage
                        }, { where: { id: createBanner.id } })
                    } catch (error) {
                        next(error);
                    }
                }

                if (tabBannerImage && tabBannerImageExt) {
                    var tabBannerImageTitle = Date.now();
                    var directory = 'public/admin/banner/image/' + createBanner.id;
                    if (!fs.existsSync(directory)) {
                        helper.createDirectory(directory);
                    }
                    var path = `public/admin/banner/image/${createBanner.id}/${tabBannerImageTitle}.${tabBannerImageExt}`;
                    var newtabBannerImage = `banner/${createBanner.id}/${tabBannerImageTitle}.${tabBannerImageExt}`;
                    try {
                        var tabBannerImageData = tabBannerImage;
                        var base64Data = tabBannerImageData.replace(
                            /^data:([A-Za-z-+/]+);base64,/,
                            ""
                        );
                        // fs.writeFileSync(path, base64Data, { encoding: "base64" });
                        await models.banner.update({
                            tabBannerImage: newtabBannerImage
                        }, { where: { id: createBanner.id } })
                    } catch (error) {
                        next(error);
                    }
                }
            }

            return res.status(200).send({
                data: {
                    success: true,
                    details: createBanner,
                    message: "Banner created Successfully"
                }, errorNode: {
                    errorCode: 0,
                    errorMsg: "No error"
                }
            })
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                data: {
                    success: false,
                    details: {},
                    message: "Something went wrong please try again",
                },
                errorNode: { errorCode: 1, errorMsg: error },
            });
        }
    } else {
        try {
            const updateBanner = models.banner.update({
                title: title,
                link: link,
                target: target,
                sequence: sequence
            }, { where: { id: id } });
            if (updateBanner) {
                const bannerImage = models.banner.findAll({
                    attributes: ["image", "mobileBannerImage", "tabBannerImage"],
                    where: { id: id }
                });

            }
            return res.status(200).send({
                data: {
                    success: true,
                    details: value,
                    message: "Banners updated Successfully"
                }, errorNode: {
                    errorCode: 0,
                    errorMsg: "No error"
                }
            })
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                data: { success: false, message: "Something went wrong" },
                errorNode: { errorCode: 1, errorMsg: error },
            });
        }
    }
}


exports.bannerAdd_bkp_23_05_00 = async (req, res) => {
    const id = req.body.id;
    const storeId = req.body.data.storeId;
    const title = req.body.data.title;
    const link = req.body.data.link;
    const target = req.body.data.target;
    const sequence = req.body.data.sequence;
    const image = req.body.data.image;
    const imageExt = req.body.data.imageExt;
    const mobileBannerImage = req.body.data.mobileBannerImage;
    const mobileBannerImageExt = req.body.data.mobileBannerImageExt;
    const tabBannerImage = req.body.data.tabBannerImage;
    const tabBannerImageExt = req.body.data.tabBannerImageExt;
    const status = req.body.data.status;

    if (storeId && storeId != '') {
        if (!id) {
            try {
                const createBanner = models.banner.create({
                    title: title,
                    link: link,
                    target: target,
                    sequence: sequence,
                    status: status
                })
                if (createBanner) {
                    if (image && imageExt) {
                        var imageTitle = Date.now();
                        var directory = 'public/admin/banner/image/' + createBanner.id;
                        if (!fs.existsSync(directory)) {
                            helper.createDirectory(directory);
                        }
                        var path = `public/admin/banner/image/${createBanner.id}/${imageTitle}.${imageExt}`;
                        var newImage = `banner/${createBanner.id}/${imageTitle}.${imageExt}`;
                        try {
                            var imageData = image;
                            var base64Data = imageData.replace(
                                /^data:([A-Za-z-+/]+);base64,/,
                                ""
                            );
                            // fs.writeFileSync(path, base64Data, { encoding: "base64" });
                            await models.banner.update({
                                image: newImage
                            }, { where: { id: createBanner.id } })
                        } catch (error) {
                            next(error);
                        }
                    }

                    if (mobileBannerImage && mobileBannerImageExt) {
                        var mobileBannerImageTitle = Date.now();
                        var directory = 'public/admin/banner/image/' + createBanner.id;
                        if (!fs.existsSync(directory)) {
                            helper.createDirectory(directory);
                        }
                        var path = `public/admin/banner/image/${createBanner.id}/${mobileBannerImageTitle}.${mobileBannerImageExt}`;
                        var newmobileBannerImage = `banner/${createBanner.id}/${mobileBannerImageTitle}.${mobileBannerImageExt}`;
                        try {
                            var mobileBannerImageData = mobileBannerImage;
                            var base64Data = mobileBannerImageData.replace(
                                /^data:([A-Za-z-+/]+);base64,/,
                                ""
                            );
                            // fs.writeFileSync(path, base64Data, { encoding: "base64" });
                            await models.banner.update({
                                mobileBannerImage: newmobileBannerImage
                            }, { where: { id: createBanner.id } })
                        } catch (error) {
                            next(error);
                        }
                    }

                    if (tabBannerImage && tabBannerImageExt) {
                        var tabBannerImageTitle = Date.now();
                        var directory = 'public/admin/banner/image/' + createBanner.id;
                        if (!fs.existsSync(directory)) {
                            helper.createDirectory(directory);
                        }
                        var path = `public/admin/banner/image/${createBanner.id}/${tabBannerImageTitle}.${tabBannerImageExt}`;
                        var newtabBannerImage = `banner/${createBanner.id}/${tabBannerImageTitle}.${tabBannerImageExt}`;
                        try {
                            var tabBannerImageData = tabBannerImage;
                            var base64Data = tabBannerImageData.replace(
                                /^data:([A-Za-z-+/]+);base64,/,
                                ""
                            );
                            // fs.writeFileSync(path, base64Data, { encoding: "base64" });
                            await models.banner.update({
                                tabBannerImage: newtabBannerImage
                            }, { where: { id: createBanner.id } })
                        } catch (error) {
                            next(error);
                        }
                    }
                }
                return res.status(200).send({
                    data: {
                        success: true,
                        details: createBanner,
                        message: "Banner created Successfully"
                    }, errorNode: {
                        errorCode: 0,
                        errorMsg: "No error"
                    }
                })
            } catch (error) {
                console.log(error);
                return res.status(500).send({
                    data: {
                        success: false,
                        details: {},
                        message: "Something went wrong please try again",
                    },
                    errorNode: { errorCode: 1, errorMsg: error },
                });
            }
        } else {
            try {
                const updateBanner = models.banner.update({
                    title: title,
                    link: link,
                    target: target,
                    sequence: sequence
                }, { where: { id: id } });
                if (updateBanner) {

                    if (image && imageExt) {
                        const bannerImage = models.banner.findOne({
                            attributes: ["image"],
                            where: { id: id }
                        });
                        fs.unlink(__dirname + 'public/admin/banner/image/' + id + '/' + bannerImage.image, (err) => {
                            if (err) throw err;
                            console.log('successfully deleted');
                        });
                        var imageTitle = Date.now();
                        var directory = 'public/admin/banner/image/' + id;
                        if (!fs.existsSync(directory)) {
                            helper.createDirectory(directory);
                        }
                        var path = `public/admin/banner/image/${id}/${imageTitle}.${imageExt}`;
                        var newimage = `banner/${id}/${imageTitle}.${imageExt}`;
                        try {
                            var imageData = image;
                            var base64Data = imageData.replace(
                                /^data:([A-Za-z-+/]+);base64,/,
                                ""
                            );
                            // fs.writeFileSync(path, base64Data, { encoding: "base64" });
                            await models.banner.update({
                                image: newimage
                            }, { where: { id: id } })
                        } catch (error) {
                            next(error);
                        }
                    }


                    if (mobileBannerImage && mobileBannerImageExt) {
                        const bannerImage = models.banner.findOne({
                            attributes: ["mobileBannerImage"],
                            where: { id: id }
                        });
                        fs.unlink(__dirname + 'public/admin/banner/image/' + id + '/' + bannerImage.mobileBannerImage, (err) => {
                            if (err) throw err;
                            console.log('successfully deleted');
                        });
                        var imageTitle = Date.now();
                        var directory = 'public/admin/banner/image/' + id;
                        if (!fs.existsSync(directory)) {
                            helper.createDirectory(directory);
                        }
                        var path = `public/admin/banner/image/${id}/${imageTitle}.${mobileBannerImageExt}`;
                        var newimage = `banner/${id}/${imageTitle}.${mobileBannerImageExt}`;
                        try {
                            var imageData = mobileBannerImage;
                            var base64Data = imageData.replace(
                                /^data:([A-Za-z-+/]+);base64,/,
                                ""
                            );
                            // fs.writeFileSync(path, base64Data, { encoding: "base64" });
                            await models.banner.update({
                                image: newimage
                            }, { where: { id: id } })
                        } catch (error) {
                            next(error);
                        }
                    }


                    if (tabBannerImage && imageExt) {
                        const bannerImage = models.banner.findOne({
                            attributes: ["tabBannerImage"],
                            where: { id: id }
                        });
                        fs.unlink(__dirname + 'public/admin/banner/image/' + id + '/' + bannerImage.tabBannerImage, (err) => {
                            if (err) throw err;
                            console.log('successfully deleted');
                        });
                        var imageTitle = Date.now();
                        var directory = 'public/admin/banner/image/' + id;
                        if (!fs.existsSync(directory)) {
                            helper.createDirectory(directory);
                        }
                        var path = `public/admin/banner/image/${id}/${imageTitle}.${imageExt}`;
                        var newimage = `banner/${id}/${imageTitle}.${imageExt}`;
                        try {
                            var imageData = image;
                            var base64Data = imageData.replace(
                                /^data:([A-Za-z-+/]+);base64,/,
                                ""
                            );
                            // fs.writeFileSync(path, base64Data, { encoding: "base64" });
                            await models.banner.update({
                                image: newimage
                            }, { where: { id: id } })
                        } catch (error) {
                            next(error);
                        }
                    }
                }

                return res.status(200).send({
                    data: {
                        success: true,
                        details: updateBanner,
                        message: "Banners updated Successfully"
                    }, errorNode: {
                        errorCode: 0,
                        errorMsg: "No error"
                    }
                })
            } catch (error) {
                console.log(error);
                return res.status(500).send({
                    data: { success: false, message: "Something went wrong" },
                    errorNode: { errorCode: 1, errorMsg: error },
                });
            }
        }
    } else {
        return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
}

exports.bannerAdd = async (req, res) => {
    const id = req.body.data.id;
    const storeId = req.body.data.storeId;
    const title = req.body.data.title;
    const link = req.body.data.link;
    const target = req.body.data.target;
    const sequence = req.body.data.sequence;
    const image = req.body.data.image;
    const imageExt = req.body.data.imageExt;
    const mobileBannerImage = req.body.data.mobileBannerImage;
    const mobileBannerImageExt = req.body.data.mobileBannerImageExt;
    const tabBannerImage = req.body.data.tabBannerImage;
    const tabBannerImageExt = req.body.data.tabBannerImageExt;
    const status = req.body.data.status;

    if (storeId && storeId != '' && storeId != null) {
        if (!id) {
            await models.banner.create({
                storeId: storeId,
                title: title,
                link: link,
                target: target,
                sequence: sequence,
                status: status
            }).then(async (val) => {
                const dir = './public/admin/banner/image/' + val.id;
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }

                if (image && image != '' && imageExt && imageExt != '') {
                    const imageTitle = Date.now();
                    const path = './public/admin/banner/image/' + val.id + '/' + imageTitle + '.' + imageExt;
                    const image = imageTitle + '.' + imageExt;
                    try {
                        const imgdata = image;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
                        fs.writeFileSync(path, base64Data, { encoding: 'base64' });
                        models.banner.update({
                            image: image,
                        }, { where: { id: val.id } })
                    } catch (e) {
                        next(e);
                    }
                }

                if (mobileBannerImage && mobileBannerImage != '' && mobileBannerImageExt && mobileBannerImageExt != '') {
                    const mobileBannerImageTitle = Date.now();
                    const path = './public/admin/banner/image/' + val.id + '/' + mobileBannerImageTitle + '.' + mobileBannerImageExt;
                    const mobileBannerImage = mobileBannerImageTitle + '.' + mobileBannerImageExt;
                    try {
                        const imgdata = mobileBannerImage;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
                        fs.writeFileSync(path, base64Data, { encoding: 'base64' });
                        models.banner.update({
                            mobileBannerImage: mobileBannerImage,
                        }, { where: { id: val.id } })
                    } catch (e) {
                        next(e);
                    }
                }

                if (tabBannerImage && tabBannerImage != '' && tabBannerImageExt && tabBannerImageExt != '') {
                    const tabBannerImageTitle = Date.now();
                    const path = './public/admin/banner/image/' + val.id + '/' + tabBannerImageTitle + '.' + tabBannerImageExt;
                    const tabBannerImage = tabBannerImageTitle + '.' + tabBannerImageExt;
                    try {
                        const imgdata = tabBannerImage;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
                        fs.writeFileSync(path, base64Data, { encoding: 'base64' });
                        models.banner.update({
                            tabBannerImage: tabBannerImage,
                        }, { where: { id: val.id } })
                    } catch (e) {
                        next(e);
                    }
                }

                return res.status(201).send({ data: { success: true, message: "Successfully created" }, errorNode: { errorCode: 0, errorMsg: "No Error" } })
            }).catch((err) => {
                console.log(err)
                return res.status(500).send({ data: { success: false, message: "Something went wrong !" }, errorNode: { errorCode: 1, errorMsg: err } })
            })
        } else {
            await models.banner.update({
                storeId: storeId,
                title: title,
                link: link,
                target: target,
                sequence: sequence
            }, { where: { id: id } }).then(async (val) => {

                if (image && image != '' && imageExt && imageExt != '') {
                    const banner = await models.banner.findOne({ attributes: ["image"], where: { id: id } });
                    if (banner.image && banner.image != '') {

                        if (fs.existsSync(__dirname + '/../../public/admin/banner/image/' + id + '/' + banner.image)) {
                            fs.unlink(__dirname + '/../../public/admin/banner/image/' + id + '/' + banner.image, (err) => {
                                if (err) throw err;
                                console.log('successfully deleted');
                            });
                        }
                    }
                    const imageTitle = Date.now();
                    const path = './public/admin/banner/image/' + id + '/' + imageTitle + '.' + imageExt;
                    const image = imageTitle + '.' + imageExt;
                    try {
                        const imgdata = image;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
                        fs.writeFileSync(path, base64Data, { encoding: 'base64' });
                        models.banner.update({
                            image: image,
                        }, { where: { id: id } })
                    } catch (e) {
                        next(e);
                    }
                }

                if (mobileBannerImage && mobileBannerImage != '' && mobileBannerImageExt && mobileBannerImageExt != '') {
                    const banner = await models.banner.findOne({ attributes: ["mobileBannerImage"], where: { id: id } });
                    if (banner.mobileBannerImage && banner.mobileBannerImage != '') {

                        if (fs.existsSync(__dirname + '/../../public/admin/banner/image/' + id + '/' + banner.mobileBannerImage)) {
                            fs.unlink(__dirname + '/../../public/admin/banner/image/' + id + '/' + banner.mobileBannerImage, (err) => {
                                if (err) throw err;
                                console.log('successfully deleted');
                            });
                        }
                    }
                    const imageTitle = Date.now();
                    const path = './public/admin/banner/image/' + id + '/' + imageTitle + '.' + mobileBannerImageExt;
                    const mobileBannerImages = imageTitle + '.' + mobileBannerImageExt;
                    try {
                        const imgdata = mobileBannerImages;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
                        fs.writeFileSync(path, base64Data, { encoding: 'base64' });
                        models.banner.update({
                            mobileBannerImage: mobileBannerImages,
                        }, { where: { id: id } })
                    } catch (e) {
                        next(e);
                    }
                }

                if (tabBannerImage && tabBannerImage != '' && tabBannerImageExt && tabBannerImageExt != '') {
                    const banner = await models.banner.findOne({ attributes: ["tabBannerImage"], where: { id: id } });
                    if (banner.tabBannerImage && banner.tabBannerImage != '') {

                        if (fs.existsSync(__dirname + '/../../public/admin/banner/image/' + id + '/' + banner.tabBannerImage)) {
                            fs.unlink(__dirname + '/../../public/admin/banner/image/' + id + '/' + banner.tabBannerImage, (err) => {
                                if (err) throw err;
                                console.log('successfully deleted');
                            });
                        }
                    }
                    const imageTitle = Date.now();
                    const path = './public/admin/banner/image/' + id + '/' + imageTitle + '.' + tabBannerImageExt;
                    const tabBannerImages = imageTitle + '.' + tabBannerImageExt;
                    try {
                        const imgdata = tabBannerImages;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
                        fs.writeFileSync(path, base64Data, { encoding: 'base64' });
                        models.banner.update({
                            tabBannerImage: tabBannerImages,
                        }, { where: { id: id } })
                    } catch (e) {
                        next(e);
                    }
                }

                return res.status(201).send({ data: { success: true, message: "Successfully updated" }, errorNode: { errorCode: 0, errorMsg: "No Error" } })
            }).catch((err) => {
                console.log(err)
                return res.status(500).send({ data: { success: false, message: "Something went wrong !" }, errorNode: { errorCode: 1, errorMsg: err } })
            })
        }
    } else {
        return res.status(400).send({ data: { success: false, message: "storeId is required" }, errorNode: { errorCode: 1, errorMsg: "storeId is required" } })
    }
}

exports.bannerView_bkp_26_05_22 = async (req, res) => {
    try {
        const id = req.body.data.id;
        const storeId = req.body.data.storeId || "";
        if (!storeId)
            return res.status(400).send({
                data: { success: false, message: "storeId is required" },
                errorNode: { errorCode: 1, errorMsg: "storeId is required" }
            })
        const bannerViewList = await models.banner.findOne({ where: { storeId: storeId } });
        if (bannerViewList) {
            const details = {
                title: bannerViewList.title,
                link: bannerViewList.link,
                target: bannerViewList.target,
                sequence: bannerViewList.sequence,
                image: bannerViewList.image ? req.app.locals.baseurl + "admin/banner/image/" + id + "/" + bannerViewList.image : req.app.locals.baseurl + "admin/banner/no_image.jpg",
                mobileBannerImage: bannerViewList.mobileBannerImage ? req.app.locals.baseurl + "admin/banner/image/" + id + "/" + bannerViewList.mobileBannerImage : req.app.locals.baseurl + "admin/banner/no_image.jpg",
                tabBannerImage: bannerViewList.tabBannerImage ? req.app.locals.baseurl + "admin/banner/image/" + id + "/" + bannerViewList.tabBannerImage : req.app.locals.baseurl + "admin/banner/no_image.jpg",
                status: bannerViewList.status,
            }
            return res.status(200).send({
                data: { success: true, details: details },
                errorNode: { errorCode: 0, errorMsg: "No Error" }
            })
        } else {
            return res.status(200).send({
                data: { success: true, details: {} },
                errorNode: { errorCode: 0, errorMsg: "No Data Found" }
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            data: { success: false, message: "Something went wrong" },
            errorNode: { errorCode: 1, errorMsg: error }
        })
    }
}

exports.bannerView = async (req, res) => {
    try {
        const id = req.body.data.id;
        const storeId = req.body.data.storeId || "";

        if (!storeId)
            return res.status(400).send({
                data: { success: false, message: "storeId is required" },
                errorNode: { errorCode: 1, errorMsg: "storeId is required" }
            })
        if (!id)
            return res.status(400).send({
                data: { success: false, message: "Id is required" },
                errorNode: { errorCode: 1, errorMsg: "Id is required" }
            })
        const bannerViewList = await models.banner.findOne({ where: { storeId: storeId, id: id } });
        if (bannerViewList) {
            const details = {
                title: bannerViewList.title,
                link: bannerViewList.link,
                target: bannerViewList.target,
                sequence: bannerViewList.sequence,
                image: bannerViewList.image ? req.app.locals.baseurl + "admin/banner/image/" + id + "/" + bannerViewList.image : req.app.locals.baseurl + "admin/banner/no_image.jpg",
                mobileBannerImage: bannerViewList.mobileBannerImage ? req.app.locals.baseurl + "admin/banner/image/" + id + "/" + bannerViewList.mobileBannerImage : req.app.locals.baseurl + "admin/banner/no_image.jpg",
                tabBannerImage: bannerViewList.tabBannerImage ? req.app.locals.baseurl + "admin/banner/image/" + id + "/" + bannerViewList.tabBannerImage : req.app.locals.baseurl + "admin/banner/no_image.jpg",
                status: bannerViewList.status,
            }
            return res.status(200).send({
                data: { success: true, details: details },
                errorNode: { errorCode: 0, errorMsg: "No Error" }
            })
        } else {
            return res.status(200).send({
                data: { success: true, details: {} },
                errorNode: { errorCode: 0, errorMsg: "No Data Found" }
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            data: { success: false, message: "Something went wrong" },
            errorNode: { errorCode: 1, errorMsg: error }
        })
    }
}

exports.bannerDelete = async (req, res) => {
    const id = req.body.data.id;
    try {
        let bannerDelete = await models.banner.destroy({where:{id:id}});
        if(bannerDelete){
            return res.status(200).send({
                data: {
                    success: true,
                    message: "Banner Successfully Deleted"
                }, errorNode: {
                    errorCode: 0,
                    errorMsg: "No error"
                }
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            data: { success: false, message: "Something went wrong" },
            errorNode: { errorCode: 1, errorMsg: error },
        });
    }
}

