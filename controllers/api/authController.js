var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
var flash = require('connect-flash');
var config = require("../../config/config.json");
const sms_controller = require('../sms/smsController.js');
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
* Description:  User Login
* @param req for email & password
* @param res user details with jwt token
* Developer:Avijit Das and Partha Mandal
**/
// exports.signin = async function(req, res, next) {
// 	const { phone, hostname, platform } = req.body.data;
// 	console.log("aaaaaaaa---"+phone);
// 	console.log("hostname---"+hostname);
// 	console.log("platform---"+platform);

	

// 	if(platform == 'web'){

// 		const payload = {
// 			phone : phone,
// 			hostname : hostname,
// 			platform: platform
// 		};
	
// 		const token = jwt.sign({ payload }, SECRET, { expiresIn: '30d' });

// 		if(phone=='' || phone==undefined && hostname =='' || hostname==undefined){
// 			return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Please provied Company and Phone number"}});
// 		} else {
// 			models.stores.findOne({attributes:['id'], where:{cCode:hostname}}).then(function (storeId){
// 				var otp = Math.floor(1000 + Math.random() * 9000);
// 				if(storeId!=null){
// 					models.customers.findOne({ attributes:['id','storeId','otp', 'platform', 'webToken'], where: { mobile:phone, storeId: storeId.id, platform: 'web' } }).then(function (customer) {
// 						if(customer!=null){
// 							models.customers.update({
// 								otp : otp,
// 								webToken: token
// 							},{where:{id:customer.id}}).then(function(value) {

// 								// var smsContent = otp +" is your verification code. Code valid for 10 minutes only, one time use. Please DO NOT share this OTP with anyone to ensure account's security.";
// 								// var smsContent = 'Your one time password is '+otp+'';
// 								  // sms_controller.sendsms(phone, smsContent);
// 								  sms_controller.sendotp(phone, otp);
// 								return res.status(200).send({ data:{success:true,details:{ storeId:customer.storeId,id:customer.id,otp:otp, token:token}}, errorNode:{errorCode:0, errorMsg:"No Error"}});
// 							});
// 						}else{
// 							models.customers.create({
// 								storeId:storeId.id,
// 								mobile:phone,
// 								otp:otp,
// 								platform: 'web',
// 								webToken: token,
// 								status: "Yes"
// 							}).then(function(customers) {

// 								// var smsContent = otp +" is your verification code. Code valid for 10 minutes only, one time use. Please DO NOT share this OTP with anyone to ensure account's security.";
// 								// var smsContent = 'Your one time password is '+otp+'';
// 								// sms_controller.sendsms(phone, smsContent);
// 								sms_controller.sendotp(phone, otp);
								  
// 								return res.status(200).send({ data:{success:true, details:{ storeId:customers.storeId,id:customers.id,otp:otp,token:token}}, errorNode:{errorCode:0, errorMsg:"No Error"}});
// 							}).catch(function(error) {
// 								return res.status(500).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
// 							});
// 						}
// 					}).catch(function(error) {
// 						return res.status(500).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
// 					});
// 				}else{
// 					return res.status(400).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"Something went wrong"}});
// 				}
// 			});
// 		}
// 	}else if(platform =='app'){


// 		const payload = {
// 			phone : phone,
// 			hostname : hostname,
// 			platform: platform
// 		};
	
// 		const token = jwt.sign({ payload }, SECRET, { expiresIn: '30d' });
		
// 		if(phone=='' || phone==undefined && hostname =='' || hostname==undefined){
// 			return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Please provied Company and Phone number"}});
// 		} else {
// 			models.stores.findOne({attributes:['id'], where:{cCode:hostname}}).then(function (storeId){
// 				var otp = Math.floor(1000 + Math.random() * 9000);
// 				if(storeId!=null){
// 					models.customers.findOne({ attributes:['id','storeId','otp', 'platform', 'appToken'], where: { mobile:phone, storeId: storeId.id, platform: 'app' } }).then(function (customer) {
// 						if(customer!=null){
// 							models.customers.update({
// 								otp : otp,
// 								appToken: token
// 							},{where:{id:customer.id}}).then(function(value) {

// 								// var smsContent = otp +" is your verification code. Code valid for 10 minutes only, one time use. Please DO NOT share this OTP with anyone to ensure account's security.";
// 								// var smsContent = 'Your one time password is '+otp+'';
// 								// sms_controller.sendsms(phone, smsContent);
// 								sms_controller.sendotp(phone, otp);
								  
// 								return res.status(200).send({ data:{success:true,details:{ storeId:customer.storeId,id:customer.id,otp:otp, token:token}}, errorNode:{errorCode:0, errorMsg:"No Error"}});
// 							});
// 						}else{
// 							models.customers.create({
// 								storeId:storeId.id,
// 								mobile:phone,
// 								otp:otp,
// 								status: "Yes",
// 								platform: 'app',
// 								appToken: token
// 							}).then(function(customers) {

// 								// var smsContent = otp +" is your verification code. Code valid for 10 minutes only, one time use. Please DO NOT share this OTP with anyone to ensure account's security.";
// 								var smsContent = 'Your one time password is '+otp+'';
// 								sms_controller.sendsms(phone, smsContent);
								  
// 								return res.status(200).send({ data:{success:true, details:{ storeId:customers.storeId,id:customers.id,otp:otp,token:token}}, errorNode:{errorCode:0, errorMsg:"No Error"}});
// 							}).catch(function(error) {
// 								return res.status(500).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
// 							});
// 						}
// 					}).catch(function(error) {
// 						return res.status(500).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
// 					});
// 				}else{
// 					return res.status(400).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Something went wrong"}});
// 				}
// 			});
// 		}
// 	}else{
// 		// return res.status(400).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Something wend wrong"}});
// 		if(phone=='' || phone==undefined && hostname =='' || hostname==undefined){
// 			return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Please provied Company and Phone number"}});
// 		} else {
// 			var storeId = models.stores.findOne({attributes:['id'], where:{cCode:hostname}}).then(function (storeId){
// 				var otp = Math.floor(1000 + Math.random() * 9000);
// 				if(storeId!=null){
// 					models.customers.findOne({ attributes:['id','storeId','otp'], where: { mobile:phone, storeId: storeId.id } }).then(function (customer) {
// 						if(customer!=null){
// 							models.customers.update({
// 								otp : otp,
// 							},{where:{id:customer.id}}).then(function(value) {

// 								// var smsContent = otp +" is your verification code. Code valid for 10 minutes only, one time use. Please DO NOT share this OTP with anyone to ensure account's security.";
// 								// var smsContent = 'Your one time password is '+otp+'';
// 								// sms_controller.sendsms(phone, smsContent);
// 								sms_controller.sendotp(phone, otp);
								  
// 								return res.status(200).send({ data:{success:true,details:{ storeId:customer.storeId,id:customer.id,otp:otp}}, errorNode:{errorCode:0, errorMsg:"No Error"}});
// 							});
// 						}else{
// 							models.customers.create({
// 								storeId:storeId.id,
// 								mobile:phone,
// 								otp:otp,
// 								status: "Yes",
// 							}).then(function(customers) {

// 								// var smsContent = otp +" is your verification code. Code valid for 10 minutes only, one time use. Please DO NOT share this OTP with anyone to ensure account's security.";
// 								// var smsContent = 'Your one time password is '+otp+'';
// 								// sms_controller.sendsms(phone, smsContent);
// 								sms_controller.sendotp(phone, otp);
								  
// 								return res.status(200).send({ data:{success:true, details:{ storeId:customers.storeId,id:customers.id,otp:otp}}, errorNode:{errorCode:0, errorMsg:"No Error"}});
// 							}).catch(function(error) {
// 								return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
// 							});
// 						}
// 					}).catch(function(error) {
// 						return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
// 					});
// 				}else{
// 					return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"error"}});
// 				}
// 			});
// 			//console.log(cid.id);return false;
			
// 		}
// 	}
// };

exports.signin = async (req, res) => {
	const { phone, hostname } = req.body.data;

	const storeDetails = await models.stores.findOne({attributes:['id'], where:{cCode:hostname}})
	const otp = Math.floor(1000 + Math.random() * 9000);
	if(storeDetails && storeDetails != null && storeDetails != ''){
		const customer = await models.customers.findOne({ attributes:['id','storeId','otp', 'updatedAt'], where: { mobile:phone, storeId: storeDetails.id }})
		if(customer && customer != null && customer != ''){

			const currentTime = Date.now()
			const lastUpdateTime = new Date(customer.updatedAt).getTime()
			// console.log("aaaaaaaaaaaaaa--currentTime--"+currentTime)
			// console.log("aaaaaaaaaaaaaa--lastUpdateTime--"+lastUpdateTime)
			const timeDifference = currentTime - lastUpdateTime

			if(timeDifference >= 300000){
				await models.customers.update({otp : otp},{where:{id:customer.id}})
				sms_controller.sendotp(phone, otp);

				return res.status(200).send({ data:{success:true,details:{ storeId:customer.storeId,id:customer.id,otp:otp}}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			}else{
				sms_controller.sendotp(phone, customer.otp);

				return res.status(200).send({ data:{success:true,details:{ storeId:customer.storeId,id:customer.id,otp:customer.otp}}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			}
		}else{
			const updateDetails = await models.customers.create({
				storeId:storeDetails.id,
				mobile:phone,
				otp:otp,
				status: "Yes",
			})
			sms_controller.sendotp(phone, otp);
			if(updateDetails){
				return res.status(200).send({ data:{success:true,details:{ storeId:updateDetails.storeId,id:updateDetails.id,otp:otp}}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			}else{
				return res.status(500).send({ data:{success:false,details:"Something went wrong"}, errorNode:{errorCode:1, errorMsg:"Something went wrong"}});
			}
		}
	}else{
		return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"error"}});
	}
};

/**
* Description:  User Login
* @param req for phone, otp
* @param res
* Developer:Susanta Kumar Das
**/
exports.verifyOtp = async function(req, res, next) {
	const { phone, otp } = req.body.data;
	if(phone=='' || phone==undefined){
		return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Please provied phone"}});
	} else if(otp=='' || otp==undefined) {
		return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Please provied otp"}});
	} else {
		models.customers.findOne({
			attributes:['id', 'storeId', 'firstName', 'lastName', 'email', 'mobile', 'image', 'status','otp'], 
			where: {
				mobile:phone ,otp:otp,
			},include:[{
				model:models.stores,
				attributes:['cCode','company'],
				required:false,
			}]
		}).then(function (customers) {
			if(customers!=null){
				let user = customers.toJSON();
				if(otp!=customers.otp) {
					return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"Otp wrong"}});
				}else {
					if (phone == customers.mobile) {
						delete user.otp;
						user['oldNew']='';
						if(customers.email=='' || customers.email==null){
							user.oldNew='newUser'
						} else {
							var token = jwt.sign({customers}, SECRET, { expiresIn: 18000 });
							user['token']='';
							user.token=token;
						}
						user.image = (user.image!='' && user.image!=null) ? user.store.website + user.image :'';
						user.logoWebsite = user.store.website + user.store.logoWebsite;
						user.cCode =user.store.cCode;
						user.company =user.store.company;
						
						return res.status(200).send({ data:{success:true, details:user}, errorNode:{errorCode:0, errorMsg:"No Error"}});
					} else {
						return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No user found"}});
					}
				}
			} else {
				return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No user found"}});
			}
		}).catch(function(error) {
			return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
		});
	}
};
/**
* Description:  User Login
* @param req for email, password, firstName, lastName, phone, storeId, address & designation
* @param res
* Developer:Susanta Kumar Das
**/
exports.signup = async function(req, res, next) {
	const { id, email, firstName, lastName, phone } = req.body;
	if(email=='' || email==undefined || firstName=='' || firstName==undefined || lastName=='' || lastName==undefined || phone=='' || phone==undefined){ 
		var message ='';
		if(email=='' || email==undefined){
			message +='Please provied e-mail id \n';
		}
		if(firstName=='' || firstName==undefined){
			message +='Please provied first name \n';
		}
		if(lastName=='' || lastName==undefined){
			message +='Please provied last name \n';
		}
		if(phone=='' || phone==undefined){
			message +='Please provied phone \n';
		}
		
		return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:message}});
	} else {
		if(id > 0 && id != undefined ){
		    models.customers.findOne({
				where: {
					[Op.or]: [
						{ email: email },
						{ mobile: phone }
					]
				}
			}).then(function (duplicate) {
				if(duplicate){
					if(duplicate.id != id){
					    if (email == duplicate.email) {
						    return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Email Id Already Exists"}});
					    } else {
						    return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Phone Number Already Exists"}});
					    }
					} else {

						models.customers.update({ 
						    firstName: firstName, 
						    lastName: lastName, 
						    email:email,
						    storeId:30,
							// password: hash,
						    mobile:phone
					    },{where:{id:id}}).then(function(userU) {
						    models.customers.findOne({
							    where: {
								    id:id
							    }
						    }).then(function (customers) {
							    let customer = customers.toJSON();
							    delete customer.password;
							    delete customer.verificationotp;
							    var token = jwt.sign({customers}, SECRET, { expiresIn: 18000 });
							    customer['token']='';
							    customer.token=token;
							    customer.image = (customers.image!='' && customers.image!=null) ? req.app.locals.baseurl+'admin/customers/'+customers.id+'/'+customers.image : req.app.locals.baseurl+'admin/customers/user.png';
							    return res.status(200).send({ data:{success:true, details:customers}, errorNode:{errorCode:0, errorMsg:"No Error"}});
						    }).catch(function(error) {
							    return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
						    });
					    }).catch(function(error) {
						    return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
					    }); 
					}
				} else {
					models.customers.update({ 
						firstName: firstName, 
						lastName: lastName, 
						email:email,
						storeId:30,
						// password: hash,
						mobile:phone
					},{where:{id:id}}).then(function(userU) {
						models.customers.findOne({
							where: {
								id:id
							}
						}).then(function (customers) {
							let customer = customers.toJSON();
							delete customer.password;
							delete customer.verificationotp;
							var token = jwt.sign({customers}, SECRET, { expiresIn: 18000 });
							customer['token']='';
							customer.token=token;
							customer.image = (customers.image!='' && customers.image!=null) ? req.app.locals.baseurl+'admin/customers/'+customers.id+'/'+customers.image : req.app.locals.baseurl+'admin/customers/user.png';
							return res.status(200).send({ data:{success:true, details:customers}, errorNode:{errorCode:0, errorMsg:"No Error"}});
						}).catch(function(error) {
							return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
						});
					}).catch(function(error) {
						return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
					}); 
				}
			}).catch(function(error) {
				return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
			});
		} else {
			var hash = bcrypt.hashSync("123456");
			models.customers.findOne({
				where: {
					[Op.or]: [
						{ email: email },
						{ mobile: phone }
					]
				}
			}).then(function (duplicate) {
				if(duplicate){
					if (email == duplicate.email) {
						return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Email Id Already Exists"}});
					} else {
						return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Phone Number Already Exists"}});
					}
				} else {
					models.customers.create({ 
						firstName: firstName,  
						lastName: lastName,  
						email:email,
						storeId:30,
						password: hash,
						mobile:phone,
						status:'Yes'
					}).then(function(userN) {
						models.customers.findOne({
							where: {
								id:userN.id
							}
						}).then(function (customers) {
							let customer = customers.toJSON();
							delete customer.password;
							delete customer.verificationotp;
							var token = jwt.sign({customers}, SECRET, { expiresIn: 18000 });
							customer['token']='';
							customer.token=token;
							customer.image = (customers.image!='' && customers.image!=null) ? req.app.locals.baseurl+'admin/customers/'+customers.id+'/'+customers.image : req.app.locals.baseurl+'admin/customers/user.png';
							return res.status(200).send({ data:{success:true, details:customer}, errorNode:{errorCode:0, errorMsg:"No Error"}});
						}).catch(function(error) {
							return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
						});
					}).catch(function(error) {
						return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
					}); 
				}
			}).catch(function(error) {
				return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
			});
		}
	};
};


/**
* Description:  customer Registration
* @param req
* @param res user details with jwt token
* Developer:Avijit Das
**/
exports.registration = async function(req,res,next){
	const{storeId,id,firstName,lastName,email,mobile,dob,gender,password,termsChecked,offerChecked } = req.body.data;
	console.log("aaaaaaaaaaaaaa----"+id);
	console.log("bbbbbbbbbb----"+storeId);
	console.log("ccccccccccccc----"+mobile);
	console.log("ddddddddddd----"+email);
	if(storeId && storeId!='' && firstName && firstName!='' && email && email!='' && mobile && mobile!='' && password && password!=''){

		var hash = bcrypt.hashSync(password);

		console.log("eeeeeeeeeeeee----");
		if(id && id != '' && id != null){
			console.log("ffffffffffffff----");
			var customerCount = await models.customers.findAll({attributes:['id'],where:{storeId:storeId, id:id}});		
			if(customerCount.length>0){
				console.log("ggggggggggg----"+customerCount.length);
				var emailVerification = await  models.customers.findAll({attributes:['id','email'],where:{storeId:storeId, email:email, id: { $ne: id }}});
				if(emailVerification.length>0){
					console.log("hhhhhhhhhhhhh----"+emailVerification.length);
					return res.status(200).send({ data:{success:false, details:"", message:'Email Id Already Exists'}, errorNode:{errorCode:0, errorMsg:"Email Id Already Exists"}});
				} else {
					console.log("iiiiiiiiiiiiii----");
					var mobileVerification = await  models.customers.findAll({attributes:['id','mobile'],where:{storeId:storeId, mobile:mobile, id: { $ne: id }}});
					if(mobileVerification.length>0){
						console.log("jjjjjjjjjjjjjjj----"+mobileVerification.length);
						return res.status(200).send({ data:{success:false, details:"", message:'Mobile No Already Exists'}, errorNode:{errorCode:1, errorMsg:"Mobile No Already Exists"}});
					} else {
						console.log("kkkkkkkkkkkkk----");
						models.customers.update({
							storeId	 : storeId,
							firstName: firstName,
							lastName : lastName,
							fullName : firstName+' '+lastName,
							email	 : email,
							mobile   : mobile,
							dob		 : dob,
							gender	 : gender,
							password: hash,	
							termsChecked: termsChecked,	
							offerChecked: offerChecked,			
						},{where:{storeId:storeId,id:id}}).then(async function(data){

							if(offerChecked == 'Yes'){
								models.subscribers.create({
									storeId	 : storeId,
									email: email,
									status	 :'Yes',		
								})
							}
							// models.customers.findAll({ attributes:['id','storeId','firstName','lastName','email','mobile','gender','image','status'], where: {storeId:storeId,id:id} 
							// }).then(function (customers) {
							models.customers.findOne({
								attributes:['id', 'storeId', 'firstName', 'lastName', 'fullName', 'email', 'mobile', 'image', 'gender', 'status','offerChecked','termsChecked'], 
								where: {
									storeId:storeId, id:id,
								},include:[{
									model:models.stores,
									attributes:['cCode','company'],
									required:false,
								}]
							}).then(function (customers) {
								let user = customers.toJSON();
								var token = jwt.sign({customers}, SECRET, { expiresIn: 18000 });
								user['token']='';
								user.token=token;
								user.image = (user.image!='' && user.image!=null) ? user.store.website + user.image :'';
								user.logoWebsite = user.store.website + user.store.logoWebsite;
								user.cCode =user.store.cCode;
								user.company =user.store.company;
								
								return res.status(200).send({ data:{success:true, details:user}, errorNode:{errorCode:0, errorMsg:"No Error"}});
								
								// console.log("llllllllllllllllll----");
								// const list = customers.map(customer=>{
								// 	return Object.assign(
								// 		{},
								// 		{
								// 			id:customer.id,
								// 			storeId:customer.storeId,
								// 			firstName:customer.firstName,
								// 			lastName:customer.lastName,
								// 			email:customer.email,
								// 			mobile:customer.mobile,
								// 			image:customer.image,
								// 			status:customer.status,
								// 			oldNew:"",
								// 			logoWebsite:"",
								// 			cCode:"",
								// 			company:"",
								// 			gender:customer.gender,	
								// 		}
								// 	)
								// });
								// if(list.length > 0){
								// 	return res.status(200).send({ data:{success:true, details:list[0]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
								// } else {
								// 	return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
								// }
							}).catch(function(error) {
								return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
							
							});
						}).catch(function(error){
							return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
						})
					}
				}
			}else{
				return res.status(200).send({ data:{success:false, message:'No user found'}, errorNode:{errorCode:1, errorMsg:"Error"}});
			}
		}else{
			console.log("mmmmmmmmmmmmmmmmmmm----");
			var emailVerification = await  models.customers.findAll({attributes:['id','email'],where:{storeId:storeId, email:email}});
			if(emailVerification.length>0){
				console.log("nnnnnnnnnnnnnnnnnn----"+emailVerification.length);
				return res.status(200).send({ data:{success:false, details:"", message:'Email Id Already Exists'}, errorNode:{errorCode:0, errorMsg:"Email Id Already Exists"}});
			} else {
				console.log("ooooooooooo----");
				var mobileVerification = await  models.customers.findAll({attributes:['id','mobile'],where:{storeId:storeId, mobile:mobile}});
				if(mobileVerification.length>0){
					console.log("ppppppppppppp----"+mobileVerification.length);
					return res.status(200).send({ data:{success:false, details:"", message:'Mobile No Already Exists'}, errorNode:{errorCode:0, errorMsg:"Mobile No Already Exists"}});
				} else {
					console.log("qqqqqqqqqqqqqqq----");
					models.customers.create({
						storeId	 : storeId,
						firstName: firstName,
						lastName : lastName,
						email	 : email,
						mobile   : mobile,
						dob		 : dob,
						gender	 : gender,
						status	 :'Yes',
						password: hash,	
						termsChecked: termsChecked,	
						offerChecked: offerChecked,			
					}).then(async function(customers){
						if(customers){

							if(offerChecked == 'Yes'){
								models.subscribers.create({
									storeId	 : storeId,
									email: email,
									status	 :'Yes',		
								})
							}
							
							return res.status(200).send({ data:{success:true, details:customers}, errorNode:{errorCode:0, errorMsg:"No Error"}});
						}else{
							return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
						}
					}).catch(function(error){
						return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
					})
				}
			}
		}
	} else {
		console.log("rrrrrrrrrrrr----");
		var message ='';
		if(storeId=='' || storeId==undefined){
			message +='Please provied store id \n';
		}
		if(email=='' || email==undefined){
			message +='Please provied e-mail id \n';
		}
		if(firstName=='' || firstName==undefined){
			message +='Please provied first name \n';
		}
		if(lastName=='' || lastName==undefined){
			message +='Please provied last name \n';
		}
		if(mobile=='' || mobile==undefined){
			message +='Please provied mobile \n';
		}
		if(password=='' || password==undefined){
			message +='Please provied password \n';
		}
		return res.status(200).send({ data:{success:false, details:"", message:message}, errorNode:{errorCode:1, errorMsg:message}});
	}
};


exports.emailLogin = async function(req, res, next) {
	const { email, password } = req.body.data;
	if(email=='' || email==undefined){
		return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Please provied email"}});
	} else if(password=='' || password==undefined) {
		return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Please provied password"}});
	} else {
		models.customers.findOne({
			attributes:['id', 'storeId', 'firstName', 'lastName', 'email', 'mobile', 'image', 'status','otp','password'], 
			where: {
				email:email,
			},include:[{
				model:models.stores,
				attributes:['cCode','company'],
				required:false,
			}]
		}).then(function (customers) {
			if(customers!=null){
				let user = customers.toJSON();
				// if(otp!=customers.otp) {
				if (bcrypt.compareSync(password, customers.password)) {
					if (email == customers.email) {
						delete user.otp;
						user['oldNew']='';
						if(customers.email=='' || customers.email==null){
							user.oldNew='newUser'
						} else {
							var token = jwt.sign({customers}, SECRET, { expiresIn: 18000 });
							user['token']='';
							user.token=token;
						}
						user.image = (user.image!='' && user.image!=null) ? user.store.website + user.image :'';
						user.logoWebsite = user.store.website + user.store.logoWebsite;
						user.cCode =user.store.cCode;
						user.company =user.store.company;
						
						return res.status(200).send({ data:{success:true, details:user}, errorNode:{errorCode:0, errorMsg:"No Error"}});
					} else {
						return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No user found11"}});
					}
				}else {
					return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"password wrong"}});
					
				}
			} else {
				return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No user found22"}});
			}
		}).catch(function(error) {
			return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
		});
	}
};
