// importing express
const express = require("express");

// creating express app instance
const app = express();

// import cors module
const cors = require("cors");


//* MIDDLEWARE :

// this parses data submitted through forms generally.
app.use(express.urlencoded({ extended:true }));
// this parses data submitted in json format.
app.use(express.json());

// cors settings
app.use(cors());

// run behind a proxy (nginx)
app.set('trust proxy', 1);

//* SESSION HANDLING :

// Requiring redis and module to use redis as Caching layer
const redis = require('redis');
const connectRedis = require('connect-redis');

// using express-session to store session data.
const Session = require("express-session");
// Creating express session
const SESSION_SECRET = require("./config/session-secret.js");

// Creating a redis store to store session data.
const RedisStore = connectRedis(Session)

//Configure redis client
var redis_host = "RedisSessionContainer";

// Importing configs
const redisClient = redis.createClient({
    host: redis_host,
    port: 7000,
});

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


//* ROUTES :

// Home route
app.get("/api", (req, res) => {
    console.log("Landed on home page");
    console.log(req.session);
    console.log(req.sessionID);

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
        "GET_PDF_student": "/api/student/get_pdf"
    });
});

// Auth route
const auth_routes = require("./routes/auth_routes.js");
app.use("/api/auth", auth_routes);

// Student Route
const student_routes = require("./routes/student_routes.js");
app.use("/api/student", student_routes);


 // exporting express app and redis client
module.exports = {
    app,
    redisClient
};
