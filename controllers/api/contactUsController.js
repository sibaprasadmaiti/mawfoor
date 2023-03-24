var models = require("../../models");
var config = require("../../config/config.json");
var jwt = require("jsonwebtoken");
var SECRET = "nodescratch";

/**
 * This function saves the data comming from the contact us form in frontend
 */
exports.save = async function(req, res, next) {
    var storeId = req.body.data.storeId;
    var firstName = req.body.data.firstName;
    // var lastName = req.body.data.lastName;
    var email = req.body.data.email;
    var contactNo = req.body.data.contactNo;
    var message = req.body.data.message;
    
    if(storeId && storeId != ''){
        models.contactUs.create({
            storeId:storeId,
            firstName:firstName,
            lastName:'',
            email:email,
            contactNo:contactNo,
            message:message
        }).then(function(data) {

            if(data) {
                res.status(200).send({ data:{success : true, message: "Thank you for contact us. We will get back to you soon." },errorNode:{errorCode:0, errorMsg:"No Error"}});
            } else {
                res.status(200).send({ data:{success : false, message: "Something wrong! Please try again"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
            }
            
        }).catch(function() {
            res.status(200).send({ data:{success : false, message: "Something wrong! Please try again"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
        });
    }else{
        res.status(200).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
    }
}





/**
 * This function returns addtional data for contact us page
 */
// exports.getContactusAdditionalInfo = async function(req, res, next) {

//     var site_settings = await models.site_settings.findAll({attributes:['email', 'mobile_no', 'address', 'latitude', 'longitude','contact_us_content']});
//     if(site_settings.length > 0) {
//         return res.status(200).send({
//             success: true,
//             site_settings: site_settings[0]
//         });
//     } else {
//         return res.status(200).send({
//             success: false,
//             message: "No additional information is available"
//         });
//     }
// }

exports.getContactusAdditionalInfo = async function(req, res, next) {
    var storeId = req.body.data.storeId;
    if(storeId && storeId !='' && storeId !=null){
        var sitesettings = await models.siteSettings.findAll({attributes:['email', 'mobileNo', 'address', 'latitude', 'longitude'], where:{storeId : storeId}});
        if(sitesettings.length > 0) {
            res.status(200).send({ data:{success : true, sitesettings: sitesettings[0] },errorNode:{errorCode:0, errorMsg:"No Error"}});
        } else {
            res.status(200).send({ data:{success : false, message: "No additional information is available"},errorNode:{errorCode:0, errorMsg:"No Error"}});
        }
    } else {
        res.status(200).send({ data:{success : false, message: "StoreId is required"},errorNode:{errorCode:1, errorMsg:"No Error"}});
    }
   
        
}