/* eslint @typescript-eslint/no-var-requires: "off" */

// auth requirements
import { google } from 'googleapis';
const ClientId = require('../config/oauth2-api-creds.json').web.client_id;
const ClientSecret = require('../config/oauth2-api-creds.json').web.client_secret;
// Req, Res types, logger, config set
import { RequestType, ResponseType } from '../controllers/student_controllers';
import { forward_errors } from '../controllers/forward_errors';
import { logger } from '../middeware/logger';
import * as config from '../setup_project';

// import error handlers
import * as ERROR from '../middeware/error_models';
import { HttpStatusCode } from '../middeware/error_models';
import { error_handler } from '../middeware/error_handler';
// Importing Student Model
import { Student, STUDENT } from '../models/student';

// Oauth2 client raw
const OAuth2 = google.auth.OAuth2;

// get allowed batches
const get_allow_access = require('./admin_controllers').default.get_allow_access;

/** Oauth2 client with api credentials */
function getOAuthClient() {
    return new OAuth2(ClientId, ClientSecret, config.REDIRECTION_URL);
}

/**
 * @api {GET} /api/auth/ Get Oauth2 Url
 * @apiDescription Obtaining auth url by specifying scopes
 * @apiGroup Oauth2 Authentication
 * @apiSuccess {url} redirect Redirect user to perform oauth2 at created url
 */
function getAuthUrl() {
    const oauth2Client: any = getOAuthClient();
    const url: string = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        // generate a url that asks permissions for email and profile scopes
        scope: config.OAUTH2_SCOPES, // we can pass it as string, if its a single scope
        // We ensure that only emails of BITS Pilani (Pilani Campus) are validated
        hd: config.ALLOWED_EMAIL_DOMAIN,
    });
    return url;
}

/** Obtaining token from Oauth2 client and setting it in sessions dict */
const set_tokens = async (req: RequestType, res: ResponseType): Promise<void> => {
    // setting new details in oauth2Client
    const oauth2Client: any = getOAuthClient();
    const session: any = req.session;
    const code: string = <string>req.query.code;
    // embedding tokens in session and oauth2Client
    oauth2Client.getToken(code, async function (err: Error, tokens: any): Promise<void> {
        try {
            // Now tokens contains an access_token and an optional refresh_token. Save them.
            if (!err) {
                oauth2Client.setCredentials(tokens);
                session['tokens'] = tokens;
                logger.info('Tokens set in session.');
                // getting student details
                const oauth2: any = google.oauth2({
                    auth: oauth2Client,
                    version: 'v2',
                });
                try {
                    const user: any = await oauth2.userinfo.get();
                    // set student data in session
                    await set_session_data(user, req, res);
                } catch (err) {
                    res.status(ERROR.HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: err.message });
                    throw new ERROR.BaseError(
                        'Oauth2 Failure.',
                        ERROR.HttpStatusCode.NOT_FOUND,
                        'Could not fetch oauth2 userinfo.',
                        false,
                        true,
                    );
                }
            } else {
                if (!error_handler.isHandleAble(err)) throw err;
                error_handler.handleError(err, res);
            }
        } catch (err) {
            forward_errors(err, HttpStatusCode.INTERNAL_SERVER_ERROR, res);
        }
    });
};

/** Sets logged in user's session data in redis cache */
const set_session_data = async (user: any, req: RequestType, res: ResponseType): Promise<void> => {
    try {
        // find for user in db
        let student: STUDENT | null = await Student.findOne({ email: user.data.email });
        student == null
            ? (student = await new Student({
                  name: user.data.name,
                  email: user.data.email,
                  pic: user.data.picture,
              }).save())
            : student;
        const allow_access: string[] = get_allow_access();
        const rollNo = String(student.email.substr(0, 5));
        // allow restricted batches and admins
        if (allow_access.indexOf(rollNo) > -1 || config.ADMINISTRATORS.indexOf(<string>student.email) > -1) {
            logger.info({ ALLOWED_BATCHES: allow_access, STUDENT_ROLL: rollNo }, 'Student allowed to login.');
            req.session['student'] = student;
        } else {
            logger.info({ ALLOWED_BATCHES: allow_access, STUDENT_ROLL: rollNo }, 'Student NOT allowed to login.');
        }
        res.redirect('/');
    } catch (err) {
        forward_errors(err, HttpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
};

/**
 * @api {GET} /api/auth/details/ Get Authenticated Details
 * @apiDescription The protected page - testing user details
 * @apiGroup Oauth2 Authentication
 * @apiSuccess {json} session_data All student data present on current express session
 */
const get_user_details = async (req: RequestType, res: ResponseType): Promise<void> => {
    // getting oauth2Client
    const oauth2Client = getOAuthClient();
    // check if tokens already set
    if (req.session['tokens']) {
        oauth2Client.setCredentials(req.session['tokens']);
        // getting user details
        const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
        try {
            const user: any = await oauth2.userinfo.get();
            logger.info({ STUDENT_ID: user.data }, 'Student data provided.');
            res.status(HttpStatusCode.OK).json({ user: user.data, session: req.session });
        } catch (err) {
            forward_errors(err, HttpStatusCode.INTERNAL_SERVER_ERROR, res);
        }
    } else if (process.env.npm_lifecycle_event === 'dev_local' && req.session['student']) {
        res.status(HttpStatusCode.OK).json(req.session['student']);
    } else {
        res.status(HttpStatusCode.UNAUTHORIZED_REQUEST).json({ error: 'No tokens found, Please login.' });
    }
};

/** Authentication landing page */
const get_auth_url = (req: RequestType, res: ResponseType): void => {
    try {
        const url: string = getAuthUrl();
        res.redirect(url);
    } catch (err) {
        forward_errors(err, HttpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
};

/**
 * @api {GET} /api/auth/logout/ Get Oauth2 logout
 * @apiDescription Oauth2 Logout Handler
 * @apiGroup Oauth2 Authentication
 * @apiSuccess {set} Destroy session data, remove cookies from session
 */
const get_logout = (req: RequestType, res: ResponseType): void => {
    // removing tokens from session
    req.session.destroy(function (err) {
        if (err) {
            if (!error_handler.isHandleAble(err)) throw err;
            error_handler.handleError(err, res);
        } else {
            res.status(HttpStatusCode.OK).redirect('/');
        }
    });
};

/**
 * @api {GET} /api/auth/login/ Get Oauth2 login
 * @apiDescription Oauth2 Login Handler
 * @apiGroup Oauth2 Authentication
 * @apiSuccess {set} Set cookies on current user session with required details for react client
 */
const get_login = async (req: RequestType, res: ResponseType): Promise<void> => {
    if (req.query.access_token && process.env.npm_lifecycle_event === 'dev_server') {
        //// getting oauth2Client
        const oauth2Client = getOAuthClient();
        oauth2Client.setCredentials({ access_token: <string>req.query.access_token });
        // getting user details
        const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
        const user: any = await oauth2.userinfo.get();
        // set student data in session
        await set_session_data(user, req, res);
    } else {
        res.status(HttpStatusCode.UNAUTHORIZED_REQUEST).json({ error: 'No access token found.' });
    }
};

export default {
    get_user_details,
    get_auth_url,
    set_tokens,
    get_logout,
    getOAuthClient,
    get_login,
};
