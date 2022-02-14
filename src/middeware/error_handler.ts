/* eslint @typescript-eslint/no-var-requires: "off" */

// NOTE THAT FOLL NEEDS TO BE INSTALLED FOR TS : : : : : : : : : : npm install --save-dev @types/jquery
// NOTE THAT :::::::::: FOLL TYPE DEFS MUST BE INSTALLED TO USE EXPRESS TYPES :  npm install @types/express

// express server instance (returned by "app.listen()")
// import server from "../server";

// Pino logging instance
import { logger } from './logger';

// import project config
import * as config from '../setup_project';

// Error Models
import { BaseError } from './error_models';
import { DBError } from './error_models';
import { APIError } from './error_models';
import { ClientError } from './error_models';
import { MailError } from './error_models';

// Sentry tools
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

// MailHandler class
import { mail_handler } from './mail_handler';
import { Message } from './mail_handler';

// express app
import * as express from 'express';
import { app } from '../app';
import pino from 'pino';

// sentry configuration and attaching project to assigned dsn
Sentry.init({
    dsn: config.SENTRY_DSN,
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
    reason: string;
    error: string;
};

// error-handling class
class ErrorHandler {
    // properly log error
    public logError(error: Error, child_logger?: pino.Logger): void {
        const error_logger = child_logger ? child_logger : logger;
        if (error instanceof ClientError) {
            error_logger.warn({ STACK: error.stack + '\n' }, `TYPE: ${error.constructor.name}; DESC: ${error.message}`);
        } else if (error instanceof BaseError) {
            error_logger.error(
                { STACK: error.stack + '\n' },
                `TYPE: ${error.constructor.name}; DESC: ${error.message}`,
            );
        } else {
            error_logger.error({ STACK: error.stack + '\n' }, `UNCAUGHT EXEPTION: ${error.message}`);
        }
    }

    // send appropriate response
    public handleResponse(error: Error, response: express.Response): void {
        // form response data
        const res_data: ExceptionResponse = { reason: error.name, error: error.message };
        switch (error.constructor.name) {
            // segregate responses
            case ClientError.name:
                response.status((error as any).httpCode).json(res_data);
                break;
            case APIError.name:
                response.status((error as any).httpCode).json(res_data);
                break;
            case DBError.name:
                logger.warn({ 'RESPONSE SENT': res_data }, `Automated response sent for ${error.constructor.name}`);
                response.status((error as any).httpCode).json(res_data);
                break;
            case BaseError.name:
                logger.warn(`Automated response sent for ${error.constructor.name}`);
                response.status((error as any).httpCode).json(res_data);
                break;
            default:
                response.json(res_data);
                break;
        }
    }

    // terminate server in case of unhandled rejection or uncaught ExceptionResponse
    // public terminateServer()

    // logging and clean up errors
    public async handleError(error: Error, response?: express.Response, child_logger?: pino.Logger): Promise<void> {
        // capture@sentryDashboard
        Sentry.captureException(error);
        // mail severe errors to ADMIN
        if (!(error instanceof MailError) && (error as any).severe) {
            let body = '';
            if (error instanceof APIError || DBError || ClientError) {
                body += `\nDescription : ${(error as any).message}\n`;
            }
            body += `StackTrace : \n${error.stack}\n`;
            const message: Message = {
                subject: error.name,
                body: body,
                html: '',
            };
            await mail_handler.sendEmail('mdmohitrc@gmail.com', message, null);
        }

        // leave a response
        if (typeof response !== undefined) {
            //@ts-ignore  FIXME
            this.handleResponse(error, response, child_logger);
        }
        // leave logs
        this.logError(error, child_logger);
    }

    // determine whether to handle or crash gracefully
    public isHandleAble(error: Error): boolean {
        if (error instanceof BaseError || APIError || DBError || ClientError) {
            return (error as any).isOperational;
        }
        return false;
    }
}

const error_handler_instance: ErrorHandler = new ErrorHandler();

// get the unhandled rejection and throw it to another fallback handler we already have.
process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
    console.log('\n     Unhandled Promise Rejection caught by Error Handler Instance > > >\n');
    error_handler_instance.logError(reason);
    console.log('\n     Unhandled Promise Rejection logged < < <\n');
    throw reason;
});

// FIXME: Not functioning as expected
process.on('uncaughtException', async (error: Error) => {
    console.log('\n     Unhandled Exception caught by Error Handler Instance > > >\n');
    error_handler_instance.logError(error);
    console.log('\n     Unhandled Exception logged < < <\n');
    if (!error_handler_instance.isHandleAble(error)) {
        console.log('Error not handleable, Gracefully shutting down now. . .\n');
        // process.exit(1);
    } else {
        await error_handler_instance.handleError(error);
        console.log('\n     Unhandled Exception handled < < <\n');
    }
});

// export handler class
export const error_handler = error_handler_instance;
