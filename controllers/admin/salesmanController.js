var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var formidable = require('formidable');
var multiparty = require('multiparty'); 
var bodyParser = require('body-parser');
var fetch = require('node-fetch');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
const paginate = require('express-paginate');
var helper = require('../../helpers/helper_functions');


exports.salesmanList = function(req, res, next){
    var sessionStoreId = req.session.user.storeId;
    var currPage = req.query.page ? req.query.page : 0;
    var limit = req.query.limit ? req.query.limit : 10;
    var offset = currPage!=0 ? (currPage * limit) - limit : 0;
    var token= req.session.token;
    jwt.verify(token, SECRET, function(err, decoded) {
        if (err) {
            res.status(200).send({data:{verified:false},errNode:{errMsg:"Invalid Token",errCode:"1"}});
        }else{
            existingItem = models.salesman.findAndCountAll({where: { storeId: sessionStoreId}, limit: limit, offset: offset,order: [['id', 'DESC']]});            
            existingItem.then(function (results) {
                const itemCount = results.count;
                const pageCount = Math.ceil(results.count / limit);
                const previousPageLink = paginate.hasNextPages(req)(pageCount);
                const startItemsNumber = currPage== 0 || currPage==1 ? 1 : (currPage - 1) * limit +1;
                const endItemsNumber = pageCount== currPage ||  pageCount== 1 ? itemCount : currPage * limit ;
                return res.render('admin/salesman/list', { title: 'Salesman',arrData:results.rows,arrOption:'',messages:req.flash('info'),errors: req.flash('errors'),
                    pageCount,
                    itemCount,
                    currentPage: currPage,
                    previousPage : previousPageLink	,
                    startingNumber: startItemsNumber,
                    endingNumber: endItemsNumber,
                    pages: paginate.getArrayPages(req)(limit, pageCount, currPage),
                    helper: helper	
                }); 
            })
        }	
    });
}

exports.addeditSalesman = function(req, res, next){
    var sessionStoreId = req.session.user.storeId;
    var id = req.params.id;
    var existingItem = null;
    if(!id){	
        return res.render('admin/salesman/addedit', {
            title: 'Add Salesman',
            messages:req.flash('info'),
            arrData:'',
            errors:'',
            helper: helper
        });
    }else{            
        existingItem = models.salesman.findOne({ where: {id:id, storeId: sessionStoreId} });
        existingItem.then(function (value) { 
            return res.render('admin/salesman/addedit', {
                title: 'Edit Salesman',
                messages:req.flash('info'),
                arrData: value,
                errors:'',
                helper: helper
            });
        });
    }
};

exports.addSalesman = function(req, res, next) {
    var sessionStoreId = req.session.user.storeId;
    var d = new Date();
    var n = d.getTime();
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) { 
        var id = fields.update_id[0];
        var logdetails = req.session.user 

        if(!id)
        {
            models.salesman.create({ 
                storeId: sessionStoreId ? sessionStoreId : null, 
                name: fields.name ? fields.name[0] : null, 
                email: fields.email ? fields.email[0] : null,
                phone: fields.phone ? fields.phone[0] : null,
                status: fields.status ? fields.status[0] : null, 
                address: fields.address ? fields.address[0] : null, 
                createdBy: logdetails ? logdetails.id : null,
            }).then(function(salesman) {

                if (salesman) {
                    if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                        var salesmanImage = Date.now() + files.image[0].originalFilename;
                        var ImageExt = salesmanImage.split('.').pop();
                        var salesmanImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                        var finalSalesmanImage = salesmanImageWithEXT.replace("[object Object]", "");
                        // helper.createDirectory('public/admin/brands/' + value.id);
                        helper.createDirectory('public/admin/salesman/');
                        var tempPath = files.image[0].path;
                        var fileName = finalSalesmanImage;
                        // var targetPath = value.id + "/" + fileName;
                        var targetPath = fileName;
                        helper.uploadSalesmanImageFiles(tempPath, targetPath);
                    }

                    models.salesman.update({
                        image: finalSalesmanImage
                    }, { where: { id: salesman.id } }).then(function (val) {
                        if (val) {
                            req.flash('info', 'Successfully Created');
                            return res.redirect('/admin/salesman');
                        }
                    }).catch(function (error) {
                        req.flash('errors', 'Something went wrong');
                    });

                    // req.flash('info','Successfully Created');	  
                    // res.redirect('/admin/salesman');
                } else {
                    req.flash('errors', 'Something went wrong');
                }
            })
            .catch(function(error) {
                return res.send(error);
            });
        }else{

            var salesmanImage = models.salesman.findOne({ attributes: ['image'], where: { id: id } });
            if (files.image[0].originalFilename != '' && files.image[0].originalFilename != null) {
                var salesmanImage = Date.now() + files.image[0].originalFilename;
                var ImageExt = salesmanImage.split('.').pop();
                var salesmanImageWithEXT = Date.now() + files.image[0] + "." + ImageExt;
                var finalSalesmanImage = salesmanImageWithEXT.replace("[object Object]", "");
                // helper.createDirectory('public/admin/brands/' + id);
                helper.createDirectory('public/admin/salesman/');
                var tempPath = files.image[0].path;
                var fileName = finalSalesmanImage;
                // var targetPath = id + "/" + fileName;
                var targetPath = fileName;
                helper.uploadSalesmanImageFiles(tempPath, targetPath);
            }
            var oldSalesmanImage = salesmanImage.image;

            models.salesman.update({ 
                name: fields.name ? fields.name[0] : null, 
                email: fields.email ? fields.email[0] : null,
                phone: fields.phone ? fields.phone[0] : null,
                status: fields.status ? fields.status[0] : null, 
                address: fields.address ? fields.address[0] : null, 
                createdBy: logdetails ? logdetails.id : null, 
                image: finalSalesmanImage != '' ? finalSalesmanImage : oldSalesmanImage
            },{where:{id:id}}).then(function(salesman) {
                req.flash('info','Successfully Updated');	  
                res.redirect('/admin/salesman');      
            })
            .catch(function(error) {
                return res.send(error);
            });
        }
    });
};

exports.deleteSalesman = function(req, res, next) {
    
    var id = req.params.id;
    var sessionStoreId = req.session.user.storeId;   
    models.salesman.destroy({ 
        where:{id:id, storeId: sessionStoreId}
    }).then(function(value) {
        req.flash('info','Successfully Deleted');
        res.redirect('back');
    });
};







