var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
const paginate = require("express-paginate");
var formidable = require('formidable');
var multiparty = require('multiparty'); 
var bodyParser = require('body-parser');
var Excel = require('exceljs');
var fetch = require('node-fetch');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
const paginate = require('express-paginate');
var config = require('../../config/config.json');

var Sequelize = require("sequelize");
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
    // SQLite only
    //storage: 'path/to/database.sqlite'
});



exports.customerList = function(req, res, next){

    var token= req.session.token;
    var currPage = req.query.page ? req.query.page : 0;
    var limit = req.query.limit ? req.query.limit : 10;
    var offset = currPage!=0 ? (currPage * limit) - limit : 0;
    var keyword = req.query.search ? req.query.search.trim() : '';
    jwt.verify(token, SECRET, function(err, decoded) {
        if (err) {
            res.status(200).send({data:{verified:false},errNode:{errMsg:"Invalid Token",errCode:"1"}});
        }else{
            sequelize.query("SELECT COUNT(*) AS customerCount FROM `customer` where phone like '%"+keyword+"%' or first_name like  '%"+keyword+"%' or last_name like  '%"+keyword+"%'",{ type: Sequelize.QueryTypes.SELECT })
            .then(function (customerCount) {
                if(customerCount ){
                    sequelize.query("SELECT `customer`.* FROM `customer` where phone like  '%"+keyword+"%' or first_name like  '%"+keyword+"%' or last_name like  '%"+keyword+"%' ORDER BY `id` DESC LIMIT "+offset+", "+limit,{ type: Sequelize.QueryTypes.SELECT })
                    .then(function (value) {
                        const itemCount = customerCount.length > 0 ? customerCount[0].customerCount : 0;
                        const pageCount =  customerCount.length > 0 ? Math.ceil(customerCount[0].customerCount / limit) : 1;
                        const previousPageLink = paginate.hasNextPages(req)(pageCount);
                        const startItemsNumber = currPage== 0 || currPage==1 ? 1 : (currPage - 1) * limit +1;
                        const endItemsNumber = pageCount== currPage ||  pageCount== 1 ? itemCount : currPage * limit ;
                        return res.render('superpos/customer/list', { title: 'Customer',arrData:value,messages: req.flash('info'), errors: req.flash('errors'),		
                            pageCount,
                            itemCount,
                            currentPage: currPage,
                            previousPage : previousPageLink	,
                            startingNumber: startItemsNumber,
                            endingNumber: endItemsNumber,
                            pages: paginate.getArrayPages(req)(limit, pageCount, currPage)	
                        });
                    }); 
                }else{
                    return res.render('superpos/customer/list', { title: 'Customer',arrData:'',messages: req.flash('info'), errors: req.flash('errors'),		
                        pageCount:0,
                        itemCount:0,
                        currentPage: currPage,
                        previousPage : previousPageLink	,
                        startingNumber: startItemsNumber,
                        endingNumber: endItemsNumber,
                        pages: paginate.getArrayPages(req)(limit, pageCount, currPage,keyword)	
                    });
                }                   
            });
        }	
    });	
}

exports.addeditCustomer = function(req, res, next){
	var id = req.params.id;  
    var arrData = null;
    var arrProduct = null;
	var arrCiti = null;
    if(!id){
        fetch(req.app.locals.apiurl+'customer/addedit',{headers: {
            "Content-Type": "application/json; charset=utf-8",
            "token": req.session.token,
        }}) .then(function(response) { return response.json() })
        .then(function(value){
            return res.render('superpos/customer/addedit', {
                title: 'Add Customer',
                messages:req.flash("info"),
                arrData:'',arrAddress:'',
                arrPhone_number:'',
                arrEmail_id:'',
                arrProduct: value.product,
                arrCiti: value.arrData,
                arrCustomer_group: value.arrCustomer_gr,
                customerOrder:value.customerOrder,
                customerWallet: value.customerWallet,
                totalBalance: value.totalBalance,
                customefeedback:value.customefeedback,
                totalCredit:value.totalCredit,
                totalDebit:value.totalDebit,
                availableBalance:value.availableBalance,
                numberofOrder:value.numberofOrder,
                errors:''
            });
        });
    }else{
        fetch(req.app.locals.apiurl+'customer/addedit/'+id,{headers: {
            "Content-Type": "application/json; charset=utf-8",
            "token": req.session.token,
        }}) .then(function(response) { return response.json() })
        .then(function(value){
            console.log(value.address)
            return res.render('superpos/customer/addedit', {
                title: 'Edit Customer',
                messages:req.flash("info"),
                arrData: value.value,
                arrAddress: value.address,
                arrPhone_number: value.phone,
                arrEmail_id:value.email,
                arrProduct: value.product,
                arrCiti: value.arrData,
                arrCustomer_group: value.arrCustomer_gr,
                customerOrder:value.customerOrder,
                customerWallet: value.customerWallet,
                totalBalance: value.totalBalance,
                customefeedback:value.customefeedback,
                totalCredit:value.totalCredit,
                totalDebit:value.totalDebit,
                availableBalance:value.availableBalance,
                numberofOrder:value.numberofOrder,
                errors:''
            });
        });
    }
    
};

exports.deleteCustomer = function(req, res, next){
	var id = req.params.id;	
    console.log(id)
    
    models.customerAddresses.destroy({
        where: { customerId: id }
      })

      models.carts.destroy({
        where: { customerId: id }
      })

      models.favouriteProduct.destroy({
        where: { customerId: id }
      })

      models.feedback.destroy({
        where: { customerId: id }
      })

      models.customers.destroy({
        where: { id: id }
      })
      req.flash('info', 'Successfully Customer deleted');
      res.redirect('back');
		
};



exports.downloadCustomerList = async function (req, res, next) {
    var workbook = new Excel.Workbook();
    workbook.creator = 'Me';
    workbook.lastModifiedBy = 'Her';
    workbook.created = new Date(1985, 8, 30);
    workbook.modified = new Date();
    workbook.lastPrinted = new Date(2016, 9, 27);
    workbook.properties.date1904 = true;

    workbook.views = [
        {
            x: 0, y: 0, width: 10000, height: 20000,
            firstSheet: 0, activeTab: 1, visibility: 'visible'
        }
    ];
    var worksheet = workbook.addWorksheet('My Sheet');
    worksheet.columns = [
        { header: 'Sl. No.', key: 'Slno', width: 10 },
        { header: 'Customer Name ', key: 'Name', width: 30 },
        { header: 'Email Id ', key: 'email', width: 33 },
        { header: 'Phone No ', key: 'Phone', width: 25 }
       
           ];

    var customerlist = await models.customer.findAll()
  
   for (var i = 0; i < customerlist.length; i++) {
       

        worksheet.addRow({ Slno: i+1, Name :(customerlist[i].first_name+' '+customerlist[i].last_name != 'null null' ? customerlist[i].first_name+' '+customerlist[i].last_name : ''), email:customerlist[i].email, Phone:customerlist[i].phone  });
      
    }
   
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Customer-list.xlsx");
    workbook.xlsx.write(res)
        .then(function (data) {
            res.end();
            console.log('File write done........');
        });
};


exports.save = async function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
        var id = fields.update_id[0];
        var tabName = req.params.tab;
        if (tabName == 'General_Info') {
            models.customer.update({
                first_name: fields.first_name[0],
                last_name: fields.last_name[0],
                email: fields.email[0],
                phone: fields.phone[0],
                dob : fields.dob[0],
                gender : fields.gender[0],
                doa : fields.doa[0],
                reference_code : fields.reference_code[0],
                sponsor_code : fields.sponsor_code[0]
            }, { where: { id: id } }).then(function (update) {
                req.flash('info', 'Successfully updated');
                return res.redirect('/superpos/customer/addedit/' + id+"#"+tabName);
            })
        } else if (tabName == 'Addresses_Info') {
            var customer_address_id = fields.customer_address_id[0];
            if (customer_address_id != '') {
                models.customer_address.update({
                    first_name: fields.address_first_name[0],
                    last_name: fields.address_last_name[0],
                    mobile: fields.address_mobile_no[0],
                    address: fields.address[0],
                    city: fields.city[0],
                    state: fields.state[0],
                    pin: fields.pin[0],
                    country: fields.country[0]
                }, { where: { id: customer_address_id, customer_id: id } }).then(function (udate) {

                    req.flash('info', 'Customer address successfully updated');
                    return res.redirect('/superpos/customer/addedit/'+id+"#"+tabName);
                })
            } else {
                models.customer_address.create({
                    customer_id: id,
                    first_name: fields.address_first_name[0],
                    last_name: fields.address_last_name[0],
                    mobile: fields.address_mobile_no[0],
                    address: fields.address[0],
                    city: fields.city[0],
                    state: fields.state[0],
                    pin: fields.pin[0],
                    country: fields.country[0]
                }).then(function (create) {
                    req.flash('info', 'Customer address successfully created');
                    return res.redirect('/superpos/customer/addedit/' + id+"#"+tabName);
                })

            }
        }else if(tabName == 'password_Info'){
            var password = fields.password[0];
            var hash = bcrypt.hashSync(password);
            models.customer.update({
                password : hash
            },{where:{id:id}}).then(function(update){
                req.flash('info', 'Customer password successfully updated');
                return res.redirect('/superpos/customer/addedit/' + id);
            })
        }
    })

}


exports.statusChange = async function(req,res){
    var cusId = req.body.cusID;
    var statuValue = req.body.statuValue;
    console.log("---------------------"+cusId+statuValue);
    if(cusId !='' && statuValue !=''){
        models.customer.update({
            status: statuValue
        },{where:{id:cusId}});
    }
    
}



exports.addressDetails = async function(req,res){
    var customerID = req.body.customerID;
    var addressTableID = req.body.addressTableID;
    if(customerID !='' && addressTableID !=''){
       var customerSingaleAddress = await models.customer_address.findAll({where:{id:addressTableID,customer_id:customerID}});
       if(customerSingaleAddress.length > 0){
           res.send({
            success : true,
            result : customerSingaleAddress
           })
       }else{
        res.send({
            success : false,
            result : ''
           })
       }
    }
    
}