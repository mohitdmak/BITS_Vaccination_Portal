"use strict";
// NOTE THAT FOLL NEEDS TO BE INSTALLED FOR TS : : : : : : : : : : npm install --save-dev @types/jquery
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.error_handler = void 0;
// Error Models
var BaseError = require("./error_models").BaseError;
var DBError = require("./error_models").DBError;
var APIError = require("./error_models").APIError;
var ClientError = require("./error_models").ClientError;
var MailError = require("./error_models").MailError;
// Sentry tools
var Sentry = require('@sentry/node');
var Tracing = require("@sentry/tracing");
// MailHandler class
var mail_handler_1 = require("./mail_handler");
var app = require("../app").app;
// sentry configuration and attaching project to assigned dsn
Sentry.init({
    dsn: "https://82f368f549ed43fbb3db4437ac2b2c79@o562134.ingest.sentry.io/5923095",
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app: app }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    tracesSampleRate: 1.0
});
// request handler creates a separate execution context using domains, so that every transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
// error-handling class
var ErrorHandler = /** @class */ (function () {
    function ErrorHandler() {
    }
    // properly log error
    ErrorHandler.prototype.logError = function (error) {
    };
    // send appropriate response
    ErrorHandler.prototype.handleResponse = function (error, response) {
        // form response data
        var res_data = { reason: error.name, description: error.message };
        switch (error.constructor.name) {
            // segregate responses
            case ClientError:
                response.status(error.HttpCode).json(res_data);
                break;
            case APIError:
                response.status(error.HttpCode).json(res_data);
                break;
            case DBError:
                response.status(error.HttpCode).json(res_data);
                break;
            case BaseError:
                response.status(error.HttpCode).json(res_data);
                break;
            default:
                response.json(res_data);
                break;
        }
    };
    // logging and clean up errors
    ErrorHandler.prototype.handleError = function (error, response) {
        return __awaiter(this, void 0, void 0, function () {
            var body, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // capture@sentryDashboard
                        Sentry.captureException(error);
                        if (!(!(error instanceof MailError) && error.severe)) return [3 /*break*/, 2];
                        body = "";
                        if (error instanceof APIError || DBError || ClientError) {
                            body += "\nDescription : ".concat(error.message, "\n");
                        }
                        body += "StackTrace : \n".concat(error.stack, "\n");
                        message = {
                            subject: error.name,
                            body: body,
                            html: ""
                        };
                        return [4 /*yield*/, mail_handler_1.mail_handler.sendEmail("mdmohitrc@gmail.com", message, null)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        // leave logs
                        this.logError(error);
                        // leave a response
                        this.handleResponse(error, response);
                        return [2 /*return*/];
                }
            });
        });
    };
    // determine whether to handle or crash gracefully
    ErrorHandler.prototype.isHandleAble = function (error) {
        if (error instanceof BaseError || APIError || DBError || ClientError) {
            return error.isOperational;
        }
        return false;
    };
    return ErrorHandler;
}());
// export handler class
exports.error_handler = new ErrorHandler();
