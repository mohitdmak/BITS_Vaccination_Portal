// ########################### Express, Redis, Error and log handlers ###########################
// import configured express app and redis client
import { app } from "./app";
import { redisClient } from "./app";

// import logger
import { logger } from "./middeware/logger";

// import ERROR models and error handler
import * as ERROR from "./middeware/error_models";
import { error_handler } from "./middeware/error_handler";
// ########################### / ########################### / ###########################


// ########################### Mongo database and ORM configs ###########################
// import mongo ORM
import mongoose from "mongoose";
//* mongoose settings for depraciation errors
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// setting db uri
const db_uri: string = `mongodb://MongoContainer:27017/Portal?authSource=admin`;
// ########################### / ########################### / ###########################


// ########################### Connecting to Cache and db, opening port ###########################
//* Configuring port
let port: string | number = process.env.PORT || 3000; 

// Open port for node app, once redis and mongodb is connected
redisClient.on('connect', async function (){
    logger.info('Connected to redis successfully');
    
    try{
        //* Wait for connection to db
        await mongoose.connect(db_uri);
        logger.info('Connection to Mongodb Instance established');

        //* Opening port for express app.
        app.listen(port, () => {
            logger.info(`Server started on port: ${port} with mode: ${process.env.npm_lifecycle_event}`);
        });

        // Stop for any redis errors
        redisClient.on('error', function (err: Error) {
            var RedisError: ERROR.DBError = new ERROR.DBError(ERROR.HttpStatusCode.INTERNAL_SERVER_ERROR, 'Could not establish a connection with redis', true);
            RedisError.stack = err.stack;
            throw RedisError;
        });
    }
    catch(err){
        if(!error_handler.isHandleAble(err)) throw err; 
        await error_handler.handleError(err)
    }
});
// ########################### / ########################### /###########################
