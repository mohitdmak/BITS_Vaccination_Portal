// error models and handler middlewares
import { HttpStatusCode } from '../middeware/error_models';
import { error_handler } from '../middeware/error_handler';
import { ResponseType } from '../controllers/student_controllers';
import pino from 'pino';

/** Common handler for caught errors sent to error_handling middleware */
export const forward_errors = async (
    err,
    status_code: HttpStatusCode,
    res: ResponseType,
    CHILD_LOGGER?: pino.Logger,
): Promise<void> => {
    if (!error_handler.isHandleAble(err)) {
        res.status(status_code).json({ error: err.message });
        throw err;
    }
    error_handler.handleError(err, res, CHILD_LOGGER);
};
