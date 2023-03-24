const models = require("../../models");

/**
 * This function is developed for franchise Add
 * Developer: Partha Mandal
*/
exports.franchiseeAdd = async (req, res) => {
    const storeId = req.body.data.storeId
    const name = req.body.data.name
    const email = req.body.data.email
    const contactNo = req.body.data.contactNo
    const businessType = req.body.data.businessType
    const address = req.body.data.address
    const preferredLocation = req.body.data.preferredLocation
    
    if(storeId && storeId!='' && name && name!='' && email && email!='' && contactNo && contactNo!='' && businessType && businessType!='' && address && address!='' && preferredLocation && preferredLocation!=''){
        await models.franchise.create({
            name: name,
            email: email,
            contactNo: contactNo,
            businessType: businessType,
            storeId: storeId,
            status: 'No',
            address: address,
            preferredLocation: preferredLocation
        }).then((success)=>{
            return res.status(201).send({ data:{success:true, details:"Request successfully submitted for Franchisee"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
        }).catch((error)=>{
            return res.status(503).send({ data:{success:false, details:"Something went wrong! Please try again."}, errorNode:{errorCode:1, errorMsg:"Error"}});
        })
    }else{
        return res.status(400).send({ data:{success:false, details:"Please Fill All Required Fields"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
    }
};
  