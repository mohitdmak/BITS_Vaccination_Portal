// import logger
import { logger } from './logger';
import { hashed } from '../config/admin';
import { RequestType, ResponseType } from '../controllers/student_controllers';
// import error handlers
import * as ERROR from '../middeware/error_models';
import { error_handler } from '../middeware/error_handler';

const check_admin_auth = async (req: RequestType, res: ResponseType, next: any): Promise<void> => {
    try {
        const authHeader: string = req.headers.authorization!;
        if (!authHeader) {
            throw new ERROR.ClientError(ERROR.HttpStatusCode.UNAUTHORIZED_REQUEST, 'No auth header for ADMIN.', false);
        } else {
            if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                const token: string = req.headers.authorization.split(' ')[1];
                if (token === hashed) {
                    logger.info('ADMIN allowed access.');
                    next();
                } else {
                    throw new ERROR.ClientError(
                        ERROR.HttpStatusCode.UNAUTHORIZED_REQUEST,
                        'Invalid auth header for ADMIN.',
                        false,
                    );
                }
            } else {
                throw new ERROR.ClientError(
                    ERROR.HttpStatusCode.UNAUTHORIZED_REQUEST,
                    'No bearer auth for ADMIN.',
                    false,
                );
            }
        }
    } catch (err) {
        if (!error_handler.isHandleAble(err)) {
            res.status(ERROR.HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: err.message });
            throw err;
        }
        error_handler.handleError(err, res);
    }
};

export default check_admin_auth;
