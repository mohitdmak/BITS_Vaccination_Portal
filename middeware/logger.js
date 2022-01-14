"use strict";
exports.__esModule = true;
exports.logger = void 0;
var pino_1 = require("pino");
var path_1 = require("path");
var error_log_file = (0, path_1.join)("/Portal/middeware", "error_logs");
var fatal_log_file = (0, path_1.join)("/Portal/middeware", "fatal_logs");
// create test logger instance
var test_logger = (0, pino_1["default"])({
    enabled: true,
    name: "debut_logger",
    // custom timestamp?
    // serializers?
    // pino-pretty?
    // browserAPI?
    customLevels: {
        info: 0,
        warn: 1,
        error: 2,
        fatal: 3
    },
    // prettyPrint: true,
    useOnlyCustomLevels: true,
    // prevents sensitive information from being logged
    redact: {
        paths: ['oauth.client_id', 'oauth.secret', 'QR'],
        censor: "**CENSORED**",
        remove: false
    },
    // intermediate custom functions to trigger while logging
    hooks: {
        logMethod: function (logArgs, logMethod, logLevel) {
            // logArgs.unshift(logArgs.pop());
            // console.log("Log Args: " + logArgs + "Log Level: " + logLevel + "\n"); 
            return logMethod.apply(this, logArgs);
        }
    },
    // format the shape of logs
    formatters: {
        level: function (label, number) {
            return { label: label };
        },
        bindings: function (bindings) {
            // return {"Process ID": bindings.pid, "Process Hostname": bindings.hostname};
            return {};
        },
        log: function (logObject) {
            return logObject;
        }
    },
    timestamp: pino_1.stdTimeFunctions.isoTime,
    nestedKey: "load",
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            // destination: error_log_file,
            levelFirst: true,
            destination: 1,
            hideObject: 0,
            singleLine: 0,
            ignore: "bindings"
        }
    }
});
// set log file dir and export
test_logger.info({ error_log_file: error_log_file }, "Logging Pino logs here . . .");
exports.logger = test_logger;
