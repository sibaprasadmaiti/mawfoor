const models = require('../../models');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
var flash = require('connect-flash');
var config = require("../../config/config.json");
var Sequelize = require("sequelize");
const Op = Sequelize.Op
var sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password, 
    {
        host: "localhost",
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        }
    }
);


/**
* Description:  page List
* @param req
* @param res user details with jwt token
* Developer:Partha Mandal
**/
exports.pageList = async (req, res, next) =>{
	const storeId =req.body.data.storeId;
	if(storeId && storeId != '' && storeId != null) {
			
		await models.pages.findAll({where: { storeId:storeId, status:'Yes'}})
        .then((value)=> {
			const list = value.map(pages => {
				return Object.assign(
					{},
					{
						id : pages.id,
						title : pages.title,
						urlKey : pages.urlKey,
						heading : pages.heading,
						shortDescription : pages.shortDescription,
						content : pages.content,
						image : (pages.image!='' && pages.image!=null) ? req.app.locals.baseurl+'admin/pages/image/'+pages.id+'/'+pages.image : '',
					}
				)
			});
			if(list.length > 0){
				return res.status(200).send({ data:{success:true, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			} else {
				return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			}
		}).catch((error) => {
			return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
		});
	} else {
		return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
	}
};


exports.sectionList = async function (req,res){
	var storeId = req.body.data.storeId;
	if(storeId && storeId!=''){
		var value = await models.section.findAll({attributes: ["id", "title", "slug"],where:{storeId:storeId, status:'Yes'}});
	  if(value.length > 0){
		return res.status(200).send({ data:{success:true, details:value}, errorNode:{errorCode:0, errorMsg:"No Error"}});
	  }else{
		return res.status(200).send({ data:{success:true, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
	  } 
	}else{
	  return res.status(200).send({ data:{success:false, details:"Store id is required"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
	}
}

exports.sectionDetails = async function (req, res) {
console.log("request data => ",req.body.data);
	const storeId =req.body.data.storeId;
	const slug =req.body.data.slug;
	if(storeId >=0) {
		if(slug && slug != '' && slug != null) {

			var sectionList = await models.section.findAll({
				attributes: ["id", "title", "content", "shortDescription"],
				where:{storeId:storeId,slug:slug, status:'Yes'}
			});
			if (sectionList.length > 0) {
				return res.status(200).send({ data:{success:true, details:sectionList[0]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			} else {
				return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			}
		} else {
			return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"storeId is required"}});
		}
	} else {
		return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"Slug is required"}});
	}
};
  