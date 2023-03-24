const models = require("../../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op

/**
 * This function is developed for home page details
 * Developer: Partha Mandal
*/
exports.zbrdstHomeDetails = async function (req, res) {
    const storeId = req.body.data.storeId;
    const slug = req.body.data.slug;
    if(!storeId && storeId==null){
        return res.status(400).send({ data:{success:false, details:"StoreId is required"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
    }else{

        const banners = await models.banner.findAll({attributes:['id','title','image','coverImage','type','shortDescription'],where:{storeId:storeId, status: 'Yes'}})

        const bannerList = banners.map((banner) => {
            return Object.assign({
                id: banner.id,
                title: banner.title,
                description: banner.shortDescription,
                type: banner.type,
                image: banner.image != "" && banner.image != null ? req.app.locals.baseurl + "admin/banner/image/" + banner.id + "/" + banner.image : req.app.locals.baseurl+'admin/category/no_image.jpg',
                coverImage: banner.coverImage != "" && banner.coverImage != null ? req.app.locals.baseurl + "admin/banner/coverImage/" + banner.id + "/" + banner.coverImage : req.app.locals.baseurl+'admin/category/no_image.jpg'
            })
        })

        let restaurantDiners
        if(slug && slug != ''){
            restaurantDiners = await models.section.findAll({attributes:['id','title','content'],where:{storeId:storeId, status: 'Yes', slug: slug}})
        }

        const offerList = await models.section.findAll({attributes:['id','title','content'],where:{storeId:storeId, status: 'Yes', slug: 'offer'}})

        const welcomeList = await models.section.findAll({attributes:['id','title','content'],where:{storeId:storeId, status: 'Yes', slug: 'welcome-zabardast'}})

        //const socialLinks = await models.siteSettings.findAll({attributes:['id','title','facebook','twitter','linkedin','instagram','address','mobileNo','tagline'],where:{storeId:storeId, status: 'Yes', title: { [Op.like]: `%Social Details%` }}}) 
          
        const socialLinks = await models.siteSettings.findAll({where:{storeId:storeId, status: 'Yes', title: { [Op.like]: `%Social Details%` }}})     

        if (bannerList.length > 0 || socialLinks.length > 0 || restaurantDiners.length > 0 || offerList.length > 0 || welcomeList.length > 0) {
            return res.status(200).send({ value:{success:true, bannerList, socialLinks, restaurantDiners , welcomeList, offerList}, errorNode:{errorCode:0, errorMsg:"No Error"}});
        } else {
            return res.status(200).send({ value:{success:false, details:[]}, errorNode:{errorCode:0, errorMsg:"No data found"}});
        }
    }
}