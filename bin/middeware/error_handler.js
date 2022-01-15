"use strict";
// NOTE THAT FOLL NEEDS TO BE INSTALLED FOR TS : : : : : : : : : : npm install --save-dev @types/jquery
Object.defineProperty(exports, "__esModule", { value: true });
exports.error_handler = void 0;
// express server instance (returned by "app.listen()")
// import server from "../server";
// Pino logging instance
const logger_1 = require("./logger");
// Error Models
const error_models_1 = require("./error_models");
const error_models_2 = require("./error_models");
const error_models_3 = require("./error_models");
const error_models_4 = require("./error_models");
const error_models_5 = require("./error_models");
// Sentry tools
const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");
// MailHandler class
const mail_handler_1 = require("./mail_handler");
const app_js_1 = require("../app.js");
// sentry configuration and attaching project to assigned dsn
Sentry.init({
    dsn: "https://82f368f549ed43fbb3db4437ac2b2c79@o562134.ingest.sentry.io/5923095",
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app: app_js_1.app }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    tracesSampleRate: 1.0,
});
// request handler creates a separate execution context using domains, so that every transaction/span/breadcrumb is attached to its own Hub instance
app_js_1.app.use(Sentry.Handlers.requestHandler());
app_js_1.app.use(Sentry.Handlers.tracingHandler());
// error-handling class
class ErrorHandler {
    // properly log error
    logError(error) {
        if (error instanceof error_models_1.BaseError) {
            logger_1.logger.error({ "STACK": error.stack + "\n" }, `TYPE: ${error.constructor.name}; DESC: ${error.message}`);
        }
        else {
            logger_1.logger.error({ "STACK": error.stack + "\n" }, `UNCAUGHT EXEPTION: ${error.message}`);
        }
    }
    // send appropriate response
    handleResponse(error, response) {
        // form response data
        const res_data = { reason: error.name, description: error.message };
        switch (error.constructor.name) {
            // segregate responses
            case error_models_4.ClientError.name:
                response.status(error.httpCode).json(res_data);
                break;
            case error_models_3.APIError.name:
                response.status(error.httpCode).json(res_data);
                break;
            case error_models_2.DBError.name:
                response.status(error.httpCode).json(res_data);
                break;
            case error_models_1.BaseError.name:
                response.status(error.httpCode).json(res_data);
                break;
            default:
                response.json(res_data);
                break;
        }
    }
    // logging and clean up errors
    async handleError(error, response) {
        // capture@sentryDashboard
        Sentry.captureException(error);
        // mail severe errors to ADMIN
        if (!(error instanceof error_models_5.MailError) && error.severe) {
            var body = "";
            if (error instanceof error_models_3.APIError || error_models_2.DBError || error_models_4.ClientError) {
                body += `\nDescription : ${error.message}\n`;
            }
            body += `StackTrace : \n${error.stack}\n`;
            var message = {
                subject: error.name,
                body: body,
                html: ""
            };
            await mail_handler_1.mail_handler.sendEmail("mdmohitrc@gmail.com", message, null);
        }
        // leave a response
        if (typeof response !== undefined) {
            //@ts-ignore  FIXME
            this.handleResponse(error, response);
        }
        // leave logs
        this.logError(error);
    }
    // determine whether to handle or crash gracefully
    isHandleAble(error) {
        if (error instanceof error_models_1.BaseError || error_models_3.APIError || error_models_2.DBError || error_models_4.ClientError) {
            return error.isOperational;
        }
        return false;
    }
}
const error_handler_instance = new ErrorHandler();
// get the unhandled rejection and throw it to another fallback handler we already have.
process.on('unhandledRejection', (reason, promise) => {
    console.log("\n     Unhandled Promise Rejection caught by Error Handler Instance > > >\n");
    error_handler_instance.logError(reason);
    console.log("\n     Unhandled Promise Rejection logged < < <\n");
    throw reason;
});
// FIXME: Not functioning as expected
process.on('uncaughtException', async (error) => {
    console.log("\n     Unhandled Exception caught by Error Handler Instance > > >\n");
    error_handler_instance.logError(error);
    console.log("\n     Unhandled Exception logged < < <\n");
    if (!error_handler_instance.isHandleAble(error)) {
        console.log("Error not handleable, Gracefully shutting down now. . .\n");
        // process.exit(1);
    }
    else {
        await error_handler_instance.handleError(error);
        console.log("\n     Unhandled Exception handled < < <\n");
    }
});
// export handler class
exports.error_handler = error_handler_instance;
