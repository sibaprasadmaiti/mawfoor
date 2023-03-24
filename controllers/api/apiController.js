"using strict";
var models = require('../../models');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
var bcrypt 				= require('bcrypt-nodejs');
var formidable = require('formidable');
var multiparty = require('multiparty'); 
var bodyParser = require('body-parser');
var fs = require('file-system');
var crypto = require('crypto');
var config = require('../../config/config.json');
var Sequelize = require("sequelize");
// For Mail Send Through MailGun
const emailConfig = require('../../config/email-config')();
const mailgun = require('mailgun-js')(emailConfig);
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
    }
);

exports.index = function(req, res) {
    var token = req.headers['token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    jwt.verify(token, SECRET, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        models.users.findAll().then(function(users) {
            if (users.length) {
                res.status(200).send({ status:200,message: "successfully login",users:users, token: token });
            }
        }).catch(function(error) {
            return res.send(error);
        });
    });
};

exports.userlogin = function(req, res) {   
    models.users.findOne({ where: {'email':req.body.data.email, status:'active'} }).then(function(users) {
        if(users!=null){
            user = users.toJSON();    
            if(!bcrypt.compareSync(req.body.data.password, user.password)) {
                res.status(200).send({ message: "password wrong" });
            } else {            
                if (req.body.data.email == users.email) {            
                    var token =    jwt.sign({users}, SECRET, { expiresIn: 18000 });
                    res.status(200).send({ status:200,message: "success", token: token,userdetail:users });                
                } else {            
                    res.status(200).send({ message: "No user found" });
                }                
            }
        }else{            
            res.status(200).send({ message: "No user found" });
        }
    }).catch(function(error) {
        return res.send(error);
    });
};

exports.userforgot = function(req, res) { 
    models.users.findOne({ where: {'email':req.body.data.email, status:'active'} }).then(function(users) {
        if(users!=null){
            if (req.body.data.email == users.email) {
                crypto.randomBytes(20, function(err, buffer) {
                    var token = buffer.toString('hex');
                    console.log(token)
                    models.users.update({ 
                        reset_password_token: token,
                        reset_password_expires: Date.now() + 86400000
                    },{where:{id:users.id}}).then(function(user) {
                        new Promise((resolve, reject) => {
                            const data = {
                                from: "admin@epclens.com",
                                to: users.email,
                                subject: 'Forget Password Email',
                                text: 'message.text',
                                html: '<!DOCTYPE html>'+
                                '<html>'+    
                                    '<head>'+
                                        '<title>Forget Password Email</title>'+
                                    '</head>'+    
                                    '<body>'+
                                        '<div>'+
                                            '<h3>Dear '+users.firstName+',</h3>'+
                                            '<p>You requested for a password reset, kindly use this <a href="'+req.app.locals.frontendurl+'#/reset/'+token+'">link</a> to reset your password</p>'+
                                            '<br>'+
                                            '<p>Cheers!</p>'+
                                        '</div>'+
                                    '</body>'+
                                '</html>'
                            };
                            mailgun.messages().send(data, (error) => {
                                if (error) {
                                console.log(error)
                                res.status(200).send({ message: "No user found" });
                                }
                                console.log('resolve')
                                res.status(200).send({ status:200,message: "success", token: token,userdetail:users });
                            });
                        });
                    })                    
                });           
            } else {            
                res.status(200).send({ message: "No user found" });
            }       
        } else {            
            res.status(200).send({ message: "No user found" });
        }
    }).catch(function(error) {
        return res.send(error);        
    });
};

exports.userreset = function(req, res) { 
    models.users.findOne({ where: {reset_password_token: req.body.data.token, status:'active',reset_password_expires: { $gt: Date.now() }} }).then(function(users) {
        if(users!=null){
            if (req.body.data.newPassword === req.body.data.verifyPassword) {
                var password = req.body.data.verifyPassword;
                var hash = bcrypt.hashSync(password);
                models.users.update({ 
                    password:hash,
                    reset_password_token: '',
                    reset_password_expires: ''
                },{where:{id:users.id}}).then(function(user) {
                    return res.status(200).send({ message: 'Password reset'});
                })
            } else {
                return res.status(200).send({
                    message: 'Passwords do not match'
                });
            }
        } else {
            return res.status(200).send({
                message: 'Password reset token is invalid or has expired.'
            });
        }
    }).catch(function(error) {
        return res.send(error);
    });
};

exports.confirmpassword = function(req, res) { 
    console.log(req.params)
    var id=req.params.userid;
    models.users.findOne({ where: {status:'active',id: id} }).then(function(users) {
        console.log(users);
        if(users!=null){
            user = users.toJSON();
            if(!bcrypt.compareSync(req.params.password, user.password)) {
                return res.status(400).send({
                    message: 'Password reset token is invalid or has expired.'
                });
            } else {
                res.status(200).send({ message: "password right" });
            }   
        } else {
            return res.status(400).send({
                message: 'Password reset token is invalid or has expired.'
            });
        }
    }).catch(function(error) {
        return res.send(error);
    });
};

exports.changepassword = function(req, res) { 
    console.log(req.params)
    var id=req.params.userid;
    models.users.findOne({ where: {status:'active',id: id} }).then(function(users) {
        console.log(users);
        if(users!=null){
            user = users.toJSON();
            if (req.params.newPassword === req.params.verifyPassword) {
                var password = req.params.verifyPassword;
                var hash = bcrypt.hashSync(password);
                models.users.update({ 
                    password:hash,
                },{where:{id:user.id}}).then(function(user) {
                    models.users.findOne({ where: {'id':id} }).then(function(users) {
                        if(users!=null){
                            user = users.toJSON();
                            var token = jwt.sign({users}, SECRET, { expiresIn: 18000 });
                            return res.status(200).send({ status:200,message: "Password is changed.", token: token,userdetail:users });
                        } else {
                            res.status(200).send({ message: "No user found." });
                        }
                    })
                })
            }else{
                return res.status(403).send({
                    message: 'Password did not match.'
                });
            }
        } else {
            return res.status(400).send({
                message: 'No user found.'
            });
        }
    }).catch(function(error) {
        return res.send(error);
    });
};

exports.login = function(req, res) {
    models.users.findOne({ where: {'phone':req.body.data.phone} }).then(function(users) {
        if(users!=null){
            if (req.body.data.phone == users.phone) {
               var token =    jwt.sign({users}, SECRET, { expiresIn: 18000 });
               res.status(200).send({ status:200,message: "successfully login", token: token });
            } else {
               res.status(200).send({ message: "No user found" });
            }
		} else {
            res.status(200).send({ message: "No user found" });
        }
    }).catch(function(error) {
        return res.send(error);
    });
};

exports.register= function(req,res) {	
    var token = req.headers['token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    jwt.verify(token, SECRET, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        var userdata=req.body.data;
        var usernamePromise = models.users.findAll({ 
            where: {
                $or: [{
                    email: userdata.email
                },{
                    phone: userdata.phone
                }]
            }
        });
        return usernamePromise.then(function(result) {
            if(result.length){
                res.status(200).send({ message: "user id or phone noalready exists." });
            } else {
                res.send(userdata);
            }
        });
    });
};

exports.roledetails = function(req, res) {
    var token= req.headers['token'];
    var id=req.params.id;
    jwt.verify(token, SECRET, function(err, decoded) {
        if (err) {
            res.json('Invalid Token');
        } else {
            models.role.findAll({attributes: ['name','slag'], where: {id:id}}).then(function(data) {
                res.json(data);
            }).catch(function(error) {
                return res.send(error);
            });
        }
    });
};

exports.userdetails = function(req, res) {
    var token=req.query.token;
    var id=req.query.id;
    jwt.verify(token, SECRET, function(err, decoded) {
        if (err) {
            res.json('Invalid Token');
        } else {
            res.json(decoded);
            models.users.findById(id).then(function(users) {
                res.json(users);
            }).catch(function(error) {
                return res.send(error);
            });
        }
    });
};

function slugify(text) {
    return text.toString().toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, '-') 
}

exports.getchatnoti = function(req, res) {    
    var token= req.headers['token'];
	jwt.verify(token, SECRET, function(err, decoded) { 
		if (err) {
			res.status(200).send({data:{verified:false},errNode:{errMsg:"Invalid Token",errCode:"1"}});
		} else {
            sequelize.query("SELECT count(*) as noti FROM chatting  where item_id!=user_id and isvisible='no' and item_id ="+decoded.users.id+"",{ type: Sequelize.QueryTypes.SELECT }).then(function(chats){   
		        res.json(chats);
            }).catch(function(error) {
                res.status(400).send({data:{verified:false},errNode:{errMsg:error,errCode:"1"}});
            });
		}          
	});             
};

exports.gethtmlByUrl = function(req, response) {
    var slug=req.params.slug;
    var http = require('https');
    var options = {
        host: 'epclens.com',
        path: '/'+slug+'/frame'
    }
    var request = http.request(options, function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            response.json(data);
        });
    });
    request.on('error', function (e) {
        console.log(e.message);
    });
    request.end();
};


exports.userTransectionList = async function(req,res){
	const { id} = req.body;
	if(id){
		var user_details = await models.users.findOne({attributes:['id','email_id','description'], where:{id:id}});
		if(user_details){
            var user_transection_list = await models.wallet.findAll({ where:{user_id:id}, order: [['id', 'DESC']]});
			if(user_transection_list.length > 0){
                res.status(200).send({success: true, message: 'User transection list found', user_transection_list: user_transection_list});
            } else {
                res.status(200).send({success: true, message: 'No transection history found'});
            }
		}else{
			res.status(200).send({success: false, message: 'No user found'});
		}
	}else{
		res.status(200).send({success: false, message: 'Please provied user id'});
	}
}

exports.userWalletBalance = async function(req,res){
	const { id} = req.body;
	if(id){
		var user_details = await models.users.findOne({attributes:['id','email_id'], where:{id:id}});
		if(user_details){
            var user_waller_balance = await sequelize.query("SELECT id, user_id, cash_balance, promotion_balance FROM `wallet` where user_id = "+id+" order BY id DESC LIMIT 1",{ type: Sequelize.QueryTypes.SELECT });
			if(user_waller_balance.length > 0){
                res.status(200).send({success: true, message: 'User wallet balance found', user_waller_balance: Number(user_waller_balance[0].cash_balance)});
            } else {
                res.status(200).send({success: true, message: 'No transection history found', user_waller_balance: 0});
            }
		}else{
			res.status(200).send({success: false, message: 'No user found'});
		}
	}else{
		res.status(200).send({success: false, message: 'Please provied user id'});
	}
}

exports.userWalletDebit = async function(req,res){
    const { id} = req.body;
    const { amount} = req.body;
	if(id){
        if(amount){
            var user_details = await models.users.findOne({attributes:['id','email_id'], where:{id:id}});
            if(user_details){

                var user_waller_balance = await sequelize.query("SELECT id, user_id, cash_balance, promotion_balance FROM `wallet` where user_id = "+id+" order BY id DESC LIMIT 1",{ type: Sequelize.QueryTypes.SELECT });
                if(user_waller_balance.length > 0){
                    var waller_balance = Number(user_waller_balance[0].cash_balance);
                } else {
                    var waller_balance = 0;
                }
                models.user_request_transfer_to_bank.create({
                    user_id: id,
                    amount: Number(amount),
                    status: 'pending',
                    created_by: id,
                    created_at  : Date.now(),
                    updated_at  : Date.now()
                })
                res.status(200).send({success: true, message: 'Your request successfully submitted', user_waller_balance: waller_balance });

                // var user_waller_balance = await sequelize.query("SELECT id, user_id, cash_balance, promotion_balance FROM `wallet` where user_id = "+id+" order BY id DESC LIMIT 1",{ type: Sequelize.QueryTypes.SELECT });
                // if(user_waller_balance.length > 0){

                //     var user_balance = Number(user_waller_balance[0].cash_balance);
                //     var debit_amount = Number(amount);
                //     if(user_balance >= debit_amount){
                //         models.wallet.create({
                //             user_id: id,
                //             cash_balance: Number(user_waller_balance[0].cash_balance)-Number(amount),
                //             amount: '-'+Number(amount),
                //             amount_type: 'debit',
                //             remark: 'Bank Transfer',
                //             created_at  : Date.now(),
				// 		    updated_at  : Date.now()
                //         }).then(async function (wallet) {
                //             if(wallet){
                //                 res.status(200).send({success: true, message: 'Amount successfully debited form your wallet', user_waller_balance: Number(wallet.cash_balance)});
                //             }else{
                //                 res.status(200).send({success: false, message: 'Something went wrong. please try again.'});
                //             }
                //         });
                //     }else{
                //         res.status(200).send({success: false, message: 'Insufficient balance in your wallet'});
                //     }    
                // } else {
                //     res.status(200).send({success: true, message: 'User has no wallet balance'});
                // }
            }else{
                res.status(200).send({success: false, message: 'No user found'});
            }
        }else{
            res.status(200).send({success: false, message: 'Amount is required'});
        }
	}else{
		res.status(200).send({success: false, message: 'User id is required'});
	}
}


exports.userPaymentCardAdd = async function(req,res){
    const { id} = req.body;
    const { card_number} = req.body;
    const { card_holder_name} = req.body;
    const { expired_date} = req.body;
    const { is_default} = req.body;
    var resultArray = [];

    if(id){
        if(card_number){
            if(card_holder_name){
                if(expired_date){
                    // if(is_default){
                        var user_details = await models.users.findOne({attributes:['id','email_id'], where:{id:id}});
                        if(user_details){
                            var user_card_details = await models.user_payment_card.findAll({attributes:['id','user_id','card_number'], where:{user_id:id,card_number:card_number}});
                            if(user_card_details.length <= 0){
                                // var user_card_listing = await models.user_payment_card.findAll({attributes:['id','user_id','card_number'], where:{user_id:id}});
                                // if(user_card_listing.length > 0){
                                //     var card_is_prime = 0;
                                // } else {
                                //     var card_is_prime = 1;
                                // }

                                if(is_default == 1){

                                    models.user_payment_card.update({
                                        is_default: 0,
                                    },{ where: { user_id: id } }).then(async function (user_payment_card) {
                                        models.user_payment_card.create({
                                            user_id: id,
                                            card_number: card_number,
                                            card_holder_name: card_holder_name,
                                            expired_date: expired_date,
                                            is_default: 1,
                                            created_at  : Date.now(),
                                            updated_at  : Date.now()
                                        }).then(async function (user_payment_card) {
                                            if(user_payment_card){

                                                var user_card_listing = await models.user_payment_card.findAll({where:{user_id:id}});
                                                if(user_card_listing.length > 0){
                                                    user_card_listing.forEach(async function(element,index){
                                                        var last_fore_digite = element.card_number.slice(-4);

                                                        resultArray.push({
                                                            "id": element.id,
                                                            "user_id": element.user_id,
                                                            "card_number": element.card_number,
                                                            "card_holder_name": element.card_holder_name,
                                                            "expired_date": element.expired_date,
                                                            "is_default": element.is_default,
                                                            "created_at": element.created_at,
                                                            "updated_at": element.updated_at,
                                                            "last_fore_digite": last_fore_digite
                                                        });
                                                    });
                                                    res.status(200).send({success: true, message: 'Card successfully saved', user_card_listing: resultArray});
                                                } else {
                                                    res.status(200).send({success: false, message: 'No card found'});
                                                }
                                            }else{
                                                res.status(200).send({success: false, message: 'Something went wrong. please try again.'});
                                            }
                                        });
                                    });
                                } else {
                                    models.user_payment_card.create({
                                        user_id: id,
                                        card_number: card_number,
                                        card_holder_name: card_holder_name,
                                        expired_date: expired_date,
                                        is_default: 0,
                                        created_at  : Date.now(),
                                        updated_at  : Date.now()
                                    }).then(async function (user_payment_card) {
                                        if(user_payment_card){

                                            var user_card_listing = await models.user_payment_card.findAll({where:{user_id:id}});
                                            if(user_card_listing.length > 0){
                                                user_card_listing.forEach(async function(element,index){
                                                    var last_fore_digite = element.card_number.slice(-4);

                                                    resultArray.push({
                                                        "id": element.id,
                                                        "user_id": element.user_id,
                                                        "card_number": element.card_number,
                                                        "card_holder_name": element.card_holder_name,
                                                        "expired_date": element.expired_date,
                                                        "is_default": element.is_default,
                                                        "created_at": element.created_at,
                                                        "updated_at": element.updated_at,
                                                        "last_fore_digite": last_fore_digite
                                                    });
                                                });
                                                res.status(200).send({success: true, message: 'Card successfully saved', user_card_listing: resultArray});
                                            } else {
                                                res.status(200).send({success: false, message: 'No card found'});
                                            }
                                        }else{
                                            res.status(200).send({success: false, message: 'Something went wrong. please try again.'});
                                        }
                                    });

                                } 
                            }else{
                                res.status(200).send({success: false, message: 'This card already added in your list'});
                            }
                        }else{
                            res.status(200).send({success: false, message: 'No user found'});
                        }
                    // }else{
                    //     res.status(200).send({success: false, message: 'Card prime or not is required'});
                    // }
                }else{
                    res.status(200).send({success: false, message: 'Card expired date is required'});
                }
            }else{
                res.status(200).send({success: false, message: 'Card holder name is required'});
            }
        }else{
            res.status(200).send({success: false, message: 'Card number is required'});
        }
    }else{
		res.status(200).send({success: false, message: 'User id is required'});
	}
}


exports.userPaymentCardList = async function(req,res){
    const { id} = req.body;
    var resultArray = [];
	if(id){
		var user_details = await models.users.findOne({attributes:['id','email_id','description'], where:{id:id}});
		if(user_details){
            var user_card_listing = await models.user_payment_card.findAll({where:{user_id:id}});
			if(user_card_listing.length > 0){
                user_card_listing.forEach(async function(element,index){
                    // var last_fore_digite = lement.card_number.substring(str.length - 4, str.length);
                    var last_fore_digite = element.card_number.slice(-4);

                    resultArray.push({
                        "id": element.id,
                        "user_id": element.user_id,
                        "card_number": element.card_number,
                        "card_holder_name": element.card_holder_name,
                        "expired_date": element.expired_date,
                        "is_default": element.is_default,
                        "created_at": element.created_at,
                        "updated_at": element.updated_at,
                        "last_fore_digite": last_fore_digite
                    });
                });

                res.status(200).send({success: true, message: 'User card list found', user_card_listing: resultArray});
            } else {
                res.status(200).send({success: false, message: 'No card found'});
            }
		}else{
			res.status(200).send({success: false, message: 'No user found'});
		}
	}else{
		res.status(200).send({success: false, message: 'User id is required'});
	}
}


exports.userPaymentCardDelete = async function(req,res){
    const { id} = req.body;
    const { card_id} = req.body;
    var resultArray = [];
	if(id){
		var user_details = await models.users.findOne({attributes:['id','email_id','description'], where:{id:id}});
		if(user_details){
            var user_card_details = await models.user_payment_card.findOne({attributes:['id','user_id','card_number','is_default'], where:{id:card_id}});
			if(user_card_details){
                models.user_payment_card.destroy({
                    where: { id:card_id },
                }).then(async function (user_payment_card) {
                    if(user_payment_card){
                        var user_card_listing = await models.user_payment_card.findAll({where:{user_id:id}, order: [['id', 'DESC']]});
                        if(user_card_listing.length > 0){
                            if(user_card_details.is_default == 1){
                                models.user_payment_card.update({
                                    is_default: 1,
                                },{ where: { id: user_card_listing[0].id } }).then(async function (user_payment_card_set_default) {
                                    if(user_payment_card_set_default){
                                        var user_card_listing_after_update = await models.user_payment_card.findAll({where:{user_id:id}});
                                        if(user_card_listing_after_update.length > 0){
                                            user_card_listing_after_update.forEach(async function(element,index){
                                                var last_fore_digite = element.card_number.slice(-4);
                            
                                                resultArray.push({
                                                    "id": element.id,
                                                    "user_id": element.user_id,
                                                    "card_number": element.card_number,
                                                    "card_holder_name": element.card_holder_name,
                                                    "expired_date": element.expired_date,
                                                    "is_default": element.is_default,
                                                    "created_at": element.created_at,
                                                    "updated_at": element.updated_at,
                                                    "last_fore_digite": last_fore_digite
                                                });
                                            });
                                            res.status(200).send({success: true, message: 'Card successfully delete from your list', user_card_listing: resultArray});
                                        } else {
                                            res.status(200).send({success: true, message: 'Card successfully delete from your list', user_card_listing: []});
                                        }
                                    }else{
                                        res.status(200).send({success: true, message: 'Card successfully delete from your list', user_card_listing: []});
                                    }
                                });

                            } else {
                                user_card_listing.forEach(async function(element,index){
                                    var last_fore_digite = element.card_number.slice(-4);
                
                                    resultArray.push({
                                        "id": element.id,
                                        "user_id": element.user_id,
                                        "card_number": element.card_number,
                                        "card_holder_name": element.card_holder_name,
                                        "expired_date": element.expired_date,
                                        "is_default": element.is_default,
                                        "created_at": element.created_at,
                                        "updated_at": element.updated_at,
                                        "last_fore_digite": last_fore_digite
                                    });
                                });
                                res.status(200).send({success: true, message: 'Card successfully delete from your list', user_card_listing: resultArray});
                            }
                        } else {
                            res.status(200).send({success: true, message: 'Card successfully delete from your list', user_card_listing: []});
                        }
                    }else{
                        res.status(200).send({success: false, message: 'Something went wrong. please try again.'});
                    }
                });
            } else {
                res.status(200).send({success: false, message: 'No card found'});
            }
		}else{
			res.status(200).send({success: false, message: 'No user found'});
		}
	}else{
		res.status(200).send({success: false, message: 'User id is required'});
	}
}


exports.userPaymentCardSetDefault = async function(req,res){
    const { id} = req.body;
    const { card_id} = req.body;
    var resultArray = [];
	if(id){
		var user_details = await models.users.findOne({attributes:['id','email_id','description'], where:{id:id}});
		if(user_details){
            var user_card_listing = await models.user_payment_card.findAll({where:{user_id:id}});
            if(user_card_listing.length > 0){
                var user_card_details = await models.user_payment_card.findOne({attributes:['id','user_id','card_number'], where:{id:card_id}});
                if(user_card_details){

                    models.user_payment_card.update({
                        is_default: 0,
                    },{ where: { user_id: id } }).then(async function (user_payment_card) {
                        if(user_payment_card){
                            models.user_payment_card.update({
                                is_default: 1,
                            },{ where: { id: card_id } }).then(async function (user_payment_card_set_default) {
                                if(user_payment_card_set_default){
                                    var user_card_listing_after_update = await models.user_payment_card.findAll({where:{user_id:id}});
                                    if(user_card_listing_after_update.length > 0){
                                        user_card_listing_after_update.forEach(async function(element,index){
                                            var last_fore_digite = element.card_number.slice(-4);
                        
                                            resultArray.push({
                                                "id": element.id,
                                                "user_id": element.user_id,
                                                "card_number": element.card_number,
                                                "card_holder_name": element.card_holder_name,
                                                "expired_date": element.expired_date,
                                                "is_default": element.is_default,
                                                "created_at": element.created_at,
                                                "updated_at": element.updated_at,
                                                "last_fore_digite": last_fore_digite
                                            });
                                        });
                                        res.status(200).send({success: true, message: 'Card successfully saved as a default', user_card_listing: resultArray});
                                    } else {
                                        res.status(200).send({success: true, message: 'Card list is empty', user_card_listing: []});
                                    }
                                }else{
                                    res.status(200).send({success: false, message: 'Something went wrong. please try again.'});
                                }
                            });
                        }else{
                            res.status(200).send({success: false, message: 'Something went wrong. please try again.'});
                        }
                    });
                } else {
                    res.status(200).send({success: false, message: 'No card found'});
                }
            } else {
                res.status(200).send({success: false, message: 'you have no card saved'});
            }
		}else{
			res.status(200).send({success: false, message: 'No user found'});
		}
	}else{
		res.status(200).send({success: false, message: 'User id is required'});
	}
}

exports.userDefaultCardDetails = async function(req,res){
    const { id} = req.body;
    var resultArray = [];
	if(id){
		var user_details = await models.users.findOne({attributes:['id','email_id','description'], where:{id:id}});
		if(user_details){
            var user_default_card_details = await models.user_payment_card.findAll({where:{user_id:id,is_default:1}});
			if(user_default_card_details.length > 0){
                user_default_card_details.forEach(async function(element,index){
                    var last_fore_digite = element.card_number.slice(-4);

                    resultArray.push({
                        "id": element.id,
                        "user_id": element.user_id,
                        "card_number": element.card_number,
                        "card_holder_name": element.card_holder_name,
                        "expired_date": element.expired_date,
                        "is_default": element.is_default,
                        "created_at": element.created_at,
                        "updated_at": element.updated_at,
                        "last_fore_digite": last_fore_digite
                    });
                });

                res.status(200).send({success: true, message: 'User card list found', user_default_card_details: resultArray[0]});
            } else {
                res.status(200).send({success: false, message: 'User have no default card'});
            }
		}else{
			res.status(200).send({success: false, message: 'No user found'});
		}
	}else{
		res.status(200).send({success: false, message: 'User id is required'});
	}
}


exports.chatFileTransfer = async function(req,res){
    const { author_id} = req.body;
    const { chat_session_id} = req.body;
    const { author_type} = req.body;

    const { file} = req.body;
    const { extension} = req.body;

	if(author_id){
        if(author_type){
            if(chat_session_id){
                var receiver_details  = await models.chat_session.findOne({attributes:['id','pro_id','caller_id'],where:{id:chat_session_id}});

                if(author_type == 'Caller'){
                    var reciver = receiver_details.pro_id;
                } else if(author_type == 'Pro'){
                    var reciver = receiver_details.caller_id;
                } else {
                    res.status(200).send({success: false, message: 'Sender type dose not match'});
                }


                var dir = './public/users_contents/message/'; 
                console.log(dir);
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);                  
                }

                if(file && file != '' && extension && extension !='') {
                    var file_name = Date.now();
                    var path = './public/users_contents/message/'+ file_name +'.'+extension;
                    var user_file = req.app.locals.baseurl+'users_contents/message/'+ file_name +'.'+extension;   
                    try {
                        const imgdata = file;
                        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                        fs.writeFileSync(path, base64Data,  {encoding: 'base64'});

                        models.chat_data.create({       
                            session_id : chat_session_id,
                            author_id : author_id,
                            receiver_id : reciver,
                            chat_datetime : Date.now(),
                            // message : user_file,
                            file : user_file,
                            is_read : 0,
                            sender_is_read : 1,
                            created_by : author_id,
                            updated_by : author_id,
                            created_at : Date.now(),
                            updated_at : Date.now(),
                        })  
                    } catch (e) {
                        next(e);
                    }
                    res.status(200).send({ success: true, message: "Media successfully submit" });
                } else {
                    res.status(200).send({success: false, message: 'Media file and media extension is required'});
                }
                    
            }else{
                res.status(200).send({success: false, message: 'Chat session id is required'});
            }
        }else{
            res.status(200).send({success: false, message: 'Sender type is required'});
        }
	}else{
		res.status(200).send({success: false, message: 'Sender id is required'});
	}
}


exports.userChatList = async function(req,res){
    const { sender} = req.body;
    const { receiver} = req.body;
    const { authorType} = req.body;
    var resultArray = [];
	if(sender){
        if(receiver){
            if(authorType){
                var senderDetails = await models.users.findOne({where:{user_name:sender},attributes:['id','user_name','is_pro']});
                var receiverDetails = await models.users.findOne({where:{user_name:receiver},attributes:['id','user_name','is_pro']});
                if(authorType == 'Caller'){
                    var chatSessionDetails = await models.chat_session.findOne({where:{caller_id:senderDetails.id, pro_id:receiverDetails.id},attributes:['id','caller_id','pro_id','status']});
                } else {
                    var chatSessionDetails = await models.chat_session.findOne({where:{pro_id:senderDetails.id, caller_id:receiverDetails.id},attributes:['id','caller_id','pro_id','status']});
                }

                var usersChatList = await models.chat_data.findAll({where:{session_id:chatSessionDetails.id},attributes:['id','session_id','author_id', 'receiver_id','chat_datetime','message', 'is_read','sender_is_read', 'system_message_type', 'system_message', 'appointment', 'file'],order: [['id', 'DESC']],});
                // var usersChatList = await sequelize.query("SELECT * FROM `chat_data` WHERE (author_id = "+senderDetails.id+" and receiver_id = "+receiverDetails.id+") or (author_id = "+receiverDetails.id+" and receiver_id = "+senderDetails.id+") and session_id = "+chatSessionDetails.id+" order by id DESC",{type: Sequelize.QueryTypes.SELECT});

                if(usersChatList.length > 0){

                    usersChatList.forEach(async function(element,index){
    
                        resultArray.push({
                            "id": element.id,
                            "chat_data_id": element.id,
                            "session_id": element.session_id,
                            "author_id": element.author_id,
                            "receiver_id": element.receiver_id,
                            "chat_datetime": element.chat_datetime,
                            "message": element.message,
                            "appointment": JSON.parse(element.appointment),
                            "is_read": element.is_read,
                            "read_datetime": element.read_datetime,
                            "file": element.file,
                            "file_name": element.file != null ? element.file.substring(element.file.lastIndexOf('/')+1) : null
                        });
                    });

                    res.status(200).send({success: true, message: 'User chat list found', usersChatList: resultArray});
                }else{
                    res.status(200).send({success: true, message: 'No chat found', usersChatList: []});
                }
            }else{
                res.status(200).send({success: false, message: 'Sender type is required'});
            }
        }else{
            res.status(200).send({success: false, message: 'Receiver user name is required'});
        }
	}else{
		res.status(200).send({success: false, message: 'Sender user name is required'});
	}
}


exports.userProfilePicture = async function(req,res){
	const { id} = req.body;
	if(id){
		var user_details = await models.users.findOne({attributes:['id','email_id'], where:{id:id}});
		if(user_details){
            var user_list = await sequelize.query("select id, email_id, user_name, profile_image from `users` where `id` = "+id,{ type: Sequelize.QueryTypes.SELECT });
			if(user_list.length > 0){

                    if(user_list[0].profile_image !='' && user_list[0].profile_image != null){
                        var user_profile_picture = req.app.locals.baseurl+'users_contents/Users/'+id+'/'+user_list[0].profile_image;
                    }else{
                        var user_profile_picture = req.app.locals.baseurl+'users_contents/Users/user.png';
                    }

                res.status(200).send({success: true, message: 'User profile Picture found', user_profile_picture: user_profile_picture});
            } else {
                res.status(200).send({success: true, message: ''});
            }
		}else{
			res.status(200).send({success: false, message: 'No user found'});
		}
	}else{
		res.status(200).send({success: false, message: 'user id is required'});
	}
}


exports.adminChatFileTransfer = async function(req,res){
    const { author_id} = req.body;
    const { author_type} = req.body;

    const { file} = req.body;
    const { extension} = req.body;

	if(author_id){
        if(author_type){

            var users = await models.users.findOne({where:{id:author_id},attributes:['is_pro']});
            if(users.is_pro == "Yes"){
                var procheck = await models.admin_chat_session.findOne({where:{pro_id:author_id,admin_id : 0}})
                if(!procheck){
                    models.admin_chat_session.create({
                        pro_id : author_id,
                        admin_id : 0,
                        status: "active"
                    }).then(function(admin_chat_session) { 
                        var dir = './public/users_contents/message/'; 
                        console.log(dir);
                        if (!fs.existsSync(dir)){
                            fs.mkdirSync(dir);                  
                        }
            
                        if(file && file != '' && extension && extension !='') {
                            var file_name = Date.now();
                            var path = './public/users_contents/message/'+ file_name +'.'+extension;
                            var user_file = req.app.locals.baseurl+'users_contents/message/'+ file_name +'.'+extension;   
                            try {
                                const imgdata = file;
                                const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                                fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
            
                                models.admin_chat_data.create({       
                                    session_id : admin_chat_session.id,
                                    author_id : author_id,
                                    chat_datetime : Date.now(),
                                    file : user_file,
                                    is_read : 0,
                                    author_type : author_type,
                                    created_by : author_id,
                                    created_at : Date.now(),
                                    updated_at : Date.now(),
                                })  
                            } catch (e) {
                                next(e);
                            }
                            res.status(200).send({ success: true, message: "Media successfully submit" });
                        } else {
                            res.status(200).send({success: false, message: 'Media file and media extension is required'});
                        }
                    })
                } else {

                    var session_id = await models.admin_chat_session.findOne({where:{pro_id:author_id,admin_id : 0}});
                    var dir = './public/users_contents/message/'; 
                    console.log(dir);
                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);                  
                    }
        
                    if(file && file != '' && extension && extension !='') {
                        var file_name = Date.now();
                        var path = './public/users_contents/message/'+ file_name +'.'+extension;
                        var user_file = req.app.locals.baseurl+'users_contents/message/'+ file_name +'.'+extension;   
                        try {
                            const imgdata = file;
                            const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                            fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
        
                            models.admin_chat_data.create({       
                                session_id : session_id.id,
                                author_id : author_id,
                                chat_datetime : Date.now(),
                                file : user_file,
                                is_read : 0,
                                author_type : author_type,
                                created_by : author_id,
                                created_at : Date.now(),
                                updated_at : Date.now(),
                            })  
                        } catch (e) {
                            next(e);
                        }
                        res.status(200).send({ success: true, message: "Media successfully submit" });
                    } else {
                        res.status(200).send({success: false, message: 'Media file and media extension is required'});
                    }
                }
            }else{
                var callercheck = await models.admin_chat_session.findOne({where:{caller_id:author_id,admin_id : 0}});
                if(!callercheck){
                    models.admin_chat_session.create({
                        caller_id : author_id,
                        admin_id : 0,
                        status: "active"
                    }).then(function(admin_chat_session) { 
                        var dir = './public/users_contents/message/'; 
                        console.log(dir);
                        if (!fs.existsSync(dir)){
                            fs.mkdirSync(dir);                  
                        }
            
                        if(file && file != '' && extension && extension !='') {
                            var file_name = Date.now();
                            var path = './public/users_contents/message/'+ file_name +'.'+extension;
                            var user_file = req.app.locals.baseurl+'users_contents/message/'+ file_name +'.'+extension;   
                            try {
                                const imgdata = file;
                                const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                                fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
            
                                models.admin_chat_data.create({       
                                    session_id : admin_chat_session.id,
                                    author_id : author_id,
                                    chat_datetime : Date.now(),
                                    file : user_file,
                                    is_read : 0,
                                    author_type : author_type,
                                    created_by : author_id,
                                    created_at : Date.now(),
                                    updated_at : Date.now(),
                                })  
                            } catch (e) {
                                next(e);
                            }
                            res.status(200).send({ success: true, message: "Media successfully submit" });
                        } else {
                            res.status(200).send({success: false, message: 'Media file and media extension is required'});
                        }
                    })
                } else {

                    var session_id = await models.admin_chat_session.findOne({where:{caller_id:author_id,admin_id : 0}});
                    var dir = './public/users_contents/message/'; 
                    console.log(dir);
                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);                  
                    }
        
                    if(file && file != '' && extension && extension !='') {
                        var file_name = Date.now();
                        var path = './public/users_contents/message/'+ file_name +'.'+extension;
                        var user_file = req.app.locals.baseurl+'users_contents/message/'+ file_name +'.'+extension;   
                        try {
                            const imgdata = file;
                            const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                            fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
        
                            models.admin_chat_data.create({       
                                session_id : session_id.id,
                                author_id : author_id,
                                chat_datetime : Date.now(),
                                file : user_file,
                                is_read : 0,
                                author_type : author_type,
                                created_by : author_id,
                                created_at : Date.now(),
                                updated_at : Date.now(),
                            })  
                        } catch (e) {
                            next(e);
                        }
                        res.status(200).send({ success: true, message: "Media successfully submit" });
                    } else {
                        res.status(200).send({success: false, message: 'Media file and media extension is required'});
                    }
                }
            }
        }else{
            res.status(200).send({success: false, message: 'Sender type is required'});
        }
	}else{
		res.status(200).send({success: false, message: 'Sender id is required'});
	}
}
//*****For Comming Soon Page Link
exports.emailadd = async function(req, res){
    const email = req.body.email;
    if (email && email !=''){
        var emailDuplicateCheck = await models.customerReview.count({ where: { 'emailId': email}});
        console.log(emailDuplicateCheck);
        if (emailDuplicateCheck==0){
            models.customerReview.create({
                emailId: email,
                created_at: Date.now(),
                updated_at: Date.now(),
            }).then(function (customerReview) {
                if (customerReview){
                    res.status(200).send({ success: true, message: "Thank your for Connecting with us." });
                }else{
                    res.status(200).send({ success: false, message: "Please try again." });
                }
            });
        }else{
            res.status(200).send({ success: false, message: "Email already exist." });
        }
    }
}


exports.dashboard = function (req, res, next) {
    console.log(req.headers);
    var token = req.headers["token"];
    // var storeId = req.headers.storeid;
    var storeId = 30;
    var today = js_yyyy_mm_dd_hh_mm_ss();
    console.log("aaaaaaaaaaaaaaaaaaa-"+req.headers.storeid);
    console.log("bbbbbbbbbbbbbbbbbbb-"+storeId);
    jwt.verify(token, SECRET, function (err, decoded) {
      if (err) {
        res.status(200).send({
          data: { verified: false },
          errNode: { errMsg: "Invalid Token", errCode: "1" },
        });
      } else {
          
        sequelize
          .query(
            "SELECT COUNT(*) as totalData FROM `orders` WHERE `orders`.`storeId` = "+storeId+" and `orderStatus` !='Cancelled' AND `createdAt` >= '" +
              today +
              "' AND `createdAt` < ('" +
              today +
              "' + INTERVAL 1 DAY)",
            { type: Sequelize.QueryTypes.SELECT }
          )
          .then(function (order) {
            sequelize
              .query(
                "SELECT SUM(amountPaid) as todayTotalAmound FROM `orders` WHERE `orders`.`storeId` = "+storeId+" and  `orderStatus` !='Cancelled' AND `createdAt` >= '" +
                  today +
                  "' AND `createdAt` < ('" +
                  today +
                  "' + INTERVAL 1 DAY)",
                { type: Sequelize.QueryTypes.SELECT }
              )
              .then(function (todayTotalAmound) {
                sequelize
                  .query(
                    "SELECT SUM(amountPaid) as totalAmound FROM `orders` WHERE `orders`.`storeId` = "+storeId+" and  `orderStatus` !='Cancelled'",
                    { type: Sequelize.QueryTypes.SELECT }
                  )
                  .then(function (totalAmound) {
                    sequelize
                      .query(
                        "SELECT * FROM `orders` WHERE `orders`.`storeId` = "+storeId+" ORDER BY `orders`.`createdAt` DESC LIMIT 10",
                        { type: Sequelize.QueryTypes.SELECT }
                      )
                      .then(function (newOrder) {
                        sequelize
                          .query(
                            "SELECT COUNT(*) as numberOfProduct, products.title, products.type, products.price FROM orderItems LEFT JOIN products ON orderItems.productId = products.id WHERE `orderItems`.`storeId` = "+storeId+" GROUP BY orderItems.productId ORDER BY numberOfProduct DESC LIMIT 10",
                            { type: Sequelize.QueryTypes.SELECT }
                          )
                          .then(function (product) {
                            //console.log(order)
                            res.status(200).send({
                              status: 200,
                              order: order,
                              todayTotalAmound: todayTotalAmound,
                              totalAmound: totalAmound,
                              newOrder: newOrder,
                              product: product,
                            });
                          });
                      });
                  });
              });
          });


      }
    });
  };
  
function js_yyyy_mm_dd_hh_mm_ss() {
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
    return year + "-" + month + "-" + day + "  00:00:00";
}


exports.syliceGet = async function(req,res){
	
	res.status(200).send({ data:{success : true, message:"suuccessfully hit the api" },errorNode:{errorCode:0, errorMsg:"No Error"}});
			
}


exports.sylicePost = async function(req,res){
    var value = req.body.data.value;
    
	if(value && value != ''){
       
        res.status(200).send({ data:{success : true, data:value, message:"successfully show the value" },errorNode:{errorCode:0, errorMsg:"No Error"}});
			
	}else{
		res.status(200).send({ data:{success : false, message: "Value id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	}
}


exports.testingData = async function(req,res){
    var value = req.body.data.value;
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
	if(value && value != ''){
        // var searchProductList = await sequelize.query("ALTER TABLE `categories` ADD `sequence` INT(11) NULL AFTER `metaImage`",{ type: Sequelize.QueryTypes.SELECT });
        // var cartData = await models.faq.destroy({ where:{ id:{ $ne: null } }});
        // var cartData = await models.subscribers.destroy({ where:{ id:{ $ne: null } }});
        // let cartData = await models.orders.findAll({ where:{ id:636 } });
        let cartData = await models.customers.findAll({ });
        // var cartData = await sequelize.query("select id,title,slug from brands where storeId = 30 and slug='nishane30-5230' and status = 'Yes'",{ type: Sequelize.QueryTypes.SELECT });
        // var cartData = await sequelize.query("select id,title,slug from brands where storeId = 30 and slug='nishane30-2678' and status = 'Yes'",{ type: Sequelize.QueryTypes.SELECT });

        res.status(200).send({ data:{success : true, data:cartData, message:"successfully show the value" },errorNode:{errorCode:0, errorMsg:"No Error"}});
			
	}else{
		res.status(200).send({ data:{success : false, message: "Value id is required"} ,errorNode:{errorCode:1, errorMsg:"Error"}});
	}
}


exports.emailTest_bkp = function (req, res) {

    console.log("111111111111111111111111111111111111111111")


    var htmlSend = `<html lang="en">

    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Details</title>
    
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Montserrat:wght@500;600;700&display=swap"
        rel="stylesheet">
    </head>
    
    <body style="margin: 0px auto; font-family: 'Lato', sans-serif;">
      <table cellspacing="0" cellpadding="0"
        style="width:100%; min-width: 500px; margin: 0px auto; background-color: #fff;">
        <tbody>
          <tr>
            <td style="        
                  vertical-align: top;
                  background-color: #432a43;
                  text-align: center;
                  padding: 10px;
                  height: 80px;
                  display: block;
              ">
              <img style="width: 85px;" src="http://45.79.126.202:3002/favicon.png" alt="">
            </td>
          </tr>
          <tr>
            <td align="center">
              <h3 style="
                  font-family: 'Montserrat', sans-serif;
                  color: #000;
                  font-size: 20px;
                  font-weight: 700;
                  margin: 0px;
                  padding: 10px 0px;">Order Details
              </h3>
            </td>
          </tr>
          <tr>
            <td>
              <table cellspacing="0" cellpadding="0" style="width:100%; padding: 0px 10px; margin-bottom: 7px;">
                <tbody>
                  <tr>
                    <td style="width: 75%;">
                      <ul style="padding-inline-start: 0px; margin: 0px;">
                        <li style="display: inline-block; font-size: 13px; color: #000; font-weight: 400;">Order on 29 June
                          2022</li>
                        <li style="display: inline-block; font-size: 13px; color: #000; font-weight: 400; margin: 0px 6px;">
                          |
                        </li>
                        <li style="display: inline-block; font-size: 13px; color: #000; font-weight: 400;">Order No:
                          #123456789ABCDE</li>
                      </ul>
                    </td>
                    <td align="right" style="width: 35%;">
                      <a style="color: #c49652;
                      text-decoration: none;
                      font-size: 14px;
                      text-transform: uppercase;
                      font-weight: 700;
                      cursor: pointer;" href="#">Invoice</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0px 10px; padding-bottom: 10px;">
              <table cellspacing="0" cellpadding="0"
                style="width:100%; border: solid 1px #ddd; padding: 5px 10px; padding-bottom: 10px;">
                <tbody>
                  <tr>
                    <td style="width: 70%; vertical-align: top;">
                      <h4
                        style="margin: 0px; font-size: 16px; font-weight: 700; color: #000; display: block; margin-bottom: 5px;">
                        Shipping Address</h4>
                      <p style="margin: 0px;
                        font-size: 14px;
                        line-height: 20px;
                        color: #000;
                        padding-right: 15px;">
                        Maikandan Sundaranjan
                        Marasi Drive, Business Bay,
                        Office 301, Lake Central Tower,
                        Business Bay, Dubai, UAE,
                        Dubai, Business Bay
                        United Arab Emirates
                      </p>
                    </td>
                    <td style="width: 30%; vertical-align: top; text-align: right;">
                      <h4
                        style="margin: 0px; font-size: 16px; font-weight: 700; color: #000; display: block; margin-bottom: 5px;">
                        Payment Method</h4>
                      <p style="margin: 0px;
                        font-size: 14px;
                        line-height: 20px;
                        color: #000;">
                        Cash on Delivery (COD)
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="vertical-align: top;">
                      <h4
                        style="margin: 0px; font-size: 16px; font-weight: 700; color: #000; display: block; margin-bottom: 5px; margin-top: 15px;">
                        Order Summary</h4>
                      <ul
                        style="padding-inline-start: 0px; margin: 0px; width: 100%; border: solid 1px #ddd; border-bottom: none; background-color: #f1f1f1;">
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 44%; padding: 8px 10px;">
                          Item(s) Subtotal:</li>
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 46%; padding: 8px 10px; text-align: right;">
                          AED 115.96</li>
                      </ul>
                      <ul
                        style="padding-inline-start: 0px; margin: 0px; width: 100%; border: solid 1px #ddd; border-bottom: none;">
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 44%; padding: 8px 10px;">
                          Shiping & Handling:</li>
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 46%; padding: 8px 10px; text-align: right;">
                          AED 10.00</li>
                      </ul>
                      <ul
                        style="padding-inline-start: 0px; margin: 0px; width: 100%; border: solid 1px #ddd; border-bottom: none; background-color: #f1f1f1;">
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 44%; padding: 8px 10px;">
                          COD Fee:</li>
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 46%; padding: 8px 10px; text-align: right;">
                          AED 10.00</li>
                      </ul>
                      <ul
                        style="padding-inline-start: 0px; margin: 0px; width: 100%; border: solid 1px #ddd; border-bottom: none;">
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 44%; padding: 8px 10px;">
                          Total:</li>
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 46%; padding: 8px 10px; text-align: right;">
                          AED 135.96</li>
                      </ul>
                      <ul
                        style="padding-inline-start: 0px; margin: 0px; width: 100%; border: solid 1px #ddd; border-bottom: none; background-color: #f1f1f1;">
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 44%; padding: 8px 10px;">
                          Promotion Applied:</li>
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 46%; padding: 8px 10px; text-align: right;">
                          -AED 10.00</li>
                      </ul>
                      <ul style="padding-inline-start: 0px; margin: 0px; width: 100%; border: solid 1px #ddd;">
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 44%; padding: 8px 10px; font-weight: 700;">
                          Grand Total:</li>
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 46%; padding: 8px 10px; font-weight: 700; text-align: right;">
                          AED 125.96</li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td>
    
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    
    </html>`;

    const data = {
        from: 'Mawfoor Team<admin@mawfoor.com>',
        // to: 'communication@bluehorse.in',
        // to: 'kamaleshgiri13@gmail.com',
        // to: 'tanbir.bluehorse@gmail.com',
        // to: 'asifur.rahaman@bluehorse.in',
        // to: 'vijay.kumar@bluehorse.in',
        // to: 'mithun.bluehorse@gmail.com',
        // to: 'chandan.dey@bluehorse.in',
        to: 'chandan.dey.444@gmail.com',
        subject: 'mawfoor test',
        html: htmlSend
    };
    mailgun.messages().send(data, function (error, body) {
        console.log(body);
    });

    res.status(200).send({success: false, message: "Oops! Something wrong111 `+ req.app.locals.baseurl + `emailTemplate"});

};

exports.emailTest = async function (req, res) {

    console.log("111111111111111111111111111111111111111111")

    // var orderDetails = await models.orders.findOne({where:{ storeId:30,id:636}}); 
    var orderDetails = await sequelize.query("SELECT *, DATE_FORMAT(createdAt, '%D %M %Y') orderDate FROM `orders` where id = 636", { type: Sequelize.QueryTypes.SELECT });
    var orderDiscountAmount = orderDetails[0].discountAmount ? orderDetails[0].discountAmount : 0.00;
    var orderShippingAmount = orderDetails[0].shippingAmount ? orderDetails[0].shippingAmount : 0.00;


    if(orderDetails[0].shippingAmount && orderDetails[0].shippingAmount != '' && orderDetails[0].shippingAmount != null){
        if(orderDetails[0].discountAmount && orderDetails[0].discountAmount != '' && orderDetails[0].discountAmount != null){
            var orderSubTotal = Number(orderDetails[0].amountPaid) - Number(orderDetails[0].shippingAmount) + Number(orderDetails[0].discountAmount);
            var orderTotal = Number(orderDetails[0].amountPaid) - Number(orderDetails[0].discountAmount);
        } else {
            var orderSubTotal = Number(orderDetails[0].amountPaid) - Number(orderDetails[0].shippingAmount);
            var orderTotal = Number(orderDetails[0].amountPaid);
        }
        
    } else {
        if(orderDetails[0].discountAmount && orderDetails[0].discountAmount != '' && orderDetails[0].discountAmount != null){
            var orderSubTotal = Number(orderDetails[0].amountPaid) + Number(orderDetails[0].discountAmount);
            var orderTotal = Number(orderDetails[0].amountPaid) - Number(orderDetails[0].discountAmount);
        } else {
            var orderSubTotal = Number(orderDetails[0].amountPaid);
            var orderTotal = Number(orderDetails[0].amountPaid);
        }
    }


    var htmlSend = `<html lang="en">

    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Details</title>
    
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Montserrat:wght@500;600;700&display=swap"
        rel="stylesheet">
    </head>
    
    <body style="margin: 0px auto; font-family: 'Lato', sans-serif;">
      <table cellspacing="0" cellpadding="0"
        style="width:100%; min-width: 500px; margin: 0px auto; background-color: #fff;">
        <tbody>
          <tr>
            <td style="        
                  vertical-align: top;
                  background-color: #432a43;
                  text-align: center;
                  padding: 10px;
                  height: 80px;
                  display: block;
              ">
              <img style="width: 85px;" src="https://mawfoor.com/public/assets/img/logo.png" alt="">
            </td>
          </tr>
          <tr>
            <td align="center">
              <h3 style="
                  font-family: 'Montserrat', sans-serif;
                  color: #000;
                  font-size: 20px;
                  font-weight: 700;
                  margin: 0px;
                  padding: 10px 0px;">Order Details
              </h3>
            </td>
          </tr>
          <tr>
            <td>
              <table cellspacing="0" cellpadding="0" style="width:100%; padding: 0px 10px; margin-bottom: 7px;">
                <tbody>
                  <tr>
                    <td style="width: 75%;">
                      <ul style="padding-inline-start: 0px; margin: 0px;">
                        <li style="display: inline-block; font-size: 13px; color: #000; font-weight: 400;">Order on `+ orderDetails[0].orderDate +`</li>
                        <li style="display: inline-block; font-size: 13px; color: #000; font-weight: 400; margin: 0px 6px;">
                          |
                        </li>
                        <li style="display: inline-block; font-size: 13px; color: #000; font-weight: 400;">Order No:
                          #`+ orderDetails[0].orderNo +`</li>
                      </ul>
                    </td>
                    <td align="right" style="width: 35%;">
                      <a style="color: #c49652;
                      text-decoration: none;
                      font-size: 14px;
                      text-transform: uppercase;
                      font-weight: 700;
                      cursor: pointer;" href="#">Invoice</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0px 10px; padding-bottom: 10px;">
              <table cellspacing="0" cellpadding="0"
                style="width:100%; border: solid 1px #ddd; padding: 5px 10px; padding-bottom: 10px;">
                <tbody>
                  <tr>
                    <td style="width: 70%; vertical-align: top;">
                      <h4
                        style="margin: 0px; font-size: 16px; font-weight: 700; color: #000; display: block; margin-bottom: 5px;">
                        Shipping Address</h4>
                      <p style="margin: 0px;
                        font-size: 14px;
                        line-height: 20px;
                        color: #000;
                        padding-right: 15px;">
                        `+ orderDetails[0].shippingAddress +`
                      </p>
                    </td>
                    <td style="width: 30%; vertical-align: top; text-align: right;">
                      <h4
                        style="margin: 0px; font-size: 16px; font-weight: 700; color: #000; display: block; margin-bottom: 5px;">
                        Payment Method</h4>
                      <p style="margin: 0px;
                        font-size: 14px;
                        line-height: 20px;
                        color: #000;">
                        `+ orderDetails[0].paymentMethod +`
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="vertical-align: top;">
                      <h4
                        style="margin: 0px; font-size: 16px; font-weight: 700; color: #000; display: block; margin-bottom: 5px; margin-top: 15px;">
                        Order Summary</h4>
                      <ul
                        style="padding-inline-start: 0px; margin: 0px; width: 100%; border: solid 1px #ddd; border-bottom: none; background-color: #f1f1f1;">
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 44%; padding: 8px 10px;">
                          Item(s) Subtotal:</li>
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 46%; padding: 8px 10px; text-align: right;">
                          AED `+ orderSubTotal +`</li>
                      </ul>
                      <ul
                        style="padding-inline-start: 0px; margin: 0px; width: 100%; border: solid 1px #ddd; border-bottom: none;">
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 44%; padding: 8px 10px;">
                          Shiping & Handling:</li>
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 46%; padding: 8px 10px; text-align: right;">
                          AED `+ orderShippingAmount+`</li>
                      </ul>
                      <ul
                        style="padding-inline-start: 0px; margin: 0px; width: 100%; border: solid 1px #ddd; border-bottom: none;">
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 44%; padding: 8px 10px;">
                          Total:</li>
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 46%; padding: 8px 10px; text-align: right;">
                          AED `+ orderTotal +`</li>
                      </ul>
                      <ul
                        style="padding-inline-start: 0px; margin: 0px; width: 100%; border: solid 1px #ddd; border-bottom: none; background-color: #f1f1f1;">
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 44%; padding: 8px 10px;">
                          Coupon Applied:</li>
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 46%; padding: 8px 10px; text-align: right;">
                          -AED  `+ orderDiscountAmount +`</li>
                      </ul>
                      <ul style="padding-inline-start: 0px; margin: 0px; width: 100%; border: solid 1px #ddd;">
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 44%; padding: 8px 10px; font-weight: 700;">
                          Grand Total:</li>
                        <li
                          style="font-size: 14px; font-weight: 400; color: #000; display: inline-block; width: 46%; padding: 8px 10px; font-weight: 700; text-align: right;">
                          AED `+ orderDetails[0].amountPaid +`</li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td>
    
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    
    </html>`;

    const data = {
        from: 'Mawfoor Team<admin@mawfoor.com>',
        // to: 'communication@bluehorse.in',
        // to: 'kamaleshgiri13@gmail.com',
        to: 'tanbir.bluehorse@gmail.com',
        // to: 'asifur.rahaman@bluehorse.in',
        // to: 'vijay.kumar@bluehorse.in',
        // to: 'mithun.bluehorse@gmail.com',
        // to: 'chandan.dey@bluehorse.in',
        // to: 'chandan.dey.444@gmail.com',
        subject: 'mawfoor invoice',
        html: htmlSend
    };
    mailgun.messages().send(data, function (error, body) {
        console.log(body);
    });

    res.status(200).send({success: false, message: "Oops! Something wrong111 `+ req.app.locals.baseurl + `emailTemplate"});

};