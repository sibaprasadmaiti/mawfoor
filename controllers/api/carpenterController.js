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



/************************ Carpenter Register start **********************************  */
exports.carpenterRegistration = async function (req, res, next) {
  var storeId = req.body.data.storeId;
  var email = req.body.data.email;
  var password = req.body.data.password;
  var firstName = req.body.data.firstName;
  var lastName = req.body.data.lastName;
  var address = req.body.data.address;
  var mobile = req.body.data.mobile;
  var city = req.body.data.city;
  var state = req.body.data.state;
  var pin = req.body.data.pin;
  var country = req.body.data.country;
  var randomOtp = Math.floor(1000 + Math.random() * 9000);

  if(email && email !='' && password && password !='' && firstName && firstName !='' && lastName && lastName !='' && address && address !='' && mobile && mobile !='' && city && city !='' && state && state !='' && pin && pin !='' && country && country !='' ){

    var is_exists = await models.carpenter.findOne({ where: { email: email, storeId:storeId } });
    if(is_exists == null) {
      var hash = bcrypt.hashSync(password);

      await models.carpenter.create({
        otp: randomOtp,
        email: email,
        firstName : firstName,
        lastName : lastName,
        password: hash,
        address: address,
        mobile: mobile,
        city : city,
        state : state,
        pin : pin,
        country: country,
        status: "active",
      }).then(async function(newcarpenter){

        if(newcarpenter){
          return res.status(200).send({ data:{success:true, message: "Carpenter successfully registered", carpenter_details : newcarpenter}, errorNode:{errorCode:0, errorMsg:"No Error"}});
        } else {
          return res.status(200).send({ data:{success:false, message: "Something worng! Please try again!", carpenter_details : ''}, errorNode:{errorCode:1, errorMsg:"No Error"}});
        }
      }).catch(function() {
        return res.status(200).send({ data:{success:false, message : "Something worng! Please try again!",  carpenter_details : ''}, errorNode:{errorCode:1, errorMsg:"error"}});
      
      })
    } else {
      return res.status(200).send({ data:{success:false, message : "Email already registered", carpenter_details : is_exists}, errorNode:{errorCode:0, errorMsg:"error"}});

    }
  }else{
    return res.status(200).send({ data:{success:false, message : "All fields are required"}, errorNode:{errorCode:1, errorMsg:"error"}});
  } 
};

function randomString() {
    var length = 4;
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    for (var i = length; i > 0; --i)
      result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  }

  function proper_Date_Time() {
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
    return (
      year + "-" + month + "-" + day + "  " + hour + ":" + minute + ":" + second
    );
  }

/************************ Carpenter Register ends **********************************  */


/*********************************************** check otp start **************************************/
exports.otpCheack = async function (req, res, next) {
  var email = req.body.data.email;
  var otp = req.body.data.otp;
  var customer = await models.customer.findOne({ where: {email: email}});
  if(customer !='' && customer !=null){
    if (customer.otp != otp) {
      res.status(200).send({ status: 200, message: "OTP not match!" });
    } else {
        if(customer.is_approved == 0) {
           await models.customer.update({
              status : 'active',
              is_approved: 1
           }, {where:{email:customer.email}}).catch(function() {
              return res.status(200).send({
                success: false,
                message: "Something worng! Please try again!",
                user_email : '',
              });
           });
        }
        var token = jwt.sign({ customer }, SECRET, { expiresIn: 18000 });
        res.status(200).send({ message: "Successfully login", token: token, userdetail: customer });
    }
  }
};
/******************************* check otp ends*********************************** */


/*************************** User login start ****************************/
exports.login =async function (req, res) {
  var mail = req.body.data.email;
  var password = req.body.password;
  if (mail && mail != "") {
    var checkEmail = await models.customer.findOne({ where: { email: mail } });
      if (checkEmail) {
        if (!bcrypt.compareSync(req.body.data.password, checkEmail.password)){
          res.status(200).send({ success: false, message: "Password wrong! Please try again." });
        } else {
          if (mail == checkEmail.email) {
            console.log("___________________________0");
            var token = jwt.sign({ checkEmail }, SECRET, { expiresIn: 18000 });
            res.status(200).send({
              status: 200,
              success: true,
              message: "You are successfully logged in.",
              token: token,
              userdetail: checkEmail,
            });
          } else {
            res.status(200).send({ success: false, message: "No user found" });
          }
        }
      } else {
        res.status(200).send({ success: false, message: "No user found" });
      }
   
  }
};
/********************************** user login ends ******************************/



/******************************** email send start here ******************************/
async function sendEmail(email, otp) {
  console.log("The sender mail="+email);
  var data = {
      from: 'Plywale <pnilmoni.bluehorse@gmail.com>',
      to: [email],
      subject: 'Plywale new register otp cheak',
      text:  otp +" is your verification code. Please DO NOT share this OTP with anyone to ensure account's security.",
  };
      
  mailgun.messages().send(data, function (error, body) {
      if(error){
          console.log(error);
      }else{
          console.log(data);
          console.log(body);
      }
      
  });
}
/******************************** email send ends here ******************************/


/************************************ get User Details After Login  ************************/
exports.getUserDetailsAfterLogin = async function(req, res) {
  var id = req.body.data.id;
  var token = req.headers["token"];
  jwt.verify(token, SECRET,async function (err, decoded) {
    if (err) {
      res.json("Invalid Token");
    } else {
      var customer_details = await models.customer.findOne({where:{id:id}});
      if(customer_details != null) {
          res.status(200).send({ 
              success: true,
              customer_details: customer_details 
          });
      } else {
          res.status(200).send({ 
              success: false,
              message: "No user found" 
          });
      }
    }
  });
}

