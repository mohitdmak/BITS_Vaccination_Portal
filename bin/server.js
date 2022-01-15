"use strict";
// import configured express app and redis client
const http = require("http");
const app = require("./app").app;
const redisClient = require("./app").redisClient;
// import logger
const { logger } = require("./middeware/logger");
// import ERROR models and error handler
const ERROR = require("./middeware/error_models");
const { error_handler } = require("./middeware/error_handler");
// ########################### Mongo database and ORM configs ###########################
// import mongo ORM
const mongoose = require("mongoose");
//* mongoose settings for depraciation errors
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
// Importing Creds for Mongo access
const username = require("./config/mongo.js").MONGO_INITDB_ROOT_USERNAME;
const password = require("./config/mongo.js").MONGO_INITDB_ROOT_PASSWORD;
// setting db uri
const db_uri = `mongodb://MongoContainer:27017/Portal?authSource=admin`;
// mongoose connection
var db_connection;
// ########################### / ########################### / ###########################
// ########################### Connecting to Cache and db, opening port ###########################
//* Configuring port
let port = process.env.PORT || 3000;
// Open port for node app, once redis and mongodb is connected
redisClient.on('connect', async function () {
    logger.info('Connected to redis successfully');
    try {
        //* Wait for connection to db
        db_connection = await mongoose.connect(db_uri);
        logger.info("Connection to Mongodb Instance established");
        //* Opening port for express app.
        app.listen(port, () => {
            logger.info(`Server started on port: ${port} with mode: ${process.env.npm_lifecycle_event}`);
        });
    }
    catch (err) {
        if (error_handler.isHandleAble(err)) {
            await error_handler.handleError(err);
        }
        // Stop for any redis errors
        redisClient.on('error', function (err) {
            console.log('\n     Could not establish a connection with redis. \n' + err);
        });
        logger.error(err);
    }
});
// ########################### / ########################### /###########################
// export mongoose connection for configuration in app.js forest admin
module.exports = db_connection;
