'use strict';
var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];
var db        = {};
if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}
fs.readdirSync(__dirname).filter(function(file) {
  return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
}).forEach(function(file) {
  var model = sequelize['import'](path.join(__dirname, file));
  db[model.name] = model;
});
Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;
/*Associate Start*/
/*Associate Relation with admin and Store*/
db.stores.hasMany(db.admins);

db.admins.belongsTo(db.stores);
/*Associate Relation with Category and Store*/
db.stores.hasMany(db.categories);
db.categories.belongsTo(db.stores);
/*Associate Relation with Product and Store*/
db.stores.hasMany(db.products);
db.products.belongsTo(db.stores);
/*Associate Relation with Product Category and Store*/
db.stores.hasMany(db.productCategory);
db.productCategory.belongsTo(db.stores);
/*Associate Relation with Product Category and Category*/
db.categories.hasMany(db.productCategory);
db.productCategory.belongsTo(db.categories);
/*Associate Relation with Product Category and Product*/
db.products.hasMany(db.productCategory);
db.productCategory.belongsTo(db.products);
/*Associate Relation with Product Category and Cart*/
db.carts.hasMany(db.productCategory);
db.productCategory.belongsTo(db.carts);

/*Associate Relation with Stores and Coupon*/
// db.stores.hasMany(db.coupon);
// db.coupon.belongsTo(db.stores);
db.stores.hasMany(db.coupon, { foreignKey: 'storeId' });
db.coupon.belongsTo(db.stores, { foreignKey: 'storeId', targetKey: 'id' });

/*Associate Relation with Product Image and Stores*/
db.stores.hasMany(db.productImages);
db.productImages.belongsTo(db.stores);
/*Associate Relation with Product Image and Product*/
db.products.hasMany(db.productImages);
db.productImages.belongsTo(db.products);
/*Associate Relation with Related Product and Store*/
db.stores.hasMany(db.relatedProduct);
db.relatedProduct.belongsTo(db.stores);
/*Associate Relation with Related Product and Product*/
db.products.hasMany(db.relatedProduct);
db.relatedProduct.belongsTo(db.products);
/*Associate Relation with Option Master and Store*/
db.stores.hasMany(db.optionMaster);
db.optionMaster.belongsTo(db.stores);
/*Associate Relation with Option Value and Store*/
db.stores.hasMany(db.optionValue);
db.optionValue.belongsTo(db.stores);

/*Associate Relation with Option Value and Option Master*/
db.optionMaster.hasMany(db.optionValue, { foreignKey: 'optionId', onDelete: 'cascade' });
db.optionValue.belongsTo(db.optionMaster, { foreignKey: 'optionId', targetKey: 'id', onDelete: 'cascade' });
/*Associate Relation with Option Product and Store*/
db.stores.hasMany(db.optionProduct);
db.optionProduct.belongsTo(db.stores);

/*Associate Relation with Option Product and Option Master*/
db.optionMaster.hasMany(db.optionProduct, { foreignKey: 'optionId', onDelete: 'cascade' });
db.optionProduct.belongsTo(db.optionMaster, { foreignKey: 'optionId', targetKey: 'id', onDelete: 'cascade' });
/*Associate Relation with Option Product and Product*/
db.products.hasMany(db.optionProduct);
db.optionProduct.belongsTo(db.products);

/*Associate Relation with Role and Store*/
db.stores.hasMany(db.roles);
db.roles.belongsTo(db.stores);

/*Associate Relation with Users and Store*/
db.stores.hasMany(db.users);
db.users.belongsTo(db.stores);
/*Associate Relation with Site Setting and Store*/
db.stores.hasMany(db.siteSettings);
db.siteSettings.belongsTo(db.stores);
/*Associate Relation with site Setting  and site Setting Group */
db.siteSettingsGroups.hasMany(db.siteSettings);
db.siteSettings.belongsTo(db.siteSettingsGroups);
/*Associate Relation with site Setting Group and Store*/
db.stores.hasMany(db.siteSettingsGroups);
db.siteSettingsGroups.belongsTo(db.stores);
/*Associate Relation with faq Group and Store*/
db.stores.hasMany(db.faqGroups);
db.faqGroups.belongsTo(db.stores);
/*Associate Relation with faq and Store*/
db.stores.hasMany(db.faq);
db.faq.belongsTo(db.stores);
/*Associate Relation with faq and Faq Groups*/
db.faqGroups.hasMany(db.faq);
db.faq.belongsTo(db.faqGroups);
/*Associate Relation with ContentBlocks and Store*/
db.stores.hasMany(db.contentBlocks);
db.contentBlocks.belongsTo(db.stores);
db.contentBlocks.hasMany(db.contentBlocks, { foreignKey: 'parentId', onDelete: 'cascade', onUpdate: 'cascade' });
/*Associate Relation with Pages and Store*/
db.stores.hasMany(db.pages);
db.pages.belongsTo(db.stores);
/*Associate Relation with Subscribers and Store*/
db.stores.hasMany(db.subscribers);
db.subscribers.belongsTo(db.stores);
/*Associate Relation with DropdownSettings and Store*/
db.stores.hasMany(db.dropdownSettings);
db.dropdownSettings.belongsTo(db.stores);
/*Associate Relation with DropdownSettingsOptions and Store*/
db.stores.hasMany(db.dropdownSettingsOptions);
db.dropdownSettingsOptions.belongsTo(db.stores);
/*Associate Relation with DropdownSettingsOptions and DropdownSettings*/
db.dropdownSettings.hasMany(db.dropdownSettingsOptions);
db.dropdownSettingsOptions.belongsTo(db.dropdownSettings);
/*Associate Relation with shippingMethods and Store*/
db.stores.hasMany(db.shippingMethods);
db.shippingMethods.belongsTo(db.stores);
/*Associate Relation with Brand and Store*/
db.stores.hasMany(db.brands);
db.brands.belongsTo(db.stores);
/*Associate Relation with Brand Iso Image and Store*/
db.stores.hasMany(db.brandsIsoImage);
db.brandsIsoImage.belongsTo(db.stores);
/*Associate Relation with Brand Iso Image and Brand*/
db.brands.hasMany(db.brandsIsoImage);
db.brandsIsoImage.belongsTo(db.brands);
/*Associate Relation with Testimonial and Store*/
db.stores.hasMany(db.testimonials);
db.testimonials.belongsTo(db.stores);
/*Associate Relation with FormMasters and Store*/
db.stores.hasMany(db.formMasters);
db.formMasters.belongsTo(db.stores);
/*Associate Relation with Customer and Store*/
db.stores.hasMany(db.customers);
db.customers.belongsTo(db.stores);
/*Associate Relation with Customer Address and Store*/
db.stores.hasMany(db.customerAddresses);
db.customerAddresses.belongsTo(db.stores);
/*Associate Relation with Customer Address and Customer*/
db.customers.hasMany(db.customerAddresses, { foreignKey: 'customerId', onDelete: 'cascade' });
db.customerAddresses.belongsTo(db.customers, { foreignKey: 'customerId', targetKey: 'id', onDelete: 'cascade' });
/*Associate Relation with Customer Wishlist and Store*/
db.stores.hasMany(db.customerWishlist, { foreignKey: 'storeId', onDelete: 'cascade' });
db.customerWishlist.belongsTo(db.stores, { foreignKey: 'storeId', targetKey: 'id', onDelete: 'cascade' });
/*Associate Relation with Customer Wishlist and Customer*/
db.customers.hasMany(db.customerWishlist, { foreignKey: 'customerId', onDelete: 'cascade' });
db.customerWishlist.belongsTo(db.customers, { foreignKey: 'customerId', targetKey: 'id', onDelete: 'cascade' });

/*Associate Relation with ProductImages and Product*/
db.products.hasMany(db.productImages, { foreignKey: 'productId', onDelete: 'cascade' });
db.productImages.belongsTo(db.products, { foreignKey: 'productId', targetKey: 'id', onDelete: 'cascade' });

/*Associate Relation with Customer Wishlist and Product*/
db.products.hasMany(db.customerWishlist, { foreignKey: 'productId', onDelete: 'cascade' });
db.customerWishlist.belongsTo(db.products, { foreignKey: 'productId', targetKey: 'id', onDelete: 'cascade' });
/*Associate Relation with Order and Store*/
db.stores.hasMany(db.orders);
db.orders.belongsTo(db.stores);
/*Associate Relation with Order and Customer*/
db.customers.hasMany(db.orders);
db.orders.belongsTo(db.customers);
/*Associate Relation with Order Item and Store*/
db.stores.hasMany(db.orderItems, { foreignKey: 'storeId', onDelete: 'cascade' });
db.orderItems.belongsTo(db.stores, { foreignKey: 'storeId', targetKey: 'id', onDelete: 'cascade' });
/*Associate Relation with Order Item and Order*/
db.orders.hasMany(db.orderItems, { foreignKey: 'orderId', onDelete: 'cascade' });
db.orderItems.belongsTo(db.orders, { foreignKey: 'orderId', targetKey: 'id', onDelete: 'cascade' });
/*Associate Relation with Order Item and Product*/
db.products.hasMany(db.orderItems, { foreignKey: 'productId', onDelete: 'cascade' });
db.orderItems.belongsTo(db.products, { foreignKey: 'productId', targetKey: 'id', onDelete: 'cascade' });
/*Associate Relation with Order Item and Store*/
db.stores.hasMany(db.orderStatusHistory, { foreignKey: 'storeId', onDelete: 'cascade' });
db.orderStatusHistory.belongsTo(db.stores, { foreignKey: 'storeId', targetKey: 'id', onDelete: 'cascade' });
/*Associate Relation with Order Item and Order*/
db.orders.hasMany(db.orderStatusHistory, { foreignKey: 'orderId', onDelete: 'cascade' });
db.orderStatusHistory.belongsTo(db.orders, { foreignKey: 'orderId', targetKey: 'id', onDelete: 'cascade' });
/*Associate Relation with Wallet and Store*/
db.stores.hasMany(db.wallets);
db.wallets.belongsTo(db.stores);
/*Associate Relation with Wallet and customer*/
db.customers.hasMany(db.wallets);
db.wallets.belongsTo(db.customers);
/*Associate Relation with Wallet Transaction and Store*/
db.stores.hasMany(db.walletTransaction, { foreignKey: 'storeId', onDelete: 'cascade' });
db.walletTransaction.belongsTo(db.stores, { foreignKey: 'storeId', targetKey: 'id', onDelete: 'cascade' });
/*Associate Relation with Wallet Transaction and Wallet*/
db.wallets.hasMany(db.walletTransaction, { foreignKey: 'walletId', onDelete: 'cascade' });
db.walletTransaction.belongsTo(db.wallets, { foreignKey: 'walletId', targetKey: 'id', onDelete: 'cascade' });
/*Associate Relation with Wallet Transaction and customer*/
db.customers.hasMany(db.walletTransaction, { foreignKey: 'customerId', onDelete: 'cascade' });
db.walletTransaction.belongsTo(db.customers, { foreignKey: 'customerId', targetKey: 'id', onDelete: 'cascade' });
/*Associate Relation with Cart and Store*/
db.stores.hasMany(db.carts);
db.carts.belongsTo(db.stores);
/*Associate Relation with Cart and Product*/
db.products.hasMany(db.carts);
db.carts.belongsTo(db.products);
/*Associate Relation with Cart and customer*/
db.customers.hasMany(db.carts);
db.carts.belongsTo(db.customers);
/*Associate Relation with Delivery Time Slot and Store*/
db.stores.hasMany(db.deliveryTimeSlot, { foreignKey: 'storeId', onDelete: 'cascade' });
db.deliveryTimeSlot.belongsTo(db.stores, { foreignKey: 'storeId', targetKey: 'id', onDelete: 'cascade' });

/*Associate Relation with Role and Store*/
db.roles.belongsTo(db.stores, { foreignKey: 'storeId', targetKey: 'id', onDelete: 'cascade' });
//*****Permission Table
db.permissions.belongsTo(db.stores, { foreignKey: 'storeId', targetKey: 'id', onDelete: 'cascade' });
//*****Role Has Permissions Table
db.roleHasPermissions.belongsTo(db.stores, { foreignKey: 'storeId', targetKey: 'id', onDelete: 'cascade' });
db.roleHasPermissions.belongsTo(db.permissions, { foreignKey: 'permissionId', targetKey: 'id', onDelete: 'cascade' });
db.roleHasPermissions.belongsTo(db.roles, { foreignKey: 'roleId', targetKey: 'id', onDelete: 'cascade' });
//*****Model Has Roles Table
db.modelHasRoles.belongsTo(db.stores, { foreignKey: 'storeId', targetKey: 'id', onDelete: 'cascade' });
db.modelHasRoles.belongsTo(db.roles, { foreignKey: 'roleId', targetKey: 'id', onDelete: 'cascade' });
db.modelHasRoles.belongsTo(db.admins, { foreignKey: 'userId', targetKey: 'id', onDelete: 'cascade' });
//***/
db.admins.belongsTo(db.admins, { foreignKey: 'parentId', targetKey: 'id', onDelete: 'cascade' });

/*Associate Relation with Franchise and Store*/
db.stores.hasMany(db.franchise, { foreignKey: 'storeId', onDelete: 'cascade' });

/*Associate Relation with CMS and Store*/
db.stores.hasMany(db.cms, { foreignKey: 'storeId', onDelete: 'cascade' });

/*Associate Relation with City and Store*/
db.stores.hasMany(db.city, { foreignKey: 'storeId', onDelete: 'cascade' });

/*Associate Relation with Zipcode and Store*/
db.stores.hasMany(db.zipcode, { foreignKey: 'storeId', onDelete: 'cascade' });

/*Associate Relation with BannerSection and Store*/
db.stores.hasMany(db.bannersection, { foreignKey: 'storeId', onDelete: 'cascade' });

/*Associate Relation with BannerDisplay and Store*/
db.stores.hasMany(db.bannerdisplay, { foreignKey: 'storeId', onDelete: 'cascade' });

/*Associate Relation with Banner and Store*/
db.stores.hasMany(db.banner, { foreignKey: 'storeId', onDelete: 'cascade' });

/*Associate Relation with Blog Author and Store*/
db.stores.hasMany(db.blogauthor, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with Blog Category and Store*/
db.stores.hasMany(db.blogcategory, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with Blogs and Store*/
db.stores.hasMany(db.blogs, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with Blog Author and Blogs*/
db.blogauthor.hasMany(db.blogs, { foreignKey: 'authorId', onDelete: 'cascade' });
/*Associate Relation with Blog Comment and Store*/
db.stores.hasMany(db.blogcomments, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with Blog Comment and Blogs*/
db.blogs.hasMany(db.blogcomments, { foreignKey: 'blogId', onDelete: 'cascade' });

/*Associate Relation with Blog Selected Category and Store*/
db.stores.hasMany(db.blogselectedcategory, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with Blog Selected Category and Blog Category*/
db.blogcategory.hasMany(db.blogselectedcategory, { foreignKey: 'categoryId', onDelete: 'cascade' });
/*Associate Relation with Blog Selected Category and Blogs*/
db.blogs.hasMany(db.blogselectedcategory, { foreignKey: 'blogId', onDelete: 'cascade' });
/*Associate Relation with Dynamic Form and Store*/
db.stores.hasMany(db.dynamicforms, { foreignKey: 'storeId', onDelete: 'cascade' });

/*Associate Relation with Dynamic Form and Dynamic Form Field*/
db.dynamicforms.hasMany(db.dynamicformfields, { foreignKey: 'dynamicFormId', onDelete: 'cascade' });

/*Associate Relation with Dynamic Form Field and Dynamic Form Field Value*/
db.dynamicformfields.hasMany(db.dynamicformfieldvalues, { foreignKey: 'dynamicFormFieldId', onDelete: 'cascade' });

/*Associate Relation with Attribute Setting and Store*/
db.stores.hasMany(db.attributesetting, { foreignKey: 'storeId', onDelete: 'cascade' });

/*Associate Relation with Attribute Value and Store*/
db.stores.hasMany(db.attributevalue, { foreignKey: 'storeId', onDelete: 'cascade' });

/*Associate Relation with Attribute Setting and Attribute Value*/
db.attributesetting.hasMany(db.attributevalue, { foreignKey: 'attrSettingId', onDelete: 'cascade' });

/*Associate Relation with couponTransaction and Store*/
db.stores.hasMany(db.couponTransaction, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with couponTransaction and coupon*/
db.coupon.hasMany(db.couponTransaction, { foreignKey: 'couponId', onDelete: 'cascade' });
/*Associate Relation with couponTransaction and customers*/
db.customers.hasMany(db.couponTransaction, { foreignKey: 'customerId', onDelete: 'cascade' });
/*Associate Relation with Coupon and Store*/
db.stores.hasMany(db.coupon, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with feedback and Store*/
db.stores.hasMany(db.feedback, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with feedback and customers*/
db.customers.hasMany(db.feedback, { foreignKey: 'customerId', onDelete: 'cascade' });
/*Associate Relation with transactionsOffer and Store*/
db.stores.hasMany(db.transactionsOffer, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with reservationTimeSlot and Store*/
db.stores.hasMany(db.reservationTimeSlot, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with reservationTimeSlot and Store*/
db.stores.hasMany(db.reservationTimeSlot, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with reservations and Store*/
db.stores.hasMany(db.reservations, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with reservations and reservationTimeSlot*/
db.reservationTimeSlot.hasMany(db.reservations, { foreignKey: 'timeId', onDelete: 'cascade' });
/*Associate Relation with Section and Store*/
db.stores.hasMany(db.section, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with ContactUs and Store*/
db.stores.hasMany(db.contactUs, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with inventory and Store*/
db.stores.hasMany(db.inventory, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with products and inventory*/
db.products.hasMany(db.inventory, { foreignKey: 'productId', onDelete: 'cascade' });
/*Associate Relation with newsLetter and Store*/
db.stores.hasMany(db.newsLetter, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with Store and newsLetterEmail*/
db.stores.hasMany(db.newsLetterEmail, { foreignKey: 'storeId', onDelete: 'cascade' });
/*Associate Relation with newsLetter and newsLetterEmail*/
db.newsLetter.hasMany(db.newsLetterEmail, { foreignKey: 'newsLetterId', onDelete: 'cascade' });
/*Associate Relation with emailList and Store*/
db.stores.hasMany(db.emailList, { foreignKey: 'storeId', onDelete: 'cascade' });
/Associate Relation with contacts and Store/
db.stores.hasMany(db.contacts, { foreignKey: 'storeId', onDelete: 'cascade' });
/Associate Relation with contactsEmail and Store/
db.stores.hasMany(db.contactsEmail, { foreignKey: 'storeId', onDelete: 'cascade' });
/Associate Relation with contacts and contactsEmail/
db.contacts.hasMany(db.contactsEmail, { foreignKey: 'contactId', onDelete: 'cascade' });
/Associate Relation with emailConfiguration and Store/
db.stores.hasMany(db.emailConfiguration, { foreignKey: 'storeId', onDelete: 'cascade' });
/Associate Relation with campaignDetails and Store/
db.stores.hasMany(db.campaignDetails, { foreignKey: 'storeId', onDelete: 'cascade' });
/Associate Relation with campaignDetails and contacts/
db.contacts.hasMany(db.campaignDetails, { foreignKey: 'contactId', onDelete: 'cascade' });
/Associate Relation with campaignDetails and emailConfiguration/
db.emailConfiguration.hasMany(db.campaignDetails, { foreignKey: 'configurationId', onDelete: 'cascade' });
/Associate Relation with campaignDetailsEmail and stores/
db.stores.hasMany(db.campaignDetailsEmail, { foreignKey: 'storeId', onDelete: 'cascade' });
/Associate Relation with campaignDetailsEmail and campaignDetails/
db.campaignDetails.hasMany(db.campaignDetailsEmail, { foreignKey: 'campaignId', onDelete: 'cascade' });
// db.menus.hasMany(db.menus, { foreignKey: 'menuId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.menus, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.menus.hasMany(db.menus, { foreignKey: 'parentMenuId', onDelete: 'cascade', onUpdate: 'cascade' });
db.module.hasMany(db.menus, { foreignKey: 'moduleId', onDelete: 'cascade', onUpdate: 'cascade' });
db.moduleItem.hasMany(db.menus, { foreignKey: 'moduleItemId', onDelete: 'cascade', onUpdate: 'cascade' });
db.module.hasMany(db.moduleItem, { foreignKey: 'moduleId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.questionaire, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.questions, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.questionaire.hasMany(db.questions, { foreignKey: 'questionaireId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.questionoptions, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.questionaire.hasMany(db.questionoptions, { foreignKey: 'questionaireId', onDelete: 'cascade', onUpdate: 'cascade' });
db.questions.hasMany(db.questionoptions, { foreignKey: 'questionId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.surveyResult, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.questionaire.hasMany(db.surveyResult, { foreignKey: 'questionaireId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.module, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });

db.stores.hasMany(db.moduleItem, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.module.hasMany(db.moduleItem, { foreignKey: 'moduleId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.dynamicSection, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.module.hasMany(db.dynamicSection, { foreignKey: 'moduleId', onDelete: 'cascade', onUpdate: 'cascade' });
db.moduleItem.hasMany(db.dynamicSection, { foreignKey: 'moduleItemId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.moduleSetting, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.student, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.contactUsIudyog, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.getACallback, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.catalogPriceRule, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.catalogPriceRuleAttributes, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.catalogPriceRule.hasMany(db.catalogPriceRuleAttributes, { foreignKey: 'catalogPriceRuleId', onDelete: 'cascade', onUpdate:'cascade' });
db.stores.hasMany(db.cartPriceRule, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.cartPriceRuleAttributes, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.cartPriceRule.hasMany(db.cartPriceRuleAttributes, { foreignKey: 'cartPriceRuleId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.subSection, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.dynamicSection.hasMany(db.subSection, { foreignKey: 'sectionId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.iUdyogBlogAuthor, { foreignKey: 'storeId', onDelete: 'cascade' });
db.stores.hasMany(db.iUdyogBlogCategory, { foreignKey: 'storeId', onDelete: 'cascade' });
db.stores.hasMany(db.iUdyogBlogs, { foreignKey: 'storeId', onDelete: 'cascade' });
db.stores.hasMany(db.iUdyogBlogComments, { foreignKey: 'storeId', onDelete: 'cascade' });
db.stores.hasMany(db.iUdyogBlogSelectedCategory, { foreignKey: 'storeId', onDelete: 'cascade' });
db.iUdyogBlogAuthor.hasMany(db.iUdyogBlogs, { foreignKey: 'authorId', onDelete: 'cascade' });
db.iUdyogBlogs.hasMany(db.iUdyogBlogComments, { foreignKey: 'blogId', onDelete: 'cascade' });
db.iUdyogBlogCategory.hasMany(db.iUdyogBlogSelectedCategory, { foreignKey: 'categoryId', onDelete: 'cascade' });
db.iUdyogBlogs.hasMany(db.iUdyogBlogSelectedCategory, { foreignKey: 'blogId', onDelete: 'cascade' });
db.stores.hasMany(db.surveyRemarks, { foreignKey: 'storeId', onDelete: 'cascade', onUpdate: 'cascade' });
db.questionaire.hasMany(db.surveyRemarks, { foreignKey: 'questionaireId', onDelete: 'cascade', onUpdate: 'cascade' });
db.surveyResult.hasMany(db.surveyRemarks, { foreignKey: 'surveyResultId', onDelete: 'cascade', onUpdate: 'cascade' });
db.stores.hasMany(db.permissionLog, { foreignKey: 'storeId', onDelete: 'cascade' });
db.permissionGroup.hasMany(db.permissionLog, { foreignKey: 'permissionGroupId', onDelete: 'cascade' });
//db.stores.hasMany(db.cartAddon, { foreignKey: 'storeId', onDelete: 'cascade' });
//db.products.hasMany(db.cartAddon, { foreignKey: 'productId', onDelete: 'cascade' });
//db.carts.hasMany(db.cartAddon, { foreignKey: 'cartId', onDelete: 'cascade' });
db.stores.hasMany(db.imageResize, { foreignKey: 'storeId', onDelete: 'cascade' });
db.stores.hasMany(db.razorpay, { foreignKey: 'storeId', onDelete: 'cascade' });
db.chatUsers.hasMany(db.chatMessages, { foreignKey: 'chatUserId' })
db.chatMessages.belongsTo(db.chatUsers, { foreignKey: 'id' })
/*Associate End*/
module.exports = db;
