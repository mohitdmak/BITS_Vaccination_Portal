"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailError = exports.ClientError = exports.DBError = exports.APIError = exports.BaseError = exports.HttpStatusCode = void 0;
// Most basic class of error, which other types will inherit
class BaseError extends Error {
    // create constructor
    constructor(name, httpCode, description, isOperational, severe) {
        // create node error object, and prototype chain
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.httpCode = httpCode;
        this.isOperational = isOperational;
        this.severe = severe;
        Error.captureStackTrace(this);
    }
}
exports.BaseError = BaseError;
// app API error extending the base error class
class APIError extends BaseError {
    // create super object inside constructor
    constructor(httpCode, description, severe) {
        const name = 'Internal Server API Error';
        const isOperational = true;
        super(name, httpCode, description, isOperational, severe);
    }
}
exports.APIError = APIError;
// database error extending the base error class
class DBError extends BaseError {
    // create super object inside constructor
    constructor(httpCode, description, severe) {
        const name = 'Mongo Database Error';
        const isOperational = false;
        super(name, httpCode, description, isOperational, severe);
    }
}
exports.DBError = DBError;
// mailgun errors
class MailError extends BaseError {
    // create super object inside constructor
    constructor(httpCode, description, severe) {
        const name = 'Mail Handler Error';
        const isOperational = false;
        super(name, httpCode, description, isOperational, severe);
    }
}
exports.MailError = MailError;
// client request errors
class ClientError extends BaseError {
    // create super object inside constructor
    constructor(httpCode, description, severe) {
        const name = 'Client Request Error';
        const isOperational = true;
        super(name, httpCode, description, isOperational, severe);
    }
}
exports.ClientError = ClientError;
// creating enumeration for status codes
var HttpStatusCode;
(function (HttpStatusCode) {
    HttpStatusCode[HttpStatusCode["OK"] = 200] = "OK";
    HttpStatusCode[HttpStatusCode["CREATED_RESOURCE"] = 201] = "CREATED_RESOURCE";
    HttpStatusCode[HttpStatusCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatusCode[HttpStatusCode["UNAUTHORIZED_REQUEST"] = 401] = "UNAUTHORIZED_REQUEST";
    HttpStatusCode[HttpStatusCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatusCode[HttpStatusCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpStatusCode[HttpStatusCode["DB_ERROR"] = 504] = "DB_ERROR";
    HttpStatusCode[HttpStatusCode["MAIL_ERROR"] = 504] = "MAIL_ERROR";
})(HttpStatusCode || (HttpStatusCode = {}));
exports.HttpStatusCode = HttpStatusCode;
// module.exports = {
//     HttpStatusCode,
//     BaseError,
//     APIError,
//     DBError
// }
