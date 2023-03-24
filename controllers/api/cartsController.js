var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
var flash = require('connect-flash');
var config = require("../../config/config.json");
var helper = require('../../helpers/helper_functions');
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
* Description: Product Item add to cart and count
* @param req
* @param res user details with jwt token
* Developer: Ramchandra Jana
**/
// exports.addToCartCount = async function(req,res) {
//   var storeId = req.body.data.storeId;
//   var customerId = req.body.data.customerId;
//   var productId = req.body.data.product_id;
//   var itemQuantity = req.body.data.item_quantity;
//   var configurableProductId = req.body.data.configurableProductId ? req.body.data.configurableProductId : null;
//   console.log("aaaaaaaaaaaaaaproductId----"+productId)
//   console.log("aaaaaaaaaaaaaaconfigurableProductId----"+configurableProductId)
  

//   if(storeId && storeId!='' &&  customerId && customerId != '' && productId && productId != '' && itemQuantity && itemQuantity != ''){
//     var cartItemAdd = await models.carts.findAll({where:{storeId : storeId, customerId:customerId, productId : productId} });

//     if(cartItemAdd.length <= 0){
//       models.carts.create({
//         storeId : storeId,
//         customerId: customerId,
//         productId: productId ,
//         itemQuantity: itemQuantity,
//         configProductId : configurableProductId,
//       }).then(async function(cart){
//         var userCartItem = await models.carts.findAll({attributes:[[Sequelize.fn('DISTINCT', Sequelize.col('productId')), 'productId']],where:{storeId : storeId, customerId:customerId } });

//         var sum = 0;
//        var productsData = await models.carts.findAll({attributes:['productId','customerId','configProductId'], where:{ storeId : storeId, customerId:customerId },
//           include: [{
//               model: models.products,
//               attributes:['id','price']
              
//           }]
//         })
//         // .then(async function (productsData) {

//           // const list = productsData.map(async data => {
//           if(productsData.length > 0){
//             for(var i = 0; i < productsData.length; i++){
//               console.log("111111111111111111----"+JSON.stringify(productsData))
//               if(productsData[i].configProductId && productsData[i].configProductId != null && productsData[i].configProductId != ''){
//                 console.log("22222222222222----"+productsData[i].configProductId)
//                 let optionValueDetails = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{id:productsData[i].configProductId, storeId:storeId}});
//                 console.log("3333333333333----"+optionValueDetails.length)
//                 if(optionValueDetails.length > 0){
//                   console.log("444444444444444444----"+optionValueDetails[0].price )
//                   if(optionValueDetails[0].price && optionValueDetails[0].price != null && optionValueDetails[0].price != ''){
//                     sum +=  Number(optionValueDetails[0].price);
//                     console.log("55555555555555----"+optionValueDetails[0].price )
//                     console.log("66666666666666666----"+sum )
//                   } else {
//                     sum +=  Number(productsData[i].product.price);
//                   }
//                 } else {
//                   sum +=  Number(productsData[i].product.price);
//                 }
//               } else {
//                 sum +=  Number(productsData[i].product.price);
//               }
//               console.log("88888888888----"+productsData.length )
//               console.log("999999999999999----"+i )
//               // sum +=  Number(data.product.price);
//               if(Number(productsData.length) == Number(i+1)){
//                 if(cart){
//                   res.status(200).send({data:{success: true, message: "Item added in the cart Successfully", cart_item_count : userCartItem.length ,total_price:sum,errorNode:{errorCode:0, errorMsg:"No Error"}}});
//                 }else {
//                   res.status(200).send({data:{success: false, message: "Something went wrong" ,errorNode:{errorCode:1, errorMsg:"Error"}}});
//                 }
//               }
//             }
//           } else {
//             if(cart){
//               res.status(200).send({data:{success: true, message: "Item added in the cart Successfully", cart_item_count : userCartItem.length ,total_price:sum,errorNode:{errorCode:0, errorMsg:"No Error"}}});
//             }else {
//               res.status(200).send({data:{success: false, message: "Something went wrong" ,errorNode:{errorCode:1, errorMsg:"Error"}}});
//             }
//           }
//           // });
//           console.log("777777777777----"+sum )
//           // if(cart){
//           //   res.status(200).send({data:{success: true, message: "Item added in the cart Successfully", cart_item_count : userCartItem.length ,total_price:sum,errorNode:{errorCode:0, errorMsg:"No Error"}}});
//           // }else {
//           //   res.status(200).send({data:{success: false, message: "Something went wrong" ,errorNode:{errorCode:1, errorMsg:"Error"}}});
//           // }
          
//         // }).catch(function(error) {
//         //   console.log("111111111111111111----"+error)
//         //   return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
//         // });

          
//       }).catch(async function (error) {
//         console.log("111111111111111111----"+error)
//         return res.send({ success: false, errorNode:{errorCode:1, errorMsg:"Error"}});
//       });
//     }else {
//       const itemcount = await models.carts.findAll({where:{storeId : storeId,customerId: customerId, productId : productId}});

//       res.status(200).send({data:{success: false, message: "This item already exists in your cart" ,cart_item_count : itemcount[0].itemQuantity, errorNode:{errorCode:0, errorMsg:"Error"}}});
    
//       /*var cartItem = await models.carts.findOne({where:{productId : productId,userId:customerId}});
//         models.carts.update({
//           userId: customerId,
//           productId: productId ,
//           itemQuantity: itemQuantity
//         },{where:{id:cartItem.id}}).then(async function(cart){
//             var userCartItem = await models.carts.findAll({attributes:[
//               [Sequelize.fn('DISTINCT', Sequelize.col('productId')), 'productId']
//             ],where:{userId:customerId}});
//             if(cart){
//               res.status(200).send({data:{success: true, message: "Item added in the cart Successfully",cart_item_count : userCartItem.length ,errorNode:{errorCode:0, errorMsg:"No Error"}}});
//             }else {
//               res.status(200).send({data:{success: false, message: "Something went wrong" ,errorNode:{errorCode:1, errorMsg:"Error"}}});
//             }
//         }).catch(async function (error) {
//           return res.send({ success: false, errorNode:{errorCode:1, errorMsg:"Error"}});
//         });*/
//     }
//   } else {
//       res.status(200).send({ data:{success: false,message: "All fileds are required!",errorNode:{errorCode:1, errorMsg:"Error"}}});
//   }
// }

function yyyy_mm_dd() {
  now = new Date();
  year = "" + now.getFullYear();
  month = "" + (now.getMonth() + 1);
  if (month.length == 1) {
    month = "0" + month;
  }
  day = "" + now.getDate();
  if (day.length == 1) {
    day = "0" + day;
  }
  hour = "" + now.getHours();
  if (hour.length == 1) {
    hour = "0" + hour;
  }
  minute = "" + now.getMinutes();
  if (minute.length == 1) {
    minute = "0" + minute;
  }
  second = "" + now.getSeconds();
  if (second.length == 1) {
    second = "0" + second;
  }
  return year + "-" + month + "-" + day;
}

exports.addToCartCount = async function(req,res) {
  var storeId = req.body.data.storeId;
  var customerId = req.body.data.customerId;
  var productId = req.body.data.product_id;
  var itemQuantity = req.body.data.item_quantity;
  var configurableProductId = req.body.data.configurableProductId ? req.body.data.configurableProductId : null;
  var wrapId = req.body.data.wrapId ? req.body.data.wrapId : null;

  var addon = req.body.data.addon ? req.body.data.addon : [];
  
  

  if(storeId && storeId!='' &&  customerId && customerId != '' && productId && productId != '' && itemQuantity && itemQuantity != ''){
    var cartItemAdd = await models.carts.findAll({where:{storeId : storeId, customerId:customerId, productId : productId} });

    if(cartItemAdd.length <= 0){

      ////////////////////////// catelog price rule start /////////////////////////////////////
      var catelogPriceCurrentDate = yyyy_mm_dd();
      var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
      if(catelogPriceRuleDetails.length>0){
        var isCatelogPriceRule = 'yes';
      } else {
        var isCatelogPriceRule = 'no';
      }
      ////////////////////////// catelog price rule end /////////////////////////////////////
      
      models.carts.create({
        storeId : storeId,
        customerId: customerId,
        productId: productId ,
        itemQuantity: itemQuantity,
        configProductId : configurableProductId,
        wrapId : wrapId,
      }).then(async function(cart){
        console.log("1111111111111111111----" );
        // ////////////// for addon product in cart add start ////////////////

        if(addon.length > 0){
          console.log("222222222222----" );
          for(var i=0; i < addon.length; i++){

            // var singleAddonCartItemAdd = await sequelize.query("SELECT id, cartId, parents_product_id, product_id, item_quantity, customer_id FROM `cart_addon`  where `customer_id` = " +customerId+ " and `parents_product_id` = " +productId+ " and `product_id` = " +addon[i],{ type: Sequelize.QueryTypes.SELECT });
            var singleAddonCartItemAdd = await models.cartAddon.findAll({attributes:['id','parentsProductId','productId'], where:{storeId : storeId, customerId:customerId, parentsProductId:productId, productId : addon[i]} });


            if (singleAddonCartItemAdd.length <= 0) {
              console.log("33333333333333333----" );
              models.cartAddon.create({
                cartId: cart.id,
                storeId: storeId,
                parentsProductId: productId,
                customerId: customerId,
                productId: addon[i],
                itemQuantity: itemQuantity
              })
            }
          }
        }
        // /////////////////////// for addon product in cart add end ////////////////
       
        var userCartItem = await models.carts.findAll({attributes:[[Sequelize.fn('DISTINCT', Sequelize.col('productId')), 'productId']],where:{storeId : storeId, customerId:customerId } });

        var sum = 0;
       var productsData = await models.carts.findAll({attributes:['productId','customerId','configProductId'], where:{ storeId : storeId, customerId:customerId },
          include: [{
              model: models.products,
              attributes:['id','price']
              
          }]
        })

          if(productsData.length > 0){

            // /////////////////////// addon product calculation start /////////////////////
            var addonSum = 0;

            var addonProductsData = await sequelize.query("SELECT cartAddon.id, cartAddon.parentsProductId, cartAddon.customerId as customerId, cartAddon.productId as productId, cartAddon.itemQuantity as itemQuantity, products.id, products.price, products.title FROM `cartAddon` LEFT JOIN `products` ON cartAddon.productId = products.id where `cartAddon`.`storeId` = " +storeId+ " and `cartAddon`.`customerId` = "+customerId,{ type: Sequelize.QueryTypes.SELECT });

            if(addonProductsData.length > 0){
              for(var i = 0; i < addonProductsData.length; i++){
                addonSum +=  Number(addonProductsData[i].price);
              }
            }
            // /////////////////////// addon product calculation end /////////////////////

              
            for(var i = 0; i < productsData.length; i++){
              console.log("111111111111111111----"+JSON.stringify(productsData))

              ////////////////////////// catelog price rule start /////////////////////////////////////

              if(isCatelogPriceRule == 'yes'){
                var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productsData[i].productId, Number(productsData[i].product.price), catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

                if(productCatalogPriceDetails.discountPrice != null){
                  var productPrice = productCatalogPriceDetails.discountPrice;
                } else {
                  var productPrice = Number(productsData[i].product.price);
                }

              } else {
                var productPrice = Number(productsData[i].product.price);
              }

              ////////////////////////// catelog price rule end /////////////////////////////////////
              
              if(productsData[i].configProductId && productsData[i].configProductId != null && productsData[i].configProductId != ''){
                
                let optionValueDetails = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{id:productsData[i].configProductId, storeId:storeId}});
                
                if(optionValueDetails.length > 0){
                  if(optionValueDetails[0].price && optionValueDetails[0].price != null && optionValueDetails[0].price != ''){

                    ////////////////////////// catelog price rule start /////////////////////////////////////

											if(isCatelogPriceRule == 'yes'){

												var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productsData[i].productId, Number(optionValueDetails[0].price), catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
							
												sum += productCatalogPriceDetails.discountPrice;
							
											} else {
												sum +=  Number(optionValueDetails[0].price);
											}

                      ////////////////////////// catelog price rule end /////////////////////////////////////
                      
                    // sum +=  Number(optionValueDetails[0].price);
                  } else {
                    sum +=  productPrice;
                  }
                } else {
                  sum +=  productPrice;
                }
              } else {
                sum +=  productPrice;
              }
              if(Number(productsData.length) == Number(i+1)){
                if(cart){
                  res.status(200).send({data:{success: true, message: "Item added in the cart Successfully", cart_item_count : userCartItem.length ,total_price:sum+addonSum, errorNode:{errorCode:0, errorMsg:"No Error"}}});
                }else {
                  res.status(200).send({data:{success: false, message: "Something went wrong" ,errorNode:{errorCode:1, errorMsg:"Error"}}});
                }
              }
            }
          } else {
            if(cart){
              res.status(200).send({data:{success: true, message: "Item added in the cart Successfully", cart_item_count : userCartItem.length ,total_price:sum,errorNode:{errorCode:0, errorMsg:"No Error"}}});
            }else {
              res.status(200).send({data:{success: false, message: "Something went wrong" ,errorNode:{errorCode:1, errorMsg:"Error"}}});
            }
          }
          console.log("777777777777----"+sum )

          
      }).catch(async function (error) {
        console.log("111111111111111111----"+error)
        return res.send({ success: false, errorNode:{errorCode:1, errorMsg:"Error"}});
      });
    }else {
      const itemcount = await models.carts.findAll({where:{storeId : storeId,customerId: customerId, productId : productId}});

      res.status(200).send({data:{success: false, message: "This item already exists in your cart" ,cart_item_count : itemcount[0].itemQuantity, errorNode:{errorCode:0, errorMsg:"Error"}}});
    
      
    }
  } else {
      res.status(200).send({ data:{success: false,message: "All fileds are required!",errorNode:{errorCode:1, errorMsg:"Error"}}});
  }
}


// /**
// * Description: Multiple/Single Product Item add to cart
// * @param req
// * @param res user details with jwt token
// * Developer: Ramchandra Jana
// **/
  exports.multipleAddToCart = async function(req,res) {
    var cartItem = req.body.data ? req.body.data : [];
    if(cartItem.length > 0) {
      // cartItem.forEach(async function(ele) {
        for(var i = 0; i < cartItem.length; i++){
          if(cartItem[i].storeId && cartItem[i].storeId != '' && cartItem[i].customerId && cartItem[i].customerId != '' && cartItem[i].productId && cartItem[i].productId != '' && cartItem[i].itemQuantity && cartItem[i].itemQuantity != '') {
            var checkExistItem = await models.carts.findOne({where:{storeId:cartItem[i].storeId,customerId:cartItem[i].customerId,productId:cartItem[i].productId}});
            if(checkExistItem <= 0){
              models.carts.create({
                storeId : cartItem[i].storeId,
                customerId: cartItem[i].customerId,
                productId: cartItem[i].productId,
                itemQuantity: cartItem[i].itemQuantity,
              });
            } 
          }
        }
      // },this);
         res.status(200).send({ data:{success: true, message: "Items successfully updated in cart",errorNode:{errorCode:0, errorMsg:"No Error"}} });
    } else {
      res.status(200).send({data:{success: false, message: "No item found",errorNode:{errorCode:1, errorMsg:"Error"}}});
    }
  }



  /**
* Description: Delete Product Item to cart
* @param req
* @param res user details with jwt token
* Developer: Ramchandra Jana
**/
// exports.cartItemDelete = async function(req,res) {
//   const storeId = req.body.data.storeId;
//   const customerId = req.body.data.customerId;
//   const productId = req.body.data.product_id;

//   if(storeId && storeId!='' && customerId && customerId != '' && productId && productId != ''){
//     var cartItemCheck = await models.carts.findOne({where:{storeId : storeId,productId : productId,customerId:customerId}});
//     if(cartItemCheck){
//       models.carts.destroy({where:{id:cartItemCheck.id}}).then(async function(value){
//         if(value){
//             var userCartItem = await models.carts.findAll({attributes:[
//               [Sequelize.fn('DISTINCT', Sequelize.col('productId')), 'productId']
//                 ],where:{storeId:storeId,customerId:customerId}});
//             res.status(200).send({data:{success : true, message: "Item successfully removed from your cart", cart_item_count : userCartItem.length,errorNode:{errorCode:0, errorMsg:"No Error"}}  }); 
//         } else {
//            res.status(200).send({data:{success : false, message: "Something went wrong", cart_item_count : userCartItem.length,errorNode:{errorCode:1, errorMsg:"Error"}}}); 
//         }
//       }).catch(async function (error) {
//         return res.send({ success: false, errorNode:{errorCode:1, errorMsg:"Error"}});
//       });
//     } else {
//       res.status(200).send({data:{success: false, message: "No item found",errorNode:{errorCode:1, errorMsg:"Error"}}});
//     }
//   } else {
//     res.status(200).send({ data:{success: false,message: "All fields are required!",errorNode:{errorCode:1, errorMsg:"Error"}}});
//   }
// }

exports.cartItemDelete = async function(req,res) {
  console.log(req.body.dada)
  console.log("aaaaaaaaaaaaaaaaaa---"+req.body.customerId)
  console.log("bbbbbbbbbbbbbbbbbbbbbb"+req.body.product_id)
  // console.log(req.body.dada)
  const storeId = req.body.data.storeId;
  const customerId = req.body.data.customerId;
  const productId = req.body.data.product_id;

  if(storeId && storeId!='' && customerId && customerId != '' && productId && productId != ''){
    var cartItemCheck = await models.carts.findOne({where:{storeId : storeId,productId : productId,customerId:customerId}});
    if(cartItemCheck){
      models.carts.destroy({where:{id:cartItemCheck.id}}).then(async function(value){

        //  ///////////////// addon delete start //////////////

        models.cartAddon.destroy({where: { storeId:storeId, customerId: customerId, parentsProductId: productId }})

        // /////////////////addon delete end ////////////////
        
        if(value){
            var userCartItem = await models.carts.findAll({attributes:[
              [Sequelize.fn('DISTINCT', Sequelize.col('productId')), 'productId']
                ],where:{storeId:storeId,customerId:customerId}});
            res.status(200).send({data:{success : true, message: "Item successfully removed from your cart", cart_item_count : userCartItem.length,errorNode:{errorCode:0, errorMsg:"No Error"}}  }); 
        } else {
           res.status(200).send({data:{success : false, message: "Something went wrong", cart_item_count : userCartItem.length,errorNode:{errorCode:1, errorMsg:"Error"}}}); 
        }
      }).catch(async function (error) {
        return res.send({ success: false, errorNode:{errorCode:1, errorMsg:"Error"}});
      });
    } else {
      res.status(200).send({data:{success: false, message: "No item found",errorNode:{errorCode:1, errorMsg:"Error"}}});
    }
  } else {
    res.status(200).send({ data:{success: false,message: "All fields are required!",errorNode:{errorCode:1, errorMsg:"Error"}}});
  }
}

/**
* Description: Increment Product Item to cart
* @param req
* @param res user details with jwt token
* Developer: Ramchandra Jana
**/
// exports.cartItemIncrement = async function(req,res){
//   var storeId = req.body.data.storeId;
//   var customerId = req.body.data.customerId;
//   var productId = req.body.data.product_id;

//   if(storeId && storeId!='' &&  customerId && customerId != '' && productId && productId != ''){
//     var cartItemCheck = await models.carts.findOne({attributes:['id','itemQuantity','configProductId'],where:{storeId:storeId,productId : productId,customerId:customerId}});
//     if(cartItemCheck){

//         models.carts.update({
//             itemQuantity:cartItemCheck.itemQuantity*1+1,
//          },{ where: { id:cartItemCheck.id }})
//             .then(async function(cart){
//             if(cart){

//               var cartProductDetails = await models.carts.findOne({attributes:['id','productId','itemQuantity','configProductId'],where:{id:cartItemCheck.id}});
//               var productDetails = await models.products.findOne({attributes:['id','price'],where:{id:productId}});
//               if(cartItemCheck.configProductId && cartItemCheck.configProductId != '' && cartItemCheck.configProductId != null){
//                 var configProductDetails = await models.optionValue.findOne({attributes:['id','price'],where:{id:cartItemCheck.configProductId}});
//                 if(configProductDetails){
//                   if(configProductDetails.price && configProductDetails.price != '' && configProductDetails.price != null){
//                     var productTotalPrice = Number(cartProductDetails.itemQuantity) * Number(configProductDetails.price);
//                   } else {
//                     var productTotalPrice = Number(cartProductDetails.itemQuantity) * Number(productDetails.price);
//                   }
//                 } else {
//                   var productTotalPrice = Number(cartProductDetails.itemQuantity) * Number(productDetails.price);
//                 }
//               } else {
//                 var productTotalPrice = Number(cartProductDetails.itemQuantity) * Number(productDetails.price);
//               }
//               res.status(200).send({ data:{success: true, productTotalPrice:productTotalPrice, itemCount: cartProductDetails.itemQuantity, message: "Product quantity successfully incremented",errorNode:{errorCode:0, errorMsg:"No Error"}}});
//             } else {
//               res.status(200).send({data:{success : false, message: "Something went wrong",errorNode:{errorCode:1, errorMsg:"Error"}}}); 
//             }
//         }).catch(async function (error) {
//           return res.send({ success: false, errorNode:{errorCode:1, errorMsg:"Error"}});
//         });
//     } else {
//       res.status(200).send({data:{success: false, message: "No item found",errorNode:{errorCode:1, errorMsg:"Error"}}});
//      }
//   } else {
//     res.status(200).send({ data:{success: false,message: "All fileds are required!",errorNode:{errorCode:1, errorMsg:"Error"}}});
//   }
// }

exports.cartItemIncrement = async function(req,res){
  var storeId = req.body.data.storeId;
  var customerId = req.body.data.customerId;
  var productId = req.body.data.product_id;

  if(storeId && storeId!='' &&  customerId && customerId != '' && productId && productId != ''){
    var cartItemCheck = await models.carts.findOne({attributes:['id','itemQuantity','configProductId'],where:{storeId:storeId,productId : productId,customerId:customerId}});
    if(cartItemCheck){

      // ////////////////////////// catelog price rule start /////////////////////////////////////
      // var catelogPriceCurrentDate = yyyy_mm_dd();
      // var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
      // if(catelogPriceRuleDetails.length>0){
      //   var isCatelogPriceRule = 'yes';
      // } else {
      //   var isCatelogPriceRule = 'no';
      // }
      // ////////////////////////// catelog price rule end /////////////////////////////////////

        models.carts.update({
            itemQuantity:cartItemCheck.itemQuantity*1+1,
         },{ where: { id:cartItemCheck.id }})
            .then(async function(cart){
            if(cart){

              // /////////////////// addon product item increment start /////////////////

              // var addonCartItem = await sequelize.query("SELECT cart_addon.cart_addon_id, cart_addon.customer_id, cart_addon.product_id, cart_addon.item_quantity FROM `cart_addon` where `cart_addon`.`cart_id` = " +cart_item.id,{ type: Sequelize.QueryTypes.SELECT });
              var addonCartItem = await models.cartAddon.findAll({attributes:['id','productId','cartId','itemQuantity'], where:{storeId : storeId, cartId:cartItemCheck.id} });
              
              if(addonCartItem.length > 0){
                for(var i=0; i < addonCartItem.length; i++){
                  
                  models.cartAddon.update({
                    itemQuantity: addonCartItem[i].itemQuantity + 1,
                  },{ where: { id: addonCartItem[i].id } })
                }
              }

              // /////////////////// addon product item increment end ///////////////////

              // /////////////////////// addon product price calculation start /////////////////////
              var addonSum = 0;
              // var addonProductsData = await models.cartAddon.findAll({attributes:['id','productId','parentsProductId', 'customerId'], where:{ storeId : storeId, customerId:customerId },
              //   include: [{
              //       model: models.products,
              //       attributes:['id','price']
                    
              //   }]
              // })

              var addonProductsData = await sequelize.query("SELECT cartAddon.id, cartAddon.parentsProductId, cartAddon.customerId as customerId, cartAddon.productId as productId, cartAddon.itemQuantity as itemQuantity, products.id, products.price, products.title FROM `cartAddon` LEFT JOIN `products` ON cartAddon.productId = products.id where `cartAddon`.`storeId` = " +storeId+ " and `cartAddon`.`customerId` = "+customerId,{ type: Sequelize.QueryTypes.SELECT });

              if(addonProductsData.length > 0){
                for(var i = 0; i < addonProductsData.length; i++){
                  addonSum +=  Number(addonProductsData[i].price);
                }
              }
              // /////////////////////// addon product price calculation end /////////////////////

              var cartProductDetails = await models.carts.findOne({attributes:['id','productId','itemQuantity','configProductId'],where:{id:cartItemCheck.id}});
              var productDetails = await models.products.findOne({attributes:['id','price'],where:{id:productId}});

              ////////////////////////// catelog price rule start /////////////////////////////////////

              // if(isCatelogPriceRule == 'yes'){
              //   var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productDetails.id, Number(productDetails.price), catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

              //   if(productCatalogPriceDetails.discountPrice != null){
              //     var productPrice = productCatalogPriceDetails.discountPrice;
              //   } else {
              //     var productPrice = Number(productsData[i].product.price);
              //   }

              // } else {
              //   var productPrice = Number(productsData[i].product.price);
              // }

              ////////////////////////// catelog price rule end /////////////////////////////////////

              var productPrice = Number(productDetails.price);
              
              if(cartItemCheck.configProductId && cartItemCheck.configProductId != '' && cartItemCheck.configProductId != null){
                var configProductDetails = await models.optionValue.findOne({attributes:['id','price'],where:{id:cartItemCheck.configProductId}});
                if(configProductDetails){
                  if(configProductDetails.price && configProductDetails.price != '' && configProductDetails.price != null){

                    // ////////////////////////// catelog price rule start /////////////////////////////////////

										// 	if(isCatelogPriceRule == 'yes'){

										// 		var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productId, Number(configProductDetails.price), catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
							
										// 		var productTotalPrice = productCatalogPriceDetails.discountPrice * Number(cartProductDetails.itemQuantity);
							
										// 	} else {
										// 		var productTotalPrice = Number(cartProductDetails.itemQuantity) * Number(configProductDetails.price);
										// 	}

                    //   ////////////////////////// catelog price rule end /////////////////////////////////////

                    // var productTotalPrice = Number(cartProductDetails.itemQuantity) * Number(configProductDetails.price);
                  } else {
                    var productTotalPrice = Number(cartProductDetails.itemQuantity) * productPrice;
                  }
                } else {
                  var productTotalPrice = Number(cartProductDetails.itemQuantity) * productPrice;
                }
              } else {
                var productTotalPrice = Number(cartProductDetails.itemQuantity) * productPrice;
              }

              res.status(200).send({ data:{success: true, productTotalPrice:Math.round(productTotalPrice+addonSum), itemCount: cartProductDetails.itemQuantity, message: "Product quantity successfully incremented",errorNode:{errorCode:0, errorMsg:"No Error"}}});
            } else {
              res.status(200).send({data:{success : false, message: "Something went wrong",errorNode:{errorCode:1, errorMsg:"Error"}}}); 
            }
        }).catch(async function (error) {
          console.log("aaaaaaaaaaaaaaa-"+error)
          return res.send({ success: false, errorNode:{errorCode:1, errorMsg:error}});
        });
    } else {
      res.status(200).send({data:{success: false, message: "No item found",errorNode:{errorCode:1, errorMsg:"Error"}}});
     }
  } else {
    res.status(200).send({ data:{success: false,message: "All fileds are required!",errorNode:{errorCode:1, errorMsg:"Error"}}});
  }
}



/**
* Description: Decrement Product Item to cart
* @param req
* @param res user details with jwt token
* Developer: Ramchandra Jana
**/
// exports.cartItemDecrement = async function(req,res){
//   var storeId = req.body.data.storeId;
//   var customerId = req.body.data.customerId;
//   var productId = req.body.data.product_id;

//   if(storeId && storeId!='' &&  customerId && customerId != '' && productId && productId != ''){
//     var cartItemCheck = await models.carts.findOne({attributes:['id','itemQuantity','configProductId'],where:{storeId:storeId,productId : productId,customerId:customerId}});
//     if(cartItemCheck){
//         models.carts.update({
//           itemQuantity: cartItemCheck.itemQuantity - 1,
//          },{ where: { id:cartItemCheck.id }})
//             .then(async function(cart){
//             if(cart){

//               var cartProductDetails = await models.carts.findOne({attributes:['id','productId','itemQuantity','configProductId'],where:{id:cartItemCheck.id}});
//               var productDetails = await models.products.findOne({attributes:['id','price'],where:{id:productId}});
//               if(cartItemCheck.configProductId && cartItemCheck.configProductId != '' && cartItemCheck.configProductId != null){
//                 var configProductDetails = await models.optionValue.findOne({attributes:['id','price'],where:{id:cartItemCheck.configProductId}});
//                 if(configProductDetails){
//                   if(configProductDetails.price && configProductDetails.price != '' && configProductDetails.price != null){
//                     var productTotalPrice = Number(cartProductDetails.itemQuantity) * Number(configProductDetails.price);
//                   } else {
//                     var productTotalPrice = Number(cartProductDetails.itemQuantity) * Number(productDetails.price);
//                   }
//                 } else {
//                   var productTotalPrice = Number(cartProductDetails.itemQuantity) * Number(productDetails.price);
//                 }
//               } else {
//                 var productTotalPrice = Number(cartProductDetails.itemQuantity) * Number(productDetails.price);
//               }

//               res.status(200).send({ data:{success: true, productTotalPrice:productTotalPrice, itemCount: cartProductDetails.itemQuantity, message: "Product quantity successfully decremented",errorNode:{errorCode:0, errorMsg:"No Error"}}});
//             } else {
//               res.status(200).send({data:{success : false, message: "Something went wrong",errorNode:{errorCode:1, errorMsg:"Error"}}}); 
//             }
//         }).catch(async function (error) {
//           return res.send({ success: false, errorNode:{errorCode:1, errorMsg:"Error"}});
//         });
//     } else {
//       res.status(200).send({data:{success: false, message: "No item found",errorNode:{errorCode:1, errorMsg:"Error"}}});
//      }
//   } else {
//     res.status(200).send({ data:{success: false,message: "All fileds are required!",errorNode:{errorCode:1, errorMsg:"Error"}}});
//   }
// }

exports.cartItemDecrement = async function(req,res){
  var storeId = req.body.data.storeId;
  var customerId = req.body.data.customerId;
  var productId = req.body.data.product_id;

  if(storeId && storeId!='' &&  customerId && customerId != '' && productId && productId != ''){
    var cartItemCheck = await models.carts.findOne({attributes:['id','itemQuantity','configProductId'],where:{storeId:storeId,productId : productId,customerId:customerId}});
    if(cartItemCheck){

      // ////////////////////////// catelog price rule start /////////////////////////////////////
      // var catelogPriceCurrentDate = yyyy_mm_dd();
      // var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
      // if(catelogPriceRuleDetails.length>0){
      //   var isCatelogPriceRule = 'yes';
      // } else {
      //   var isCatelogPriceRule = 'no';
      // }
      // ////////////////////////// catelog price rule end /////////////////////////////////////

        models.carts.update({
          itemQuantity: cartItemCheck.itemQuantity - 1,
         },{ where: { id:cartItemCheck.id }})
            .then(async function(cart){
            if(cart){

              // /////////////////// addon product item increment start /////////////////

              // var addonCartItem = await sequelize.query("SELECT cart_addon.cart_addon_id, cart_addon.customer_id, cart_addon.product_id, cart_addon.item_quantity FROM `cart_addon` where `cart_addon`.`cart_id` = " +cart_item.id,{ type: Sequelize.QueryTypes.SELECT });
              var addonCartItem = await models.cartAddon.findAll({attributes:['id','productId','cartId','itemQuantity'], where:{storeId : storeId, cartId:cartItemCheck.id} });
              
              if(addonCartItem.length > 0){
                for(var i=0; i < addonCartItem.length; i++){
                  
                  models.cartAddon.update({
                    itemQuantity: addonCartItem[i].itemQuantity - 1,
                  },{ where: { id: addonCartItem[i].id } })
                }
              }

              // /////////////////// addon product item increment end ///////////////////

              // /////////////////////// addon product price calculation start /////////////////////
              var addonSum = 0;
              // var addonProductsData = await models.cartAddon.findAll({attributes:['id','productId','parentsProductId', 'customerId'], where:{ storeId : storeId, customerId:customerId },
              //   include: [{
              //       model: models.products,
              //       attributes:['id','price']
                    
              //   }]
              // })

              var addonProductsData = await sequelize.query("SELECT cartAddon.id, cartAddon.parentsProductId, cartAddon.customerId as customerId, cartAddon.productId as productId, cartAddon.itemQuantity as itemQuantity, products.id, products.price, products.title FROM `cartAddon` LEFT JOIN `products` ON cartAddon.productId = products.id where `cartAddon`.`storeId` = " +storeId+ " and `cartAddon`.`customerId` = "+customerId,{ type: Sequelize.QueryTypes.SELECT });

              if(addonProductsData.length > 0){
                for(var i = 0; i < addonProductsData.length; i++){
                  addonSum +=  Number(addonProductsData[i].price);
                }
              }
              // /////////////////////// addon product price calculation end /////////////////////
              
              var cartProductDetails = await models.carts.findOne({attributes:['id','productId','itemQuantity','configProductId'],where:{id:cartItemCheck.id}});
              var productDetails = await models.products.findOne({attributes:['id','price'],where:{id:productId}});

              // ////////////////////////// catelog price rule start /////////////////////////////////////

              // if(isCatelogPriceRule == 'yes'){
              //   var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productDetails.id, Number(productDetails.price), catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

              //   if(productCatalogPriceDetails.discountPrice != null){
              //     var productPrice = productCatalogPriceDetails.discountPrice;
              //   } else {
              //     var productPrice = Number(productsData[i].product.price);
              //   }

              // } else {
              //   var productPrice = Number(productsData[i].product.price);
              // }

              // ////////////////////////// catelog price rule end /////////////////////////////////////

              var productPrice = Number(productDetails.price);

              if(cartItemCheck.configProductId && cartItemCheck.configProductId != '' && cartItemCheck.configProductId != null){
                var configProductDetails = await models.optionValue.findOne({attributes:['id','price'],where:{id:cartItemCheck.configProductId}});
                if(configProductDetails){
                  if(configProductDetails.price && configProductDetails.price != '' && configProductDetails.price != null){

                    ////////////////////////// catelog price rule start /////////////////////////////////////

											if(isCatelogPriceRule == 'yes'){

												var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, productId, Number(configProductDetails.price), catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
							
												var productTotalPrice = productCatalogPriceDetails.discountPrice * Number(cartProductDetails.itemQuantity);
							
											} else {
												var productTotalPrice = Number(cartProductDetails.itemQuantity) * Number(configProductDetails.price);
											}

                      ////////////////////////// catelog price rule end /////////////////////////////////////

                    // var productTotalPrice = Number(cartProductDetails.itemQuantity) * Number(configProductDetails.price);
                  } else {
                    var productTotalPrice = Number(cartProductDetails.itemQuantity) * productPrice;
                  }
                } else {
                  var productTotalPrice = Number(cartProductDetails.itemQuantity) * productPrice;
                }
              } else {
                var productTotalPrice = Number(cartProductDetails.itemQuantity) * productPrice;
              }

              res.status(200).send({ data:{success: true, productTotalPrice:Math.round(productTotalPrice+addonSum), itemCount: cartProductDetails.itemQuantity, message: "Product quantity successfully decremented",errorNode:{errorCode:0, errorMsg:"No Error"}}});
            } else {
              res.status(200).send({data:{success : false, message: "Something went wrong",errorNode:{errorCode:1, errorMsg:"Error"}}}); 
            }
        }).catch(async function (error) {
          return res.send({ success: false, errorNode:{errorCode:1, errorMsg:"Error"}});
        });
    } else {
      res.status(200).send({data:{success: false, message: "No item found",errorNode:{errorCode:1, errorMsg:"Error"}}});
     }
  } else {
    res.status(200).send({ data:{success: false,message: "All fileds are required!",errorNode:{errorCode:1, errorMsg:"Error"}}});
  }
}


/**
* Description: Cart Item Listing
* @param req
* @param res user details with jwt token
* Developer: Ramchandra Jana
**/

// exports.cartItemListing = async function(req,res) {
//   var storeId = req.body.data.storeId;
//   var customerId = req.body.data.customerId;
//   var list = [];
//   var cartTotalPrice = 0;
//   if(storeId && storeId!='' && customerId && customerId != ''){
//     const shippingCharges = await models.siteSettings.findAll({attributes:['id','value'], where:{title: { [Op.like]: `%Shipping Charges%` }, storeId: storeId }})

//     const freeShippingLimit = await models.siteSettings.findAll({attributes:['id','value'], where:{title: { [Op.like]: `%Free Shipping Limit%` }, storeId: storeId }})

//     var totalWallteBalance = 0
//     const walletTransaction = await models.walletTransaction.findAll({attributes:['balance'], where:{customerId:customerId}, order: [['id', 'DESC']], limit:1})
//     if(walletTransaction.length>0){
//       totalWallteBalance = parseInt(walletTransaction[0].balance)
//     }else{
//       totalWallteBalance = 0
//     }
    
//     let charges = 0
//     let freeLimit = 0
//     if(shippingCharges.length >0){
//       charges = parseInt(shippingCharges[0].value)
//     }else{
//       charges = 0
//     }
//     if(freeShippingLimit.length >0){
//       freeLimit = parseInt(freeShippingLimit[0].value)
//     }else{
//       freeLimit = 0
//     }

//     var cartItem = await sequelize.query(`SELECT carts.id as cartId, carts.customerId as customerId, carts.productId as productId, carts.itemQuantity as itemQuantity, carts.configProductId as configProductId, products.id, products.title, products.price, products.slug, products.specialPrice, products.weight, products.size FROM carts LEFT JOIN products ON carts.productId = products.id where carts.customerId = ${customerId} AND carts.storeId = ${storeId} `,{ type: Sequelize.QueryTypes.SELECT });
//     //console.log(cartItem);
    
//     // var cartItemCount = await sequelize.query(`SELECT DISTINCT productId FROM carts  where customerId = ${customerId} AND storeId = ${storeId}`,{ type: Sequelize.QueryTypes.SELECT });
//     var cartItemCount = await models.carts.findAll({ where: { storeId: storeId, customerId:customerId }, attributes: [[Sequelize.literal('DISTINCT `productId`'), 'productId']], limit: 5 });
   
//     if(cartItem.length > 0){
//       // var i = 0;
    
//       for(var j=0; j<cartItem.length; j++){

//         let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:cartItem[j].productId, storeId:storeId, isPrimary:'Yes'}});

//         if(productImages.length>0){
//           var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/category/no_image.jpg';
//         } else {
//           var product_images = req.app.locals.baseurl+'admin/category/no_image.jpg';
//         }

//         if (cartItem[j].configProductId && cartItem[j].configProductId != '' && cartItem[j].configProductId != null ) {
//           console.log("111111111111---"+cartItem[j].configProductId)
//           let optionValueDetails = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{id:cartItem[j].configProductId, storeId:storeId}});
//           console.log("222222222---"+optionValueDetails.length)
//           if(optionValueDetails.length > 0){
//             if(optionValueDetails[0].price && optionValueDetails[0].price != null && optionValueDetails[0].price != ''){
//               var productPrice =  Number(optionValueDetails[0].price);
//               var productWeight = optionValueDetails[0].value;
//               console.log("33333333333333---"+productPrice)
//             } else {
//               var productWeight = cartItem[j].weight;
//               if (cartItem[j].specialPrice && cartItem[j].specialPrice != '' && cartItem[j].specialPrice != 0 && cartItem[j].specialPrice != null ) {
//                 var productPrice = cartItem[j].specialPrice;
//               } else {
//                 var productPrice = cartItem[j].price;
//               }
//             }
//           } else {
//             var productWeight = cartItem[j].weight;
//             if (cartItem[j].specialPrice && cartItem[j].specialPrice != '' && cartItem[j].specialPrice != 0 && cartItem[j].specialPrice != null ) {
//               var productPrice = cartItem[j].specialPrice;
//             } else {
//               var productPrice = cartItem[j].price;
//             }
//           }

//         } else {
//           var productWeight = cartItem[j].weight;
//           if (cartItem[j].specialPrice && cartItem[j].specialPrice != '' && cartItem[j].specialPrice != 0 && cartItem[j].specialPrice != null ) {
//             var productPrice = cartItem[j].specialPrice;
//           } else {
//             var productPrice = cartItem[j].price;
//           }
//         }

//         // if (cartItem[j].specialPrice && cartItem[j].specialPrice != '' && cartItem[j].specialPrice != 0 && cartItem[j].specialPrice != null ) {
//         //   var productPrice = cartItem[j].specialPrice;
//         // } else {
//         //   var productPrice = cartItem[j].price;
//         // }

//         if (cartItem[j].itemQuantity >= 1) {
//           var productTotalPrice = Math.abs(cartItem[j].itemQuantity)*Math.abs(productPrice);
//         }      
//         cartTotalPrice += productTotalPrice;
//         list.push({
//           "id": cartItem[j].productId,
//           "cartId": cartItem[j].cartId,
//           "customerId": cartItem[j].customerId,
//           "item_quantity": cartItem[j].itemQuantity,
//           "title": cartItem[j].title,
//           "size": cartItem[j].size,
//           // "weight": cartItem[j].weight,
//           // "price": cartItem[j].price,
//           "weight": productWeight,
//           "price": Number(productPrice),
//           "specialPrice": cartItem[j].specialPrice,
//           "image": product_images,
//           "productTotalPrice": productTotalPrice,
//         });    
       
//       }

//       res.status(200).send({ data:{success : true, list : list, cartTotalPrice : cartTotalPrice, cartItemCount: cartItemCount.length, homeVisitCharges : charges, freeShippingLimit : freeLimit, customer_wallet_balance:totalWallteBalance },errorNode:{errorCode:0, errorMsg:"No Error"}});
//     } else {
//       res.status(200).send({data:{success: false, list: [], message: "Your cart is empty", cartItemCount: cartItemCount.length},errorNode:{errorCode:0, errorMsg:"No Error"} });
//     }
//   } else {
//     res.status(200).send({ data:{success : false, message: "Customer id required!"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
//   }
// }

exports.cartItemListing = async function(req,res) {
  var storeId = req.body.data.storeId;
  var customerId = req.body.data.customerId;
  var list = [];
  var cartTotalPrice = 0;
  if(storeId && storeId!='' && customerId && customerId != ''){
    const shippingCharges = await models.siteSettings.findAll({attributes:['id','value'], where:{title: { [Op.like]: `%Shipping Charges%` }, storeId: storeId }})

    const freeShippingLimit = await models.siteSettings.findAll({attributes:['id','value'], where:{title: { [Op.like]: `%Free Shipping Limit%` }, storeId: storeId }})

    var totalWallteBalance = 0
    const walletTransaction = await models.walletTransaction.findAll({attributes:['balance'], where:{customerId:customerId}, order: [['id', 'DESC']], limit:1})
    if(walletTransaction.length>0){
      totalWallteBalance = parseInt(walletTransaction[0].balance)
    }else{
      totalWallteBalance = 0
    }
    
    let charges = 0
    let freeLimit = 0
    if(shippingCharges.length >0){
      charges = parseInt(shippingCharges[0].value)
    }else{
      charges = 0
    }
    if(freeShippingLimit.length >0){
      freeLimit = parseInt(freeShippingLimit[0].value)
    }else{
      freeLimit = 0
    }

    var cartItem = await sequelize.query(`SELECT carts.id as cartId, carts.customerId as customerId, carts.productId as productId, carts.itemQuantity as itemQuantity, carts.configProductId as configProductId, carts.wrapId, products.id, products.title, products.price, products.slug, products.specialPrice, products.weight, products.size, products.attr1, products.attr2, products.attr3, products.attr4, products.attr5, products.attr6, products.attr7, products.attr8, products.attr9, products.attr10, products.isConfigurable FROM carts LEFT JOIN products ON carts.productId = products.id where carts.customerId = ${customerId} AND carts.storeId = ${storeId} `,{ type: Sequelize.QueryTypes.SELECT });
    //console.log(cartItem);
    
    // var cartItemCount = await sequelize.query(`SELECT DISTINCT productId FROM carts  where customerId = ${customerId} AND storeId = ${storeId}`,{ type: Sequelize.QueryTypes.SELECT });
    var cartItemCount = await models.carts.findAll({ where: { storeId: storeId, customerId:customerId }, attributes: [[Sequelize.literal('DISTINCT `productId`'), 'productId']], limit: 5 });
   
    if(cartItem.length > 0){

      ////////////////////////// catelog price rule start /////////////////////////////////////
      var catelogPriceCurrentDate = yyyy_mm_dd();
      var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
      if(catelogPriceRuleDetails.length>0){
        var isCatelogPriceRule = 'yes';
      } else {
        var isCatelogPriceRule = 'no';
      }
      ////////////////////////// catelog price rule end /////////////////////////////////////

      // var i = 0;
    
      for(var j=0; j<cartItem.length; j++){

        ////////////////////// addon product checking and calculation start ///////////////////

        var addon_product_list = [];
        
        // var addon_product = await sequelize.query("SELECT b.id as product_id, b.category_id, b.slug, b.id, b.title, b.price, b.veg_only, "+cart_item[a].id+" as p_id, 'false' as addon_product_in_cart FROM product as b WHERE b.id in (SELECT selected_id FROM related_product WHERE p_id =  "+cart_item[a].id+"  AND related_product.type ='Add-on') AND b.status='active'",{ type: Sequelize.QueryTypes.SELECT });
        var addOnProduct = await sequelize.query("SELECT relatedProduct.productId as parentProductId, products.id, products.sku, products.title, products.slug, products.price, products.specialPrice, products.size, products.status, products.isConfigurable, products.weight, products.color, products.attr1 as veg_only, 'false' as addon_product_in_cart FROM `relatedProduct` left join products on products.id = relatedProduct.selectedProductId WHERE relatedProduct.storeId = "+storeId+" and relatedProduct.productId = "+cartItem[j].productId+" and relatedProduct.type = 'Add-on'",{ type: Sequelize.QueryTypes.SELECT });
        var addonCartItem = await sequelize.query("SELECT cartAddon.id, cartAddon.parentsProductId, cartAddon.customerId as customerId, cartAddon.productId as productId, cartAddon.itemQuantity as itemQuantity, products.id, products.price, products.title FROM `cartAddon` LEFT JOIN `products` ON cartAddon.productId = products.id where `cartAddon`.`storeId` = "+storeId+" and `cartAddon`.`cartId` = " +cartItem[j].cartId,{ type: Sequelize.QueryTypes.SELECT });

        if(addOnProduct.length > 0){

          for(var c=0; c < addOnProduct.length; c++){
            addon_product_list.push(addOnProduct[c].id);
          }
          
          if(addonCartItem.length > 0){

            var addon_product_total_price = 0;

            for(var b=0; b < addonCartItem.length; b++){
              var addon_product_price = addonCartItem[b].price;
              var addon_product_price = Math.abs(addonCartItem[b].itemQuantity)*Math.abs(addon_product_price);
              addon_product_total_price += addon_product_price;
            }

            

          } else {
            var addon_product_list = addOnProduct;
            var addon_product_total_price = 0;
          }
        } else {
          var addon_product_list = [];
          var addon_product_total_price = 0;
        }
        ////////////////////// separate addon product name in string start ////////////////////
        if(addonCartItem.length > 0){
          var addon_pro_name = ''

          if(addonCartItem.length == 1){
            var addon_product_name = addonCartItem[0].title;
          } else {

            var i=0; 
            addonCartItem.forEach(async function(ap){
              addon_pro_name += addonCartItem[i].title+",  ";
              i++;
            }, this);
            var addon_product_name = addon_pro_name.slice(0,-3);
          }
        } else {
          var addon_product_name = '';
        }
        ////////////////////// separate addon product name in string end ////////////////////

        ////////////////////// addon product checking and calculation end ////////////////////

        if(cartItem[j].isConfigurable == 0){
          var productImageId = cartItem[j].productId;
        } else {
          var productImageId = cartItem[j].isConfigurable;
        }
        // let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:cartItem[j].productId, storeId:storeId, isPrimary:'Yes'}});
        // let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:cartItem[j].productId }});
        let productImages = await models.productImages.findAll({attributes:['id','productId','file','imageTitle'],where:{productId:productImageId }});

        if(productImages.length>0){
          var product_images = (productImages[0].file!='' && productImages[0].file!=null) ? req.app.locals.baseurl+'admin/products/image/'+productImages[0].productId+'/'+productImages[0].file : req.app.locals.baseurl+'admin/products/no_image.jpg';
        } else {
          var product_images = req.app.locals.baseurl+'admin/products/no_image.jpg';
        }

        ////////////////////////// catelog price rule start /////////////////////////////////////

        if(isCatelogPriceRule == 'yes'){
          var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, cartItem[j].productId, Number(cartItem[j].price), catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

          if(productCatalogPriceDetails.discountPrice != null){
            var calculatedProductPrice = productCatalogPriceDetails.discountPrice;
          } else {
            var calculatedProductPrice = Number(cartItem[j].price);
          }

        } else {
          var calculatedProductPrice = Number(cartItem[j].price);
        }

        ////////////////////////// catelog price rule end /////////////////////////////////////

        if (cartItem[j].configProductId && cartItem[j].configProductId != '' && cartItem[j].configProductId != null ) {
          let optionValueDetails = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{id:cartItem[j].configProductId, storeId:storeId}});
          if(optionValueDetails.length > 0){
            if(optionValueDetails[0].price && optionValueDetails[0].price != null && optionValueDetails[0].price != ''){

              ////////////////////////// catelog price rule start /////////////////////////////////////

              if(isCatelogPriceRule == 'yes'){

                var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, cartItem[j].productId, Number(optionValueDetails[0].price), catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
      
                var productPrice = productCatalogPriceDetails.discountPrice;
      
              } else {
                var productPrice =  Number(optionValueDetails[0].price);
              }

              ////////////////////////// catelog price rule end /////////////////////////////////////
              
              // var productPrice =  Number(optionValueDetails[0].price);
              var productWeight = optionValueDetails[0].value;
              var optionValue = optionValueDetails[0].value;
            } else {
              var optionValue = cartItem[j].size;
              var productWeight = cartItem[j].weight;
              // if (cartItem[j].specialPrice && cartItem[j].specialPrice != '' && cartItem[j].specialPrice != 0 && cartItem[j].specialPrice != null ) {
              //   var productPrice = cartItem[j].specialPrice;
              // } else {
              //   var productPrice = cartItem[j].price;
              // }
              var productPrice = calculatedProductPrice;
            }
          } else {
            var optionValue = cartItem[j].size;
            var productWeight = cartItem[j].weight;
            // if (cartItem[j].specialPrice && cartItem[j].specialPrice != '' && cartItem[j].specialPrice != 0 && cartItem[j].specialPrice != null ) {
            //   var productPrice = cartItem[j].specialPrice;
            // } else {
            //   var productPrice = cartItem[j].price;
            // }
            var productPrice = calculatedProductPrice;
          }

        } else {
          var optionValue = cartItem[j].size;
          var productWeight = cartItem[j].weight;
          // if (cartItem[j].specialPrice && cartItem[j].specialPrice != '' && cartItem[j].specialPrice != 0 && cartItem[j].specialPrice != null ) {
          //   var productPrice = cartItem[j].specialPrice;
          // } else {
          //   var productPrice = cartItem[j].price;
          // }
          var productPrice = calculatedProductPrice;
        }

        if (cartItem[j].itemQuantity >= 1) {
          var productTotalPrice = Math.abs(cartItem[j].itemQuantity)*Math.abs(productPrice)+addon_product_total_price;
        }      
        cartTotalPrice += productTotalPrice;
        list.push({
          "id": cartItem[j].productId,
          "cartId": cartItem[j].cartId,
          "customerId": cartItem[j].customerId,
          "item_quantity": cartItem[j].itemQuantity,
          "title": cartItem[j].title,
          "size": cartItem[j].size,
          "veg_only": cartItem[j].attr1 ? cartItem[j].attr1 : 'veg',
          // "weight": cartItem[j].weight,
          // "price": cartItem[j].price,
          "optionValue": optionValue,
          "weight": productWeight,
          "price": Number(productPrice),
          "specialPrice": cartItem[j].specialPrice,
          "image": product_images,
          "productTotalPrice": Math.round(productTotalPrice),
          "addon_product": addon_product_list,
          "addon_product_name": addon_product_name,
          "addon_price" : addon_product_total_price,
          "wrapId": cartItem[j].wrapId,
          "attr1": cartItem[j].attr1,
          "attr2": cartItem[j].attr2,
          "attr3": cartItem[j].attr3,
          "attr4": cartItem[j].attr4,
          "attr5": cartItem[j].attr5,
          "attr6": cartItem[j].attr6,
          "attr7": cartItem[j].attr7,
          "attr8": cartItem[j].attr8,
          "attr9": cartItem[j].attr9,
          "attr10": cartItem[j].attr10,
        });    
       
      }

      res.status(200).send({ data:{success : true, list : list, cartTotalPrice : Math.round(cartTotalPrice), cartItemCount: cartItemCount.length, homeVisitCharges : charges, freeShippingLimit : freeLimit, customer_wallet_balance:totalWallteBalance },errorNode:{errorCode:0, errorMsg:"No Error"}});
    } else {
      res.status(200).send({data:{success: false, list: [], message: "Your cart is empty", cartItemCount: cartItemCount.length},errorNode:{errorCode:0, errorMsg:"No Error"} });
    }
  } else {
    res.status(200).send({ data:{success : false, message: "Customer id required!"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
  }
}


/******************************** Guest cart shipping chirge start **********************************************/
exports.guestCartShippingCharge = async function(req,res){
  var storeId = req.body.data.storeId;
  var cartAmount =  Number(Math.round(req.body.data.cartAmount));
      
  if(storeId && storeId != ''){
    if(cartAmount && cartAmount != ''){

      var shipping_charge = await sequelize.query("SELECT title, value FROM `siteSettings` where `id` = 3 and storeId = "+storeId,{ type: Sequelize.QueryTypes.SELECT });
      var free_shipping_limit = await sequelize.query("SELECT title, value FROM `siteSettings` where `id` = 4 and storeId = "+storeId,{ type: Sequelize.QueryTypes.SELECT });

      if(free_shipping_limit.length > 0){
        if(free_shipping_limit[0].value != '' &&  Number(free_shipping_limit[0].value) > cartAmount){
          if(cartAmount == 0){
            var order_shipping_charge = 0;
          } else {
            if(shipping_charge.length > 0){
              if(shipping_charge[0].value != '' && shipping_charge[0].value != null){
                var order_shipping_charge = Number(shipping_charge[0].value);
              } else {
                var order_shipping_charge = 0;
              }
            } else {
              var order_shipping_charge = 0;
            }
          }
        } else {
          var order_shipping_charge = 0;
        }
      } else {
        if(shipping_charge.length > 0){
          if(shipping_charge[0].value != '' && shipping_charge[0].value != null){
            var order_shipping_charge = Number(shipping_charge[0].value);
          } else {
            var order_shipping_charge = 0;
          }
        } else {
          var order_shipping_charge = 0;
        }
      }
      res.status(200).send({ status : 200, success : true, order_shipping_charge: Math.round(order_shipping_charge) });
    }else{
      res.status(200).send({ status : 200, success: false, message:"Cart amount is required"});
    }
  }else{
    res.status(200).send({ status : 200, success: false, message:"Store id is required"});
  }
}

/******************************** Guest cart shipping chirge start **********************************************/


/////////////////////////////// app header cart item  start///////////////////////////
exports.appHeaderCart = async function (req, res, next) {

  var customerId = req.body.data.customerId;
  var storeId = req.body.data.storeId;

  if(storeId && storeId != ''){
    if (customerId && customerId != "" ) {

      var customer_cart_item = await sequelize.query("SELECT DISTINCT productId FROM `carts` where `storeId` = "+storeId+" and `customerId` = " +customerId,{ type: Sequelize.QueryTypes.SELECT });
      if (customer_cart_item.length > 0 ) {
      res.status(200).send({ data:{success : true,  cart_item_count : customer_cart_item.length },errorNode:{errorCode:0, errorMsg:"No Error"}});
      } else {
        res.status(200).send({ data:{success : false, cart_item_count : customer_cart_item.length, message: "Your cart is empty"} ,errorNode:{errorCode:0, errorMsg:"No Error"}});
      }
    }else{
    res.status(200).send({ data:{success : false, message: "Customer id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
    } 
  }else{;
    res.status(200).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
  }
};
/////////////////////////////// app add to cart end///////////////////////////


exports.guestCartItemAdd = async function(req,res) {

  var customerId = req.body.data.customerId;
  var storeId = req.body.data.storeId;
  var cartItem = req.body.data.item ? req.body.data.item : [];

  console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa----"+JSON.stringify(cartItem))

  if(storeId && storeId != ''){
    if (customerId && customerId != "" ) {

      if(cartItem.length > 0) {
        await models.carts.destroy({where:{customerId:customerId, storeId:storeId}});
        await models.cartAddon.destroy({where:{customerId:customerId, storeId:storeId}});
        // for(var i = 0; i < cartItem.length; i++){
        cartItem.forEach(async function (element) {
          if(element.id && element.id != '' && element.item_quantity && element.item_quantity != '') {
            // var checkExistItem = await models.carts.findOne({where:{storeId:storeId,customerId:customerId,productId:element.id}});
            // if(checkExistItem <= 0){
              models.carts.create({
                storeId : storeId,
                customerId: customerId,
                productId: element.id,
                configProductId: element.configId ? element.configId : null,
                itemQuantity: element.item_quantity,
                wrapId: element.wrapId ? element.wrapId : null,
              }).then(async function (cart) {

                // ////////////// for addon product in cart add start ////////////////
                // if(element.addon_product ){
                  if(element.addon_product.length > 0){
                    console.log("222222222222----"+element.addon_product.length );
                    for(var j=0; j < element.addon_product.length; j++){
                      console.log("11111111111111111----" );
                      // var singleAddonCartItemAdd = await models.cartAddon.findAll({attributes:['id','parentsProductId','productId'], where:{storeId : storeId, customerId:customerId, parentsProductId:element.id, productId : element.addon_product[j]} });
                      // console.log("444444444444444444----"+singleAddonCartItemAdd.length );
                      // if (singleAddonCartItemAdd.length <= 0) {
                        // console.log("33333333333333333----" );
                        models.cartAddon.create({
                          cartId: cart.id,
                          storeId: storeId,
                          parentsProductId: element.id,
                          customerId: customerId,
                          productId: element.addon_product[j],
                          itemQuantity: element.item_quantity
                        })
                      // }
                    }
                  }
                // }
                // ////////////// for addon product in cart add end ////////////////

              })
            // } 
          }
        }, this);

        res.status(200).send({ data:{success: true, message: "Items successfully updated in cart",errorNode:{errorCode:0, errorMsg:"No Error"}} });
      } else {
        res.status(200).send({data:{success: false, message: "No item found",errorNode:{errorCode:1, errorMsg:"Error"}}});
      }
    }else{
      res.status(200).send({ data:{success : false, message: "Customer id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
      } 
  }else{;
    res.status(200).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
  }
}


exports.customerCartDetails = async function(req,res) {
  var storeId = req.body.data.storeId;
  var customerId = req.body.data.customerId;
  var list = [];
  var cartTotalPrice = 0;
  if(storeId && storeId!='' ){
    if(customerId && customerId != ''){

      var cartItem = await sequelize.query(`SELECT carts.id as cartId, carts.customerId as customerId, carts.productId as productId, carts.itemQuantity as itemQuantity, carts.configProductId as configProductId, products.id, products.price, products.specialPrice FROM carts LEFT JOIN products ON carts.productId = products.id where carts.customerId = ${customerId} AND carts.storeId = ${storeId} `,{ type: Sequelize.QueryTypes.SELECT });
      
      if(cartItem.length > 0){

        ////////////////////////// catelog price rule start /////////////////////////////////////
        var catelogPriceCurrentDate = yyyy_mm_dd();
        var catelogPriceRuleDetails = await models.catalogPriceRule.findAll({ where:{storeId:storeId, status:'Yes', offerFrom: { $lte: catelogPriceCurrentDate }, offerTo: { $gte: catelogPriceCurrentDate } }});
        if(catelogPriceRuleDetails.length>0){
          var isCatelogPriceRule = 'yes';
        } else {
          var isCatelogPriceRule = 'no';
        }
        ////////////////////////// catelog price rule end /////////////////////////////////////
      
        for(var j=0; j<cartItem.length; j++){

          ////////////////////////// catelog price rule start /////////////////////////////////////

          if(isCatelogPriceRule == 'yes'){
            var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, cartItem[j].productId, Number(cartItem[j].price), catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);

            if(productCatalogPriceDetails.discountPrice != null){
              var calculatedProductPrice = productCatalogPriceDetails.discountPrice;
            } else {
              var calculatedProductPrice = Number(cartItem[j].price);
            }

          } else {
            var calculatedProductPrice = Number(cartItem[j].price);
          }

          ////////////////////////// catelog price rule end /////////////////////////////////////

          // if (cartItem[j].specialPrice && cartItem[j].specialPrice != '' && cartItem[j].specialPrice != 0 && cartItem[j].specialPrice != null ) {
          //   var productPrice = cartItem[j].specialPrice;
          // } else {
          //   var productPrice = cartItem[j].price;
          // }

          if (cartItem[j].configProductId && cartItem[j].configProductId != '' && cartItem[j].configProductId != null ) {
           
            let optionValueDetails = await models.optionValue.findAll({attributes:['id','sku','value','price'],where:{id:cartItem[j].configProductId, storeId:storeId}});
            
            if(optionValueDetails.length > 0){
              if(optionValueDetails[0].price && optionValueDetails[0].price != null && optionValueDetails[0].price != ''){

                ////////////////////////// catelog price rule start /////////////////////////////////////

                if(isCatelogPriceRule == 'yes'){

                  var productCatalogPriceDetails = await helper.catalogPriceRuleCalculation(storeId, cartItem[j].productId, Number(optionValueDetails[0].price), catelogPriceRuleDetails[0].id, catelogPriceRuleDetails[0].discountType, catelogPriceRuleDetails[0].discountValue);
        
                  var productPrice = productCatalogPriceDetails.discountPrice;
        
                } else {
                  var productPrice =  Number(optionValueDetails[0].price);
                }

                ////////////////////////// catelog price rule end /////////////////////////////////////
                
                // var productPrice =  Number(optionValueDetails[0].price);
               
              } else {
                // if (cartItem[j].specialPrice && cartItem[j].specialPrice != '' && cartItem[j].specialPrice != 0 && cartItem[j].specialPrice != null ) {
                //   var productPrice = cartItem[j].specialPrice;
                // } else {
                //   var productPrice = cartItem[j].price;
                // }
                var productPrice = calculatedProductPrice;
              }
            } else {
              // if (cartItem[j].specialPrice && cartItem[j].specialPrice != '' && cartItem[j].specialPrice != 0 && cartItem[j].specialPrice != null ) {
              //   var productPrice = cartItem[j].specialPrice;
              // } else {
              //   var productPrice = cartItem[j].price;
              // }
              var productPrice = calculatedProductPrice;
            }
  
          } else {
            // if (cartItem[j].specialPrice && cartItem[j].specialPrice != '' && cartItem[j].specialPrice != 0 && cartItem[j].specialPrice != null ) {
            //   var productPrice = cartItem[j].specialPrice;
            // } else {
            //   var productPrice = cartItem[j].price;
            // }
            var productPrice = calculatedProductPrice;
          }

          if (cartItem[j].itemQuantity >= 1) {
            var productTotalPrice = Math.abs(cartItem[j].itemQuantity)*Math.abs(productPrice);
          }      
          cartTotalPrice += productTotalPrice;
          // list.push({
          //   "id": cartItem[j].productId,
          //   "cartId": cartItem[j].cartId,
          //   "customerId": cartItem[j].customerId,
          //   "item_quantity": cartItem[j].itemQuantity,
          //   "price": cartItem[j].price,
          //   "specialPrice": cartItem[j].specialPrice,
          //   "productTotalPrice": productTotalPrice,
          // });    
        
        }

        res.status(200).send({ data:{success : true, cartTotalPrice : Math.round(cartTotalPrice), cartItemCount: cartItem.length },errorNode:{errorCode:0, errorMsg:"No Error"}});
      } else {
        res.status(200).send({data:{success: false, cartTotalPrice : 0, cartItemCount: 0, message: "Your cart is empty", cartItemCount: cartItem.length},errorNode:{errorCode:0, errorMsg:"No Error"} });
      }
    } else {
      res.status(200).send({ data:{success : false, message: "Customer id required!"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
    }
  } else {
    res.status(200).send({ data:{success : false, message: "Store id required!"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
  }
}


exports.appAddonCartUpdate = async function(req,res){
  var storeId = req.body.data.storeId;
  var customerId = req.body.data.customerId;
  var productId = req.body.data.product_id;

  var addon = req.body.data.addon ? req.body.data.addon : [];

  if(storeId && storeId!='' &&  customerId && customerId != '' && productId && productId != ''){
    var cartItemCheck = await models.carts.findOne({attributes:['id','itemQuantity','configProductId'],where:{storeId:storeId,productId : productId,customerId:customerId}});
    if(cartItemCheck){

      if(addon.length > 0){
        models.cartAddon.destroy({where: { storeId : storeId, customerId: customerId, parentsProductId: productId },})

        for(var i=0; i < addon.length; i++){
          models.cartAddon.create({
            cartId: cartItemCheck.id,
            storeId: storeId,
            parentsProductId: productId,
            customerId: customerId,
            productId: addon[i],
            itemQuantity: cartItemCheck.itemQuantity
          })
        }
      }

      res.status(200).send({ data:{success: true, message: "Addon product successfully updated in the cart", errorNode:{errorCode:0, errorMsg:"No Error"}}});
    } else {
      res.status(200).send({ data:{success: false,message: "No product found in cart",errorNode:{errorCode:1, errorMsg:"Error"}}});
    }   
   
  } else {
    res.status(200).send({ data:{success: false,message: "All fileds are required!",errorNode:{errorCode:1, errorMsg:"Error"}}});
  }
}


exports.customerCartDelete = async function(req,res) {
  const storeId = req.body.data.storeId;
  const customerId = req.body.data.customerId;

  if(storeId && storeId!='' && customerId && customerId != ''){
    var cartItemCheck = await models.carts.findOne({where:{storeId : storeId,customerId:customerId}});
    if(cartItemCheck){
      models.carts.destroy({where:{storeId : storeId,customerId:customerId}}).then(async function(value){

        //  ///////////////// addon delete start //////////////

        models.cartAddon.destroy({where: { storeId:storeId, customerId: customerId }})

        // /////////////////addon delete end ////////////////
        
        if(value){
            res.status(200).send({data:{success : true, message: "Your carts item successfully removed", errorNode:{errorCode:0, errorMsg:"No Error"}}  }); 
        } else {
           res.status(200).send({data:{success : false, message: "Something went wrong", errorNode:{errorCode:1, errorMsg:"Error"}}}); 
        }
      }).catch(async function (error) {
        return res.send({ success: false, errorNode:{errorCode:1, errorMsg:"Error"}});
      });
    } else {
      res.status(200).send({data:{success: false, message: "No item found",errorNode:{errorCode:1, errorMsg:"Error"}}});
    }
  } else {
    res.status(200).send({ data:{success: false,message: "All fields are required!",errorNode:{errorCode:1, errorMsg:"Error"}}});
  }
}