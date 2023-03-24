var models = require("../../models");
var passport = require("passport");
var bcrypt = require("bcrypt-nodejs");
var cookieParser = require("cookie-parser");
var flash = require("connect-flash");
var formidable = require("formidable");
var multiparty = require("multiparty");
var bodyParser = require("body-parser");
var fetch = require("node-fetch");
var jwt = require("jsonwebtoken");
var SECRET = "nodescratch";
const paginate = require("express-paginate");
const hfunc = require("../../helpers/helper_functions");

exports.carpenterList = function (req, res, next) {
  var currPage = req.query.page ? req.query.page : 0;
  var limit = req.query.limit ? req.query.limit : 10;
  var offset = currPage != 0 ? currPage * limit - limit : 0;
  var token = req.session.token;
  jwt.verify(token, SECRET, function (err, decoded) {
    if (err) {
      res.status(200).send({
        data: { verified: false },
        errNode: { errMsg: "Invalid Token", errCode: "1" },
      });
    } else {
      existingItem = models.carpenter.findAndCountAll({
        order:[["id", "desc"]],
        limit: limit,
        offset: offset,
      });
      existingItem.then(function (results) {
        const itemCount = results.count;
        const pageCount = Math.ceil(results.count / limit);
        const previousPageLink = paginate.hasNextPages(req)(pageCount);
        const startItemsNumber =
          currPage == 0 || currPage == 1 ? 1 : (currPage - 1) * limit + 1;
        const endItemsNumber =
          pageCount == currPage || pageCount == 1
            ? itemCount
            : currPage * limit;
        console.log(startItemsNumber);
        console.log(endItemsNumber);

        // console.log(previousPageLink)
        return res.render("admin/carpenter/list", {
          title: "Carpenter",
          arrData: results.value,
          messages: req.flash("info"),
          arrData: results.rows,
          errors: req.flash("errors"),
          pageCount,
          itemCount,
          currentPage: currPage,
          previousPage: previousPageLink,
          startingNumber: startItemsNumber,
          endingNumber: endItemsNumber,
          pages: paginate.getArrayPages(req)(limit, pageCount, currPage),
        });
      });
    }
  });
};

