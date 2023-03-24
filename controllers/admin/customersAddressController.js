var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var formidable = require('formidable');
var multiparty = require('multiparty'); 
var bodyParser = require('body-parser');
var fetch = require('node-fetch');


exports.customer_addressList = function(req, res, next){
	  
    var arrData = null;
    fetch(req.app.locals.apiurl+'customer_address',{headers: {
        "Content-Type": "application/json; charset=utf-8",
        "token": req.session.token,
        
    }}) .then(function(response) { return response.json() })
    .then(function(data){
		return res.render('superpos/customer_address/list', { title: 'Customer Address',arrData:data.value,arrCustomer:data.customer,arrOption:'',message:'',errors:''		
		});
	});
}

exports.addeditCustomer_address = function(req, res, next){
	var id = req.params.id;  
    var arrData = null;
    var arrProduct = null;
    if(!id){
        fetch(req.app.locals.apiurl+'customer_address/addedit',{headers: {
            "Content-Type": "application/json; charset=utf-8",
            "token": req.session.token,
        }}) .then(function(response) { return response.json() })
        .then(function(value){

            return res.render('superpos/customer_address/addedit', {title: 'Customer Address',message:req.flash('info'),arrData:'',arrcustomer: value.customer,errors:''});
        });
    }else{
        fetch(req.app.locals.apiurl+'customer_address/addedit/'+id,{headers: {
            "Content-Type": "application/json; charset=utf-8",
            "token": req.session.token,
        }}) .then(function(response) { return response.json() })
        .then(function(value){
            return res.render('superpos/customer_address/addedit', {title: 'Customer Address',message:req.flash('info'),arrData: value.value,arrcustomer: value.customer,errors:''});
        });
    }
    
};

exports.deleteCustomer_address = function(req, res, next){
	var id = req.params.id;	
	console.log(id)
    fetch(req.app.locals.apiurl+'customer_address/delete/'+id,{headers: {
        "Content-Type": "application/json; charset=utf-8",
        "token": req.session.token,
	}}).then(function(response) { res.redirect('back'); })
		
};







