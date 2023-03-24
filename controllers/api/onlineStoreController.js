var models = require("../../models");
var path = require("path");
var jwt = require("jsonwebtoken");
var SECRET = "nodescratch";
var bcrypt = require("bcrypt-nodejs");
var config = require("../../config/config.json");
var Sequelize = require("sequelize");
const Op = Sequelize.Op
const moment = require("moment");
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
            idle: 10000,
        },
    }
);


exports.storeList = async function (req, res) {
    var storeId = req.body.data.storeId;
    // var customerId = req.body.data.customerId;
    console.log(storeId);
    // console.log(customerId);

    const start = new Date()
    start.setDate(start.getDate())
    start.setHours(28, 89, 59, 999)
    const end = new Date();
    end.setDate(end.getDate() - 1)
    end.setHours(05, 30, 0, 0);
    console.log(start);
    console.log(end);
    // let totalSale = ""

    const to = new Date();
    to.setDate(to.getDate())
    to.setHours(05, 30, 0, 0);
    const toDay = new Date();
    toDay.setDate(toDay.getDate())
    toDay.setHours(28, 89, 59, 999);
    // console.log(toDay);
    console.log(to, toDay, "to and today");
    //yesterday
    let yesterday = new Date();
    yesterday.setHours(23, 59, 59, 999);
    yesterday.setDate(yesterday.getDate() - 1);
    console.log(yesterday);
    //today
    let today = new Date();
    today.setDate(today.getDate());
    console.log(today);

    var fr = new Date();
    fr.setHours(0, 0, 0, 0);
    fr.setDate(fr.getDate() - 1);
    var from = new Date();
    from.setHours(23, 59, 59, 999);
    from.setDate(from.getDate() - 1);
    /* total sale */
    let totalSale = 0;
    let mainArray = [];

    if (storeId && storeId != '') {
        /* total sale */
        let total = await models.orders.findAll({
            attributes: ['amountPaid', 'discountAmount', 'id', 'shippingAmount', 'tax', 'createdAt'], where: {
                storeId: storeId
            }
        });
        // console.log(total, "total");
        let todayCount = await models.orders.count({
            where: {
                storeId: storeId,
                createdAt: {
                    [Op.gte]: to, [Op.lte]: toDay
                }
            }
        });
        console.log(todayCount, "today");
        let yesterdayCount = await models.orders.count({
            where: {
                storeId: storeId,
                createdAt: {
                    [Op.gte]: fr, [Op.lte]: from
                }
            }
        });
        console.log(yesterdayCount, "yesterday");

        /*totalsale start */
        console.log(total.length, "total.length");
        if (total.length > 0) {
            for(m = 0; m < total.length; m++){
            totalSale += Number(Number(total[m].amountPaid) - Number(total[m].discountAmount)) + Number(total[m].shippingAmount) + Number(total[m].tax);
            // finaltotalSale += Number(total[m].amountPaid)
            }
            // finaltotalSale += Number(total[0].shippingAmount)
            console.log(totalSale, "totalSale");

        }

        const todayData = {
            price: todayCount,
            today: moment(today).format('L')
        };
        const yesterdayData = {
            price: yesterdayCount,
            yesterday: moment(yesterday).format('L')
        };
        const subArray2Arr = {
            toDay: todayData,
            yesterday: yesterdayData
        };
        const subArray2 = {
            totalSale: totalSale,
            data: subArray2Arr
        };

        /*totalsale end */

        /* online session store start*/
        let onlineStoreSession = await models.orders.count({
            where: {
                storeId: storeId,
            }
        });
        let sessionToday = await models.orders.count({
            where: {
                storeId: storeId, createdAt: {
                    [Op.gte]: to, [Op.lte]: toDay
                }
            }
        });
        let sessionYesterday = await models.orders.count({
            where: {
                storeId: storeId, createdAt: {
                    [Op.gte]: fr, [Op.lte]: from
                }
            }
        });
        const todaySessionData = {
            todayStoreSession: sessionToday,
            today: moment(today).format('L')
        };
        const yesterdaySessionData = {
            yesterdayStoreSession: sessionYesterday,
            yesterday: moment(yesterday).format('L')
        }
        const subArray1Arr = {
            today: todaySessionData,
            yesterday: yesterdaySessionData
        }
        const subArray1 = {
            onlineStoreSessionData: onlineStoreSession,
            data: subArray1Arr
        };

        /* online session store end*/
        /* returning cutomer rate start*/
        let totalCustomers = await models.orders.findAll({
            attributes: [Sequelize.fn('DISTINCT', Sequelize.col('customerId')), 'customerId'], where: {
                storeId: storeId
            }
        });
        // console.log(totalCustomers, "4444444444444444444444444444444444");
        let returningCustomer = 0;
        let todaysCustomer = 0;
        let firstTimeCustomer = 0;
        let totalCustomersCount = 0;
        for (let tc of totalCustomers) {
            let count = await models.orders.count({
                where: {
                    storeId: storeId, customerId: tc.customerId, createdAt: {
                        [Op.lte]: yesterday
                    }
                }
            });
            if (count >= 1) {
                returningCustomer++;
            } 
            console.log(count, "count");

            let todayCustomerCount = await models.orders.count({
                where: {
                    storeId: storeId, customerId: tc.customerId, createdAt: {
                        [Op.lte]: today
                    }
                }
            });
            if (todayCustomerCount <= 1) {
                firstTimeCustomer;
            } 
            console.log(todayCustomerCount, "todayCustomerCount");
        }
        totalCustomersCount += Number(returningCustomer) + Number(firstTimeCustomer);
        console.log(totalCustomersCount, "totalCustomersCount");
        const todaysCustomerCount = {
            todaysCustomer: todaysCustomer
        };
        const returningCustomerCount = {
            returningCustomer: returningCustomer
        };
        const allCounts = {
            todaysCustomerCount: todaysCustomerCount,
            returningCustomerCount: returningCustomerCount
        };
        const customerRate = {
            totalCustomersCount: totalCustomersCount,
            data: allCounts,

        };

        /* returning cutomer rate end*/
        /* online store conversion start*/


        /* online store conversion end*/
        /*average order value start*/
        let totalOrderPlus = 0;
        let totalAverage = 0;
        const totalOrderValue = await models.orders.findAll({ attributes: ['amountPaid', 'discountAmount', 'shippingAmount', 'tax'], where: { storeId: storeId } });
        if (totalOrderValue.length > 0) {
            for (let i = 0; i < totalOrderValue.length; i++) {
                totalOrderPlus += Number(totalOrderValue[i].amountPaid) + Number(totalOrderValue[i].discountAmount) + Number(totalOrderValue[i].shippingAmount) + Number(totalOrderValue[i].tax);
            }
        }
        totalAverage = Number(totalOrderPlus) / totalOrderValue.length;


        let todaySum = 0;
        let todaysAverage = 0;
        const todayOrderValue = await models.orders.findAll({ attributes: ['amountPaid', 'discountAmount', 'shippingAmount', 'tax'], where: { storeId: storeId, createdAt: { [Op.gte]: to, [Op.lte]: toDay } } });
        console.log(todayOrderValue.length, "todayOrderValue.length ");
        if (todayOrderValue.length > 0) {
            for (let j = 0; j < todayOrderValue.length; j++) {
                todaySum += Number(todayOrderValue[j].amountPaid) + Number(todayOrderValue[j].discountAmount) + Number(todayOrderValue[j].shippingAmount) + Number(todayOrderValue[j].tax)
            
            }
        }
        todaysAverage = Number(todaySum) / todayOrderValue.length;
        
        let yesterdaySum = 0;
        let yesterdaysAverage = 0;
        const yesterdayOrderValue = await models.orders.findAll({ attributes: ['amountPaid', 'discountAmount', 'shippingAmount', 'tax'], where: { storeId: storeId, createdAt: { [Op.gte]: fr, [Op.lte]: from } } });
        console.log(yesterdayOrderValue.length, "yesterdayOrderValue.length");
        if (yesterdayOrderValue.length > 0) {
            for (let k = 0; k < yesterdayOrderValue.length; k++) {
                yesterdaySum += Number(yesterdayOrderValue[k].amountPaid) + Number(yesterdayOrderValue[k].discountAmount) + Number(yesterdayOrderValue[k].shippingAmount) + Number(yesterdayOrderValue[k].tax)
                
            }
        }
        yesterdaysAverage = Number(yesterdaySum) / yesterdayOrderValue.length;

        const todayavg = {
            todayOrderValue: todaysAverage ? todaysAverage : 0,
            today: moment(today).format('L')
        };
        const yesterdayavg = {
            yesterdayOrderValue: yesterdaysAverage ? yesterdaysAverage : 0,
            yesterday: moment(yesterday).format('L')
        };
        const twoDaysAvg = {
            toDay: todayavg,
            yesterday: yesterdayavg
        };
        const totalOrderAvg = {
            totalAverage: totalAverage,
            data: twoDaysAvg
        };


        /*average order value end*/
        /* total orders start*/
        let totalOrders = await models.orders.count({ where: { storeId: storeId } });

        let todaysOrder = await models.orders.count({ where: { storeId: storeId, createdAt: { [Op.gte]: to, [Op.lte]: toDay } } });

        let yesterdaysOrder = await models.orders.count({ where: { storeId: storeId, createdAt: { [Op.gte]: fr, [Op.lte]: from } } });

        const todaysOrderCount = {
            todayCount: todaysOrder,
            today: moment(today).format('L')
        };
        const yesterdaysOrderCount = {
            yesterdayCount: yesterdaysOrder,
            yesterday: moment(yesterday).format('L')
        };
        const subArrayForTwoDays = {
            toDay: todaysOrderCount,
            yesterday: yesterdaysOrderCount
        };
        const totalOrder = {
            totalOrder: totalOrders,
            data: subArrayForTwoDays
        };

        /* total orders end*/
        mainArray.push({
            totalSale: subArray2,
            onlineSessionData: subArray1,
            customerRate: customerRate,
            totalOrder: totalOrder,
            totalOrderAvg: totalOrderAvg
        })

        return res.status(200).send({
            data: {
                details: mainArray,
                // abcd:totalAverage,
                success: true,
            },
            errorNode: { errorCode: 0, errorMsg: "No error" },
        });
    } else {
        return res.status(200).send({ data: { success: false, message: 'Storeid is required!' }, errorNode: { errorCode: 1, errorMsg: "Error" } });
    }
}