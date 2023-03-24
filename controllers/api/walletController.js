let models = require('../../models');
let jwt = require('jsonwebtoken');
let SECRET = 'nodescratch';
let config = require("../../config/config.json");
let Sequelize = require("sequelize");
const Op = Sequelize.Op
let sequelize = new Sequelize(
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


// exports.appWalletDashboard = async (req, res, next) => {
//     const customerId = req.body.data.customerId ? req.body.data.customerId : "";

//     if (!customerId) {
//       res.status(400).send({data:{success:false, details:[]},errorNode:{errorCode:1, errorMsg:"customerId not found"}})
//     } else {
//         await models.wallets.findAll({where:{customerId: customerId}, order: [['id', 'DESC']], limit:5}).then(function (value) {
//         if (value && value.length > 0) {
//           sequelize.query("SELECT SUM(balanceAmount) as 'totalamount' FROM wallets WHERE customerId = " + customerId, { type: Sequelize.QueryTypes.SELECT }).then(function (total) {
//               if (total && total.length > 0) {
//                 res.status(200).send({data:{success:true, details:value, totalAmount: total[0].totalamount},errorNode:{errorCode:0, errorMsg:"No Error"}})
//               } else {
//                 res.status(200).send({data:{success:true, details:value, totalAmount: 0.0},errorNode:{errorCode:0, errorMsg:"No Data"}})
//               }
//             }).catch(function (error) {
//                 res.status(500).send({data:{success:false, details:[]},errorNode:{errorCode:1, errorMsg:"Internal Server Error"}})
//             })
//         } else {
//             res.status(200).send({data:{success:true, details:[], totalAmount: 0.0},errorNode:{errorCode:0, errorMsg:"No Data"}})
//         }
//       }).catch(function (error) {
//         res.status(500).send({data:{success:false, details:[]},errorNode:{errorCode:1, errorMsg:"Internal Server Error"}})
//       })
//     }
// }

exports.appWalletDashboard = async (req, res) => {
  const customerId = req.body.data.customerId || "";
  if (!customerId) {
    res.status(400).send({data:{success:false, details:[]},errorNode:{errorCode:1, errorMsg:"customerId not found"}})
  } else {
      await models.walletTransaction.findAll({attributes:['id','amount','transactionType','remarks','balance','createdAt'], where:{customerId:customerId},order: [['id', 'DESC']], limit:5 })
      .then(async(value)=>{
        if(value && value.length>0){
          const total = await models.walletTransaction.findAll({attributes:['balance'], where:{customerId:customerId},order: [['id', 'DESC']], limit:1 })
          if(total && total.length>0){
            res.status(200).send({data:{success:true, details:value, totalAmount: parseInt(total[0].balance)},errorNode:{errorCode:0, errorMsg:"No Error"}})
          }else{
            res.status(200).send({data:{success:true, details:value, totalAmount: 0},errorNode:{errorCode:0, errorMsg:"No Error"}})
          }
        }else{
          res.status(200).send({data:{success:true, details:[], totalAmount: 0},errorNode:{errorCode:0, errorMsg:"No Data"}})
        }
      }).catch((err)=>{
        res.status(500).send({data:{success:false, details:[]},errorNode:{errorCode:1, errorMsg:"Internal Server Error"}})
      })
  }
}