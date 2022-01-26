// Most basic class of error, which other types will inherit
class BaseError extends Error {
    // set readonly fields
    public readonly name: string;
    public readonly httpCode: HttpStatusCode;
    public readonly isOperational: boolean;
    public readonly severe: boolean;

    // create constructor
    constructor(name: string, httpCode: HttpStatusCode, description: string, isOperational: boolean, severe: boolean) {
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

// app API error extending the base error class
class APIError extends BaseError {
    // create super object inside constructor
    constructor(httpCode: HttpStatusCode, description: string, severe: boolean) {
        const name = 'Internal Server API Error';
        const isOperational = true;
        super(name, httpCode, description, isOperational, severe);
    }
}

// database error extending the base error class
class DBError extends BaseError {
    // create super object inside constructor
    constructor(httpCode: HttpStatusCode, description: string, severe: boolean) {
        const name = 'Mongo Database Error';
        const isOperational = false;
        super(name, httpCode, description, isOperational, severe);
    }
}

// mailgun errors
class MailError extends BaseError {
    // create super object inside constructor
    constructor(httpCode: HttpStatusCode, description: string, severe: boolean) {
        const name = 'Mail Handler Error';
        const isOperational = false;
        super(name, httpCode, description, isOperational, severe);
    }
}

// client request errors
class ClientError extends BaseError {
    // create super object inside constructor
    constructor(httpCode: HttpStatusCode, description: string, severe: boolean) {
        const name = 'Client Request Error';
        const isOperational = true;
        super(name, httpCode, description, isOperational, severe);
    }
}

// creating enumeration for status codes
enum HttpStatusCode {
    OK = 200,
    CREATED_RESOURCE = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED_REQUEST = 401,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
    DB_ERROR = 504,
    MAIL_ERROR = 504,
}

// export all models
export { HttpStatusCode, BaseError, APIError, DBError, ClientError, MailError };
