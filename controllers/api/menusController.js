const models = require('../../models')

/**
* Description:  Menu List
* Developer:  Partha Mandal
**/

exports.menuList = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const menuType =req.body.data.menuType || '';
	if(storeId && storeId != '' && storeId != null) {
        let menus
        if(menuType == 'header'){
            menus = await models.menus.findAll({where: { storeId:storeId, status:'Active', menuType:'header', parentMenuId: null}})
        }else if(menuType == 'footer'){
            menus = await models.menus.findAll({where: { storeId:storeId, status:'Active', menuType:'footer', parentMenuId: null}})
        }else{
            menus = await models.menus.findAll({where: { storeId:storeId, status:'Active', parentMenuId: null}})
        }

        let menuItems = []
        if(menus.length>0){
            for(let menu of menus){
                let data = {}
                data.id = menu.id
                data.title = menu.title
                data.label = menu.label
                data.description = menu.description
                data.link = menu.link
                data.slug = menu.slug
                data.target = menu.target
                data.menuType = menu.menuType

                let moduelTitle = await models.module.findOne({attributes:['title'], where:{id:menu.moduleId}})
                let moduelItemTitle = await models.moduleItem.findOne({attributes:['title'], where:{id:menu.moduleItemId}})

                if(moduelTitle){
                    data.moduelTitle = moduelTitle.title
                }else{
                    data.moduelTitle = ''
                }

                if(moduelItemTitle){
                    data.moduelItemTitle = moduelItemTitle.title
                }else{
                    data.moduelItemTitle = ''
                }

                const child = await models.menus.findAll({where:{parentMenuId:menu.id}})

                let clildMenu = []
                if (child.length>0) {
                    for(let c of child){
                        let data2 = {}
                        data2.id = c.id
                        data2.title = c.title
                        data2.label = c.label
                        data2.description = c.description
                        data2.link = c.link
                        data2.slug = c.slug
                        data2.target = c.target
                        data2.menuType = c.menuType
        
                        let moduelTitle = await models.module.findOne({attributes:['title'], where:{id:c.moduleId}})
                        let moduelItemTitle = await models.moduleItem.findOne({attributes:['title'], where:{id:c.moduleItemId}})
        
                        if(moduelTitle){
                            data2.moduelTitle = moduelTitle.title
                        }else{
                            data2.moduelTitle = ''
                        }
        
                        if(moduelItemTitle){
                            data2.moduelItemTitle = moduelItemTitle.title
                        }else{
                            data2.moduelItemTitle = ''
                        }
        
                        clildMenu.push(data2)
                    }
                } else {
                    clildMenu = []
                }
                data.subMenu = clildMenu
                menuItems.push(data)
            }
        }

        if(menuItems.length > 0){
            return res.status(200).send({ data:{success:true, details:menuItems}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:false, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Menu Create/Update
* Developer:  Partha Mandal
**/
exports.menuCreate = async (req, res) =>{
	const {updateId,storeId,sequence,title,label,description,link,target,menuType} =req.body.data
	const parentMenuId =req.body.data.parentMenuId || null;
	const moduleId =req.body.data.moduleId || null;
	const moduleItemId =req.body.data.moduleItemId || null;
	const dynamicSectionId =req.body.data.dynamicSectionId || null;
	const subSectionId =req.body.data.subSectionId || null;

	if(storeId && storeId != '' && storeId != null) {
        if (!updateId) {
            await models.menus.findAndCountAll({ where:{title:title, storeId:storeId}}).then(async (value)=>{
                let slug
                if(value.count >= 1){														
                  slug = title.toString().toLowerCase().replace(/\s+/g, '-')+"-"+(value.count)
                }else{
                  slug = title.toString().toLowerCase().replace(/\s+/g, '-')
                }
                await models.menus.create({
                    storeId: storeId,
                    parentMenuId: parentMenuId,
                    moduleId: moduleId,
                    moduleItemId: moduleItemId,
                    dynamicSectionId: dynamicSectionId,
                    subSectionId: subSectionId,
                    sequence: sequence,
                    title: title,
                    slug:slug,
                    label: label,
                    description: description,
                    link: link,
                    target: target,
                    menuType: menuType
                }).then(()=>{
                    return res.status(201).send({ data:{success:true, message:"Successfully menu created"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
                }).catch((err)=>{
                    console.log(err)
                    return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
                })
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
            })
        } else {
            await models.menus.update({
                storeId: storeId,
                parentMenuId: parentMenuId,
                moduleId: moduleId,
                moduleItemId: moduleItemId,
                dynamicSectionId: dynamicSectionId,
                subSectionId: subSectionId,
                sequence: sequence,
                title: title,
                label: label,
                description: description,
                link: link,
                target: target,
                menuType: menuType
            }, {where:{id:updateId}}).then(()=>{
                return res.status(201).send({ data:{success:true, message:"Successfully menu updated"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
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
* Description:  Menu Delete
* Developer:  Partha Mandal
**/
exports.menuDelete = async (req, res) =>{
	const id =req.params.id
	if(id && id != '' && id != null) {
        await models.menus.findOne({where:{id:id}}).then(async(value)=>{
            if (value) {
                await models.menus.update({status:'Inactive'}, {where: {id:id}}).then(()=>{
                    return res.status(200).send({ data:{success:true, message:"Successfully menu deleted"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
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
* Description:  Menus Name
* Developer:  Partha Mandal
**/
exports.menuName = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	if(storeId && storeId != '' && storeId != null) {
		const menus = await models.menus.findAll({attributes:['id','title'],where: {storeId:storeId, status:'Active', parentMenuId:null}})
        if(menus.length > 0){
            return res.status(200).send({ data:{success:true, details:menus}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:false, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Menu View
* Developer:  Partha Mandal
**/
exports.menuView = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const id =req.body.data.id || '';
	if(storeId && storeId != '' && storeId != null && id != '') {
		const menus = await models.menus.findOne({where: { storeId:storeId, id:id}})
        if(menus != null || menus != ''){
            return res.status(200).send({ data:{success:true, details:menus}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:false, details:{}}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:"storeId and id is required"}, errorNode:{errorCode:1, errorMsg:"storeId and id is required"}})
	}
}

/**
* Description:  status change
* Developer:  Partha Mandal
**/
exports.statusChange = async (req, res) =>{
	const storeId = req.body.data.storeId;
    const menuId = req.body.data.menuId;
    const status = req.body.data.status;
	if(storeId != '' && storeId != null && storeId != undefined && menuId != '' && menuId != null && menuId != undefined && status != '' && status != null && status != undefined) {
        await models.menus.update({status:status},{where: {id:menuId, storeId:storeId}}).then(async ()=>{
            return res.status(200).send({ data:{success:true, message:"Successfully status changed"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }).catch((err)=>{
            console.log(err)
            return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
        })
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId, menuId and status is required"}, errorNode:{errorCode:1, errorMsg:"storeId, menuId and status is required"}})
	}
}

exports.frontendMenu = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	if(storeId && storeId != '' && storeId != null) {
        const header = await models.menus.findAll({ attributes:['id','parentMenuId','title','label','link','slug','target','pageName'], where: { storeId:storeId, status:'Active', menuType:'header'}, order:[['sequence','ASC']]})

        const footer = await models.menus.findAll({ attributes:['id','parentMenuId','title','label','link','slug','target','pageName'], where: { storeId:storeId, status:'Active', menuType:'footer'}, order:[['sequence','ASC']]})
        
        let headerMenu
        let footerMenu = []

        if(header.length > 0){
            const data = [];
            for(let h of header){
                data.push({id:h.id, parentId: h.parentMenuId, title:h.title, label:h.label, link:h.link, slug:h.slug, target:h.target, pageName:h.pageName})
            }
            console.log("zzzzzzzzzzzzzzzzzzz----"+JSON.stringify(data));
            const idMapping = data.reduce((acc, el, i) => {
                acc[el.id] = i;
                return acc;
            }, {})
            let root = [];
            data.forEach((el) => {
            if (el.parentId === null)
            root.push(el);
            const parentEl = data[idMapping[el.parentId]]
            if(parentEl)
                parentEl.subMenu = [...(parentEl.subMenu || []), el]
            })
            headerMenu = root
        }else{
            headerMenu = []
        }

        if(footer.length > 0){
            for(let menu of footer){
                let data = {}
                data.title = menu.title
                data.label = menu.label
                data.link = menu.link
                data.slug = menu.slug
                data.target = menu.target
                data.pageName = menu.pageName
                footerMenu.push(data)
            }
        }

        if(header.length > 0 || footer.length > 0){
            return res.status(200).send({ data:{success:true, headerMenu:headerMenu, footerMenu:footerMenu}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, headerMenu:[], footerMenu:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}


exports.menuCount = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	if(storeId && storeId != '' && storeId != null) {
        headerMenus = await models.menus.findAll({where: { storeId:storeId, status:'Active', menuType:'header'}})
        footerMenus = await models.menus.findAll({where: { storeId:storeId, status:'Active', menuType:'footer'}})
        
        return res.status(200).send({ data:{success:true, headerMenusCount:headerMenus.length, footerMenusCount:footerMenus.length}, errorNode:{errorCode:0, errorMsg:"No Error"}})
	} else {
		return res.status(400).send({ data:{success:false, headerMenusCount:0, footerMenusCount:0}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}


exports.subMenuList = async (req, res) =>{
    const storeId =req.body.data.storeId || '';
    const menuId =req.body.data.menuId || '';
    if(storeId && storeId != '' && storeId != null) {
        if(menuId && menuId != '' && menuId != null) {
            let menus
            // if(menuType == 'header'){
            //     menus = await models.menus.findAll({where: { storeId:storeId, status:'Active', menuType:'header', parentMenuId: null}})
            // }else if(menuType == 'footer'){
            //     menus = await models.menus.findAll({where: { storeId:storeId, status:'Active', menuType:'footer', parentMenuId: null}})
            // }else{
                menus = await models.menus.findAll({where: { storeId:storeId, parentMenuId: menuId}})
            // }

            let menuItems = []
            if(menus.length>0){
                for(let menu of menus){
                    let data = {}
                    data.id = menu.id
                    data.title = menu.title
                    data.label = menu.label
                    data.description = menu.description
                    data.link = menu.link
                    data.slug = menu.slug
                    data.target = menu.target
                    data.menuType = menu.menuType

                    let moduelTitle = await models.module.findOne({attributes:['title'], where:{id:menu.moduleId}})
                    let moduelItemTitle = await models.moduleItem.findOne({attributes:['title'], where:{id:menu.moduleItemId}})

                    if(moduelTitle){
                        data.moduelTitle = moduelTitle.title
                    }else{
                        data.moduelTitle = ''
                    }

                    if(moduelItemTitle){
                        data.moduelItemTitle = moduelItemTitle.title
                    }else{
                        data.moduelItemTitle = ''
                    }

                    // const child = await models.menus.findAll({where:{parentMenuId:menu.id}})

                    // let clildMenu = []
                    // if (child.length>0) {
                    //     for(let c of child){
                    //         let data2 = {}
                    //         data2.id = c.id
                    //         data2.title = c.title
                    //         data2.label = c.label
                    //         data2.description = c.description
                    //         data2.link = c.link
                    //         data2.slug = c.slug
                    //         data2.target = c.target
                    //         data2.menuType = c.menuType
            
                    //         let moduelTitle = await models.module.findOne({attributes:['title'], where:{id:c.moduleId}})
                    //         let moduelItemTitle = await models.moduleItem.findOne({attributes:['title'], where:{id:c.moduleItemId}})
            
                    //         if(moduelTitle){
                    //             data2.moduelTitle = moduelTitle.title
                    //         }else{
                    //             data2.moduelTitle = ''
                    //         }
            
                    //         if(moduelItemTitle){
                    //             data2.moduelItemTitle = moduelItemTitle.title
                    //         }else{
                    //             data2.moduelItemTitle = ''
                    //         }
            
                    //         clildMenu.push(data2)
                    //     }
                    // } else {
                    //     clildMenu = []
                    // }
                    // data.subMenu = clildMenu
                    menuItems.push(data)
                }
            }

            if(menuItems.length > 0){
                return res.status(200).send({ data:{success:true, details:menuItems}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            } else {
                return res.status(200).send({ data:{success:false, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }
        } else {
            return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"Manu Id is required"}})
        }
    } else {
        return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
    }
}