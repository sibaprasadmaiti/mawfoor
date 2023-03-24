const imageThumbnail = require('image-thumbnail');
const models = require("../../models");
var fs = require("fs");
var fs = require("file-system");
const Sequelize = require("sequelize");
const config = require("../../config/config.json");
const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: "localhost",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
  }
);
const lastUpdate = new Date();
/**
 * Description:  Module List
 **/
exports.moduleList = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  if (storeId && storeId != "" && storeId != null) {
    const modules = await models.module.findAll({
      attributes: [
        "id",
        "title",
        "shortDescription",
        "longDescription",
        "image",
        "tumbImage",
        "bannerImage",
        "slug",
        "status",
        "createdAt",
      ],
      where: { storeId: storeId },
      include: [{ model: models.moduleItem, required: false }],
    });

    const list = modules.map((m) => {
      return Object.assign(
        {},
        {
          id: m.id,
          title: m.title,
          shortDescription: m.shortDescription,
          longDescription: m.longDescription,
          slug: m.slug,
          status: m.status,
          createdAt: m.createdAt,
          image:
            m.image != "" && m.image != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                m.image
              : req.app.locals.baseurl + "admin/category/no_image.jpg",
          tumbImage:
            m.tumbImage != "" && m.tumbImage != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                m.tumbImage
              : req.app.locals.baseurl + "admin/category/no_image.jpg",
          bannerImage:
            m.bannerImage != "" && m.bannerImage != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                m.bannerImage
              : req.app.locals.baseurl + "admin/category/no_image.jpg",
          itemCount: m.moduleItems.length,
        }
      );
    });

    if (list.length > 0) {
      return res.status(200).send({
        data: { success: true, details: list },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    } else {
      return res.status(200).send({
        data: { success: false, details: [] },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: { errorCode: 1, errorMsg: "storeId is required" },
    });
  }
};

/**
 * Description:  Module View
 **/
exports.moduleView = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  const id = req.body.data.id || "";
  if (storeId && storeId != "" && storeId != null && id != "") {
    const module = await models.module.findOne({
      where: { storeId: storeId, id: id },
    });
    const newModule = module.dataValues
    
    newModule.imageLink= module.image != "" && module.image != null ? req.app.locals.baseurl + "admin/module/" + storeId  + "/" + module.image : req.app.locals.baseurl + "admin/category/no_image.jpg",
    newModule.tumbImageLink=  module.tumbImage != "" && module.tumbImage != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + module.tumbImage : req.app.locals.baseurl + "admin/category/no_image.jpg",
    newModule.bannerImageLink=  module.bannerImage != "" && module.bannerImage != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + module.bannerImage : req.app.locals.baseurl + "admin/category/no_image.jpg"

    if (newModule != null || newModule != "") {
      return res.status(200).send({
        data: { success: true, details: newModule },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    } else {
      return res.status(200).send({
        data: { success: false, details: {} },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: "storeId and id is required" },
      errorNode: { errorCode: 1, errorMsg: "storeId and id is required" },
    });
  }
};

/**
 * Description:  Module Create/Update
 **/
exports.moduleCreate = async (req, res, next) => {
  const {
    updateId,
    storeId,
    title,
    shortDescription,
    longDescription,
    metaTitle,
    metaKeyword,
    metaDescription,
    relavantIndustry,
    image,
    imageExt,
    tumbImage,
    tumbImageExt,
    bannerImage,
    bannerImageExt,
    slug
  } = req.body.data;

  if (storeId && storeId != "" && storeId != null) {
    if (!updateId) {
      await models.module
        .findAndCountAll({ where: { title: title, storeId: storeId } })
        .then(async (value) => {
          let slug2;
          if (value.count >= 1) {
            slug2 =
              title.toString().toLowerCase().replace(/\s+/g, "-") +
              "-" +
              value.count;
          } else {
            slug2 = title.toString().toLowerCase().replace(/\s+/g, "-");
          }
          await models.module
            .create({
              storeId: storeId,
              title: title,
              shortDescription: shortDescription,
              longDescription: longDescription,
              relavantIndustry: relavantIndustry,
              slug: slug2,
              metaTitle: metaTitle,
              metaKeyword: metaKeyword,
              metaDescription: metaDescription,
            })
            .then(async (val) => {
              const dir = "./public/admin/module/" + storeId;
              console.log(dir);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
              }

              if (image && image != "" && imageExt && imageExt != "") {
                const imageTitle = Date.now();
                const path =
                  "./public/admin/module/" +
                  storeId +
                  "/" +
                  imageTitle +
                  "." +
                  imageExt;
                const normalImage = imageTitle + "." + imageExt;
                try {
                  const imgdata = image;
                  const base64Data = imgdata.replace(
                    /^data:([A-Za-z-+/]+);base64,/,
                    ""
                  );
                  const options = { height: 400 }
                  const compressed = await imageThumbnail(base64Data, options);             
                  fs.writeFileSync(path, compressed,  {encoding: 'base64'});
                  models.module.update(
                    {
                      image: normalImage,
                    },
                    { where: { id: val.id } }
                  );
                } catch (e) {
                  next(e);
                }
              }

              if (
                tumbImage &&
                tumbImage != "" &&
                tumbImageExt &&
                tumbImageExt != ""
              ) {
                const imageTitle = Date.now();
                const path =
                  "./public/admin/module/" +
                  storeId +
                  "/" +
                  imageTitle +
                  "." +
                  tumbImageExt;
                const thumbnail = imageTitle + "." + tumbImageExt;
                try {
                  const imgdata = tumbImage;
                  const base64Data = imgdata.replace(
                    /^data:([A-Za-z-+/]+);base64,/,
                    ""
                  );
                  const options = { height: 250 }
                  const compressed = await imageThumbnail(base64Data, options);             
                  fs.writeFileSync(path, compressed,  {encoding: 'base64'});
                  models.module.update(
                    {
                      tumbImage: thumbnail,
                    },
                    { where: { id: val.id } }
                  );
                } catch (e) {
                  next(e);
                }
              }

              if (
                bannerImage &&
                bannerImage != "" &&
                bannerImageExt &&
                bannerImageExt != ""
              ) {
                const imageTitle = Date.now();
                const path =
                  "./public/admin/module/" +
                  storeId +
                  "/" +
                  imageTitle +
                  "." +
                  bannerImageExt;
                const banner = imageTitle + "." + bannerImageExt;
                try {
                  const imgdata = bannerImage;
                  const base64Data = imgdata.replace(
                    /^data:([A-Za-z-+/]+);base64,/,
                    ""
                  );
                  const options = { height: 600 }
                  const compressed = await imageThumbnail(base64Data, options);             
                  fs.writeFileSync(path, compressed,  {encoding: 'base64'});
                  models.module.update(
                    {
                      bannerImage: banner,
                    },
                    { where: { id: val.id } }
                  );
                } catch (e) {
                  next(e);
                }
              }

              const settingCount = await models.moduleSetting.count({
                where: { storeId: storeId },
              });
              if (settingCount > 0) {
                await models.moduleSetting
                  .update(
                    { lastUpdate: lastUpdate },
                    { where: { storeId: storeId } }
                  )
                  .then(() => {
                    console.log("Done");
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }

              return res.status(201).send({
                data: { success: true, message: "Successfully created" },
                errorNode: { errorCode: 0, errorMsg: "No Error" },
              });
            })
            .catch((err) => {
              console.log(err);
              return res.status(500).send({
                data: { success: false, message: "Something went wrong !" },
                errorNode: {
                  errorCode: 1,
                  errorMsg: "Internal server error",
                },
              });
            });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send({
            data: { success: false, message: "Something went wrong !" },
            errorNode: { errorCode: 1, errorMsg: "Internal server error" },
          });
        });
    } else {
      await models.module
        .update(
          {
            storeId: storeId,
            title: title,
            shortDescription: shortDescription,
            longDescription: longDescription,
            relavantIndustry: relavantIndustry,
            metaTitle: metaTitle,
            metaKeyword: metaKeyword,
            slug: slug,
            metaDescription: metaDescription,
          },
          { where: { id: updateId } }
        )
        .then(async (val) => {
          if (image && image != "" && imageExt && imageExt != "") {
            const moduleItemImage = await models.module.findOne({
              attributes: ["image"],
              where: { id: updateId },
            });
            if (
              moduleItemImage.image &&
              moduleItemImage.image != "" &&
              moduleItemImage.image != null
            ) {
              if (
                fs.existsSync(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    moduleItemImage.image
                )
              ) {
                fs.unlink(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    moduleItemImage.image,
                  (err) => {
                    if (err) throw err;
                    console.log("successfully deleted");
                  }
                );
              }
            }
            const imageTitle = Date.now();
            const path =
              "./public/admin/module/" +
              storeId +
              "/" +
              imageTitle +
              "." +
              imageExt;
            const normalImage = imageTitle + "." + imageExt;
            try {
              const imgdata = image;
              const base64Data = imgdata.replace(
                /^data:([A-Za-z-+/]+);base64,/,
                ""
              );
              const options = { height: 400 }
              const compressed = await imageThumbnail(base64Data, options);             
              fs.writeFileSync(path, compressed,  {encoding: 'base64'});
              models.module.update(
                {
                  image: normalImage,
                },
                { where: { id: updateId } }
              );
            } catch (e) {
              next(e);
            }
          }

          if (
            tumbImage &&
            tumbImage != "" &&
            tumbImageExt &&
            tumbImageExt != ""
          ) {
            const moduleItemtumbImage = await models.module.findOne({
              attributes: ["tumbImage"],
              where: { id: updateId },
            });
            if (
              moduleItemtumbImage.tumbImage &&
              moduleItemtumbImage.tumbImage != "" &&
              moduleItemtumbImage.tumbImage != null
            ) {
              if (
                fs.existsSync(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    moduleItemtumbImage.tumbImage
                )
              ) {
                fs.unlink(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    moduleItemtumbImage.tumbImage,
                  (err) => {
                    if (err) throw err;
                    console.log("successfully deleted");
                  }
                );
              }
            }
            const imageTitle = Date.now();
            const path =
              "./public/admin/module/" +
              storeId +
              "/" +
              imageTitle +
              "." +
              tumbImageExt;
            const thumbnail = imageTitle + "." + tumbImageExt;
            try {
              const imgdata = tumbImage;
              const base64Data = imgdata.replace(
                /^data:([A-Za-z-+/]+);base64,/,
                ""
              );
              const options = { height: 250 }
              const compressed = await imageThumbnail(base64Data, options);             
              fs.writeFileSync(path, compressed,  {encoding: 'base64'});
              models.module.update(
                {
                  tumbImage: thumbnail,
                },
                { where: { id: updateId } }
              );
            } catch (e) {
              next(e);
            }
          }

          if (
            bannerImage &&
            bannerImage != "" &&
            bannerImageExt &&
            bannerImageExt != ""
          ) {
            const moduleItembannerImage = await models.module.findOne({
              attributes: ["bannerImage"],
              where: { id: updateId },
            });
            if (
              moduleItembannerImage.bannerImage &&
              moduleItembannerImage.bannerImage != "" &&
              moduleItembannerImage.bannerImage != null
            ) {
              if (
                fs.existsSync(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    moduleItembannerImage.bannerImage
                )
              ) {
                fs.unlink(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    moduleItembannerImage.bannerImage,
                  (err) => {
                    if (err) throw err;
                    console.log("successfully deleted");
                  }
                );
              }
            }
            const imageTitle = Date.now();
            const path =
              "./public/admin/module/" +
              storeId +
              "/" +
              imageTitle +
              "." +
              bannerImageExt;
            const banner = imageTitle + "." + bannerImageExt;
            try {
              const imgdata = bannerImage;
              const base64Data = imgdata.replace(
                /^data:([A-Za-z-+/]+);base64,/,
                ""
              );
              const options = { height: 600 }
              const compressed = await imageThumbnail(base64Data, options);             
              fs.writeFileSync(path, compressed,  {encoding: 'base64'});
              models.module.update(
                {
                  bannerImage: banner,
                },
                { where: { id: updateId } }
              );
            } catch (e) {
              next(e);
            }
          }

          const settingCount = await models.moduleSetting.count({
            where: { storeId: storeId },
          });
          if (settingCount > 0) {
            await models.moduleSetting
              .update(
                { lastUpdate: lastUpdate },
                { where: { storeId: storeId } }
              )
              .then(() => {
                console.log("Done");
              })
              .catch((err) => {
                console.log(err);
              });
          }

          return res.status(201).send({
            data: { success: true, message: "Successfully updated" },
            errorNode: { errorCode: 0, errorMsg: "No Error" },
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send({
            data: { success: false, message: "Something went wrong !" },
            errorNode: { errorCode: 1, errorMsg: "Internal server error" },
          });
        });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: { errorCode: 1, errorMsg: "storeId is required" },
    });
  }
};

/**
 * Description:  Module Delete
 **/
exports.moduleDelete = async (req, res) => {
  const id = req.params.id;
  if (id && id != "" && id != null) {
    const value = await models.module.findOne({
      attributes: ["storeId"],
      where: { id: id },
    });
    if (value) {
      const storeId = value.storeId;
      await models.module
        .destroy({ where: { id: id } })
        .then(async () => {
          const settingCount = await models.moduleSetting.count({
            where: { storeId: storeId },
          });
          if (settingCount > 0) {
            await models.moduleSetting
              .update(
                { lastUpdate: lastUpdate },
                { where: { storeId: storeId } }
              )
              .then(() => {
                console.log("Done");
              })
              .catch((err) => {
                console.log(err);
              });
          }
          return res.status(200).send({
            data: { success: true, message: "Successfully deleted" },
            errorNode: { errorCode: 0, errorMsg: "No Error" },
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send({
            data: { success: false, message: "Something went wrong !" },
            errorNode: { errorCode: 1, errorMsg: "Internal server error" },
          });
        });
    } else {
      return res.status(200).send({
        data: { success: false, message: "Id not match" },
        errorNode: { errorCode: 1, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: { errorCode: 1, errorMsg: "Id is required" },
    });
  }
};

/**
 * Description:  Module Item List
 **/
exports.moduleItemList = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  const moduleId = req.body.data.moduleId || "";
  if (
    storeId &&
    storeId != "" &&
    storeId != null &&
    moduleId &&
    moduleId != "" &&
    moduleId != null
  ) {
    const moduleItems = await models.moduleItem.findAll({
      attributes: [
        "id",
        "title",
        "shortDescription",
        "longDescription",
        "image",
        "tumbImage",
        "bannerImage",
        "slug",
        "status",
        "createdAt",
      ],
      where: { storeId: storeId, moduleId: moduleId },
      include: [{ model: models.dynamicSection, required: false }],
      order: [["sequence", "ASC"]],
    });

    const list = moduleItems.map((m) => {
      return Object.assign(
        {},
        {
          id: m.id,
          title: m.title,
          shortDescription: m.shortDescription,
          longDescription: m.longDescription,
          slug: m.slug,
          status: m.status,
          createdAt: m.createdAt,
          image:
            m.image != "" && m.image != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                m.image
              : req.app.locals.baseurl + "admin/category/no_image.jpg",
          tumbImage:
            m.tumbImage != "" && m.tumbImage != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                m.tumbImage
              : req.app.locals.baseurl + "admin/category/no_image.jpg",
          bannerImage:
            m.bannerImage != "" && m.bannerImage != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                m.bannerImage
              : req.app.locals.baseurl + "admin/category/no_image.jpg",
          sectionCount: m.dynamicSections.length,
        }
      );
    });

    if (list.length > 0) {
      return res.status(200).send({
        data: { success: true, details: list },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    } else {
      return res.status(200).send({
        data: { success: false, details: [] },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: {
        errorCode: 1,
        errorMsg: "storeId and moduleId is required",
      },
    });
  }
};

/**
 * Description:  Module Item View
 **/
exports.moduleItemView = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  const id = req.body.data.id || "";
  if (storeId && storeId != "" && storeId != null && id != "") {
    const moduleItem = await models.moduleItem.findOne({
      where: { storeId: storeId, id: id },
    });
    const newModuleItem = moduleItem.dataValues
    
    newModuleItem.imageLink = moduleItem.image != "" && moduleItem.image != null ? req.app.locals.baseurl + "admin/module/" + storeId  + "/" + moduleItem.image : req.app.locals.baseurl + "admin/category/no_image.jpg",

    newModuleItem.tumbImageLink =  moduleItem.tumbImage != "" && moduleItem.tumbImage != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + moduleItem.tumbImage : req.app.locals.baseurl + "admin/category/no_image.jpg",

    newModuleItem.bannerImageLink =  moduleItem.bannerImage != "" && moduleItem.bannerImage != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + moduleItem.bannerImage : req.app.locals.baseurl + "admin/category/no_image.jpg"

    newModuleItem.fileLink= moduleItem.file != "" && moduleItem.file != null ? req.app.locals.baseurl + "admin/module/" + storeId  + "/" + moduleItem.file : req.app.locals.baseurl + "admin/category/no_image.jpg"

    if (newModuleItem != null || newModuleItem != "") {
      return res.status(200).send({
        data: { success: true, details: newModuleItem },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    } else {
      return res.status(200).send({
        data: { success: false, details: {} },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: "storeId and id is required" },
      errorNode: { errorCode: 1, errorMsg: "storeId and id is required" },
    });
  }
};

/**
 * Description:  Module Item Create/Update
 **/
exports.moduleItemCreate = async (req, res, next) => {
  const {
    updateId,
    storeId,
    moduleId,
    title,
    sequence,
    shortDescription,
    longDescription,
    metaTitle,
    metaKeyword,
    metaDescription,
    image,
    imageExt,
    tumbImage,
    tumbImageExt,
    bannerImage,
    bannerImageExt,
    file,
    slug,
    fileExt,
  } = req.body.data;

  if (
    storeId &&
    storeId != "" &&
    storeId != null &&
    moduleId &&
    moduleId != "" &&
    moduleId != null
  ) {
    if (!updateId) {
      await models.moduleItem
        .findAndCountAll({ where: { title: title, storeId: storeId } })
        .then(async (value) => {
          let slug2;
          if (value.count >= 1) {
            slug2 =
              title.toString().toLowerCase().replace(/\s+/g, "-") +
              "-" +
              value.count;
          } else {
            slug2 = title.toString().toLowerCase().replace(/\s+/g, "-");
          }
          await models.moduleItem
            .create({
              storeId: storeId,
              title: title,
              moduleId: moduleId,
              sequence: sequence ? sequence : null,
              shortDescription: shortDescription,
              longDescription: longDescription,
              slug: slug2,
              metaTitle: metaTitle,
              metaKeyword: metaKeyword,
              metaDescription: metaDescription,
            })
            .then(async (val) => {
              const dir = "./public/admin/module/" + storeId;
              console.log(dir);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
              }

              if (image && image != "" && imageExt && imageExt != "") {
                const imageTitle = Date.now();
                const path =
                  "./public/admin/module/" +
                  storeId +
                  "/" +
                  imageTitle +
                  "." +
                  imageExt;
                const normalImage = imageTitle + "." + imageExt;
                try {
                  const imgdata = image;
                  const base64Data = imgdata.replace(
                    /^data:([A-Za-z-+/]+);base64,/,
                    ""
                  );
                  const options = { height: 400 }
                  const compressed = await imageThumbnail(base64Data, options);             
                  fs.writeFileSync(path, compressed,  {encoding: 'base64'});
                  models.moduleItem.update(
                    {
                      image: normalImage,
                    },
                    { where: { id: val.id } }
                  );
                } catch (e) {
                  next(e);
                }
              }

              if (
                tumbImage &&
                tumbImage != "" &&
                tumbImageExt &&
                tumbImageExt != ""
              ) {
                const imageTitle = Date.now();
                const path =
                  "./public/admin/module/" +
                  storeId +
                  "/" +
                  imageTitle +
                  "." +
                  tumbImageExt;
                const thumbnail = imageTitle + "." + tumbImageExt;
                try {
                  const imgdata = tumbImage;
                  const base64Data = imgdata.replace(
                    /^data:([A-Za-z-+/]+);base64,/,
                    ""
                  );
                  const options = { height: 250 }
                  const compressed = await imageThumbnail(base64Data, options);             
                  fs.writeFileSync(path, compressed,  {encoding: 'base64'});
                  models.moduleItem.update(
                    {
                      tumbImage: thumbnail,
                    },
                    { where: { id: val.id } }
                  );
                } catch (e) {
                  next(e);
                }
              }

              if (
                bannerImage &&
                bannerImage != "" &&
                bannerImageExt &&
                bannerImageExt != ""
              ) {
                const imageTitle = Date.now();
                const path =
                  "./public/admin/module/" +
                  storeId +
                  "/" +
                  imageTitle +
                  "." +
                  bannerImageExt;
                const banner = imageTitle + "." + bannerImageExt;
                try {
                  const imgdata = bannerImage;
                  const base64Data = imgdata.replace(
                    /^data:([A-Za-z-+/]+);base64,/,
                    ""
                  );
                  const options = { height: 600 }
                  const compressed = await imageThumbnail(base64Data, options);             
                  fs.writeFileSync(path, compressed,  {encoding: 'base64'});
                  models.moduleItem.update(
                    {
                      bannerImage: banner,
                    },
                    { where: { id: val.id } }
                  );
                } catch (e) {
                  next(e);
                }
              }

              if (file && file != "" && fileExt && fileExt != "") {
                const fileTitle = Date.now();
                const path = "./public/admin/module/" + storeId + "/" + fileTitle + "." + fileExt;
                const normalfile = fileTitle + "." + fileExt;
                try {
                  const imgdata = file;
                  const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/,"");           
                  fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
                  models.moduleItem.update({ file: normalfile},{ where: { id: val.id } });
                } catch (e) {
                  next(e);
                }
              }

              const settingCount = await models.moduleSetting.count({
                where: { storeId: storeId },
              });
              if (settingCount > 0) {
                await models.moduleSetting
                  .update(
                    { lastUpdate: lastUpdate },
                    { where: { storeId: storeId } }
                  )
                  .then(() => {
                    console.log("Done");
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }

              return res.status(201).send({
                data: { success: true, message: "Successfully created" },
                errorNode: { errorCode: 0, errorMsg: "No Error" },
              });
            })
            .catch((err) => {
              console.log(err);
              return res.status(500).send({
                data: { success: false, message: "Something went wrong !" },
                errorNode: {
                  errorCode: 1,
                  errorMsg: "Internal server error",
                },
              });
            });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send({
            data: { success: false, message: "Something went wrong !" },
            errorNode: { errorCode: 1, errorMsg: "Internal server error" },
          });
        });
    } else {
      await models.moduleItem
        .update(
          {
            storeId: storeId,
            moduleId: moduleId,
            title: title,
            sequence: sequence ? sequence : null,
            shortDescription: shortDescription,
            longDescription: longDescription,
            metaTitle: metaTitle,
            slug: slug,
            metaKeyword: metaKeyword,
            metaDescription: metaDescription,
          },
          { where: { id: updateId } }
        )
        .then(async (val) => {
          if (image && image != "" && imageExt && imageExt != "") {
            const moduleItemImage = await models.moduleItem.findOne({
              attributes: ["image"],
              where: { id: updateId },
            });
            if (
              moduleItemImage.image &&
              moduleItemImage.image != "" &&
              moduleItemImage.image != null
            ) {
              if (
                fs.existsSync(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    moduleItemImage.image
                )
              ) {
                fs.unlink(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    moduleItemImage.image,
                  (err) => {
                    if (err) throw err;
                    console.log("successfully deleted");
                  }
                );
              }
            }
            const imageTitle = Date.now();
            const path =
              "./public/admin/module/" +
              storeId +
              "/" +
              imageTitle +
              "." +
              imageExt;
            const normalImage = imageTitle + "." + imageExt;
            try {
              const imgdata = image;
              const base64Data = imgdata.replace(
                /^data:([A-Za-z-+/]+);base64,/,
                ""
              );
              const options = { height: 400 }
              const compressed = await imageThumbnail(base64Data, options);             
              fs.writeFileSync(path, compressed,  {encoding: 'base64'});
              models.moduleItem.update(
                {
                  image: normalImage,
                },
                { where: { id: updateId } }
              );
            } catch (e) {
              next(e);
            }
          }

          if (
            tumbImage &&
            tumbImage != "" &&
            tumbImageExt &&
            tumbImageExt != ""
          ) {
            const moduleItemtumbImage = await models.moduleItem.findOne({
              attributes: ["tumbImage"],
              where: { id: updateId },
            });
            if (
              moduleItemtumbImage.tumbImage &&
              moduleItemtumbImage.tumbImage != "" &&
              moduleItemtumbImage.tumbImage != null
            ) {
              if (
                fs.existsSync(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    moduleItemtumbImage.tumbImage
                )
              ) {
                fs.unlink(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    moduleItemtumbImage.tumbImage,
                  (err) => {
                    if (err) throw err;
                    console.log("successfully deleted");
                  }
                );
              }
            }
            const imageTitle = Date.now();
            const path =
              "./public/admin/module/" +
              storeId +
              "/" +
              imageTitle +
              "." +
              tumbImageExt;
            const thumbnail = imageTitle + "." + tumbImageExt;
            try {
              const imgdata = tumbImage;
              const base64Data = imgdata.replace(
                /^data:([A-Za-z-+/]+);base64,/,
                ""
              );
              const options = { height: 250 }
              const compressed = await imageThumbnail(base64Data, options);             
              fs.writeFileSync(path, compressed,  {encoding: 'base64'});
              models.moduleItem.update(
                {
                  tumbImage: thumbnail,
                },
                { where: { id: updateId } }
              );
            } catch (e) {
              next(e);
            }
          }

          if (
            bannerImage &&
            bannerImage != "" &&
            bannerImageExt &&
            bannerImageExt != ""
          ) {
            const moduleItembannerImage = await models.moduleItem.findOne({
              attributes: ["bannerImage"],
              where: { id: updateId },
            });
            if (
              moduleItembannerImage.bannerImage &&
              moduleItembannerImage.bannerImage != "" &&
              moduleItembannerImage.bannerImage != null
            ) {
              if (
                fs.existsSync(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    moduleItembannerImage.bannerImage
                )
              ) {
                fs.unlink(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    moduleItembannerImage.bannerImage,
                  (err) => {
                    if (err) throw err;
                    console.log("successfully deleted");
                  }
                );
              }
            }
            const imageTitle = Date.now();
            const path =
              "./public/admin/module/" +
              storeId +
              "/" +
              imageTitle +
              "." +
              bannerImageExt;
            const banner = imageTitle + "." + bannerImageExt;
            try {
              const imgdata = bannerImage;
              const base64Data = imgdata.replace(
                /^data:([A-Za-z-+/]+);base64,/,
                ""
              );
              const options = { height: 600 }
              const compressed = await imageThumbnail(base64Data, options);             
              fs.writeFileSync(path, compressed,  {encoding: 'base64'});
              models.moduleItem.update(
                {
                  bannerImage: banner,
                },
                { where: { id: updateId } }
              );
            } catch (e) {
              next(e);
            }
          }

          if (file && file != "" && fileExt && fileExt != "") {
            const existFile = await models.moduleItem.findOne({ attributes: ["file"], where: { id: updateId }});
            if (existFile.file && existFile.file != "" && existFile.file != null) {
              if (fs.existsSync(__dirname + "/../../public/admin/module/" + storeId + "/" + existFile.file)) {
                fs.unlink(__dirname + "/../../public/admin/module/" + storeId + "/" +  existFile.file,
                  (err) => {
                    if (err) throw err;
                    console.log("successfully deleted");
                  }
                );
              }
            }

            const fileTitle = Date.now();
            const path = "./public/admin/module/" + storeId + "/" + fileTitle + "." + fileExt;
            const normalfile = fileTitle + "." + fileExt;
            try {
              const imgdata = file;
              const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/,"");           
              fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
              models.moduleItem.update({ file: normalfile},{ where: { id: updateId } });
            } catch (e) {
              next(e);
            }
          }

          const settingCount = await models.moduleSetting.count({
            where: { storeId: storeId },
          });
          if (settingCount > 0) {
            await models.moduleSetting
              .update(
                { lastUpdate: lastUpdate },
                { where: { storeId: storeId } }
              )
              .then(() => {
                console.log("Done");
              })
              .catch((err) => {
                console.log(err);
              });
          }

          return res.status(201).send({
            data: { success: true, message: "Successfully updated" },
            errorNode: { errorCode: 0, errorMsg: "No Error" },
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send({
            data: { success: false, message: "Something went wrong !" },
            errorNode: { errorCode: 1, errorMsg: "Internal server error" },
          });
        });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: { errorCode: 1, errorMsg: "storeId is required" },
    });
  }
};

/**
 * Description:  Module Item Delete
 **/
exports.moduleItemDelete = async (req, res) => {
  const id = req.params.id;
  if (id && id != "" && id != null) {
    const value = await models.moduleItem.findOne({
      attributes: ["storeId"],
      where: { id: id },
    });
    if (value) {
      const storeId = value.storeId;
      await models.moduleItem
        .destroy({ where: { id: id } })
        .then(async () => {
          const settingCount = await models.moduleSetting.count({
            where: { storeId: storeId },
          });
          if (settingCount > 0) {
            await models.moduleSetting
              .update(
                { lastUpdate: lastUpdate },
                { where: { storeId: storeId } }
              )
              .then(() => {
                console.log("Done");
              })
              .catch((err) => {
                console.log(err);
              });
          }

          return res.status(200).send({
            data: { success: true, message: "Successfully deleted" },
            errorNode: { errorCode: 0, errorMsg: "No Error" },
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send({
            data: { success: false, message: "Something went wrong !" },
            errorNode: { errorCode: 1, errorMsg: "Internal server error" },
          });
        });
    } else {
      return res.status(200).send({
        data: { success: false, message: "Id not match" },
        errorNode: { errorCode: 1, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: { errorCode: 1, errorMsg: "Id is required" },
    });
  }
};

/**
 * Description:  Module List for Forntend
 **/
exports.newModuleList = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  const slug = req.body.data.slug || "";
  if (storeId && storeId != "" && slug != "" && slug) {
    const menus = await models.menus.findOne({
      attributes: ["moduleId", "pageName"],
      where: { storeId: storeId, slug: slug },
    });
    if (menus) {
      let modules;
      if (menus.moduleId != "") {
        modules = await models.module.findAll({
          where: { storeId: storeId, id: menus.moduleId, status: "Active" },
          include: [
            {
              model: models.moduleItem,
              required: false,
              include: [
                {
                  model: models.dynamicSection,
                  required: false,
                  include: [{ model: models.subSection, required: false }],
                },
              ],
            },
          ],
        });
      } else {
        modules = [];
      }
      if (modules.length > 0) {
        return res.status(200).send({
          data: { success: true, pageName: menus.pageName, details: modules },
          errorNode: { errorCode: 0, errorMsg: "No Error" },
        });
      } else {
        return res.status(200).send({
          data: { success: false, details: [] },
          errorNode: { errorCode: 0, errorMsg: "No Error" },
        });
      }
    } else {
      return res.status(200).send({
        data: { success: false, details: "" },
        errorNode: { errorCode: 1, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: "storeId and slug is required" },
      errorNode: { errorCode: 1, errorMsg: "storeId and slug is required" },
    });
  }
};

/**
 * Description:  Section List
 **/
exports.sectionList = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  const moduleItemId = req.body.data.moduleItemId || "";
  if (
    storeId &&
    storeId != "" &&
    storeId != null &&
    moduleItemId &&
    moduleItemId != "" &&
    moduleItemId != null
  ) {
    const sections = await models.dynamicSection.findAll({
      attributes: [
        "id",
        "title",
        "description",
        "image",
        "backgroundImage",
        "slug",
        "status",
        "sequence",
        "createdAt",
      ],
      where: { storeId: storeId, moduleItemId: moduleItemId },
      order: [["sequence", "ASC"]],
      include: [{ model: models.subSection, required: false }],
    });

    const list = sections.map((m) => {
      return Object.assign(
        {},
        {
          id: m.id,
          sequence: m.sequence,
          title: m.title,
          description: m.description,
          slug: m.slug,
          status: m.status,
          createdAt: m.createdAt,
          image:
            m.image != "" && m.image != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                m.image
              : req.app.locals.baseurl + "admin/category/no_image.jpg",
          backgroundImage:
            m.backgroundImage != "" && m.backgroundImage != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                m.backgroundImage
              : req.app.locals.baseurl + "admin/category/no_image.jpg",
          subSectionCount: m.subSections.length,
        }
      );
    });

    if (list.length > 0) {
      return res.status(200).send({
        data: { success: true, details: list },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    } else {
      return res.status(200).send({
        data: { success: true, details: [] },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: {
        errorCode: 1,
        errorMsg: "storeId and moduleItemId is required",
      },
    });
  }
};

/**
 * Description:  Section View
 **/
exports.sectionView = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  const id = req.body.data.id || "";
  if (storeId && storeId != "" && storeId != null && " != ") {
    const sections = await models.dynamicSection.findOne({
      where: { storeId: storeId, id: id },
    });

    const newSection = sections.dataValues

    newSection.imageLink= sections.image != "" && sections.image != null ? req.app.locals.baseurl + "admin/module/" + storeId  + "/" + sections.image : req.app.locals.baseurl + "admin/category/no_image.jpg",
    newSection.backgroundImageLink=  sections.backgroundImage != "" && sections.backgroundImage != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + sections.backgroundImage : req.app.locals.baseurl + "admin/category/no_image.jpg",
    newSection.fileLink= sections.file != "" && sections.file != null ? req.app.locals.baseurl + "admin/module/" + storeId  + "/" + sections.file : req.app.locals.baseurl + "admin/category/no_image.jpg"

    if (newSection != "" || newSection != null) {
      return res.status(200).send({
        data: { success: true, details: newSection },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    } else {
      return res.status(200).send({
        data: { success: true, details: {} },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: "storeId and id is required" },
      errorNode: {
        errorCode: 1,
        errorMsg: "storeId and moduleItemId is required",
      },
    });
  }
};

/**
 * Description:  Section Create/Update
 **/
exports.sectionCreate = async (req, res, next) => {
  const {
    updateId,
    storeId,
    moduleItemId,
    title,
    sequence,
    description,
    longDescription,
    metaTitle,
    metaKeyword,
    metaDescription,
    cssClass,
    link,
    buttontext,
    buttonlink,
    image,
    imageExt,
    backgroundImage,
    backgroundImageExt,
    file,
    fileExt,
    slug,
  } = req.body.data;

  if (storeId && storeId != "" && storeId != null) {
    if (!updateId) {
      await models.dynamicSection
        .findAndCountAll({ where: { title: title, storeId: storeId } })
        .then(async (value) => {
          let slug2;
          if (value.count >= 1) {
            slug2 =
              title.toString().toLowerCase().replace(/\s+/g, "-") +
              "-" +
              value.count;
          } else {
            slug2 = title.toString().toLowerCase().replace(/\s+/g, "-");
          }
          await models.dynamicSection
            .create({
              storeId: storeId,
              moduleItemId: moduleItemId,
              title: title,
              sequence: sequence ? sequence : null,
              description: description,
              longDescription: longDescription,
              cssClass: cssClass,
              link: link,
              buttontext: buttontext,
              buttonlink: buttonlink,
              slug: slug2,
              metaTitle: metaTitle,
              metaKeyword: metaKeyword,
              metaDescription: metaDescription,
            })
            .then(async (val) => {
              const dir = "./public/admin/module/" + storeId;
              console.log(dir);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
              }

              if (image && image != "" && imageExt && imageExt != "") {
                const imageTitle = Date.now();
                const path =
                  "./public/admin/module/" +
                  storeId +
                  "/" +
                  imageTitle +
                  "." +
                  imageExt;
                const normalImage = imageTitle + "." + imageExt;
                try {
                  const imgdata = image;
                  const base64Data = imgdata.replace(
                    /^data:([A-Za-z-+/]+);base64,/,
                    ""
                  );
                  const options = { height: 400 }
                  const compressed = await imageThumbnail(base64Data, options);             
                  fs.writeFileSync(path, compressed,  {encoding: 'base64'});
                  models.dynamicSection.update(
                    {
                      image: normalImage,
                    },
                    { where: { id: val.id } }
                  );
                } catch (e) {
                  next(e);
                }
              }

              if (
                backgroundImage &&
                backgroundImage != "" &&
                backgroundImageExt &&
                backgroundImageExt != ""
              ) {
                const imageTitle = Date.now();
                const path =
                  "./public/admin/module/" +
                  storeId +
                  "/" +
                  imageTitle +
                  "." +
                  backgroundImageExt;
                const bgimage = imageTitle + "." + backgroundImageExt;
                try {
                  const imgdata = backgroundImage;
                  const base64Data = imgdata.replace(
                    /^data:([A-Za-z-+/]+);base64,/,
                    ""
                  );
                  const options = { height: 600 }
                  const compressed = await imageThumbnail(base64Data, options);             
                  fs.writeFileSync(path, compressed,  {encoding: 'base64'});
                  models.dynamicSection.update(
                    {
                      backgroundImage: bgimage,
                    },
                    { where: { id: val.id } }
                  );
                } catch (e) {
                  next(e);
                }
              }

              if (file && file != "" && fileExt && fileExt != "") {
                const fileTitle = Date.now();
                const path = "./public/admin/module/" + storeId + "/" + fileTitle + "." + fileExt;
                const normalfile = fileTitle + "." + fileExt;
                try {
                  const imgdata = file;
                  const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/,"");           
                  fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
                  models.dynamicSection.update({ file: normalfile},{ where: { id: val.id } });
                } catch (e) {
                  next(e);
                }
              }

              const settingCount = await models.moduleSetting.count({
                where: { storeId: storeId },
              });
              if (settingCount > 0) {
                await models.moduleSetting
                  .update(
                    { lastUpdate: lastUpdate },
                    { where: { storeId: storeId } }
                  )
                  .then(() => {
                    console.log("Done");
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }

              return res.status(201).send({
                data: { success: true, message: "Successfully created" },
                errorNode: { errorCode: 0, errorMsg: "No Error" },
              });
            })
            .catch((err) => {
              console.log(err);
              return res.status(500).send({
                data: { success: false, message: "Something went wrong !" },
                errorNode: {
                  errorCode: 1,
                  errorMsg: "Internal server error",
                },
              });
            });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send({
            data: { success: false, message: "Something went wrong !" },
            errorNode: { errorCode: 1, errorMsg: "Internal server error" },
          });
        });
    } else {
      await models.dynamicSection
        .update(
          {
            storeId: storeId,
            moduleItemId: moduleItemId,
            title: title,
            sequence: sequence ? sequence : null,
            description: description,
            longDescription: longDescription,
            cssClass: cssClass,
            link: link,
            lug: slug,
            buttontext: buttontext,
            buttonlink: buttonlink,
            metaTitle: metaTitle,
            metaKeyword: metaKeyword,
            metaDescription: metaDescription,
          },
          { where: { id: updateId } }
        )
        .then(async () => {
          if (image && image != "" && imageExt && imageExt != "") {
            const sectionImage = await models.dynamicSection.findOne({
              attributes: ["image"],
              where: { id: updateId },
            });
            if (
              sectionImage.image &&
              sectionImage.image != "" &&
              sectionImage.image != null
            ) {
              if (
                fs.existsSync(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    sectionImage.image
                )
              ) {
                fs.unlink(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    sectionImage.image,
                  (err) => {
                    if (err) throw err;
                    console.log("successfully deleted");
                  }
                );
              }
            }
            const imageTitle = Date.now();
            const path =
              "./public/admin/module/" +
              storeId +
              "/" +
              imageTitle +
              "." +
              imageExt;
            const normalImage = imageTitle + "." + imageExt;
            try {
              const imgdata = image;
              const base64Data = imgdata.replace(
                /^data:([A-Za-z-+/]+);base64,/,
                ""
              );
              const options = { height: 400 }
              const compressed = await imageThumbnail(base64Data, options);             
              fs.writeFileSync(path, compressed,  {encoding: 'base64'});
              models.dynamicSection.update(
                {
                  image: normalImage,
                },
                { where: { id: updateId } }
              );
            } catch (e) {
              next(e);
            }
          }

          if (
            backgroundImage &&
            backgroundImage != "" &&
            backgroundImageExt &&
            backgroundImageExt != ""
          ) {
            const bgimage = await models.dynamicSection.findOne({
              attributes: ["backgroundImage"],
              where: { id: updateId },
            });
            if (
              bgimage.backgroundImage &&
              bgimage.backgroundImage != "" &&
              bgimage.backgroundImage != null
            ) {
              if (
                fs.existsSync(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    bgimage.backgroundImage
                )
              ) {
                fs.unlink(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    bgimage.backgroundImage,
                  (err) => {
                    if (err) throw err;
                    console.log("successfully deleted");
                  }
                );
              }
            }
            const imageTitle = Date.now();
            const path =
              "./public/admin/module/" +
              storeId +
              "/" +
              imageTitle +
              "." +
              backgroundImageExt;
            const bg = imageTitle + "." + backgroundImageExt;
            try {
              const imgdata = backgroundImage;
              const base64Data = imgdata.replace(
                /^data:([A-Za-z-+/]+);base64,/,
                ""
              );
              const options = { height: 600 }
              const compressed = await imageThumbnail(base64Data, options);             
              fs.writeFileSync(path, compressed,  {encoding: 'base64'});
              models.dynamicSection.update(
                {
                  backgroundImage: bg,
                },
                { where: { id: updateId } }
              );
            } catch (e) {
              next(e);
            }
          }

          if (file && file != "" && fileExt && fileExt != "") {
            const existFile = await models.dynamicSection.findOne({ attributes: ["file"], where: { id: updateId }});
            if (existFile.file && existFile.file != "" && existFile.file != null) {
              if (fs.existsSync(__dirname + "/../../public/admin/module/" + storeId + "/" + existFile.file)) {
                fs.unlink(__dirname + "/../../public/admin/module/" + storeId + "/" +  existFile.file,
                  (err) => {
                    if (err) throw err;
                    console.log("successfully deleted");
                  }
                );
              }
            }

            const fileTitle = Date.now();
            const path = "./public/admin/module/" + storeId + "/" + fileTitle + "." + fileExt;
            const normalfile = fileTitle + "." + fileExt;
            try {
              const imgdata = file;
              const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/,"");           
              fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
              models.dynamicSection.update({ file: normalfile},{ where: { id: updateId } });
            } catch (e) {
              next(e);
            }
          }

          const settingCount = await models.moduleSetting.count({
            where: { storeId: storeId },
          });
          if (settingCount > 0) {
            await models.moduleSetting
              .update(
                { lastUpdate: lastUpdate },
                { where: { storeId: storeId } }
              )
              .then(() => {
                console.log("Done");
              })
              .catch((err) => {
                console.log(err);
              });
          }

          return res.status(201).send({
            data: { success: true, message: "Successfully updated" },
            errorNode: { errorCode: 0, errorMsg: "No Error" },
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send({
            data: { success: false, message: "Something went wrong !" },
            errorNode: { errorCode: 1, errorMsg: "Internal server error" },
          });
        });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: { errorCode: 1, errorMsg: "storeId is required" },
    });
  }
};

/**
 * Description:  Section Delete
 **/
exports.sectionDelete = async (req, res) => {
  const id = req.params.id;
  if (id && id != "" && id != null) {
    const value = await models.dynamicSection.findOne({
      attributes: ["storeId"],
      where: { id: id },
    });
    if (value) {
      const storeId = value.storeId;
      await models.dynamicSection
        .destroy({ where: { id: id } })
        .then(async () => {
          const settingCount = await models.moduleSetting.count({
            where: { storeId: storeId },
          });
          if (settingCount > 0) {
            await models.moduleSetting
              .update(
                { lastUpdate: lastUpdate },
                { where: { storeId: storeId } }
              )
              .then(() => {
                console.log("Done");
              })
              .catch((err) => {
                console.log(err);
              });
          }

          return res.status(200).send({
            data: { success: true, message: "Successfully deleted" },
            errorNode: { errorCode: 0, errorMsg: "No Error" },
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send({
            data: { success: false, message: "Something went wrong !" },
            errorNode: { errorCode: 1, errorMsg: "Internal server error" },
          });
        });
    } else {
      return res.status(200).send({
        data: { success: false, message: "Id not match" },
        errorNode: { errorCode: 1, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: { errorCode: 1, errorMsg: "Id is required" },
    });
  }
};

/**
 * Description:  Sub Section List
 **/
exports.subSectionList = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  const sectionId = req.body.data.sectionId || "";
  if (
    storeId &&
    storeId != "" &&
    storeId != null &&
    sectionId &&
    sectionId != "" &&
    sectionId != null
  ) {
    const subSection = await models.subSection.findAll({
      attributes: [
        "id",
        "title",
        "description",
        "shortText",
        "longText",
        "image",
        "backgroundImage",
        "slug",
        "status",
        "createdAt",
      ],
      where: { storeId: storeId, sectionId: sectionId },
      order: [["sequence", "ASC"]],
    });

    const list = subSection.map((m) => {
      return Object.assign(
        {},
        {
          id: m.id,
          sequence: m.sequence,
          title: m.title,
          description: m.description,
          shortText: m.shortText,
          longText: m.longText,
          slug: m.slug,
          status: m.status,
          createdAt: m.createdAt,
          image:
            m.image != "" && m.image != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                m.image
              : req.app.locals.baseurl + "admin/category/no_image.jpg",
          backgroundImage:
            m.backgroundImage != "" && m.backgroundImage != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                m.backgroundImage
              : req.app.locals.baseurl + "admin/category/no_image.jpg",
        }
      );
    });

    if (list.length > 0) {
      return res.status(200).send({
        data: { success: true, details: list },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    } else {
      return res.status(200).send({
        data: { success: true, details: [] },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: {
        errorCode: 1,
        errorMsg: "storeId and sectionId is required",
      },
    });
  }
};

/**
 * Description:  Sub Section View
 **/
exports.subSectionView = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  const id = req.body.data.id || "";
  if (storeId && storeId != "" && storeId != null && " != ") {
    const subSection = await models.subSection.findOne({
      where: { storeId: storeId, id: id },
    });

    const newSubSection = subSection.dataValues

    newSubSection.imageLink = subSection.image != "" && subSection.image != null ? req.app.locals.baseurl + "admin/module/" + storeId  + "/" + subSection.image : req.app.locals.baseurl + "admin/category/no_image.jpg",
    newSubSection.backgroundImageLink =  subSection.backgroundImage != "" && subSection.backgroundImage != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + subSection.backgroundImage : req.app.locals.baseurl + "admin/category/no_image.jpg",
    newSubSection.fileLink =  subSection.file != "" && subSection.file != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + subSection.file : req.app.locals.baseurl + "admin/category/no_image.jpg"

    if (newSubSection != "" || newSubSection != null) {
      return res.status(200).send({
        data: { success: true, details: newSubSection },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    } else {
      return res.status(200).send({
        data: { success: true, details: {} },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: "storeId and id is required" },
      errorNode: { errorCode: 1, errorMsg: "storeId and id is required" },
    });
  }
};

/**
 * Description:  Sub Section Create/Update
 **/
exports.subSectionCreate = async (req, res, next) => {
  const {
    updateId,
    storeId,
    sectionId,
    title,
    sequence,
    description,
    shortText,
    longText,
    metaTitle,
    metaKeyword,
    metaDescription,
    cssClass,
    link,
    buttontext,
    buttonlink,
    image,
    imageExt,
    backgroundImage,
    backgroundImageExt,
    file,
    fileExt,
    slug,
  } = req.body.data;

  if (storeId && storeId != "" && storeId != null) {
    if (!updateId) {
      await models.subSection
        .findAndCountAll({ where: { title: title, storeId: storeId } })
        .then(async (value) => {
          let slug2;
          if (value.count >= 1) {
            slug2 =
              title.toString().toLowerCase().replace(/\s+/g, "-") +
              "-" +
              value.count;
          } else {
            slug2 = title.toString().toLowerCase().replace(/\s+/g, "-");
          }
          await models.subSection
            .create({
              storeId: storeId,
              sectionId: sectionId,
              title: title,
              sequence: sequence ? sequence : null,
              description: description,
              shortText: shortText,
              longText: longText,
              cssClass: cssClass,
              link: link,
              buttontext: buttontext,
              buttonlink: buttonlink,
              slug: slug2,
              metaTitle: metaTitle,
              metaKeyword: metaKeyword,
              metaDescription: metaDescription,
            })
            .then(async (val) => {
              const dir = "./public/admin/module/" + storeId;
              console.log(dir);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
              }

              if (image && image != "" && imageExt && imageExt != "") {
                const imageTitle = Date.now();
                const path =
                  "./public/admin/module/" +
                  storeId +
                  "/" +
                  imageTitle +
                  "." +
                  imageExt;
                const normalImage = imageTitle + "." + imageExt;
                try {
                  const imgdata = image;
                  const base64Data = imgdata.replace(
                    /^data:([A-Za-z-+/]+);base64,/,
                    ""
                  );
                  const options = { height: 400 }
                  const compressed = await imageThumbnail(base64Data, options);             
                  fs.writeFileSync(path, compressed,  {encoding: 'base64'});
                  models.subSection.update(
                    {
                      image: normalImage,
                    },
                    { where: { id: val.id } }
                  );
                } catch (e) {
                  next(e);
                }
              }

              if (
                backgroundImage &&
                backgroundImage != "" &&
                backgroundImageExt &&
                backgroundImageExt != ""
              ) {
                const imageTitle = Date.now();
                const path =
                  "./public/admin/module/" +
                  storeId +
                  "/" +
                  imageTitle +
                  "." +
                  backgroundImageExt;
                const bgimage = imageTitle + "." + backgroundImageExt;
                try {
                  const imgdata = backgroundImage;
                  const base64Data = imgdata.replace(
                    /^data:([A-Za-z-+/]+);base64,/,
                    ""
                  );
                  const options = { height: 600 }
                  const compressed = await imageThumbnail(base64Data, options);             
                  fs.writeFileSync(path, compressed,  {encoding: 'base64'});
                  models.subSection.update(
                    {
                      backgroundImage: bgimage,
                    },
                    { where: { id: val.id } }
                  );
                } catch (e) {
                  next(e);
                }
              }

              if (file && file != "" && fileExt && fileExt != "") {
                const fileTitle = Date.now();
                const path = "./public/admin/module/" + storeId + "/" + fileTitle + "." + fileExt;
                const normalfile = fileTitle + "." + fileExt;
                try {
                  const imgdata = file;
                  const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/,"");           
                  fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
                  models.subSection.update({ file: normalfile},{ where: { id: val.id } });
                } catch (e) {
                  next(e);
                }
              }

              const settingCount = await models.moduleSetting.count({
                where: { storeId: storeId },
              });
              if (settingCount > 0) {
                await models.moduleSetting
                  .update(
                    { lastUpdate: lastUpdate },
                    { where: { storeId: storeId } }
                  )
                  .then(() => {
                    console.log("Done");
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }

              return res.status(201).send({
                data: { success: true, message: "Successfully created" },
                errorNode: { errorCode: 0, errorMsg: "No Error" },
              });
            })
            .catch((err) => {
              console.log(err);
              return res.status(500).send({
                data: { success: false, message: "Something went wrong !" },
                errorNode: {
                  errorCode: 1,
                  errorMsg: "Internal server error",
                },
              });
            });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send({
            data: { success: false, message: "Something went wrong !" },
            errorNode: { errorCode: 1, errorMsg: "Internal server error" },
          });
        });
    } else {
      await models.subSection
        .update(
          {
            storeId: storeId,
            sectionId: sectionId,
            title: title,
            sequence: sequence ? sequence : null,
            description: description,
            shortText: shortText,
            longText: longText,
            cssClass: cssClass,
            link: link,
            slug: slug,
            buttontext: buttontext,
            buttonlink: buttonlink,
            metaTitle: metaTitle,
            metaKeyword: metaKeyword,
            metaDescription: metaDescription,
          },
          { where: { id: updateId } }
        )
        .then(async () => {
          if (image && image != "" && imageExt && imageExt != "") {
            const sectionImage = await models.subSection.findOne({
              attributes: ["image"],
              where: { id: updateId },
            });
            if (
              sectionImage.image &&
              sectionImage.image != "" &&
              sectionImage.image != null
            ) {
              if (
                fs.existsSync(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    sectionImage.image
                )
              ) {
                fs.unlink(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    sectionImage.image,
                  (err) => {
                    if (err) throw err;
                    console.log("successfully deleted");
                  }
                );
              }
            }
            const imageTitle = Date.now();
            const path =
              "./public/admin/module/" +
              storeId +
              "/" +
              imageTitle +
              "." +
              imageExt;
            const normalImage = imageTitle + "." + imageExt;
            try {
              const imgdata = image;
              const base64Data = imgdata.replace(
                /^data:([A-Za-z-+/]+);base64,/,
                ""
              );
              const options = { height: 400 }
              const compressed = await imageThumbnail(base64Data, options);             
              fs.writeFileSync(path, compressed,  {encoding: 'base64'});
              models.subSection.update(
                {
                  image: normalImage,
                },
                { where: { id: updateId } }
              );
            } catch (e) {
              next(e);
            }
          }

          if (
            backgroundImage &&
            backgroundImage != "" &&
            backgroundImageExt &&
            backgroundImageExt != ""
          ) {
            const bgimage = await models.subSection.findOne({
              attributes: ["backgroundImage"],
              where: { id: updateId },
            });
            if (
              bgimage.backgroundImage &&
              bgimage.backgroundImage != "" &&
              bgimage.backgroundImage != null
            ) {
              if (
                fs.existsSync(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    bgimage.backgroundImage
                )
              ) {
                fs.unlink(
                  __dirname +
                    "/../../public/admin/module/" +
                    storeId +
                    "/" +
                    bgimage.backgroundImage,
                  (err) => {
                    if (err) throw err;
                    console.log("successfully deleted");
                  }
                );
              }
            }
            const imageTitle = Date.now();
            const path =
              "./public/admin/module/" +
              storeId +
              "/" +
              imageTitle +
              "." +
              backgroundImageExt;
            const bg = imageTitle + "." + backgroundImageExt;
            try {
              const imgdata = backgroundImage;
              const base64Data = imgdata.replace(
                /^data:([A-Za-z-+/]+);base64,/,
                ""
              );
              const options = { height: 600 }
              const compressed = await imageThumbnail(base64Data, options);             
              fs.writeFileSync(path, compressed,  {encoding: 'base64'});
              models.subSection.update(
                {
                  backgroundImage: bg,
                },
                { where: { id: updateId } }
              );
            } catch (e) {
              next(e);
            }
          }

          if (file && file != "" && fileExt && fileExt != "") {
            const existFile = await models.subSection.findOne({ attributes: ["file"], where: { id: updateId }});
            if (existFile.file && existFile.file != "" && existFile.file != null) {
              if (fs.existsSync(__dirname + "/../../public/admin/module/" + storeId + "/" + existFile.file)) {
                fs.unlink(__dirname + "/../../public/admin/module/" + storeId + "/" +  existFile.file,
                  (err) => {
                    if (err) throw err;
                    console.log("successfully deleted");
                  }
                );
              }
            }

            const fileTitle = Date.now();
            const path = "./public/admin/module/" + storeId + "/" + fileTitle + "." + fileExt;
            const normalfile = fileTitle + "." + fileExt;
            try {
              const imgdata = file;
              const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/,"");           
              fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
              models.subSection.update({ file: normalfile},{ where: { id: updateId } });
            } catch (e) {
              next(e);
            }
          }

          const settingCount = await models.moduleSetting.count({
            where: { storeId: storeId },
          });
          if (settingCount > 0) {
            await models.moduleSetting
              .update(
                { lastUpdate: lastUpdate },
                { where: { storeId: storeId } }
              )
              .then(() => {
                console.log("Done");
              })
              .catch((err) => {
                console.log(err);
              });
          }

          return res.status(201).send({
            data: { success: true, message: "Successfully updated" },
            errorNode: { errorCode: 0, errorMsg: "No Error" },
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send({
            data: { success: false, message: "Something went wrong !" },
            errorNode: { errorCode: 1, errorMsg: "Internal server error" },
          });
        });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: { errorCode: 1, errorMsg: "storeId is required" },
    });
  }
};

/**
 * Description:  Sub Section Delete
 **/
exports.subSectionDelete = async (req, res) => {
  const id = req.params.id;
  if (id && id != "" && id != null) {
    const value = await models.subSection.findOne({
      attributes: ["storeId"],
      where: { id: id },
    });
    if (value) {
      const storeId = value.storeId;
      await models.subSection
        .destroy({ where: { id: id } })
        .then(async () => {
          const settingCount = await models.moduleSetting.count({
            where: { storeId: storeId },
          });
          if (settingCount > 0) {
            await models.moduleSetting
              .update(
                { lastUpdate: lastUpdate },
                { where: { storeId: storeId } }
              )
              .then(() => {
                console.log("Done");
              })
              .catch((err) => {
                console.log(err);
              });
          }

          return res.status(200).send({
            data: { success: true, message: "Successfully deleted" },
            errorNode: { errorCode: 0, errorMsg: "No Error" },
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send({
            data: { success: false, message: "Something went wrong !" },
            errorNode: { errorCode: 1, errorMsg: "Internal server error" },
          });
        });
    } else {
      return res.status(200).send({
        data: { success: false, message: "Id not match" },
        errorNode: { errorCode: 1, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: { errorCode: 1, errorMsg: "Id is required" },
    });
  }
};

/**
 * Description:  Module Details for Forntend
 **/
// exports.frontendModuleDetails = async (req, res) =>{
// 	const storeId =req.body.data.storeId || '';
// 	const slug =req.body.data.slug || '';
// 	if(storeId && storeId != '' && slug != '' && slug) {
//         const modules = await models.module.findAll({where: { storeId:storeId, slug:slug, status:'Active' }, include:[{model: models.moduleItem, required:false,where:{status:'Active'}, include:[{model: models.dynamicSection, required:false,where:{status:'Active'}, include:[{model: models.subSection, required:false, where:{status:'Active'}}]}]}], order: [[ models.moduleItem, models.dynamicSection, 'sequence', 'ASC']]})

//         const data = modules.map(m => {
//             return Object.assign({},{
//                 id : m.id,
//                 storeId : m.storeId,
//                 title : m.title,
//                 shortDescription : m.shortDescription,
//                 longDescription : m.longDescription,
//                 slug : m.slug,
//                 metaTitle : m.metaTitle,
//                 metaKeyword : m.metaKeyword,
//                 metaDescription : m.metaDescription,
//                 relavantIndustry : m.relavantIndustry,
//                 status : m.status,
//                 createdAt : m.createdAt,
//                 image: (m.image!='' && m.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+m.image : null,
//                 bannerImage : (m.bannerImage!='' && m.bannerImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+m.bannerImage : null,
//                 tumbImage : (m.tumbImage!='' && m.tumbImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+m.tumbImage : null,

//                 moduleItems: m.moduleItems.map(mi => {
//                     return Object.assign({},{
//                         id : mi.id,
//                         storeId : mi.storeId,
//                         moduleId: mi.moduleId,
//                         title : mi.title,
//                         shortDescription : mi.shortDescription,
//                         longDescription : mi.longDescription,
//                         slug : mi.slug,
//                         metaTitle : mi.metaTitle,
//                         metaKeyword : mi.metaKeyword,
//                         metaDescription : mi.metaDescription,
//                         status : mi.status,
//                         attr1 : mi.attr1,
//                         attr2 : mi.attr2,
//                         attr3 : mi.attr3,
//                         attr4 : mi.attr4,
//                         attr5 : mi.attr5,
//                         attr6 : mi.attr6,
//                         attr7 : mi.attr7,
//                         attr8 : mi.attr8,
//                         attr9 : mi.attr9,
//                         attr10 : mi.attr10,
//                         createdAt: mi.createdAt,
//                         image: (mi.image!='' && mi.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+mi.image : null,
//                         bannerImage : (mi.bannerImage!='' && mi.bannerImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+mi.bannerImage : null,
//                         tumbImage : (mi.tumbImage!='' && mi.tumbImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+mi.tumbImage : null,

//                         dynamicSections: mi.dynamicSections.map(section => {
//                             return Object.assign({},{
//                                 id : section.id,
//                                 storeId : section.storeId,
//                                 moduleId: section.moduleId,
//                                 moduleItemId: section.moduleItemId,
//                                 crossModuleId: section.crossModuleId,
//                                 title : section.title,
//                                 description : section.description,
//                                 slug : section.slug,
//                                 metaTitle : section.metaTitle,
//                                 metaKeyword : section.metaKeyword,
//                                 metaDescription : section.metaDescription,
//                                 buttonlink : section.buttonlink,
//                                 cssClass : section.cssClass,
//                                 link : section.link,
//                                 buttontext : section.buttontext,
//                                 status : section.status,
//                                 createdAt: section.createdAt,
//                                 image: (section.image!='' && section.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+section.image : null,
//                                 backgroundImage : (section.backgroundImage!='' && section.backgroundImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+section.backgroundImage : null,

//                                 subSections: section.subSections.map(sub => {
//                                     return Object.assign({},{
//                                         id : sub.id,
//                                         storeId : sub.storeId,
//                                         sectionId: sub.sectionId,
//                                         title : sub.title,
//                                         sequence : sub.sequence,
//                                         description : sub.description,
//                                         shortText : sub.shortText,
//                                         longText : sub.longText,
//                                         slug : sub.slug,
//                                         metaTitle : sub.metaTitle,
//                                         metaKeyword : sub.metaKeyword,
//                                         metaDescription : sub.metaDescription,
//                                         buttonlink : sub.buttonlink,
//                                         cssClass : sub.cssClass,
//                                         link : sub.link,
//                                         buttontext : sub.buttontext,
//                                         status : sub.status,
//                                         createdAt: sub.createdAt,
//                                         image: (sub.image!='' && sub.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sub.image : null,
//                                         backgroundImage : (sub.backgroundImage!='' && sub.backgroundImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sub.backgroundImage : null,
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//             })
//         })

//         if (data.length > 0) {
//             return res.status(200).send({ data:{success:true, details:data}, errorNode:{errorCode:0, errorMsg:"No Error"}})
//         } else {
//             return res.status(200).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"No Data Found"}})
//         }
// 	} else {
// 		return res.status(400).send({ data:{success:false, message:"storeId and slug is required"}, errorNode:{errorCode:1, errorMsg:"storeId and slug is required"}})
// 	}
// }

/**
 * Description:  Module Item Details for Forntend
 **/
// exports.frontendModuleItemDetails = async (req, res) =>{
// 	const storeId =req.body.data.storeId || '';
// 	const slug =req.body.data.slug || '';
// 	if(storeId && storeId != '' && slug != '' && slug) {
//         const moduleItems = await models.moduleItem.findAll({where: { storeId:storeId, slug:slug, status:'Active' }, include:[{model: models.dynamicSection, required:false,where:{status:'Active'}, include:[{model: models.subSection, required:false, where:{status:'Active'}}]}], order: [[ models.moduleItem, models.dynamicSection, 'sequence', 'ASC']]})

//         const data = moduleItems.map(mi => {
//             return Object.assign({},{
//                 id : mi.id,
//                 storeId : mi.storeId,
//                 moduleId: mi.moduleId,
//                 title : mi.title,
//                 shortDescription : mi.shortDescription,
//                 longDescription : mi.longDescription,
//                 slug : mi.slug,
//                 metaTitle : mi.metaTitle,
//                 metaKeyword : mi.metaKeyword,
//                 metaDescription : mi.metaDescription,
//                 status : mi.status,
//                 attr1 : mi.attr1,
//                 attr2 : mi.attr2,
//                 attr3 : mi.attr3,
//                 attr4 : mi.attr4,
//                 attr5 : mi.attr5,
//                 attr6 : mi.attr6,
//                 attr7 : mi.attr7,
//                 attr8 : mi.attr8,
//                 attr9 : mi.attr9,
//                 attr10 : mi.attr10,
//                 createdAt: mi.createdAt,
//                 image: (mi.image!='' && mi.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+mi.image : null,
//                 bannerImage : (mi.bannerImage!='' && mi.bannerImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+mi.bannerImage : null,
//                 tumbImage : (mi.tumbImage!='' && mi.tumbImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+mi.tumbImage : null,

//                 dynamicSections: mi.dynamicSections.map(section => {
//                     return Object.assign({},{
//                         id : section.id,
//                         storeId : section.storeId,
//                         moduleId: section.moduleId,
//                         moduleItemId: section.moduleItemId,
//                         crossModuleId: section.crossModuleId,
//                         title : section.title,
//                         description : section.description,
//                         slug : section.slug,
//                         metaTitle : section.metaTitle,
//                         metaKeyword : section.metaKeyword,
//                         metaDescription : section.metaDescription,
//                         buttonlink : section.buttonlink,
//                         cssClass : section.cssClass,
//                         link : section.link,
//                         buttontext : section.buttontext,
//                         status : section.status,
//                         createdAt: section.createdAt,
//                         image: (section.image!='' && section.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+section.image : null,
//                         backgroundImage : (section.backgroundImage!='' && section.backgroundImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+section.backgroundImage : null,

//                         subSections: section.subSections.map(sub => {
//                             return Object.assign({},{
//                                 id : sub.id,
//                                 storeId : sub.storeId,
//                                 sectionId: sub.sectionId,
//                                 title : sub.title,
//                                 sequence: sub.sequence,
//                                 description : sub.description,
//                                 shortText : sub.shortText,
//                                 longText : sub.longText,
//                                 slug : sub.slug,
//                                 metaTitle : sub.metaTitle,
//                                 metaKeyword : sub.metaKeyword,
//                                 metaDescription : sub.metaDescription,
//                                 buttonlink : sub.buttonlink,
//                                 cssClass : sub.cssClass,
//                                 link : sub.link,
//                                 buttontext : sub.buttontext,
//                                 status : sub.status,
//                                 createdAt: sub.createdAt,
//                                 image: (sub.image!='' && sub.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sub.image : null,
//                                 backgroundImage : (sub.backgroundImage!='' && sub.backgroundImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sub.backgroundImage : null,
//                             })
//                         })
//                     })
//                 })
//             })
//         })

//         if (data.length > 0) {
//             return res.status(200).send({ data:{success:true, details:data}, errorNode:{errorCode:0, errorMsg:"No Error"}})
//         } else {
//             return res.status(200).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"No Data Found"}})
//         }
// 	} else {
// 		return res.status(400).send({ data:{success:false, message:"storeId and slug is required"}, errorNode:{errorCode:1, errorMsg:"storeId and slug is required"}})
// 	}
// }

/**
 * Description:  Section Details for Forntend
 **/
// exports.frontendSectionDetails = async (req, res) =>{
// 	const storeId =req.body.data.storeId || '';
// 	const slug =req.body.data.slug || '';
// 	if(storeId && storeId != '' && slug != '' && slug) {
//         const sectionDetails = await models.dynamicSection.findOne({where: { storeId:storeId, slug:slug, status:'Active' }, include:[{model: models.subSection, required:false, where:{status:'Active'}}]})
//         if (sectionDetails != null && sectionDetails != '') {
//             if (sectionDetails.crossModuleId != null && sectionDetails.crossModuleId != '') {
//                 const modules = await models.module.findAll({where: { storeId:storeId, id:sectionDetails.crossModuleId, status:'Active' }, include:[{model: models.moduleItem, required:false,where:{status:'Active'}, include:[{model: models.dynamicSection, required:false,where:{status:'Active'}, include:[{model: models.subSection, required:false, where:{status:'Active'}}]}]}], order: [[ models.moduleItem, models.dynamicSection, 'sequence', 'ASC']]})

//                 let details = {}
//                 details.id = sectionDetails.id
//                 details.moduleId = sectionDetails.moduleId
//                 details.moduleItemId = sectionDetails.moduleItemId
//                 details.crossModuleId = sectionDetails.crossModuleId
//                 details.title = sectionDetails.title
//                 details.description = sectionDetails.description
//                 details.image = (sectionDetails.image!='' && sectionDetails.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sectionDetails.image : null
//                 details.backgroundImage = (sectionDetails.backgroundImage!='' && sectionDetails.backgroundImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sectionDetails.backgroundImage : null
//                 details.slug = sectionDetails.slug
//                 details.cssClass = sectionDetails.cssClass
//                 details.link = sectionDetails.link
//                 details.buttontext = sectionDetails.buttontext
//                 details.buttonlink = sectionDetails.buttonlink
//                 details.metaTitle = sectionDetails.metaTitle
//                 details.metaKeyword = sectionDetails.metaKeyword
//                 details.metaDescription = sectionDetails.metaDescription
//                 details.status = sectionDetails.status
//                 details.subSections = sectionDetails.subSections.map(sub => {
//                     return Object.assign({},{
//                         id : sub.id,
//                         storeId : sub.storeId,
//                         sectionId: sub.sectionId,
//                         title : sub.title,
//                         sequence: sub.sequence,
//                         description : sub.description,
//                         shortText : sub.shortText,
//                         longText : sub.longText,
//                         slug : sub.slug,
//                         metaTitle : sub.metaTitle,
//                         metaKeyword : sub.metaKeyword,
//                         metaDescription : sub.metaDescription,
//                         buttonlink : sub.buttonlink,
//                         cssClass : sub.cssClass,
//                         link : sub.link,
//                         buttontext : sub.buttontext,
//                         status : sub.status,
//                         createdAt: sub.createdAt,
//                         image: (sub.image!='' && sub.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sub.image : null,
//                         backgroundImage : (sub.backgroundImage!='' && sub.backgroundImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sub.backgroundImage : null,
//                     })
//                 })
//                 details.module =  modules.map(m => {
//                     return Object.assign({},{
//                         id : m.id,
//                         storeId : m.storeId,
//                         title : m.title,
//                         shortDescription : m.shortDescription,
//                         longDescription : m.longDescription,
//                         slug : m.slug,
//                         metaTitle : m.metaTitle,
//                         metaKeyword : m.metaKeyword,
//                         metaDescription : m.metaDescription,
//                         relavantIndustry : m.relavantIndustry,
//                         status : m.status,
//                         createdAt : m.createdAt,
//                         image: (m.image!='' && m.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+m.image : null,
//                         bannerImage : (m.bannerImage!='' && m.bannerImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+m.bannerImage : null,
//                         tumbImage : (m.tumbImage!='' && m.tumbImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+m.tumbImage : null,

//                         moduleItems: m.moduleItems.map(mi => {
//                             return Object.assign({},{
//                                 id : mi.id,
//                                 storeId : mi.storeId,
//                                 moduleId: mi.moduleId,
//                                 title : mi.title,
//                                 shortDescription : mi.shortDescription,
//                                 longDescription : mi.longDescription,
//                                 slug : mi.slug,
//                                 metaTitle : mi.metaTitle,
//                                 metaKeyword : mi.metaKeyword,
//                                 metaDescription : mi.metaDescription,
//                                 status : mi.status,
//                                 attr1 : mi.attr1,
//                                 attr2 : mi.attr2,
//                                 attr3 : mi.attr3,
//                                 attr4 : mi.attr4,
//                                 attr5 : mi.attr5,
//                                 attr6 : mi.attr6,
//                                 attr7 : mi.attr7,
//                                 attr8 : mi.attr8,
//                                 attr9 : mi.attr9,
//                                 attr10 : mi.attr10,
//                                 createdAt: mi.createdAt,
//                                 image: (mi.image!='' && mi.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+mi.image : null,
//                                 bannerImage : (mi.bannerImage!='' && mi.bannerImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+mi.bannerImage : null,
//                                 tumbImage : (mi.tumbImage!='' && mi.tumbImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+mi.tumbImage : null,

//                                 dynamicSections: mi.dynamicSections.map(section => {
//                                     return Object.assign({},{
//                                         id : section.id,
//                                         storeId : section.storeId,
//                                         moduleId: section.moduleId,
//                                         moduleItemId: section.moduleItemId,
//                                         crossModuleId: section.crossModuleId,
//                                         title : section.title,
//                                         description : section.description,
//                                         slug : section.slug,
//                                         metaTitle : section.metaTitle,
//                                         metaKeyword : section.metaKeyword,
//                                         metaDescription : section.metaDescription,
//                                         buttonlink : section.buttonlink,
//                                         cssClass : section.cssClass,
//                                         link : section.link,
//                                         buttontext : section.buttontext,
//                                         status : section.status,
//                                         createdAt: section.createdAt,
//                                         image: (section.image!='' && section.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+section.image : null,
//                                         backgroundImage : (section.backgroundImage!='' && section.backgroundImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+section.backgroundImage : null,

//                                         subSections: section.subSections.map(sub => {
//                                             return Object.assign({},{
//                                                 id : sub.id,
//                                                 storeId : sub.storeId,
//                                                 sectionId: sub.sectionId,
//                                                 title : sub.title,
//                                                 sequence: sub.sequence,
//                                                 description : sub.description,
//                                                 shortText : sub.shortText,
//                                                 longText : sub.longText,
//                                                 slug : sub.slug,
//                                                 metaTitle : sub.metaTitle,
//                                                 metaKeyword : sub.metaKeyword,
//                                                 metaDescription : sub.metaDescription,
//                                                 buttonlink : sub.buttonlink,
//                                                 cssClass : sub.cssClass,
//                                                 link : sub.link,
//                                                 buttontext : sub.buttontext,
//                                                 status : sub.status,
//                                                 createdAt: sub.createdAt,
//                                                 image: (sub.image!='' && sub.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sub.image : null,
//                                                 backgroundImage : (sub.backgroundImage!='' && sub.backgroundImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sub.backgroundImage : null,
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })

//                 return res.status(200).send({ data:{success:true, details:details}, errorNode:{errorCode:0, errorMsg:"No Error"}})
//             } else {
//                 let details2 = {}
//                 details2.id = sectionDetails.id
//                 details2.moduleId = sectionDetails.moduleId
//                 details2.moduleItemId = sectionDetails.moduleItemId
//                 details2.crossModuleId = sectionDetails.crossModuleId
//                 details2.title = sectionDetails.title
//                 details2.description = sectionDetails.description
//                 details2.image = (sectionDetails.image!='' && sectionDetails.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sectionDetails.image : null
//                 details2.backgroundImage = (sectionDetails.backgroundImage!='' && sectionDetails.backgroundImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sectionDetails.backgroundImage : null
//                 details2.slug = sectionDetails.slug
//                 details2.cssClass = sectionDetails.cssClass
//                 details2.link = sectionDetails.link
//                 details2.buttontext = sectionDetails.buttontext
//                 details2.buttonlink = sectionDetails.buttonlink
//                 details2.metaTitle = sectionDetails.metaTitle
//                 details2.metaKeyword = sectionDetails.metaKeyword
//                 details2.metaDescription = sectionDetails.metaDescription
//                 details2.status = sectionDetails.status
//                 details2.subSections = sectionDetails.subSections.map(sub => {
//                     return Object.assign({},{
//                         id : sub.id,
//                         storeId : sub.storeId,
//                         sectionId: sub.sectionId,
//                         title : sub.title,
//                         description : sub.description,
//                         shortText : sub.shortText,
//                         longText : sub.longText,
//                         slug : sub.slug,
//                         metaTitle : sub.metaTitle,
//                         metaKeyword : sub.metaKeyword,
//                         metaDescription : sub.metaDescription,
//                         buttonlink : sub.buttonlink,
//                         cssClass : sub.cssClass,
//                         link : sub.link,
//                         buttontext : sub.buttontext,
//                         status : sub.status,
//                         createdAt: sub.createdAt,
//                         image: (sub.image!='' && sub.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sub.image : null,
//                         backgroundImage : (sub.backgroundImage!='' && sub.backgroundImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sub.backgroundImage : null,
//                     })
//                 })

//                 return res.status(200).send({ data:{success:true, details:details2}, errorNode:{errorCode:0, errorMsg:"No Error"}})
//             }
//         } else {
//             return res.status(200).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"No Data Found"}})
//         }
// 	} else {
// 		return res.status(400).send({ data:{success:false, message:"storeId and slug is required"}, errorNode:{errorCode:1, errorMsg:"storeId and slug is required"}})
// 	}
// }

/**
 * Description:  Global Details
 **/
exports.globalDetails = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  const tableName = req.body.data.tableName || "";
  const slug = req.body.data.slug || "";
  if (
    storeId &&
    storeId != "" &&
    storeId != undefined &&
    tableName != "" &&
    tableName &&
    tableName != undefined
  ) {
    if (
      tableName == "module" ||
      tableName == "moduleItem" ||
      tableName == "dynamicSection" ||
      tableName == "subSection"
    ) {
      if (slug != "") {
        const details = await sequelize.query(
          `SELECT * FROM ${tableName} WHERE storeId = ${storeId} AND slug = '${slug}' AND status = 'Active'`,
          { type: sequelize.QueryTypes.SELECT }
        );

        if (details.length > 0) {
          return res.status(200).send({
            data: { success: true, details: details },
            errorNode: { errorCode: 0, errorMsg: "No Error" },
          });
        } else {
          return res.status(200).send({
            data: { success: false, details: [] },
            errorNode: { errorCode: 1, errorMsg: "No Data Found" },
          });
        }
      } else {
        const details = await sequelize.query(
          `SELECT * FROM ${tableName} WHERE storeId = ${storeId} AND status = 'Active'`,
          { type: sequelize.QueryTypes.SELECT }
        );

        if (details.length > 0) {
          return res.status(200).send({
            data: { success: true, details: details },
            errorNode: { errorCode: 0, errorMsg: "No Error" },
          });
        } else {
          return res.status(200).send({
            data: { success: false, details: [] },
            errorNode: { errorCode: 1, errorMsg: "No Data Found" },
          });
        }
      }
    } else {
      return res.status(400).send({
        data: { success: false, message: "Please provide a valid tableName" },
        errorNode: { errorCode: 1, errorMsg: "tableName not found" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, message: "storeId and tableName is required" },
      errorNode: {
        errorCode: 1,
        errorMsg: "storeId and tableName is required",
      },
    });
  }
};

/**
 * Description:  Module List for Forntend
 **/
// exports.frontendModule = async (req, res) =>{
// 	const storeId =req.body.data.storeId || '';
// 	const slug =req.body.data.slug || '';
// 	if(storeId && storeId != '' && slug != '' && slug) {
//         const menus = await models.menus.findOne({ attributes:['moduleId','pageName'],where: {storeId:storeId, slug:slug}})
//         if (menus) {
//             let modules
//             if (menus.moduleId != '') {
//                 const details = await models.module.findAll({where: { storeId:storeId, id:menus.moduleId, status:'Active' }, include:[{model: models.moduleItem, required:false,where:{status:'Active'}, order: [['sequence', 'ASC']], include:[{model: models.dynamicSection, required:false,where:{status:'Active'}, order: [['sequence', 'ASC']], include:[{model: models.subSection, required:false, where:{status:'Active'}}]}]}] })

//                 const data = details.map(m => {
//                     return Object.assign({},{
//                         id : m.id,
//                         storeId : m.storeId,
//                         title : m.title,
//                         shortDescription : m.shortDescription,
//                         longDescription : m.longDescription,
//                         slug : m.slug,
//                         metaTitle : m.metaTitle,
//                         metaKeyword : m.metaKeyword,
//                         metaDescription : m.metaDescription,
//                         relavantIndustry : m.relavantIndustry,
//                         status : m.status,
//                         createdAt : m.createdAt,
//                         image: (m.image!='' && m.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+m.image : null,
//                         bannerImage : (m.bannerImage!='' && m.bannerImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+m.bannerImage : null,
//                         tumbImage : (m.tumbImage!='' && m.tumbImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+m.tumbImage : null,

//                         moduleItems: m.moduleItems.map(mi => {
//                             return Object.assign({},{
//                                 id : mi.id,
//                                 storeId : mi.storeId,
//                                 moduleId: mi.moduleId,
//                                 title : mi.title,
//                                 shortDescription : mi.shortDescription,
//                                 longDescription : mi.longDescription,
//                                 slug : mi.slug,
//                                 metaTitle : mi.metaTitle,
//                                 metaKeyword : mi.metaKeyword,
//                                 metaDescription : mi.metaDescription,
//                                 status : mi.status,
//                                 attr1 : mi.attr1,
//                                 attr2 : mi.attr2,
//                                 attr3 : mi.attr3,
//                                 attr4 : mi.attr4,
//                                 attr5 : mi.attr5,
//                                 attr6 : mi.attr6,
//                                 attr7 : mi.attr7,
//                                 attr8 : mi.attr8,
//                                 attr9 : mi.attr9,
//                                 attr10 : mi.attr10,
//                                 createdAt: mi.createdAt,
//                                 image: (mi.image!='' && mi.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+mi.image : null,
//                                 bannerImage : (mi.bannerImage!='' && mi.bannerImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+mi.bannerImage : null,
//                                 tumbImage : (mi.tumbImage!='' && mi.tumbImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+mi.tumbImage : null,

//                                 dynamicSections: mi.dynamicSections.map(section => {
//                                     return Object.assign({},{
//                                         id : section.id,
//                                         storeId : section.storeId,
//                                         moduleId: section.moduleId,
//                                         moduleItemId: section.moduleItemId,
//                                         crossModuleId: section.crossModuleId,
//                                         title : section.title,
//                                         sequence: section.sequence,
//                                         description : section.description,
//                                         slug : section.slug,
//                                         metaTitle : section.metaTitle,
//                                         metaKeyword : section.metaKeyword,
//                                         metaDescription : section.metaDescription,
//                                         buttonlink : section.buttonlink,
//                                         cssClass : section.cssClass,
//                                         link : section.link,
//                                         buttontext : section.buttontext,
//                                         status : section.status,
//                                         createdAt: section.createdAt,
//                                         image: (section.image!='' && section.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+section.image : null,
//                                         backgroundImage : (section.backgroundImage!='' && section.backgroundImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+section.backgroundImage : null,

//                                         subSections: section.subSections.map(sub => {
//                                             return Object.assign({},{
//                                                 id : sub.id,
//                                                 storeId : sub.storeId,
//                                                 sectionId: sub.sectionId,
//                                                 title : sub.title,
//                                                 description : sub.description,
//                                                 shortText : sub.shortText,
//                                                 longText : sub.longText,
//                                                 slug : sub.slug,
//                                                 metaTitle : sub.metaTitle,
//                                                 metaKeyword : sub.metaKeyword,
//                                                 metaDescription : sub.metaDescription,
//                                                 buttonlink : sub.buttonlink,
//                                                 cssClass : sub.cssClass,
//                                                 link : sub.link,
//                                                 buttontext : sub.buttontext,
//                                                 status : sub.status,
//                                                 createdAt: sub.createdAt,
//                                                 image: (sub.image!='' && sub.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sub.image : null,
//                                                 backgroundImage : (sub.backgroundImage!='' && sub.backgroundImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sub.backgroundImage : null,
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })

//                 modules = data
//             } else {
//                 modules = []
//             }
//             if (modules.length > 0) {
//                 return res.status(200).send({ data:{success:true, pageName:menus.pageName, details:modules}, errorNode:{errorCode:0, errorMsg:"No Error"}})
//             } else {
//                 return res.status(200).send({ data:{success:false, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}})
//             }
//         } else {
//             return res.status(200).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"No Error"}})
//         }
// 	} else {
// 		return res.status(400).send({ data:{success:false, details:"storeId and slug is required"}, errorNode:{errorCode:1, errorMsg:"storeId and slug is required"}})
// 	}
// }

/**
 * Description:  Section sorting
 **/
exports.sectionSorting = async (req, res) => {
  const sequence = req.body.data.sequence;
  sequence.forEach(async (id, value) => {
    await models.dynamicSection.update(
      {
        sequence: value,
      },
      { where: { id: id } }
    );
  });
  return res.status(200).send({
    data: { success: true, message: "Sorting successful" },
    errorNode: { errorCode: 0, errorMsg: "No Error" },
  });
};

/**
 * Description:  Module status change
 **/
exports.moduleStatusChange = async (req, res) => {
  const storeId = req.body.data.storeId;
  const moduleId = req.body.data.moduleId;
  const status = req.body.data.status;
  if (
    storeId != "" &&
    storeId != null &&
    storeId != undefined &&
    moduleId != "" &&
    moduleId != null &&
    moduleId != undefined &&
    status != "" &&
    status != null &&
    status != undefined
  ) {
    await models.module
      .update({ status: status }, { where: { id: moduleId, storeId: storeId } })
      .then(async () => {
        return res.status(200).send({
          data: { success: true, message: "Successfully status changed" },
          errorNode: { errorCode: 0, errorMsg: "No Error" },
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          data: { success: false, message: "Something went wrong !" },
          errorNode: { errorCode: 1, errorMsg: "Internal server error" },
        });
      });
  } else {
    return res.status(400).send({
      data: {
        success: false,
        message: "storeId, moduleId and status is required",
      },
      errorNode: {
        errorCode: 1,
        errorMsg: "storeId, moduleId and status is required",
      },
    });
  }
};

/**
 * Description:  Module item status change
 **/
exports.moduleItemStatusChange = async (req, res) => {
  const storeId = req.body.data.storeId;
  const itemId = req.body.data.itemId;
  const status = req.body.data.status;
  if (
    storeId != "" &&
    storeId != null &&
    storeId != undefined &&
    itemId != "" &&
    itemId != null &&
    itemId != undefined &&
    status != "" &&
    status != null &&
    status != undefined
  ) {
    await models.moduleItem
      .update({ status: status }, { where: { id: itemId, storeId: storeId } })
      .then(async () => {
        return res.status(200).send({
          data: { success: true, message: "Successfully status changed" },
          errorNode: { errorCode: 0, errorMsg: "No Error" },
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          data: { success: false, message: "Something went wrong !" },
          errorNode: { errorCode: 1, errorMsg: "Internal server error" },
        });
      });
  } else {
    return res.status(400).send({
      data: {
        success: false,
        message: "storeId, itemId and status is required",
      },
      errorNode: {
        errorCode: 1,
        errorMsg: "storeId, itemId and status is required",
      },
    });
  }
};

/**
 * Description:  Section status change
 **/
exports.sectionStatusChange = async (req, res) => {
  const storeId = req.body.data.storeId;
  const sectionId = req.body.data.sectionId;
  const status = req.body.data.status;
  if (
    storeId != "" &&
    storeId != null &&
    storeId != undefined &&
    sectionId != "" &&
    sectionId != null &&
    sectionId != undefined &&
    status != "" &&
    status != null &&
    status != undefined
  ) {
    await models.dynamicSection
      .update(
        { status: status },
        { where: { id: sectionId, storeId: storeId } }
      )
      .then(async () => {
        return res.status(200).send({
          data: { success: true, message: "Successfully status changed" },
          errorNode: { errorCode: 0, errorMsg: "No Error" },
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          data: { success: false, message: "Something went wrong !" },
          errorNode: { errorCode: 1, errorMsg: "Internal server error" },
        });
      });
  } else {
    return res.status(400).send({
      data: {
        success: false,
        message: "storeId, sectionId and status is required",
      },
      errorNode: {
        errorCode: 1,
        errorMsg: "storeId, sectionId and status is required",
      },
    });
  }
};

/**
 * Description:  Sub Section status change
 **/
exports.subSectionStatusChange = async (req, res) => {
  const storeId = req.body.data.storeId;
  const subSectionId = req.body.data.subSectionId;
  const status = req.body.data.status;
  if (
    storeId != "" &&
    storeId != null &&
    storeId != undefined &&
    subSectionId != "" &&
    subSectionId != null &&
    subSectionId != undefined &&
    status != "" &&
    status != null &&
    status != undefined
  ) {
    await models.subSection
      .update(
        { status: status },
        { where: { id: subSectionId, storeId: storeId } }
      )
      .then(async () => {
        return res.status(200).send({
          data: { success: true, message: "Successfully status changed" },
          errorNode: { errorCode: 0, errorMsg: "No Error" },
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          data: { success: false, message: "Something went wrong !" },
          errorNode: { errorCode: 1, errorMsg: "Internal server error" },
        });
      });
  } else {
    return res.status(400).send({
      data: {
        success: false,
        message: "storeId, subSectionId and status is required",
      },
      errorNode: {
        errorCode: 1,
        errorMsg: "storeId, sectionId and status is required",
      },
    });
  }
};

exports.frontendModule = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  const slug = req.body.data.slug || "";
  if (storeId && storeId != "" && slug != "" && slug) {
    const menus = await models.menus.findOne({
      attributes: [
        "moduleId",
        "pageName",
        "moduleItemId",
        "dynamicSectionId",
        "subSectionId",
      ],
      where: { storeId: storeId, slug: slug },
    });
    if (menus) {
      // =========================================Module Start=======================================
      let modules;
      if (menus.moduleId != "") {
        const details = await models.module.findAll({
          where: { storeId: storeId, id: menus.moduleId, status: "Active" },
        });
        const data = [];
        if (details.length > 0) {
          for (let m of details) {
            const details2 = await models.moduleItem.findAll({
              where: { storeId: storeId, moduleId: m.id, status: "Active" },
              order: [["sequence", "ASC"]],
            });
            const moduleItems = [];
            if (details2.length > 0) {
              for (let mi of details2) {
                const details3 = await models.dynamicSection.findAll({
                  where: {
                    storeId: storeId,
                    moduleItemId: mi.id,
                    status: "Active",
                  },
                  order: [["sequence", "ASC"]],
                });
                const dynamicSections = [];
                if (details3.length > 0) {
                  for (let section of details3) {
                    const details4 = await models.subSection.findAll({
                      where: {
                        storeId: storeId,
                        sectionId: section.id,
                        status: "Active",
                      },
                      order: [["sequence", "ASC"]],
                    });
                    const subSections = details4.map((sub) => {
                      return Object.assign(
                        {},
                        {
                          id: sub.id,
                          storeId: sub.storeId,
                          sectionId: sub.sectionId,
                          sequence: sub.sequence,
                          title: sub.title,
                          description: sub.description,
                          shortText: sub.shortText,
                          longText: sub.longText,
                          slug: sub.slug,
                          metaTitle: sub.metaTitle,
                          metaKeyword: sub.metaKeyword,
                          metaDescription: sub.metaDescription,
                          buttonlink: sub.buttonlink,
                          cssClass: sub.cssClass,
                          link: sub.link,
                          buttontext: sub.buttontext,
                          status: sub.status,
                          createdAt: sub.createdAt,
                          image:
                            sub.image != "" && sub.image != null
                              ? req.app.locals.baseurl +
                                "admin/module/" +
                                storeId +
                                "/" +
                                sub.image
                              : null,
                          backgroundImage:
                            sub.backgroundImage != "" &&
                            sub.backgroundImage != null
                              ? req.app.locals.baseurl +
                                "admin/module/" +
                                storeId +
                                "/" +
                                sub.backgroundImage
                              : null,
                          file: sub.file != "" && sub.file != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + sub.file : null,
                        }
                      );
                    });

                    dynamicSections.push({
                      id: section.id,
                      storeId: section.storeId,
                      moduleId: section.moduleId,
                      moduleItemId: section.moduleItemId,
                      crossModuleId: section.crossModuleId,
                      title: section.title,
                      sequence: section.sequence,
                      description: section.description,
                      longDescription: section.longDescription,
                      slug: section.slug,
                      metaTitle: section.metaTitle,
                      metaKeyword: section.metaKeyword,
                      metaDescription: section.metaDescription,
                      buttonlink: section.buttonlink,
                      cssClass: section.cssClass,
                      link: section.link,
                      buttontext: section.buttontext,
                      status: section.status,
                      createdAt: section.createdAt,
                      image:
                        section.image != "" && section.image != null
                          ? req.app.locals.baseurl +
                            "admin/module/" +
                            storeId +
                            "/" +
                            section.image
                          : null,
                      backgroundImage:
                        section.backgroundImage != "" &&
                        section.backgroundImage != null
                          ? req.app.locals.baseurl +
                            "admin/module/" +
                            storeId +
                            "/" +
                            section.backgroundImage
                          : null,
                      file: section.file != "" && section.file != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + section.file : null,
                      subSections: subSections,
                    });
                  }
                }
                moduleItems.push({
                  id: mi.id,
                  storeId: mi.storeId,
                  moduleId: mi.moduleId,
                  title: mi.title,
                  sequence: mi.sequence,
                  shortDescription: mi.shortDescription,
                  longDescription: mi.longDescription,
                  slug: mi.slug,
                  metaTitle: mi.metaTitle,
                  metaKeyword: mi.metaKeyword,
                  metaDescription: mi.metaDescription,
                  status: mi.status,
                  attr1: mi.attr1,
                  attr2: mi.attr2,
                  attr3: mi.attr3,
                  attr4: mi.attr4,
                  attr5: mi.attr5,
                  attr6: mi.attr6,
                  attr7: mi.attr7,
                  attr8: mi.attr8,
                  attr9: mi.attr9,
                  attr10: mi.attr10,
                  createdAt: mi.createdAt,
                  image:
                    mi.image != "" && mi.image != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        mi.image
                      : null,
                  bannerImage:
                    mi.bannerImage != "" && mi.bannerImage != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        mi.bannerImage
                      : null,
                  tumbImage:
                    mi.tumbImage != "" && mi.tumbImage != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        mi.tumbImage
                      : null,
                  file:
                    mi.file != "" && mi.file != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        mi.file : null,
                  dynamicSections: dynamicSections,
                });
              }
            }
            data.push({
              id: m.id,
              storeId: m.storeId,
              title: m.title,
              shortDescription: m.shortDescription,
              longDescription: m.longDescription,
              slug: m.slug,
              metaTitle: m.metaTitle,
              metaKeyword: m.metaKeyword,
              metaDescription: m.metaDescription,
              relavantIndustry: m.relavantIndustry,
              status: m.status,
              createdAt: m.createdAt,
              image:
                m.image != "" && m.image != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    m.image
                  : null,
              bannerImage:
                m.bannerImage != "" && m.bannerImage != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    m.bannerImage
                  : null,
              tumbImage:
                m.tumbImage != "" && m.tumbImage != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    m.tumbImage
                  : null,
              moduleItems: moduleItems,
            });
          }
        }

        modules = data;
      } else {
        modules = [];
      }
      // =========================================Module End=======================================

      // =========================================Module Item Start=======================================
      let moduleItemDetails;
      if (menus.moduleItemId != "") {
        const details2 = await models.moduleItem.findAll({
          where: { storeId: storeId, id: menus.moduleItemId, status: "Active" },
          order: [["sequence", "ASC"]],
        });
        const moduleItems = [];
        if (details2.length > 0) {
          for (let mi of details2) {
            const details3 = await models.dynamicSection.findAll({
              where: {
                storeId: storeId,
                moduleItemId: mi.id,
                status: "Active",
              },
              order: [["sequence", "ASC"]],
            });
            const dynamicSections = [];
            if (details3.length > 0) {
              for (let section of details3) {
                const details4 = await models.subSection.findAll({
                  where: {
                    storeId: storeId,
                    sectionId: section.id,
                    status: "Active",
                  },
                  order: [["sequence", "ASC"]],
                });
                const subSections = details4.map((sub) => {
                  return Object.assign(
                    {},
                    {
                      id: sub.id,
                      storeId: sub.storeId,
                      sectionId: sub.sectionId,
                      sequence: sub.sequence,
                      title: sub.title,
                      description: sub.description,
                      shortText: sub.shortText,
                      longText: sub.longText,
                      slug: sub.slug,
                      metaTitle: sub.metaTitle,
                      metaKeyword: sub.metaKeyword,
                      metaDescription: sub.metaDescription,
                      buttonlink: sub.buttonlink,
                      cssClass: sub.cssClass,
                      link: sub.link,
                      buttontext: sub.buttontext,
                      status: sub.status,
                      createdAt: sub.createdAt,
                      image:
                        sub.image != "" && sub.image != null
                          ? req.app.locals.baseurl +
                            "admin/module/" +
                            storeId +
                            "/" +
                            sub.image
                          : null,
                      backgroundImage:
                        sub.backgroundImage != "" && sub.backgroundImage != null
                          ? req.app.locals.baseurl +
                            "admin/module/" +
                            storeId +
                            "/" +
                            sub.backgroundImage
                          : null,
                    }
                  );
                });

                dynamicSections.push({
                  id: section.id,
                  storeId: section.storeId,
                  moduleId: section.moduleId,
                  moduleItemId: section.moduleItemId,
                  crossModuleId: section.crossModuleId,
                  title: section.title,
                  sequence: section.sequence,
                  description: section.description,
                  longDescription: section.longDescription,
                  slug: section.slug,
                  metaTitle: section.metaTitle,
                  metaKeyword: section.metaKeyword,
                  metaDescription: section.metaDescription,
                  buttonlink: section.buttonlink,
                  cssClass: section.cssClass,
                  link: section.link,
                  buttontext: section.buttontext,
                  status: section.status,
                  createdAt: section.createdAt,
                  image:
                    section.image != "" && section.image != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        section.image
                      : null,
                  backgroundImage:
                    section.backgroundImage != "" &&
                    section.backgroundImage != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        section.backgroundImage
                      : null,
                  subSections: subSections,
                });
              }
            }
            moduleItems.push({
              id: mi.id,
              storeId: mi.storeId,
              moduleId: mi.moduleId,
              title: mi.title,
              sequence: mi.sequence,
              shortDescription: mi.shortDescription,
              longDescription: mi.longDescription,
              slug: mi.slug,
              metaTitle: mi.metaTitle,
              metaKeyword: mi.metaKeyword,
              metaDescription: mi.metaDescription,
              status: mi.status,
              attr1: mi.attr1,
              attr2: mi.attr2,
              attr3: mi.attr3,
              attr4: mi.attr4,
              attr5: mi.attr5,
              attr6: mi.attr6,
              attr7: mi.attr7,
              attr8: mi.attr8,
              attr9: mi.attr9,
              attr10: mi.attr10,
              createdAt: mi.createdAt,
              image:
                mi.image != "" && mi.image != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    mi.image
                  : null,
              bannerImage:
                mi.bannerImage != "" && mi.bannerImage != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    mi.bannerImage
                  : null,
              tumbImage:
                mi.tumbImage != "" && mi.tumbImage != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    mi.tumbImage
                  : null,
              file:
                mi.file != "" && mi.file != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    mi.file : null,
              dynamicSections: dynamicSections,
            });
          }
        }

        moduleItemDetails = moduleItems;
      } else {
        moduleItemDetails = [];
      }

      // =====================================Module Item End===========================================

      // =========================================Dynamic Section Start=======================================
      let dynamicSectionDetails;
      if (menus.dynamicSectionId != "") {
        const details3 = await models.dynamicSection.findAll({
          where: {
            storeId: storeId,
            id: menus.dynamicSectionId,
            status: "Active",
          },
          order: [["sequence", "ASC"]],
        });
        const dynamicSections = [];
        if (details3.length > 0) {
          for (let section of details3) {
            const details4 = await models.subSection.findAll({
              where: {
                storeId: storeId,
                sectionId: section.id,
                status: "Active",
              },
              order: [["sequence", "ASC"]],
            });
            const subSections = details4.map((sub) => {
              return Object.assign(
                {},
                {
                  id: sub.id,
                  storeId: sub.storeId,
                  sectionId: sub.sectionId,
                  sequence: sub.sequence,
                  title: sub.title,
                  description: sub.description,
                  shortText: sub.shortText,
                  longText: sub.longText,
                  slug: sub.slug,
                  metaTitle: sub.metaTitle,
                  metaKeyword: sub.metaKeyword,
                  metaDescription: sub.metaDescription,
                  buttonlink: sub.buttonlink,
                  cssClass: sub.cssClass,
                  link: sub.link,
                  buttontext: sub.buttontext,
                  status: sub.status,
                  createdAt: sub.createdAt,
                  image:
                    sub.image != "" && sub.image != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        sub.image
                      : null,
                  backgroundImage:
                    sub.backgroundImage != "" && sub.backgroundImage != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        sub.backgroundImage
                      : null,
                }
              );
            });

            dynamicSections.push({
              id: section.id,
              storeId: section.storeId,
              moduleId: section.moduleId,
              moduleItemId: section.moduleItemId,
              crossModuleId: section.crossModuleId,
              title: section.title,
              sequence: section.sequence,
              description: section.description,
              longDescription: section.longDescription,
              slug: section.slug,
              metaTitle: section.metaTitle,
              metaKeyword: section.metaKeyword,
              metaDescription: section.metaDescription,
              buttonlink: section.buttonlink,
              cssClass: section.cssClass,
              link: section.link,
              buttontext: section.buttontext,
              status: section.status,
              createdAt: section.createdAt,
              image:
                section.image != "" && section.image != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    section.image
                  : null,
              backgroundImage:
                section.backgroundImage != "" && section.backgroundImage != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    section.backgroundImage
                  : null,
              subSections: subSections,
            });
          }
        }

        dynamicSectionDetails = dynamicSections;
      } else {
        dynamicSectionDetails = [];
      }

      // =====================================Dynamic Section End===========================================

      // =========================================Dynamic Section Start=======================================
      let subSectionDetails;
      if (menus.subSectionId != "") {
        const details4 = await models.subSection.findAll({
          where: { storeId: storeId, id: menus.subSectionId, status: "Active" },
          order: [["sequence", "ASC"]],
        });
        const subSections = details4.map((sub) => {
          return Object.assign(
            {},
            {
              id: sub.id,
              storeId: sub.storeId,
              sectionId: sub.sectionId,
              sequence: sub.sequence,
              title: sub.title,
              description: sub.description,
              shortText: sub.shortText,
              longText: sub.longText,
              slug: sub.slug,
              metaTitle: sub.metaTitle,
              metaKeyword: sub.metaKeyword,
              metaDescription: sub.metaDescription,
              buttonlink: sub.buttonlink,
              cssClass: sub.cssClass,
              link: sub.link,
              buttontext: sub.buttontext,
              status: sub.status,
              createdAt: sub.createdAt,
              image:
                sub.image != "" && sub.image != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    sub.image
                  : null,
              backgroundImage:
                sub.backgroundImage != "" && sub.backgroundImage != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    sub.backgroundImage
                  : null,
            }
          );
        });

        subSectionDetails = subSections;
      } else {
        subSectionDetails = [];
      }

      // =====================================Dynamic Section End===========================================
      if (modules.length > 0) {
        return res.status(200).send({
          data: {
            success: true,
            pageName: menus.pageName,
            details: modules,
            moduleItems: moduleItemDetails,
            sections: dynamicSectionDetails,
            subSection: subSectionDetails,
          },
          errorNode: { errorCode: 0, errorMsg: "No Error" },
        });
      } else {
        return res.status(200).send({
          data: { success: false, details: [] },
          errorNode: { errorCode: 0, errorMsg: "No Error" },
        });
      }
    } else {
      return res.status(200).send({
        data: { success: false, details: "" },
        errorNode: { errorCode: 1, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: "storeId and slug is required" },
      errorNode: { errorCode: 1, errorMsg: "storeId and slug is required" },
    });
  }
};

exports.frontendModuleDetails = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  const slug = req.body.data.slug || "";
  if (storeId && storeId != "" && slug != "" && slug) {
    const details = await models.module.findAll({
      where: { storeId: storeId, slug: slug, status: "Active" },
    });

    const data = [];
    if (details.length > 0) {
      for (let m of details) {
        const details2 = await models.moduleItem.findAll({
          where: { storeId: storeId, moduleId: m.id, status: "Active" },
          order: [["sequence", "ASC"]],
        });
        const moduleItems = [];
        if (details2.length > 0) {
          for (let mi of details2) {
            const details3 = await models.dynamicSection.findAll({
              where: {
                storeId: storeId,
                moduleItemId: mi.id,
                status: "Active",
              },
              order: [["sequence", "ASC"]],
            });
            const dynamicSections = [];
            if (details3.length > 0) {
              for (let section of details3) {
                const details4 = await models.subSection.findAll({
                  where: {
                    storeId: storeId,
                    sectionId: section.id,
                    status: "Active",
                  },
                  order: [["sequence", "ASC"]],
                });
                const subSections = details4.map((sub) => {
                  return Object.assign(
                    {},
                    {
                      id: sub.id,
                      storeId: sub.storeId,
                      sectionId: sub.sectionId,
                      sequence: sub.sequence,
                      title: sub.title,
                      description: sub.description,
                      shortText: sub.shortText,
                      longText: sub.longText,
                      slug: sub.slug,
                      metaTitle: sub.metaTitle,
                      metaKeyword: sub.metaKeyword,
                      metaDescription: sub.metaDescription,
                      buttonlink: sub.buttonlink,
                      cssClass: sub.cssClass,
                      link: sub.link,
                      buttontext: sub.buttontext,
                      status: sub.status,
                      createdAt: sub.createdAt,
                      image:
                        sub.image != "" && sub.image != null
                          ? req.app.locals.baseurl +
                            "admin/module/" +
                            storeId +
                            "/" +
                            sub.image
                          : null,
                      backgroundImage:
                        sub.backgroundImage != "" && sub.backgroundImage != null
                          ? req.app.locals.baseurl +
                            "admin/module/" +
                            storeId +
                            "/" +
                            sub.backgroundImage
                          : null,
                      file: sub.file != "" && sub.file != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + sub.file : null,
                    }
                  );
                });

                dynamicSections.push({
                  id: section.id,
                  storeId: section.storeId,
                  moduleId: section.moduleId,
                  moduleItemId: section.moduleItemId,
                  crossModuleId: section.crossModuleId,
                  title: section.title,
                  sequence: section.sequence,
                  description: section.description,
                  longDescription: section.longDescription,
                  slug: section.slug,
                  metaTitle: section.metaTitle,
                  metaKeyword: section.metaKeyword,
                  metaDescription: section.metaDescription,
                  buttonlink: section.buttonlink,
                  cssClass: section.cssClass,
                  link: section.link,
                  buttontext: section.buttontext,
                  status: section.status,
                  createdAt: section.createdAt,
                  image:
                    section.image != "" && section.image != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        section.image
                      : null,
                  backgroundImage:
                    section.backgroundImage != "" &&
                    section.backgroundImage != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        section.backgroundImage
                      : null,
                  file: section.file != "" && section.file != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + section.file : null,
                  subSections: subSections,
                });
              }
            }
            moduleItems.push({
              id: mi.id,
              storeId: mi.storeId,
              moduleId: mi.moduleId,
              title: mi.title,
              sequence: mi.sequence,
              shortDescription: mi.shortDescription,
              longDescription: mi.longDescription,
              slug: mi.slug,
              metaTitle: mi.metaTitle,
              metaKeyword: mi.metaKeyword,
              metaDescription: mi.metaDescription,
              status: mi.status,
              attr1: mi.attr1,
              attr2: mi.attr2,
              attr3: mi.attr3,
              attr4: mi.attr4,
              attr5: mi.attr5,
              attr6: mi.attr6,
              attr7: mi.attr7,
              attr8: mi.attr8,
              attr9: mi.attr9,
              attr10: mi.attr10,
              createdAt: mi.createdAt,
              image:
                mi.image != "" && mi.image != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    mi.image
                  : null,
              bannerImage:
                mi.bannerImage != "" && mi.bannerImage != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    mi.bannerImage
                  : null,
              tumbImage:
                mi.tumbImage != "" && mi.tumbImage != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    mi.tumbImage
                  : null,
              file:
                mi.file != "" && mi.file != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    mi.file : null,
              dynamicSections: dynamicSections,
            });
          }
        }
        data.push({
          id: m.id,
          storeId: m.storeId,
          title: m.title,
          shortDescription: m.shortDescription,
          longDescription: m.longDescription,
          slug: m.slug,
          metaTitle: m.metaTitle,
          metaKeyword: m.metaKeyword,
          metaDescription: m.metaDescription,
          relavantIndustry: m.relavantIndustry,
          status: m.status,
          createdAt: m.createdAt,
          image:
            m.image != "" && m.image != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                m.image
              : null,
          bannerImage:
            m.bannerImage != "" && m.bannerImage != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                m.bannerImage
              : null,
          tumbImage:
            m.tumbImage != "" && m.tumbImage != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                m.tumbImage
              : null,
          moduleItems: moduleItems,
        });
      }
    }

    if (data.length > 0) {
      return res.status(200).send({
        data: { success: true, details: data },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    } else {
      return res.status(200).send({
        data: { success: false, details: [] },
        errorNode: { errorCode: 1, errorMsg: "No Data Found" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, message: "storeId and slug is required" },
      errorNode: { errorCode: 1, errorMsg: "storeId and slug is required" },
    });
  }
};

exports.frontendModuleItemDetails = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  const slug = req.body.data.slug || "";
  if (storeId && storeId != "" && slug != "" && slug) {
    const moduleItems = await models.moduleItem.findAll({
      where: { storeId: storeId, slug: slug, status: "Active" },
      order: [["sequence", "ASC"]],
    });

    const data = [];
    if (moduleItems.length > 0) {
      for (let mi of moduleItems) {
        const details3 = await models.dynamicSection.findAll({
          where: { storeId: storeId, moduleItemId: mi.id, status: "Active" },
          order: [["sequence", "ASC"]],
        });
        const dynamicSections = [];
        if (details3.length > 0) {
          for (let section of details3) {
            const details4 = await models.subSection.findAll({
              where: {
                storeId: storeId,
                sectionId: section.id,
                status: "Active",
              },
              order: [["sequence", "ASC"]],
            });
            const subSections = details4.map((sub) => {
              return Object.assign(
                {},
                {
                  id: sub.id,
                  storeId: sub.storeId,
                  sectionId: sub.sectionId,
                  sequence: sub.sequence,
                  title: sub.title,
                  description: sub.description,
                  shortText: sub.shortText,
                  longText: sub.longText,
                  slug: sub.slug,
                  metaTitle: sub.metaTitle,
                  metaKeyword: sub.metaKeyword,
                  metaDescription: sub.metaDescription,
                  buttonlink: sub.buttonlink,
                  cssClass: sub.cssClass,
                  link: sub.link,
                  buttontext: sub.buttontext,
                  status: sub.status,
                  createdAt: sub.createdAt,
                  image:
                    sub.image != "" && sub.image != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        sub.image
                      : null,
                  file:
                    sub.file != "" && sub.file != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        sub.file : null,
                  backgroundImage:
                    sub.backgroundImage != "" && sub.backgroundImage != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        sub.backgroundImage
                      : null,
                  file: sub.file != "" && sub.file != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + sub.file : null,
                }
              );
            });

            dynamicSections.push({
              id: section.id,
              storeId: section.storeId,
              moduleId: section.moduleId,
              moduleItemId: section.moduleItemId,
              crossModuleId: section.crossModuleId,
              title: section.title,
              sequence: section.sequence,
              description: section.description,
              longDescription: section.longDescription,
              slug: section.slug,
              metaTitle: section.metaTitle,
              metaKeyword: section.metaKeyword,
              metaDescription: section.metaDescription,
              buttonlink: section.buttonlink,
              cssClass: section.cssClass,
              link: section.link,
              buttontext: section.buttontext,
              status: section.status,
              createdAt: section.createdAt,
              image:
                section.image != "" && section.image != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    section.image
                  : null,
              backgroundImage:
                section.backgroundImage != "" && section.backgroundImage != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    section.backgroundImage
                  : null,
              file: section.file != "" && section.file != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + section.file : null,
              subSections: subSections,
            });
          }
        }
        data.push({
          id: mi.id,
          storeId: mi.storeId,
          moduleId: mi.moduleId,
          title: mi.title,
          sequence: mi.sequence,
          shortDescription: mi.shortDescription,
          longDescription: mi.longDescription,
          slug: mi.slug,
          metaTitle: mi.metaTitle,
          metaKeyword: mi.metaKeyword,
          metaDescription: mi.metaDescription,
          status: mi.status,
          attr1: mi.attr1,
          attr2: mi.attr2,
          attr3: mi.attr3,
          attr4: mi.attr4,
          attr5: mi.attr5,
          attr6: mi.attr6,
          attr7: mi.attr7,
          attr8: mi.attr8,
          attr9: mi.attr9,
          attr10: mi.attr10,
          createdAt: mi.createdAt,
          image:
            mi.image != "" && mi.image != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                mi.image
              : null,
          bannerImage:
            mi.bannerImage != "" && mi.bannerImage != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                mi.bannerImage
              : null,
          tumbImage:
            mi.tumbImage != "" && mi.tumbImage != null
              ? req.app.locals.baseurl +
                "admin/module/" +
                storeId +
                "/" +
                mi.tumbImage
              : null,
          dynamicSections: dynamicSections,
        });
      }
    }

    if (data.length > 0) {
      return res.status(200).send({
        data: { success: true, details: data },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    } else {
      return res.status(200).send({
        data: { success: false, details: [] },
        errorNode: { errorCode: 1, errorMsg: "No Data Found" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, message: "storeId and slug is required" },
      errorNode: { errorCode: 1, errorMsg: "storeId and slug is required" },
    });
  }
};

exports.frontendSubSectionDetails = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  const slug = req.body.data.slug || "";
  if (storeId && storeId != "" && slug != "" && slug) {
    const subSectionDetails = await models.subSection.findOne({
      where: { storeId: storeId, slug: slug, status: "Active" },
    });
    if (subSectionDetails != "" && subSectionDetails != null) {
      let details = {
        id: subSectionDetails.id,
        title: subSectionDetails.title,
        description: subSectionDetails.description,
        shortText: subSectionDetails.shortText,
        longText: subSectionDetails.longText,
        image:
          subSectionDetails.image != "" && subSectionDetails.image != null
            ? req.app.locals.baseurl +
              "admin/module/" +
              storeId +
              "/" +
              subSectionDetails.image
            : null,
        backgroundImage:
          subSectionDetails.backgroundImage != "" &&
          subSectionDetails.backgroundImage != null
            ? req.app.locals.baseurl +
              "admin/module/" +
              storeId +
              "/" +
              subSectionDetails.backgroundImage
            : null,
        file:
          subSectionDetails.file != "" && subSectionDetails.file != null
            ? req.app.locals.baseurl +
              "admin/module/" +
              storeId +
              "/" +
              subSectionDetails.file
            : null, 
        slug: subSectionDetails.slug,
        cssClass: subSectionDetails.cssClass,
        link: subSectionDetails.link,
        buttontext: subSectionDetails.buttontext,
        buttonlink: subSectionDetails.buttonlink,
        metaTitle: subSectionDetails.metaTitle,
        metaKeyword: subSectionDetails.metaKeyword,
        metaDescription: subSectionDetails.metaDescription,
        status: subSectionDetails.status,
      };
      return res.status(200).send({
        data: { success: true, details: details },
        errorNode: { errorCode: 0, errorMsg: "No error" },
      });
    } else {
      return res.status(200).send({
        data: { success: false, details: {} },
        errorNode: { errorCode: 1, errorMsg: "No data found" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, message: "storeId and slug is required" },
      errorNode: { errorCode: 1, errorMsg: "storeId and slug is required" },
    });
  }
};

exports.frontendSectionDetails = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  const slug = req.body.data.slug || "";
  if (storeId && storeId != "" && slug != "" && slug) {
    const sectionDetails = await models.dynamicSection.findOne({
      where: { storeId: storeId, slug: slug, status: "Active" },
      include: [
        {
          model: models.subSection,
          required: false,
          where: { status: "Active" },
        },
      ],
      order: [[models.subSection, "sequence", "ASC"]],
    });
    if (sectionDetails != null && sectionDetails != "") {
      if (
        sectionDetails.crossModuleId != null &&
        sectionDetails.crossModuleId != ""
      ) {
        const modules = await models.module.findAll({
          where: {
            storeId: storeId,
            id: sectionDetails.crossModuleId,
            status: "Active",
          },
        });
        const data = [];
        if (modules.length > 0) {
          for (let m of modules) {
            const details2 = await models.moduleItem.findAll({
              where: { storeId: storeId, moduleId: m.id, status: "Active" },
              order: [["sequence", "ASC"]],
            });
            const moduleItems = [];
            if (details2.length > 0) {
              for (let mi of details2) {
                const details3 = await models.dynamicSection.findAll({
                  where: {
                    storeId: storeId,
                    moduleItemId: mi.id,
                    status: "Active",
                  },
                  order: [["sequence", "ASC"]],
                });
                const dynamicSections = [];
                if (details3.length > 0) {
                  for (let section of details3) {
                    const details4 = await models.subSection.findAll({
                      where: {
                        storeId: storeId,
                        sectionId: section.id,
                        status: "Active",
                      },
                      order: [["sequence", "ASC"]],
                    });
                    const subSections = details4.map((sub) => {
                      return Object.assign(
                        {},
                        {
                          id: sub.id,
                          storeId: sub.storeId,
                          sectionId: sub.sectionId,
                          sequence: sub.sequence,
                          title: sub.title,
                          description: sub.description,
                          shortText: sub.shortText,
                          longText: sub.longText,
                          slug: sub.slug,
                          metaTitle: sub.metaTitle,
                          metaKeyword: sub.metaKeyword,
                          metaDescription: sub.metaDescription,
                          buttonlink: sub.buttonlink,
                          cssClass: sub.cssClass,
                          link: sub.link,
                          buttontext: sub.buttontext,
                          status: sub.status,
                          createdAt: sub.createdAt,
                          image:
                            sub.image != "" && sub.image != null
                              ? req.app.locals.baseurl +
                                "admin/module/" +
                                storeId +
                                "/" +
                                sub.image
                              : null,
                          backgroundImage:
                            sub.backgroundImage != "" &&
                            sub.backgroundImage != null
                              ? req.app.locals.baseurl +
                                "admin/module/" +
                                storeId +
                                "/" +
                                sub.backgroundImage
                              : null,
                          file: sub.file != "" && sub.file != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + sub.file : null,
                        }
                      );
                    });

                    dynamicSections.push({
                      id: section.id,
                      storeId: section.storeId,
                      moduleId: section.moduleId,
                      moduleItemId: section.moduleItemId,
                      crossModuleId: section.crossModuleId,
                      title: section.title,
                      sequence: section.sequence,
                      description: section.description,
                      longDescription: section.longDescription,
                      slug: section.slug,
                      metaTitle: section.metaTitle,
                      metaKeyword: section.metaKeyword,
                      metaDescription: section.metaDescription,
                      buttonlink: section.buttonlink,
                      cssClass: section.cssClass,
                      link: section.link,
                      buttontext: section.buttontext,
                      status: section.status,
                      createdAt: section.createdAt,
                      image:
                        section.image != "" && section.image != null
                          ? req.app.locals.baseurl +
                            "admin/module/" +
                            storeId +
                            "/" +
                            section.image
                          : null,
                      backgroundImage:
                        section.backgroundImage != "" &&
                        section.backgroundImage != null
                          ? req.app.locals.baseurl +
                            "admin/module/" +
                            storeId +
                            "/" +
                            section.backgroundImage
                          : null,
                      file: section.file != "" && section.file != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + section.file : null,
                      subSections: subSections,
                    });
                  }
                }
                moduleItems.push({
                  id: mi.id,
                  storeId: mi.storeId,
                  moduleId: mi.moduleId,
                  title: mi.title,
                  sequence: mi.sequence,
                  shortDescription: mi.shortDescription,
                  longDescription: mi.longDescription,
                  slug: mi.slug,
                  metaTitle: mi.metaTitle,
                  metaKeyword: mi.metaKeyword,
                  metaDescription: mi.metaDescription,
                  status: mi.status,
                  attr1: mi.attr1,
                  attr2: mi.attr2,
                  attr3: mi.attr3,
                  attr4: mi.attr4,
                  attr5: mi.attr5,
                  attr6: mi.attr6,
                  attr7: mi.attr7,
                  attr8: mi.attr8,
                  attr9: mi.attr9,
                  attr10: mi.attr10,
                  createdAt: mi.createdAt,
                  image:
                    mi.image != "" && mi.image != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        mi.image
                      : null,
                  bannerImage:
                    mi.bannerImage != "" && mi.bannerImage != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        mi.bannerImage
                      : null,
                  tumbImage:
                    mi.tumbImage != "" && mi.tumbImage != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        mi.tumbImage
                      : null,
                  file:
                    mi.file != "" && mi.file != null
                      ? req.app.locals.baseurl +
                        "admin/module/" +
                        storeId +
                        "/" +
                        mi.file : null,
                  dynamicSections: dynamicSections,
                });
              }
            }
            data.push({
              id: m.id,
              storeId: m.storeId,
              title: m.title,
              shortDescription: m.shortDescription,
              longDescription: m.longDescription,
              slug: m.slug,
              metaTitle: m.metaTitle,
              metaKeyword: m.metaKeyword,
              metaDescription: m.metaDescription,
              relavantIndustry: m.relavantIndustry,
              status: m.status,
              createdAt: m.createdAt,
              image:
                m.image != "" && m.image != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    m.image
                  : null,
              bannerImage:
                m.bannerImage != "" && m.bannerImage != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    m.bannerImage
                  : null,
              tumbImage:
                m.tumbImage != "" && m.tumbImage != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    m.tumbImage
                  : null,
              moduleItems: moduleItems,
            });
          }
        }

        let details = {};
        details.id = sectionDetails.id;
        details.moduleId = sectionDetails.moduleId;
        details.moduleItemId = sectionDetails.moduleItemId;
        details.crossModuleId = sectionDetails.crossModuleId;
        details.title = sectionDetails.title;
        details.description = sectionDetails.description;
        details.image =
          sectionDetails.image != "" && sectionDetails.image != null
            ? req.app.locals.baseurl +
              "admin/module/" +
              storeId +
              "/" +
              sectionDetails.image
            : null;
        details.backgroundImage =
          sectionDetails.backgroundImage != "" &&
          sectionDetails.backgroundImage != null
            ? req.app.locals.baseurl +
              "admin/module/" +
              storeId +
              "/" +
              sectionDetails.backgroundImage
            : null;
        details.file = sectionDetails.file != "" &&  sectionDetails.file != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + sectionDetails.file : null;
        details.slug = sectionDetails.slug;
        details.cssClass = sectionDetails.cssClass;
        details.link = sectionDetails.link;
        details.buttontext = sectionDetails.buttontext;
        details.buttonlink = sectionDetails.buttonlink;
        details.metaTitle = sectionDetails.metaTitle;
        details.metaKeyword = sectionDetails.metaKeyword;
        details.metaDescription = sectionDetails.metaDescription;
        details.status = sectionDetails.status;
        details.subSections = sectionDetails.subSections.map((sub) => {
          return Object.assign(
            {},
            {
              id: sub.id,
              storeId: sub.storeId,
              sectionId: sub.sectionId,
              title: sub.title,
              sequence: sub.sequence,
              description: sub.description,
              shortText: sub.shortText,
              longText: sub.longText,
              slug: sub.slug,
              metaTitle: sub.metaTitle,
              metaKeyword: sub.metaKeyword,
              metaDescription: sub.metaDescription,
              buttonlink: sub.buttonlink,
              cssClass: sub.cssClass,
              link: sub.link,
              buttontext: sub.buttontext,
              status: sub.status,
              createdAt: sub.createdAt,
              image:
                sub.image != "" && sub.image != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    sub.image
                  : null,
              backgroundImage:
                sub.backgroundImage != "" && sub.backgroundImage != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    sub.backgroundImage
                  : null,
              file: sub.file != "" && sub.file != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + sub.file : null,
            }
          );
        });
        details.module = data;

        return res.status(200).send({
          data: { success: true, details: details },
          errorNode: { errorCode: 0, errorMsg: "No Error" },
        });
      } else {
        let details5 = {};
        details5.id = sectionDetails.id;
        details5.moduleId = sectionDetails.moduleId;
        details5.moduleItemId = sectionDetails.moduleItemId;
        details5.crossModuleId = sectionDetails.crossModuleId;
        details5.title = sectionDetails.title;
        details5.description = sectionDetails.description;
        details5.longDescription = sectionDetails.longDescription,
        details5.image =
          sectionDetails.image != "" && sectionDetails.image != null
            ? req.app.locals.baseurl +
              "admin/module/" +
              storeId +
              "/" +
              sectionDetails.image
            : null;
        details5.backgroundImage =
          sectionDetails.backgroundImage != "" &&
          sectionDetails.backgroundImage != null
            ? req.app.locals.baseurl +
              "admin/module/" +
              storeId +
              "/" +
              sectionDetails.backgroundImage
            : null;
        details5.slug = sectionDetails.slug;
        details5.cssClass = sectionDetails.cssClass;
        details5.link = sectionDetails.link;
        details5.file = sectionDetails.file != "" &&  sectionDetails.file != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + sectionDetails.file : null;
        details5.buttontext = sectionDetails.buttontext;
        details5.buttonlink = sectionDetails.buttonlink;
        details5.metaTitle = sectionDetails.metaTitle;
        details5.metaKeyword = sectionDetails.metaKeyword;
        details5.metaDescription = sectionDetails.metaDescription;
        details5.status = sectionDetails.status;
        details5.subSections = sectionDetails.subSections.map((sub) => {
          return Object.assign(
            {},
            {
              id: sub.id,
              storeId: sub.storeId,
              sectionId: sub.sectionId,
              title: sub.title,
              description: sub.description,
              shortText: sub.shortText,
              longText: sub.longText,
              slug: sub.slug,
              metaTitle: sub.metaTitle,
              metaKeyword: sub.metaKeyword,
              metaDescription: sub.metaDescription,
              buttonlink: sub.buttonlink,
              cssClass: sub.cssClass,
              link: sub.link,
              buttontext: sub.buttontext,
              status: sub.status,
              createdAt: sub.createdAt,
              image:
                sub.image != "" && sub.image != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    sub.image
                  : null,
              file: sub.file != "" && sub.file != null ? req.app.locals.baseurl + "admin/module/" + storeId + "/" + sub.file : null,    
              backgroundImage:
                sub.backgroundImage != "" && sub.backgroundImage != null
                  ? req.app.locals.baseurl +
                    "admin/module/" +
                    storeId +
                    "/" +
                    sub.backgroundImage
                  : null,
            }
          );
        });

        return res.status(200).send({
          data: { success: true, details: details5 },
          errorNode: { errorCode: 0, errorMsg: "No Error" },
        });
      }
    } else {
      return res.status(200).send({
        data: { success: false, details: [] },
        errorNode: { errorCode: 1, errorMsg: "No Data Found" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, message: "storeId and slug is required" },
      errorNode: { errorCode: 1, errorMsg: "storeId and slug is required" },
    });
  }
};

exports.moduleNameList = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  if (storeId && storeId != "" && storeId != null) {
    const modules = await models.module.findAll({attributes: ["id","title"], where:{storeId:storeId}});

    if (modules.length > 0) {
      return res.status(200).send({
        data: { success: true, details: modules },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    } else {
      return res.status(200).send({
        data: { success: false, details: [] },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: { errorCode: 1, errorMsg: "storeId is required" },
    });
  }
};

exports.moduleItemNameList = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  if (storeId && storeId != "" && storeId != null) {
    const moduleItems = await models.moduleItem.findAll({attributes: ["id","title"], where:{storeId:storeId}});

    if (moduleItems.length > 0) {
      return res.status(200).send({
        data: { success: true, details: moduleItems },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    } else {
      return res.status(200).send({
        data: { success: false, details: [] },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: { errorCode: 1, errorMsg: "storeId is required" },
    });
  }
};

exports.dynamicSectionNameList = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  if (storeId && storeId != "" && storeId != null) {
    const dynamicSections = await models.dynamicSection.findAll({attributes: ["id","title"], where:{storeId:storeId}});

    if (dynamicSections.length > 0) {
      return res.status(200).send({
        data: { success: true, details: dynamicSections },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    } else {
      return res.status(200).send({
        data: { success: false, details: [] },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: { errorCode: 1, errorMsg: "storeId is required" },
    });
  }
};

exports.subSectionNameList = async (req, res) => {
  const storeId = req.body.data.storeId || "";
  if (storeId && storeId != "" && storeId != null) {
    const subSections = await models.subSection.findAll({attributes: ["id","title"], where:{storeId:storeId}});

    if (subSections.length > 0) {
      return res.status(200).send({
        data: { success: true, details: subSections },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    } else {
      return res.status(200).send({
        data: { success: false, details: [] },
        errorNode: { errorCode: 0, errorMsg: "No Error" },
      });
    }
  } else {
    return res.status(400).send({
      data: { success: false, details: [] },
      errorNode: { errorCode: 1, errorMsg: "storeId is required" },
    });
  }
};