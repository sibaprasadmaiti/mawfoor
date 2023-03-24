var models = require('../../models');
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
* Description: Faq List
* @param req
* @param res user details with jwt token
* Developer: Surajit Gouri
**/
exports.faqList = async function(req, res) {
    var storeId = req.body.data.storeId;
	models.faq.findAll({ 
		attributes:['id','storeId','faqGroupId','question','answer'],
        where:{
            storeId:storeId
        }
	}).then(function (faqList) {
		const list = faqList.map(faqsList => {
			return Object.assign(
				{},
				{
					id : faqsList.id,
                    storeId: storeId,
                    faqGroupId : faqsList.faqGroupId,
					question : faqsList.question,
					answer : faqsList.answer,
				}
			)
		});
		if(list.length > 0){
			return res.status(200).send({ data:{success:true, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		} else {
			return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
		}
	}).catch(function(error) {
		return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
	});
};