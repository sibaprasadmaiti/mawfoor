/** This is helper function where we can uoload fiels of every modules also file path will set where
 * Developer : NILMONI PATRA @Bluehorse
 */
const formidable = require('formidable');
var models = require('../models');
const glob = require("glob");
const fs = require("fs-extra");
const path = require('path');
var privatekey = require('../config/privatekey.json');
const ds = path.sep;
var config = require('../config/config.json');
const emailConfig = require('../config/email-config')();
const mailgun = require("mailgun-js")(emailConfig);
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
  }
);

const nodemailer = require('nodemailer');
module.exports = {

  /**
   * Create folder
  */
  createDirectory: async function(folder_path) {
    var str = __dirname;
    var n = str.lastIndexOf('\\');
    var path = str.substring(0, n+1);
    var dir = path + folder_path; 
    if (!fs.existsSync(dir)){  
      fs.mkdirSync(dir, { recursive: true });              
    }
  },

  /**
   * This function returns the base path of this js file
   */
  getBasePath: function() {
    var str = __dirname;
    var n = str.lastIndexOf('\\');
    var path = str.substring(0, n+1);
    return path;
  },

  /**
   * Admin file upload start here
   * also check the file is present in folder or not
  */
  uploadAdminFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "Admin" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },

  isFileExistsInAdmin: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "Admin" + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  /**
   * Admin file upload ends here
  */

  /**
   * Caller users file upload start here
   * also check the file is present in folder or not
  */
  uploadCallerUserFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "users_contents" + ds+ "Caller_users" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },

  isFileExistsInCallerUser: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "users_contents" + ds+ "Caller_users" + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },

  /**
   * Caller users file upload ends here
  */

  /** Pro users file upload start 
   * After new required changes - now day this function also can use as all users file upload in 'Users' folder
  */
  uploadProUserFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "users_contents" + ds+ "Users" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },


  /** Pro users file upload start 
   * After new required changes - now day this function also can use as all users file upload in 'Users' folder
  */
  uploadProductImage: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "products" +ds+ "image" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },

  isFileExistsInProUser: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  /** Pro users file upload ends */

  /** Category file upload start here  */
  uploadCategoryFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "category" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },

   /** Brand file upload start here  */
   uploadBrandImageFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "brands" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },

   /** testimonial image file upload start here  */
   uploadTestimonialsImageFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "testimonials" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },

   //Below Added by Partha Mandal
   /** banner image file upload start here  */
   uploadBannerImageFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "banner" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },
  
  /** blogs image file upload start here  */
  uploadBlogImageFiles: async function (temp_path, target_path) {
    let str = __dirname;
    let n = str.lastIndexOf("\\");
    let path = str.substring(0, n + 1);
    let new_location = path + "public" + ds + "admin" + ds+ "blogs" +ds+ target_path;
    let result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },

  /** dynamicform image upload start here  */
  uploadDynamicFormImage: async (temp_path, target_path) => {
    let str = __dirname;
    let n = str.lastIndexOf("\\");
    let path = str.substring(0, n + 1);
    let new_location = path + "public" + ds + "admin" + ds+ "dynamicform" +ds+ target_path;
    let result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, (err, res) => {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },

  /** dynamicform file upload start here  */
  uploadDynamicFiles: async function (temp_path, target_path) {
    let str = __dirname;
    let n = str.lastIndexOf("\\");
    let path = str.substring(0, n + 1);
    let new_location = path + "public" + ds + "admin" + ds+ "dynamicform" +ds+ "files" +ds+ target_path;
    let result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },
  //Above Added by Partha Mandal

uploadLogoImage: async function (temp_path, target_path) {
  let str = __dirname;
  let n = str.lastIndexOf("\\");
  let path = str.substring(0, n + 1);
  let new_location = path + "public" + ds + "admin" + ds+ "stores" +ds+ target_path;
  let result = await new Promise((resolve, reject) => {
    fs.copy(temp_path, new_location, function (err, res) {
      if (!err) {
        resolve("yes");
      } else {
        reject("NO");
      }
    });
  });
  return result;
},


 /**Below Added by Surajit*/
   /** banner image file upload start here  */
   uploadgalleryImageFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "gallery" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },
  /**Above Added by Surajit*/



   /** faq Icon file upload start here  */
  uploadIconFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "faq" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },
  /** content file upload start here  */
  uploadContentImageFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "contentblock" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },

  /** page image file upload start here  */
  uploadPageImageFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "pages" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },

  /** salesman file upload start here  */
  uploadSalesmanImageFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "salesman" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },

  isFileExistsInCategoryMetaImage: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "category"  +ds+  "metaimage"+ ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  /** customer image file upload start here  */
  uploadCustomersImageFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "customers" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },
  isFileExistsInBrandImage: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "brands"  + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  isFileExistsInCustomersImage: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "customers"  + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  isFileExistsInContentBlockImage: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "contentblock"  +ds+  "image"+ ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
isFileExistsInPagesImage: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "pages"  +ds+  "image"+ ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  isFileExistsInPagesMetaImage: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "pages"  +ds+  "metaimage"+ ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  isFileExistsInCategory: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "category" + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  isFileExistsInTestimonialsImage: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "testimonials" + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },

  isFileExistsInGlobalCommunity: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "GlobalCommunity" + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  isFileExistsInFaqIcon: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "faq"  +ds+  "icon"+ ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },

  //Below Added by Partha Mandal
  isFileExistsInBannerImages: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "banner" +ds+  "image"  + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  isFileExistsInCoverImages: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "banner"  +ds+  "coverImage" + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  isFileExistsInBlogImages: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "blogs" + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  //Above Added by Partha Mandal

	/**Below Added by Surajit*/
   isFileExistsInGalleryImage: function(filename) {
	 const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "gallery" +ds+  "image"  + ds + filename;
	 if(fs.existsSync(directoryPath)) return true;
	 else return false;
    },

  isFileExistsInSalesmanImage: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "salesman" +ds+ filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  
  /** GlobalCommunity file upload start here  */
  uploadGlobalCommunityFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "GlobalCommunity" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },

  /** Video file upload start here  */
  uploadVideoFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "Video" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },
  isFileExistsInVideo: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "Video" + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  /** Video file upload ends here  */
  /** Media file upload start here  */
  isFileExistsInMedia: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "media" + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  uploadMediaFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "media" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },
  /** Media file upload end here  */

  /** Who Can Apply file upload start here  */
  isFileExistsInWhoCanApply: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "whocanapply" + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  uploadWhoCanApplyFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "whocanapply" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },
  /** Who Can Apply file upload end here  */ 

  /** blog file upload start here  */
  isFileExistsInBlogs: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "blogs" + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  uploadBlogsFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "blogs" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },
  /** blog file upload end here  */  

  /** Atrribute Value image start here  */
uploadattrValueImageFiles: async function (temp_path, target_path) {
  var str = __dirname;
  var n = str.lastIndexOf("\\");
  var path = str.substring(0, n + 1);
  var new_location = path + "public" + ds + "admin" + ds+ "attributes" +ds+ target_path;
  var result = await new Promise((resolve, reject) => {
    fs.copy(temp_path, new_location, function (err, res) {
      if (!err) {
        resolve("yes");
      } else {
        reject("NO");
      }
    });
  });
  return result;
},
isFileExistsInattrValueImage: function(filename) {
  const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "attributes"  + ds + filename;
  if(fs.existsSync(directoryPath)) return true;
  else return false;
},
/** Atrribute Value image end here  */

  /**certification file upload : Dev : Nilmoni Patra */
  uploadCertificationFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "certification" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },


  isFileExistsInCertification: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "certification" + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  /**certification file upload End */

  /** isDayMonthYear convert using date auther:Susanta kr das  */
  isDayMonthYear: function(date_future,date_now){
    var d = Math.abs(date_future - date_now) / 1000;                           // delta
    var r = {};                                                                // result
    var s = {                                                                  // structure
      year: 31536000,
      month: 2592000,
      week: 604800, // uncomment row to ignore
      day: 86400,   // feel free to add your own row
      hour: 3600,
      minute: 60,
      second: 1
    };

    Object.keys(s).forEach(function(key){
      r[key] = Math.floor(d / s[key]);
      d -= r[key] * s[key];
    });
    let duration =''
    duration += r.year > 0 ? (r.year > 1 ? r.year+' years ' : r.year+' year ') : '';
    duration += r.month > 0 ? (r.month > 1 ? r.month+' months ' : r.month+' month ') : '';
    //duration += r.week > 0 ? (r.week > 1 ? r.week+' weeks' : r.week+' week') : '';
    duration += r.day > 0 ? (r.day > 1 ? r.day+' days ' : r.day+' day ') : '';
    //duration += r.hour > 0 ? (r.hour > 1 ? r.hour+' hours ' : r.hour+' hour ') : '';
    //duration += r.minute > 0 ? (r.minute > 1 ? r.minute+' minutes ' : r.minute+' minute ') : '';
    //duration += r.second > 0 ? (r.second > 1 ? r.second+' seconds ' : r.second+' second ') : '';
    return duration;
    // for example: {year:0,month:0,week:1,day:2,hour:34,minute:56,second:7}
  },
  /** isDayMonthYearHours convert using date auther:Susanta kr das  */
  isDayMonthYearHour: function(date_future,date_now){
    var d = Math.abs(date_future - date_now) / 1000;                           // delta
    var r = {};                                                                // result
    var s = {                                                                  // structure
      year: 31536000,
      month: 2592000,
      week: 604800, // uncomment row to ignore
      day: 86400,   // feel free to add your own row
      hour: 3600,
      minute: 60,
      second: 1
    };

    Object.keys(s).forEach(function(key){
      r[key] = Math.floor(d / s[key]);
      d -= r[key] * s[key];
    });
    return r;
    // for example: {year:0,month:0,week:1,day:2,hour:34,minute:56,second:7}
  },
  /** isTodayYesterDayOthers convert using date auther:Susanta kr das  */
  isTodayYesterDayOthers: function(date_future,time){
    //const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    //const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const td = new Date();
    const yd = new Date(td);
    const df = new Date(date_future);
    yd.setDate(yd.getDate() - 1);
    const yMonth = yd.getMonth()+1;
    const tMonth = td.getMonth()+1;
    const ydDate = yd.getFullYear()+'-'+(yMonth > 9 ? yMonth : 0+''+yMonth)+'-'+(yd.getDate() > 9 ? yd.getDate() : 0+''+yd.getDate());
    const tdDate = td.getFullYear()+'-'+(tMonth > 9 ? tMonth : 0+''+tMonth)+'-'+(td.getDate() > 9 ? td.getDate() : 0+''+td.getDate());
    let day='';
    if(tdDate==date_future){
      day=time+' Today';
    } else if(ydDate==date_future){
      day='Yesterday';
    } else {
      day= days[df.getDay()]+' '+df.getDate()+' '+months[df.getMonth()]+' '+ df.getFullYear();
    }
    return day;
  },
  applicationEndtime: function(stime,duration){
    let dt1 = stime.split(':');
    let c=0;
    let duera = duration.split('.');
    let min = '00';
    let hour = dt1[0];
    if(parseInt(dt1[1]) > 0){
      let m1 = parseInt(dt1[1])+parseInt(duera[1]);
      let m2 = 0;
      if(m1 >=60){
        c=1;
        m2 = m1 - 60;
      } else {
        m2 = m1; 
      }
      min = m2 > 9 ? m2 : '0'+m2;
    } else {
      let m1 = parseInt(dt1[1])+parseInt(duera[1]);
      let m2 = 0;
      if(m1 >=60){
        c=1;
        m2 = m1 - 60;
      } else {
        m2 = m1; 
      }
      min = m2 > 9 ? m2 : '0'+m2;
    }
    if(parseInt(dt1[0]) > 0){
      let h1 = parseInt(dt1[0])+c+parseInt(duera[0]);
      let h2 = 0;
      if(h1 >=24){
        h2 = h1 - 24;
      } else {
        h2 = h1;
      }
      hour = h2 > 9 ? h2 : '0'+h2; 
    } else {
      let h1 = parseInt(dt1[0])+c+parseInt(duera[0]);
      let h2 = 0;
      if(h1 >=24){
        h2 = h1 - 24;
      } else {
        h2 = h1;
      }
      hour = h2 > 9 ? h2 : '0'+h2;
    }
    return (hour)+':'+min+':00';
  },
  fnCalculate: function(date,stime,etime){
    let dt1 = date+' '+stime;
    let dt2 = date+' '+etime;
    //alert(dt2+'-'+dt1);
    let diff = this.diffCallDuration(dt2, dt1);
    let dura = '';
    if(typeof diff.hours !== 'undefined'){
      dura += diff.hours >= 1 ? diff.hours : '0';
    } else {
      dura += '0';
    }
    if(typeof diff.minutes !== 'undefined'){
      dura += diff.minutes >= 1 ? (diff.minutes > 9 ? '.'+diff.minutes : '.0'+diff.minutes): '.00';
    } else {
      dura +='.00';
    }
    return dura;
  },
  diffCallDuration: function(sdate,edate){
    let d = (new Date(edate)) - (new Date(sdate));
    let hours        = Math.floor(d/1000/60/60);
    let minutes      = Math.floor(d/1000/60 - hours*60);
    let t = {};
    ['hours', 'minutes'].forEach(q=>{ if (eval(q)>0) { t[q] = eval(q); } });
    return t;
  },
  calculatePriceAndCurrency: function(appointment,userPricing){
    if(appointment){
      var price = 0;
      var currency = null;
      var result = 0;
      var minitOld =  appointment.call_duration.split('.');
      var minit =  (parseInt(minitOld[0])*60) + parseInt(minitOld[1]);
      userPricing.forEach(function(uPrice){
        currency = uPrice.currency;
        if(minit > parseInt(uPrice.call_duration)){
          var relusts = minit/parseInt(uPrice.call_duration);
          var relust = relusts.toString().split('.');
          var submitS = parseInt(relust[0])*parseInt(uPrice.call_duration);
          var pricen = parseInt(relust[0]) * parseFloat(uPrice.price);
          price = parseInt(price) + parseInt(pricen);
          minit = minit - submitS;
        }
      });
      var t = {
        price:price,
        currency:currency,
        date:appointment.date,
        starttime:appointment.starttime,
        endtime:appointment.endtime,
        call_duration:appointment.call_duration
      }
      return t;
    } else {
      return 0;
    }
  },
  userFlug: async function(id){
    if(id){      
      var flug = await sequelize.query("SELECT `users`.`id`, `users`.`description`, count(`user_availibilities`.`id`) AS `abCount`, count(`user_availibility_weeks`.`id`) AS `abwCount`, count(`user_unavailibilities`.`id`) AS `uabCount`, count(`user_expertises`.`id`) AS `catCount`, count(`user_pricings`.`id`) AS `priceCount`, count(`user_certifications`.`id`) AS `cerCount` FROM `users` AS `users` LEFT JOIN `user_availibility` AS `user_availibilities` ON `users`.`id` = `user_availibilities`.`user_id` LEFT JOIN `user_certification` AS `user_certifications` ON `users`.`id` = `user_certifications`.`user_id` LEFT JOIN `user_education` AS `user_educations` ON `users`.`id` = `user_educations`.`user_id` LEFT JOIN `user_experience` AS `user_experiences` ON `users`.`id` = `user_experiences`.`user_id` LEFT JOIN `user_expertise` AS `user_expertises` ON `users`.`id` = `user_expertises`.`user_id` LEFT JOIN `user_unavailibility` AS `user_unavailibilities` ON `users`.`id` = `user_unavailibilities`.`user_id` LEFT JOIN `user_availibility_week` AS `user_availibility_weeks` ON `users`.`id` = `user_availibility_weeks`.`user_id` LEFT JOIN `user_pricing` AS `user_pricings` ON `users`.`id` = `user_pricings`.`user_id` WHERE `users`.`id` ="+id+" GROUP BY `users`.`id`",{ type: Sequelize.QueryTypes.SELECT });
      if(flug.length > 0){  
        var flugU = {
          personal:true,
          about:true,
          availibilities:  (flug[0].description!='' && flug[0].description!=null) ? true : false,
          expertise: (flug[0].abCount > 0 ? true : (flug[0].abwCount > 0 ? true : flug[0].uabCount > 0 ? true : false)),
          price: (flug[0].catCount > 0 ? true : false),
          certifications: (flug[0].priceCount > 0 ? true :false),
          others: flug[0].cerCount > 0 ? true :false,
        }
      } else {
        var flugU = {personal: true,about: true,availibilities: false,expertise: false,price: false,certifications: true,others: false};
      }
      return flugU;
    } else {
      return {personal: true,about: true,availibilities: false,expertise: false,price: false,certifications: true,others: false};
    }
  },

  orderMailSendToAdmin: async function (emailId, orderData, orderItemData) {
    if(emailId){
      var to_mail = emailId;
      var htmlTemplete = `<div style="margin:0;padding:0;color:#333333;font-style:normal;line-height:1.42857143;font-size:14px;font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:normal;text-align:left;background-color:#f5f5f5">
      <table width="100%" style="border-collapse:collapse;margin:0 auto">
          <tbody>
          <tr>
              <td align="center" style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;padding-bottom:30px;width:100%">
                  <table class="m_-6335853266329367547main" align="center" style="border-collapse:collapse;margin:0 auto;text-align:left;width:660px">
                      <tbody>
                        <tr>
                          <td class="m_-6335853266329367547header" style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;background-color:#f5f5f5;padding:25px">
                             
                          </td>
                      </tr>
                      <tr>
                          <td class="m_-6335853266329367547main-content" style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;background-color:#ffffff;padding:25px">
                            <table style="border-collapse:collapse">
                              <tbody>
                                <tr class="m_-6335853266329367547email-summary">
                                    <td style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top">
                                        <h1 style="font-weight:300;line-height:1.1;font-size:26px;margin-top:0;border-bottom:1px solid #cccccc;margin-bottom:10px;padding-bottom:10px">Order No. <span class="m_-6335853266329367547no-link">#`+ orderData.orderNo +`</span></h1>
                                        <p style="margin-top:0;margin-bottom:10px">Placed on <span class="m_-6335853266329367547no-link">`+ orderData.createdAt +`</span></p>
                                    </td>
                                </tr>
                                <tr>
                                  <td style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top">
                                    <table class="m_-6335853266329367547order-details" style="border-collapse:collapse;width:100%">
                                      <tbody>
                                        <tr>
                                          <td class="m_-6335853266329367547address-details" style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;padding:10px 10px 10px 0;width:50%">
                                            <h3 style="font-weight:300;line-height:1.1;font-size:18px;margin-bottom:10px;margin-top:0">Billing Info</h3>
                                            <p style="margin-top:0;margin-bottom:10px">`+ orderData.billingAddress +`</p>
                                          </td>
                                          <td class="m_-6335853266329367547address-details" style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;padding:10px 10px 10px 0;width:50%">
                                            <h3 style="font-weight:300;line-height:1.1;font-size:18px;margin-bottom:10px;margin-top:0">Shipping Info</h3>
                                              <p style="margin-top:0;margin-bottom:10px">`+ orderData.shippingAddress +`</p>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td class="m_-6335853266329367547method-info" style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;padding:10px 10px 10px 0;width:50%">
                                            <h3 style="font-weight:300;line-height:1.1;font-size:18px;margin-bottom:10px;margin-top:0">Payment Method</h3>
                                            <dl style="margin-top:0;margin-bottom:10px">
                                              <dt style="margin-bottom:5px;margin-top:0;font-weight:400">`+ orderData.paymentMethod +`</dt>
                                            </dl>
                                          </td>
                                          <td class="m_-6335853266329367547method-info" style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;padding:10px 10px 10px 0;width:50%">
                                            <h3 style="font-weight:300;line-height:1.1;font-size:18px;margin-bottom:10px;margin-top:0">Shipping Method</h3>
                                            <p style="margin-top:0;margin-bottom:10px">`+ orderData.shippingMethod +`</p>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <table class="m_-6335853266329367547email-items" style="width:100%;border-collapse:collapse;border-spacing:0;max-width:100%">
                                      <thead>
                                          <tr>
                                            <th style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;text-align:left;vertical-align:bottom;padding:10px">Items</th>
                                            <th style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:bottom;padding:10px;text-align:center">Qty</th>
                                            <th style="font-family:'Open Sans','Helvetica Neue'Helvetica,Arial,sans-serif;vertical-align:bottom;padding:10px;text-align:right">Price</th>
                                          </tr>
                                      </thead>
                                      <tbody>`
                                      orderItemData.forEach(element => {
                                      htmlTemplete +=`<tr>
                                          <td style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;padding:10px;border-top:1px solid #cccccc">
                                            <p style="margin-top:0;font-weight:700;margin-bottom:5px">`+ element.dataValues.name +`</p>
                                          </td>
                                          <td style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;padding:10px;border-top:1px solid #cccccc;text-align:center">`+ element.dataValues.qty +`</td>
                                          <td style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;padding:10px;border-top:1px solid #cccccc;text-align:right">
                                              <span>`+ element.dataValues.totalPrice +`</span>
                                          </td>
                                        </tr>`;
                                      });
                                      htmlTemplete +=`</tbody>
                                      <tfoot>
                                        <tr>
                                          <th colspan="2" scope="row" style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;background-color:#f5f5f5;font-weight:400;padding:10px;text-align:right">Subtotal</th>
                                          <td style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;background-color:#f5f5f5;padding:10px;text-align:right">
                                            <span style="white-space:nowrap">`+ orderData.amountPaid +`</span>                    
                                          </td>
                                        </tr>
                                        
                                        <tr>
                                          <th colspan="2" scope="row" style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;background-color:#f5f5f5;font-weight:400;padding:10px;text-align:right;padding-top:0">
                                            <strong style="font-weight:700">Grand Total</strong>
                                          </th>
                                          <td style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;background-color:#f5f5f5;padding:10px;text-align:right;padding-top:0">
                                          <strong style="font-weight:700"><span style="white-space:nowrap">`+ orderData.amountPaid +`</span></strong>
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </td>
                              </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td class="m_-6335853266329367547footer" style="font-family:Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif;vertical-align:top;background-color:#f5f5f5;padding:25px">
                          <table style="border-collapse:collapse;width:100%">
                            <tbody>
                              <tr>
                                <td style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;padding-bottom:25px;width:33%"></td>
                                  <td style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;padding-bottom:25px;width:33%"></td>
                                      <td style="font-family:'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;vertical-align:top;padding-bottom:25px;width:33%">
                                          <p style="margin-top:0;margin-bottom:0">
                                              <br><br><br>
                                          </p>
                                      </td>
                                  </tr>
                            </tbody>
                          </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
          </tr>
      </tbody>
    </table>
  </div>`;

      let mailTransporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: 'bluehorsetest@gmail.com',
          pass: 'coxfvopxotwuqwzz',
        },
      });

      let mailDetails = {
        from: 'ZBRDST Team <bluehorsetest@gmail.com>',
        to: to_mail,
        subject: 'Order Confirmation '+orderData.customerName,
        html: htmlTemplete
      };

      mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
          console.log('Error Occurs1111---' + err);
        } else {
          console.log('order confirmation email sent successfully!');
        }
      });
    }
  },

  chatMailSend: async function (email_id, userData, userChatdata) {
    if (email_id) {
      var to_mail = email_id;
      // var invoice_id = user_details.appointment_id;
      var htmlSend = `<div marginheight="0" marginwidth="0"
    style="width:100%;margin:0;padding:0;background-color:#f5f5f5;font-family:Helvetica,Arial,sans-serif">
    <div id="m_-8357186826546417956top-orange-bar" style="display:block;height:5px;background-color:rgb(243,146,0)">
    </div>
    <center>
        <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
            <tbody>
                <tr>
                    <td align="center" style="border-collapse:collapse;color:#525252" valign="top">
                        <table border="0" cellpadding="0" cellspacing="0" id="m_-8357186826546417956main-table"
                            width="85%">
                            <tbody>
                                <tr>
                                    <td align="center" height="20" style="border-collapse:collapse;color:#525252"
                                        valign="top"></td>
                                </tr>
                                <tr>
                                    <td align="center" style="border-collapse:collapse;color:#525252" valign="top">
                                        <table border="0" width="100%">
                                            <tbody>
                                                <tr>
                                                    <td height="34" style="border-collapse:collapse;color:#525252"></td>
                                                </tr>
                                                <tr>
                                                    <td align="center" colspan="3"
                                                        style="border-collapse:collapse;font-family:Helvetica,Arial,sans-serif;font-size:30px;font-weight:bold;line-height:120%;color:rgb(82,82,82);text-align:center">New Message From `+ userData.name +`</td>
                                                </tr>
                                                <tr>
                                                    <td align="center" colspan="3"
                                                        style="border-collapse:collapse;font-size:15px;color:#525252">
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" height="38" style="border-collapse:collapse;color:#525252"></td>
                                </tr>
                                <tr>
                                    <td align="left"
                                        style="border-collapse:collapse;color:#525252;background-color:rgb(255,255,255);border-color:rgb(221,221,221);border-width:1px;border-bottom:0;border-top-left-radius:5px;border-top-right-radius:5px;border-style:solid;padding:10px;font-size:13px;padding:40px!important"
                                        valign="top" width="100%">
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tbody>
                                                <tr>
                                                    <td align="left" colspan="2"
                                                        style="border-collapse:collapse;color:#525252;padding:0px!important"
                                                        valign="top">
                                                        <div
                                                            style="font-size:17px;color:rgb(83,83,83);text-align:left;font-weight:bold">
                                                            New Message left on `+ userChatdata[0].createdAt +`</div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <tr valign="middle">
                                    <td align="left" id="m_-8357186826546417956visitor_info"
                                        style="border-collapse:collapse;color:#525252;background-color:rgb(255,255,255);border-color:rgb(221,221,221);border-width:1px;border-bottom-left-radius:5px;border-bottom-right-radius:5px;border-style:solid;padding:10px;font-size:12px;padding:40px!important;vertical-align:middle"
                                        valign="middle" width="100%">
                                        <p style="line-height:20px;margin:0">
                                        </p>
                                        <table border="0" cellpadding="5px" cellspacing="0">
                                            <tbody>
                                                <tr>
                                                    <td
                                                        style="border-collapse:collapse;color:#525252;padding-right:15px">
                                                        <b
                                                            style="color:#888;font-size:10px;text-transform:uppercase">NAME</b>
                                                    </td>
                                                    <td style="border-collapse:collapse;color:#525252">`+ userData.name +`</td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        style="border-collapse:collapse;color:#525252;padding-right:15px">
                                                        <b
                                                            style="color:#888;font-size:10px;text-transform:uppercase">EMAIL</b>
                                                    </td>
                                                    <td style="border-collapse:collapse;color:#525252"><a
                                                            href="`+ userData.email +`"
                                                            target="_blank">`+ userData.email +`</a></td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        style="border-collapse:collapse;color:#525252;padding-right:15px">
                                                        <b
                                                            style="color:#888;font-size:10px;text-transform:uppercase">PHONE</b>
                                                    </td>
                                                    <td style="border-collapse:collapse;color:#525252">`+ userData.mobile_no +`</td>
                                                </tr>
                                                <tr>
                                                    <td style="border-collapse:collapse;color:#525252;padding-right:15px">
                                                        <b style="color:#888;font-size:10px;text-transform:uppercase">Message</b>
                                                    </td><td style="border-collapse:collapse;color:#525252">`
                                                    userChatdata.forEach(element => {
                                                      htmlSend += `<p style="line-height:20px;margin: 2px;border: 1px solid #ccc;background-color: #ccc;padding: 0px 4px;width: fit-content">`+ element.dataValues.message +`</p>`
                                                    });
                                                   
                                                    htmlSend +=`</td></tr>
                                            </tbody>
                                        </table>
                                        <p></p>
                                    </td>
                                </tr>
                                <tr><td align="center" height="33" style="border-collapse:collapse;color:#525252" valign="top"></td></tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </center>
</div>`;
      // console.log('email====>',to_mail);
      //   const data = {
      //     from: 'Growtrail team <admin@growtrail.com>',
      //     to: to_mail,
      //     subject: 'New Message',
      //     html: htmlSend
      //   };
      //   mailgun.messages().send(data, function (error, body) {
      //     console.log(body);
      //   });

      let mailTransporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: 'bluehorsetest@gmail.com',
          pass: 'coxfvopxotwuqwzz',
        },
      });

      let mailDetails = {
        from: 'iUdyog Team <bluehorsetest@gmail.com>',
        to: to_mail,
        subject: 'New Message From '+userData.name,
        html: htmlSend
      };

      mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
          console.log('Error Occurs1111---' + err);
        } else {
          console.log('Email sent successfully');
        }
      });
    }
  },

  mail_send: async function(user_id,content_type,userType) {

    // var user_details  = await models.users.findOne({attributes:['id','email_id','user_name'],where:{id:user_id}});
    // console.log('aaaaaaaaaaaaaaaaaaaaa'+user_id.pro_id);

    if(content_type == 'message-response' ){

      var content = user_details.user_name+' can message you.';
      var user_details  = await models.users.findOne({attributes:['id','email_id','user_name'],where:{id:user_id}});
      var user_notification  = await models.notification_setting.findAll({attributes:['id','user_id','notification_type','status'],where:{user_id:user_id, notification_type:'Message response', $or: [{status:{$eq:'all'}},{status:{$eq:'email'}}]}});

    } else if(content_type == 'appointment-confirmation'){
      
      var user_details  = await models.users.findOne({attributes:['id','email_id','user_name'],where:{id:user_id.caller_id}});
      var pro_user_details  = await models.users.findOne({attributes:['id','email_id','user_name'],where:{id:user_id.pro_id}});
      var user_notification  = await models.notification_setting.findAll({attributes:['id','user_id','notification_type','status'],where:{user_id:user_id, notification_type:'Appointment Confirmation', $or: [{status:{$eq:'all'}},{status:{$eq:'email'}}]}});
      var content = 'Your appointment with '+pro_user_details.user_name+' will confirmed.';

    } else if(content_type == 'appointment-schedule'){
      
      var user_details  = await models.users.findOne({attributes:['id','email_id','user_name'],where:{id:user_id.pro_id}});
      var caller_user_details  = await models.users.findOne({attributes:['id','email_id','user_name'],where:{id:user_id.caller_id}});
      var user_notification  = await models.notification_setting.findAll({attributes:['id','user_id','notification_type','status'],where:{user_id:user_id, notification_type:'Appointment Confirmation', $or: [{status:{$eq:'all'}},{status:{$eq:'email'}}]}});
      var content = caller_user_details.user_name+' will schedule an appointment with you.';
      
    } else if(content_type == 'changes-account'){

      var content = ' Your account successfully changed from caller to pro-user.';
      var user_details  = await models.users.findOne({attributes:['id','email_id','user_name'],where:{id:user_id}});
      var user_notification  = await models.notification_setting.findAll({attributes:['id','user_id','notification_type','status'],where:{user_id:user_id, notification_type:'Message response', $or: [{status:{$eq:'all'}},{status:{$eq:'email'}}]}});

    }else if(content_type == 'call_status'){

      var content = 'Your end call summary';
      var user_details  = await models.users.findOne({attributes:['id','email_id','user_name'],where:{id:user_id}});
      var user_notification  = await models.notification_setting.findAll({attributes:['id','user_id','notification_type','status'],where:{user_id:user_id, notification_type:'Message response', $or: [{status:{$eq:'all'}},{status:{$eq:'email'}}]}});

    }else if(content_type == 'new_appointment'){

      var content = 'Your have a new appointment';
      var user_details  = await models.users.findOne({attributes:['id','email_id','user_name'],where:{id:user_id}});
      var user_notification  = await models.notification_setting.findAll({attributes:['id','user_id','notification_type','status'],where:{user_id:user_id, notification_type:'Message response', $or: [{status:{$eq:'all'}},{status:{$eq:'email'}}]}});

    }else if(content_type == 'appointment_cancel'){

      var content = 'Your appointment is Cancelled';
      var user_details  = await models.users.findOne({attributes:['id','email_id','user_name'],where:{id:user_id}});
      var user_notification  = await models.notification_setting.findAll({attributes:['id','user_id','notification_type','status'],where:{user_id:user_id, notification_type:'Message response', $or: [{status:{$eq:'all'}},{status:{$eq:'email'}}]}});

    }
    
    var user_type = userType ? userType : "Pro"
    if(user_type == "Caller"){
      console.log("111111111111111----"+user_id);
      if(user_notification.length >0 ){
        console.log("222222222222222----"+user_details.email_id);
        var to_mail = user_details.email_id;
        console.log(user_id);
  
        let mailTransporter = nodemailer.createTransport({ 
          // service: 'gmail', 
          // auth: { 
          //     user: 'bluehorsetest@gmail.com', 
          //     pass: '@BH2020@'
          // } 
          host: "smtp.gmail.com",
        port: 587,
        secure: false, 
        auth: {
          user:'bluehorsetest@gmail.com', 
          pass:'coxfvopxotwuqwzz',
        },
        }); 
        
        let mailDetails = { 
            from: 'bluehorsetest@gmail.com', 
            to: to_mail, 
            subject: 'Test mail', 
            text: content
        }; 
          
        mailTransporter.sendMail(mailDetails, function(err, data) { 
            if(err) { 
                console.log('Error Occurs1111---'+err); 
            } else { 
                console.log('Email sent successfully'); 
            } 
        }); 
      }
    }else{
      console.log("33333333333333333----"+user_id);
      console.log("444444444444----"+user_details.email_id);
      var to_mail = user_details.email_id;
      console.log(user_id);

      let mailTransporter = nodemailer.createTransport({ 
        // service: 'gmail', 
        // auth: { 
        //     user: 'bluehorsetest@gmail.com', 
        //     pass: '@BH2020@'
        // } 
        host: "smtp.gmail.com",
        port: 587,
        secure: false, 
        auth: {
          user:'bluehorsetest@gmail.com', 
          pass:'coxfvopxotwuqwzz',
        },
      }); 
      
      let mailDetails = { 
          from: 'bluehorsetest@gmail.com', 
          to: to_mail, 
          subject: 'Test mail', 
          text: content
      }; 
        
      mailTransporter.sendMail(mailDetails, function(err, data) { 
          if(err) { 
              console.log('Error Occurs----'+err); 
          } else { 
              console.log('Email sent successfully'); 
          } 
      }); 
    }
    

  },

  currencySign : async function(type){
    let currency = await models.currency.findOne({where:{code:type}});
    let sign = '';
    sign = currency.symbol;
    return sign;
  },

  /** Banner file upload start here  */
  uploadBannerFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "Banner" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },

  isFileExistsInBanner: function(filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds +  "Banner" + ds + filename;
    if(fs.existsSync(directoryPath)) return true;
    else return false;
  },
  /** Banner file upload end here  */

  catalogPriceRuleCalculation: async function (storeId, ProductId, ProductPrice, catelogPriceRuleDetailsId, discountType, discountValue) {
    if (storeId && storeId != null && ProductId && ProductId != null && ProductPrice && ProductPrice != null && catelogPriceRuleDetailsId && catelogPriceRuleDetailsId != null && discountType && discountType != null && discountValue && discountValue != null) {
      
      ////////////////////////// catelog price rule start /////////////////////////////////////

      var catalogPriceRuleAttributeDetails = await models.catalogPriceRuleAttributes.findAll({ where:{storeId:storeId, catalogPriceRuleId : catelogPriceRuleDetailsId, attributeName:'Category' }});
      if(catalogPriceRuleAttributeDetails.length>0){

        for(var i=0; i<catalogPriceRuleAttributeDetails.length; i++){

          var productCategoryCheck = await models.productCategory.findOne({ where:{storeId:storeId, productId: ProductId, parentCategoryId: Number(catalogPriceRuleAttributeDetails[i].attributeValue) }});
          if(productCategoryCheck){
            var productCategoryCheckResult = 'yes';
            break;
          } else {
            var productCategoryCheckResult = 'no';
          }

        }

        if(productCategoryCheckResult == 'yes'){
          if(discountType == 'fixed'){
            var productDiscountPrice = Number(ProductPrice) - Number(discountValue);
            var discountPrice = productDiscountPrice > 0 ? productDiscountPrice : 0;
            var discountTag = 'Rs. '+discountValue+'';
          } else {
            var discountPrice = Math.round(Number(ProductPrice) - (Number(ProductPrice)*Number(discountValue)/100));
            var discountTag = discountValue+' %';
          }
        } else {
          var discountPrice = null;
          var discountTag = null;
        }

      } else {
        if(discountType == 'fixed'){
          var productDiscountPrice = Number(ProductPrice) - Number(discountValue);
          var discountPrice = productDiscountPrice > 0 ? productDiscountPrice : 0;
          var discountTag = 'Rs. '+discountValue+'';
        } else {
          var discountPrice = Math.round(Number(ProductPrice) - (Number(ProductPrice)*Number(discountValue)/100));
          var discountTag = discountValue+' %';
        }
      }

      ////////////////////////// catelog price rule end /////////////////////////////////////

      var discountValue = {
        discountPrice: discountPrice,
        discountTag: discountTag
      }

      return discountValue;
    } else {

      var discountValue = {
        discountPrice: null,
        discountTag: null
      }

      return discountValue;
    }
  },
  
};




