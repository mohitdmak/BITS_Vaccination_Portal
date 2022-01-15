// Message type for sending mail
export type Message = {
    subject: String,
    body: String,
    html: String
}

// error handler for mailgun 
const {MailError} = require("./error_models");
const {HttpStatusCode} = require("./error_models");

// mail handling class
class MailHandler{
    // configs
    private DOMAIN: string = 'sandbox03e7b28e47f7491980efea3fafbb21f5.mailgun.org';
    private mg = require("mailgun-js")({
        apiKey: "7056832ed208911f6465435b73e71895-8ed21946-ce4e317a", 
        domain: this.DOMAIN
    });

    // function to send mail  FIXME
    //@ts-ignore
    public sendEmail = async (recipient: string, message: Message, attachment: File) =>
        new Promise((resolve, reject) => {
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
            this.mg.messages().send(data, (error: Error) => {
                if(error){
                    return reject(new MailError(HttpStatusCode.MAIL_ERROR, error.message, true));
                }
                return resolve("Sent Mail To Notify Admin.");
            });
    });

    // log calling of mail handler
    constructor(){ 
        console.log("Mail Handler created.");
    }
}


export const mail_handler = new MailHandler();
