var models = require('../../models');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');
var fs = require('file-system');
var flash = require('connect-flash');
var formidable = require('formidable');
var multiparty = require('multiparty'); 
var bodyParser = require('body-parser');
var fetch = require('node-fetch');
var jwt = require('jsonwebtoken');
var SECRET = 'nodescratch';
const csv = require('fast-csv');

exports.productsUpload = function(req, res, next){	
    return res.render('admin/productsUpload/addedit', {title: 'Product Upload',messages: req.flash('info'),errors: req.flash('errors'),arrData:'',});           
};
exports.addProductsUpload = function(req, res, next) {
    var directory ='';
    var filePath ='';
    var formnew = new formidable.IncomingForm();
    formnew.parse(req);
    formnew.on('fileBegin', function (name, file) {
        if (file.name && file.name != '') {
            directory = __dirname + '/../../public/admin/productupload/';
            filePath = __dirname + '/../../public/admin/productupload/' + file.name;
            if (!fs.existsSync(directory)){
                fs.mkdirSync(directory, (err) => {
                    if (err) throw err;
                });
                file.path = __dirname + '/../../public/admin/productupload/' + file.name;
            } else {
                file.path = __dirname + '/../../public/admin/productupload/' + file.name;
            }
        }
    });
    formnew.on('end', function () {
        const fileRows = [];
        csv.fromPath(filePath).on("data", function (data) {
            fileRows.push(data); // push each row
        }).on("end", function () {
            console.log(fileRows);
            fs.unlinkSync(filePath);   // remove temp file
            const validationError = validateCsvData(fileRows);
            if (validationError) {
                req.flash('errors',validationError);
                return res.redirect('back');
            }
            var i=1;
            fileRows.forEach(function(element,index){
                var str = element[0] ? element[0] : '';
                var productName= str.replace(" ", "").substr(0, 5).toUpperCase();
                var skuID = productName;
                var slugify = str.toString().toLowerCase().replace(/\s+/g, '-');
                if(index!=0){
                    models.products.create({
                        sku: skuID,
                        title: element[0] ?  element[0]: '',
                        shortDescription: element[1] ?  element[1]: '',
                        categoryId: element[2] ?  element[2]: '',
                        searchKeywords:element[3] ?  element[3]: '',
                        price: element[4] ?  element[4]: '', 
                        bestSellers: element[6] ?  element[6]: 'no',
                        newArrivals:element[7] ? element[7]: 'no',
                        isConfigurable: 0,
                        status: 'active'                        
                    }).then(function(product) {
                        var newSkuID = skuID + product.id;
                        var newSlug = slugify +'-'+ product.id;
                        models.product.update({
                            sku:newSkuID ? newSkuID : null,
                            slug: newSlug 
                        },{where:{id:product.id}});
                        var product_inventory = element[9] ? element[9] : 0;
                        if (product_inventory == null  || product_inventory == '' || product_inventory == 0) {
                            var sale_xxx = 0;
                            var stock_xxx = 0;
                            var remarks = '';
                        }else{
                            var sale_xxx = '+'+product_inventory;
                            var stock_xxx = product_inventory;
                            var remarks = 'added from admin';
                        }
                        models.inventory.create({
                            product_id: product.id,
                            sale_buy: sale_xxx,
                            stock: stock_xxx,
                            remarks: remarks,
                        })
                        .then(function (inventory) {
                        });
                        // /////////////////// inventory add end ////////////////////                       
                    });
                }              
        
                i++;
                if(i== fileRows.length){
                    req.flash('info','CSV File, Successfully Uploaded');                    
                    //console.log(req.flash('info'));
                    return res.redirect('back');     
                }   
            },this);
        })   
    });
};
function validateCsvData(rows) {
    var headerArray =  new Array('Product Name',  'Short Description',  'Category Id', 'Keyword',  'Price', 'Veg Only',
    'Best Sellers','New Arrivals','Spicy','Inventory');
    if(rows.length > 0){
        if(!compare(rows[0] ,headerArray ))        
            return `Header is not Present or correct. please look into sample csv`;
        const dataRows = rows.slice(1, rows.length); //ignore header at 0 and get rest of the rows
        for (let i = 0; i < dataRows.length; i++) {
            const rowError = validateCsvRow(dataRows[i]);
            if (rowError) {
                return `${rowError} on row ${i + 1}`
            }
        }
        return;
    } else {
        return `empty csv`
    }
} 
function validateCsvRow(row) {
    if (!row[0]) {
        return "invalid Product Name"
    }
    if (!row[2]) {
        return "invalid Category Id"
    }
    if(!row[4] || isNaN(row[4])){
        return "invalid Price"
    }
    return;
}
function compare(arr1,arr2){ 
    if(!arr1  || !arr2) return        
    let result;
    if (JSON.stringify(arr1) === JSON.stringify(arr2)) {
        result = true;
    } else {
        result = false;
    }    
    return result  
}