// ########################### Express, Redis, Error and log handlers ###########################
// import configured express app and redis client
import { app } from './app';
import { redisClient } from './app';

// import logger and configs
import { logger } from './middeware/logger';
import * as config from './setup_project';

// import ERROR models and error handler
import * as ERROR from './middeware/error_models';
import { error_handler } from './middeware/error_handler';
// ########################### / ########################### / ###########################

// ########################### Mongo database and ORM configs ###########################
// import mongo ORM
import mongoose from 'mongoose';
//* mongoose settings for depraciation errors
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// setting db uri
const db_uri = `mongodb://MongoContainer:27017/Portal?authSource=admin`;
// ########################### / ########################### / ###########################

// ########################### Connecting to Cache and db, opening port ###########################
//* Configuring port
const port: string | number = process.env.PORT || 3000;

// Open port for node app, once redis and mongodb is connected
redisClient.on('connect', async function () {
    logger.info('Connected to redis successfully');

    try {
        //* Wait for connection to db
        await mongoose.connect(db_uri);
        logger.info('Connection to Mongodb Instance established');

        //* Opening port for express app.
        app.listen(port, () => {
            logger.info(
                {
                    SERVER_HOST: config.HOST,
                    PROJECT_ROOT_URL: config.PROJECT_ROOT_URL,
                    SENTRY_ERRORS_DSN: config.SENTRY_DSN,
                    CURRENT_TIMEZONE: config.TIMEZONE_CURRENT,
                    CONSTRAIN_EMAIL_DOMAINS: config.CONSTRAIN_EMAIL_DOMAINS,
                    ALLOWED_EMAIL_DOMAINS: config.ALLOWED_EMAIL_DOMAIN,
                },
                `Server started on port: ${port} with mode: ${process.env.npm_lifecycle_event}`,
            );
        });

        // Stop for any redis errors
        redisClient.on('error', function (err: Error) {
            const RedisError: ERROR.DBError = new ERROR.DBError(
                ERROR.HttpStatusCode.INTERNAL_SERVER_ERROR,
                'Could not establish a connection with redis',
                true,
            );
            RedisError.stack = err.stack;
            throw RedisError;
        });
    } catch (err) {
        if (!error_handler.isHandleAble(err)) throw err;
        await error_handler.handleError(err);
    }
});
// ########################### / ########################### /###########################
