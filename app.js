// importing express
const express = require("express");

// creating express app instance
const app = express();


//* MIDDLEWARE :

// this parses data submitted through forms generally.
app.use(express.urlencoded({ extended:true }));
// this parses data submitted in json format.
app.use(express.json());

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
app.get("/", (req, res) => {
    console.log("Landed on home page");
    console.log(req.session);
    console.log(req.sessionID);

    // creating appropriate redirection url
    var RedirectionUrl;
    var LogoutUrl;

    // for dev env
    RedirectionUrl = "/auth/";
    LogoutUrl = "/auth/logout/";

   // Intro response with routes of all APIs.
    res.status(200).json({"response": "Welcome to BITS VACCINATION PORTAL", "auth_url": RedirectionUrl, "logout_url": LogoutUrl});
});


 // exporting express app and redis client
module.exports = {
    app,
    redisClient
};