const models = require('../../models')
const fs = require('file-system')
/**
* Description:  Blog Author List
* Developer:  Partha Mandal
**/
exports.blogAuthorList = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	if(storeId && storeId != '' && storeId != null) {
		const author = await models.blogauthor.findAll({attributes:['id','firstName','lastName','profilePic','email','facebook','twitter','linkedin','github','status','createdAt'],where: { storeId:storeId}})

        const list = author.map(auth => {
			return Object.assign({},{
                id : auth.id,
                firstName : auth.firstName,
                lastName : auth.lastName,
                email : auth.email,
                facebook : auth.facebook,
                twitter : auth.twitter,
                linkedin : auth.linkedin,
                github : auth.github,
                status : auth.status,
                createdAt : auth.createdAt,
                profilePic: (auth.profilePic!='' && auth.profilePic!=null) ? req.app.locals.baseurl+'admin/iUdyog/blog/'+storeId+'/'+auth.profilePic : req.app.locals.baseurl+'admin/admins/user.png',
            })
		})

        if(list.length > 0){
            return res.status(200).send({ data:{success:true, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Blog Author View
* Developer:  Partha Mandal
**/
exports.blogAuthorView = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const id =req.body.data.id || '';
	if(storeId && storeId != '' && storeId != null && id != '') {
		const author = await models.blogauthor.findOne({where: { storeId:storeId, id:id}})
        if(author != null || author != ''){
            return res.status(200).send({ data:{success:true, details:author}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:{}}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId and id is required"}, errorNode:{errorCode:1, errorMsg:"storeId and id is required"}})
	}
}

/**
* Description:  Blog Author Create/Update
* Developer:  Partha Mandal
**/
exports.blogAuthorCreate = async (req, res) =>{
	const {updateId, storeId, firstName, lastName, profilePic, profilePicExt, email, facebook, twitter, linkedin, github} =req.body.data

	if(storeId && storeId != '' && storeId != null) {
        if (!updateId) {
            await models.blogauthor.create({
                storeId: storeId,
                firstName: firstName,
                lastName: lastName,
                email: email,
                facebook: facebook,
                twitter: twitter,
                linkedin: linkedin,
                github: github
            }).then(async(val)=>{

                const dir = './public/admin/iUdyog/blog/'+storeId;
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);                  
                }
    
                if(profilePic && profilePic != '' && profilePicExt && profilePicExt !='') {
                    const imageTitle = Date.now();
                    const path = './public/admin/iUdyog/blog/'+storeId+'/'+imageTitle+'.'+profilePicExt;
                    const image =imageTitle+'.'+profilePicExt;   
                    try {
                        const imgdata = profilePic;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                        fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                        models.blogauthor.update({
                            profilePic : image,
                        },{ where: { id: val.id } })        
                    } catch (e) {
                        next(e);
                    }
                }

                return res.status(201).send({ data:{success:true, message:"Successfully created"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:err}})
            })
        } else {
            await models.blogauthor.update({
                storeId: storeId,
                firstName: firstName,
                lastName: lastName,
                email: email,
                facebook: facebook,
                twitter: twitter,
                linkedin: linkedin,
                github: github
            }, {where:{id:updateId}}).then(async(val)=>{

                if(profilePic && profilePic != '' && profilePicExt && profilePicExt !='') {
                    const profile = await models.blogauthor.findOne({ attributes: ["profilePic"], where: { id: updateId } });
                    if(profile.profilePic && profile.profilePic != '' && profile.profilePic != null) {
        
                      if(fs.existsSync(__dirname + '/../../public/admin/iUdyog/blog/'+storeId+'/'+profile.profilePic)){
                        fs.unlink(__dirname +  '/../../public/admin/iUdyog/blog/'+storeId+'/'+profile.profilePic, (err) => {
                        if (err) throw err;
                        console.log('successfully deleted');
                        });
                      }
                    }
                    const imageTitle = Date.now();
                    const path = './public/admin/iUdyog/blog/'+storeId+'/'+imageTitle+'.'+profilePicExt;
                    const image =imageTitle+'.'+profilePicExt;   
                    try {
                        const imgdata = image;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                        fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                        models.blogauthor.update({
                            profilePic : image,
                        },{ where: { id: updateId } })        
                    } catch (e) {
                        next(e);
                    }
                }

                return res.status(201).send({ data:{success:true, message:"Successfully updated"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:err}})
            })
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Blog Author Delete
* Developer:  Partha Mandal
**/
exports.blogAuthorDelete = async (req, res) =>{
	const storeId =req.body.data.storeId
	const id =req.body.data.id
	if(storeId && storeId != '' && storeId != null && id && id != '' && id != null) {
        const value = await models.blogauthor.count({where:{id:id}})
        if (value > 0) {
            await models.blogauthor.destroy({where: {id:id, storeId:storeId}}).then(async ()=>{
                return res.status(200).send({ data:{success:true, message:"Successfully deleted"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:err}})
            })
        } else {
            return res.status(200).send({ data:{success:false, message:"Id not match"}, errorNode:{errorCode:1, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"Id is required"}, errorNode:{errorCode:1, errorMsg:"Id is required"}})
	}
}

/**
* Description:  Blog Author Name List
* Developer:  Partha Mandal
**/
exports.blogAuthorNameList = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	if(storeId && storeId != '' && storeId != null) {
		const author = await models.blogauthor.findAll({attributes:['id','firstName','lastName'],where: { storeId:storeId, status:'Yes'}})

        if(author.length > 0){
            return res.status(200).send({ data:{success:true, details:author}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Blog Category List
* Developer:  Partha Mandal
**/
exports.blogCategoryList = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	if(storeId && storeId != '' && storeId != null) {
		const list = await models.blogcategory.findAll({attributes:['id','categoryName','status','createdAt'],where: { storeId:storeId}})

        if(list.length > 0){
            return res.status(200).send({ data:{success:true, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Blog Category View
* Developer:  Partha Mandal
**/
exports.blogCategoryView = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const id =req.body.data.id || '';
	if(storeId && storeId != '' && storeId != null && id != '') {
		const category = await models.blogcategory.findOne({where: { storeId:storeId, id:id}})
        if(category != null || category != ''){
            return res.status(200).send({ data:{success:true, details:category}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:{}}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId and id is required"}, errorNode:{errorCode:1, errorMsg:"storeId and id is required"}})
	}
}

/**
* Description:  Blog Category Create/Update
* Developer:  Partha Mandal
**/
exports.blogCategoryCreate = async (req, res) =>{
	const {updateId, storeId, categoryName} =req.body.data

	if(storeId && storeId != '' && storeId != null) {
        if (!updateId) {
            await models.blogcategory.create({
                storeId: storeId,
                categoryName: categoryName
            }).then(async(val)=>{
                return res.status(201).send({ data:{success:true, message:"Successfully created"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:err}})
            })
        } else {
            await models.blogcategory.update({
                storeId: storeId,
                categoryName: categoryName
            }, {where:{id:updateId}}).then(async(val)=>{
                return res.status(201).send({ data:{success:true, message:"Successfully updated"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:err}})
            })
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Blog Category Delete
* Developer:  Partha Mandal
**/
exports.blogCategoryDelete = async (req, res) =>{
	const storeId =req.body.data.storeId
	const id =req.body.data.id
	if(storeId && storeId != '' && storeId != null && id && id != '' && id != null) {
        const value = await models.blogcategory.count({where:{id:id}})
        if (value > 0) {
            await models.blogcategory.destroy({where: {id:id, storeId:storeId}}).then(async ()=>{
                return res.status(200).send({ data:{success:true, message:"Successfully deleted"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:err}})
            })
        } else {
            return res.status(200).send({ data:{success:false, message:"Id not match"}, errorNode:{errorCode:1, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"Id is required"}, errorNode:{errorCode:1, errorMsg:"Id is required"}})
	}
}

/**
* Description:  Blog Category Name List
* Developer:  Partha Mandal
**/
exports.blogCategoryNameList = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	if(storeId && storeId != '' && storeId != null) {
		const category = await models.blogcategory.findAll({attributes:['id','categoryName'],where: { storeId:storeId, status:'Yes'}})

        if(category.length > 0){
            return res.status(200).send({ data:{success:true, details:category}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Blog  List
* Developer:  Partha Mandal
**/
exports.blogList = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	if(storeId && storeId != '' && storeId != null) {
		const blogs = await models.blogs.findAll({attributes:['id','authorId','blogTitle','tags','slug','summary','blogImage','blogDescription','metaTitle','metaDescription','metaKeywords','status','createdAt'],where: { storeId:storeId}})

        let list = []
        if(blogs.length>0){
            for(let blog of blogs){
                const authorDetails = await models.blogauthor.findOne({where:{id:blog.authorId}})
                const categories = await models.blogselectedcategory.findAll({attributes:['categoryId'],where:{blogId:blog.id}})
                let categoryDetails = []
                for(let cat of categories){
                    const categoryName = await models.blogcategory.findOne({attributes:['id','categoryName'],where:{id:cat.categoryId}})
    
                    categoryDetails.push({id:categoryName.id, category:categoryName.categoryName})
                }

    
                let details = {}
                details.id = blog.id
                details.blogTitle = blog.blogTitle
                details.blogImage = (blog.blogImage!='' && blog.blogImage!=null) ? req.app.locals.baseurl+'admin/iUdyog/blog/'+storeId+'/'+blog.blogImage : null
                details.slug = blog.slug
                details.tags = blog.tags
                details.summary = blog.summary
                details.blogDescription = blog.blogDescription
                details.status = blog.status
                details.createdAt = blog.createdAt
                details.authorName = authorDetails.firstName + ' ' + authorDetails.lastName
                details.authorProfilePic = (authorDetails.profilePic!='' && authorDetails.profilePic!=null) ? req.app.locals.baseurl+'admin/iUdyog/blog/'+storeId+'/'+authorDetails.profilePic : req.app.locals.baseurl+'admin/admins/user.png'
                details.category = categoryDetails
    
                list.push(details)
            }
        }

        if(list.length > 0){
            return res.status(200).send({ data:{success:true, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Blog  Details
* Developer:  Partha Mandal
**/
exports.blogDetails = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const id =req.body.data.id || '';
	if(storeId && storeId != '' && storeId != null) {
		const blog = await models.blogs.findOne({attributes:['id','authorId','blogTitle','slug','summary','tags','blogImage','blogDescription','metaTitle','metaDescription','metaKeywords','status','createdAt'],where: {id:id, storeId:storeId}})

        if(blog != null && blog != ''){
            const authorDetails = await models.blogauthor.findOne({where:{id:blog.authorId}})
            const categories = await models.blogselectedcategory.findAll({attributes:['categoryId'],where:{blogId:blog.id}})
            const comments = await models.blogcomments.findAll({where:{blogId:blog.id, status:'Active'}})
            let categoryDetails = []
            for(let cat of categories){
                const categoryName = await models.blogcategory.findOne({attributes:['id','categoryName'],where:{id:cat.categoryId}})

                categoryDetails.push({id:categoryName.id, category:categoryName.categoryName})
            }

            const blogComments = comments.map(comment => {
                return Object.assign({},{
                    id : comment.id,
                    commentDescription : comment.commentDescription,
                    createrName : comment.createrName,
                    createrEmail : comment.createrEmail,
                    createdAt : comment.createdAt
                })
            })


            let details = {}
            details.id = blog.id
            details.blogTitle = blog.blogTitle
            details.blogImage = (blog.blogImage!='' && blog.blogImage!=null) ? req.app.locals.baseurl+'admin/iUdyog/blog/'+storeId+'/'+blog.blogImage : null
            details.slug = blog.slug
            details.summary = blog.summary
            details.tags = blog.tags
            details.blogDescription = blog.blogDescription
            details.metaTitle = blog.metaTitle
            details.metaDescription = blog.metaDescription
            details.metaKeywords = blog.metaKeywords
            details.status = blog.status
            details.createdAt = blog.createdAt
            details.authorName = authorDetails.firstName + ' ' + authorDetails.lastName
            details.authorProfilePic = (authorDetails.profilePic!='' && authorDetails.profilePic!=null) ? req.app.locals.baseurl+'admin/iUdyog/blog/'+storeId+'/'+authorDetails.profilePic : req.app.locals.baseurl+'admin/admins/user.png'
            details.authorEmail = authorDetails.email
            details.authorFacebook = authorDetails.facebook
            details.authorTwitter = authorDetails.twitter
            details.authorLinkedin = authorDetails.linkedin
            details.authorGithub = authorDetails.github
            details.category = categoryDetails
            details.comments = blogComments

            return res.status(200).send({ data:{success:true, details:details}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }else{
            return res.status(200).send({ data:{success:true, details:{}}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId and id is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}
/**
* Description:  Blog  View
* Developer:  Partha Mandal
**/
exports.blogView = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const id =req.body.data.id || '';
	if(storeId && storeId != '' && storeId != null && id != '') {
		const blog = await models.blogs.findOne({where: { storeId:storeId, id:id}})
        if(blog != null || blog != ''){
            return res.status(200).send({ data:{success:true, details:blog}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:{}}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId and id is required"}, errorNode:{errorCode:1, errorMsg:"storeId and id is required"}})
	}
}

/**
* Description:  Blog  Create/Update
* Developer:  Partha Mandal
**/
exports.blogCreate = async (req, res) =>{
	const {updateId, storeId, authorId, blogTitle, summary,tags, blogImage,blogImageExt, blogDescription, metaTitle, metaDescription, metaKeywords, category} =req.body.data

	if(storeId && storeId != '' && storeId != null) {
        if (!updateId) {
            await models.blogs.create({
                storeId: storeId,
                authorId: authorId,
                blogTitle: blogTitle,
                summary: summary,
                tags:tags,
                blogDescription: blogDescription,
                metaTitle: metaTitle,
                metaDescription: metaDescription,
                metaKeywords: metaKeywords
            }).then(async(val)=>{

                if(category.length > 0){
                    category.forEach(async(catId) => {
                        await models.blogselectedcategory.create({
                            categoryId:catId,
                            storeId:storeId,
                            blogId:val.id
                        })
                    })
                }

                const dir = './public/admin/iUdyog/blog/'+storeId;
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);                  
                }
    
                if(blogImage && blogImage != '' && blogImageExt && blogImageExt !='') {
                    const imageTitle = Date.now();
                    const path = './public/admin/iUdyog/blog/'+storeId+'/'+imageTitle+'.'+blogImageExt;
                    const image =imageTitle+'.'+blogImageExt;   
                    try {
                        const imgdata = blogImage;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                        fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                        models.blogs.update({
                            blogImage : image,
                        },{ where: { id: val.id } })        
                    } catch (e) {
                        next(e);
                    }
                }

                return res.status(201).send({ data:{success:true, message:"Successfully created"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:err}})
            })
        } else {
            await models.blogs.update({
                storeId: storeId,
                authorId: authorId,
                blogTitle: blogTitle,
                summary: summary,
                tags:tags,
                blogDescription: blogDescription,
                metaTitle: metaTitle,
                metaDescription: metaDescription,
                metaKeywords: metaKeywords
            }, {where:{id:updateId}}).then(async(val)=>{

                if(category.length > 0){
                    await models.blogselectedcategory.destroy({where:{blogId:updateId}})
                    category.forEach(async(catId) => {
                        await models.blogselectedcategory.create({
                            categoryId:catId,
                            storeId:storeId,
                            blogId:updateId
                        })
                    })
                }
                
                if(blogImage && blogImage != '' && blogImageExt && blogImageExt !='') {
                    const blogImg = await models.blogs.findOne({ attributes: ["blogImage"], where: { id: updateId } });
                    if(blogImg.blogImage && blogImg.blogImage != '' && blogImg.blogImage != null) {
        
                      if(fs.existsSync(__dirname + '/../../public/admin/iUdyog/blog/'+storeId+'/'+blogImg.blogImage)){
                        fs.unlink(__dirname +  '/../../public/admin/iUdyog/blog/'+storeId+'/'+blogImg.blogImage, (err) => {
                        if (err) throw err;
                        console.log('successfully deleted');
                        });
                      }
                    }
                    const imageTitle = Date.now();
                    const path = './public/admin/iUdyog/blog/'+storeId+'/'+imageTitle+'.'+blogImageExt;
                    const image =imageTitle+'.'+blogImageExt;   
                    try {
                        const imgdata = image;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                        fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                        models.blogs.update({
                            blogImage : image,
                        },{ where: { id: updateId } })        
                    } catch (e) {
                        next(e);
                    }
                }

                return res.status(201).send({ data:{success:true, message:"Successfully updated"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:err}})
            })
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Blog  Delete
* Developer:  Partha Mandal
**/
exports.blogDelete = async (req, res) =>{
	const storeId =req.body.data.storeId
	const id =req.body.data.id
	if(storeId && storeId != '' && storeId != null && id && id != '' && id != null) {
        const value = await models.blogs.count({where:{id:id}})
        if (value > 0) {
            await models.blogs.destroy({where: {id:id, storeId:storeId}}).then(async ()=>{
                return res.status(200).send({ data:{success:true, message:"Successfully deleted"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:err}})
            })
        } else {
            return res.status(200).send({ data:{success:false, message:"Id not match"}, errorNode:{errorCode:1, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"Id is required"}, errorNode:{errorCode:1, errorMsg:"Id is required"}})
	}
}

/**
* Description:  Blog Comment List
* Developer:  Partha Mandal
**/
exports.blogCommentList = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const blogId =req.body.data.blogId || '';
	if(storeId && storeId != '' && storeId != null) {
		const comments = await models.blogcomments.findAll({where: { storeId:storeId, blogId:blogId}})
		const title = await models.blogs.findOne({attributes:['blogTitle'], where: { storeId:storeId, id:blogId}})

        const list = comments.map(comment => {
			return Object.assign({},{
                id : comment.id,
                blogTitle : title.blogTitle,
                commentDescription : comment.commentDescription,
                createrName : comment.createrName,
                createrEmail : comment.createrEmail,
                createdAt : comment.createdAt,
                status: comment.status
            })
		})

        if(list.length > 0){
            return res.status(200).send({ data:{success:true, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Blog Comment View
* Developer:  Partha Mandal
**/
exports.blogCommentView = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const id =req.body.data.id || '';
	if(storeId && storeId != '' && storeId != null && id != '') {
		const comments = await models.blogcomments.findOne({where: { storeId:storeId, id:id}})
        if(comments != null || comments != ''){
            return res.status(200).send({ data:{success:true, details:comments}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:{}}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId and id is required"}, errorNode:{errorCode:1, errorMsg:"storeId and id is required"}})
	}
}

/**
* Description:  Blog Comment Create/Update
* Developer:  Partha Mandal
**/
exports.blogCommentCreate = async (req, res) =>{
	const {updateId, storeId, blogId, commentDescription, createrName, createrEmail} =req.body.data

	if(storeId && storeId != '' && storeId != null && blogId && blogId != '' && blogId != null) {
        if (!updateId) {
            await models.blogcomments.create({
                storeId: storeId,
                blogId: blogId,
                commentDescription: commentDescription,
                createrName: createrName,
                createrEmail: createrEmail
            }).then(async(val)=>{
                return res.status(201).send({ data:{success:true, message:"Comment successfully added"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:err}})
            })
        } else {
            await models.blogcomments.update({
                storeId: storeId,
                blogId: blogId,
                commentDescription: commentDescription,
                createrName: createrName,
                createrEmail: createrEmail
            }, {where:{id:updateId}}).then(async(val)=>{

                return res.status(201).send({ data:{success:true, message:"Comment successfully updated"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:err}})
            })
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId and blogId is required"}, errorNode:{errorCode:1, errorMsg:"storeId and blogId is required"}})
	}
}

/**
* Description:  Blog Comment Delete
* Developer:  Partha Mandal
**/
exports.blogCommentDelete = async (req, res) =>{
	const storeId =req.body.data.storeId
	const id =req.body.data.id
	if(storeId && storeId != '' && storeId != null && id && id != '' && id != null) {
        const value = await models.blogcomments.count({where:{id:id}})
        if (value > 0) {
            await models.blogcomments.destroy({where: {id:id, storeId:storeId}}).then(async ()=>{
                return res.status(200).send({ data:{success:true, message:"Successfully deleted"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:err}})
            })
        } else {
            return res.status(200).send({ data:{success:false, message:"Id not match"}, errorNode:{errorCode:1, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"Id is required"}, errorNode:{errorCode:1, errorMsg:"Id is required"}})
	}
}


exports.newsList = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	if(storeId && storeId != '' && storeId != null) {
		const news = await models.news.findAll({attributes:['id','title','shortDescription','description','slug','sequence','image','status','createdAt'],where: { storeId:storeId}})

        let list = []
        if(news.length>0){
            for(let ns of news){

    
                let details = {}
                details.id = ns.id
                details.title = ns.title
                details.image = (ns.image!='' && ns.image!=null) ? req.app.locals.baseurl+'admin/news/'+storeId+'/'+ns.id+'/'+ns.image : req.app.locals.baseurl+'admin/admins/user.png'
                details.slug = ns.slug
                details.shortDescription = ns.shortDescription
                details.description = ns.description
                details.sequence = ns.sequence
                details.status = ns.status
                details.createdAt = ns.createdAt
    
                list.push(details)
            }
        }

        if(list.length > 0){
            return res.status(200).send({ data:{success:true, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Blog  Details
* Developer:  Partha Mandal
**/
exports.newsDetails = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const id =req.body.data.id || '';
	if(storeId && storeId != '' && storeId != null) {
        if(id && id != '' && id != null) {
            const blog = await models.news.findOne({attributes:['id','title','shortDescription','description','slug','sequence','image','status','createdAt'],where: {id:id, storeId:storeId}})

            if(blog != null && blog != ''){
                
                let details = {}
                    details.id = blog.id
                    details.title = blog.title
                    details.image = (blog.image!='' && blog.image!=null) ? req.app.locals.baseurl+'admin/news/'+storeId+'/'+blog.id+'/'+blog.image : req.app.locals.baseurl+'admin/admins/user.png'
                    details.slug = blog.slug
                    details.shortDescription = blog.shortDescription
                    details.description = blog.description
                    details.sequence = blog.sequence
                    details.status = blog.status
                    details.createdAt = blog.createdAt

                return res.status(200).send({ data:{success:true, details:details}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }else{
                return res.status(200).send({ data:{success:true, details:{}}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
            }
        } else {
            return res.status(400).send({ data:{success:false, message:"Id is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId and id is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}