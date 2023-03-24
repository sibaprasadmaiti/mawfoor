var express = require("express");
var router = express.Router();
var authController = require("../controllers/api/authController");

var brandsController = require("../controllers/api/brandsController");
var categoriesController = require("../controllers/api/categoriesController");
var testimonialsController = require("../controllers/api/testimonialsController");
var apiController = require("../controllers/api/apiController");

var productController = require("../controllers/api/productController");
var cartsController = require("../controllers/api/cartsController");
var orderController = require("../controllers/api/orderController");

var versionController = require("../controllers/api/versionController");
const bannerController = require("../controllers/api/bannerController");
const contentBlockController = require("../controllers/api/contentBlockController");
const pageController = require("../controllers/api/pageController");
const galleryController = require("../controllers/api/galleryController");
const blogController = require("../controllers/api/blogController");
const dynamicFormController = require("../controllers/api/dynamicFormController");
var customerController = require("../controllers/api/customerController");
var deliveryTimeslotController = require("../controllers/api/deliveryTimeslotController");
var couponController = require("../controllers/api/couponController");
const contactUsController = require("../controllers/api/contactUsController");
const feedbackController = require("../controllers/api/feedbackController");
const faqController = require("../controllers/api/faqController");
const carpenterController = require("../controllers/api/carpenterController");
const termsConditionsController = require("../controllers/api/termsConditionsController");
var invitationController = require("../controllers/api/invitationController");
const subscriberController = require("../controllers/api/subscriberController");
const zbrdstHomeDetails = require("../controllers/api/zbrdstHomeDetails");
const franchiseeController = require("../controllers/api/franchiseeController");
var homePageDetailController = require("../controllers/api/homePageDetailController");
var deliveryboyController = require("../controllers/api/deliveryboyController");
const walletController = require("../controllers/api/walletController")
var vendorAppController = require("../controllers/api/vendorAppController");
const menusController = require('../controllers/api/menusController');
const moduleController = require('../controllers/api/moduleController');
const vendorSitesettingController = require("../controllers/api/vendorSitesettingController");
var vendorProductController = require("../controllers/api/vendorProductController");
const vendorCustomerController = require("../controllers/api/vendorCustomerController");
const questionaireController = require('../controllers/api/questionaireController');
var vendorCategoryController = require("../controllers/api/vendorCategoryController");
const moduleSettingController = require('../controllers/api/moduleSettingController');
var studentController = require("../controllers/api/studentController");
var iudyogController = require("../controllers/api/iudyogController");
const catalogPriceRuleController = require('../controllers/api/catalogPriceRuleController');
const cartPriceRuleController = require('../controllers/api/cartPriceRuleController');
const vendorOrderController = require('../controllers/api/vendorOrderController');
const vendorMastersController = require('../controllers/api/vendorMastersController');
const vendorFeedbackController = require('../controllers/api/vendorFeedbackController');
const razorPayController = require('../controllers/api/razorPayController');
const vendorMessageController = require('../controllers/api/vendorMessageController');

const chatController = require("../controllers/api/chatController");
const vendorBannerController = require('../controllers/api/vendorBannerController');
const onlineStoreController = require('../controllers/api/onlineStoreController');
const shipaController = require('../controllers/api/shipaController');

var models = require("../models");
var passport = require("passport");
var bcrypt = require("bcrypt-nodejs");
var csrf = require("csurf");
var csrfProtection = csrf({ cookie: true });
var app = express();
var url = require("url");
//const authMiddleware = require("../middlewares/auth.middleware");
//**** Api auth routes start ****//
router.post("/auth/signin", authController.signin);
router.post("/auth/verify-otp", authController.verifyOtp);
router.post("/auth/signup", authController.signup);
router.post("/auth/registration", authController.registration);
router.post("/auth/emailLogin", authController.emailLogin);
//**** Api auth routes end ****//

//**** Api category routes start ****//
router.post("/category/categorylist", categoriesController.categorylist);
router.post("/appBrandList", categoriesController.appBrandList);
router.post("/appOptionValueList", categoriesController.appOptionValueList);
router.post("/categoryMetaDetails", categoriesController.categoryMetaDetails);
router.post("/parameWiseCategorylist", categoriesController.parameWiseCategorylist);
//**** Api category routes end ****//

//**** Api brands routes start ****//
router.post("/brand/list", brandsController.list);
router.post("/brand/details", brandsController.details);
router.post("/brand/search", brandsController.searchList);
//**** Api brands routes end ****//

//**** Api testimonials routes start ****//
router.post("/product/productList", productController.productList);
router.post("/product/productDetails", productController.productDetails);
router.post("/product/filterProductList", productController.filterProductList);
router.post("/product/productcart",productController.productcart);
router.post("/product/bestSellingProductList",productController.bestSellingProductList);
router.post("/product/newArrivalProductList",productController.newArrivalProductList);
router.post("/product/addFavouriteProduct",productController.addFavouriteProduct);
router.post("/product/customerFavouriteProductList",productController.customerFavouriteProductList);
router.post("/product/customerFavouriteProductRemove",productController.customerFavouriteProductRemove);
router.post("/related-product-list", productController.appRelatedProductList);
router.post("/appProductList", productController.appProductList);
router.post("/brandWiseProductDetails", productController.brandWiseProductDetails);
router.post("/restaurantFilterProductList", productController.restaurantFilterProductList);
router.post("/favouriteProductRemove", productController.favouriteProductRemove);
router.post("/categoryProductSearch", productController.categoryProductSearch);
router.post("/homeRandumProductList", productController.homeRandumProductList);
router.post("/configAndAddonProductList", productController.configAndAddonProductList);
router.post("/product/productSearch", productController.productSearch);
router.post("/productMetaDetails", productController.productMetaDetails);
router.post("/appAllProductList", productController.appAllProductList);

//**** Api testimonials routes end ****//

//** Api cart routes start **//
router.post("/product/addToCart", cartsController.addToCartCount);
router.post("/product/multipleAddToCart", cartsController.multipleAddToCart);
router.post("/product/cartItemDelete", cartsController.cartItemDelete);
router.post("/product/cartItemIncrement", cartsController.cartItemIncrement);
router.post("/product/cartItemDecrement", cartsController.cartItemDecrement);
router.post("/product/cartItemListing", cartsController.cartItemListing);
router.post("/guestCartShippingCharge", cartsController.guestCartShippingCharge);
router.post("/app-header-cart", cartsController.appHeaderCart);
router.post("/product/guestCartItemAdd", cartsController.guestCartItemAdd);
router.post("/customerCartDetails", cartsController.customerCartDetails);
router.post("/product/addonCartUpdate", cartsController.appAddonCartUpdate);
router.post("/customerCartDelete", cartsController.customerCartDelete);
//**** Api cart routes end ****//

//** Api Order routes start **//
router.post("/order/addOrder", orderController.addOrder);
router.post("/order/orderList", orderController.orderList);
router.post("/order/cancelOrder", orderController.cancelOrder);
router.post("/reservation/booking", orderController.booking);
router.post("/appReOrder", orderController.appReOrder);
router.post("/orderShow", orderController.orderShow);
router.post("/codDetails", orderController.codDetails);
router.post("/paymentCallBack", orderController.paymentCallBack);
//** Api Order routes end **//

//*****versionController API Start
router.post("/version-check", versionController.versionCheck);
//*****versionController API End

//*****Comming Soon Page Call
router.post("/commingsoon/emailadd", apiController.emailadd);
router.get("/dashboard", apiController.dashboard);

router.post("/sylicePost", apiController.sylicePost);
router.get("/syliceGet", apiController.syliceGet);
router.post("/testingData", apiController.testingData);
router.post("/emailTest", apiController.emailTest);

//*****Customer Details API start
router.post("/customer/customerAddEdit", customerController.customerAddEdit);
router.post("/customer/customerDetails", customerController.customerDetails);
router.post("/customer/addEditCustomerAddress", customerController.addEditCustomerAddress);
router.post("/customer/customeraddressList", customerController.customeraddressList);
router.post("/customer/customerAddressPrime", customerController.customerAddressPrime);
router.post("/customer/appCustomerAddressDelete", customerController.appCustomerAddressDelete);
router.post("/customer/customerPushTokenUpdate", customerController.customerPushTokenUpdate);
router.post("/customer/customerHomeAddress", customerController.customerHomeAddress);
//*****Customer Details API end

/**Api DeliveryTime Slot**/
router.post("/delivery/deliveryTimeslotList",deliveryTimeslotController.deliveryTimeslotList);
router.post("/reservationTimeList",deliveryTimeslotController.reservationTimeList);

/**Api Coupon Routes**/
router.post("/coupon/couponList", couponController.couponList);
router.post("/coupon/couponAmount", couponController.couponAmount);
router.post("/coupon/discountAmount", couponController.discountAmount);
router.post("/customerCouponRequest", couponController.customerCouponRequest);

//**** Api banner routes start ****//
router.post("/banner/bannerlist", bannerController.bannerlist);
//**** Api banner routes end ****//

//**** Api contentBlock routes start ****//
router.post("/contentBlock/contentBlocklist", contentBlockController.blockList);
//**** Api contentBlock routes end ****//

//**** Api page routes start ****//
router.post("/page/pagelist", pageController.pageList);
router.post("/page/cmsList", pageController.sectionList);
router.post("/sectionDetails", pageController.sectionDetails);

//**** Api page routes end ****//

//**** Api gallery routes start ****//
router.post("/gallery/gallerylist", galleryController.galleryList);
router.post("/gallery/allgallerylist", galleryController.allGalleryList);
//**** Api gallery routes end ****//


//**** Api Dynamic Form routes start ****//
router.post("/dynamicForm", dynamicFormController.dynamicForm);
router.post("/dynamicForm/save", dynamicFormController.saveData);
router.post("/dynamicForm/list", dynamicFormController.formList);
router.post("/dynamicForm/details", dynamicFormController.formDetails);
router.post("/dynamicForm/delete", dynamicFormController.formDelete);
//**** Api Dynamic Form routes end ****//

/**** Api contactUsController routes start ****/
router.post("/contact/saveContact", contactUsController.save);
router.post("/getContactusAdditionalInfo", contactUsController.getContactusAdditionalInfo);
//**** Api contactUsController routes end ****//

/**** Api FAQ List routes start ****/
router.post("/testimonial/list", testimonialsController.list);
//**** Api FAQ List routes end ****//

/**** Api feedback routes start ****/
router.post("/feedback", feedbackController.add);
router.post("/customerOrderFeedback",feedbackController.customerOrderFeedback);
router.post("/customerOrderFeedbackCheck",feedbackController.customerOrderFeedbackCheck);
router.post("/billingFeedback", feedbackController.billingFeedbackSubmit);
//**** Api feedback routes end ****//

/**** Api FAQ List routes start ****/
router.post("/faqList", faqController.faqList);
//**** Api FAQ List routes end ****//

/****** carpenterController start *********/
router.post("/carpenterRegistration", carpenterController.carpenterRegistration);
/****** carpenterController start *********/

/*********** terms Conditions start **************/
router.post("/termsConditionsList", termsConditionsController.termsConditionsList);
/********** terms Conditions start **************/

router.post("/save-subscriber", subscriberController.saveSubscriber);


router.post("/homeDetails", homePageDetailController.homeDetails);


router.post("/cmsListManage", homePageDetailController.cmsListManage);
router.post("/cmsList", homePageDetailController.cmsList);

router.post("/appSiteSettings", homePageDetailController.appSiteSettings);
router.post("/socialMideDetails", homePageDetailController.socialMideDetails);
router.post("/giftSetList", homePageDetailController.giftSetList);

/****************************invitationController *****************************/
router.post("/sendInvitation",invitationController.sendInvitation);
/****************************invitationController *****************************/

router.post("/zbrdstHomeDetails", zbrdstHomeDetails.zbrdstHomeDetails);
router.post("/franchisee/add", franchiseeController.franchiseeAdd);

/****************************deliveryboyController *****************************/
//code for Delivery app start..........
router.post("/delivery/login",deliveryboyController.salesmanLogin);
router.post("/delivery/otpcheck",deliveryboyController.salesmanOtpchecking);
router.post("/delivery/resendOtp",deliveryboyController.salesmanResendOtp);
router.post("/delivery/orderlist",deliveryboyController.salesmanOrderlist);
router.post("/delivery/orderDetails",deliveryboyController.salesmanOrderDetails);
router.post("/delivery/orderDestination",deliveryboyController.salesmanOrderDestination);
router.post("/delivery/orderInfo",deliveryboyController.salesmanOrderInfo);
router.post("/delivery/orderUpdate",deliveryboyController.salesmanOrderStatusUpdate);
router.post("/delivery/attendance",deliveryboyController.salesmanAttendance);
router.post("/delivery/dashboard",deliveryboyController.salesmanDashboard);
router.post("/delivery/notification",deliveryboyController.salesmanNotification);
router.post("/delivery/openOrderlist",deliveryboyController.salesmanOpenOrderlist);
router.post("/delivery/break",deliveryboyController.salesmanBreak);
router.post("/delivery/orderAcceptOrReject",deliveryboyController.salesmanOrderAcceptOrReject);
router.post("/delivery/pushTokenUpdate",deliveryboyController.salesmanPushTokenUpdate);
// Delivery app end
/****************************deliveryboyController *****************************/

/****************************vendorAppController *****************************/
//code for vendor app start..........
router.post("/vendor/login",vendorAppController.vendorLogin);
router.post("/vendor/demo/login",vendorAppController.demoVendorLogin);
router.post("/vendor/otpcheck",vendorAppController.vendorOtpchecking);
router.post("/vendor/resendOtp",vendorAppController.vendorResendOtp);
router.post("/vendor/orderlist",vendorAppController.vendornOrderlist);
router.post("/vendor/orderDetails",vendorAppController.vendorOrderDetails);
router.post("/vendor/orderDestination",vendorAppController.vendorOrderDestination);
router.post("/vendor/openOrderlist",vendorAppController.vendorOpenOrderlist);
router.post("/vendor/orderAcceptOrReject",vendorAppController.vendorOrderAcceptOrReject);
router.post("/vendor/dashboard",vendorAppController.vendorDashboard);
router.post("/vendor/orderStatusList",vendorAppController.vendorOrderStatusList);
router.post("/vendor/orderStatusUpdate",vendorAppController.vendorOrderStatusUpdate);
router.post("/vendor/deliveryBoyList",vendorAppController.vendorDeliveryBoyList);
router.post("/vendor/userAddEdit",vendorAppController.userAddEdit);
router.post("/vendor/userList",vendorAppController.userList);
router.post("/vendor/storeUpdate",vendorAppController.storeUpdate);
router.post("/vendor/orderStatusChange",vendorAppController.orderStatusChange);
router.post("/vendor/attributeDetails",vendorAppController.attributeDetails);
router.post("/vendor/forgotPassword",vendorAppController.vendorForgotPassword);
router.post("/vendor/forgotPasswordCheck",vendorAppController.forgotPasswordCheck);
router.post("/vendor/resetPassword",vendorAppController.vendorResetPassword);
router.post("/vendor/viewProfile",vendorAppController.viewProfile);
router.post("/vendor/editProfile",vendorAppController.editProfile);
router.post("/vendor/viewMessage",vendorAppController.viewMessage);
router.post("/vendor/addEditMessage",vendorAppController.addEditMessage);
// router.post("/vendor/messageUserLogin",vendorAppController.messageUserLogin);
// vendor app end
/****************************vendorAppController *****************************/

/****************************menusController *****************************/
router.post("/menu/list", menusController.menuList);
router.post("/menu/create", menusController.menuCreate);
router.delete("/menu/delete/:id", menusController.menuDelete);
router.post("/menu/namelist", menusController.menuName);
router.post("/menu/menu-list", menusController.frontendMenu);
router.post("/menu/menu-count", menusController.menuCount);
router.post("/menu/view", menusController.menuView);
router.post("/menu/statusChange", menusController.statusChange);
router.post("/menu/subMenuList", menusController.subMenuList);
/****************************menusController *****************************/

/****************************moduleController *****************************/
router.post("/module/list", moduleController.moduleList);
router.post("/module/create", moduleController.moduleCreate);
router.delete("/module/delete/:id", moduleController.moduleDelete);
router.post("/module/view", moduleController.moduleView);
router.post("/moduleitem/list", moduleController.moduleItemList);
router.post("/moduleitem/create", moduleController.moduleItemCreate);
router.delete("/moduleitem/delete/:id", moduleController.moduleItemDelete);
router.post("/moduleitem/view", moduleController.moduleItemView);
router.post("/module/module-list", moduleController.frontendModule);
router.post("/section/list", moduleController.sectionList);
router.post("/section/view", moduleController.sectionView);
router.post("/section/create", moduleController.sectionCreate);
router.delete("/section/delete/:id", moduleController.sectionDelete);
router.post("/module/module-details", moduleController.frontendModuleDetails);
router.post("/module/moduleitem-details", moduleController.frontendModuleItemDetails);
router.post("/module/section-details", moduleController.frontendSectionDetails);
router.post("/global-details", moduleController.globalDetails);
router.post("/module/new-module-list", moduleController.newModuleList);
router.post("/module/statusChange", moduleController.moduleStatusChange);
router.post("/moduleitem/statusChange", moduleController.moduleItemStatusChange);
router.post("/section/statusChange", moduleController.sectionStatusChange);
router.post("/section/sorting", moduleController.sectionSorting);
router.post("/subSection/list", moduleController.subSectionList);
router.post("/subSection/view", moduleController.subSectionView);
router.post("/subSection/create", moduleController.subSectionCreate);
router.delete("/subSection/delete/:id", moduleController.subSectionDelete);
router.post("/subSection/statusChange", moduleController.subSectionStatusChange);
router.post("/module/subsection-details", moduleController.frontendSubSectionDetails);
router.post("/module/nameList", moduleController.moduleNameList);
router.post("/moduleitem/nameList", moduleController.moduleItemNameList);
router.post("/section/nameList", moduleController.dynamicSectionNameList);
router.post("/subSection/nameList", moduleController.subSectionNameList);
/****************************moduleController *****************************/

/****************************vendorSitesettingController *****************************/
router.post("/vendor/sitesettingGroupAddEdit",vendorSitesettingController.sitesettingGroupAddEdit);
router.post("/vendor/sitesettingGroupView",vendorSitesettingController.sitesettingGroupView);
router.post("/vendor/sitesettingGroupList",vendorSitesettingController.sitesettingGroupList);
router.post("/vendor/sitesettingGroupDelete",vendorSitesettingController.sitesettingGroupDelete);
router.post("/vendor/sitesettingAdd",vendorSitesettingController.sitesettingAdd);
router.post("/vendor/sitesettingAddEdit",vendorSitesettingController.sitesettingAddEdit);
router.post("/vendor/sitesettingView",vendorSitesettingController.sitesettingView);
router.post("/vendor/sitesettingList",vendorSitesettingController.sitesettingList);
router.post("/vendor/sitesettingDelete",vendorSitesettingController.sitesettingDelete);
/****************************vendorSitesettingController *****************************/

/****************************vendorProductController *****************************/
//code for vendor app start..........
router.post("/vendor/pushTokenUpdate",vendorProductController.vendorPushTokenUpdate);
router.post("/vendor/product/categoryList",vendorProductController.categoryList);
router.post("/vendor/product/productList",vendorProductController.productList);
router.post("/vendor/product/productStatusUpdate",vendorProductController.productStatusUpdate);
router.post("/vendor/product/productDetails",vendorProductController.productDetails);
router.post("/vendor/product/productAdd",vendorProductController.productAdd);
router.post("/vendor/product/productImageDelete",vendorProductController.productImageDelete);
router.post("/product/allproducts", vendorProductController.allProductList);
router.post("/vendor/product/configurableProductDelete", vendorProductController.configurableProductDelete);
router.post("/vendor/product/productSearch", vendorProductController.vendorProductSearch);
router.post("/vendor/product/productDelete", vendorProductController.productDelete);
router.post("/vendor/product/relatedProductDelete", vendorProductController.relatedProductDelete);
router.post("/vendor/product/selectedProductDelete", vendorProductController.selectedProductDelete);
// vendor app end
/****************************vendorProductController *****************************/

/****************************vendorCustomerController *****************************/
router.post("/vendor/customerList",vendorCustomerController.customerList);
router.post("/vendor/customerView",vendorCustomerController.customerView);
router.post("/vendor/changeStatus",vendorCustomerController.changeStatus);
router.post("/vendor/citylist",vendorCustomerController.citylist);
router.post("/vendor/namelist",vendorCustomerController.namelist);
router.post("/vendor/addCustomer",vendorCustomerController.addCustomer);
router.post("/vendor/editCustomer",vendorCustomerController.editCustomer);
router.post("/vendor/customerDetails",vendorCustomerController.customerDetails);
router.post("/vendor/viewCustomerAddress",vendorCustomerController.viewCustomerAddress);
router.post("/vendor/addCustomerAddress",vendorCustomerController.addCustomerAddress);
router.post("/vendor/editCustomerAddress",vendorCustomerController.editCustomerAddress);
router.post("/vendor/deleteCustomerAddress",vendorCustomerController.deleteCustomerAddress);
router.post("/vendor/customerSearch",vendorCustomerController.customerSearch);
router.post("/vendor/customerNameDetails",vendorCustomerController.customerNameDetails);
/****************************vendorCustomerController *****************************/

/****************************vendorCategoryController *****************************/
//code for vendor app start..........
router.post("/vendor/category/categoryList",vendorCategoryController.categoryList);
router.post("/vendor/category/categoryDetails",vendorCategoryController.categoryDetails);
router.post("/vendor/category/categoryAdd",vendorCategoryController.categoryAdd);
router.post("/vendor/category/categoryImageDelete",vendorCategoryController.categoryImageDelete);
router.post("/vendor/category/subcategoryList", vendorCategoryController.subcategoryList);
router.post("/vendor/category/categoryTree", vendorCategoryController.categoryTree);
router.post("/vendorCategoryList",vendorCategoryController.vendorCategoryList);
router.post("/vendorSubCategoryList",vendorCategoryController.vendorSubCategoryList);
router.post("/vendorCategoryDelete",vendorCategoryController.vendorCategoryDelete);
// vendor app end
/****************************vendorCategoryController *****************************/

/****************************questionaireController *****************************/
router.post("/questionaire/list", questionaireController.questionaireList);
router.post("/questionaire/create", questionaireController.questionaireCreate);
router.delete("/questionaire/delete/:id", questionaireController.questionaireDelete);
router.post("/questionaire/view", questionaireController.questionaireView);

router.post("/questions/list", questionaireController.questionsList);
router.post("/questions/create", questionaireController.questionsCreate);
router.post("/questions/sorting", questionaireController.questionsSorting);
router.delete("/questions/delete/:id", questionaireController.questionsDelete);

router.post("/questionsoption/list", questionaireController.questionOptionsList);
router.post("/questionsoption/create", questionaireController.questionOptionsCreate);
router.delete("/questionsoption/delete/:id", questionaireController.questionOptionsDelete);

router.post("/survey/questionaire-list", questionaireController.surveyQuestionarieList);
router.post("/survey/questions-list", questionaireController.surveyQuestionList);
router.post("/survey/submit", questionaireController.submitServay);
router.post("/survey/result", questionaireController.surveyResult);
router.post("/survey/result/details", questionaireController.surveyResultDetails);
router.delete("/survey/result/delete/:id", questionaireController.surveyResultDelete);
router.post("/questions/view", questionaireController.questionsView);
router.post("/survey/certificate-details", questionaireController.surveyCertificate);
router.post("/survey/reports", questionaireController.surveyReport);
/****************************questionaireController *****************************/

/****************************moduleSettingController *****************************/
router.post("/setting/settinglist", moduleSettingController.settingList);
router.post("/setting/settingcreate", moduleSettingController.settingCreate);
router.post("/setting/settingview", moduleSettingController.settingView);
router.delete("/setting/delete/:id", moduleSettingController.settingDelete);
router.post("/setting/site-setting-list", moduleSettingController.frontendSettingList);
/****************************moduleSettingController *****************************/

/****************************studentController *****************************/
router.post("/student/registration", studentController.registration);
router.post("/student/login", studentController.login);
router.post("/student/getACallbackSubmit", studentController.getACallbackSubmit);
router.post("/vendor/callbackList", studentController.getACallbackDetails);
/****************************studentController *****************************/

/****************************iudyogController *****************************/
router.post("/student/contactUsSave", iudyogController.contactUsSave);
router.post("/iudyog/subscribe", iudyogController.subscribe);
router.post("/iudyog/contactUsList", iudyogController.contactUsList);
/****************************iudyogController *****************************/

/****************************catalogPriceRuleController *****************************/
router.post("/catalog-price-rule/list", catalogPriceRuleController.ruleList);
router.post("/catalog-price-rule/create", catalogPriceRuleController.ruleCreate);
router.post("/catalog-price-rule/details", catalogPriceRuleController.ruleDetails);
router.post("/catalog-price-rule/conditionDelete", catalogPriceRuleController.ruleConditionDelete);
router.post("/catalog-price-rule/search", catalogPriceRuleController.catalogPriceRuleSearch);
/****************************catalogPriceRuleController *****************************/

/****************************cartPriceRuleController *****************************/
router.post("/cart-price-rule/list", cartPriceRuleController.ruleList);
router.post("/cart-price-rule/create", cartPriceRuleController.ruleCreate);
router.post("/cart-price-rule/details", cartPriceRuleController.ruleDetails);
router.post("/cart-price-rule/conditionDelete", cartPriceRuleController.ruleConditionDelete);
router.post("/cart-price-rule/search", cartPriceRuleController.cartPriceRuleSearch);
/****************************cartPriceRuleController *****************************/

/****************************vendorOrderController *****************************/
router.post("/vendor/order/customerList", vendorOrderController.customerList);
router.post("/vendor/order/customerAddressList", vendorOrderController.customerAddressList);
router.post("/vendor/order/productList", vendorOrderController.productList);
router.post("/vendor/order/deliveryChargeDetails", vendorOrderController.deliveryChargeDetails);
router.post("/vendor/order/createOrder", vendorOrderController.createOrder);
/****************************vendorOrderController *****************************/

/*********blogController **********/
router.post("/blog/author/list", blogController.blogAuthorList);
router.post("/blog/author/view", blogController.blogAuthorView);
router.post("/blog/author/create", blogController.blogAuthorCreate);
router.post("/blog/author/delete", blogController.blogAuthorDelete);
router.post("/blog/author/namelist", blogController.blogAuthorNameList);
router.post("/blog/category/list", blogController.blogCategoryList);
router.post("/blog/category/view", blogController.blogCategoryView);
router.post("/blog/category/create", blogController.blogCategoryCreate);
router.post("/blog/category/delete", blogController.blogCategoryDelete);
router.post("/blog/category/namelist", blogController.blogCategoryNameList);
router.post("/blog/list", blogController.blogList);
router.post("/blog/view", blogController.blogView);
router.post("/blog/create", blogController.blogCreate);
router.post("/blog/delete", blogController.blogDelete);
router.post("/blog/comment/list", blogController.blogCommentList);
router.post("/blog/details", blogController.blogDetails);
router.post("/blog/comment/view", blogController.blogCommentView);
router.post("/blog/comment/create", blogController.blogCommentCreate);
router.post("/blog/comment/delete", blogController.blogCommentDelete);
router.post("/newsList", blogController.newsList);
router.post("/newsDetails", blogController.newsDetails);
/*********blogController **********/

/****************************vendorMastersController *****************************/
router.post("/vendor/deliveryTimeSlotAddEdit", vendorMastersController.deliveryTimeSlotAddEdit);
router.post("/vendor/deliveryTimeSlotView", vendorMastersController.deliveryTimeSlotView);
router.post("/vendor/deliveryTimeSlotList", vendorMastersController.deliveryTimeSlotList);
router.post("/vendor/deliveryTimeSlotDelete", vendorMastersController.deliveryTimeSlotDelete);
router.post("/vendor/reservationTimeSlotAddEdit", vendorMastersController.reservationTimeSlotAddEdit);
router.post("/vendor/reservationTimeSlotView", vendorMastersController.reservationTimeSlotView);
router.post("/vendor/reservationTimeSlotList", vendorMastersController.reservationTimeSlotList);
router.post("/vendor/reservationTimeSlotDelete", vendorMastersController.reservationTimeSlotDelete);

/****************************vendorMastersController *****************************/

/*********vendorFeedbackController **********/

router.post("/vendor/billingFeedbackList", vendorFeedbackController.billingFeedbackList);
router.post("/vendor/billingFeedbackDetails", vendorFeedbackController.billingFeedbackView);
router.post("/vendor/billingFeedback/approve", vendorFeedbackController.billingFeedbackReview);
router.post("/vendor/feedback/list", vendorFeedbackController.feedbackList);
/*********vendorFeedbackController **********/

router.post("/appWalletDashboard", walletController.appWalletDashboard);

/****************************razorPayController start *****************************/
router.post("/razorpayInformation", razorPayController.razorpayInformationSave);
router.post("/razorpayDetails", razorPayController.razorpayInformationList);
/****************************razorPayController end *****************************/

/****************************vendorMessageController Start *****************************/
router.post("/messageAdd", vendorMessageController.messageAdd);
router.post("/messageList", vendorMessageController.messageList);
router.post("/messageUserLogin",vendorMessageController.messageUserLogin);
router.post("/vendor/messageUserListing",vendorMessageController.messageUserListing);
/****************************vendorMessageController end *****************************/

/****************************chatController Start *****************************/
router.post("/chat/allUsers", chatController.userChats);
router.post("/chat/messageUser", chatController.userMessage);
router.post("/chat/userReadMessage", chatController.userReadMessage);
/****************************chatController Start *****************************/

/************vendorBannerController start********** */
router.post("/vendor/bannerList", vendorBannerController.bannerList);
router.post("/vendor/bannerAdd", vendorBannerController.bannerAdd);
router.post("/vendor/bannerView", vendorBannerController.bannerView);
router.post("/vendor/bannerDelete", vendorBannerController.bannerDelete);


/************vendorBannerController start********** */


/************onlineStoreController start********** */
router.post("/store/storeList", onlineStoreController.storeList);
/************onlineStoreController end********** */

/*********Shipa API Start****************/
router.get("/shipa/countries", shipaController.countries);
/*********Shipa API Start****************/

module.exports = router;
