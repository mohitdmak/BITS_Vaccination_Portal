// NOTE THAT FOLL NEEDS TO BE INSTALLED FOR TS : : : : : : : : : : npm install --save-dev @types/jquery

// Error Models
const {BaseError} = require("./error_models");
const {DBError} = require("./error_models");
const {APIError} = require("./error_models");
const {ClientError} = require("./error_models");
const {MailError} = require("./error_models");

// Sentry tools
const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");
import {logger} from '@sentry/utils';

// MailHandler class
import {mail_handler} from "./mail_handler";
import {Message} from "./mail_handler";

// NOTE THAT :::::::::: FOLL TYPE DEFS MUST BE INSTALLED TO USE EXPRESS TYPES :  npm install @types/express
// express app
import * as express from 'express';
const app = require("../app").app;

// sentry configuration and attaching project to assigned dsn
Sentry.init({
  dsn: "https://82f368f549ed43fbb3db4437ac2b2c79@o562134.ingest.sentry.io/5923095",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  tracesSampleRate: 1.0,
});
// request handler creates a separate execution context using domains, so that every transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Exception Response custom Datatype
type ExceptionResponse = {
    reason: string,
    description: string
}

// error-handling class
class ErrorHandler{
    // properly log error
    public logError(error: Error): void{
    }

    // send appropriate response
    public handleResponse(error: Error, response: express.Response): void{
        // form response data
        const res_data: ExceptionResponse = {reason: error.name, description: error.message};
        switch (error.constructor.name){
            // segregate responses
            case ClientError:
                response.status((error as any).HttpCode).json(res_data);
                break;
            case APIError:
                response.status((error as any).HttpCode).json(res_data);
                break;
            case DBError:
                response.status((error as any).HttpCode).json(res_data);
                break;
            case BaseError:
                response.status((error as any).HttpCode).json(res_data);
                break;
            default:
                response.json(res_data);
                break;
        }
    }

    // logging and clean up errors
    public async handleError(error: Error, response: express.Response): Promise<void>{
        // capture@sentryDashboard
        Sentry.captureException(error);
        // mail severe errors to ADMIN
        if(!(error instanceof MailError) && (error as any).severe){
            var body: string = "";
            if(error instanceof APIError || DBError || ClientError){
                body += `\nDescription : ${(error as any).message}\n`;
            }
            body += `StackTrace : \n${error.stack}\n`;
            var message: Message = {
                subject: error.name,
                body: body,
                html: ""
            }
            await mail_handler.sendEmail("mdmohitrc@gmail.com", message, null);
        }

        // leave logs
        this.logError(error);

        // leave a response
        this.handleResponse(error, response);
    }

    // determine whether to handle or crash gracefully
    public isHandleAble(error: Error): boolean{
        if(error instanceof BaseError || APIError || DBError || ClientError){
            return (error as any).isOperational;
        }
        return false;
    }
}

// export handler class
export const error_handler = new ErrorHandler();
