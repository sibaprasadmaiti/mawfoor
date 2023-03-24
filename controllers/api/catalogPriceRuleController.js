const models = require('../../models')

/**
* Description:  Rule List
* Developer:  Partha Mandal
**/
exports.ruleList = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
    
	if(storeId && storeId != '' && storeId != null) {
        const rules = await models.catalogPriceRule.findAll({attributes:['id','title','description','offerType','discountType','discountValue','offerFrom','offerTo','customerType','sequence','status'],where:{storeId:storeId}, include:[{attributes:['id','attributeName','attributeValue'],model:models.catalogPriceRuleAttributes}], order:[['sequence','ASC']]})

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
	const {updateId,storeId,sequence,title,description,offerType,discountType,discountValue,offerFrom,offerTo,customerType,status} =req.body.data
    const attributes = req.body.data.attributes

	if(storeId && storeId != '' && storeId != null) {
        if (!updateId) {
            await models.catalogPriceRule.create({
                storeId: storeId,
                sequence: sequence,
                title: title,
                description: description,
                offerType: offerType,
                discountType: discountType,
                discountValue: discountValue,
                offerFrom: offerFrom,
                offerTo: offerTo,
                customerType: customerType,
                status: status
            }).then(async(value)=>{

                const ruleId = value.id

                if(attributes.length > 0){
                    for(let attr of attributes){
                        await models.catalogPriceRuleAttributes.create({
                            storeId: storeId,
                            catalogPriceRuleId: ruleId,
                            attributeName: attr.attributeName,
                            attributeValue: attr.attributeValue
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
            await models.catalogPriceRule.update({
                storeId: storeId,
                sequence: sequence,
                title: title,
                description: description,
                offerType: offerType,
                discountType: discountType,
                discountValue: discountValue,
                offerFrom: offerFrom,
                offerTo: offerTo,
                customerType: customerType,
                status: status
            }, {where:{id:updateId}}).then(async()=>{

                const ruleId = updateId

                if(attributes.length > 0){
                    await models.catalogPriceRuleAttributes.destroy({where:{catalogPriceRuleId:ruleId}})
                    for(let attr of attributes){
                        await models.catalogPriceRuleAttributes.create({
                            storeId: storeId,
                            catalogPriceRuleId: ruleId,
                            attributeName: attr.attributeName,
                            attributeValue: attr.attributeValue
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
        const rules = await models.catalogPriceRule.findOne({attributes:['id','title','description','offerType','discountType','discountValue','offerFrom','offerTo','customerType','sequence','status'],where:{storeId:storeId,id:id}, include:[{model:models.catalogPriceRuleAttributes, attributes:['id','attributeName','attributeValue']}]})

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
        const count = await models.catalogPriceRuleAttributes.count({where:{id:id, storeId:storeId}})
        if(count > 0){
            await models.catalogPriceRuleAttributes.destroy({where:{id:id, storeId:storeId}}).then(()=>{
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

exports.catalogPriceRuleSearch = async (req, res) => {
    const storeId = req.body.data.storeId || "";
    const searchString = req.body.data.searchString || "";
    console.log(storeId)
    if (storeId == '') {
      res.status(400).send({data:{success:false, details:"StoreId is required"},errorNode:{errorCode:1, errorMsg:"StoreId is required"}}) 
    } else {
        if (searchString == '') {
            res.status(400).send({data:{success:false, details:"Search string is required"},errorNode:{errorCode:1, errorMsg:"Search string is required"}})
        } else {
            var searchCatalogPriceRuleList = await models.catalogPriceRule.findAll({ attributes: ['id', ['title', 'name']], where: { storeId: storeId, status: 'Yes', title: { $like: '%' + searchString + '%' } } });
            // var searchCatalogPriceRuleList = await sequelize.query("SELECT id, title as name  FROM `catalogPriceRule` WHERE  storeId = "+storeId+"  and `title` LIKE '%"+searchString+"%' and status = 'Yes'",{ type: Sequelize.QueryTypes.SELECT });
        
            if(searchCatalogPriceRuleList.length >0){
                
                res.status(200).send({data:{success:true, searchList:searchCatalogPriceRuleList},errorNode:{errorCode:0, errorMsg:"No Error"}})
            } else {
                res.status(200).send({data:{success:true, searchList:[]},errorNode:{errorCode:0, errorMsg:"No data found"}})
            }
        }
    }
}