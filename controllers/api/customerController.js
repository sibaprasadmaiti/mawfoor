var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
var flash = require('connect-flash');
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

/**
* Description:  customer Add &Edit
* @param req
* @param res user details with jwt token
* Developer:Avijit Das
**/
exports.customerAddEdit = async function(req,res,next){
	const{storeId,id,firstName,lastName,email,mobile,dob,gender} = req.body.data;
	if(storeId && storeId!='' && firstName && firstName!='' && email && email!='' && mobile && mobile!=''){
		if(!id){
			var customerCount = await models.customers.findAll({attributes:['id'],where:{storeId:storeId,$or:{mobile:mobile, email:email}}});		
			if(customerCount.length>0){
				return res.status(200).send({ data:{success:false, message:'MobileNo or EmailId already Exists'}, errorNode:{errorCode:1, errorMsg:"Error"}});
			} else {
				models.customers.create({
					storeId	 : storeId,
					firstName: firstName,
					lastName : lastName,
					email	 : email,
					mobile   : mobile,
					dob		 : dob,
					gender	 : gender,
                    status   : 'Yes'			
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
		}else{
			var customerCount = await models.customers.findAll({attributes:['id'],where:{storeId:storeId,$or:{mobile:mobile, email:email},id:{$ne:id}}});            
			if(customerCount.length>0){
				return res.status(200).send({ data:{success:false, details:"", message:'MobileNo or EmailId already Exists'}, errorNode:{errorCode:1, errorMsg:"Error"}});
			}else{
				models.customers.update({
					storeId	 : storeId,
					firstName: firstName,
					lastName : lastName,
					email	 : email,
					mobile   : mobile,
					dob		 : dob,
					gender	 : gender			
				},{where:{storeId:storeId,id:id}}).then(async function(data){
                    models.customers.findAll({ attributes:['id','storeId','firstName','lastName','email','mobile','gender','image','status'], where: {storeId:storeId,id:id} 
                        }).then(function (customers) {
                            const list = customers.map(customer=>{
                                return Object.assign(
                                    {},
                                    {
                                        id:customer.id,
                                        storeId:customer.storeId,
                                        firstName:customer.firstName,
                                        lastName:customer.lastName,
                                        email:customer.email,
                                        mobile:customer.mobile,
                                        password:customer.password,
                                        image:customer.image,
                                        dob:customer.dob,
                                        doa:customer.doa,
                                        status:customer.status,
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
                        
					/*if(customers){
						return res.status(200).send({ data:{success:true, details:customers}, errorNode:{errorCode:0, errorMsg:"No Error"}});
					}else{
						return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}});
					}*/
				}).catch(function(error){
					return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
				})
			}
		}
	}
};




/**
* Description:  customer Details Id wise
* @param req
* @param res user details with jwt token
* Developer:Surajit 
**/
exports.customerDetails = async function(req,res){
	const { storeId, customerId } = req.body.data;

	if(storeId && storeId !='' && customerId && customerId !=''){

		models.customers.findAll({ attributes:['id','storeId','firstName','lastName','email','mobile','password','image','dob','doa','gender'], where: {storeId:storeId,id:customerId} 
		}).then(function (customers) {
			const list = customers.map(customer=>{
				return Object.assign(
					{},
					{
						id:customer.id,
						storeId:customer.storeId,
						firstName:customer.firstName,
						lastName:customer.lastName,
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




/**
 * Description: This function is developed for Add & Edit customer Address
 * @param req
 * @param res user details with jwt token
 * Developer: Surajit
 */
 exports.addEditCustomerAddress = async function(req,res){
    var storeId = req.body.data.storeId;
    var customerId = req.body.data.customerId;
    var addressId = req.body.data.addressId;
    var name = req.body.data.name;
    var mobile = req.body.data.mobile;
    var address = req.body.data.address;
    var locality = req.body.data.locality;
    var city = req.body.data.city;
    var state = req.body.data.state;
	var pinCode = req.body.data.pincode;
    var addressType = req.body.data.addressType;
    var id = req.body.data.id;
    var country = req.body.data.country;
    
    if(customerId && customerId != '' && name && name != '' && mobile && mobile != ''){
        if(!id){
            var customerCheck = await models.customers.findOne({where:{id:customerId}});
            var addressCheck = await models.customerAddresses.findAll({where:{customerId:customerId, isPrimary: 'yes'}});
            if(customerCheck){
                if (addressCheck.length>0) {
                    models.customerAddresses.create({
                        storeId   :storeId,
                        customerId: customerId,
                        isPrimary : 'no',
                        fullName  : name,
                        mobile    : mobile,
                        address   : address,
                        locality  : locality,
                        city      : city,
                        state     : state,
                        pin       : pinCode,
                        country   :country,
                        addressType: addressType
                    
                    }).then(async function(addAddress){
                        if(addAddress){
                            return res.status(200).send({ data:{success:true, addressData:addAddress, message:'Address added successfully'}, errorNode:{errorCode:0, errorMsg:" No Error"}});
                        } else {
                            return res.status(200).send({ data:{success:false, message:'Something went wrong'}, errorNode:{errorCode:1, errorMsg:"Error"}}); 
                        }
                    }).catch(function(error) {
                        return res.status(200).send({ data:{success:false}, errorNode:{errorCode:1, errorMsg:error}});
                    })
                } else {
                    models.customerAddresses.create({
                        storeId   :storeId,
                        customerId: customerId,
                        isPrimary : 'yes',
                        fullName  : name,
                        mobile    : mobile,
                        address   : address,
                        locality  : locality,
                        city      : city,
                        state     : state,
                        pin       : pinCode,
                        country   :country,
                        addressType: addressType
                    
                    }).then(async function(addAddress){
                        if(addAddress){
                            return res.status(200).send({ data:{success:true, addressData:addAddress, message:'Address added successfully'}, errorNode:{errorCode:0, errorMsg:" No Error"}});
                        } else {
                            return res.status(200).send({ data:{success:false, message:'Something went wrong'}, errorNode:{errorCode:1, errorMsg:"Error"}}); 
                        }
                    }).catch(function(error) {
                        return res.status(200).send({ data:{success:false}, errorNode:{errorCode:1, errorMsg:error}});
                    });
                }   
                
            } else {
                return res.status(200).send({ data:{success:false, message:'Customer Id not found!'}, errorNode:{errorCode:1, errorMsg:"Error"}});
            } 
        } else {
            var customerAddressIdCheck = await models.customerAddresses.findOne({where:{id:id}});
            if(customerAddressIdCheck){
                await models.customerAddresses.update({
                    fullName  : name,
                    mobile    : mobile,
                    locality  : locality,
                    address   : address,
                    city      : city,
                    state     : state,
                    pin       : pinCode,
                    addressType:addressType

                },{where:{id:id}}).then(async function(updateAddress){
                    if(updateAddress){
                        return res.status(200).send({ data:{success:true, editAddress:updateAddress, message:"Address update successfully"}, errorNode:{errorCode:0, errorMsg:'No Error'}});
                    } else {
                        return res.status(200).send({ data:{success:false, message:"Something went wrong"}, errorNode:{errorCode:1, errorMsg:'Error'}});
                    }
                }).catch(function(error) {
                    return res.status(200).send({ data:{success:false}, errorNode:{errorCode:1, errorMsg:"Error"}});
                });
            } else {
                return res.status(200).send({ data:{success:false, message:"Id not found"}, errorNode:{errorCode:1, errorMsg:"Error"}}); 
            }

        }         
    } else {
        return res.status(200).send({ data:{success:false, message:'All fields required!'}, errorNode:{errorCode:1, errorMsg:"Error"}});
    }
}


/**
 * Description: This function is developed for customer Address List
 * @param req
 * @param res user details with jwt token
 * Developer: Surajit
 */
//  exports.customeraddressList = async function(req,res) {
//     //const { storeId,customerId } = req.body.data;
//     var storeId = req.body.data.storeId;
//     var customerId = req.body.data.customerId;
//     if(storeId && storeId!='' && customerId && customerId != ''){
//         var customerCheck = await models.customers.findOne({where:{id:customerId}});
//         //console.log(customerCheck); return false;
//         if(customerCheck){
//           var list=  await models.customerAddresses.findAll({
//                 attributes:['id','storeId','customerId','isPrimary','fullName','mobile','address','locality','city','state','pin','country','addressType'],
//                 where:{
//                     customerId:customerId,
//                     storeId:storeId,
//                 },
//                 order: [
//                     ['id', 'ASC']
//                 ]
//             })
           
//                 if(list.length>0){
//                     return res.status(200).send({ data:{success:true, list:list}, errorNode:{errorCode:0, errorMsg:"No Error"}});
//                 } else {
//                     return res.status(200).send({ data:{success:false, list:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
//                 }
        
//         } else {
//             return res.status(200).send({ data:{success:false, message:"Customer Id not found"}, errorNode:{errorCode:1, errorMsg:error}});
//         }
//     } else {
//         return res.status(200).send({ data:{success:false, message:"All Fields are require!"}, errorNode:{errorCode:1, errorMsg:error}});
//     }
// }

exports.customeraddressList = async function(req,res) {
    //const { storeId,customerId } = req.body.data;
    var storeId = req.body.data.storeId;
    var customerId = req.body.data.customerId;
    var type = req.body.data.type;
    if(storeId && storeId!='' && customerId && customerId != ''){
        var customerCheck = await models.customers.findOne({where:{id:customerId}});
        //console.log(customerCheck); return false;
        if(customerCheck){
        //   var list=  await models.customerAddresses.findAll({
        //         attributes:['id','storeId','customerId','isPrimary','fullName','mobile','address','locality','city','state','pin','country','addressType'],
        //         where:{
        //             customerId:customerId,
        //             storeId:storeId,
        //             // isPrimary:type,
        //         },
        //         order: [
        //             ['id', 'ASC']
        //         ]
        //     })

        let list 
        if(type == 'yes'){
            list=  await models.customerAddresses.findAll({
                attributes:['id','storeId','customerId','isPrimary','fullName','mobile','address','locality','city','state','pin','country','addressType'],
                where:{
                    customerId:customerId,
                    storeId:storeId,
                    isPrimary:'yes',
                },
                order: [
                    ['id', 'ASC']
                ]
            })
        }else{
            list=  await models.customerAddresses.findAll({
                attributes:['id','storeId','customerId','isPrimary','fullName','mobile','address','locality','city','state','pin','country','addressType'],
                where:{
                    customerId:customerId,
                    storeId:storeId,
                },
                order: [
                    ['id', 'ASC']
                ]
            })
        }
           
            if(list.length>0){
                return res.status(200).send({ data:{success:true, list:list}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            } else {
                return res.status(200).send({ data:{success:false, list:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }
        
        } else {
            return res.status(200).send({ data:{success:false, message:"Customer Id not found"}, errorNode:{errorCode:1, errorMsg:error}});
        }
    } else {
        return res.status(200).send({ data:{success:false, message:"All Fields are require!"}, errorNode:{errorCode:1, errorMsg:error}});
    }
}


/**
 * Description: This function is developed for delete customer Address
 * @param req
 * @param res user details with jwt token
 * Developer: Surajit
 */
exports.appCustomerAddressDelete = function (req, res, next) {
    var Id = req.body.data.id;
    var storeId = req.body.data.storeId;
    if (Id && Id == "" && storeId && storeId=="") {
        return res.status(200).send({ status: 200, success: false, message: "Id not found" });
    }else{
        models.customerAddresses.destroy({
          where: { id: Id,storeId:storeId }
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

/**
 * Description: This function is developed for customer Address Prime
 * @param req
 * @param res user details with jwt token
 * Developer: Surajit
 */
exports.customerAddressPrime = function (req, res, next) {
    var storeId = req.body.data.storeId;
    var customerId = req.body.data.customerId ? req.body.data.customerId : "";
    var customerAddressId = req.body.data.customerAddressId? req.body.data.customerAddressId: "";
  
    if (!customerId && customerId == "") {
      return res.status(200).send({ status: 200, success: false, message: "Customer Id not found" });
    } else {
      if (!customerAddressId && customerAddressId == "") {
        return res.status(200).send({status: 200, success: false, message: "Customer Address Id not found",});
      } else {
       var existingItem = models.customerAddresses.findOne({ where: { id: customerAddressId } });
        existingItem.then(function (value) {
          if (!value) {
            return res.status(200).send({ data:{success:true, message: "Customer Address not found",}, errorNode:{errorCode:0, errorMsg:error}});
          } else {
            models.customerAddresses.update( {isPrimary: 'no', }, { where: { customerId: customerId } })
              .then(function (customer) {
                if (!customer || customer == 0) {
                  return res.status(200).send({ data:{success:false, message: "Customer not found",}, errorNode:{errorCode:0, errorMsg:error}});
                } else {
                  models.customerAddresses.update( {isPrimary: 'yes', },{ where: { id: customerAddressId } })
                    .then(function (customer_address) {
                      return res.status(200).send({ data:{success:true, message: "success", customerdetail: customer,}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                    })
                    .catch(function (error) {
                        return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
                    });
                }
              })
              .catch(function (error) {
                return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
              });
          }
        });
      }
    }
};


exports.customerPushTokenUpdate= async function (req, res, next) {

    var storeId = req.body.data.storeId;
    var customerId = req.body.data.customerId;
    var token = req.body.data.token;
  
    if(storeId && storeId != '') {
      if(customerId && customerId != '') {
        if(token && token != '') {
  
          models.customers.update({ 
            pushToken: token,
            updatedBy: customerId
          },{where:{id: customerId, storeId:storeId}}).then(function(val) {
  
            return res.status(200).send({ data:{success:true, message:"Your token successfully updated"}, errorNode:{errorCode:0, errorMsg:''}});
          });
  
        } else {
          return res.status(200).send({ data:{success:false,message:'Token is required'}, errorNode:{errorCode:1, errorMsg:''}});
        }
      } else {
        return res.status(200).send({ data:{success:false,message:'Customer Id is required'}, errorNode:{errorCode:1, errorMsg:''}});
      }
    } else {
      return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
};


exports.customerHomeAddress = async function(req,res) {
    var storeId = req.body.data.storeId;
    var customerId = req.body.data.customerId;

    if(storeId && storeId!='' && customerId && customerId != ''){
        var customerCheck = await models.customers.findOne({where:{id:customerId}});
        if(customerCheck){
            list=  await models.customerAddresses.findAll({
                attributes:['id','storeId','customerId','isPrimary','fullName','mobile','address','locality','city','state','pin','country','addressType'],
                where:{
                    customerId:customerId,
                    storeId:storeId,
                    isPrimary:'yes',
                    addressType:'Home',
                }
            })
           
            if(list.length>0){
                return res.status(200).send({ data:{success:true, list:list[0], message:"Default home address found"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            } else {

                homeList=  await models.customerAddresses.findAll({
                    attributes:['id','storeId','customerId','isPrimary','fullName','mobile','address','locality','city','state','pin','country','addressType'],
                    where:{
                        customerId:customerId,
                        storeId:storeId,
                        addressType:'Home',
                    }
                })
                if(homeList.length>0){
                    return res.status(200).send({ data:{success:true, list:homeList[0], message:"Home address found"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                } else {
                    return res.status(200).send({ data:{success:false, list:"", message:"No address found"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                }
            }
        
        } else {
            return res.status(200).send({ data:{success:false, message:"Customer not found"}, errorNode:{errorCode:1, errorMsg:error}});
        }
    } else {
        return res.status(200).send({ data:{success:false, message:"Store and Customer id is require!"}, errorNode:{errorCode:1, errorMsg:error}});
    }
}

