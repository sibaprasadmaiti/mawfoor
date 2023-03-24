var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
var flash = require('connect-flash');
var config = require("../../config/config.json");
var fs = require('fs')
var fs = require('file-system');
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


exports.customerList = async function(req, res){
    var storeId = req.body.data.storeId;
    let nameData = req.body.data.name || '';
    let cityData = req.body.data.city || '';
   
    if(storeId && storeId !=''){
        var list = [];
       
            if (nameData !='') {
                    const customerlist = await models.customers.findAll({attributes:['id','firstName','lastName','fullName','email','mobile','image','status'],
                     where:{storeId:storeId,  [Op.or]: [{ fullName: { [Op.like]: `%${nameData}%` } }]
                    } })

                    if(customerlist.length>0){
                        for(let customerDetails of customerlist){ 
                            let addressDetails = await models.customerAddresses.findOne({
                                attributes:['id','addressType','address','locality','city','state','pin'],
                                where:{customerId:customerDetails.id, isPrimary:'yes'}
                            });

                            if(addressDetails) {
                                var customerAddressType = addressDetails.addressType;
                                var customerAddress = addressDetails.address;
                                var customerAddressLocality = addressDetails.locality;
                                var customerAddressCity = addressDetails.city;
                                var customerAddressState = addressDetails.state;
                                var customerAddressPin = addressDetails.pin;
                            } else {
                                var customerAddressType = '';
                                var customerAddress = '';
                                var customerAddressLocality = '';
                                var customerAddressCity = '';
                                var customerAddressState = '';
                                var customerAddressPin = '';
                            }
                            
                            let details = {}
                            details.id= customerDetails.id,
                            details.firstName= customerDetails.firstName,
                            details.lastName= customerDetails.lastName,
                            details.fullName= customerDetails.firstName +' '+ customerDetails.lastName,
                            details.email= customerDetails.email,
                            details.mobile= customerDetails.mobile,
                            details.image = (customerDetails.image!='' && customerDetails.image!=null) ? req.app.locals.baseurl+'admin/customers/'+customerDetails.id+'/'+customerDetails.image : req.app.locals.baseurl+'admin/customers/user.png',
                            details.status= customerDetails.status,
                            details.addressType= customerAddressType,
                            details.address= customerAddress,
                            details.locality= customerAddressLocality,
                            details.city= customerAddressCity,
                            details.state= customerAddressState,
                            details.pin= customerAddressPin
            
                            list.push(details);
                        }
                    } else {
                        var list = [];
                        return res.status(200).send({ data:{success:false, message:'No data found!',list:list}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                    }

            } else if(cityData !=''){
                
                    const addresslist = await models.customerAddresses.findAll({attributes:['id','customerId','addressType','address','locality','city','state','pin'],
                     where:{storeId:storeId,isPrimary:'yes',  [Op.or]: [{ city: { [Op.like]: `%${cityData}%` } }]
                    } })
                    if(addresslist.length>0){
                        for(let addressDetails of addresslist){ 
                            let customerDetails = await models.customers.findOne({
                                attributes:['id','firstName','lastName','fullName','email','mobile','image','status'],
                                where:{id:addressDetails.customerId}
                            });
                            //console.log(customerDetails); return false;
                            if(customerDetails) {
                                var id = customerDetails.id;
                                var firstName = customerDetails.firstName;
                                var lastName = customerDetails.lastName;
                                var fullName = customerDetails.firstName +' '+ customerDetails.lastName;
                                var email = customerDetails.email;
                                var mobile = customerDetails.mobile;
                                var image = (customerDetails.image!='' && customerDetails.image!=null) ? req.app.locals.baseurl+'admin/customers/'+customerDetails.id+'/'+customerDetails.image : req.app.locals.baseurl+'admin/customers/user.png';
                                var status = customerDetails.status;

                            } else {
                                var id = '';
                                var firstName = '';
                                var lastName = '';
                                var fullName = '';
                                var email = '';
                                var mobile = '';
                                var image = '';
                                var status = '';
                            }

                            let details = {}
                            details.id= id,
                            details.firstName= firstName,
                            details.lastName= lastName,
                            details.fullName= fullName,
                            details.email= email,
                            details.mobile= mobile,
                            details.image = image,
                            details.status = status,

                            details.addressType= addressDetails.addressType,
                            details.address= addressDetails.address,
                            details.locality= addressDetails.locality,
                            details.city= addressDetails.city,
                            details.state= addressDetails.state,
                            details.pin= addressDetails.pin
            
                            list.push(details);
                        }
                    } else {

                        var list = [];
                        return res.status(200).send({ data:{success:false, message:'No data found!',list:list}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                    }

            } else {

                    const customerlist = await models.customers.findAll({attributes:['id','firstName','lastName','email','mobile','image','status'], where:{storeId:storeId} })
                    if(customerlist.length>0){
                        for(let customerDetails of customerlist){ 
                            let addressDetails = await models.customerAddresses.findOne({
                                attributes:['addressType','address','locality','city','state','pin'],
                                where:{customerId:customerDetails.id, isPrimary:'yes'}
                            });

                            if(addressDetails) {
                                var customerAddressType = addressDetails.addressType;
                                var customerAddress = addressDetails.address;
                                var customerAddressLocality = addressDetails.locality;
                                var customerAddressCity = addressDetails.city;
                                var customerAddressState = addressDetails.state;
                                var customerAddressPin = addressDetails.pin;
                            } else {
                                var customerAddressType = '';
                                var customerAddress = '';
                                var customerAddressLocality = '';
                                var customerAddressCity = '';
                                var customerAddressState = '';
                                var customerAddressPin = '';
                            }
                            
                            let details = {}
                            details.id= customerDetails.id,
                            details.firstName= customerDetails.firstName,
                            details.lastName= customerDetails.lastName,
                            details.fullName= customerDetails.firstName +' '+ customerDetails.lastName,
                            details.email= customerDetails.email,
                            details.mobile= customerDetails.mobile,
                            details.image = (customerDetails.image!='' && customerDetails.image!=null) ? req.app.locals.baseurl+'admin/customers/'+customerDetails.id+'/'+customerDetails.image : req.app.locals.baseurl+'admin/customers/user.png',
                            details.status= customerDetails.status,
                            details.addressType= customerAddressType,
                            details.address= customerAddress,
                            details.locality= customerAddressLocality,
                            details.city= customerAddressCity,
                            details.state= customerAddressState,
                            details.pin= customerAddressPin
            
                            list.push(details);
                        }
                    } else {
                        var list = [];
                        return res.status(200).send({ data:{success:false, message:'No data found!',list:list}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                    }

                }

        return res.status(200).send({data:{success:true,list:list},errorNode:{errorCode:0, errorMsg:"No Error"}});
    } else {
        return res.status(200).send({data:{success:false,message:'stoerId is required!'},errorNode:{errorCode:1, errorMsg:"Error"}});
    }

}

exports.customerView = async function(req,res){
	const { storeId, customerId } = req.body.data;

	if(storeId && storeId !='' && customerId && customerId !=''){

		models.customers.findAll({ attributes:['id','storeId','firstName','middleName','lastName','fullName','email','mobile','password','image','dob','doa','gender'], where: {storeId:storeId,id:customerId} 
		}).then(function (customers) {
			const list = customers.map(customer=>{
				return Object.assign(
					{},
					{
						id:customer.id,
						storeId:customer.storeId,
						firstName:customer.firstName,
						middleName:customer.middleName,
                        lastName:customer.lastName,
                        fullName:customer.fullName,
						email:customer.email,
						mobile:customer.mobile,
                        password:customer.password,
                        image:customer.image,
                        dob:customer.dob,
                        doa:customer.doa,
						gender:customer.gender,	
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
		
	} else{
		res.status(200).send({data:{success:false,message:'User Id required'}});
	}
};



exports.citylist = async function(req,res){
    let storeId = req.body.data.storeId
    if(storeId !=''){
        var citylist = await models.customerAddresses.findAll({attributes:['city'],group:['city'],where:{storeId:storeId}})
        if(citylist.length>0){
            return res.status(200).send({data:{success:true,list:citylist},errorNode:{errorCode:0, errorMsg:"No Error"}});
        } else {
            return res.status(200).send({ data:{success:false, message:'No City found!',list:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
        }
    } else {
        return res.status(200).send({data:{success:false,message:'stoerId is required!'},errorNode:{errorCode:1, errorMsg:"Error"}});
    }
}

exports.namelist = async function(req,res){
    let storeId = req.body.data.storeId
    if(storeId !=''){
        var namelist = await models.customers.findAll({attributes:['fullName'],group:['fullName'],where:{storeId:storeId}})
        if(namelist.length>0){
            return res.status(200).send({data:{success:true,list:namelist},errorNode:{errorCode:0, errorMsg:"No Error"}});
        } else {
            return res.status(200).send({ data:{success:false, message:'No name found!', list:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
        }
    } else {
        return res.status(200).send({data:{success:false,message:'stoerId is required!'},errorNode:{errorCode:1, errorMsg:"Error"}});
    }
}

exports.changeStatus = async function(req, res){
    let customerId=req.body.data.id
    let storeId = req.body.data.storeId
    let status = req.body.data.status
    if( customerId !='' && storeId !='' && status !=''){
        let idcheck = await models.customers.findOne({where:{id:customerId,storeId:storeId}});
        if(idcheck){
            await models.customers.update({ status:status },
                {where:{id:customerId,storeId:storeId}}).then(async function(change){
                    if(change){
                        return res.status(200).send({ data:{success:true, Data:change, message:'Customer status updated successfully'}, errorNode:{errorCode:0, errorMsg:" No Error"}});
                    } else {
                        return res.status(200).send({ data:{success:false, message:'Something went wrong'}, errorNode:{errorCode:1, errorMsg:"Error"}}); 
                    }
                }).catch(function(error) {
                    return res.status(200).send({ data:{success:false}, errorNode:{errorCode:1, errorMsg:error}});
                });
           
        } else {
            return res.status(200).send({data:{success:false,message:'customer not found!'},errorNode:{errorCode:1, errorMsg:"Error"}});
        }
        
    } else {
        return res.status(200).send({data:{success:false,message:'All field is required!'},errorNode:{errorCode:1, errorMsg:"Error"}});
    }
}


exports.addCustomer = async function(req, res){
    const{storeId,prefix,firstName,middleName,lastName,email,mobile,dob,doa,gender,referredBy,status,image,imgExt } = req.body.data;
   
    if(storeId !='' && firstName !='' && lastName !='' && email !='' && mobile !='' && gender !='' ){
        var fullName='';
       if(middleName !=''){
        fullName = firstName +' '+middleName+' '+lastName;
       }else{
        fullName = firstName +' '+lastName;
       }
        models.customers.create({
            storeId	 : storeId,
            prefix : prefix, 
            firstName : firstName,
            middleName : middleName,
            lastName : lastName,
            fullName : fullName,
            email   : email,
            mobile  : mobile,
            dob	 : dob ? dob : null,
            doa : doa ? doa : null,
            gender : gender,
            status  : status ? status : 'Yes',
            referredBy :referredBy
            			
        }).then(async function(customers){
            if(customers){

                if(image && image != '' && imgExt && imgExt !='') {
                    var dir = './public/admin/customers/'+customers.id; 
                    console.log(dir);
                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);                  
                    }
                    var imageTitle = Date.now();
                    var path = './public/admin/customers/'+ customers.id +'/'+imageTitle+'.'+imgExt;
                    var customerImage =imageTitle+'.'+imgExt;   
                    try {
                        const imgdata = image;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                        fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                        models.customers.update({
                          image : customerImage,
                        },{ where: { id: customers.id } });         
                    } catch (e) {
                        next(e);
                    }
                }

                return res.status(200).send({ data:{success:true, details:customers}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }else{
                return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }
        }).catch(function(error){
            return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
        })

    } else {
        return res.status(200).send({data:{success:false,message:'All Fields are required!'},errorNode:{errorCode:1, errorMsg:"Error"}});
    }

}

exports.editCustomer = async function(req, res){
    const{id,storeId,prefix,firstName,middleName,lastName,email,mobile,dob,doa,gender,referredBy,status,image,imgExt } = req.body.data;
    if (id!=''){
        var fullName='';
        if(middleName !=''){
         fullName = firstName +' '+middleName+' '+lastName;
        }else{
         fullName = firstName +' '+lastName;
        }
        models.customers.update({
             storeId : storeId,
             prefix : prefix, 
             firstName : firstName,
             middleName : middleName,
             lastName : lastName,
             fullName : fullName,
             email   : email,
             mobile  : mobile,
             dob : dob,
             doa : doa,
             gender : gender,
             status  : status,
             referredBy :referredBy
                         
         }, {where:{id:id}}).then(async function(customers){
            if(customers){

                if(image && image != '' && imgExt && imgExt !='') {
                    var dir = './public/admin/customers/'+id; 
                    console.log(dir);
                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);                  
                    }
                    var imageTitle = Date.now();
                    var path = './public/admin/customers/'+ id +'/'+imageTitle+'.'+imgExt;
                    var customerImage =imageTitle+'.'+imgExt;   
                    try {
                        const imgdata = image;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                        fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                        models.customers.update({
                          image : customerImage,
                        },{ where: { id: id } });         
                    } catch (e) {
                        next(e);
                    }
                }

                return res.status(200).send({ data:{success:true, details:customers}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }else{
                return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }
         }).catch(function(error){
            return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
         })

    } else {
        return res.status(200).send({data:{success:false,message:'Id is required!'},errorNode:{errorCode:1, errorMsg:"Error"}});
    }
   

}

// exports.customerDetails = async function(req,res){
// 	const { storeId, customerId } = req.body.data;

// 	if(storeId && storeId !='' && customerId && customerId !=''){
//         var list = [];
// 		let customerdetails = models.customers.findOne({ attributes:['id','storeId','firstName','middleName','lastName','fullName','email','mobile','password','image','dob','doa','gender','status'], where: {storeId:storeId,id:customerId,status:'Yes'} 
// 		})
//         if(customerdetails){
//             let customerid = customerdetails.id;
//            let addressList = await models.customerAddresses.findAll({ attributes:['addressType','address','locality','city','state','pin'],
//                where:{customerId:customerid} });
//             let details = {}
//             details.firstName= customerdetails.firstName,
//             details.middleName= customerdetails.middleName,
//             details.lastName= customerdetails.lastName,
//             details.fullName= customerdetails.fullName,
//             details.email= customerdetails.email,
//             details.mobile= customerdetails.mobile,
//             details.image = (customerdetails.image!='' && customerdetails.image!=null) ? req.app.locals.baseurl+'admin/customers/'+customerdetails.id+'/'+customerdetails.image : req.app.locals.baseurl+'admin/customers/user.png',
//             details.status= customerdetails.dob,
//             details.status= customerdetails.doa,
//             details.status= customerdetails.gender,
//             details.status= customerdetails.status,
           
//             details.addressList= addressList,
//             list.push(details);
//             return res.status(200).send({data:{success:true,list:list},errorNode:{errorCode:0, errorMsg:"No Error"}});

//         }
        
		
// 	} else {
// 		res.status(200).send({data:{success:false,message:'All fields are required'}});
// 	}
// };

exports.customerDetails = async function(req,res){
	let customerId=req.body.data.customerId
    let storeId = req.body.data.storeId

	if(storeId && storeId !='' && customerId && customerId !=''){
        var list = [];
        var cartProductArray = [];
		let customerdetails = await models.customers.findOne({ attributes:['id','storeId','prefix','firstName','middleName','lastName','fullName','email','mobile','password','image','dob','doa','gender','status','referredBy'], where: {storeId:storeId,id:customerId,status:'Yes'} 
		})
       // console.log(customerdetails); return false;
        if(customerdetails){
            let addressList = await models.customerAddresses.findAll({ attributes:['id','prefix','firstName','middleName','lastName','isPrimary','mobile','addressType','address','locality','city','state','pin','company','vatNo'],
                           where:{customerId:customerdetails.id} });

            let orderList = await models.orders.findAll({ attributes:['id','orderNo','orderStatus','paymentMethod','shippingMethod','amountPaid','createdAt'], where:{customerId:customerdetails.id, storeId:storeId} });
                           //console.log(addressList); return false;

            var cartProductList = await sequelize.query("SELECT products.id, products.sku, products.title, products.slug, products.price, products.status, products.type FROM `carts` left join products on products.id = carts.productId WHERE carts.storeId = "+storeId+" and carts.customerId = "+customerId,{ type: Sequelize.QueryTypes.SELECT });
            if(cartProductList.length>0){
                for(var i = 0; i < cartProductList.length; i++){

                    let stockDetails = await models.inventory.findAll({attributes:['stock'], where:{storeId:storeId, productId: cartProductList[i].id}, order: [['id', 'DESC']]})

                    let stockQuantity
                    if(stockDetails.length >= 1){
                        stockQuantity = stockDetails[0].stock
                    }else{
                        stockQuantity = 0
                    }
      
                    var productCategoryList = await sequelize.query("SELECT productCategory.id, productCategory.categoryId, categories.title as categoryTitle FROM `productCategory` left join categories on categories.id = productCategory.categoryId WHERE productCategory.storeId = "+storeId+" and productCategory.productId = "+cartProductList[i].id,{ type: Sequelize.QueryTypes.SELECT });

                    let cartProductImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:cartProductList[i].id, isPrimary: 'Yes'}});
        
                    if(cartProductImages.length>0){
                        if(cartProductImages[0].file!='' && cartProductImages[0].file!='' && cartProductImages[0].file!=null){
                        var cart_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/'+cartProductImages[0].productId+'/'+cartProductImages[0].file;
                        } else {
                        var cart_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
                        }
                    } else {
                        var cart_thumbnail_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
                    }

                    cartProductArray.push({
                        "id":cartProductList[i].id,
                        "sku":cartProductList[i].sku,
                        "slug":cartProductList[i].slug,
                        "productName":cartProductList[i].title,
                        "price":cartProductList[i].price,
                        "status":cartProductList[i].status,
                        "thumbnailImage": cart_thumbnail_product_images,
                        "type": cartProductList[i].type,
                        "stock": stockQuantity,
                        "productCategoryList":productCategoryList
                    });
                }
            } 

            var customerReviewList = await sequelize.query("SELECT feedback.id as feedbackId, feedback.orderId, feedback.rating, feedback.message, feedback.createdAt, orders.orderNo FROM `feedback` left join orders on orders.id = feedback.orderId WHERE feedback.storeId = "+storeId+" and feedback.customerId = "+customerId,{ type: Sequelize.QueryTypes.SELECT });

            let details = {}
            details.prefix= customerdetails.prefix,
            details.firstName= customerdetails.firstName,
            details.middleName= customerdetails.middleName,
            details.lastName= customerdetails.lastName,
            details.fullName= customerdetails.fullName,
            details.email= customerdetails.email,
            details.mobile= customerdetails.mobile,
            details.image = (customerdetails.image!='' && customerdetails.image!=null) ? req.app.locals.baseurl+'admin/customers/'+customerdetails.id+'/'+customerdetails.image : req.app.locals.baseurl+'admin/customers/user.png',
            details.dob= customerdetails.dob,
            details.doa= customerdetails.doa,
            details.gender= customerdetails.gender,
            details.status= customerdetails.status,
            details.referredBy= customerdetails.referredBy,
            details.addressList= addressList,
            details.orderList= orderList,
            details.cartProductList= cartProductArray,
            details.customerReviewList= customerReviewList,
            list.push(details);
            return res.status(200).send({data:{success:true,list:list},errorNode:{errorCode:0, errorMsg:"No Error"}});
        } else {
            return res.status(200).send({data:{success:true,list:[]},message:'No Data found',errorNode:{errorCode:0, errorMsg:"No Error"}});
        }   
		
	} else {
		res.status(200).send({data:{success:false,message:'All fields are required'}});
	}
};



exports.viewCustomerAddress= async function(req,res){
	const { storeId, id } = req.body.data;

	if(storeId && storeId !='' && id && id !=''){

		models.customerAddresses.findAll({ attributes:['id','storeId','isPrimary','prefix','firstName','middleName','lastName','fullName','mobile','addressType','address','locality','city','state','pin','country','company','vatNo'], where: {storeId:storeId,id:id} 
		}).then(function (address) {
			const list = address.map(addressdata=>{
				return Object.assign(
					{},
					{
                        id:addressdata.id,
                        storeId:addressdata.storeId,
                        isPrimary:addressdata.isPrimary,
                        prefix:addressdata.prefix,
                        firstName:addressdata.firstName,
                        middleName:addressdata.middleName,
                        lastName:addressdata.lastName,
                        fullName:addressdata.fullName,
                        mobile:addressdata.mobile,
                        addressType:addressdata.addressType,
                        address:addressdata.address,
                        locality:addressdata.locality,
                        city:addressdata.city,
                        state:addressdata.state,
                        pin:addressdata.pin,
                        country:addressdata.country,
                        company:addressdata.company,
                        vatNo:addressdata.vatNo,
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
		
	} else{
		res.status(200).send({data:{success:false,message:'User Id required'}});
	}
};



//  exports.editCustomerAddress = async function (req, res) {
//     const{id,storeId,customerId,isPrimary,fullName,mobile,addressType,address,locality,city,state,pin,country} = req.body.data;
//     if (id!='' && storeId!='' && customerId!='') {
//         var customerAddressIdCheck = await models.customerAddresses.findOne({where:{id:id}});
//         if(customerAddressIdCheck){
//             models.customerAddresses.update({
//                 storeId	 : storeId,
//                 isPrimary : isPrimary,
//                 fullName : fullName,
//                 mobile  : mobile,
//                 addressType	: addressType,
//                 address	 : address,
//                 locality : locality,
//                 city	 : city,
//                 state	 : state,
//                 pin	 : pin,
//                 country :country
//                }, {where: { id:id,storeId:storeId }
//             }).then(async function(data){
//                 models.customerAddresses.findAll({ attributes:['id','storeId','customerId','isPrimary','fullName','mobile','addressType','address','locality','city','state','pin','country'], where: {storeId:storeId,id:id} 
//                     }).then(function (address) {
//                         const list = address.map(addressdata=>{
//                             return Object.assign(
//                                 {},
//                                 {
//                                     id:addressdata.id,
//                                     storeId:addressdata.storeId,
//                                     customerId:addressdata.customerId,
//                                     isPrimary:addressdata.isPrimary,
//                                     fullName:addressdata.fullName,
//                                     mobile:addressdata.mobile,
//                                     addressType:addressdata.addressType,
//                                     address:addressdata.address,
//                                     locality:addressdata.locality,
//                                     city:addressdata.city,
//                                     state:addressdata.state,
//                                     pin:addressdata.pin,
//                                     country:addressdata.country,	
//                                 }
//                             )
//                         });
//                         if(list.length > 0){
//                             return res.status(200).send({ data:{success:true, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}});
//                         } else {
//                             return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
//                         }
//                     }).catch(function(error) {
//                         return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
//                     });
    
//             }).catch(function(error){
//                 return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
//             })
//         } else {
//             return res.status(200).send({ data:{success:false, message:"Id not found"}, errorNode:{errorCode:1, errorMsg:"Error"}}); 
//         }
//     } else {
//         return res.status(200).send({ status: 200, success: false, message: "All fields are required" });
//     }
//   };


  exports.editCustomerAddress = async function (req, res) {
    const{id,storeId,customerId,isPrimary,prefix,firstName,middleName,lastName,mobile,addressType,address,locality,city,state,pin,country,company,vatNo} = req.body.data;
   
    if (id!='' && storeId!='' && customerId!='' && firstName!='' && lastName!='') {
       
        var customerAddressIdCheck = await models.customerAddresses.findOne({where:{id:id}});
        if(customerAddressIdCheck){
            const customeraddressCheck = await models.customerAddresses.findAll({where:{customerId:customerId}});
            if(customeraddressCheck.length>0){
                if(isPrimary=='yes'){
                    models.customerAddresses.update({
                        isPrimary : 'no'
                       }, {where: {customerId:customerId}
                    }).then(async function(){
                        models.customerAddresses.update({
                            storeId	 : storeId,
                            customerId : customerId,
                            isPrimary : isPrimary,
                            prefix : prefix,
                            firstName : firstName,
                            middleName : middleName,
                            lastName : lastName,
                            fullName : firstName+' '+middleName+' '+lastName,
                            mobile  : mobile,
                            addressType	: addressType,
                            address	 : address,
                            locality : locality,
                            city : city,
                            state : state,
                            pin	 : pin,
                            country :country,
                            company : company,
                            vatNo : vatNo
                        },{where: { id:id,storeId:storeId }
                        }).then(async function(){
                            return res.status(200).send({ data:{success:true, message: 'Address updated Successfully '}, errorNode:{errorCode:0, errorMsg:'No error'}});
                        })
                        .catch(function(error) {
                            return res.status(500).send({ data:{success:false}, errorNode:{errorCode:1, errorMsg:error}});
                        });

                    }).catch(function(error) {
                        return res.status(500).send({ data:{success:false}, errorNode:{errorCode:1, errorMsg:error}});
                    });
                } else {
                    models.customerAddresses.update({
                        storeId	 : storeId,
                        customerId : customerId,
                        isPrimary : 'no',
                        prefix : prefix,
                        firstName : firstName,
                        middleName : middleName,
                        lastName : lastName,
                        fullName : firstName+' '+middleName+' '+lastName,
                        mobile  : mobile,
                        addressType	: addressType,
                        address	 : address,
                        locality : locality,
                        city : city,
                        state	: state,
                        pin	 : pin,
                        country :country,
                        company : company,
                        vatNo : vatNo
                    },{where: { id:id,storeId:storeId }
                    }).then(async function(customers){
                        if(customers){
                            return res.status(200).send({ data:{success:true, details:customers}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                        }else{
                            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                        }
                    }).catch(function(error){
                        return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
                    })
                } 
            }
        } else {
            return res.status(200).send({ status: 200, success: false, message: "Address id not found" });
        }    

    } else {
        return res.status(200).send({ status: 200, success: false, message: "All fields are required" });
    }
  };


exports.addCustomerAddress = async function(req,res){
    const{storeId,customerId,isPrimary,prefix,firstName,middleName,lastName,mobile,addressType,address,locality,city,state,pin,country,company,vatNo} = req.body.data;
    if(customerId !='' && isPrimary !='' && firstName!='' && lastName != '' && mobile!='' && address!='' && locality!='' && city!='' && state!='' && pin!=''){
       
            var customerCheck = await models.customers.findOne({where:{id:customerId}});
            if(customerCheck){
                const customeraddressCheck = await models.customerAddresses.findAll({where:{customerId:customerId}});
                if(customeraddressCheck.length>0){
                    if(isPrimary=='yes'){
                        models.customerAddresses.update({
                            isPrimary : 'no'
                           }, {where: {customerId:customerId}
                        }).then(async function(){
                            models.customerAddresses.create({
                                storeId	 : storeId,
                                customerId : customerId,
                                isPrimary : isPrimary,
                                prefix : prefix,
                                firstName : firstName,
                                middleName : middleName,
                                lastName : lastName,
                                fullName : firstName+' '+middleName+' '+lastName,
                                mobile  : mobile,
                                addressType	: addressType,
                                address	 : address,
                                locality : locality,
                                city	 : city,
                                state	 : state,
                                pin	 : pin,
                                country :country,
                                company : company,
                                vatNo : vatNo
                            }).then(async function(){
                                return res.status(200).send({ data:{success:true, message: 'Successfully created'}, errorNode:{errorCode:0, errorMsg:'No error'}});
                            })
                            .catch(function(error) {
                                return res.status(500).send({ data:{success:false}, errorNode:{errorCode:1, errorMsg:error}});
                            });

                        }).catch(function(error) {
                            return res.status(500).send({ data:{success:false}, errorNode:{errorCode:1, errorMsg:error}});
                        });
                    } else {
                        models.customerAddresses.create({
                            storeId	 : storeId,
                            customerId : customerId,
                            isPrimary : 'no',
                            prefix : prefix,
                            firstName : firstName,
                            middleName : middleName,
                            lastName : lastName,
                            fullName : firstName+' '+middleName+' '+lastName,
                            mobile  : mobile,
                            addressType	: addressType,
                            address	 : address,
                            locality : locality,
                            city	 : city,
                            state	 : state,
                            pin	 : pin,
                            country :country,
                            company : company,
                            vatNo : vatNo
                        }).then(async function(customers){
                            if(customers){
                                return res.status(200).send({ data:{success:true, details:customers}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                            }else{
                                return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                            }
                        }).catch(function(error){
                            return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
                        })
                    } 
                } else {
                    models.customerAddresses.create({
                        storeId	 : storeId,
                        customerId : customerId,
                        isPrimary : isPrimary,
                        prefix : prefix,
                        firstName : firstName,
                        middleName : middleName,
                        lastName : lastName,
                        fullName : firstName+' '+middleName+' '+lastName,
                        mobile  : mobile,
                        addressType	: addressType,
                        address	 : address,
                        locality : locality,
                        city	 : city,
                        state	 : state,
                        pin	 : pin,
                        country :country,
                        company : company,
                        vatNo : vatNo
                    }).then(async function(customers){
                        if(customers){
                            return res.status(200).send({ data:{success:true, details:customers}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                        }else{
                            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                        }
                    }).catch(function(error){
                        return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
                    })
                } 
            } else {
                return res.status(200).send({ status: 200, success: false, message: "CustomerId not found" });
            }

    } else {
    return res.status(200).send({ status: 200, success: false, message: "All fields are required" });
    }

}



  exports.deleteCustomerAddress = function (req, res) {
    var id = req.body.data.id;
    var storeId = req.body.data.storeId;
    //var customerId = req.body.data.customerId;
    if (id && id == "" && storeId && storeId=="") {
        return res.status(200).send({ status: 200, success: false, message: "Id not found" });
    }else{
        models.customerAddresses.destroy({
          where: { id:id,storeId:storeId }
        }).then(function (value) {
            if(value){
                return res.status(200).send({ data:{success:true}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }else{
                return res.status(200).send({ data:{success:false}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }
        }).catch(function (error) {
            return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
        });
    }
  };

  exports.customerSearch = async (req, res) => {
    const storeId = req.body.data.storeId || "";
    const searchString = req.body.data.searchString || "";
    console.log(storeId)
    if (storeId == '') {
      res.status(400).send({data:{success:false, details:"StoreId is required"},errorNode:{errorCode:1, errorMsg:"StoreId is required"}}) 
    } else {
      if (searchString == '') {
        res.status(400).send({data:{success:false, details:"Search string is required"},errorNode:{errorCode:1, errorMsg:"Search string is required"}})
      } else {
          
        var searchCustomersList = await sequelize.query("SELECT id, fullName as name  FROM `customers` WHERE  storeId = "+storeId+"  and (LOWER(`fullName`) LIKE LOWER('%"+searchString+"%') OR `email` LIKE '%"+searchString+"%' OR `mobile` LIKE '%"+searchString+"%') and status = 'Yes' ",{ type: Sequelize.QueryTypes.SELECT });
      
        if(searchCustomersList.length >0){
            
            res.status(200).send({data:{success:true, searchList:searchCustomersList},errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            res.status(200).send({data:{success:true, searchList:[]},errorNode:{errorCode:0, errorMsg:"No data found"}})
        }
      }
    }
}

exports.customerNameDetails = async function(req,res){
	let customerId=req.body.data.customerId
    let storeId = req.body.data.storeId

	if(storeId && storeId !='' && customerId && customerId !=''){
        
		let customerdetails = await models.customers.findOne({ attributes:['id','storeId','prefix','firstName','middleName','lastName','fullName'], where: {storeId:storeId,id:customerId}})
        if(customerdetails){   
            return res.status(200).send({data:{success:true,customerdetails:customerdetails},errorNode:{errorCode:0, errorMsg:"No Error"}});
        } else {
            return res.status(200).send({data:{success:false,customerdetails:{}},message:'No Data found',errorNode:{errorCode:0, errorMsg:"No Error"}});
        }   
		
	} else {
		res.status(200).send({data:{success:false,message:'All fields are required'}});
	}
};


 