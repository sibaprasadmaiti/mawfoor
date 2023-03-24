var models = require("../../models");
var config = require("../../config/config.json");
var jwt = require("jsonwebtoken");
var SECRET = "nodescratch";
const emailConfig = require('../../config/email-config')();
const mailgun = require("mailgun-js")(emailConfig);

/**
 * This function saves the data comming from the contact us form in frontend
 */
// exports.contactUsSave = async function(req, res, next) {
//     var storeId = req.body.data.storeId;
//     var name = req.body.data.name || "";
//     var lastName = req.body.data.lastName || "";
//     var email = req.body.data.email || "";
//     var contactNo = req.body.data.contactNo || "";
//     var message = req.body.data.message || "";
    
//     if(storeId && storeId != ''){
//         models.contactUs.create({
//             storeId:storeId,
//             firstName:name,
//             lastName: lastName,
//             email:email,
//             contactNo:contactNo,
//             message:message
//         }).then(function(data) {
//             if(storeId == 37){
//                 const from = "bluehorsetest@gmail.com"
//                 let mailOptions = {
//                     from: `"iUdyog" <${from}>`,
//                     to: "agarwala.vikram@gmail.com",
//                     // to: "partha.bluerhorse@gmail.com",
//                     subject: "Contact Request",
//                     html: `<!DOCTYPE html>
//                     <html lang="en">
//                         <head>
//                             <meta charset="UTF-8">
//                             <meta http-equiv="X-UA-Compatible" content="IE=edge">
//                             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                             <link rel="preconnect" href="https://fonts.googleapis.com">
//                             <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//                             <link href="https://fonts.googleapis.com/css2?family=STIX+Two+Text:ital@1&display=swap" rel="stylesheet">
//                         </head>
//                         <body style="background-color: rgb(229, 250, 249); font-family: 'STIX Two Text', serif;"> 
//                             <p>Dear Admin,</p>
//                             <p>You have received a request to contact a person, details of the person are following</p>
//                             <p>Name : ${name} ${lastName}</p>
//                             <p>Email : ${email}</p>
//                             <p>Mobile : ${contactNo}</p>
//                             <p>Message : ${message}</p>
//                         </body>
//                     </html>`
//                 };
//                 mailgun.messages().send(mailOptions, function (error, body) {
//                     console.log(body);
//                 });
//             }
            
//             if(data) {
//                 res.status(200).send({ data:{success : true, message: "Thank you for contact us. We will get back to you soon." },errorNode:{errorCode:0, errorMsg:"No Error"}});
//             } else {
//                 res.status(200).send({ data:{success : false, message: "Something wrong! Please try again"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
//             }
            
//         }).catch(function() {
//             res.status(200).send({ data:{success : false, message: "Something wrong! Please try again"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
//         });
                    
//     }else{
//         res.status(200).send({ data:{success : false, message: "Client id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
//     }
// }

exports.contactUsSave = async function(req, res, next) {
    var storeId = req.body.data.storeId;
    var name = req.body.data.name || "";
    var lastName = req.body.data.lastName || "";
    var email = req.body.data.email || "";
    var contactNo = req.body.data.contactNo || "";
    var message = req.body.data.message || "";
    console.log("***************************************")
    console.log(req.body.data)
    console.log("***************************************")
    if(storeId && storeId != ''){
        const storeDetails = await models.stores.findOne({attributes:['email','storeName'], where:{id: storeId}})
        
        await models.contactUs.create({
            storeId:storeId,
            firstName:name,
            lastName: lastName,
            email:email,
            contactNo:contactNo,
            message:message
        }).then(async function(data) {
            let storeName = ""
            if(storeDetails){
                storeName = (storeDetails && storeDetails.storeName) ? storeDetails.storeName : ""
            }

            var siteSeGrsDetails = await models.siteSettingsGroups.findOne({ attributes: ['id', 'storeId'], where: { groupTitle: "Mail Services", storeId: storeId,  status: "Yes" } });
            if (siteSeGrsDetails) {
              var mailServiceMail = await models.siteSettings.findAll({ attributes: ['email'], where: { storeId: siteSeGrsDetails.storeId, siteSettingsGroupId: siteSeGrsDetails.id } });
              var storeData = await models.stores.findOne({ attributes: ['storeName'], where: { id: siteSeGrsDetails.storeId } });
              if (mailServiceMail.length > 0) {
                var emails = '';
                mailServiceMail.forEach(element => {
                  if (emails != '') {
                    emails += `, ${element.email}`;
                  } else {
                    emails = element.email;
                  }
                });
  
                const from = "bluehorsetest@gmail.com"
                let mailOptions = {
                    from: `"iUdyog" <${from}>`,
                    to: `${emails}`,
                    subject: `Contact Request from ${storeName}`,
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
                            <p>Name : ${name} ${lastName}</p>
                            <p>Email : ${email}</p>
                            <p>Mobile : ${contactNo}</p>
                            <p>Message : ${message}</p>
                        </body>
                    </html>`
                };
                mailgun.messages().send(mailOptions, function (error, body) {
                    console.log(body);
                });

              }
            }

          
            
            if(data) {
                res.status(200).send({ data:{success : true, message: "Thank you for contacting us..." },errorNode:{errorCode:0, errorMsg:"No Error"}});
            } else {
                res.status(200).send({ data:{success : false, message: "Something wrong! Please try again"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
            }
            
        }).catch(function() {
            res.status(200).send({ data:{success : false, message: "Something wrong! Please try again"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
        });
                    
    }else{
        res.status(200).send({ data:{success : false, message: "Client id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
    }
}

exports.subscribe = async(req, res) => {
    const storeId = req.body.data.storeId;
    const email = req.body.data.email;
    const count = await models.subscribers.count({where:{email:email,storeId:storeId}});
    if(count > 0) {
        return res.status(400).send({ data:{success:false, message: "This email address has already subscribed"}, errorNode:{errorCode:1, errorMsg:"This email address has already subscribed"}})
    } else {
        await models.subscribers.create({
            email: email,
            storeId:storeId,
        }).then(() =>{
            return res.status(200).send({ data:{success:true,  message: "Thank you for subscribing. You will get news updates from us on daily basis."}, errorNode:{errorCode:0, errorMsg:"No Error"}});                        
        }).catch(err=>{
            return res.status(500).send({ data:{success:false, message: "Something went wrong! Please try again"}, errorNode:{errorCode:1, errorMsg:err}})
        })
    }
}

exports.contactUsList = async (req, res) =>{
    const storeId =req.body.data.storeId;
    
	if(storeId && storeId != '' && storeId != null && storeId != undefined ) {

		const contactUsList = await models.contactUs.findAll({attributes:['firstName','lastName','email','contactNo','message','createdAt'], where: { storeId: storeId } })

		if(contactUsList.length > 0){
			return res.status(200).send({ data:{success:true, contactUsList:contactUsList}, errorNode:{errorCode:0, errorMsg:"No Error"}})
		} else {
			return res.status(200).send({ data:{success:true, contactUsList:[]}, errorNode:{errorCode:0, errorMsg:"No Data found"}});
		}
	} else {
		return res.status(400).send({ data:{success:false, contactUsList:[]}, errorNode:{errorCode:1, errorMsg:"Store id required"}})
	}
}