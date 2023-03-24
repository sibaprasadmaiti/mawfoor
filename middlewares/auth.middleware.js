const models = require('../models');
const jwt = require('jsonwebtoken');
const SECRET = 'nodescratch';

/**
* Description: Authentication check for API users
* Developer: Partha Mandal
**/

module.exports = async (req, res, next) => {
	const customerId = req.body.data.customerId;
	const platform = req.body.data.platform;
	if(customerId || customerId != '' || customerId != undefined){
		if(platform == 'web'){
			const customerDetails = await models.customers.findOne({attributes: ['id','webToken'], where: {id : customerId, platform: 'web'}})
			const token = customerDetails.webToken
			if (!token)
				return res.status(401).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Access Denied"}})
			try {
				jwt.verify(token, SECRET)
				next()
			} catch ({ name }) {
				return res.status(400).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Invalid Token"}})
			}
		}else if(platform == 'app'){
			const customerDetails = await models.customers.findOne({attributes: ['id','appToken'], where: {id : customerId, platform: 'app'}})
			const token = customerDetails.appToken
			if (!token)
				return res.status(401).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Access Denied"}})
			try {
				jwt.verify(token, SECRET)
				next()
			} catch ({ name }) {
				return res.status(400).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Invalid Token"}})
			}
		}else{
			return res.status(400).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Please pass the platform name"}});
		}
	}else{
		return res.status(400).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Customer not found"}});
	}
}
