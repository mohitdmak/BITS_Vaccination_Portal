/* eslint @typescript-eslint/no-var-requires: "off" */

// Pino logging instance
import { logger } from './logger';
// import project config
import * as config from '../setup_project';
// Message type for sending mail
export type Message = {
    subject: string;
    body: string;
    html: string;
};

// error handler for mailgun
const { MailError } = require('./error_models');
const { HttpStatusCode } = require('./error_models');
// import api secret
import { MAILGUN_API_KEY } from '../config/session-secret';

// mail handling class
class MailHandler {
    // configs
    private DOMAIN = config.MAILGUN_DOMAIN;
    private mg = require('mailgun-js')({
        apiKey: MAILGUN_API_KEY,
        domain: this.DOMAIN,
    });

    // function to send mail  FIXME
    //@ts-ignore
    public sendEmail = async (recipient: string, message: Message, attachment: File) =>
        new Promise((resolve, reject) => {
            // load data body
            const data = {
                from: `BITS Vaccination Portal Admin <mohitdmak@${config.MAILGUN_DOMAIN}>`,
                to: recipient,
                subject: message.subject,
                text: message.body,
                inline: attachment,
                html: message.html,
            };

            // resolve/reject promise
            this.mg.messages().send(data, (error: Error) => {
                if (error) {
                    return reject(new MailError(HttpStatusCode.MAIL_ERROR, error.message, true));
                }
                return resolve('Sent Mail To Notify Admin.');
            });
        });

    // log calling of mail handler
    constructor() {
        logger.info({ ADMIN_MAIL_DOMAIN: this.DOMAIN }, 'Mail Handler created.');
    }
}

export const mail_handler = new MailHandler();
