var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
var flash = require('connect-flash');
var config = require("../../config/config.json");
var Sequelize = require("sequelize");
const nodemailer = require("nodemailer");
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
* Description:  admins Login
* @param req
* @param res
* Developer:Susanta Kumar Das
**/
exports.signinview = function (req, res, next) {
	res.render('login/index', { csrfToken: req.csrfToken(), errors: req.flash('errors'), loginerrors: '', messages: req.flash('message'), lmessages: req.flash('lmessage') });
}
/**
* Description:  admins Login
* @param req for username, password
* @param res
* Developer:Susanta Kumar Das
**/
exports.signin = function (req, res, next) {
	req.checkBody('username', 'User name is Required').notEmpty();
	req.checkBody('password', 'Password Required').notEmpty();
	req.getValidationResult().then(function (result) {
		if (!result.isEmpty()) {
			var errors = result.array().map(function (elem) {
				return elem.msg;
			});
			req.flash('errors', errors);
			return res.redirect('/auth/signin');
		} else {
			existingEmail = models.admins.findOne({ where: { username: req.body.username } });
			existingEmail.then(async function (users) {				
				if (users != null) {
					if (!bcrypt.compareSync(req.body.password, users.password)) {
						req.flash('errors', "Password wrong");
						return res.redirect('/auth/signin');
					} else {
						if (req.body.username == users.username) {
							//*****Role Assign Start
							if (users.storeId!=null){
								var roleIdDetails = await models.modelHasRoles.findOne({
									attributes: ['roleId'],
									where: { userId: users.id },
									include: [{
										model: models.stores,
										attributes: ['storeName'],
										required: false,
									}]
								}); //console.log(roleIdDetails);return false;
							}						
							
							if (roleIdDetails || users.storeId ==null) {
								var permissions = [];
								//var rolePermissions = undefined;
								if (users.storeId != null) {
									var rolePermissions = await models.roleHasPermissions.findAll({
										attributes: ['id'],
										include: [{
											model: models.roles,
											attributes: ['name'],
											required: false,
										}, {
											model: models.permissions,
											attributes: ['name'],
											required: false,
										}], where: { roleId: roleIdDetails.roleId }
									});
									if (rolePermissions.length==0){
										req.flash('errors', "Should Assign Access Permission");
										return res.redirect('/auth/signin');
									}else{
										for (var i = 0; i < rolePermissions.length; i++) {
											permissions.push(rolePermissions[i].permission.name);
										}
									}
									//*****Role Assign End
								}
								//console.log(rolePermissions);return false;

								delete users.password;
								users.image = (users.image != '' && users.image != null) ? req.app.locals.baseurl + 'admin/admins/' + users.id + '/' + users.image : req.app.locals.baseurl + 'admin/admins/user.png';
								var user = users.toJSON();

								var reportingId = [];
								if (users.storeId != null) {
									//*****Assign Reporting Users Start									
									//1var adminIds = await sequelize.query("SELECT ID.level, DATA.id FROM(SELECT @ids as _ids,( SELECT @ids := GROUP_CONCAT(id) FROM admins WHERE FIND_IN_SET(parentId, @ids) AND cid = "+user.cid+") as cids, @l := @l+1 as level FROM admins, (SELECT @ids :="+user.id+", @l := 0 ) b WHERE @ids IS NOT NULL AND cid = "+user.cid+") id, admins AS DATA WHERE FIND_IN_SET(DATA.id, ID._ids) ORDER BY level, id",{ type: Sequelize.QueryTypes.SELECT });
									var adminIds = await sequelize.query("SELECT DATA.id FROM(SELECT @ids as _ids,( SELECT @ids := GROUP_CONCAT(id) FROM admins WHERE FIND_IN_SET(parentId, @ids) AND storeId = " + user.storeId + ") as cids, @l := @l+1 as level FROM admins, (SELECT @ids :=" + user.id + ", @l := 0 ) b WHERE @ids IS NOT NULL AND storeId = " + user.storeId + ") id, admins AS DATA WHERE FIND_IN_SET(DATA.id, _ids) ORDER BY level, id", { type: Sequelize.QueryTypes.SELECT });
									//3var adminIds = await sequelize.query("WITH RECURSIVE descendant AS (SELECT  id,cid,parentId,0 AS level FROM admins WHERE id = "+user.id+" AND cid = "+user.cid+" UNION ALL SELECT  ft.id,ft.cid,ft.parentId,level + 1 FROM admins ft JOIN descendant d ON ft.parentId = d.id WHERE ft.cid = "+user.cid+" )SELECT  d.id AS id,d.cid AS cid,d.level FROM descendant d JOIN admins a ON d.parentId = a.id ORDER BY level",{ type: Sequelize.QueryTypes.SELECT });
									
									adminIds.forEach(function (admin) {
										reportingId.push(admin.id);
									});
									//*****Assign Reporting Users End
								}

								req.session.user = user;
								req.session.permissions = permissions;
								req.session.role = rolePermissions==undefined?'':rolePermissions[0].role.name;
								req.session.store = roleIdDetails == undefined ? '' : roleIdDetails.store.storeName;
								req.session.reportingIds = reportingId;
								var token = jwt.sign({ users }, SECRET, { expiresIn: 18000 });
	console.log(token);
								req.session.token = token;
								return res.redirect('/admin/dashboard');
							} else {
								req.flash('errors', "No user found1");
								return res.redirect('/auth/signin');
							}
						} else {
							req.flash('errors', "No user found2");
							return res.redirect('/auth/signin');
						}
					}
				} else {
					req.flash('errors', "No user found3");
					return res.redirect('/auth/signin');
				}
			});
		}
	});
};
/**
* Description:  admins registration
* @param req for firstName, lastName, email, phone, password
* @param res
* Developer:Susanta Kumar Das
**/
exports.signup = function (req, res, next) {
	var user = req.body;
	var users = null;
	req.checkBody('firstName', 'First Name  Required').notEmpty();
	req.checkBody('lastName', 'Last Name  Required').notEmpty();
	req.checkBody('email', 'Email Id Required').isEmail();
	req.checkBody('phone', 'Phone No Required').notEmpty();
	req.checkBody('password', 'Password Required').notEmpty();
	req.getValidationResult().then(function (result) {
		if (!result.isEmpty()) {
			var errors = result.array().map(function (elem) {
				return elem.msg;
			});
			req.flash('errors', errors);
			return res.redirect('/auth/signup');
		} else {
			var password = user.password;
			var hash = bcrypt.hashSync(password);
			var duplicate = models.admins.findOne({
				[Op.or]: [
					{ email: email },
					{ phone: phone }
				]
			}).then(function (duplicate) {
				if (duplicate) {
					req.flash('errors', 'Email Id Already Exists');
					return res.redirect('/auth/signup');
				} else {
					models.admin_user.create({
						firstName: user.firstName,
						lastName: user.lastName,
						email: user.email,
						password: hash,
						phone: user.phone,
						status: 'inactive'
					}).then(function (admin_user) {
						req.flash('info', 'User Successfully Created');
						return res.redirect('/auth/signin');
					}).catch(function (error) {
						return res.send(error);
					});
				}
			}).catch(function (error) {
				return res.send(error);
			});
		}
	});
};


/**
 * This function is developed for Forget password page view
 * Developer: Partha Mandal
 */
 exports.forgetpasswordview = function (req, res, next) {
	res.render('login/forgetpassword', { csrfToken: req.csrfToken(), errors: req.flash('errors'), loginerrors: '', messages: req.flash('message'), lmessages: req.flash('lmessage') });
}

/**
 * This function is developed for Reset link sending in mail 
 * Developer: Partha Mandal
 */
 exports.forgetpassword = function (req, res, next) {
	req.checkBody('username', 'User name is Required').notEmpty();
	verifyemail = models.admins.findOne({ where: { username: req.body.username } });
	verifyemail.then(async function (users) {				
		if (users != null) {
			const jwtsecret = SECRET + users.password;
			const payload = {
				username : users.username,
				id : users.id
			};

			const token = jwt.sign(payload, jwtsecret, {expiresIn: '5m'});
			const link = `http://localhost:3309/auth/resetpassword/${users.id}/${token}`;
			// Reset link send to email start
			var transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
				  user: 'iamnodedeveloper@gmail.com',
				  pass: 'Developer@node'
				}
			  });
			  
			  var mailOptions = {
				from: '"Zbrdst Express" <iamnodedeveloper@gmail.com>',
				to: users.username,
				subject: 'Reset Password Link',
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
					<center>
					<br><br><br>
						<div style="background-color: white; margin:10px 5vw; border-radius: 10px; box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);">
						<img style="padding-top: 30px; height:60px" src="https://wip.tezcommerce.com:3304/admin/images/logo.png">
							<h1 style="padding-top: 30px; padding-left: 2vw; padding-right: 2vw;">You have requested to reset your password</h1>
							<p style="padding-left: 2vw; padding-right: 2vw; margin-top: 40px; margin-bottom: 30px;">
								We cannot simply send you your old password. A unique link to reset your password has been generated for you. To reset your password, click the following link and follow the instructions. This link will be expired after 5 minutes.
							</p>
							<div style="padding-bottom: 40px;">
								<button class="hoverbtn" style="background-color: #40be44; border: none; color: white; padding: 13px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; border-radius: 60px; cursor: pointer; box-shadow: 0 8px 16px 0 rgba(41, 41, 41, 0.2), 0 6px 20px 0 rgba(46, 46, 46, 0.19);"><a href="${link}" style="text-decoration: none; color: white;">Reset Password</a></button>
							</div>
						</div>
					<br><br><br>
					</center>
				</body>
				</html>`
			  };
			  
			  transporter.sendMail(mailOptions, function(error, info){
				if (error) {
				  console.log(error);
				} else {
					req.flash('message', "Reset link has been sent to your email id");
					return res.redirect('back');
				}
			  });

			  // Reset link send to email end
			req.flash('message', "Reset link has been sent to your email id");
			return res.redirect('back');
		}else{
			req.flash('errors', "User not exist");
			return res.redirect('back');
		}
	})
}

/**
 * This function is developed for Reset password page view 
 * Developer: Partha Mandal
 */
exports.resetpasswordview = (req, res, next)=>{
	const id = req.params.id;
	const token = req.params.token;
	verifyid = models.admins.findOne({ where: { id: id } })
	.then(async (users) => {
		if (users != null) {
			const jwtsecret = SECRET + users.password;
			try {
				const payload = jwt.verify(token, jwtsecret);
				res.render('login/resetpassword',{username: users.username, errors: req.flash('errors'), messages: req.flash('message')});
			} catch (error) {
				req.flash('errors', "Invelid User Id");
			}
		}else{
			req.flash('errors', "Invelid User Id");
			return res.redirect('back');
		}
	})

	
}

/**
 * This function is developed for Reset Password
 * Developer: Partha Mandal
 */
exports.resetpassword = (req, res, next)=>{
	const id = req.params.id;
	const token = req.params.token;
	let password = req.body.password;
	let password2 = req.body.password2;

	verifyid = models.admins.findOne({ where: { id: id } })
	.then(async (users)=>{
		if (users != null) {
			const jwtsecret = SECRET + users.password;
			try {
				const payload = jwt.verify(token, jwtsecret);
				if(password == password2){
					const passwordhash = bcrypt.hashSync(password);
					models.admins.update({password:passwordhash},{ where: { id: id } });
					req.flash('message', "Password successfully changed");
					return res.redirect('/auth/signin');
				}else{
					req.flash('errors', "Password and Confirm password does't match");
					return res.redirect('back');
				}
			} catch (error) {
				req.flash('errors', "Invelid User Id");
				return res.redirect('back');
			}
		}else{
			req.flash('errors', "Invelid User Id");
			return res.redirect('/auth/forgetpassword');
		}
	})
}
