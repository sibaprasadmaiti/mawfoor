var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth/authController');
var dashboardController = require('../controllers/admin/dashboardController');
var categoriesController = require('../controllers/admin/categoriesController');
var productsController = require('../controllers/admin/productsController');
var productsUploadController = require('../controllers/admin/productsUploadController');
var siteSettingsGroups = require('../controllers/admin/siteSettingGroupController');
var siteSettings = require('../controllers/admin/siteSettingController');
var faqGroups = require('../controllers/admin/faqGroupsController');
var faq = require('../controllers/admin/faqController');
var contentBlock = require('../controllers/admin/contentBlockController');
var pages = require('../controllers/admin/pagesController');
var subscriber = require('../controllers/admin/subscribersController');
var brandsController = require('../controllers/admin/brandsController');
var testimonialsController = require('../controllers/admin/testimonialsController');
var formMaster = require('../controllers/admin/formMastersController');
var dropdownSettings = require('../controllers/admin/dropdownSettingsController');
var shippingMethods = require('../controllers/admin/shippingMethodsController');
var customersController = require('../controllers/admin/customersController');

var storesController = require('../controllers/admin/storeController');
var rolesController = require('../controllers/admin/rolesController');
var adminUserController = require('../controllers/admin/adminUserController');
var couponController = require("../controllers/admin/couponController");

//below added by Surajit Gouri
var deliveryTimeslotController = require('../controllers/admin/deliveryTimeslotController');
var reservationTimeSlotController= require('../controllers/admin/reservationTimeSlotController');
var reservationsController = require('../controllers/admin/reservationsController');
var galleryController = require('../controllers/admin/galleryController');
var couponTransactionController = require('../controllers/admin/couponTransactionController');
var transactionsOfferController = require('../controllers/admin/transactionsOfferController');
var feedbackController = require('../controllers/admin/feedbackController');
var fileUploadController = require('../controllers/admin/fileUploadController');
var smsController = require('../controllers/admin/smsController');
var orderReportController = require('../controllers/admin/orderReportController');
var carpenterController = require("../controllers/admin/carpenterController");

// Below Added by partha mandal
const franchiseController = require('../controllers/admin/franchiseController');
const cityController = require('../controllers/admin/cityController');
const zipcodeController = require('../controllers/admin/zipcodeController');
const bannerController = require('../controllers/admin/bannerController');
const bannerDisplayController = require('../controllers/admin/bannerDisplayController');
const bannerSectionController = require('../controllers/admin/bannerSectionController');
const cmsController = require('../controllers/admin/cmsController');
const customerReportController = require('../controllers/admin/customersReportController');
const blogCategoryController = require('../controllers/admin/blogCategoryController');
const blogAuthorController = require('../controllers/admin/blogAuthorController');
const blogsController = require('../controllers/admin/blogsController');
const blogCommentController = require('../controllers/admin/blogCommentController');
const dynamicFromController = require('../controllers/admin/dynamicFromController');
const attributesController = require('../controllers/admin/attributesController');
const sectionController = require("../controllers/admin/sectionController");
const contactUsController = require("../controllers/admin/contactUsController");
const orderController = require("../controllers/admin/orderController");
var invitationController = require("../controllers/admin/invitationController");
const newsLetterController = require("../controllers/admin/newsLetterController");
var salesmanController = require("../controllers/admin/salesmanController");
const walletController = require('../controllers/admin/walletController');
const contactController = require("../controllers/admin/contactsController");
const moduleAttributesController = require('../controllers/admin/moduleAttributesController');
const billingFeedbackController = require("../controllers/admin/billingFeedbackController");
const dataMigrationController = require("../controllers/admin/dataMigrationController");
const profileController = require("../controllers/admin/profileController");
const permissionController = require("../controllers/admin/permissionController")
const imageResizeController = require("../controllers/admin/imageResizeController")
const newsController = require('../controllers/admin/newsController');
var giftSetController = require('../controllers/admin/giftSetController');
const customerCouponRequestController = require("../controllers/admin/customerCouponRequestController");
// Abobe Added by partha mandal

var models = require('../models');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var app = express();
var url = require('url');
var expressValidator = require('express-validator');
router.use(expressValidator())
router.get('/',function(req, res) {
  res.redirect('/admin/dashboard');
  //console.log(req.baseUrl, req.url);
  //res.end();
});
function checkAuthentication(req,res,next){
  if(req.session.token){
    //if user is looged in, req.isAuthenticated() will return true 
    next();
  } else {
    res.redirect("/auth/signin");
  }
}
function middleHandler(req,res,next){
  models.admins.findOne({ where: { email: req.session.user.email } }).then(async function(user) {
    if(user) {
      res.locals.firstName = user ? user.firstName : "";
      res.locals.lastName = user ? user.lastName : "";
      res.locals.username = user ? user.username : "";
      res.locals.email = user ? user.email : "";
      res.locals.phone = user ? user.phone : "";
      res.locals.storeId = user ? user.storeId : "";
      res.locals.usercreatedBy = user ? user.id : "";
      res.locals.userimage = user ? user.image : "";
      
      res.locals.permissions = req.session.permissions;
      res.locals.role = req.session.role;
      res.locals.store = req.session.store;
      res.locals.reportingIds = req.session.reportingIds;
      next();
    } else {
      req.logout();
      res.redirect('/auth/signin');
    }
  });
}
//**** logout routes start ****//
router.get("/logout", function(req, res) {
  req.logout();
  req.session.destroy();
  return res.redirect("/auth/signin");
});
//**** logout routes end ****//
//**** dashboard routes start ****//
router.get('/dashboard',checkAuthentication,middleHandler,dashboardController.dashboard);
//**** dashboard routes end ****//

//1.***** stores routes start
router.get("/stores", checkAuthentication, middleHandler, storesController.list);
router.get("/stores/delete/:id?", checkAuthentication, middleHandler, storesController.delete);
router.post("/stores/addOrUpdate", checkAuthentication, middleHandler, storesController.addOrUpdate);
router.get("/stores/view/:id?", checkAuthentication, middleHandler, storesController.view);
//***** stores routes end

//2.***** role routes start
router.get("/roles", checkAuthentication, middleHandler, rolesController.list);
router.get("/roles/view/:id?", checkAuthentication, middleHandler, rolesController.view);
router.post("/roles/addOrUpdate", checkAuthentication, middleHandler, rolesController.addOrUpdate);
router.get("/roles/delete/:id?", checkAuthentication, middleHandler, rolesController.delete);
//***** role routes end

//3.*****Admin User Create Start
router.get("/adminUser", checkAuthentication, middleHandler, adminUserController.list);
router.get("/adminUser/view/:id?", checkAuthentication, middleHandler, adminUserController.view);
router.post("/adminUser/addOrUpdate", checkAuthentication, middleHandler, adminUserController.addOrUpdate);
router.get("/adminUser/delete/:id?", checkAuthentication, middleHandler, adminUserController.delete);
router.post("/adminUser/getRole", checkAuthentication, middleHandler, adminUserController.getRoleStoreWise);
//*****Admin User Create End


//**** categories routes start ****//
// router.get("/categories/:id?",  checkAuthentication,  middleHandler,  categoriesController.loadPage);
// router.post("/categories/statusChange", checkAuthentication,  middleHandler,  categoriesController.statusChange);
// router.post("/categories/includeMenuChange", checkAuthentication,  middleHandler,  categoriesController.includeMenuChange);
// router.post("/categories/contentAdd", checkAuthentication,  middleHandler,  categoriesController.contentAdd);
// router.post("/categories/addSEO", checkAuthentication,  middleHandler,  categoriesController.addSEO);
// router.post("/categories/saveNew", checkAuthentication,  middleHandler,  categoriesController.saveNew);
// router.post("/categories/addOther", checkAuthentication,  middleHandler,  categoriesController.addOther);
// router.post("/categories/includeFooterChange", checkAuthentication,  middleHandler,  categoriesController.includeFooterChange);
// router.post("/categories/includeHomeChange", checkAuthentication,  middleHandler,  categoriesController.includeHomeChange);
// router.post("/categories/includeAnchorChange", checkAuthentication,  middleHandler,  categoriesController.includeAnchorChange);

router.get("/categories", checkAuthentication, middleHandler, categoriesController.categoryList);
router.get("/categories/addedit/:id?", checkAuthentication, middleHandler, categoriesController.addeditCategory);
router.post("/categories/add", checkAuthentication, middleHandler, categoriesController.addCategory);
router.get("/categories/delete/:id?", checkAuthentication, middleHandler, categoriesController.deleteCategory);

//**** categories routes end ****//
//**** products routes start ****//
router.get("/products",  checkAuthentication,  middleHandler,  productsController.productList);
router.get("/products/addedit/:id?",  checkAuthentication,  middleHandler,  productsController.addeditProduct);
router.post("/products/add/addGenInfo",  checkAuthentication,  middleHandler,  productsController.addGenInfo);
router.post("/products/add/addFile",  checkAuthentication,  middleHandler,  productsController.addFile);
router.post("/products/add/addContentInfo",  checkAuthentication,  middleHandler,  productsController.addContentInfo);
router.post("/products/add/addSeoInfo",  checkAuthentication,  middleHandler,  productsController.addSeoInfo);
router.post("/products/add/addAttribute",  checkAuthentication,  middleHandler,  productsController.addAttrInfo);
router.get("/products/removeImages/:productId?/:imgId?",  checkAuthentication,  middleHandler,  productsController.removeImages);
router.post("/products/add/addRelPro",  checkAuthentication,  middleHandler,  productsController.addRelPro);
router.post("/products/add/addUpSellPro",  checkAuthentication,  middleHandler,  productsController.addUpSellPro);
router.post("/products/add/addCrossSellsPro",  checkAuthentication,  middleHandler,  productsController.addCrossSellsPro);
router.post("/products/add/addAddonPro",  checkAuthentication,  middleHandler,  productsController.addAddonPro);
router.post("/products/add/configProduct",  checkAuthentication,  middleHandler,  productsController.configProduct);
router.get("/products/delete/configProduct/:productId?/:confId?",  checkAuthentication,  middleHandler,  productsController.deleteConfigProduct);
router.get('/products/delete/:id?',checkAuthentication,  middleHandler,  productsController.deleteProduct);
router.post('/products/add/custom',checkAuthentication,  middleHandler,  productsController.addcustomeOption);
router.get('/products/deleteCustomeOption/:optionId?',checkAuthentication,  middleHandler,  productsController.deleteCustomeOption);
router.get("/products/StatusChange/:id?/:data?",checkAuthentication,  middleHandler,  productsController.productStatusChange);
//**** products routes end ****//
//**** products upload routes start ****//
router.get("/products-upload",checkAuthentication,middleHandler,productsUploadController.productsUpload);
router.post("/products-upload/add",checkAuthentication,middleHandler,productsUploadController.addProductsUpload);
//**** products upload routes end ****//

//**** site settings group routes start ****//
router.get("/sitesettingsgroup/list/:page",checkAuthentication,middleHandler,siteSettingsGroups.list);
router.get("/sitesettingsgroup/view/:id?",checkAuthentication,middleHandler,siteSettingsGroups.view);
router.post("/sitesettingsgroup/addOrUpdate",checkAuthentication,middleHandler,siteSettingsGroups.addOrUpdate);
router.get("/sitesettingsgroup/delete/:id?",checkAuthentication,middleHandler,siteSettingsGroups.delete);
//**** site settings group routes end ****//
//**** site settings routes start ****//
router.get("/sitesettings/list/:page",checkAuthentication,middleHandler,siteSettings.list);
router.get("/sitesettings/view/:id?",checkAuthentication,middleHandler,siteSettings.view);
router.post("/sitesettings/addOrUpdate",checkAuthentication,middleHandler,siteSettings.addOrUpdate);
router.get("/sitesettings/delete/:id?",checkAuthentication,middleHandler,siteSettings.delete);
//**** site settings routes end ****//
//*** faq groups routes start ***/
router.get("/faqgroups/list/:page",checkAuthentication,middleHandler,faqGroups.list);
router.get("/faqgroups/view/:id?",checkAuthentication,middleHandler,faqGroups.view);
router.post("/faqgroups/addOrUpdate",checkAuthentication,middleHandler,faqGroups.addOrUpdate);
router.get("/faqgroups/delete/:id?",checkAuthentication,middleHandler,faqGroups.delete);
//*** faq groups routes end***/
//*** faq routes start ***/
router.get("/faq/list/:page",checkAuthentication,middleHandler,faq.list);
router.get("/faq/view/:id?",checkAuthentication,middleHandler,faq.view);
router.post("/faq/addOrUpdate",checkAuthentication,middleHandler,faq.addOrUpdate);
router.get("/faq/delete/:id?",checkAuthentication,middleHandler,faq.delete);
//*** faq routes end***/
//*** content block routes start ***/
router.get("/contentBlock/list/:page",checkAuthentication,middleHandler,contentBlock.list);
router.get("/contentBlock/view/:id?",checkAuthentication,middleHandler,contentBlock.view);
router.post("/contentBlock/addOrUpdate",checkAuthentication,middleHandler,contentBlock.addOrUpdate);
router.get("/contentBlock/delete/:id?",checkAuthentication,middleHandler,contentBlock.delete);
router.get("/contentBlock/subBlock/:id?",checkAuthentication,middleHandler,contentBlock.subBlockList);
//*** content block routes end***/
//*** pages routes start ***/
router.get("/pages/list/:page",checkAuthentication,middleHandler,pages.list);
router.get("/pages/view/:id?",checkAuthentication,middleHandler,pages.view);
router.post("/pages/addOrUpdate",checkAuthentication,middleHandler,pages.addOrUpdate);
router.get("/pages/delete/:id?",checkAuthentication,middleHandler,pages.delete);
//*** pages routes end***/
//*** subscriber routes start ***/
router.get("/subscriber/list/:page",checkAuthentication,middleHandler,subscriber.list);
router.post("/subscriber/update-status",checkAuthentication,middleHandler,subscriber.update);
router.get("/subscriber/delete/:id?",checkAuthentication,middleHandler,subscriber.delete);
router.get("/subscriber/download",checkAuthentication,middleHandler,subscriber.exportData);
//*** subscriber routes end***/
//*** DropdownSettings routes start ***/
router.get("/dropdownSettings/list/:page",checkAuthentication,middleHandler,dropdownSettings.list);
router.get("/dropdownSettings/view/:id?",checkAuthentication,middleHandler,dropdownSettings.view);
router.post("/dropdownSettings/addOrUpdate",checkAuthentication,middleHandler,dropdownSettings.addOrUpdate);
router.get("/dropdownSettings/delete/:id?",checkAuthentication,middleHandler,dropdownSettings.delete);
//*** DropdownSettings routes end***/
//*** shippingMethods routes start ***/
router.get("/shippingMethods/list",checkAuthentication,middleHandler,shippingMethods.list);
router.get("/shippingMethods/view/:id?",checkAuthentication,middleHandler,shippingMethods.view);
router.post("/shippingMethods/addOrUpdate",checkAuthentication,middleHandler,shippingMethods.addOrUpdate);
router.get("/shippingMethods/delete/:id?",checkAuthentication,middleHandler,shippingMethods.delete);
//*** shippingMethods routes end***/
//*** labs routes start ***/
router.get("/brands/list/:page",checkAuthentication,middleHandler,brandsController.list);
router.get("/brands/view/:id?",checkAuthentication,middleHandler,brandsController.view);
router.post("/brands/addOrUpdate",checkAuthentication,middleHandler,brandsController.addOrUpdate);
router.get("/brands/delete/:id?",checkAuthentication,middleHandler,brandsController.delete);
router.post("/brands/addIsoImage",checkAuthentication,middleHandler,brandsController.addIsoImage);
router.get("/brands/removeIsoImages/:brandId?/:imgId?",  checkAuthentication,  middleHandler,  brandsController.removeIsoImages);
router.get("/brands/download",checkAuthentication,middleHandler,brandsController.exportData);
//*** labs routes end***/

//*** testimonials routes start ***/
router.get("/testimonials/list/:page",checkAuthentication,middleHandler,testimonialsController.list);
router.get("/testimonials/view/:id?",checkAuthentication,middleHandler,testimonialsController.view);
router.post("/testimonials/addOrUpdate",checkAuthentication,middleHandler,testimonialsController.addOrUpdate);
router.get("/testimonials/delete/:id?",checkAuthentication,middleHandler,testimonialsController.delete);
//*** testimonials routes end***/

//*** Form Master routes start ***/
router.get("/formMasters/list",checkAuthentication,middleHandler,formMaster.list);
router.get("/formMasters/view/:id?",checkAuthentication,middleHandler,formMaster.view);
router.post("/formMasters/addOrUpdate",checkAuthentication,middleHandler,formMaster.addOrUpdate);
router.get("/formMasters/delete/:id?",checkAuthentication,middleHandler,formMaster.delete);
//*** Form Master routes end***/

///////////////start coupon////////////////////////////
router.get("/coupon/list/:page",checkAuthentication, middleHandler, couponController.list);
router.get("/coupon/view/:id?", checkAuthentication, middleHandler, couponController.view);
router.post("/coupon/addOrUpdate",checkAuthentication, middleHandler, couponController.addOrUpdate);
router.get("/coupon/delete/:id?", checkAuthentication, middleHandler, couponController.delete);
//////////////End coupon////////////////////////////

//*** Delivery Time slot routes start ***/
router.get("/deliveryTimeSlot/list/:page",checkAuthentication,middleHandler,deliveryTimeslotController.list);
router.get("/deliveryTimeSlot/view/:id?",checkAuthentication,middleHandler,deliveryTimeslotController.view);
router.post("/deliveryTimeslot/addOrUpdate",checkAuthentication,middleHandler,deliveryTimeslotController.addOrUpdate);
router.get("/deliveryTimeslot/delete/:id?",checkAuthentication,middleHandler,deliveryTimeslotController.delete);
//*** Delivery Time slot routes end***/

//*** Reservation Time slot routes start ***/
router.get("/reservationTimeSlot/list/:page",checkAuthentication,middleHandler,reservationTimeSlotController.list);
router.get("/reservationTimeSlot/view/:id?",checkAuthentication,middleHandler,reservationTimeSlotController.view);
router.post("/reservationTimeSlot/addOrUpdate",checkAuthentication,middleHandler,reservationTimeSlotController.addOrUpdate);
router.get("/reservationTimeSlot/delete/:id?",checkAuthentication,middleHandler,reservationTimeSlotController.delete);
//*** Reservation Time slot routes end***/

//*** Reservation routes start ***/
router.get("/reservations/list/:page",checkAuthentication,middleHandler,reservationsController.list);
router.get("/reservations/view/:id?",checkAuthentication,middleHandler,reservationsController.view);
router.post("/reservations/addOrUpdate",checkAuthentication,middleHandler,reservationsController.addOrUpdate);
router.get("/reservations/delete/:id?",checkAuthentication,middleHandler,reservationsController.delete);
router.get("/reservations/download",checkAuthentication,middleHandler,reservationsController.downloadReservations);
//*** Reservation routes end***/

//*** Gallery routes start ***/
router.get("/gallery/list/:page",checkAuthentication,middleHandler,galleryController.list);
router.get("/gallery/view/:id?",checkAuthentication,middleHandler,galleryController.view);
router.post("/gallery/addOrUpdate",checkAuthentication,middleHandler,galleryController.addOrUpdate);
router.get("/gallery/delete/:id?",checkAuthentication,middleHandler,galleryController.delete);
//*** Gallery routes end***/

//*** Coupon Transaction routes start ***/
router.get("/couponTransaction/list/:page",checkAuthentication,middleHandler,couponTransactionController.list);
router.get("/couponTransaction/view/:id?",checkAuthentication,middleHandler,couponTransactionController.view);
router.post("/couponTransaction/addOrUpdate",checkAuthentication,middleHandler,couponTransactionController.addOrUpdate);
router.get("/couponTransaction/delete/:id?",checkAuthentication,middleHandler,couponTransactionController.delete);
//*** Coupon Transaction routes end***/

//*** Transactions Offer routes start ***/
router.get("/transactionsOffer/list/:page",checkAuthentication,middleHandler,transactionsOfferController.list);
router.get("/transactionsOffer/view/:id?",checkAuthentication,middleHandler,transactionsOfferController.view);
router.post("/transactionsOffer/addOrUpdate",checkAuthentication,middleHandler,transactionsOfferController.addOrUpdate);
router.get("/transactionsOffer/delete/:id?",checkAuthentication,middleHandler,transactionsOfferController.delete);
//*** Transactions Offer routes end***/

//*** Feedback routes start ***/
router.get("/feedback/list/:page",checkAuthentication,middleHandler,feedbackController.list);
router.get("/feedback/view/:id?",checkAuthentication,middleHandler,feedbackController.view);
router.post("/feedback/addOrUpdate",checkAuthentication,middleHandler,feedbackController.addOrUpdate);
router.get("/feedback/delete/:id?",checkAuthentication,middleHandler,feedbackController.delete);
router.get("/feedback/download",checkAuthentication,middleHandler,feedbackController.exportData);
//*** Feedback routes end***/

//*** SMS routes start ***/
router.get("/sendSMS/list/:page",checkAuthentication,middleHandler,smsController.list);
router.get("/sendSMS/view/:id?",checkAuthentication,middleHandler,smsController.view);
router.post("/sendSMS/addOrUpdate",checkAuthentication,middleHandler,smsController.addOrUpdate);
router.get("/sendSMS/delete/:id?",checkAuthentication,middleHandler,smsController.delete);
//*** SMS routes end***/

//*** File Upload routes start ***/
router.get("/fileUpload/list",checkAuthentication,middleHandler,fileUploadController.list);
router.get("/fileUpload/view",checkAuthentication,middleHandler,fileUploadController.view);
router.post("/fileUpload/add",checkAuthentication,middleHandler,fileUploadController.add);
router.get("/fileUpload/delete/:id?",checkAuthentication,middleHandler,fileUploadController.delete);
//*** File Upload routes end***/

//*** Order Report routes start ***/
router.get("/orderReport/list/:page",checkAuthentication,middleHandler,orderReportController.list);
router.post("/orderReport/downloadOrderReport",checkAuthentication,middleHandler,orderReportController.downloadOrderReport);
//*** Order Report routes end ***/



//*** role routes start ***/
router.get("/customers/list/:page",checkAuthentication,middleHandler,customersController.list);
router.get("/customers/view/:id?",checkAuthentication,middleHandler,customersController.view);
router.post("/customers/addOrUpdate",checkAuthentication,middleHandler,customersController.addOrUpdate);
router.get("/customers/delete/:id?",checkAuthentication,middleHandler,customersController.delete);
router.post("/customers/password",checkAuthentication,middleHandler,customersController.password);
router.post("/customers/statusChange",checkAuthentication,middleHandler,customersController.statusChange);
router.post("/customers/addressesInfo",checkAuthentication,middleHandler,customersController.addressesInfo);
router.post("/customers/addressDetails",checkAuthentication,middleHandler,customersController.addressDetails);
router.get("/customers/download",checkAuthentication,middleHandler,customersController.downloadCustomerList);
//*** role routes end***/

//**** franchise routes start ****//
router.get("/franchise/list/:page",checkAuthentication,middleHandler,franchiseController.list);
router.get("/franchise/view/:id?",checkAuthentication,middleHandler,franchiseController.view);
router.post("/franchise/addOrUpdate",checkAuthentication,middleHandler,franchiseController.addOrUpdate);
router.get("/franchise/delete/:id?",checkAuthentication,middleHandler,franchiseController.delete);
router.get("/franchise/download",checkAuthentication,middleHandler,franchiseController.exportData);
//**** franchise routes end ****//

//**** city routes start ****//
router.get("/city/list/:page",checkAuthentication,middleHandler,cityController.list);
router.get("/city/view/:id?",checkAuthentication,middleHandler,cityController.view);
router.post("/city/addOrUpdate",checkAuthentication,middleHandler,cityController.addOrUpdate);
router.get("/city/delete/:id?",checkAuthentication,middleHandler,cityController.delete);
//**** city routes end ****//

//**** zipcode routes start ****//
router.get("/zipcode/list/:page",checkAuthentication,middleHandler,zipcodeController.list);
router.get("/zipcode/view/:id?",checkAuthentication,middleHandler,zipcodeController.view);
router.post("/zipcode/addOrUpdate",checkAuthentication,middleHandler,zipcodeController.addOrUpdate);
router.get("/zipcode/delete/:id?",checkAuthentication,middleHandler,zipcodeController.delete);
//**** zipcode routes end ****//

/**** banner routes start ****/
router.get("/banner/list/:page",checkAuthentication,middleHandler,bannerController.list);
router.get("/banner/view/:id?",checkAuthentication,middleHandler,bannerController.view);
router.post("/banner/addOrUpdate",checkAuthentication,middleHandler,bannerController.addOrUpdate);
router.get("/banner/delete/:id?",checkAuthentication,middleHandler,bannerController.delete);
//**** banner routes end ****//

//**** bannerdisplay routes start ****//
router.get("/bannerDiaplay/list/:page",checkAuthentication,middleHandler,bannerDisplayController.list);
router.get("/bannerDiaplay/view/:id?",checkAuthentication,middleHandler,bannerDisplayController.view);
router.post("/bannerDiaplay/addOrUpdate",checkAuthentication,middleHandler,bannerDisplayController.addOrUpdate);
router.get("/bannerDiaplay/delete/:id?",checkAuthentication,middleHandler,bannerDisplayController.delete);
//**** bannerdisplay routes end ****//

//**** bannersection routes start ****//
router.get("/bannerSection/list/:page",checkAuthentication,middleHandler,bannerSectionController.list);
router.get("/bannerSection/view/:id?",checkAuthentication,middleHandler,bannerSectionController.view);
router.post("/bannerSection/addOrUpdate",checkAuthentication,middleHandler,bannerSectionController.addOrUpdate);
router.get("/bannerSection/delete/:id?",checkAuthentication,middleHandler,bannerSectionController.delete);
//**** bannersection routes end ****//

//**** cms routes start ****//
router.get("/cms/list/:page",checkAuthentication,middleHandler,cmsController.list);
router.get("/cms/view/:id?",checkAuthentication,middleHandler,cmsController.view);
router.post("/cms/addOrUpdate",checkAuthentication,middleHandler,cmsController.addOrUpdate);
router.get("/cms/delete/:id?",checkAuthentication,middleHandler,cmsController.delete);
//**** cms routes end ****//

//**** Customer Report routes start ****//
router.get("/customersReport/list/:page",checkAuthentication,middleHandler,customerReportController.list);
router.get("/customersReport/downloadcsv", checkAuthentication, middleHandler, customerReportController.downloadCsv);
router.get("/customersReport/downloadcsv/:id?", checkAuthentication, middleHandler, customerReportController.downloadOne);
//**** Customer Report routes end ****//

//**** Blog category routes start ****//
router.get("/blogcategory/list/:page",checkAuthentication,middleHandler,blogCategoryController.list);
router.get("/blogcategory/view/:id?",checkAuthentication,middleHandler,blogCategoryController.view);
router.post("/blogcategory/addOrUpdate",checkAuthentication,middleHandler,blogCategoryController.addOrUpdate);
router.get("/blogcategory/delete/:id?",checkAuthentication,middleHandler,blogCategoryController.delete);
//**** Blog category routes end ****//

//**** Blog author routes start ****//
router.get("/blogauthor/list/:page",checkAuthentication,middleHandler,blogAuthorController.list);
router.get("/blogauthor/view/:id?",checkAuthentication,middleHandler,blogAuthorController.view);
router.post("/blogauthor/addOrUpdate",checkAuthentication,middleHandler,blogAuthorController.addOrUpdate);
router.get("/blogauthor/delete/:id?",checkAuthentication,middleHandler,blogAuthorController.delete);
//**** Blog author routes end ****//

//**** Blogs routes start ****//
router.get("/blogs/list/:page",checkAuthentication,middleHandler,blogsController.list);
router.get("/blogs/view/:id?",checkAuthentication,middleHandler,blogsController.view);
router.post("/blogs/addOrUpdate",checkAuthentication,middleHandler,blogsController.addOrUpdate);
router.get("/blogs/delete/:id?",checkAuthentication,middleHandler,blogsController.delete);
//**** Blogs routes end ****//

//**** Blog comment routes start ****//
router.get("/blogcomment/list/:page",checkAuthentication,middleHandler,blogCommentController.list);
router.get("/blogcomment/delete/:id?",checkAuthentication,middleHandler,blogCommentController.delete);
//**** Blog comment routes end ****//

//**** Dynamic Form routes start ****//
router.get("/dynamicform/list/:page",checkAuthentication,middleHandler,dynamicFromController.list);
router.get("/dynamicform/view/:id?",checkAuthentication,middleHandler,dynamicFromController.view);
router.post("/dynamicform/addOrUpdate",checkAuthentication,middleHandler,dynamicFromController.addOrUpdate);
router.get("/dynamicform/delete/:id?",checkAuthentication,middleHandler,dynamicFromController.delete);
router.get("/dynamicform/statuschange/:id?",checkAuthentication,middleHandler,dynamicFromController.statusChange);

router.get("/dynamicform/fields",checkAuthentication,middleHandler,dynamicFromController.fieldList);
router.post("/dynamicform/fields/add",checkAuthentication,middleHandler,dynamicFromController.fieldAdd);
router.get("/dynamicform/fields/delete/:id?",checkAuthentication,middleHandler,dynamicFromController.fieldDelete);
router.get("/dynamicform/fields/find/:id?",checkAuthentication,middleHandler,dynamicFromController.findFieldData);
router.post("/dynamicform/fields/properties/add",checkAuthentication,middleHandler,dynamicFromController.propertiesAdd);
router.post("/dynamicform/fields/sorting",checkAuthentication,middleHandler,dynamicFromController.sortingFelds);

router.get("/dynamicform/fields/choice",checkAuthentication,middleHandler,dynamicFromController.choiceList);
router.post("/dynamicform/fields/choice/add",checkAuthentication,middleHandler,dynamicFromController.choiceAdd);
router.get("/dynamicform/fields/choice/delete/:id?",checkAuthentication,middleHandler,dynamicFromController.choiceDelete);

router.get("/dynamicform/apply/:id?",checkAuthentication,middleHandler,dynamicFromController.applyForm);
router.post("/dynamicform/apply/add",checkAuthentication,middleHandler,dynamicFromController.submitForm);
router.get("/dynamicform/viewdata/:id?",checkAuthentication,middleHandler,dynamicFromController.viewFormData);
router.get("/dynamicform/viewdata/delete/:id?",checkAuthentication,middleHandler,dynamicFromController.deleteFormData);
//**** Dynamic Form routes end ****//


//**** Attribute routes start ****//
router.get("/attrsetting/list/:page",checkAuthentication,middleHandler,attributesController.attrList);
router.post("/attrsetting/addOrUpdate",checkAuthentication,middleHandler,attributesController.attrAdd);
router.get("/attrsetting/delete/:id?",checkAuthentication,middleHandler,attributesController.attrDelete);
router.get("/attrsetting/statuschange/:id?",checkAuthentication,middleHandler,attributesController.statusChange);
router.get("/attrsetting/value",checkAuthentication,middleHandler,attributesController.valueList);
router.post("/attrsetting/value/add",checkAuthentication,middleHandler,attributesController.valueAdd);
router.get("/attrsetting/value/delete/:id?",checkAuthentication,middleHandler,attributesController.valueDelete);

//
//////////////////////////Section start////////////////////////
router.get("/section/list/:page",checkAuthentication,middleHandler,sectionController.list);
router.get("/section/view/:id?",checkAuthentication,middleHandler,sectionController.view);
router.post("/section/addOrUpdate",  checkAuthentication,  middleHandler,  sectionController.addOrUpdate);
router.get("/section/delete/:id?",checkAuthentication,middleHandler,sectionController.delete);
/////////////////////////////////section ends///////////////////////

/************************  Contact us Message  *********************************/
router.get("/contactus/list/:page", checkAuthentication, middleHandler, contactUsController.list);
router.get("/contactus/view/:id?",checkAuthentication,middleHandler,contactUsController.view);
router.post("/contactus/addOrUpdate",  checkAuthentication,  middleHandler,  contactUsController.addOrUpdate);
router.get("/contactus/delete/:id?",checkAuthentication,middleHandler,contactUsController.delete);

//**** Attribute routes start ****//
router.get("/order/list/:page",checkAuthentication,middleHandler,orderController.orderList);
router.post("/order/statuschange",checkAuthentication,middleHandler,orderController.statusChange);
router.post("/order/salesman",checkAuthentication,middleHandler,orderController.salesman);
router.get("/order/view/:id?",checkAuthentication,middleHandler,orderController.orderView);
router.get("/order/invoice/:id?",checkAuthentication,middleHandler,orderController.invoice);
router.get("/order/download",checkAuthentication,middleHandler,orderController.downloadOrder)
router.get("/order/cancelled/:id?",checkAuthentication,middleHandler,orderController.orderCancelled)

//Delivery System Start
router.get("/delivery/create/:id?",checkAuthentication,middleHandler,orderController.deliveryCreate);
//Delivery System End

//**** Carpenter routes start ****//
router.get("/carpenter",checkAuthentication,middleHandler,carpenterController.carpenterList);
//**** Carpenter routes end ****//

/***********invitation ************** */
router.get("/invitation/list/:page",checkAuthentication, middleHandler, invitationController.list);
router.get("/invitation/addedit/:id?",checkAuthentication,middleHandler,invitationController.addedit);
//router.get("/invitation/delete/:id?", checkAuthentication, middleHandler, invitationController.delete);
/*************invitation ************* */

//**** News Letter routes start ****//
router.get("/newsletter/list/:page",checkAuthentication,middleHandler,newsLetterController.list);
router.get("/newsletter/view",checkAuthentication,middleHandler,newsLetterController.view);
router.post("/newsletter/sendMail",checkAuthentication,middleHandler,newsLetterController.add);
router.get("/newsletter/delete/:id?",checkAuthentication,middleHandler,newsLetterController.delete);
router.get("/newsletter/newemail/list/:page",checkAuthentication,middleHandler,newsLetterController.newEmailList);
router.post("/newsletter/newemail/add",checkAuthentication,middleHandler,newsLetterController.addNewEmail);
router.get("/newsletter/newemail/delete/:id?",checkAuthentication,middleHandler,newsLetterController.deleteEmail);
router.post("/newsletter/newemail/uploadcsv",checkAuthentication,middleHandler,newsLetterController.uploadCSV);
router.get("/newsletter/newemail/downloadSample",checkAuthentication,middleHandler,newsLetterController.downloadSample);
router.get("/newsletter/list/view/:id?",checkAuthentication,middleHandler,newsLetterController.viewDetails);
router.get("/newsletter/download",checkAuthentication,middleHandler,newsLetterController.exportData);
//**** News Letter routes end ****//

///////////////salesman Start ///////////////////////////////
router.get("/salesman", checkAuthentication, middleHandler, salesmanController.salesmanList);
router.get("/salesman/addedit/:id?", checkAuthentication, middleHandler, salesmanController.addeditSalesman);
router.post("/salesman/add", checkAuthentication, middleHandler, salesmanController.addSalesman);
router.get("/salesman/delete/:id?", checkAuthentication, middleHandler, salesmanController.deleteSalesman);
//////////////End salesman ////////////////////////////

///////////////walletController Start ///////////////////////////////
router.get( "/wallet/list/:page",checkAuthentication, middleHandler,walletController.walletList);
///////////////walletController end ///////////////////////////////

//** Contacts routes start **//
router.get("/contacts/contactlist/:page",checkAuthentication,middleHandler,contactController.contactList);
router.get("/contacts/emaillist/:page",checkAuthentication,middleHandler,contactController.contactEmailList);
router.get("/contacts/addedit/:id?",checkAuthentication,middleHandler,contactController.contactAddEdit);
router.get("/contacts/downloadSample",checkAuthentication,middleHandler,contactController.downloadSample);
router.post("/contacts/addedit/title",checkAuthentication,middleHandler,contactController.addeditTitle);
router.post("/contacts/addedit/uploadcsv",checkAuthentication,middleHandler,contactController.uploadCSV);
router.post("/contacts/addedit/uploadmanually",checkAuthentication,middleHandler,contactController.uploadManually);
router.get("/contacts/delete/:id?",checkAuthentication,middleHandler,contactController.deleteContact);
router.get("/contacts/emaillist/:page/export",checkAuthentication,middleHandler,contactController.exportContactList);
router.get("/contacts/emaillist/delete/:id?",checkAuthentication,middleHandler,contactController.deleteEmail);
router.get("/contacts/emaillist/statuschange/:id?",checkAuthentication,middleHandler,contactController.statusChange);
router.get("/emailconfig/list/:page",checkAuthentication,middleHandler,contactController.emailConfigList);
router.get("/emailconfig/view/:id?",checkAuthentication,middleHandler,contactController.viewEmailConfig);
router.post("/emailconfig/addOrUpdate",checkAuthentication,middleHandler,contactController.createEmailConfig);
router.get("/emailconfig/delete/:id?",checkAuthentication,middleHandler,contactController.deleteEmailConfig);
router.get("/campaign/list/:page",checkAuthentication,middleHandler,contactController.campaignList);
router.get("/campaign/delete/:id",checkAuthentication,middleHandler,contactController.deleteCampaign);
router.get("/campaign/view",checkAuthentication,middleHandler,contactController.viewCampaign);
router.post("/campaign/create",checkAuthentication,middleHandler,contactController.createCampaign);
router.get("/campaign/emails/:page",checkAuthentication,middleHandler,contactController.campaignEmailList);
router.get("/contacts/unsubscribe/:storeId/:email",contactController.unsubscribeView);
router.post("/contacts/unsubscribe/:storeId/:email",contactController.unsubscribe);
//** Contacts routes end **//

//* Billing Feedback Routes Start**/
router.get("/billingFeedback/list/:page",checkAuthentication,middleHandler,billingFeedbackController.list);
router.get("/billingFeedback/view/:id?",checkAuthentication,middleHandler,billingFeedbackController.view);
//* Billing Feedback Routes End */

router.get("/datamigration",checkAuthentication,middleHandler,dataMigrationController.view);
router.post("/datamigration",checkAuthentication,middleHandler,dataMigrationController.create);

//**** Module Attribute routes start ****//
router.get("/module/attrsetting/list/:page",checkAuthentication,middleHandler,moduleAttributesController.attrList);
router.post("/module/attrsetting/addOrUpdate",checkAuthentication,middleHandler,moduleAttributesController.attrAdd);
router.get("/module/attrsetting/delete/:id?",checkAuthentication,middleHandler,moduleAttributesController.attrDelete);
router.get("/module/attrsetting/statuschange/:id?",checkAuthentication,middleHandler,moduleAttributesController.statusChange);
router.get("/module/attrsetting/value",checkAuthentication,middleHandler,moduleAttributesController.valueList);
router.post("/module/attrsetting/value/add",checkAuthentication,middleHandler,moduleAttributesController.valueAdd);
router.get("/module/attrsetting/value/delete/:id?",checkAuthentication,middleHandler,moduleAttributesController.valueDelete);

//*** Profile Routes Start */
router.get("/profile/addedit/", checkAuthentication, middleHandler, profileController.view);

router.get("/permission-group/list",checkAuthentication,middleHandler,permissionController.gropuList);
router.get("/permission-group/view/:id?",checkAuthentication,middleHandler,permissionController.groupView)
router.post("/permission-group/addOrUpdate",checkAuthentication,middleHandler,permissionController.groupAddOrUpdate);
router.get("/assign-permission/list",checkAuthentication,middleHandler,permissionController.logList);
router.get("/assign-permission/view/:id?",checkAuthentication,middleHandler,permissionController.logView)
router.post("/assign-permission/addOrUpdate",checkAuthentication,middleHandler,permissionController.logAddOrUpdate)

router.get("/image-resize/list", checkAuthentication, middleHandler, imageResizeController.storeList);
router.get("/image-resize/configuration/:id",checkAuthentication,middleHandler,imageResizeController.imageSettingView);
router.post("/image-resize/configuration/addedit",checkAuthentication,middleHandler,imageResizeController.imageSettingAddOrUpdate);

//**** news routes start ****//
router.get("/news/list/:page",checkAuthentication,middleHandler,newsController.list);
router.get("/news/view/:id?",checkAuthentication,middleHandler,newsController.view);
router.post("/news/addOrUpdate",checkAuthentication,middleHandler,newsController.addOrUpdate);
router.get("/news/delete/:id?",checkAuthentication,middleHandler,newsController.delete);
//**** news routes end ****//


router.get("/giftSet", checkAuthentication, middleHandler, giftSetController.giftSetList);
router.get("/giftSet/addedit/:id?", checkAuthentication, middleHandler, giftSetController.addeditGiftSet);
router.post("/giftSet/add", checkAuthentication, middleHandler, giftSetController.addGiftSet);
router.get("/giftSet/delete/:id?", checkAuthentication, middleHandler, giftSetController.deleteGiftSet);


/************************  Contact us Message  *********************************/
router.get("/customerCouponRequest/list/:page", checkAuthentication, middleHandler, customerCouponRequestController.list);
router.get("/customerCouponRequest/view/:id?",checkAuthentication,middleHandler,customerCouponRequestController.view);
router.post("/customerCouponRequest/addOrUpdate",  checkAuthentication,  middleHandler,  customerCouponRequestController.addOrUpdate);
router.get("/customerCouponRequest/delete/:id?",checkAuthentication,middleHandler,customerCouponRequestController.delete);

module.exports = router;
