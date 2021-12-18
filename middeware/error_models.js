"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.MailError = exports.ClientError = exports.DBError = exports.APIError = exports.BaseError = exports.HttpStatusCode = void 0;
// Most basic class of error, which other types will inherit
var BaseError = /** @class */ (function (_super) {
    __extends(BaseError, _super);
    // create constructor
    function BaseError(name, httpCode, description, isOperational, severe) {
        var _newTarget = this.constructor;
        var _this = 
        // create node error object, and prototype chain
        _super.call(this, description) || this;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        _this.name = name;
        _this.httpCode = httpCode;
        _this.isOperational = isOperational;
        _this.severe = severe;
        Error.captureStackTrace(_this);
        return _this;
    }
    return BaseError;
}(Error));
exports.BaseError = BaseError;
// app API error extending the base error class
var APIError = /** @class */ (function (_super) {
    __extends(APIError, _super);
    // create super object inside constructor
    function APIError(httpCode, description, severe) {
        var _this = this;
        var name = 'Internal Server API Error';
        var isOperational = true;
        _this = _super.call(this, name, httpCode, description, isOperational, severe) || this;
        return _this;
    }
    return APIError;
}(BaseError));
exports.APIError = APIError;
// database error extending the base error class
var DBError = /** @class */ (function (_super) {
    __extends(DBError, _super);
    // create super object inside constructor
    function DBError(httpCode, description, severe) {
        var _this = this;
        var name = 'Mongo Database Error';
        var isOperational = false;
        _this = _super.call(this, name, httpCode, description, isOperational, severe) || this;
        return _this;
    }
    return DBError;
}(BaseError));
exports.DBError = DBError;
// mailgun errors
var MailError = /** @class */ (function (_super) {
    __extends(MailError, _super);
    // create super object inside constructor
    function MailError(httpCode, description, severe) {
        var _this = this;
        var name = 'Mail Handler Error';
        var isOperational = false;
        _this = _super.call(this, name, httpCode, description, isOperational, severe) || this;
        return _this;
    }
    return MailError;
}(BaseError));
exports.MailError = MailError;
// client request errors
var ClientError = /** @class */ (function (_super) {
    __extends(ClientError, _super);
    // create super object inside constructor
    function ClientError(httpCode, description, severe) {
        var _this = this;
        var name = 'Client Request Error';
        var isOperational = true;
        _this = _super.call(this, name, httpCode, description, isOperational, severe) || this;
        return _this;
    }
    return ClientError;
}(BaseError));
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
