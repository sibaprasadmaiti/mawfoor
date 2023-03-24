const models = require('../../models')
/**
* Description:  Billing Feedback List
**/
exports.billingFeedbackList = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	if(storeId && storeId != '' && storeId != null) {
		const billingFeedbacks = await models.billingFeedback.findAll({attributes:['id','customerId','billingNo','amount','image','status','createdAt'], where: { storeId:storeId}, order:[['id','DESC']]})
        const feedbackList = []
        if(billingFeedbacks.length > 0){
            for(let feedback of billingFeedbacks){
                const customer = await models.customers.findOne({attributes:['id','firstName','lastName'], where:{id: feedback.customerId}});
                const firstName = customer.firstName != '' &&  customer.firstName != null ? customer.firstName : ""
                const lastName = customer.lastName != '' &&  customer.lastName != null ? customer.lastName : ""

                feedbackList.push({
                    id : feedback.id,
                    customerName : firstName + " " + lastName,
                    billingNo : feedback.billingNo,
                    amount : feedback.amount,
                    status : feedback.status,
                    createdAt : feedback.createdAt,
                    image : feedback.image != "" && feedback.image != null ? req.app.locals.baseurl + "admin/feedback/" + feedback.id  + "/" + feedback.image : req.app.locals.baseurl + "admin/category/no_image.jpg",
                })
            }
        }

        if(feedbackList.length > 0){
            return res.status(200).send({ data:{success:true, details:feedbackList}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

/**
* Description:  Billing Feedback Details
**/
exports.billingFeedbackView = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const id =req.body.data.id || '';
	if(storeId && storeId != '' && storeId != null && id && id != '' && id != null) {
        const billingFeedback = await models.billingFeedback.findOne({where: { storeId:storeId, id:id}})
        if(billingFeedback){
            const customer = await models.customers.findOne({attributes:['id','firstName','lastName'], where:{id: billingFeedback.customerId}});
            const firstName = customer.firstName != '' &&  customer.firstName != null ? customer.firstName : ""
            const lastName = customer.lastName != '' &&  customer.lastName != null ? customer.lastName : ""
            const details = {
                id : billingFeedback.id,
                customerName :  firstName + " " + lastName,
                billingNo : billingFeedback.billingNo,
                amount : billingFeedback.amount,
                foodQualityRating : billingFeedback.foodQualityRating,
                foodQualityRemarks : billingFeedback.foodQualityRemarks,
                serviceRating : billingFeedback.serviceRating,
                serviceRemarks : billingFeedback.serviceRemarks,
                ambienceRating : billingFeedback.ambienceRating,
                ambienceRemarks : billingFeedback.ambienceRemarks,
                overallRating : billingFeedback.overallRating,
                overallRemarks : billingFeedback.overallRemarks,
                createdAt : billingFeedback.createdAt,
                image : billingFeedback.image != "" && billingFeedback.image != null ? req.app.locals.baseurl + "admin/feedback/" + billingFeedback.id  + "/" + billingFeedback.image : req.app.locals.baseurl + "admin/category/no_image.jpg",
            }
            return res.status(200).send({ data:{success:true, details:details }, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }else{
            return res.status(200).send({ data:{success:true, details:{} }, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"storeId and id are required"}})
	}
}

/**
* Description:  Billing Feedback Review
**/
exports.billingFeedbackReview = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const id =req.body.data.id || '';
	if(storeId && storeId != '' && storeId != null && id && id != '' && id != null) {
    const details = await models.billingFeedback.findOne({where: {storeId:storeId, id:id}})
    if(details && details.customerId){
      await models.billingFeedback.update({status: 'Yes'},{where: { storeId:storeId, id:id}})

      const orderAmount = details.amount;
      const calculatedAmount = Math.round(10*(orderAmount/100));
      const currentBalance = await models.walletTransaction.findOne({where:{ storeId:storeId, customerId:details.customerId}, order:[['id','DESC']]})
      const totalBalance = Math.round(currentBalance.balance)+calculatedAmount

      await models.walletTransaction.create({
        storeId: storeId,
        customerId: details.customerId,
        balance: totalBalance,
        amount: calculatedAmount,
        transactionType	: 'credit',
        remarks: '10 % cash back added'
    })
    return res.status(200).send({ data:{success:true, details:"Balance added into wallet" }, errorNode:{errorCode:0, errorMsg:"No error"}})
    }else{
      return res.status(200).send({ data:{success:true, details:"" }, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
    }
	} else {
		return res.status(400).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"storeId and id are required"}})
	}
}

exports.feedbackList = async (req, res) =>{
	const storeId =req.body.data.storeId || '';

	if(storeId && storeId != '' && storeId != null) {
		const billingFeedbacks = await models.feedback.findAll({ where: { storeId:storeId}, order:[['id','DESC']]})

        const feedbackList = []
        if(billingFeedbacks.length > 0){
            for(let feedback of billingFeedbacks){
                const customer = await models.customers.findOne({attributes:['id','firstName','lastName'], where:{id: feedback.customerId}});
                const firstName = customer.firstName != '' &&  customer.firstName != null ? customer.firstName : ""
                const lastName = customer.lastName != '' &&  customer.lastName != null ? customer.lastName : ""

                const order = await models.orders.findOne({attributes:['orderNo'], where:{id: feedback.orderId}});
                const orderNo = order.orderNo != '' &&  order.orderNo != null ? order.orderNo : ""

                feedbackList.push({
                    id : feedback.id,
                    customerName : firstName + " " + lastName,
                    orderNo : orderNo,
                    rating : feedback.rating,
                    message : feedback.message,
                    status : feedback.status,
                    createdAt : feedback.createdAt
                })
            }
        }

        if(feedbackList.length > 0){
            return res.status(200).send({ data:{success:true, details:feedbackList}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data Found"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}