// ########################### Express, debug url ###########################
import express, { urlencoded, json } from 'express';
const app = express();

// import logger
import { logger } from './middeware/logger';
import { forward_errors } from './controllers/forward_errors';

// import centralized error handler FIXME: Circular Dependancy!
// error_handler = require("./middeware/error_handler").error_handler;
import * as ERROR from './middeware/error_models';

// NOTE: When you have 'type': 'module' in the package.json file, your source code should use import syntax. When you do not have, you should use require syntax.
// Adding 'type': 'module' to the package.json enables ES 6 modules.

// test endpoint for sentry
app.get('/api/debug-sentry', async function mainHandler(req, res) {
    // ~FIXME~: uncomment after fixing circular dep of handler
    try {
        throw new ERROR.APIError(ERROR.HttpStatusCode.UNAUTHORIZED_REQUEST, 'Test Error handling mech.', false);
    } catch (e) {
        forward_errors(e, e.httpCode, res);
    }
});
// ########################### / ########################### / ###########################

// ########################### Request Parsing Middlewares ###########################
// parse data through forms, and json formats
app.use(urlencoded({ extended: true }));
app.use(json());

// cors settings
import cors from 'cors';
app.use(cors());

// trust 'x-forwarded' headers set via nginx proxy
app.set('trust proxy', 1);

// multer errors FIXME: multer add to errorhandler
// import multer from 'multer';
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
import { createClient } from 'redis';
import connectRedis from 'connect-redis';

// using custom redis db as session store
import Session from 'express-session';
const RedisStore = connectRedis(Session);
const redis_host = 'RedisSessionContainer';
const redisClient = createClient({
    host: redis_host,
    port: 7000,
});

// configure session settings for express
import { SESSION_SECRET } from './config/session-secret';
app.use(
    Session({
        // Session configurations
        name: 'express-session-id',
        secret: SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        store: new RedisStore({ client: redisClient }),

        // NOTE: Uncomment these settings for Production !!!
        cookie: {
            // secure: true, // Only allowing transmitting cookie over https
            // httpOnly: true, // Preventing client side JS from reading the cookie
            // maxAge: 1000 * 60 * 10 // session max age in miliseconds
        },
    }),
);
// ########################### / ########################### / ###########################

// ########################### Api Endpoints ###########################
// Home route
app.get('/api', (req, res) => {
    console.log(process.env.API_ENV);
    logger.info({ SESSION_ID: req.sessionID }, 'Landed on API page');

    // NOTE: MOVE THESE TO CONFIGS.
    // creating appropriate redirection url
    const RedirectionUrl = '/api/auth/';
    const LogoutUrl = '/api/auth/logout/';

    // Intro response with routes of all APIs.
    res.status(200).json({
        response: 'Welcome to BITS VACCINATION PORTAL',
        GET_login_url: RedirectionUrl,
        GET_logout_url: LogoutUrl,
        GET_current_student_details_url: '/api/student/details',
        POST_PDF_student: '/api/student/post_pdf',
        GET_PDF_student: '/api/student/get_pdf',
        GET_CONSENT_FORM: '/api/student/get_consent',
        POST_CONSENT_FORM: '/api/student/post_consent',
    });
});

// Auth route
import auth_routes from './routes/auth_routes';
app.use('/api/auth', auth_routes);

// Student Route
import student_routes from './routes/student_routes';
app.use('/api/student', student_routes);

// Admin Route
import admin_router from './routes/admin_routes';
app.use('/api/admin', admin_router);
// ########################### / ########################### / ###########################

// exporting express app and redis client
export { app, redisClient };
