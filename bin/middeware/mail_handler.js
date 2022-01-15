"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mail_handler = void 0;
// error handler for mailgun 
const { MailError } = require("./error_models");
const { HttpStatusCode } = require("./error_models");
// mail handling class
class MailHandler {
    // log calling of mail handler
    constructor() {
        // configs
        this.DOMAIN = 'sandbox03e7b28e47f7491980efea3fafbb21f5.mailgun.org';
        this.mg = require("mailgun-js")({
            apiKey: "7056832ed208911f6465435b73e71895-8ed21946-ce4e317a",
            domain: this.DOMAIN
        });
        // function to send mail  FIXME
        //@ts-ignore
        this.sendEmail = async (recipient, message, attachment) => new Promise((resolve, reject) => {
            // load data body
            const data = {
                from: 'BITS Vaccination Portal Admin <mohitdmak@sandbox03e7b28e47f7491980efea3fafbb21f5.mailgun.org>',
                to: recipient,
                subject: message.subject,
                text: message.body,
                inline: attachment,
                html: message.html,
            };
            // resolve/reject promise
            this.mg.messages().send(data, (error) => {
                if (error) {
                    return reject(new MailError(HttpStatusCode.MAIL_ERROR, error.message, true));
                }
                return resolve("Sent Mail To Notify Admin.");
            });
        });
        console.log("Mail Handler created.");
    }
}
exports.mail_handler = new MailHandler();
