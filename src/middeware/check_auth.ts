// import logger
import { logger } from './logger';
import { RequestType, ResponseType } from '../controllers/student_controllers';
// import error handlers
import * as ERROR from '../middeware/error_models';
import { error_handler } from '../middeware/error_handler';

const check_auth = async (req: RequestType, res: ResponseType, next) => {
    try {
        if (req.session['student']) {
            res.locals.child_logger = logger.child({ STUDENT_EMAIL: req.session['student'].email });
            next();
        } else {
            throw new ERROR.ClientError(
                ERROR.HttpStatusCode.UNAUTHORIZED_REQUEST,
                'Student has not logged in yet.',
                false,
            );
        }
    } catch (err) {
        if (!error_handler.isHandleAble(err)) {
            res.status(ERROR.HttpStatusCode.DB_ERROR).json({ error: err.message });
            throw err;
        }
        error_handler.handleError(err, res);
    }
};

export default check_auth;
