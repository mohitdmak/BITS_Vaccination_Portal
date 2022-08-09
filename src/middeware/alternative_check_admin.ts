// import logger
import { logger } from './logger';
import { RequestType, ResponseType } from '../controllers/student_controllers';
import { HOST } from '../setup_project';
// import error handlers
import * as ERROR from '../middeware/error_models';
import { error_handler } from '../middeware/error_handler';

const alternative_check_admin = async (req: RequestType, res: ResponseType, next: any): Promise<void> => {
    try {
        const domain: string = req.headers.referer!;
        if (!domain) {
            throw new ERROR.ClientError(
                ERROR.HttpStatusCode.UNAUTHORIZED_REQUEST,
                'Not authorized to access this ADMIN api path.',
                false,
            );
        } else {
            if (domain.startsWith(HOST)) {
                logger.info('ADMIN allowed access.');
                next();
            } else {
                throw new ERROR.ClientError(
                    ERROR.HttpStatusCode.UNAUTHORIZED_REQUEST,
                    'Not authorized to access this ADMIN api path.',
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

export default alternative_check_admin;
