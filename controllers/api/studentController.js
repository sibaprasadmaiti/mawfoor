var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
var flash = require('connect-flash');
var config = require("../../config/config.json");
const emailConfig = require('../../config/email-config')();
const mailgun = require("mailgun-js")(emailConfig);
const nodemailer = require('nodemailer')
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
* Description:  customer Registration
* @param req
* @param res user details with jwt token
* Developer:Partha 
**/

exports.login = async function(req,res,next){
	const{storeId,email,password} = req.body.data;
	var studentDetailsArr = [];

	if(storeId && storeId !='' && email && email !='' && password && password !='' ){

		var studentDetails = await  models.student.findAll({where:{storeId:storeId, email:email}});
		if(studentDetails.length>0){

			if (bcrypt.compareSync(password, studentDetails[0].password)) {
				if(studentDetails[0].image!='' && studentDetails[0].image!='' && studentDetails[0].image!=null){
					var studentImage = req.app.locals.baseurl+'admin/student/'+studentDetails[0].id+'/'+studentDetails[0].image;
				} else {
					var studentImage = req.app.locals.baseurl+'admin/student/user.png';
				}

				studentDetailsArr.push({
					"id":studentDetails[0].id,
					"storeId":studentDetails[0].storeId,
					"name":studentDetails[0].name,
					"email":studentDetails[0].email,
					"mobile":studentDetails[0].mobile,
					"image":studentImage,
					"rememberToken":studentDetails[0].rememberToken,
				});

				return res.status(200).send({ data:{success:true, message:"Login Successfull", studentDetails:studentDetailsArr[0]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			} else {
				return res.status(200).send({ data:{success:false, details:"", message:'Password Worng! Please try again.'}, errorNode:{errorCode:1, errorMsg:"Password Worng! Please try again."}});
			}

		} else {
			return res.status(200).send({ data:{success:false, details:"", message:'No Student Found'}, errorNode:{errorCode:1, errorMsg:"No Student Found"}});
		}
		
	} else {
		console.log("rrrrrrrrrrrr----");
		var message ='';
		if(storeId=='' || storeId==undefined){
			message +='Please provied Client id \n';
		}
		if(email=='' || email==undefined){
			message +='Please provied email \n';
		}
		if(password=='' || password==undefined){
			message +='Please provied password \n';
		}
		return res.status(200).send({ data:{success:false, details:"", message:message}, errorNode:{errorCode:1, errorMsg:message}});
	}
};

// exports.registration = async function(req,res,next){
// 	const{storeId,name,email,mobile,password,confirmPassword,image,imageExt} = req.body.data;
	
// 	if(storeId && storeId !='' && name && name !='' && email && email !='' && mobile && mobile !='' && password && password !=''&& confirmPassword && confirmPassword !='' ){
// 		// if(name && name !='' ){
// 		// 	if( email && email !='' ){
// 		// 		if( mobile && mobile !=''){
// 		// 			if(password && password !='' && confirmPassword && confirmPassword !='' ){
// 		console.log("eeeeeeeeeeeee----");

// 		if(password == confirmPassword){

// 			var emailVerification = await  models.student.findAll({attributes:['id','email'],where:{storeId:storeId, email:email}});
// 			if(emailVerification.length>0){
// 				console.log("hhhhhhhhhhhhh----"+emailVerification.length);
// 				return res.status(200).send({ data:{success:false, details:"", message:'Email Id Already Exists'}, errorNode:{errorCode:1, errorMsg:"Email Id Already Exists"}});
// 			} else {
// 				var mobileVerification = await  models.student.findAll({attributes:['id','mobile'],where:{storeId:storeId, mobile:mobile}});
// 					if(mobileVerification.length>0){
// 						console.log("jjjjjjjjjjjjjjj----"+mobileVerification.length);
// 						return res.status(200).send({ data:{success:false, details:"", message:'Mobile No Already Exists'}, errorNode:{errorCode:1, errorMsg:"Mobile No Already Exists"}});
// 					} else {
// 						// var rememberToken = Buffer.from(Date.now()).toString('base64');
// 						models.student.create({
// 							storeId	 : storeId,
// 							name: name,
// 							email : email,
// 							mobile	 : mobile,
// 							password   : bcrypt.hashSync(password),
// 							// rememberToken	: rememberToken,
// 							status	 :'active'			
// 						}).then(async function(student){

// 							var dir = './public/admin/student/'+student.id; 
// 							console.log(dir);
// 							if (!fs.existsSync(dir)){
// 								fs.mkdirSync(dir);                  
// 							}
// 							if(image && image != '' && imageExt && imageExt !='') {
// 								var imageTitle = Date.now();
// 								var path = './public/admin/student/'+ student.id +'/'+imageTitle+'.'+imageExt;
// 								var studentImage =imageTitle+'.'+imageExt;   
// 								try {
// 									const imgdata = image;
// 									const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
// 									fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
// 									models.student.update({
// 									  image : studentImage,
// 									},{ where: { id: student.id } });      
// 								} catch (e) {
// 									next(e);
// 								}
// 							}

// 							var studentDetails = await models.student.findOne({attributes:['createdAt'],where:{storeId:storeId, id:student.id}});	
// 							var rememberToken = Buffer.from(studentDetails.createdAt).toString('base64');
// 							models.student.update({
// 								rememberToken	 : rememberToken,		
// 							},{where:{storeId:storeId,id:student.id}})

// 							return res.status(200).send({ data:{success:true, message:"Registration Successfull"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
							

// 						});
// 					}
// 			}

// 		} else {
// 			return res.status(200).send({ data:{success:false, details:"", message:"passeord and confirm password dose not match"}, errorNode:{errorCode:1, errorMsg:''}});
// 		}
		
// 	} else {
// 		console.log("rrrrrrrrrrrr----");
// 		var message ='';
// 		if(storeId=='' || storeId==undefined){
// 			message +='Please provied Client id \n';
// 		}
// 		if(name=='' || name==undefined){
// 			message +='Please provied name \n';
// 		}
// 		if(email=='' || email==undefined){
// 			message +='Please provied email \n';
// 		}
// 		if(mobile=='' || mobile==undefined){
// 			message +='Please provied mobile \n';
// 		}
// 		if(password=='' || password==undefined){
// 			message +='Please provied password \n';
// 		}
// 		if(confirmPassword=='' || confirmPassword==undefined){
// 			message +='Please provied confirm password \n';
// 		}
// 		return res.status(200).send({ data:{success:false, details:"", message:message}, errorNode:{errorCode:1, errorMsg:message}});
// 	}
// };

exports.registration = async function(req,res,next){
	const{storeId,name,email,mobile,password,confirmPassword,image,imageExt} = req.body.data;
	
	if(storeId && storeId !='' && name && name !='' && email && email !='' && mobile && mobile !='' && password && password !=''&& confirmPassword && confirmPassword !='' ){
		// if(name && name !='' ){
		// 	if( email && email !='' ){
		// 		if( mobile && mobile !=''){
		// 			if(password && password !='' && confirmPassword && confirmPassword !='' ){
		console.log("eeeeeeeeeeeee----");

		if(password == confirmPassword){

			var emailVerification = await  models.student.findAll({attributes:['id','email'],where:{storeId:storeId, email:email}});
			if(emailVerification.length>0){

				console.log("hhhhhhhhhhhhh----"+emailVerification.length);
				return res.status(200).send({ data:{success:false, details:{id: emailVerification[0].id}, message:'Email Id Already Exists'}, errorNode:{errorCode:1, errorMsg:"Email Id Already Exists"}});
			} else {
				var mobileVerification = await  models.student.findAll({attributes:['id','mobile'],where:{storeId:storeId, mobile:mobile}});
					if(mobileVerification.length>0){
						console.log("jjjjjjjjjjjjjjj----"+mobileVerification.length);
						return res.status(200).send({ data:{success:false, details:{id: mobileVerification[0].id}, message:'Mobile No Already Exists'}, errorNode:{errorCode:1, errorMsg:"Mobile No Already Exists"}});
					} else {
						// var rememberToken = Buffer.from(Date.now()).toString('base64');
						models.student.create({
							storeId	 : storeId,
							name: name,
							email : email,
							mobile	 : mobile,
							password   : bcrypt.hashSync(password),
							// rememberToken	: rememberToken,
							status	 :'active'			
						}).then(async function(student){

							var dir = './public/admin/student/'+student.id; 
							console.log(dir);
							if (!fs.existsSync(dir)){
								fs.mkdirSync(dir);                  
							}
							if(image && image != '' && imageExt && imageExt !='') {
								var imageTitle = Date.now();
								var path = './public/admin/student/'+ student.id +'/'+imageTitle+'.'+imageExt;
								var studentImage =imageTitle+'.'+imageExt;   
								try {
									const imgdata = image;
									const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
									fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
									models.student.update({
									  image : studentImage,
									},{ where: { id: student.id } });      
								} catch (e) {
									next(e);
								}
							}

							var studentDetails = await models.student.findOne({attributes:['createdAt'],where:{storeId:storeId, id:student.id}});	
							var rememberToken = Buffer.from(studentDetails.createdAt).toString('base64');
							models.student.update({
								rememberToken	 : rememberToken,		
							},{where:{storeId:storeId,id:student.id}})

							return res.status(200).send({ data:{success:true, details: student, message:"Registration Successfull"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
							

						});
					}
			}

		} else {
			return res.status(200).send({ data:{success:false, details:"", message:"passeord and confirm password dose not match"}, errorNode:{errorCode:1, errorMsg:''}});
		}
		
	} else {
		console.log("rrrrrrrrrrrr----");
		var message ='';
		if(storeId=='' || storeId==undefined){
			message +='Please provied Client id \n';
		}
		if(name=='' || name==undefined){
			message +='Please provied name \n';
		}
		if(email=='' || email==undefined){
			message +='Please provied email \n';
		}
		if(mobile=='' || mobile==undefined){
			message +='Please provied mobile \n';
		}
		if(password=='' || password==undefined){
			message +='Please provied password \n';
		}
		if(confirmPassword=='' || confirmPassword==undefined){
			message +='Please provied confirm password \n';
		}
		return res.status(200).send({ data:{success:false, details:"", message:message}, errorNode:{errorCode:1, errorMsg:message}});
	}
};

exports.getACallbackSubmit = async function(req, res, next) {
    var storeId = req.body.data.storeId;
    var name = req.body.data.name;
    var email = req.body.data.email;
    var mobile = req.body.data.mobile;
    
    if(storeId && storeId != ''){
        if(name && name != ''){
            if(email && email != ''){
                if(mobile && mobile != ''){
					models.getACallback.create({
						storeId:storeId,
						name:name,
						email:email,
						mobile:mobile,
					}).then(async function(data) {
						const storeDetails = await models.stores.findOne({attributes:['email','storeName'], where:{id: storeId}})
						let storeName = ""
						let storeEmail = ""
						if(storeDetails){
							storeName = (storeDetails && storeDetails.storeName) ? storeDetails.storeName : ""
							storeEmail = (storeDetails && storeDetails.email) ? storeDetails.email : ""
						}
						let mailOptions = {
							from: 'bluehorsetest@gmail.com',
							to: storeEmail,
							subject: `Callback Request from ${storeName}`,
							html: `<!DOCTYPE html>
								<html lang="en">
									<head>
										<meta charset="UTF-8">
										<meta http-equiv="X-UA-Compatible" content="IE=edge">
										<meta name="viewport" content="width=device-width, initial-scale=1.0">
										<link rel="preconnect" href="https://fonts.googleapis.com">
										<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
										<link href="https://fonts.googleapis.com/css2?family=STIX+Two+Text:ital@1&display=swap" rel="stylesheet">
									</head>
									<body style="background-color: rgb(229, 250, 249); font-family: 'STIX Two Text', serif;"> 
										<p>Dear Admin,</p>
										<p>You have received a request to contact a person, details of the person are following</p>
										<p>Name : ${name}</p>
										<p>Email : ${email}</p>
										<p>Mobile : ${mobile}</p>
									</body>
								</html>`
						};
						mailgun.messages().send(mailOptions, function (error, body) {
							console.log(body);
						});
						if(data) {
							res.status(200).send({ data:{success : true, message: "Thank you for contact us. We will get back to you soon." },errorNode:{errorCode:0, errorMsg:"No Error"}});
						} else {
							res.status(200).send({ data:{success : false, message: "Something wrong! Please try again"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
						}
						
					}).catch(function() {
						res.status(200).send({ data:{success : false, message: "Something wrong! Please try again"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
					});
                }else{
                    res.status(200).send({ data:{success : false, message: "Mobile no is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
                }
            }else{
                res.status(200).send({ data:{success : false, message: "Email id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
            }
        }else{
            res.status(200).send({ data:{success : false, message: "Name is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
        }
    }else{
        res.status(200).send({ data:{success : false, message: "Client id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
    }
}

exports.getACallbackDetails = async(req, res) => {
    var storeId = req.body.data.storeId || "";
    
    if(storeId && storeId != ''){
    	const callbackDetails = await models.getACallback.findAll({attributes:['id','name','email','mobile','createdAt'], where:{storeId:storeId}, order:[['id','DESC']]})

		if (callbackDetails.length > 0) {
			res.status(200).send({ data:{success : true, details: callbackDetails} ,errorNode:{errorCode:0, errorMsg:"No Error"}});
		} else {
			res.status(200).send({ data:{success : true, details: []} ,errorNode:{errorCode:0, errorMsg:"No Data Found"}});
		}
    }else{
        res.status(400).send({ data:{success : false, message: "StoreId is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
    }
}