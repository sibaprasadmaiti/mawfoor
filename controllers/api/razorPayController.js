const models = require("../../models");
const emailConfig = require('../../config/email-config')();
const mailgun = require("mailgun-js")(emailConfig);

exports.razorpayInformationSave = async (req, res) => {
    const storeId = req.body.data.storeId;
    const courseId = req.body.data.courseId || "";
    const userId = req.body.data.userId || "";
    const courseName = req.body.data.courseName || "";
    const amount = req.body.data.amount || "";
    const mobile = req.body.data.mobile || "";
    const email = req.body.data.email || "";
    const name = req.body.data.name || "";
    const razorpay_payment_id = req.body.data.razorpay_payment_id || "";
    const paymentId = req.body.data.paymentId || "";
    const cardId = req.body.data.cardId || "";
    const method = req.body.data.method || "";
    const razorpay = req.body.data.razorpay || "";    
    const duration = req.body.data.duration || "";    
    const classs = req.body.data.class || "";    
    const fees = req.body.data.fees || "";    
    const installment = req.body.data.installment || "";    
    const address = req.body.data.address || "";    
    const payment = req.body.data.payment || "";    
    if(storeId && storeId != ''){
        const storeDetails = await models.stores.findOne({attributes:['email','storeName'], where:{id: storeId}})
        await models.razorpay.create({
            storeId:storeId,
            courseId:courseId,
            userId: userId,
            courseName:courseName,
            amount:amount,
            mobile:mobile,
            email:email,
            name:name,
            duration:duration,
            class:classs,
            fees:fees,
            installment:installment,
            address:address,
            payment:payment,
            razorpay_payment_id:razorpay_payment_id,
            paymentId:paymentId,
            cardId:cardId,
            method:method,
            razorpay:JSON.stringify(razorpay),
        }).then(async (data) => {
            const from = "bluehorsetest@gmail.com"
            let mailOptions = {
                from: `"iUdyog" <${from}>`,
                to: `${storeDetails.email}`,
                subject: "Course buying information",
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
                        <p>${name} buyed ${courseName} course at price ${amount}.</p>
                        <h5>Buyer Information :</h5>
                        <p>Email : ${email}.</p>
                        <p>Mobile No : ${mobile}.</p>
                        <p>Class : ${classs}.</p>
                        <p>Address : ${address}.</p>
                    </body>
                </html>`
            };
            mailgun.messages().send(mailOptions, function (error, body) {
                let mailOptions2 = {
                    from: `${storeDetails.storeName} <${storeDetails.email}>`,
                    to: `${email}`,
                    subject: "Thank you for purchasing our course",
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
                            <p>Dear ${name},</p>
                            <p>Thank you for purchasing ${courseName} course at price ${amount}.</p>
                        </body>
                    </html>`
                };
                
                mailgun.messages().send(mailOptions2, function (error1, body1) {
                });
            });

            res.status(200).send({ data:{success : true, message: "Successfully payment information save"} ,errorNode:{errorCode:0, errorMsg:"No Error"}});

        }).catch((err) =>{
            res.status(500).send({ data:{success : false, message: "Something went wrong! Please try again"} ,errorNode:{errorCode:1, errorMsg:err}});
        });
                    
    }else{
        res.status(400).send({ data:{success : false, message: "Store id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
    }
}

exports.razorpayInformationList = async(req, res) => {
    const storeId = req.body.data.storeId || "";

    if(storeId && storeId != ''){
    	const razorpayDetails = await models.razorpay.findAll({attributes:['id','courseName','amount','mobile','email','name','duration','class','fees','installment','address','payment','razorpay_payment_id','paymentId','cardId','method','createdAt'], where:{storeId:storeId}, order:[['id','DESC']]})
		
		if (razorpayDetails.length > 0) {
			res.status(200).send({ data:{success : true, details: razorpayDetails} ,errorNode:{errorCode:0, errorMsg:"No Error"}});
		} else {
			res.status(200).send({ data:{success : true, details: []} ,errorNode:{errorCode:0, errorMsg:"No Data Found"}});
		}
    }else{
        res.status(400).send({ data:{success : false, message: "StoreId is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
    }
}