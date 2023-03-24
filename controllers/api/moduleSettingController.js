const imageThumbnail = require('image-thumbnail')
const fs = require("file-system")
const models = require('../../models')
/**
* Description:  Module Setting List
**/
exports.settingList = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	if(storeId && storeId != '' && storeId != null) {
		const moduleSetting = await models.moduleSetting.findAll({where: { storeId:storeId}})
        const list = moduleSetting.map((m) => {
            return Object.assign({},
              {
                id: m.id,
                siteName: m.siteName,
                name: m.name,
                title: m.title,
                email: m.email,
                mobileNo: m.mobileNo,
                fax: m.fax,
                gstn: m.gstn,
                siteURL: m.siteURL,
                sslRedirect: m.sslRedirect,
                copyright: m.copyright,
                version: m.version,
                location: m.location,
                country: m.country,
                address: m.address,
                latitude: m.latitude,
                longitude: m.longitude,
                slug: m.slug,
                createdAt: m.createdAt,
                logo: m.logo != "" && m.logo != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + m.logo  : req.app.locals.baseurl + "admin/category/no_image.jpg",
                fabIcon: m.fabIcon != "" && m.fabIcon != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + m.fabIcon  : req.app.locals.baseurl + "admin/category/no_image.jpg",
              }
            )
        })
		const count = await models.moduleSetting.count({where: { storeId:storeId}})
        if(count > 0){
            return res.status(200).send({ data:{success:true, count:count, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Module Setting View
**/
exports.settingView = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const id =req.body.data.id || '';
	if(storeId && storeId != '' && storeId != null) {
        if(id != ''){
            const moduleSetting = await models.moduleSetting.findOne({where: { storeId:storeId, id:id}})
            const newModuleSetting = moduleSetting.dataValues
    
            newModuleSetting.logoLink= moduleSetting.logo != "" && moduleSetting.logo != null ? req.app.locals.baseurl + "admin/module/" + storeId  + "/" + moduleSetting.logo : req.app.locals.baseurl + "admin/category/no_image.jpg",

            newModuleSetting.fabIconLink=  moduleSetting.fabIcon != "" && moduleSetting.fabIcon != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + moduleSetting.fabIcon : req.app.locals.baseurl + "admin/category/no_image.jpg"

            return res.status(200).send({ data:{success:true, details:newModuleSetting, message:"Edit Setting"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }else{
            return res.status(200).send({ data:{success:true, details:"", message:"Add Setting"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Module Setting Create/Update
**/
exports.settingCreate = async (req, res) =>{
	const {updateId,storeId,ip,title,siteName,name,email,mobileNo,fax,gstn,siteURL,sslRedirect,copyright,logo,logoExt, fabIcon,fabIconExt, version,location,country,address,latitude,longitude,poweredByText,poweredByLink,facebookLink,instagramLink,twitterLink,otherLink,metaTitle,metaKeyword,metaDescription} =req.body.data
    const lastUpdate = new Date()
	if(storeId && storeId != '' && storeId != null) {
        if (!updateId) {
            await models.moduleSetting.findAndCountAll({ where:{siteName:siteName, storeId:storeId}}).then(async (value)=>{
                let slug
                if(value.count >= 1){														
                  slug = siteName.toString().toLowerCase().replace(/\s+/g, '-')+"-"+(value.count)
                }else{
                  slug = siteName.toString().toLowerCase().replace(/\s+/g, '-')
                }
                await models.moduleSetting.create({
                    storeId: storeId,
                    ip: ip,
                    siteName: siteName,
                    name: name,
                    title:title,
                    email: email,
                    mobileNo: mobileNo,
                    fax: fax,
                    gstn:gstn,
                    slug:slug,
                    siteURL: siteURL,
                    sslRedirect:sslRedirect,
                    copyright: copyright,
                    version: version,
                    location:location,
                    country:country,
                    address: address,
                    latitude:latitude,
                    longitude:longitude,
                    poweredByText: poweredByText,
                    poweredByLink: poweredByLink,
                    facebookLink: facebookLink,
                    instagramLink: instagramLink,
                    twitterLink: twitterLink,
                    otherLink: otherLink,
                    metaTitle: metaTitle,
                    metaKeyword: metaKeyword,
                    metaDescription: metaDescription,
                    lastUpdate: lastUpdate
                }).then(async(val)=>{
                    const dir = "./public/admin/module/" + storeId;
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }

                    if (logo && logo != "" && logoExt && logoExt != "") {
                        const logoTitle = Date.now();
                        const path = "./public/admin/module/" + storeId + "/" + logoTitle + "." + logoExt;
                        const normallogo = logoTitle + "." + logoExt;
                        try {
                            const imgdata = logo;
                            const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, "" );
                            const options = { height: 250 }
                            const compressed = await imageThumbnail(base64Data, options);             
                            fs.writeFileSync(path, compressed,  {encoding: 'base64'});
                            models.moduleSetting.update({logo: normallogo},{ where: { id: val.id } } );
                        } catch (e) {
                            console.log(e)
                        }
                    }

                    if (fabIcon && fabIcon != "" && fabIconExt && fabIconExt != "") {
                        const fabIconTitle = Date.now();
                        const path = "./public/admin/module/" + storeId + "/" + fabIconTitle + "." + fabIconExt;
                        const normalfabIcon = fabIconTitle + "." + fabIconExt;
                        try {
                            const imgdata = fabIcon;
                            const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, "" );
                            const options = { height: 250 }
                            const compressed = await imageThumbnail(base64Data, options);             
                            fs.writeFileSync(path, compressed,  {encoding: 'base64'});
                            models.moduleSetting.update({fabIcon: normalfabIcon},{ where: { id: val.id } } );
                        } catch (e) {
                            console.log(e)
                        }
                    }
                    return res.status(201).send({ data:{success:true, message:"Successfully created"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
                }).catch((err)=>{
                    console.log(err)
                    return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
                })
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
            })
        } else {
            await models.moduleSetting.update({
                storeId: storeId,
                ip: ip,
                siteName: siteName,
                name: name,
                title:title,
                email: email,
                mobileNo: mobileNo,
                fax: fax,
                gstn:gstn,
                siteURL: siteURL,
                sslRedirect:sslRedirect,
                copyright: copyright,
                version: version,
                location:location,
                country:country,
                address: address,
                latitude:latitude,
                longitude:longitude,
                poweredByText: poweredByText,
                poweredByLink: poweredByLink,
                facebookLink: facebookLink,
                instagramLink: instagramLink,
                twitterLink: twitterLink,
                otherLink: otherLink,
                metaTitle: metaTitle,
                metaKeyword: metaKeyword,
                metaDescription: metaDescription,
                lastUpdate: lastUpdate
            }, {where:{id:updateId}}).then(async()=>{
                const dir = "./public/admin/module/" + storeId;
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }

                if (logo && logo != "" && logoExt && logoExt != "") {
                    const logoImage = await moduleSetting.module.findOne({ attributes: ["logo"], where: { id: updateId }});
                    if (logoImage.logo && logoImage.logo != "" && logoImage.logo != null) {
                        if (fs.existsSync(__dirname +"/../../public/admin/module/" +storeId +"/" +logoImage.logo)) {
                            fs.unlink(__dirname +"/../../public/admin/module/" +storeId +"/" +logoImage.logo,
                            (err) => {if (err) throw err; console.log("successfully deleted")}
                            )
                        }
                    }

                    const logoTitle = Date.now();
                    const path = "./public/admin/module/" + storeId + "/" + logoTitle + "." + logoExt;
                    const normallogo = logoTitle + "." + logoExt;
                    try {
                        const imgdata = logo;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, "" );
                        const options = { height: 250 }
                        const compressed = await imageThumbnail(base64Data, options);             
                        fs.writeFileSync(path, compressed,  {encoding: 'base64'});
                        models.moduleSetting.update({logo: normallogo},{ where: { id: val.id } } );
                    } catch (e) {
                        console.log(e)
                    }
                }

                if (fabIcon && fabIcon != "" && fabIconExt && fabIconExt != "") {
                    const fabIconImage = await moduleSetting.module.findOne({ attributes: ["fabIcon"], where: { id: updateId }});
                    if (fabIconImage.fabIcon && fabIconImage.fabIcon != "" && fabIconImage.fabIcon != null) {
                        if (fs.existsSync(__dirname +"/../../public/admin/module/" +storeId +"/" +fabIconImage.fabIcon)) {
                            fs.unlink(__dirname +"/../../public/admin/module/" +storeId +"/" +fabIconImage.fabIcon,
                            (err) => {if (err) throw err; console.log("successfully deleted")}
                            )
                        }
                    }

                    const fabIconTitle = Date.now();
                    const path = "./public/admin/module/" + storeId + "/" + fabIconTitle + "." + fabIconExt;
                    const normalfabIcon = fabIconTitle + "." + fabIconExt;
                    try {
                        const imgdata = fabIcon;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, "" );
                        const options = { height: 250 }
                        const compressed = await imageThumbnail(base64Data, options);             
                        fs.writeFileSync(path, compressed,  {encoding: 'base64'});
                        models.moduleSetting.update({fabIcon: normalfabIcon},{ where: { id: val.id } } );
                    } catch (e) {
                        console.log(e)
                    }
                }

                return res.status(201).send({ data:{success:true, message:"Successfully updated"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
            })
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Module Setting Delete
**/
exports.settingDelete = async (req, res) =>{
	const id =req.params.id
	if(id && id != '' && id != null) {
        await models.moduleSetting.findOne({where:{id:id}}).then(async(value)=>{
            if (value) {
                await models.moduleSetting.destroy({where: {id:id}}).then(()=>{
                    return res.status(200).send({ data:{success:true, message:"Successfully deleted"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
                }).catch((err)=>{
                    console.log(err)
                    return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
                })
            } else {
                return res.status(200).send({ data:{success:false, message:"Id not match"}, errorNode:{errorCode:1, errorMsg:"No Error"}})
            }
        }).catch((err)=>{
            console.log(err)
            return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
        })
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"Id is required"}})
	}
}

/**
* Description:  Module Setting List for frontend
**/
exports.frontendSettingList = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	if(storeId && storeId != '' && storeId != null) {
		const settings = await models.moduleSetting.findOne({where: { storeId:storeId, status:'Active'}})

        const newSetting = {
            id:settings.id,
            ip:settings.ip,
            siteName:settings.siteName,
            name:settings.name,
            title:settings.title,
            email:settings.email,
            mobileNo:settings.mobileNo,
            fax:settings.fax,
            gstn:settings.gstn,
            siteURL:settings.siteURL,
            sslRedirect:settings.sslRedirect,
            copyright:settings.copyright,
            version:settings.version,
            location:settings.location,
            country:settings.country,
            address:settings.address,
            latitude:settings.latitude,
            longitude:settings.longitude,
            poweredByText:settings.poweredByText,
            poweredByLink:settings.poweredByLink,
            facebookLink:settings.facebookLink,
            instagramLink:settings.instagramLink,
            twitterLink:settings.twitterLink,
            otherLink:settings.otherLink,
            slug:settings.slug,
            metaTitle:settings.metaTitle,
            metaKeyword:settings.metaKeyword,
            metaDescription:settings.metaDescription,
            lastUpdate:settings.lastUpdate,
            createdAt:settings.createdAt,
            logo: settings.logo != "" && settings.logo != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + settings.logo  : null,
            fabIcon: settings.fabIcon != "" && settings.fabIcon != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + settings.fabIcon  : null
        }
        const count = await models.moduleSetting.count({where:{storeId:storeId, status:'Active'}})

        if(count > 0){
            return res.status(200).send({ data:{success:true, details:newSetting}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:"storeId is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}