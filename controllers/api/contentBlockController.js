const models = require("../../models");
/**
 * Description:  content block List
 * @param req
 * @param res user details with jwt token
 * Developer:Partha Mandal
 **/
exports.blockList = async (req, res, next) => {
  const storeId = req.body.data.storeId;

  if (storeId && storeId != "" && storeId != null) {
    await models.contentBlocks
      .findAll({ where: { storeId: storeId, parentId: null, status: "Yes" } })
      .then(async (contentblocks) => {
        let list = [];

        for (let content of contentblocks) {
          let subContent = await models.contentBlocks.findAll({
            where: { storeId: storeId, status: "Yes", parentId: content.id },
          });

          let contentBlock = {};

          contentBlock.id = content.dataValues.id;
          contentBlock.pageId = content.dataValues.pageId;
          contentBlock.group = content.dataValues.group;
          contentBlock.sequence = content.dataValues.sequence;
          contentBlock.title = content.dataValues.title;
          contentBlock.shortDescription = content.dataValues.shortDescription;
          contentBlock.description = content.dataValues.description;
          contentBlock.link = content.dataValues.link;
          contentBlock.videoLink = content.dataValues.videoLink;
          contentBlock.image =
            content.dataValues.image != "" || content.dataValues.image != null
              ? req.app.locals.baseurl +
                "admin/contentblock/image/" +
                content.dataValues.id +
                "/" +
                content.dataValues.image
              : "";

          contentBlock.subContentBlock = subContent.map((subContent) => {
            return Object.assign(
              {},
              {
                id: subContent.id,
                pageId: subContent.pageId,
                group: subContent.group,
                sequence: subContent.sequence,
                title: subContent.title,
                shortDescription: subContent.shortDescription,
                description: subContent.description,
                link: subContent.link,
                videoLink: subContent.videoLink,
                image:
                  subContent.image != "" || subContent.image != null
                    ? req.app.locals.baseurl +
                      "admin/contentblock/image/" +
                      subContent.id +
                      "/" +
                      subContent.image
                    : "",
              }
            );
          });

          list.push(contentBlock);
        }

        if (list.length > 0) {
          return res.status(200).send({
            data: { success: true, details: list },
            errorNode: { errorCode: 0, errorMsg: "Data not Found" },
          });
        } else {
          return res.status(200).send({
            data: { success: false, details: "" },
            errorNode: { errorCode: 0, errorMsg: "Data not Found" },
          });
        }
      })
      .catch((error) => {
        return res.status(200).send({
          data: { success: false, details: "" },
          errorNode: { errorCode: 1, errorMsg: "Data not Found" },
        });
      });
  } else {
    return res.status(200).send({
      data: { success: false, details: "" },
      errorNode: { errorCode: 0, errorMsg: "Pass the right payload" },
    });
  }
};
