const models = require("../../models");
/**
 * Description:  Banner List
 * @param req
 * @param res user details with jwt token
 * Developer:Partha Mandal
 **/
exports.bannerlist = async (req, res, next) => {
  const storeId = req.body.data.storeId;
  if (storeId && storeId != "" && storeId != null) {
    if (storeId == 18) {
      await models.banner
        .findAll({ where: { storeId: storeId, status: "Yes", type: 'slider' } })
        .then((value) => {
          const list = value.map((banner) => {
            return Object.assign(
              {},
              {
                id: banner.id,
                title: banner.title,
                shortDescription: banner.shortDescription,
                type: banner.type,
                image:
                  banner.image != "" && banner.image != null
                    ? req.app.locals.baseurl +
                      "admin/banner/image/" +
                      banner.id +
                      "/" +
                      banner.image
                    : "",
              }
            );
          });
          if (list.length > 0) {
            return res
              .status(200)
              .send({
                data: { success: true, details: list },
                errorNode: { errorCode: 0, errorMsg: "No Error" },
              });
          } else {
            return res
              .status(200)
              .send({
                data: { success: false, details: [] },
                errorNode: { errorCode: 0, errorMsg: "No Data Found" },
              });
          }
        })
        .catch((error) => {
          return res
            .status(500)
            .send({
              data: { success: false, details: [] },
              errorNode: { errorCode: 1, errorMsg: "Internal server error" },
            });
        });
    } else {
      await models.banner
        .findAll({ where: { storeId: storeId, status: "Yes" } })
        .then((value) => {
          const list = value.map((banner) => {
            return Object.assign(
              {},
              {
                id: banner.id,
                title: banner.title,
                shortDescription: banner.shortDescription,
                type: banner.type,
                image:
                  banner.image != "" && banner.image != null
                    ? req.app.locals.baseurl +
                      "admin/banner/image/" +
                      banner.id +
                      "/" +
                      banner.image
                    : "",
              }
            );
          });
          if (list.length > 0) {
            return res
              .status(200)
              .send({
                data: { success: true, details: list },
                errorNode: { errorCode: 0, errorMsg: "No Error" },
              });
          } else {
            return res
              .status(200)
              .send({
                data: { success: false, details: [] },
                errorNode: { errorCode: 0, errorMsg: "No Data Found" },
              });
          }
        })
        .catch((error) => {
          return res
            .status(500)
            .send({
              data: { success: false, details: [] },
              errorNode: { errorCode: 1, errorMsg: "Internal server error" },
            });
        });
    }
  } else {
    return res
      .status(400)
      .send({
        data: { success: false, details: "" },
        errorNode: { errorCode: 0, errorMsg: "StoreId is required" },
      });
  }
};
