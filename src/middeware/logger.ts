import pino, { stdTimeFunctions } from 'pino';

import { join } from 'path';
const error_log_file = join('/Portal/src/middeware', 'error_logs');
// const fatal_log_file = join("/Portal/middeware", "fatal_logs");

// create test logger instance
const test_logger = pino(
    {
        enabled: true,
        name: 'debut_logger',
        // custom timestamp?
        // serializers?
        // pino-pretty?
        // browserAPI?
        customLevels: {
            info: 0,
            warn: 1,
            error: 2,
            fatal: 3,
        },
        // prettyPrint: true,
        useOnlyCustomLevels: true,
        // prevents sensitive information from being logged
        redact: {
            paths: ['oauth.client_id', 'oauth.secret', 'QR'],
            censor: '**CENSORED**', // specifies censored text instead of default "Redacted" mention or removing key itself
            remove: false,
        },
        // intermediate custom functions to trigger while logging
        hooks: {
            logMethod(logArgs: any[], logMethod: pino.LogFn, logLevel: number) {
                // logArgs.unshift(logArgs.pop());
                // console.log("Log Args: " + logArgs + "Log Level: " + logLevel + "\n");
                //@ts-ignore  FIXME
                return logMethod.apply(this, logArgs);
            },
        },
        // format the shape of logs
        formatters: {
            level(label: string, number: number) {
                return { label };
            },
            bindings(bindings: pino.Bindings) {
                // return {"Process ID": bindings.pid, "Process Hostname": bindings.hostname};
                return {};
            },
            log(logObject) {
                return logObject;
            },
        },
        timestamp: stdTimeFunctions.isoTime, // human readable timestamps
        nestedKey: 'load', // prefix as key to object provided to prevent conflict with properties with pino keys
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                // destination: error_log_file,
                levelFirst: true, // --levelFirst
                destination: 1,
                hideObject: 0,
                singleLine: 0,
                ignore: 'bindings', // --ignore
            },
        },
    }, // a destination parameter can be passed, if "transport" is not used in options parameter
    // pino.destination(error_log_file),
);

// set log file dir and export
test_logger.info({ error_log_file }, 'Logging Pino logs here . . .');
export const logger = test_logger;
