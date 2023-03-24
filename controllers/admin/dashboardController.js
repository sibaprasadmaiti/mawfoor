const express = require('express');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var formidable = require('formidable');
var multiparty = require('multiparty'); 
var bodyParser = require('body-parser');
var fetch = require('node-fetch');

// var router = express.Router();
// exports.dashboard = function(req, res, next){
//     return res.render('admin/home/dashboard',{
//         title: 'Dashboard',
//         arrData: '',
//         arrChat: '',
//         arrUser: '',
//         messages: req.flash('info'),
//         errors: req.flash('errors')	
//     });
// }


exports.dashboard = function(req, res, next){
    //console.log(user)
    var sessionStoreId = req.session.user.storeId;
	var arrData = null;
    var adminId = [];
    fetch(req.app.locals.apiurl+'dashboard',{headers: {
        "Content-Type": "application/json; charset=utf-8",
        "token": req.session.token,
        "storeId": sessionStoreId,
    }}).then(function(response) { return response.json() })
    .then(function(data){
        console.log(new Intl.NumberFormat().format(data.totalAmound[0].totalAmound));
        return res.render('admin/home/dashboard', {
            title:'dashboard',
            arrProduct: data.product,
            arrtotalData: data.order,
            arrtodayTotalAmound: new Intl.NumberFormat().format(data.todayTotalAmound[0].todayTotalAmound),
            arrtotalAmound: new Intl.NumberFormat().format(data.totalAmound[0].totalAmound),
            arrNewOrder: data.newOrder,
            arrData:data,
            arrChat: '',
            arrUser: '',
            req:req,
            messages: req.flash('message'),
            errors: req.flash('errors')	
        });
    });
}