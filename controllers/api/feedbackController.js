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

var fs = require('fs')
var fs = require('file-system');


/**
* Description:  Add Feedback
* @param req
* @param res user details with jwt token
* Developer:Surajit Gouri
**/

exports.add = async function(req, res, next) {
    
	var storeId = req.body.data.storeId;
	var customerId = req.body.data.customerId;
    var orderId = req.body.data.orderId;
	var rating = req.body.data.rating;
	var message = req.body.data.message;
	var reply = req.body.data.reply;

    //console.log(req.body.data);return false;
    if(storeId && storeId !='' && customerId && customerId !='' && orderId && orderId !='' && customerId && customerId){

            models.feedback.create({ 
                storeId   : storeId,
                customerId: customerId,
                orderId  : orderId,
                rating   : rating,
                message  : message,
                reply    : reply,
                status   : 'Yes'                 
            }).then(async function(feedback) {  
                return res.status(200).send({ data:{success:true, customerfeedback:feedback}, errorNode:{errorCode:0, errorMsg:""}});
            }).catch(function(error) {
                return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
            });
    } else {
        return res.status(200).send({ data:{success:false, details:"", message : "All fields are required"}, errorNode:{errorCode:1, errorMsg:"error"}});
    }

    // var body=await models.customers.findAll({
    //     attributes:['id','firstName'],
    //     order:[[models.customerAddresses,'id','ASC']],
    //     where:{id:99},
    //     include:[{
    //         model:models.customerAddresses,
    //         // attributes: [['fullName']],
    //         // order:[[models.customerAddresses,'id','DESC']],
    //         where:{
    //             customerId:99,
    //         }
    //     }],  
    //     // order:[['id','DESC']],                         
    // });
    
    // return res.status(200).send({ data:{success:true, customerfeedback:body}, errorNode:{errorCode:0, errorMsg:""}});
};


/******************************** Add feedback against order of a customer start **********************************************/

exports.customerOrderFeedback = async function (req,res){

    console.log("1111111111111111---------------"+req.body.data.storeId)
    var storeId = req.body.data.storeId;
    var encriptedOrderId = req.body.data.orderId;
    // var customerId = req.body.data.customerId;
    var message = req.body.data.message;
    var rating = req.body.data.rating;

    var food = req.body.data.food;
    var foodRating = req.body.data.foodRating;
    var delivery = req.body.data.delivery;
    var deliveryRating = req.body.data.deliveryRating;
    console.log("ssssssssssssssssssss----"+encriptedOrderId)
    

    if(storeId && storeId != ''){
  
        if(encriptedOrderId && encriptedOrderId != '' && message && message != ''){
    
            // let orderId = Buffer.from(encriptedOrderId, 'base64').toString('ascii');
            const encripted_order_string = Buffer.from(encriptedOrderId, 'base64').toString('ascii');
            var encripted_order_id = encripted_order_string.split(" ");
            var orderId = Number(encripted_order_id[1]);

            console.log("qqqqqqqqqqqqqq----"+orderId)
            var order_details = await models.orders.findAll({attributes:['id','storeId','orderNo','customerId','orderStatus','amountPaid'], where: {id:orderId, storeId:storeId}})
        
            if (order_details.length > 0 ) {

                // if (order_details[0].amountPaid >= 200 ) {
                if (order_details[0].amountPaid && order_details[0].amountPaid != null && order_details[0].amountPaid != '' ) {
                    var discount_amount = Math.round(10*(order_details[0].amountPaid/100));
                    // // /////////////////////////// waller transection start ////////////////////

                    if (storeId == 17 ) {
                        var customer_order_feedback_check = await models.feedback.findAll({attributes:['id','storeId','orderId','rating','message','status'], where: {orderId:orderId, storeId:storeId}})
                        if (customer_order_feedback_check.length <= 0 ) {
                            if (order_details[0].amountPaid != null && order_details[0].amountPaid != '' && order_details[0].amountPaid > 0 ) {
                                
                                var customer_wallet_balance_after_order = await models.walletTransaction.findAll({ where: {customerId:order_details[0].customerId, storeId:storeId}, limit: 1, order: [['id', 'DESC']]})
                        
                                if (customer_wallet_balance_after_order.length > 0 ) {
                                    var wallet_balance_amount = Math.abs(customer_wallet_balance_after_order[0].balance) + Math.abs(discount_amount);
                                } else {
                                    var wallet_balance_amount = Math.abs(discount_amount);
                                }
                        
                                models.walletTransaction.create({
                                    storeId: storeId,
                                    customerId: order_details[0].customerId,
                                    balance: wallet_balance_amount,
                                    amount: Math.abs(discount_amount),
                                    transactionType	: 'credit',
                                    remarks: '10 % cash back added',
                                    orderId: orderId,
                                })
                            }
                        }
                    }
                    // /////////////////////////// waller transection end ////////////////////
                }
                // }
                
                var createOrderFeedback = await models.feedback.create({
                    storeId   : storeId,
                    customerId: order_details[0].customerId,
                    orderId  : orderId,
                    rating   : rating,
                    message  : message,
                    food        : food,
                    foodRating  : foodRating,
                    delivery    : delivery,
                    deliveryRating  : deliveryRating,
                    status   : 'Yes'
                });
                
                if(createOrderFeedback){
                    return res.status(200).send({ data:{success:true,  message:"Feedback successfully saved."}, errorNode:{errorCode:0, errorMsg:""}});
                }else{
                    return res.status(200).send({ data:{success:false,message:"Something Worng! Please try again."}, errorNode:{errorCode:1, errorMsg:''}});
                }
                // } 
                // else {
                //     return res.status(200).send({ data:{success:false,message:"Feedback is not possible"}, errorNode:{errorCode:1, errorMsg:''}});
                // }
            }else{
                return res.status(200).send({ data:{success:false,message:"No Order found."}, errorNode:{errorCode:1, errorMsg:''}});
            }
        }else{
        return res.status(200).send({ data:{success:false, message:"Order id and Message are required."}, errorNode:{errorCode:1, errorMsg:''}});
        }
    }else{
        return res.status(200).send({ data:{success:false, message:"Store id is required."}, errorNode:{errorCode:1, errorMsg:''}});
    }
  }
  
  /******************************** Add feedback against order of a customer end **********************************************/
  
  
  /******************************** customer order feedback check start **********************************************/
  
  exports.customerOrderFeedbackCheck = async function (req,res){

    var storeId = req.body.data.storeId;
    var encriptedOrderId = req.body.data.orderId;
    console.log("ssssssssssssssssssss----"+encriptedOrderId)
    if(storeId && storeId != ''){
        if(encriptedOrderId && encriptedOrderId != ''){
            // let orderId = Buffer.from(encriptedOrderId, 'base64').toString('utf-8');

            
            const encripted_order_string = Buffer.from(encriptedOrderId, 'base64').toString('ascii');
            var encripted_order_id = encripted_order_string.split(" ");
            var orderId = Number(encripted_order_id[1]);
            // console.log("aaaaaaaaaaaaaa----"+encripted_order_id[1]);
            // console.log("bbbbbbbbbbb----"+encripted_order_id[0]);
            // console.log("ccccccccccccc----"+encripted_order_id[1]);
            // console.log("qqqqqqqqqqqqqq----"+Number(encripted_order_id[1]));
            var customer_order_feedback_check = await models.feedback.findAll({attributes:['id','storeId','orderId','rating','message','status'], where: {orderId:orderId, storeId:storeId}})
        
            if(customer_order_feedback_check.length > 0 ){
                return res.status(200).send({ data:{success:false, message:"Feedback already added for this order.", customer_feedback : customer_order_feedback_check}, errorNode:{errorCode:1, errorMsg:''}});
            }else{
                return res.status(200).send({ data:{success:true, message:"", orderId:orderId}, errorNode:{errorCode:0, errorMsg:""}});
            }
        }else{
        return res.status(200).send({ data:{success:false, message:"Order id is required."}, errorNode:{errorCode:1, errorMsg:''}});
        }
    }else{
        return res.status(200).send({ data:{success:false, message:"Store id is required."}, errorNode:{errorCode:1, errorMsg:''}});
    }
  }
  
  /******************************** customer order feedback check end **********************************************/


exports.billingFeedbackSubmit = async function(req, res, next) {
    
	var storeId = req.body.data.storeId;
	var customerId = req.body.data.customerId;
    var billingNo = req.body.data.billingNo;
	var amount = req.body.data.amount;
	var foodQualityRating = req.body.data.foodQualityRating;
    var foodQualityRemarks = req.body.data.foodQualityRemarks;
    var serviceRating = req.body.data.serviceRating;
    var serviceRemarks = req.body.data.serviceRemarks;
    var ambienceRating = req.body.data.ambienceRating;
    var ambienceRemarks = req.body.data.ambienceRemarks;
    var overallRating = req.body.data.overallRating;
    var overallRemarks = req.body.data.overallRemarks;
    
    var image = req.body.data.image;
    var imageExt = req.body.data.imageExt;

    //console.log(req.body.data);return false;
    if(storeId && storeId !='' ){
        if(customerId && customerId !='' ){
            if(billingNo && billingNo !='' && amount && amount){

                    models.billingFeedback.create({ 
                        storeId   : storeId,
                        customerId: customerId,
                        billingNo  : billingNo,
                        amount   : amount,
                        foodQualityRating  : foodQualityRating,
                        foodQualityRemarks    : foodQualityRemarks,
                        serviceRating  : serviceRating,
                        serviceRemarks    : serviceRemarks,
                        ambienceRating  : ambienceRating,
                        ambienceRemarks    : ambienceRemarks,
                        overallRating  : overallRating,
                        overallRemarks    : overallRemarks,
                        status   : 'No'                 
                    }).then(async function(feedback) {  

                        var dir = './public/admin/feedback/'+feedback.id; 
                        console.log(dir);
                        if (!fs.existsSync(dir)){
                            fs.mkdirSync(dir);                  
                        }
                        
                        if(image && image != '' && imageExt && imageExt !='') {
                            var imageTitle = Date.now();
                            var path = './public/admin/feedback/'+ feedback.id +'/'+imageTitle+'.'+imageExt;
                            var feedbackImage =imageTitle+'.'+imageExt;   
                            try {
                                const imgdata = image;
                                const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                                fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                                models.billingFeedback.update({
                                image : feedbackImage,
                                },{ where: { id: feedback.id } })        
                            } catch (e) {
                                next(e);
                            }
                        }

                        return res.status(200).send({ data:{success:true, customerfeedback:feedback, message : "your bill has been successfully submitted"}, errorNode:{errorCode:0, errorMsg:""}});
                    }).catch(function(error) {
                        return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
                    });
                } else {
                    return res.status(200).send({ data:{success:false, details:"", message : "Amount, bill number and image are required"}, errorNode:{errorCode:1, errorMsg:"error"}});
                }
            } else {
                return res.status(200).send({ data:{success:false, details:"", message : "Customer id is required"}, errorNode:{errorCode:1, errorMsg:"error"}});
            }
    } else {
        return res.status(200).send({ data:{success:false, details:"", message : "Store id is required"}, errorNode:{errorCode:1, errorMsg:"error"}});
    }

};