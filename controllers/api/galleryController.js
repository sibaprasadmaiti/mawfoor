const { fs } = require('file-system');
const models = require('../../models');
/**
* Description:  galleries List
* Developer:Partha Mandal
**/

exports.galleryList = async function(req, res, next) {
	const storeId =req.body.data.storeId;
	if(storeId && storeId != '' && storeId != null) {
		let data = await models.categories.findAll({attributes:['id','title'], where:{status: 'Yes', storeId: storeId}})
		if(!(data.length > 0))
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"StoreId is required"}})

		for (let p = 0; p < data.length; p++) {
			let imagesList = await models.galleries.findAll({attributes:['id','image','sequence'], where: { storeId:storeId, status:'Yes',catId: data[p].id }, order: [['sequence', 'ASC']] })
			let galleryList = [];
			for(let image of imagesList){
				galleryList.push({
					id : image.id,
					image : (image.image!='' && image.image!=null) ? req.app.locals.baseurl+'admin/gallery/image/'+image.id+'/'+image.image : req.app.locals.baseurl+'admin/category/no_image.jpg',
				})
			}
			data[p].dataValues.galleries=galleryList;
		}
		
		data.unshift({"id":"","title": "All"});

		let galleries = [];
		for (let p = 1; p < data.length; p++) {
			let gallery = data[p].dataValues.galleries;
			for (let j = 0; j < gallery.length; j++) {
				galleries.push(gallery[j]);
			}
		}
		data[0]['galleries']=galleries;
	
		return res.status(200).json({ data:{success:true, details:data}, errorNode:{errorCode:0, errorMsg:"No Error"}})
	} else {
		return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No data found"}})
	}
}

// exports.allGalleryList = async function(req, res, next) {
// 	const storeId =req.body.data.storeId;
// 	if(storeId && storeId != '' && storeId != null) {
		
// 		await models.galleries.findAll({attributes:['id','image','sequence'], where: { storeId:storeId, status:'Yes'}, order: [['sequence', 'ASC']]})
// 		.then((datas)=>{
// 			let imagelist=datas.map(data=>{
// 				return Object.assign({
// 					id:data.id,
// 					image : (data.image!='' && data.image!=null) ? req.app.locals.baseurl+'admin/gallery/image/'+data.id+'/'+data.image : req.app.locals.baseurl+'admin/category/no_image.jpg',
// 				})
// 			})
// 		return res.status(200).json({ data:{success:true, details:imagelist}, errorNode:{errorCode:0, errorMsg:"No Error"}})
// 		})
// 	} else {
// 		return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No data found"}})
// 	}

		
// }

exports.allGalleryList = async function(req, res, next) {
	const storeId =req.body.data.storeId;
	if(storeId && storeId != '' && storeId != null) {
		var gallList = [];
		var galleriesList = await models.galleries.findAll({where: { storeId:storeId, status:'Yes' },attributes: ['id','image','sequence','catId'], order: [['sequence', 'ASC']]});

		if(galleriesList.length>0){
			for(var i=0;i<galleriesList.length;i++){
			  if(galleriesList[i].catId && galleriesList[i].catId != null && galleriesList[i].catId != ''){
				var brandsDetails = await models.brands.findAll({where: { storeId: storeId, status:"Yes", id: galleriesList[i].catId },attributes: ["id", "title", "slug"]});
				if(brandsDetails.length>0){
				  var bannerBrandName = brandsDetails[0].title;
				  var bannerBrandSlug = brandsDetails[0].slug;
				} else {
				  var bannerBrandName = '';
				  var bannerBrandSlug = '';
				}
			  } else {
				var bannerBrandName = '';
				var bannerBrandSlug = '';
			  }
	
			  gallList.push({
				"id":galleriesList[i].id,
				"brandName": bannerBrandName,
				"brandSlug": bannerBrandSlug,
				"images": (galleriesList[i].image!='' && galleriesList[i].image!=null) ? req.app.locals.baseurl+'admin/gallery/image/'+galleriesList[i].id+'/'+galleriesList[i].image : req.app.locals.baseurl+'admin/category/no_image.jpg',
			  });
			}
		}

		return res.status(200).json({ data:{success:true, details:gallList}, errorNode:{errorCode:0, errorMsg:"No Error"}})		
		
	} else {
		return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No data found"}})
	}

		
}
