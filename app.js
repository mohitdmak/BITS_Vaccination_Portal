// import express
const express = require("express");
const app = express();


// ####################### SENTRY MIDDLEWARE ####################### 

// Sentry tracing tools
const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");

// sentry configuration and attaching project to assigned dsn
Sentry.init({
  dsn: "https://82f368f549ed43fbb3db4437ac2b2c79@o562134.ingest.sentry.io/5923095",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  tracesSampleRate: 1.0,
});

// request handler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// tracing Handler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());
// Sentry error handling middleware
// app.use(Sentry.Handlers.errorHandler());

// test endpoint for sentry
app.get("/api/debug-sentry", async function mainHandler(req, res) {
    error_handler = require("./middeware/error_handler").error_handler;
    const {APIError} = require("./middeware/error_models");
    const HttpStatusCode = require("./middeware/error_models").HttpStatusCode;
    try{
        throw new APIError(HttpStatusCode.UNAUTHORIZED_REQUEST, "Student needs to login first", false);
    }
    catch(e){
        if(error_handler.isHandleAble(e)){
            await error_handler.handleError(e, res);
        }
        else{
            console.log("DEBUG SENTRY");
        }
    }
});
// ########################### / ########################### / ###########################



// ########################### Request Parsing Middlewares ###########################

// this parses data submitted through forms generally.
app.use(express.urlencoded({ extended:true }));
// this parses data submitted in json format.
app.use(express.json());

// cors settings
const cors = require("cors");
app.use(cors());

// trust 'x-forwarded' headers set via nginx proxy
app.set('trust proxy', 1);

// multer errors
var multer = require('multer');
//app.use(function (err, req, res, next){
//    if(err instanceof multer.MulterError){
//        console.log(err);
//        res.status(500).send(err.code);
//    }
//    else{
//        console.log('\nError caught');
//        next();
//   }
//});
// ########################### / ########################### / ###########################



// ########################### Session Management ###########################

// redis cache layer to store session data on server
const redis = require('redis');
const connectRedis = require('connect-redis');

// using custom redis db as session store 
const Session = require("express-session");
const RedisStore = connectRedis(Session)

//Configure redis client
var redis_host = "RedisSessionContainer";
const redisClient = redis.createClient({
    host: redis_host,
    port: 7000,
});

// configure session settings for express
const SESSION_SECRET = require("./config/session-secret.js");
app.use(Session({
    // Session configurations
    name: "express-session-id",
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new RedisStore({ client: redisClient }),

    //! NOTE-THAT : Uncomment these settings for Production !!!
    cookie: {
        // secure: true, // Only allowing transmitting cookie over https
        // httpOnly: true, // Preventing client side JS from reading the cookie 
        // maxAge: 1000 * 60 * 10 // session max age in miliseconds
    }
}));

// ########################### / ########################### / ###########################



// ########################### NOTE : We have Migrated from forest admin to using our own Mongo admin ###########################
//* CONFIGURE FOREST ADMIN
// const Vaccine = require('./models/vaccine.js').Vaccine;
// const Student = require('./models/student.js');

// Import FOREST Module and db connection server
// const db_connection = require('./server.js');
// const forest = require('forest-express-mongoose');

 //allow cors for forest admin backend
//app.use('^(?!forest/?$).*', cors());

// //function to load forest configs
//async function load_forest(){
//    //* CONFIGURE FOREST ADMIN
//    const Vaccine = require('./models/vaccine.js').Vaccine;
//    const Student = require('./models/student.js');

//    // Import FOREST Module and db connection server
//    const db_connection = require('./server.js');
//    const forest = require('forest-express-mongoose');

//    try{
//        const forest_conf = await forest.init({
//            envSecret: process.env.FOREST_ENV_SECRET,
//            authSecret: process.env.FOREST_AUTH_SECRET,
//            objectMapping: Student,
//            connections: { default: db_connection }
//        });
//        // FOREST ADMIN configurations
//        app.use(forest_conf);
//        console.log("FOREST CONFIGURED");
//    }
//    catch(err){
//        console.log(err);
//    }
//}

//// load forest admin
//load_forest();
     
//// FOREST ADMIN configurations
// app.use(forest_conf);
// ########################### / ########################### / ###########################



// ########################### Api Endpoints ###########################

// Home route
app.get("/api", (req, res) => {
    console.log("Landed on home page");
    // console.log(req.session);
    // console.log(req.sessionID);

    // creating appropriate redirection url
    var RedirectionUrl;
    var LogoutUrl;

    // for dev env
    RedirectionUrl = "/api/auth/";
    LogoutUrl = "/api/auth/logout/";

   // Intro response with routes of all APIs.
    res.status(200).json({
        "response": "Welcome to BITS VACCINATION PORTAL",
        "GET_login_url": RedirectionUrl,
        "GET_logout_url": LogoutUrl,
        "GET_current_student_details_url": "/api/student/details",
        "POST_PDF_student": "/api/student/post_pdf",
        "GET_PDF_student": "/api/student/get_pdf",
        "GET_CONSENT_FORM": "/api/student/get_consent",
        "POST_CONSENT_FORM": "/api/student/post_consent"
    });
});

// Auth route
const auth_routes = require("./routes/auth_routes.js");
app.use("/api/auth", auth_routes);

// Student Route
const student_routes = require("./routes/student_routes.js");
app.use("/api/student", student_routes);

// Admin Route
const admin_routes = require("./routes/admin_routes.js");
app.use("/api/admin", admin_routes);
// ########################### / ########################### / ###########################



 // exporting express app and redis client
module.exports = {
    app,
    redisClient
};
