"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importStar(require("pino"));
const path_1 = require("path");
const error_log_file = (0, path_1.join)("/Portal/middeware", "error_logs");
const fatal_log_file = (0, path_1.join)("/Portal/middeware", "fatal_logs");
// create test logger instance
var test_logger = (0, pino_1.default)({
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
        logMethod(logArgs, logMethod, logLevel) {
            // logArgs.unshift(logArgs.pop());
            // console.log("Log Args: " + logArgs + "Log Level: " + logLevel + "\n"); 
            return logMethod.apply(this, logArgs);
        }
    },
    // format the shape of logs
    formatters: {
        level(label, number) {
            return { label };
        },
        bindings(bindings) {
            // return {"Process ID": bindings.pid, "Process Hostname": bindings.hostname};
            return {};
        },
        log(logObject) {
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
            ignore: "bindings", // --ignore
        }
    }
});
// set log file dir and export
test_logger.info({ error_log_file }, "Logging Pino logs here . . .");
exports.logger = test_logger;
