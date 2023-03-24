const models = require('../../models')

/**
* Description:  Rule List
* Developer:  Partha Mandal
**/
exports.ruleList = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
    
	if(storeId && storeId != '' && storeId != null) {
        const rules = await models.cartPriceRule.findAll({attributes:['id','title','description','discountType','minDiscountValue','maxDiscountValue','discountValue','offerFrom','offerTo','customerType','couponType','couponCode','usesPerCoupon','usesPerCustomer','sequence','status','purchaseLimit'],where:{storeId:storeId}, include:[{attributes:['id','attributeName','attributeValue','condition'],model:models.cartPriceRuleAttributes}], order:[['sequence','ASC']]})

        if(rules.length > 0){
            return res.status(200).send({ data:{success:true, details:rules}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Rule Create/Update
* Developer:  Partha Mandal
**/
exports.ruleCreate = async (req, res) =>{
	const {updateId,storeId,sequence,title,description,discountType,maxDiscountValue,minDiscountValue,discountValue,offerFrom,offerTo,customerType,couponType,couponCode,usesPerCoupon,usesPerCustomer,status,purchaseLimit} =req.body.data
    const attributes = req.body.data.attributes

	if(storeId && storeId != '' && storeId != null) {
        if (!updateId) {
            await models.cartPriceRule.create({
                storeId: storeId,
                sequence: sequence,
                title: title,
                description: description,
                discountType: discountType,
                discountValue: discountValue,
                minDiscountValue:minDiscountValue,
                maxDiscountValue:maxDiscountValue,
                offerFrom: offerFrom,
                purchaseLimit: (purchaseLimit) ? purchaseLimit : null,
                offerTo: offerTo,
                customerType: customerType,
                couponType: couponType,
                couponCode: couponCode,
                usesPerCoupon: usesPerCoupon,
                usesPerCustomer: usesPerCustomer,
                status: status
            }).then(async(value)=>{

                const ruleId = value.id

                if(attributes.length > 0){
                    for(let attr of attributes){
                        await models.cartPriceRuleAttributes.create({
                            storeId: storeId,
                            cartPriceRuleId: ruleId,
                            attributeName: attr.attributeName,
                            attributeValue: attr.attributeValue,
                            condition: attr.condition
                        }).then(()=>{console.log("ok")})
                        .catch(err=>{console.log(err)})
                    }
                }

                return res.status(201).send({ data:{success:true, message:"Successfully created"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
            })
        } else {
            await models.cartPriceRule.update({
                storeId: storeId,
                sequence: sequence,
                title: title,
                description: description,
                discountType: discountType,
                discountValue: discountValue,
                minDiscountValue:minDiscountValue,
                maxDiscountValue:maxDiscountValue,
                offerFrom: offerFrom,
                offerTo: offerTo,
                purchaseLimit: (purchaseLimit) ? purchaseLimit : null,
                customerType: customerType,
                couponType: couponType,
                couponCode: couponCode,
                usesPerCoupon: usesPerCoupon,
                usesPerCustomer: usesPerCustomer,
                status: status
            }, {where:{id:updateId}}).then(async()=>{

                const ruleId = updateId

                if(attributes.length > 0){
                    await models.cartPriceRuleAttributes.destroy({where:{cartPriceRuleId:ruleId}})
                    for(let attr of attributes){
                        await models.cartPriceRuleAttributes.create({
                            storeId: storeId,
                            cartPriceRuleId: ruleId,
                            attributeName: attr.attributeName,
                            attributeValue: attr.attributeValue,
                            condition: attr.condition
                        }).then(()=>{console.log("ok")})
                        .catch(err=>{console.log(err)})
                    }
                }

                return res.status(201).send({ data:{success:true, message:"Successfully updated"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
            })
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId is required"}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
} 

/**
* Description:  Rule Details
* Developer:  Partha Mandal
**/
exports.ruleDetails = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const id =req.body.data.id || '';
    
	if(storeId && storeId != '' && storeId != null && id && id != '' && id != null) {
        const rules = await models.cartPriceRule.findOne({attributes:['id','title','description','discountType','minDiscountValue','maxDiscountValue','discountValue','offerFrom','offerTo','customerType','couponType','couponCode','usesPerCoupon','usesPerCustomer','sequence','status','purchaseLimit'],where:{storeId:storeId,id:id}, include:[{model:models.cartPriceRuleAttributes, attributes:['id','attributeName','attributeValue','condition']}]})

        if(rules != '' && rules != null){
            return res.status(200).send({ data:{success:true, details:rules}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:{}}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId and id is required"}, errorNode:{errorCode:1, errorMsg:"storeId and id is required"}})
	}
}

/**
* Description:  Rule Condition Delete
* Developer:  Partha Mandal
**/
exports.ruleConditionDelete = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const id =req.body.data.id || '';
    
	if(storeId && storeId != '' && storeId != null && id && id != '' && id != null) {
        const count = await models.cartPriceRuleAttributes.count({where:{id:id, storeId:storeId}})
        if(count > 0){
            await models.cartPriceRuleAttributes.destroy({where:{id:id, storeId:storeId}}).then(()=>{
                return res.status(200).send({ data:{success:true, message:"Successfully Deleted"}, errorNode:{errorCode:0, errorMsg:"no error"}})
            }).catch(err=>{
                return res.status(500).send({ data:{success:false, message:"Something went wrong"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
            })
        }else{
            return res.status(400).send({ data:{success:false, message:"id not found"}, errorNode:{errorCode:1, errorMsg:"id not found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, message:"storeId and id is required"}, errorNode:{errorCode:1, errorMsg:"storeId and id is required"}})
	}
}

exports.cartPriceRuleSearch = async (req, res) => {
    const storeId = req.body.data.storeId || "";
    const searchString = req.body.data.searchString || "";
    console.log(storeId)
    if (storeId == '') {
      res.status(400).send({data:{success:false, details:"StoreId is required"},errorNode:{errorCode:1, errorMsg:"StoreId is required"}}) 
    } else {
        if (searchString == '') {
            res.status(400).send({data:{success:false, details:"Search string is required"},errorNode:{errorCode:1, errorMsg:"Search string is required"}})
        } else {
            var searchCartPriceRuleList = await models.cartPriceRule.findAll({ attributes: ['id', ['title', 'name']], where: { storeId: storeId, status: 'Yes', title: { $like: '%' + searchString + '%' } } });
            // var searchCartPriceRuleList = await sequelize.query("SELECT id, title as name  FROM `cartPriceRule` WHERE  storeId = "+storeId+"  and `title` LIKE '%"+searchString+"%' and status = 'Yes'",{ type: Sequelize.QueryTypes.SELECT });
        
            if(searchCartPriceRuleList.length >0){
                
                res.status(200).send({data:{success:true, searchList:searchCartPriceRuleList},errorNode:{errorCode:0, errorMsg:"No Error"}})
            } else {
                res.status(200).send({data:{success:true, searchList:[]},errorNode:{errorCode:0, errorMsg:"No data found"}})
            }
        }
    }
}