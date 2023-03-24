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

var fs = require('fs')
var fs = require('file-system');


/**
 * Description: This function is developed for sitesetting and sitesettinggroup list
 * @param req
 * @param res user details with jwt token
 * Developer: Surajit Gouri
 */

// exports.sitesettingGroupList = async function(req,res){

// }



// exports.sitesettingGroupAdd = async function(req,res){
//     var storeId = req.body.data.storeId;
//     var groupTitle = req.body.data.groupTitle;
//     var sequence = req.body.data.sequence;
//     if(storeId && storeId !=' ' && groupTitle && groupTitle !='' && sequence && sequence !=''){
//         let addGroup =models.siteSettingsGroups.create({
//             storeId   :storeId,
//             groupTitle: groupTitle,
//             sequence : sequence,
//         });
//         if(addGroup){
//             return res.status(200).send({ data:{success:true, groupData:addGroup, message:'Group added successfully'}, errorNode:{errorCode:0, errorMsg:" No Error"}});
//         } else {
//             return res.status(200).send({ data:{success:false, message:'Something went wrong'}, errorNode:{errorCode:1, errorMsg:"Error"}}); 
//         }
//     } else {
//         return res.status(200).send({data:{success:false,message:'All fields are required!'},errorNode:{errorCode:1, errorMsg:"Error"}});
//     }

// }

exports.sitesettingGroupAddEdit = async function(req,res){
    var id = req.body.data.id;
    var storeId = req.body.data.storeId;
    var groupTitle = req.body.data.groupTitle;
    var sequence = req.body.data.sequence;
    if(!id){
        if(storeId && storeId !=' ' && groupTitle && groupTitle !='' && sequence && sequence !=''){
            let addGroup = await models.siteSettingsGroups.create({
                storeId   :storeId,
                groupTitle: groupTitle,
                sequence : sequence
            });
            if(addGroup){
                return res.status(200).send({ data:{success:true, groupData:addGroup, message:'Group added successfully'}, errorNode:{errorCode:0, errorMsg:" No Error"}});
            } else {
                return res.status(200).send({ data:{success:false, message:'Something went wrong'}, errorNode:{errorCode:1, errorMsg:"Error"}}); 
            }
       
        } else {
            return res.status(200).send({data:{success:false,message:'All fields are required!'},errorNode:{errorCode:1, errorMsg:"Error"}});
        }

    } else {
        if(storeId && storeId !=' ' && groupTitle && groupTitle !='' && sequence && sequence !=''){
            models.siteSettingsGroups.update({
                storeId   :storeId,
                groupTitle: groupTitle,
                sequence : sequence		
            },{where:{storeId:storeId,id:id}}).then(async function(data){
                models.siteSettingsGroups.findAll({ attributes:['id','storeId','groupTitle','sequence','status'], where: {storeId:storeId,id:id} 
                    }).then(function (groupDetails) {
                        const list = groupDetails.map(groupDetail=>{
                            return Object.assign(
                                {},
                                {
                                    id:groupDetail.id,
                                    storeId:groupDetail.storeId,
                                    groupTitle:groupDetail.groupTitle,
                                    sequence:groupDetail.sequence,
                                    status:groupDetail.status 
                                }
                            )
                        });
                        if(list.length > 0){
                            return res.status(200).send({ data:{success:true, details:list}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                        } else {
                            return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:"No Error"}});
                        }
                    }).catch(function(error) {
                        return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
                    });
                    
            }).catch(function(error){
                return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:0, errorMsg:error}});
            })
        }

    }

}

exports.sitesettingGroupView = async function(req,res){
    var storeId = req.body.data.storeId;
    var id = req.body.data.id;
    if(storeId && storeId !=''){
        if(id && id !=''){
            let groupView = await models.siteSettingsGroups.findOne({attributes:['id','storeId','groupTitle','sequence'], where:{storeId:storeId, id:id}});
            
            if(groupView){
                return res.status(200).send({ data:{success:true, details:groupView}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            } else {
                return res.status(200).send({ data:{success:false, details:{}, message:"No data found"}, errorNode:{errorCode:1, errorMsg:"No Error"}});
            }
        } else {
            return res.status(200).send({ data:{success:false, message:"Id is require!"}, errorNode:{errorCode:1, errorMsg:error}});
        }
    } else {
        return res.status(200).send({ data:{success:false, message:"storeId is require!"}, errorNode:{errorCode:1, errorMsg:error}});
    }

}


// exports.sitesettingGroupList = async function(req,res){
//     var storeId = req.body.data.storeId;
//     if(storeId && storeId !=''){
//         let groupList = await models.siteSettingsGroups.findAll({attributes:['id','storeId','groupTitle','sequence'], where:{storeId:storeId}, Order:[['sequence','ASC']]})
//         if(groupList.length>0){
//             return res.status(200).send({ data:{success:true, list:groupList}, errorNode:{errorCode:0, errorMsg:"No Error"}});
//         } else {
//             return res.status(200).send({ data:{success:false, list:"[]", message:'No site settings group found'}, errorNode:{errorCode:0, errorMsg:"No Error"}});
//         }
//     } else {
//         return res.status(200).send({ data:{success:false, message:"storeId is require!"}, errorNode:{errorCode:1, errorMsg:error}});
//     }

// }

exports.sitesettingGroupList = async function(req,res){
    var storeId = req.body.data.storeId;
    if(storeId && storeId !=''){
        const list = []
        let groupList = await models.siteSettingsGroups.findAll({attributes:['id','storeId','groupTitle','sequence'], where:{storeId:storeId}, Order:[['sequence','ASC']]})
        if(groupList.length>0){
            for(let group of groupList){
                const totalCount = await models.siteSettings.count({where:{siteSettingsGroupId:group.id, storeId:storeId}})
                let details = group.dataValues
                details.totalCount = totalCount
                list.push(details)
            }
        }
        
        if(list.length>0){
            return res.status(200).send({ data:{success:true, list:list}, errorNode:{errorCode:0, errorMsg:"No Error"}});
        } else {
            return res.status(200).send({ data:{success:false, list:"[]"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
        }
    } else {
        return res.status(200).send({ data:{success:false, message:"storeId is require!"}, errorNode:{errorCode:1, errorMsg:error}});
    }

}


exports.sitesettingGroupDelete = function (req, res) {
    var id = req.body.data.id;
    var storeId = req.body.data.storeId;
    if (id && id == "" && storeId && storeId=="") {
        return res.status(200).send({ status: 200, success: false, message: "Id not found" });
    }else{
        models.siteSettingsGroups.destroy({
          where: { id:id,storeId:storeId }
        }).then(function (value) {
            if(value){
                return res.status(200).send({ data:{success:true}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }else{
                return res.status(200).send({ data:{success:false}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }
        }).catch(function (error) {
            return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
        });
    }
  };

exports.sitesettingAdd = async function(req,res){
    var storeId = req.body.data.storeId;
    var groupId = req.body.data.groupId;
    var title = req.body.data.title;
    var label = req.body.data.label;
    var sequence = req.body.data.sequence;
    if(storeId && storeId !='' && groupId && groupId !='' && title && title !='' && label && label !='' && sequence && sequence !=''){
       
        var groupIdCheck = await models.siteSettingsGroups.findOne({where:{storeId:storeId,id:groupId}});
        if(groupIdCheck){
            models.siteSettings.create({
                storeId   :storeId,
                siteSettingsGroupId: groupId,
                //groupId: siteSettingsGroupId,
                title: title,
                label:label,
                sequence : sequence,
            }).then(async function(sitesetting) {  
                return res.status(200).send({ data:{success:true, details:sitesetting, message:'Site settings successfully added'}, errorNode:{errorCode:0, errorMsg:""}});
            }).catch(function(error) {
                return res.status(200).send({ data:{success:false, details:"",message:'something went wrong. Please try again'}, errorNode:{errorCode:1, errorMsg:error}});
            });
        } else {
            return res.status(200).send({ data:{success:false, message:'Group Id not found!'}, errorNode:{errorCode:1, errorMsg:"Error"}});
        }

    } else {
        return res.status(200).send({ data:{success:false, message : "All fields are required"}, errorNode:{errorCode:1, errorMsg:"error"}});
    }
}

exports.sitesettingAddEdit = async function(req,res){
    const id = req.body.data.id || null;
    const storeId = req.body.data.storeId || null;
    const groupId = req.body.data.groupId || null;
    const title = req.body.data.title || null;
    const label = req.body.data.label || null;
    const sequence = req.body.data.sequence || null;
    const email =req.body.data.email || null;
    const mobileNo = req.body.data.mobileNo || null;
    const shippingCharges = req.body.data.shippingCharges || null;
    const freeShippingLimit = req.body.data.freeShippingLimit || null;
    const value = req.body.data.value || null;
    const googleUrl = req.body.data.googleUrl || null;
    const facebook = req.body.data.facebook || null;
    const instagram = req.body.data.instagram || null;
    const twitter = req.body.data.twitter || null;
    const linkedin = req.body.data.linkedin || null;
    const youtube = req.body.data.youtube || null;
    const siteUrl = req.body.data.siteUrl || null;
    const latitude = req.body.data.latitude || null;
    const longitude = req.body.data.longitude || null;
    const tagline = req.body.data.tagline || null;

    const logo = req.body.data.logo;
    const logoExt = req.body.data.logoExt;

    if(!id){
        if(storeId && groupId && title){
       
            const groupIdCheck = await models.siteSettingsGroups.findOne({where:{storeId:storeId,id:groupId}});
            if(groupIdCheck){
                await models.siteSettings.create({
                    storeId: storeId,
                    siteSettingsGroupId: groupId,
                    title: title,
                    label: label,
                    sequence : sequence,
                    email : email,
                    mobileNo : mobileNo,
                    shippingCharges : shippingCharges,
                    freeShippingLimit : freeShippingLimit,
                    value : value,
                    googleUrl : googleUrl,
                    facebook : facebook,
                    instagram : instagram,
                    twitter : twitter,
                    linkedin : linkedin,
                    youtube : youtube,
                    siteUrl : siteUrl,
                    latitude : latitude,
                    longitude : longitude,
                    tagline : tagline,
                    status: "Yes"
                }).then(async(sitesetting) => {  

                    var dir = './public/admin/siteSetting/'+categoryId; 
                    console.log(dir);
                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);                  
                    }

                    if(logo && logo != '' && logoExt && logoExt !='') {
                        var siteSettingsDetails = await models.siteSettings.findOne({ attributes: ["image"], where: { id: id } });
                        if(siteSettingsDetails.image && siteSettingsDetails.image != '' && siteSettingsDetails.image != null) {

                        if(fs.existsSync(__dirname + '/../../public/admin/siteSetting/'+ id +'/'+siteSettingsDetails.image)){
                            fs.unlink(__dirname +  '/../../public/admin/siteSetting/'+ id +'/'+siteSettingsDetails.image, (err) => {
                            if (err) throw err;
                            console.log('successfully deleted /tmp/hello');
                            });
                        }
                        }
                        var imageTitle = Date.now();
                        var path = './public/admin/siteSetting/'+ id +'/'+imageTitle+'.'+logoExt;
                        var siteSettingsImage =imageTitle+'.'+logoExt;   
                        try {
                            const imgdata = logo;
                            const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                            fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                            models.siteSettings.update({
                            image : siteSettingsImage,
                            },{ where: { id: id } })        
                        } catch (e) {
                            next(e);
                        }
                    }

                    return res.status(201).send({ data:{success:true, message:"Successfully Created", details:sitesetting}, errorNode:{errorCode:0, errorMsg:""}});
                }).catch((error) => {
                    return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
                });
            } else {
                return res.status(400).send({ data:{success:false, message:'Group Id not found!'}, errorNode:{errorCode:1, errorMsg:"Error"}});
            }
    
        } else {
            return res.status(400).send({ data:{success:false, message : "Please fill the required fields"}, errorNode:{errorCode:1, errorMsg:"error"}});
        }

    } else {
        if(storeId && groupId && title){
            const groupIdCheck = await models.siteSettingsGroups.findOne({where:{storeId:storeId,id:groupId}});
            if(groupIdCheck){
                await models.siteSettings.update({
                    storeId: storeId,
                    siteSettingsGroupId: groupId,
                    title: title,
                    label: label,
                    sequence : sequence,
                    email : email,
                    mobileNo : mobileNo,
                    shippingCharges : shippingCharges,
                    freeShippingLimit : freeShippingLimit,
                    value : value,
                    googleUrl : googleUrl,
                    facebook : facebook,
                    instagram : instagram,
                    twitter : twitter,
                    linkedin : linkedin,
                    youtube : youtube,
                    siteUrl : siteUrl,
                    latitude : latitude,
                    longitude : longitude,
                    tagline : tagline,	
                },{where:{storeId:storeId,id:id}}).then(async(data) => {

                    if(logo && logo != '' && logoExt && logoExt !='') {
                        var siteSettingsDetails = await models.siteSettings.findOne({ attributes: ["image"], where: { id: id } });
                        if(siteSettingsDetails.image && siteSettingsDetails.image != '' && siteSettingsDetails.image != null) {

                        if(fs.existsSync(__dirname + '/../../public/admin/siteSetting/'+ id +'/'+siteSettingsDetails.image)){
                            fs.unlink(__dirname +  '/../../public/admin/siteSetting/'+ id +'/'+siteSettingsDetails.image, (err) => {
                            if (err) throw err;
                            console.log('successfully deleted /tmp/hello');
                            });
                        }
                        }
                        var imageTitle = Date.now();
                        var path = './public/admin/siteSetting/'+ id +'/'+imageTitle+'.'+logoExt;
                        var siteSettingsImage =imageTitle+'.'+logoExt;   
                        try {
                            const imgdata = logo;
                            const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');                
                            fs.writeFileSync(path, base64Data,  {encoding: 'base64'}); 
                            models.siteSettings.update({
                            image : siteSettingsImage,
                            },{ where: { id: id } })        
                        } catch (e) {
                            next(e);
                        }
                    }

                    const details = await models.siteSettings.findOne({ where: {storeId:storeId,id:id} })
                    return res.status(200).send({ data:{success:true, message:"Successfully Updated", details:details}, errorNode:{errorCode:0, errorMsg:"No Error"}});

                }).catch(function(error){
                    return res.status(500).send({ data:{success:false, details:"Something went wrong"}, errorNode:{errorCode:1, errorMsg:error}});
                })

            } else {
                return res.status(200).send({ data:{success:false, message:'Group Id not found!'}, errorNode:{errorCode:1, errorMsg:"Error"}});
            }
            
        }
    }
    
}

exports.sitesettingView = async function(req,res){
    var storeId = req.body.data.storeId;
    var id = req.body.data.id;
    if(storeId && storeId !=''){
        if(id && id !=''){
            let siteSettingView = await models.siteSettings.findOne({ where:{storeId:storeId, id:id}});
            
            if(siteSettingView){
                return res.status(200).send({ data:{success:true, details:siteSettingView}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            } else {
                return res.status(200).send({ data:{success:false, details:'', message:"No data found"}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }
        } else {
            return res.status(200).send({ data:{success:false, message:"Id is require!"}, errorNode:{errorCode:1, errorMsg:"error"}});
        }
    } else {
        return res.status(200).send({ data:{success:false, message:"storeId is require!"}, errorNode:{errorCode:1, errorMsg:"error"}});
    }

}

// exports.sitesettingList = async function(req,res) {
//     var storeId = req.body.data.storeId;
//     if(storeId && storeId !=''){
//         var list = [];
//         let sitesettingDetails = await models.siteSettings.findAll({
//             attributes:['id','storeId','siteSettingsGroupId','title','label','sequence'],
//             where:{storeId:storeId},order:[['sequence','ASC']],
//         });

//         if(sitesettingDetails.length>0){
//             for(let setting of sitesettingDetails){ 
                
//                 const groupTitle = await models.siteSettingsGroups.findAll({attributes:['groupTitle'], where:{id:setting.siteSettingsGroupId}})

//                 let details = {}
//                 details.id= setting.id,
//                 details.storeId = setting.storeId,
//                 details.groupId = setting.siteSettingsGroupId,
//                 details.title = setting.title,
//                 details.groupTitle = groupTitle[0].groupTitle,
//                 details.label = setting.label,
//                 details.sequence = setting.sequence

//                 list.push(details);
//             }

//         } else {
//             var list = [];
//         }

//         return res.status(200).send({data:{success:true,list:list},errorNode:{errorCode:0, errorMsg:"No Error"}});
//     } else {
//         return res.status(200).send({data:{success:false,message:'stoerId is required!'},errorNode:{errorCode:1, errorMsg:"Error"}});
//     }
// }

exports.sitesettingList = async function(req,res) {
    var storeId = req.body.data.storeId;
    if(storeId && storeId !=''){
        var list = [];
        const groupTitles = await models.siteSettingsGroups.findAll({attributes:['id','groupTitle'], where:{storeId:storeId},order:[['sequence','ASC']]})

        if(groupTitles.length>0){
            
            for(let titles of groupTitles){ 
                let sitesettingDetails = await models.siteSettings.findAll({
                    where:{siteSettingsGroupId:titles.id},order:[['sequence','ASC']],
                });
                
                let details = {}
                details.groupName= titles.groupTitle,
                details.groupData= sitesettingDetails,

                list.push(details);
            }

        } else {
            var list = [];
        }

        return res.status(200).send({data:{success:true,list:list},errorNode:{errorCode:0, errorMsg:"No Error"}});
    } else {
        return res.status(200).send({data:{success:false,message:'stoerId is required!'},errorNode:{errorCode:1, errorMsg:"Error"}});
    }
}


exports.sitesettingDelete = function (req, res) {
    var id = req.body.data.id;
    var storeId = req.body.data.storeId;
    if (id && id == "" && storeId && storeId=="") {
        return res.status(200).send({ status: 200, success: false, message: "Id not found" });
    }else{
        models.siteSettings.destroy({
          where: { id:id,storeId:storeId }
        }).then(function (value) {
            if(value){
                return res.status(200).send({ data:{success:true}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }else{
                return res.status(200).send({ data:{success:false}, errorNode:{errorCode:0, errorMsg:"No Error"}});
            }
        }).catch(function (error) {
            return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:error}});
        });
    }
  };

  
// exports.sitesettingList = async function(req,res) {
//     var storeId = req.body.data.storeId;

//     if(storeId && storeId !=''){
//         var list = [];
//         var sitesettinggroupList = await models.siteSettingsGroups.findAll({where:{storeId:storeId,status:'Yes'}, Order:[['sequence','ASC']]});
       
//         if(sitesettinggroupList.length>0){
//             for(var i=0;i<sitesettinggroupList.length;i++){ 
//                 var groupId = sitesettinggroupList[i].id;
                
//                 let sitesettinglist = await models.siteSettings.findAll({attributes:['id','storeId','siteSettingsGroupId','title','label'],where:{storeId:storeId,siteSettingsGroupId:groupId}, Order:[['sequence','ASC']] });
               
//                 list.push({
//                     'id'           : sitesettinggroupList[i].id,
//                     'storeId'      : sitesettinggroupList[i].storeId,
//                     'groupTitle'   : sitesettinggroupList[i].groupTitle, 
//                     'siteSettings' : sitesettinglist
//                 });
//             }

//         } else {
//             var list = [];
//         }

//         return res.status(200).send({data:{success:true,list:list},errorNode:{errorCode:0, errorMsg:"No Error"}});
//     } else {
//         return res.status(200).send({data:{success:false,message:'stoerId is required!'},errorNode:{errorCode:1, errorMsg:"Error"}});
//     }
// }

// exports.sitesettingAdd = async function(req,res){

// }


