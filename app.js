var express = require("express");
var path = require("path");
var favicon = require("static-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var flash = require("connect-flash");
// const toastr            = require('express-toastr');
var crypto = require("crypto");
var sess = require("express-session");
var Store = require("express-session").Store;
var bcrypt = require("bcrypt-nodejs");
var partials = require("express-partial");
var csrf = require("csurf");
var cors = require("cors");
var moment = require("moment");
var expressValidator = require("express-validator");
var models = require("./models");
///Express session store and expiration
var store = require("session-memory-store")(sess);
// var flash = require('connect-flash');
const paginate = require("express-paginate");
var fs = require('fs');
// const http = require('http');
var https = require('https');
const socketio = require('socket.io');
const {initChatProcess} = require("./controllers/api/chatController");

var app = express();
require('dotenv').config()

// const server = https.createServer(app);
// const io = socketio(server);

//app.configure(function() {
//app.use(express.cookieParser('keyboard cat'));
//app.use(express.session({ cookie: { maxAge: 60000 }}));
// app.use(flash());
//});

// keep this before all routes that will use pagination
app.use(paginate.middleware(10, 50));

app.set('port', process.env.PORT);

app.use(bodyParser.json({limit: '150mb'}));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
limit: '150mb',
extended: true
})); 


/**
 * The following 4 lines of code is required for HTTPS settings
 */                               
  var privateKey  = fs.readFileSync('/etc/letsencrypt/live/mawfoor.com/privkey.pem', 'utf8');
  var certificate = fs.readFileSync('/etc/letsencrypt/live/mawfoor.com/fullchain.pem', 'utf8'); //cert.pem
  var ca = fs.readFileSync('/etc/letsencrypt/live/mawfoor.com/cert.pem', 'utf8'); //cert.pem
 
  var credentials = {key: privateKey,cert:certificate,ca:ca};
  var httpsServer = https.createServer(credentials, app);


var server = httpsServer.listen(app.get("port"), function () {
  models.sequelize
    .sync()
    .then(() => {
      console.log("model load");
    })
    .catch(function (e) {
      throw new Error(e);
    });
  console.log("Express server listening on port " + app.get("port"));
  //debug('Express server listening on port ' + server.address().port);
});

const io = socketio(server);


///variable declare
app.locals.moment = moment;
app.locals.adminbaseurl = "https://mawfoor.com:" + app.get("port") + "/admin/";
app.locals.baseurl = "https://mawfoor.com:" + app.get("port") + "/";
app.locals.apiurl = "https://mawfoor.com:" + app.get("port") + "/api/v1/";
app.locals.frontendbaseurl = "http://mawfoor.com/";
// app.locals.frontendbaseurl = "http://45.79.126.242/";
///variable declare
// app.locals.moment = moment;
// app.locals.adminbaseurl ="https://wip.tezcommerce.com:" + app.get("port") + "/admin/";
// app.locals.baseurl = "https://wip.tezcommerce.com:" + app.get("port") + "/";
// app.locals.apiurl = "https://wip.tezcommerce.com:" + app.get("port") + "/api/v1/";
// app.locals.frontendbaseurl = "https://wip.tezcommerce.com/";
///variable declare

// view engine setup
app.set("views", path.join(__dirname, "views"));
//app.engine('ejs', require('ejs').renderFile);
app.engine("html", require("ejs").renderFile);
//app.set('view engine', 'ejs');
app.set("view engine", "html");

app.use(favicon(path.join(__dirname, "public", "favicon.png")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());
app.use(
  sess({
    name: "nodescratch",
    secret: "MYSECRETISVERYSECRET",
    store: new store({ expires: 60 * 60 * 1000, debug: true }),
    resave: true,
    saveUninitialized: true,
  })
);

const whitelist = ['http://smart-education.iudyog.com'];
const corsOptions = {
  origin: function (origin, callback) {
    if (true || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}
app.use(cors(corsOptions));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

///routes
var routes = require("./routes/index");
var api = require("./routes/api");
var authentication = require('./routes/auth')
var admin = require("./routes/admin");
///routes end

//app.use(cors());
app.options('*', cors())
app.use("/", routes);
app.use("/api/v1", api);
app.use("/admin", admin);
app.use("/auth", authentication);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {},
  });
});




app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator()); // Add this after the bodyParser middlewares!

io.listen(server, {
  cors: {
    origin: '*',
    credentials: true,
    'Access-Control-Allow-Credentials': true,
    secure: true,
    reconnectionDelay: 1000,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnection: true,
    reconnectionDelayMax: 5000,
    transports: ['websocket'],
    rejectUnauthorized: false,
    jsonp: false
  }
});

initChatProcess(io);

module.exports = app;
