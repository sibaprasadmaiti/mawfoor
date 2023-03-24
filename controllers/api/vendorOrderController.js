var models = require("../../models");
var config = require("../../config/config.json");
var fs = require('file-system');
var Sequelize = require("sequelize");
const Op = Sequelize.Op
var sequelize = new Sequelize(
config.development.database, 
config.development.username,
config.development.password, {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});

var fs = require('fs')
var fs = require('file-system');


exports.customerList= async function (req, res, next) {

  var storeId = req.body.data.storeId;

  if(storeId && storeId != '') {
    var customersList = await models.customers.findAll({ attributes: ['id', 'prefix', 'firstName', 'middleName', 'lastName', 'fullName'], where: {status: 'Yes', storeId:storeId}});
    // console.log(order);
    if(customersList.length>0 ){
      return res.status(200).send({ data:{success:true, customersList: customersList, message:"Customer found"}, errorNode:{errorCode:0, errorMsg:""}});
    } else{
      return res.status(200).send({ data:{success:false,customersList: [], message:"Customer not found"}, errorNode:{errorCode:0, errorMsg:''}});
    } 
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};



exports.customerAddressList= async function (req, res, next) {

  var storeId = req.body.data.storeId;
  var customerId = req.body.data.customerId;

  if(storeId && storeId != '') {
      if(customerId && customerId != '') {
      var customersList = await models.customers.findAll({ attributes: ['id', 'fullName'], where: {id: customerId, storeId:storeId}});
      // console.log(order);
      if(customersList.length>0 ){
        var customerAddressList = await models.customerAddresses.findAll({ attributes: ['id', 'isPrimary', 'prefix', 'firstName', 'middleName', 'lastName', 'fullName', 'mobile', 'addressType', 'address', 'locality', 'city', 'state', 'pin'], where: {customerId: customerId, storeId:storeId}});
        if(customersList.length>0 ){
          return res.status(200).send({ data:{success:true, customerAddressList: customerAddressList, message:"Customer address found"}, errorNode:{errorCode:0, errorMsg:""}});
        } else {
          return res.status(200).send({ data:{success:false,customerAddressList: [], message:"Customer address not found"}, errorNode:{errorCode:0, errorMsg:''}});
        }
      } else{
        return res.status(200).send({ data:{success:false,customersList: [], message:"Customer not found"}, errorNode:{errorCode:0, errorMsg:''}});
      } 
    } else {
      return res.status(200).send({ data:{success:false,message:'Customer id is required'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};

// exports.productList= async function (req, res, next) {

//   var storeId = req.body.data.storeId;
//   var searchData = req.body.data.searchData;

//   if(storeId && storeId != '') {
//     if(searchData && searchData != '') {
//       var productList = await models.products.findAll({ attributes: ['id', 'sku', 'title', 'slug', 'price'], where: {status: 'active', storeId:storeId, isConfigurable : 0, title: { $like: '%' + searchData + '%' }}});
//     } else {
//       var productList = await models.products.findAll({ attributes: ['id', 'sku', 'title', 'slug', 'price'], where: {status: 'active', storeId:storeId, isConfigurable : 0}});
//     }
//       // console.log(order);
//       if(productList.length>0 ){
//         return res.status(200).send({ data:{success:true, productList: productList, message:"Product found"}, errorNode:{errorCode:0, errorMsg:""}});
//       } else{
//         return res.status(200).send({ data:{success:false,productList: [], message:"Product not found"}, errorNode:{errorCode:0, errorMsg:''}});
//       } 
    
//   } else {
//     return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
//   }
// };

exports.productList= async function (req, res, next) {

  var storeId = req.body.data.storeId;
  var searchData = req.body.data.searchData;

  if(storeId && storeId != '') {
    if(searchData && searchData != '') {
      var productList = await models.products.findAll({ attributes: ['id', 'sku', 'title', 'slug', 'price','specialPrice','size','status','isConfigurable'], where: {status: 'active', storeId:storeId, isConfigurable : 0, title: { $like: '%' + searchData + '%' }}});
    } else {
      var productList = await models.products.findAll({ attributes: ['id', 'sku', 'title', 'slug', 'price','specialPrice','size','status','isConfigurable'], where: {status: 'active', storeId:storeId, isConfigurable : 0}});
    }
    const products = []
      // console.log(order);
      if(productList.length>0 ){
        for(var i = 0; i < productList.length; i++)
          {

            let listProductImages = await models.productImages.findAll({attributes:['id','file'],where:{productId:productList[i].id, isPrimary: 'Yes'}});

            let list_product_images 
            if(listProductImages.length>0){
              if(listProductImages[0].file!='' && listProductImages[0].file!=null){
                list_product_images = req.app.locals.baseurl+'admin/products/image/'+productList[i].id+'/'+listProductImages[0].file;
              } else {
                list_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
              }
            } else {
              list_product_images = req.app.locals.baseurl+'admin/products/image/no_image.jpg';
            }

            products.push({
              "id":productList[i].id,
              "sku":productList[i].sku,
              "slug":productList[i].slug,
              "productName":productList[i].title,
              "price":productList[i].price,
              "specialPrice":productList[i].specialPrice,
              "size":productList[i].size,
              "status":productList[i].status,
              "image": list_product_images,
              "configurableProduct": productList[i].isConfigurable,
            });
          }
        return res.status(200).send({ data:{success:true, productList: products, message:"Product found"}, errorNode:{errorCode:0, errorMsg:""}});
      } else{
        return res.status(200).send({ data:{success:false,productList: [], message:"Product not found"}, errorNode:{errorCode:0, errorMsg:''}});
      } 
    
  } else {
    return res.status(200).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:''}});
  }
};



exports.deliveryChargeDetails= async function (req, res, next) {

  const storeId = req.body.data.storeId;
  if(storeId && storeId != '' && storeId != null && storeId != undefined) 
  {
      const shippingCharge = await models.siteSettings.findOne({ attributes: ['value'], where: { storeId: storeId,title: { [Op.like]: `%Shipping Charges%` }} });
      const freeShippingLimit = await models.siteSettings.findOne({ attributes: ['value'], where: { storeId: storeId,title: { [Op.like]: `%Free Shipping Limit%` }} });
    
      let charge = 0
      let limit = 0
      if(shippingCharge){
        if(shippingCharge.value != null && shippingCharge.value != ''){
          charge = parseInt(shippingCharge.value)
        }
      } 
      if(freeShippingLimit){
        if(freeShippingLimit.value != null && freeShippingLimit.value != ''){
          limit = parseInt(freeShippingLimit.value)
        }
      }
      let details = {shippingCharge:charge,freeShippingLimit:limit}
      if (shippingCharge != null || freeShippingLimit != null) {
        return res.status(200).send({ data:{success:true, details: details}, errorNode:{errorCode:0, errorMsg:"No Error"}});
      } else {
        return res.status(200).send({ data:{success:true, details: {shippingCharge:0,freeShippingLimit:0}}, errorNode:{errorCode:0, errorMsg:"No data found"}});
      }
    
  } else {
    return res.status(400).send({ data:{success:false,message:'Store id is required'}, errorNode:{errorCode:1, errorMsg:'Store id is required'}});
  }
};


exports.createOrder = async (req,res) => {

  const storeId = req.body.data.storeId || ''
  const customerId = req.body.data.customerId || ''
  const cusAddressId = req.body.data.cusAddressId || ''
  const discountPer = req.body.data.discountPer || null;
  const discount = req.body.data.discount || null;
  const orderItems = req.body.data.orderItems || []
  const subtotal = req.body.data.subtotal || null
  const total = req.body.data.total || null
  const deliveryCharges = req.body.data.deliverycharge || null
  const date = new Date()
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  const currentDate = day+''+month+1+''+year;

  if(customerId != null && customerId != '' && storeId != null && storeId !='' && cusAddressId != null && cusAddressId !=''){
    let shippingMethod
    if(deliveryCharges == 0){
      shippingMethod = 'Free Shipping';
      shippingAmount = null;
    }else{
      shippingMethod = 'Shipping Charge';
      shippingAmount = deliveryCharges;
    }

    // const customerCount = await models.customers.count({where:{id:customerId, storeId:storeId} }) 
    // const addressCount = await models.customerAddresses.count({where:{id:cusAddressId, storeId:storeId} }) 

    var customerIdCheck = await models.customers.findAll({attributes:['id','firstName','lastName','mobile','email'],where:{storeId:storeId,id:customerId}});

    var customerShippingAddressIdCheck = await models.customerAddresses.findAll({attributes:['id','customerId','fullName','mobile','address','locality','city','state','pin','country'],where:{id:cusAddressId} }); 

    if (customerIdCheck.length <= 0) return res.status(400).send({ data:{success:false,message:'Customer not found'}, errorNode:{errorCode:1, errorMsg:'Invalid customer id'}});

    if (customerShippingAddressIdCheck.length <= 0) return res.status(400).send({ data:{success:false,message:'Customer address not found'}, errorNode:{errorCode:1, errorMsg:'Invalid customer address id'}});

    if (orderItems.length <= 0) return res.status(400).send({ data:{success:false,message:'Please select any item'}, errorNode:{errorCode:1, errorMsg:'Order item can not be null'}});

    if(customerIdCheck.length > 0 && customerShippingAddressIdCheck.length > 0 && orderItems.length > 0){
      
      const statusValue = await models.dropdownSettingsOptions.findOne({ attributes:['optionValue'], where:{storeId:storeId, optionOrder:1}});
      let status = 'New'
      if(statusValue){
        if(statusValue.optionValue != null && statusValue.optionValue != '' && statusValue.optionValue != undefined){
          status = statusValue.optionValue
        }
      }

      await models.orders.create({
        orderStatus        : status,
        storeId            : storeId,
        shippingMethod     : shippingMethod,
        customerId         : customerId,
        amountPaid         : total,
        discountAmount     : discount,
        discountPercent    : discountPer,
        baseGrandTotal     : subtotal,
        shippingAmount     : shippingAmount,
        customerName       : customerIdCheck[0].firstName +' '+customerIdCheck[0].lastName,
        customerMobile     : customerIdCheck[0].mobile,
        customerEmail      : customerIdCheck[0].email,
        shippingAddress    : customerShippingAddressIdCheck[0].fullName+','+customerShippingAddressIdCheck[0].address+','+customerShippingAddressIdCheck[0].locality+','+customerShippingAddressIdCheck[0].city+','+customerShippingAddressIdCheck[0].state+','+customerShippingAddressIdCheck[0].pin+','+customerShippingAddressIdCheck[0].country+','+customerShippingAddressIdCheck[0].mobile,
        billingAddress     : customerShippingAddressIdCheck[0].fullName+','+customerShippingAddressIdCheck[0].address+','+customerShippingAddressIdCheck[0].locality+','+customerShippingAddressIdCheck[0].city+','+customerShippingAddressIdCheck[0].state+','+customerShippingAddressIdCheck[0].pin+','+customerShippingAddressIdCheck[0].country+','+customerShippingAddressIdCheck[0].mobile,
        shippingCity       : customerShippingAddressIdCheck[0].city,
        shippingState      : customerShippingAddressIdCheck[0].state,
        shippingPin        : customerShippingAddressIdCheck[0].pin,
        shippingCountry    : customerShippingAddressIdCheck[0].country,
        paymentMethod      : 'Cash On Delivery',
      }).then(async(order)=>{
        
        const orderId = order.id;
        const orderNo = "TEZ" + currentDate + orderId;
        await models.orders.update({
          orderNo : orderNo
        },{where:{id:orderId}})
        .then(()=>{console.log("success")}).catch((err)=>{console.error(err)})
        for(let item of orderItems){
          await models.orderItems.create({
            orderId : orderId,
            storeId :storeId,
            productId : item.id,
            qty : item.isCount,
            price : item.price,
            totalPrice : Number(item.price) * Number(item.isCount),
          }).then(()=>{console.log('Successfull')}).catch((err)=>{console.error(err)})
        } 
        return res.status(200).send({ data:{success:true, message:"Successfully order created"}, errorNode:{errorCode:0, errorMsg:""}})
      }).catch((error) => {
        console.log("111111111111---"+error)
        return res.status(500).send({ data:{success:false, message:'Something went wrong!'}, errorNode:{errorCode:1, errorMsg:error}})
      })

    } else {
      return res.status(400).send({ data:{success:false,message:'Please check before placed order'}, errorNode:{errorCode:1, errorMsg:''}});
    }
  }
}
