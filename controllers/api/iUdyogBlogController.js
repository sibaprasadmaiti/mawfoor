const models = require('../../models')
// const fs = require('fs')
const fs = require('file-system')
/**
* Description:  Blog Author List
* Developer:  Partha Mandal
**/
exports.blogAuthorList = async (req, res) =>{
	const cId =req.body.data.cId || '';
	if(cId && cId != '' && cId != null) {
		const author = await models.iUdyogBlogAuthor.findAll({attributes:['id','firstName','lastName','profilePic','email','facebook','twitter','linkedin','github','status','createdAt'],where: { cId:cId}})

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
                profilePic: (auth.profilePic!='' && auth.profilePic!=null) ? req.app.locals.baseurl+'admin/iUdyog/blog/'+cId+'/'+auth.profilePic : req.app.locals.baseurl+'admin/admins/user.png',
            })
		})

        if(list.length > 0){
            return res.status(200).send({ data:{success:true, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"cId is required"}, errorNode:{errorCode:1, errorMsg:"cId is required"}})
	}
}

/**
* Description:  Blog Author View
* Developer:  Partha Mandal
**/
exports.blogAuthorView = async (req, res) =>{
	const cId =req.body.data.cId || '';
	const id =req.body.data.id || '';
	if(cId && cId != '' && cId != null && id != '') {
		const author = await models.iUdyogBlogAuthor.findOne({where: { cId:cId, id:id}})
        if(author != null || author != ''){
            return res.status(200).send({ data:{success:true, details:author}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:{}}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"cId and id is required"}, errorNode:{errorCode:1, errorMsg:"cId and id is required"}})
	}
}

/**
* Description:  Blog Author Create/Update
* Developer:  Partha Mandal
**/
exports.blogAuthorCreate = async (req, res) =>{
	const {updateId, cId, firstName, lastName, profilePic, profilePicExt, email, facebook, twitter, linkedin, github} =req.body.data

	if(cId && cId != '' && cId != null) {
        if (!updateId) {
            await models.iUdyogBlogAuthor.create({
                cId: cId,
                firstName: firstName,
                lastName: lastName,
                email: email,
                facebook: facebook,
                twitter: twitter,
                linkedin: linkedin,
                github: github
            }).then(async(val)=>{

                const dir = './public/admin/iUdyog/blog/'+cId;
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);                  
                }
    
                if(profilePic && profilePic != '' && profilePicExt && profilePicExt !='') {
                    const imageTitle = Date.now();
                    const path = './public/admin/iUdyog/blog/'+cId+'/'+imageTitle+'.'+profilePicExt;
                    const image =imageTitle+'.'+profilePicExt;   
                    try {
                        const imgdata = profilePic;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                        fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                        models.iUdyogBlogAuthor.update({
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
            await models.iUdyogBlogAuthor.update({
                cId: cId,
                firstName: firstName,
                lastName: lastName,
                email: email,
                facebook: facebook,
                twitter: twitter,
                linkedin: linkedin,
                github: github
            }, {where:{id:updateId}}).then(async(val)=>{

                if(profilePic && profilePic != '' && profilePicExt && profilePicExt !='') {
                    const profile = await models.iUdyogBlogAuthor.findOne({ attributes: ["profilePic"], where: { id: updateId } });
                    if(profile.profilePic && profile.profilePic != '' && profile.profilePic != null) {
        
                      if(fs.existsSync(__dirname + '/../../public/admin/iUdyog/blog/'+cId+'/'+profile.profilePic)){
                        fs.unlink(__dirname +  '/../../public/admin/iUdyog/blog/'+cId+'/'+profile.profilePic, (err) => {
                        if (err) throw err;
                        console.log('successfully deleted');
                        });
                      }
                    }
                    const imageTitle = Date.now();
                    const path = './public/admin/iUdyog/blog/'+cId+'/'+imageTitle+'.'+profilePicExt;
                    const image =imageTitle+'.'+profilePicExt;   
                    try {
                        const imgdata = image;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                        fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                        models.iUdyogBlogAuthor.update({
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
		return res.status(400).send({ data:{success:false, message:"cId is required"}, errorNode:{errorCode:1, errorMsg:"cId is required"}})
	}
}

/**
* Description:  Blog Author Delete
* Developer:  Partha Mandal
**/
exports.blogAuthorDelete = async (req, res) =>{
	const cId =req.body.data.cId
	const id =req.body.data.id
	if(cId && cId != '' && cId != null && id && id != '' && id != null) {
        const value = await models.iUdyogBlogAuthor.count({where:{id:id}})
        if (value > 0) {
            await models.iUdyogBlogAuthor.destroy({where: {id:id, cId:cId}}).then(async ()=>{
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
	const cId =req.body.data.cId || '';
	if(cId && cId != '' && cId != null) {
		const author = await models.iUdyogBlogAuthor.findAll({attributes:['id','firstName','lastName'],where: { cId:cId, status:'Active'}})

        if(author.length > 0){
            return res.status(200).send({ data:{success:true, details:author}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"cId is required"}, errorNode:{errorCode:1, errorMsg:"cId is required"}})
	}
}

/**
* Description:  Blog Category List
* Developer:  Partha Mandal
**/
exports.blogCategoryList = async (req, res) =>{
	const cId =req.body.data.cId || '';
	if(cId && cId != '' && cId != null) {
		const list = await models.iUdyogBlogCategory.findAll({attributes:['id','categoryName','status','createdAt'],where: { cId:cId}})

        if(list.length > 0){
            return res.status(200).send({ data:{success:true, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"cId is required"}, errorNode:{errorCode:1, errorMsg:"cId is required"}})
	}
}

/**
* Description:  Blog Category View
* Developer:  Partha Mandal
**/
exports.blogCategoryView = async (req, res) =>{
	const cId =req.body.data.cId || '';
	const id =req.body.data.id || '';
	if(cId && cId != '' && cId != null && id != '') {
		const category = await models.iUdyogBlogCategory.findOne({where: { cId:cId, id:id}})
        if(category != null || category != ''){
            return res.status(200).send({ data:{success:true, details:category}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:{}}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"cId and id is required"}, errorNode:{errorCode:1, errorMsg:"cId and id is required"}})
	}
}

/**
* Description:  Blog Category Create/Update
* Developer:  Partha Mandal
**/
exports.blogCategoryCreate = async (req, res) =>{
	const {updateId, cId, categoryName} =req.body.data

	if(cId && cId != '' && cId != null) {
        if (!updateId) {
            await models.iUdyogBlogCategory.create({
                cId: cId,
                categoryName: categoryName
            }).then(async(val)=>{
                return res.status(201).send({ data:{success:true, message:"Successfully created"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:err}})
            })
        } else {
            await models.iUdyogBlogCategory.update({
                cId: cId,
                categoryName: categoryName
            }, {where:{id:updateId}}).then(async(val)=>{
                return res.status(201).send({ data:{success:true, message:"Successfully updated"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:err}})
            })
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"cId is required"}, errorNode:{errorCode:1, errorMsg:"cId is required"}})
	}
}

/**
* Description:  Blog Category Delete
* Developer:  Partha Mandal
**/
exports.blogCategoryDelete = async (req, res) =>{
	const cId =req.body.data.cId
	const id =req.body.data.id
	if(cId && cId != '' && cId != null && id && id != '' && id != null) {
        const value = await models.iUdyogBlogCategory.count({where:{id:id}})
        if (value > 0) {
            await models.iUdyogBlogCategory.destroy({where: {id:id, cId:cId}}).then(async ()=>{
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
	const cId =req.body.data.cId || '';
	if(cId && cId != '' && cId != null) {
		const category = await models.iUdyogBlogCategory.findAll({attributes:['id','categoryName'],where: { cId:cId, status:'Active'}})

        if(category.length > 0){
            return res.status(200).send({ data:{success:true, details:category}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"cId is required"}, errorNode:{errorCode:1, errorMsg:"cId is required"}})
	}
}

/**
* Description:  Blog  List
* Developer:  Partha Mandal
**/
exports.blogList = async (req, res) =>{
	const cId =req.body.data.cId || '';
	if(cId && cId != '' && cId != null) {
		const blogs = await models.iUdyogBlogs.findAll({attributes:['id','authorId','blogTitle','slug','summary','blogImage','blogDescription','metaTitle','metaDescription','metaKeywords','status','createdAt'],where: { cId:cId}})

        let list = []
        if(blogs.length>0){
            for(let blog of blogs){
                const authorDetails = await models.iUdyogBlogAuthor.findOne({where:{id:blog.authorId}})
                const categories = await models.iUdyogBlogSelectedCategory.findAll({attributes:['categoryId'],where:{blogId:blog.id}})
                const comments = await models.iUdyogBlogComments.findAll({where:{blogId:blog.id, status:'Active'}})
                let categoryDetails = []
                for(let cat of categories){
                    const categoryName = await models.iUdyogBlogCategory.findOne({attributes:['categoryName'],where:{id:cat.categoryId}})
    
                    categoryDetails.push({category:categoryName.categoryName})
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
                details.blogImage = (blog.blogImage!='' && blog.blogImage!=null) ? req.app.locals.baseurl+'admin/iUdyog/blog/'+cId+'/'+blog.blogImage : null
                details.slug = blog.slug
                details.summary = blog.summary
                details.blogDescription = blog.blogDescription
                details.metaTitle = blog.metaTitle
                details.metaDescription = blog.metaDescription
                details.metaKeywords = blog.metaKeywords
                details.status = blog.status
                details.createdAt = blog.createdAt
                details.authorName = authorDetails.firstName + ' ' + authorDetails.lastName
                details.authorProfilePic = (authorDetails.profilePic!='' && authorDetails.profilePic!=null) ? req.app.locals.baseurl+'admin/iUdyog/blog/'+cId+'/'+authorDetails.profilePic : req.app.locals.baseurl+'admin/admins/user.png'
                details.authorEmail = authorDetails.email
                details.authorFacebook = authorDetails.facebook
                details.authorTwitter = authorDetails.twitter
                details.authorLinkedin = authorDetails.linkedin
                details.authorGithub = authorDetails.github
                details.category = categoryDetails
                details.comments = blogComments
    
                list.push(details)
            }
        }

        if(list.length > 0){
            return res.status(200).send({ data:{success:true, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"cId is required"}, errorNode:{errorCode:1, errorMsg:"cId is required"}})
	}
}

/**
* Description:  Blog  View
* Developer:  Partha Mandal
**/
exports.blogView = async (req, res) =>{
	const cId =req.body.data.cId || '';
	const id =req.body.data.id || '';
	if(cId && cId != '' && cId != null && id != '') {
		const blog = await models.iUdyogBlogs.findOne({where: { cId:cId, id:id}})
        if(blog != null || blog != ''){
            return res.status(200).send({ data:{success:true, details:blog}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:{}}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"cId and id is required"}, errorNode:{errorCode:1, errorMsg:"cId and id is required"}})
	}
}

/**
* Description:  Blog  Create/Update
* Developer:  Partha Mandal
**/
exports.blogCreate = async (req, res) =>{
	const {updateId, cId, authorId, blogTitle, summary, blogImage,blogImageExt, blogDescription, metaTitle, metaDescription, metaKeywords, category} =req.body.data

	if(cId && cId != '' && cId != null) {
        if (!updateId) {
            await models.iUdyogBlogs.create({
                cId: cId,
                authorId: authorId,
                blogTitle: blogTitle,
                summary: summary,
                blogDescription: blogDescription,
                metaTitle: metaTitle,
                metaDescription: metaDescription,
                metaKeywords: metaKeywords
            }).then(async(val)=>{

                if(category.length > 0){
                    for(let cat of category){
                        await models.iUdyogBlogSelectedCategory.create({
                            categoryId:cat.categoryId,
                            cId:cId,
                            blogId:val.id
                        })
                    }
                }

                const dir = './public/admin/iUdyog/blog/'+cId;
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);                  
                }
    
                if(blogImage && blogImage != '' && blogImageExt && blogImageExt !='') {
                    const imageTitle = Date.now();
                    const path = './public/admin/iUdyog/blog/'+cId+'/'+imageTitle+'.'+blogImageExt;
                    const image =imageTitle+'.'+blogImageExt;   
                    try {
                        const imgdata = blogImage;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                        fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                        models.iUdyogBlogs.update({
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
            await models.iUdyogBlogs.update({
                cId: cId,
                authorId: authorId,
                blogTitle: blogTitle,
                summary: summary,
                blogDescription: blogDescription,
                metaTitle: metaTitle,
                metaDescription: metaDescription,
                metaKeywords: metaKeywords
            }, {where:{id:updateId}}).then(async(val)=>{

                if(category.length > 0){
                    await models.iUdyogBlogSelectedCategory.destroy({where:{blogId:updateId}})
                    for(let cat of category){
                        await models.iUdyogBlogSelectedCategory.create({
                            categoryId:cat.categoryId,
                            cId:cId,
                            blogId:updateId
                        })
                    }
                }
                
                if(blogImage && blogImage != '' && blogImageExt && blogImageExt !='') {
                    const blogImg = await models.iUdyogBlogs.findOne({ attributes: ["blogImage"], where: { id: updateId } });
                    if(blogImg.blogImage && blogImg.blogImage != '' && blogImg.blogImage != null) {
        
                      if(fs.existsSync(__dirname + '/../../public/admin/iUdyog/blog/'+cId+'/'+blogImg.blogImage)){
                        fs.unlink(__dirname +  '/../../public/admin/iUdyog/blog/'+cId+'/'+blogImg.blogImage, (err) => {
                        if (err) throw err;
                        console.log('successfully deleted');
                        });
                      }
                    }
                    const imageTitle = Date.now();
                    const path = './public/admin/iUdyog/blog/'+cId+'/'+imageTitle+'.'+blogImageExt;
                    const image =imageTitle+'.'+blogImageExt;   
                    try {
                        const imgdata = image;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                        fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                        models.iUdyogBlogs.update({
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
		return res.status(400).send({ data:{success:false, message:"cId is required"}, errorNode:{errorCode:1, errorMsg:"cId is required"}})
	}
}

/**
* Description:  Blog  Delete
* Developer:  Partha Mandal
**/
exports.blogDelete = async (req, res) =>{
	const cId =req.body.data.cId
	const id =req.body.data.id
	if(cId && cId != '' && cId != null && id && id != '' && id != null) {
        const value = await models.iUdyogBlogs.count({where:{id:id}})
        if (value > 0) {
            await models.iUdyogBlogs.destroy({where: {id:id, cId:cId}}).then(async ()=>{
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
	const cId =req.body.data.cId || '';
	const blogId =req.body.data.blogId || '';
	if(cId && cId != '' && cId != null) {
		const comments = await models.iUdyogBlogComments.findAll({where: { cId:cId, blogId:blogId}})
		const title = await models.iUdyogBlogs.findOne({attributes:['blogTitle'], where: { cId:cId, id:blogId}})

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
		return res.status(400).send({ data:{success:false, message:"cId is required"}, errorNode:{errorCode:1, errorMsg:"cId is required"}})
	}
}

/**
* Description:  Blog Comment View
* Developer:  Partha Mandal
**/
exports.blogCommentView = async (req, res) =>{
	const cId =req.body.data.cId || '';
	const id =req.body.data.id || '';
	if(cId && cId != '' && cId != null && id != '') {
		const comments = await models.iUdyogBlogComments.findOne({where: { cId:cId, id:id}})
        if(comments != null || comments != ''){
            return res.status(200).send({ data:{success:true, details:comments}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:{}}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"cId and id is required"}, errorNode:{errorCode:1, errorMsg:"cId and id is required"}})
	}
}

/**
* Description:  Blog Comment Create/Update
* Developer:  Partha Mandal
**/
exports.blogCommentCreate = async (req, res) =>{
	const {updateId, cId, blogId, commentDescription, createrName, createrEmail} =req.body.data

	if(cId && cId != '' && cId != null && blogId && blogId != '' && blogId != null) {
        if (!updateId) {
            await models.iUdyogBlogComments.create({
                cId: cId,
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
            await models.iUdyogBlogComments.update({
                cId: cId,
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
		return res.status(400).send({ data:{success:false, message:"cId and blogId is required"}, errorNode:{errorCode:1, errorMsg:"cId and blogId is required"}})
	}
}

/**
* Description:  Blog Comment Delete
* Developer:  Partha Mandal
**/
exports.blogCommentDelete = async (req, res) =>{
	const cId =req.body.data.cId
	const id =req.body.data.id
	if(cId && cId != '' && cId != null && id && id != '' && id != null) {
        const value = await models.iUdyogBlogComments.count({where:{id:id}})
        if (value > 0) {
            await models.iUdyogBlogComments.destroy({where: {id:id, cId:cId}}).then(async ()=>{
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