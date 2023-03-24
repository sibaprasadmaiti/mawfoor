const models = require('../../models')
const jwt = require('jsonwebtoken')
const SECRET = 'nodescratch'
const Sequelize = require("sequelize")
const Op = Sequelize.Op

/**
 * This function is developed for view migration form
*/
exports.view = async (req, res) => {
    const token= req.session.token;
    const sessionStoreId = req.session.user.storeId;
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("errors", "Invalid Token");
            return res.redirect('/auth/signin');
        }else{
            if (sessionStoreId == null) {
                const storeList = await models.stores.findAll({ attributes: ['id', 'storeName'], where:{status:'Yes'}})
                return res.render('admin/datamigrate/addedit', {
                    title: 'Migrate Data',
                    storeList: storeList,
                    messages: req.flash('info'),
                    errors: req.flash('errors'),
                })
            }else{
                req.flash("errors", "Your are not authorized to access this module");
                return res.redirect('back');  
            }            
        }	
    })
}

/**
 * This function is developed for Migrate data from one store to another store
*/
exports.create = async (req, res) => {
    const token= req.session.token
    const sessionStoreId = req.session.user.storeId
    jwt.verify(token, SECRET, async (err, decoded) => {
        if (err) {
            req.flash("errors", "Invalid Token")
            return res.redirect('/auth/signin')
        }else{
            if (sessionStoreId == null) {
                const fromStore = req.body.fromStore
                const toStore = req.body.toStore
                const moduleName = req.body.moduleName

                if(fromStore == '' || fromStore == null) {
                    req.flash("errors", "From store is required")
                    return res.redirect('back')
                }
                if(toStore == '' || toStore == null) {
                    req.flash("errors", "To store is required")
                    return res.redirect('back')
                }
                if(fromStore == toStore) {
                    req.flash("errors", "From store and To store can't be same")
                    return res.redirect('back')
                }
                if(moduleName == undefined || moduleName.length == 0) {
                    req.flash("errors", "Please select any module name")
                    return res.redirect('back')
                }
                for(let module of moduleName){
                    if(module=='module'){
                        const datas = await models.module.findAll({where:{storeId:fromStore}})
                        if(datas.length>0){
                            const modifyData = datas.map(data =>{
                                return Object.assign({},{
                                    storeId:toStore,
                                    title:data.title,
                                    shortDescription:data.shortDescription,
                                    longDescription:data.longDescription,
                                    slug:data.slug,
                                    metaTitle:data.metaTitle,
                                    metaKeyword:data.metaKeyword,
                                    metaDescription:data.metaDescription,
                                    relavantIndustry:data.relavantIndustry
                                })
                            })
                            for(let details of modifyData){
                                await models.module.create({
                                    storeId:details.storeId,
                                    title:details.title,
                                    shortDescription:details.shortDescription,
                                    longDescription:details.longDescription,
                                    slug:details.slug,
                                    metaTitle:details.metaTitle,
                                    metaKeyword:details.metaKeyword,
                                    metaDescription:details.metaDescription,
                                    relavantIndustry:details.relavantIndustry
                                })
                            }
                        }
                    }

                    if(module=='moduleItem'){
                        const datas = await models.moduleItem.findAll({where:{storeId:fromStore}})
                        if(datas.length>0){
                            const modifyData = []
                            for(let data of datas){
                                let moduleId = null
                                const moduleDetails = await models.module.findOne({attributes:['slug'],where:{id:data.moduleId}})
                                if(moduleDetails != '' && moduleDetails != null){
                                    const moduleDetails2 = await models.module.findOne({attributes:['id'],where:{slug:moduleDetails.slug, storeId: toStore}, order:[['id','ASC']]})
                                    if(moduleDetails2 != '' && moduleDetails2 != null){
                                        moduleId = moduleDetails2.id
                                    }
                                }
                                modifyData.push({
                                    storeId:toStore,
                                    moduleId:moduleId,
                                    sequence:data.sequence,
                                    title:data.title,
                                    shortDescription:data.shortDescription,
                                    longDescription:data.longDescription,
                                    slug:data.slug,
                                    metaTitle:data.metaTitle,
                                    metaKeyword:data.metaKeyword,
                                    metaDescription:data.metaDescription,
                                    attr1:data.attr1,
                                    attr2:data.attr2,
                                    attr3:data.attr3,
                                    attr4:data.attr4,
                                    attr5:data.attr5,
                                    attr6:data.attr6,
                                    attr7:data.attr7,
                                    attr8:data.attr8,
                                    attr9:data.attr9,
                                    attr10:data.attr10
                                })
                            }

                            for(let details of modifyData){
                                await models.moduleItem.create({
                                    storeId:details.storeId,
                                    moduleId:details.moduleId,
                                    sequence:details.sequence,
                                    title:details.title,
                                    shortDescription:details.shortDescription,
                                    longDescription:details.longDescription,
                                    slug:details.slug,
                                    metaTitle:details.metaTitle,
                                    metaKeyword:details.metaKeyword,
                                    metaDescription:details.metaDescription,
                                    attr1:details.attr1,
                                    attr2:details.attr2,
                                    attr3:details.attr3,
                                    attr4:details.attr4,
                                    attr5:details.attr5,
                                    attr6:details.attr6,
                                    attr7:details.attr7,
                                    attr8:details.attr8,
                                    attr9:details.attr9,
                                    attr10:details.attr10
                                })
                            }
                        }
                    }

                    if(module=='dynamicSection'){
                        const datas = await models.dynamicSection.findAll({where:{storeId:fromStore}})
                        if(datas.length>0){
                            const modifyData = []
                            for(let data of datas){
                                let moduleId = null
                                let moduleItemId = null
                                const moduleDetails = await models.module.findOne({attributes:['slug'],where:{id:data.moduleId}})
                                const moduleItemDetails = await models.moduleItem.findOne({attributes:['slug'],where:{id:data.moduleItemId}})
                                if(moduleDetails != '' && moduleDetails != null){
                                    const moduleDetails2 = await models.module.findOne({attributes:['id'],where:{slug:moduleDetails.slug, storeId: toStore}, order:[['id','ASC']]})

                                    if(moduleDetails2 != '' && moduleDetails2 != null){
                                        moduleId = moduleDetails2.id
                                    }
                                }
                                if(moduleItemDetails != '' && moduleItemDetails != null){
                                    const moduleItemDetails2 = await models.moduleItem.findOne({attributes:['id'],where:{slug:moduleItemDetails.slug, storeId: toStore}, order:[['id','ASC']]})

                                    if(moduleItemDetails2 != '' && moduleItemDetails2 != null){
                                        moduleItemId = moduleItemDetails2.id
                                    }
                                }
                                modifyData.push({
                                    storeId:toStore,
                                    moduleId:moduleId,
                                    moduleItemId:moduleItemId,
                                    sequence:data.sequence,
                                    title:data.title,
                                    description:data.description,
                                    slug:data.slug,
                                    cssClass:data.cssClass,
                                    link:data.link,
                                    buttontext:data.buttontext,
                                    buttonlink:data.buttonlink,
                                    metaTitle:data.metaTitle,
                                    metaKeyword:data.metaKeyword,
                                    metaDescription:data.metaDescription
                                })
                            }

                            for(let details of modifyData){
                                await models.dynamicSection.create({
                                    storeId:details.storeId,
                                    moduleId:details.moduleId,
                                    moduleItemId:details.moduleItemId,
                                    sequence:details.sequence,
                                    title:details.title,
                                    description:details.description,
                                    slug:details.slug,
                                    cssClass:details.cssClass,
                                    link:details.link,
                                    buttontext:details.buttontext,
                                    buttonlink:details.buttonlink,
                                    metaTitle:details.metaTitle,
                                    metaKeyword:details.metaKeyword,
                                    metaDescription:details.metaDescription
                                })
                            }
                        }
                    }
                    
                    if(module=='subSection'){
                        const datas = await models.subSection.findAll({where:{storeId:fromStore}})
                        if(datas.length>0){
                            const modifyData = []
                            for(let data of datas){
                                let sectionId = null
                                const dynamicSectionDetails = await models.dynamicSection.findOne({attributes:['slug'],where:{id:data.sectionId}})
                                if(dynamicSectionDetails != '' && dynamicSectionDetails != null){
                                    const dynamicSectionDetails2 = await models.dynamicSection.findOne({attributes:['id'],where:{slug:dynamicSectionDetails.slug, storeId: toStore}, order:[['id','ASC']]})

                                    if(dynamicSectionDetails2 != '' && dynamicSectionDetails2 != null){
                                        sectionId = dynamicSectionDetails2.id
                                    }
                                }
                                modifyData.push({
                                    storeId:toStore,
                                    sectionId:sectionId,
                                    sequence:data.sequence,
                                    title:data.title,
                                    description:data.description,
                                    shortText:data.shortText,
                                    longText:data.longText,
                                    slug:data.slug,
                                    cssClass:data.cssClass,
                                    link:data.link,
                                    buttontext:data.buttontext,
                                    buttonlink:data.buttonlink,
                                    metaTitle:data.metaTitle,
                                    metaKeyword:data.metaKeyword,
                                    metaDescription:data.metaDescription
                                })
                            }

                            for(let details of modifyData){
                                await models.subSection.create({
                                    storeId:details.storeId,
                                    sectionId:details.sectionId,
                                    sequence:details.sequence,
                                    title:details.title,
                                    description:details.description,
                                    shortText:details.shortText,
                                    longText:details.longText,
                                    slug:details.slug,
                                    cssClass:details.cssClass,
                                    link:details.link,
                                    buttontext:details.buttontext,
                                    buttonlink:details.buttonlink,
                                    metaTitle:details.metaTitle,
                                    metaKeyword:details.metaKeyword,
                                    metaDescription:details.metaDescription
                                })
                            }
                        }
                    }

                    if(module=='menu'){
                        const datas = await models.menus.findAll({where:{storeId:fromStore, parentMenuId:null}})
                        if(datas.length>0){
                            const modifyData = []
                            for(let data of datas){
                                let moduleId = null
                                let moduleItemId = null
                                const moduleDetails = await models.module.findOne({attributes:['slug'],where:{id:data.moduleId}})
                                const moduleItemDetails = await models.moduleItem.findOne({attributes:['slug'],where:{id:data.moduleItemId}})
                                if(moduleDetails != '' && moduleDetails != null){
                                    const moduleDetails2 = await models.module.findOne({attributes:['id'],where:{slug:moduleDetails.slug, storeId: toStore}, order:[['id','ASC']]})

                                    if(moduleDetails2 != '' && moduleDetails2 != null){
                                        moduleId = moduleDetails2.id
                                    }
                                }
                                if(moduleItemDetails != '' && moduleItemDetails != null){
                                    const moduleItemDetails2 = await models.moduleItem.findOne({attributes:['id'],where:{slug:moduleItemDetails.slug, storeId: toStore}, order:[['id','ASC']]})

                                    if(moduleItemDetails2 != '' && moduleItemDetails2 != null){
                                        moduleItemId = moduleItemDetails2.id
                                    }
                                }
                                modifyData.push({
                                    storeId:toStore,
                                    parentMenuId:null,
                                    moduleId:moduleId,
                                    moduleItemId:moduleItemId,
                                    title:data.title,
                                    slug:data.slug,
                                    sequence:data.sequence,
                                    pageName:data.pageName,
                                    label:data.label,
                                    link:data.link,
                                    target:data.target,
                                    menuType:data.menuType,
                                    description:data.description,
                                    status:data.status
                                })
                            }

                            for(let details of modifyData){
                                await models.menus.create({
                                    storeId:details.storeId,
                                    parentMenuId:details.parentMenuId,
                                    moduleId:details.moduleId,
                                    moduleItemId:details.moduleItemId,
                                    title:details.title,
                                    slug:details.slug,
                                    sequence:details.sequence,
                                    pageName:details.pageName,
                                    label:details.label,
                                    link:details.link,
                                    target:details.target,
                                    menuType:details.menuType,
                                    description:details.description,
                                    status:details.status
                                })
                            }
                        }
                        const datas2 = await models.menus.findAll({where:{storeId:fromStore, parentMenuId:{$gte: 1}}})
                        if(datas2.length>0){
                            const modifyData2 = []
                            for(let data of datas2){
                                let parentMenuId = null
                                let moduleId = null
                                let moduleItemId = null
                                const slug = await models.menus.findOne({attributes:['slug'],where:{id:data.parentMenuId}})
                                if(slug != '' && slug != null){
                                    const slug2 = await models.menus.findOne({attributes:['id'],where:{slug:slug.slug, storeId: toStore}, order:[['id','ASC']]})

                                    if(slug2 != '' && slug2 != null){
                                        parentMenuId = slug2.id
                                    }
                                }
                                const moduleDetails = await models.module.findOne({attributes:['slug'],where:{id:data.moduleId}})
                                const moduleItemDetails = await models.moduleItem.findOne({attributes:['slug'],where:{id:data.moduleItemId}})
                                if(moduleDetails != '' && moduleDetails != null){
                                    const moduleDetails2 = await models.module.findOne({attributes:['id'],where:{slug:moduleDetails.slug, storeId: toStore}, order:[['id','ASC']]})

                                    if(moduleDetails2 != '' && moduleDetails2 != null){
                                        moduleId = moduleDetails2.id
                                    }
                                }
                                if(moduleItemDetails != '' && moduleItemDetails != null){
                                    const moduleItemDetails2 = await models.moduleItem.findOne({attributes:['id'],where:{slug:moduleItemDetails.slug, storeId: toStore}, order:[['id','ASC']]})

                                    if(moduleItemDetails2 != '' && moduleItemDetails2 != null){
                                        moduleItemId = moduleItemDetails2.id
                                    }
                                }
                                modifyData2.push({
                                    storeId:toStore,
                                    parentMenuId:parentMenuId,
                                    moduleId:moduleId,
                                    moduleItemId:moduleItemId,
                                    title:data.title,
                                    slug:data.slug,
                                    sequence:data.sequence,
                                    pageName:data.pageName,
                                    label:data.label,
                                    link:data.link,
                                    target:data.target,
                                    menuType:data.menuType,
                                    description:data.description,
                                    status:data.status
                                })
                            }

                            for(let details of modifyData2){
                                await models.menus.create({
                                    storeId:details.storeId,
                                    parentMenuId:details.parentMenuId,
                                    moduleId:details.moduleId,
                                    moduleItemId:details.moduleItemId,
                                    title:details.title,
                                    slug:details.slug,
                                    sequence:details.sequence,
                                    pageName:details.pageName,
                                    label:details.label,
                                    link:details.link,
                                    target:details.target,
                                    menuType:details.menuType,
                                    description:details.description,
                                    status:details.status
                                })
                            }
                        }
                    }

                    if(module=='blogAuthor'){
                        const datas = await models.blogauthor.findAll({where:{storeId:fromStore}})
                        if(datas.length>0){
                            const modifyData = datas.map(data =>{
                                return Object.assign({},{
                                    storeId:toStore,
                                    firstName:data.firstName,
                                    lastName:data.lastName,
                                    email:data.email,
                                    facebook:data.facebook,
                                    twitter:data.twitter,
                                    linkedin:data.linkedin,
                                    github:data.github
                                })
                            })
                            for(let details of modifyData){
                                await models.blogauthor.create({
                                    storeId:details.storeId,
                                    firstName:details.firstName,
                                    lastName:details.lastName,
                                    email:details.email,
                                    facebook:details.facebook,
                                    twitter:details.twitter,
                                    linkedin:details.linkedin,
                                    github:details.github
                                })
                            }
                        }
                    }

                    if(module=='blogCategory'){
                        const datas = await models.blogcategory.findAll({where:{storeId:fromStore}})
                        if(datas.length>0){
                            const modifyData = datas.map(data =>{
                                return Object.assign({},{
                                    storeId:toStore,
                                    categoryName:data.categoryName,
                                })
                            })
                            for(let details of modifyData){
                                await models.blogcategory.create({
                                    storeId:details.storeId,
                                    categoryName:details.categoryName
                                })
                            }
                        }
                    }

                    if(module=='blog'){
                        const datas = await models.blogs.findAll({where:{storeId:fromStore}})
                        if(datas.length>0){
                            const modifyData = []
                            for(let data of datas){
                                let authorId = null
                                const authorDetails = await models.blogauthor.findOne({attributes:['firstName','lastName'],where:{id:data.authorId}})
                                if(authorDetails != '' && authorDetails != null){
                                    const authorDetails2 = await models.blogauthor.findOne({attributes:['id'],where:{firstName:authorDetails.firstName, lastName:authorDetails.lastName, storeId: toStore}, order:[['id','ASC']]})
                                    if(authorDetails2 != '' && authorDetails2 != null){
                                        authorId = authorDetails2.id
                                    }
                                }
                                modifyData.push({
                                    storeId:toStore,
                                    authorId:authorId,
                                    blogTitle:data.blogTitle,
                                    slug:data.slug,
                                    summary:data.summary,
                                    tags:data.tags,
                                    blogDescription:data.blogDescription,
                                    metaTitle:data.metaTitle,
                                    metaDescription:data.metaDescription,
                                    metaKeywords:data.metaKeywords
                                })
                            }

                            for(let details of modifyData){
                                await models.blogs.create({
                                    storeId:details.storeId,
                                    authorId:details.authorId,
                                    blogTitle:details.blogTitle,
                                    slug:details.slug,
                                    summary:details.summary,
                                    tags:details.tags,
                                    blogDescription:details.blogDescription,
                                    metaTitle:details.metaTitle,
                                    metaDescription:details.metaDescription,
                                    metaKeywords:details.metaKeywords
                                })
                            }
                        }
                        const datas2 = await models.blogselectedcategory.findAll({where:{storeId:fromStore}})
                        if(datas2.length>0){
                            const modifyData2 = []
                            for(let data of datas2){
                                let categoryId = null
                                let blogId = null
                                const categoryDetails = await models.blogcategory.findOne({attributes:['categoryName'],where:{id:data.categoryId}})
                                const blogDetails = await models.blogs.findOne({attributes:['slug'],where:{id:data.blogId}})
                                if(categoryDetails != '' && categoryDetails != null){
                                    const categoryDetails2 = await models.blogcategory.findOne({attributes:['id'],where:{categoryName:categoryDetails.categoryName, storeId: toStore}, order:[['id','ASC']]})
                                    if(categoryDetails2 != '' && categoryDetails2 != null){
                                        categoryId = categoryDetails2.id
                                    }
                                }
                                if(blogDetails != '' && blogDetails != null){
                                    const blogDetails2 = await models.blogs.findOne({attributes:['id'],where:{slug:blogDetails.slug, storeId: toStore}, order:[['id','ASC']]})
                                    if(blogDetails2 != '' && blogDetails2 != null){
                                        blogId = blogDetails2.id
                                    }
                                }
                                modifyData2.push({
                                    storeId:toStore,
                                    categoryId:categoryId,
                                    blogId:blogId
                                })
                            }

                            for(let details of modifyData2){
                                await models.blogselectedcategory.create({
                                    storeId:details.storeId,
                                    categoryId:details.categoryId,
                                    blogId:details.blogId
                                })
                            }
                        }
                    }

                    if(module=='brand'){
                        const datas = await models.brands.findAll({where:{storeId:fromStore}})
                        if(datas.length>0){
                            const modifyData = datas.map(data =>{
                                return Object.assign({},{
                                    storeId:toStore,
                                    title:data.title,
                                    slug:data.title.toString().toLowerCase().replace(/\s+/g, '-')+toStore+"-" +Math.floor(1000 + Math.random() * 9000),
                                    shortDescriptions:data.shortDescriptions,
                                    descriptions:data.descriptions,
                                    address:data.address,
                                    phone:data.phone,
                                    email:data.email,
                                    isoName:data.isoName,
                                    rating:data.rating,
                                    status:data.status
                                })
                            })
                            for(let details of modifyData){
                                await models.brands.create({
                                    storeId:details.storeId,
                                    title:details.title,
                                    slug:details.slug,
                                    shortDescriptions:details.shortDescriptions,
                                    descriptions:details.descriptions,
                                    address:details.address,
                                    phone:details.phone,
                                    email:details.email,
                                    isoName:details.isoName,
                                    rating:details.rating,
                                    status:details.status
                                })
                            }
                        }
                    }

                    if(module=='productCategory'){
                        const datas = await models.categories.findAll({where:{storeId:fromStore, parentCategoryId:0}})
                        if(datas.length>0){
                            const modifyData = []
                            for(let data of datas){
                                modifyData.push({
                                    storeId:toStore,
                                    parentCategoryId:0,
                                    position:data.position,
                                    title:data.title,
                                    slug:data.title.toString().toLowerCase().replace(/\s+/g, '-')+toStore+"-" +Math.floor(1000 + Math.random() * 9000),
                                    anchor:data.anchor,
                                    url:data.url,
                                    description:data.description,
                                    includeInHome:data.includeInHome,
                                    includeInMenu:data.includeInMenu,
                                    includeInFooter:data.includeInFooter,
                                    metaTitle:data.metaTitle,
                                    metaKey:data.metaKey,
                                    metaDescription:data.metaDescription,
                                    status:data.status
                                })
                            }

                            for(let details of modifyData){
                                await models.categories.create({
                                    storeId:details.storeId,
                                    parentCategoryId:details.parentCategoryId,
                                    position:details.position,
                                    title:details.title,
                                    slug:details.slug,
                                    anchor:details.anchor,
                                    url:details.url,
                                    description:details.description,
                                    includeInHome:details.includeInHome,
                                    includeInMenu:details.includeInMenu,
                                    includeInFooter:details.includeInFooter,
                                    metaTitle:details.metaTitle,
                                    metaKey:details.metaKey,
                                    metaDescription:details.metaDescription,
                                    status:details.status
                                })
                            }
                        }
                        const datas2 = await models.categories.findAll({where:{storeId:fromStore, parentCategoryId:{$gte: 1}}})
                        if(datas2.length>0){
                            const modifyData2 = []
                            for(let data of datas2){
                                let parentCategoryId = 0
                                const title = await models.categories.findOne({attributes:['title'],where:{id:data.parentCategoryId}})
                                if(title != '' && title != null){
                                    const title2 = await models.categories.findOne({attributes:['id'],where:{title:title.title, storeId: toStore}, order:[['id','ASC']]})

                                    if(title2 != '' && title2 != null){
                                        parentCategoryId = title2.id
                                    }
                                }
                                
                                modifyData2.push({
                                    storeId:toStore,
                                    parentCategoryId:parentCategoryId,
                                    position:data.position,
                                    title:data.title,
                                    slug:data.title.toString().toLowerCase().replace(/\s+/g, '-')+toStore+"-" +Math.floor(1000 + Math.random() * 9000),
                                    anchor:data.anchor,
                                    url:data.url,
                                    description:data.description,
                                    includeInHome:data.includeInHome,
                                    includeInMenu:data.includeInMenu,
                                    includeInFooter:data.includeInFooter,
                                    metaTitle:data.metaTitle,
                                    metaKey:data.metaKey,
                                    metaDescription:data.metaDescription,
                                    status:data.status
                                })
                            }

                            for(let details of modifyData2){
                                await models.categories.create({
                                    storeId:details.storeId,
                                    parentCategoryId:details.parentCategoryId,
                                    position:details.position,
                                    title:details.title,
                                    slug:details.slug,
                                    anchor:details.anchor,
                                    url:details.url,
                                    description:details.description,
                                    includeInHome:details.includeInHome,
                                    includeInMenu:details.includeInMenu,
                                    includeInFooter:details.includeInFooter,
                                    metaTitle:details.metaTitle,
                                    metaKey:details.metaKey,
                                    metaDescription:details.metaDescription,
                                    status:details.status
                                })
                            }
                        }
                    }

                    if(module=='products'){
                        const datas = await models.products.findAll({where:{storeId:fromStore}})
                        if(datas.length>0){
                            const modifyData = []
                            for(let data of datas){
                                let brandId = null
                                const brandDetails = await models.brands.findOne({attributes:['title'],where:{id:data.brand}})
                                if(brandDetails != '' && brandDetails != null){
                                    const brandDetails2 = await models.brands.findOne({attributes:['id'],where:{title:brandDetails.title, storeId: toStore}, order:[['id','ASC']]})
                                    if(brandDetails2 != '' && brandDetails2 != null){
                                        brandId = brandDetails2.id
                                    }
                                }

                                modifyData.push({
                                    storeId:toStore,
                                    sku:data.sku,
                                    title:data.title,
                                    slug:data.slug,
                                    url:data.url,
                                    shortDescription:data.shortDescription,
                                    description:data.description,
                                    searchKeywords:data.searchKeywords,
                                    price:data.price,
                                    specialPrice:data.specialPrice,
                                    specialPriceFrom:data.specialPriceFrom,
                                    specialPriceTo:data.specialPriceTo,
                                    bestSellers:data.bestSellers,
                                    newArrivals:data.newArrivals,
                                    taxClassId:data.taxClassId,
                                    weight:data.weight,
                                    isConfigurable:data.isConfigurable,
                                    metaTitle:data.metaTitle,
                                    metaKey:data.metaKey,
                                    metaDescription:data.metaDescription,
                                    optionTitle:data.optionTitle,
                                    optionType:data.optionType,
                                    optionValue:data.optionValue,
                                    color:data.color,
                                    size:data.size,
                                    brand:brandId,
                                    application:data.application,
                                    type:data.type,
                                    fromDate:data.fromDate,
                                    fromTime:data.fromTime,
                                    toDate:data.toDate,
                                    toTime:data.toTime,
                                    visibility:data.visibility,
                                    status:data.status,
                                    inventory:data.inventory,
                                    attr1:data.attr1,
                                    attr2:data.attr2,
                                    attr3:data.attr3,
                                    attr4:data.attr4,
                                    attr5:data.attr5,
                                    attr6:data.attr6,
                                    attr7:data.attr7,
                                    attr8:data.attr8,
                                    attr9:data.attr9,
                                    attr10:data.attr10
                                })
                            }

                            for(let details of modifyData){
                                await models.products.create({
                                    storeId:details.storeId,
                                    sku:details.sku,
                                    title:details.title,
                                    slug:details.slug,
                                    url:details.url,
                                    shortDescription:details.shortDescription,
                                    description:details.description,
                                    searchKeywords:details.searchKeywords,
                                    price:details.price,
                                    specialPrice:details.specialPrice,
                                    specialPriceFrom:details.specialPriceFrom,
                                    specialPriceTo:details.specialPriceTo,
                                    bestSellers:details.bestSellers,
                                    newArrivals:details.newArrivals,
                                    taxClassId:details.taxClassId,
                                    weight:details.weight,
                                    isConfigurable:details.isConfigurable,
                                    metaTitle:details.metaTitle,
                                    metaKey:details.metaKey,
                                    metaDescription:details.metaDescription,
                                    optionTitle:details.optionTitle,
                                    optionType:details.optionType,
                                    optionValue:details.optionValue,
                                    color:details.color,
                                    size:details.size,
                                    brand:details.brand,
                                    application:details.application,
                                    type:details.type,
                                    fromDate:details.fromDate,
                                    fromTime:details.fromTime,
                                    toDate:details.toDate,
                                    toTime:details.toTime,
                                    visibility:details.visibility,
                                    status:details.status,
                                    inventory:details.inventory,
                                    attr1:details.attr1,
                                    attr2:details.attr2,
                                    attr3:details.attr3,
                                    attr4:details.attr4,
                                    attr5:details.attr5,
                                    attr6:details.attr6,
                                    attr7:details.attr7,
                                    attr8:details.attr8,
                                    attr9:details.attr9,
                                    attr10:details.attr10
                                })
                            }
                        }

                        const datas2 = await models.productCategory.findAll({where:{storeId:fromStore}})
                        if(datas2.length>0){
                            const modifyData2 = []
                            for(let data of datas2){
                                let categoryId = null
                                let productId = null
                                const categoryDetails = await models.categories.findOne({attributes:['title'],where:{id:data.categoryId}})
                                const productDetails = await models.products.findOne({attributes:['slug'],where:{id:data.productId}})
                                if(categoryDetails != '' && categoryDetails != null){
                                    const categoryDetails2 = await models.categories.findOne({attributes:['id'],where:{title:categoryDetails.title, storeId: toStore}, order:[['id','ASC']]})
                                    if(categoryDetails2 != '' && categoryDetails2 != null){
                                        categoryId = categoryDetails2.id
                                    }
                                }
                                if(productDetails != '' && productDetails != null){
                                    const productDetails2 = await models.products.findOne({attributes:['id'],where:{slug:productDetails.slug, storeId: toStore}, order:[['id','ASC']]})
                                    if(productDetails2 != '' && productDetails2 != null){
                                        productId = productDetails2.id
                                    }
                                }
                                modifyData2.push({
                                    storeId:toStore,
                                    categoryId:categoryId,
                                    productId:productId,
                                    position:data.position
                                })
                            }

                            for(let details of modifyData2){
                                await models.productCategory.create({
                                    storeId:details.storeId,
                                    categoryId:details.categoryId,
                                    productId:details.productId,
                                    position:details.position
                                })
                            }
                        }

                        const datas3 = await models.optionMaster.findAll({where:{storeId:fromStore}})
                        if(datas3.length>0){
                            const modifyData3 = datas3.map(data =>{
                                return Object.assign({},{
                                    storeId:toStore,
                                    title:data.title,
                                    type:data.type,
                                    isRequired:data.isRequired,
                                    sorting:data.sorting
                                })
                            })
                            for(let details of modifyData3){
                                await models.optionMaster.create({
                                    storeId:details.storeId,
                                    title:details.title,
                                    type:details.type,
                                    isRequired:details.isRequired,
                                    sorting:details.sorting
                                })
                            }
                        }

                        const datas4 = await models.optionProduct.findAll({where:{storeId:fromStore}})
                        if(datas4.length>0){
                            const modifyData4 = []
                            for(let data of datas4){
                                let optionId = null
                                let productId = null
                                const optionMasterDetails = await models.optionMaster.findOne({attributes:['title'],where:{id:data.optionId}})
                                const productDetails = await models.products.findOne({attributes:['slug'],where:{id:data.productId}})

                                if(optionMasterDetails != '' && optionMasterDetails != null){
                                    const optionMasterDetails2 = await models.optionMaster.findOne({attributes:['id'],where:{title:optionMasterDetails.title, storeId: toStore}, order:[['id','ASC']]})

                                    if(optionMasterDetails2 != '' && optionMasterDetails2 != null){
                                        optionId = optionMasterDetails2.id
                                    }
                                }

                                if(productDetails != '' && productDetails != null){
                                    const productDetails2 = await models.products.findOne({attributes:['id'],where:{slug:productDetails.slug, storeId: toStore}, order:[['id','ASC']]})

                                    if(productDetails2 != '' && productDetails2 != null){
                                        productId = productDetails2.id
                                    }
                                }

                                modifyData4.push({
                                    storeId:toStore,
                                    optionId:optionId,
                                    productId:productId
                                })
                            }

                            for(let details of modifyData4){
                                await models.optionProduct.create({
                                    storeId:details.storeId,
                                    optionId:details.optionId,
                                    productId:details.productId
                                })
                            }
                        }

                        const datas5 = await models.relatedProduct.findAll({where:{storeId:fromStore}})
                        if(datas5.length>0){
                            const modifyData5 = []
                            for(let data of datas5){
                                let productId = null
                                let selectedProductId = null
                                const productDetails = await models.products.findOne({attributes:['slug'],where:{id:data.productId}})
                                const selectedProductDetails = await models.products.findOne({attributes:['slug'],where:{id:data.selectedProductId}})

                                if(productDetails != '' && productDetails != null){
                                    const productDetails2 = await models.products.findOne({attributes:['id'],where:{slug:productDetails.slug, storeId: toStore}, order:[['id','ASC']]})

                                    if(productDetails2 != '' && productDetails2 != null){
                                        productId = productDetails2.id
                                    }
                                }

                                if(selectedProductDetails != '' && selectedProductDetails != null){
                                    const selectedProductDetails2 = await models.products.findOne({attributes:['id'],where:{slug:selectedProductDetails.slug, storeId: toStore}, order:[['id','ASC']]})

                                    if(selectedProductDetails2 != '' && selectedProductDetails2 != null){
                                        selectedProductId = selectedProductDetails2.id
                                    }
                                }

                                modifyData5.push({
                                    storeId:toStore,
                                    productId:productId,
                                    selectedProductId:selectedProductId,
                                    type:data.type
                                })
                            }

                            for(let details of modifyData5){
                                await models.relatedProduct.create({
                                    storeId:details.storeId,
                                    productId:details.productId,
                                    selectedProductId:details.selectedProductId,
                                    type:details.type
                                })
                            }
                        }
                    }
                }
                req.flash("info", "Successfully Migrate")
                return res.redirect('back')
            }else{
                req.flash("errors", "Your are not authorized to access this module")
                return res.redirect('back')
            }            
        }	
    })
}