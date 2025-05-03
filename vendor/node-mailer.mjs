import nodemailer from 'nodemailer';
import { translate } from '@vitalets/google-translate-api';
import Configure from '../libraries/Materials/Configure.mjs';


class NodeMailer {
    constructor() {
    }

    async sendMail(params) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: Configure.read('mailer.user'),
                pass: Configure.read('mailer.pass'),
            },
        });

        let mailOptions = {
            from: `"${process.env.APP_NAME || 'Bislig Cultural'}" <${Configure.read('mailer.user')}>`,
            to: params.to,
            subject: params.subject,
            html: `<h1>${params.header}</h1><p>${params.content}</p>`,
            text: `${params.header}\n\n${params.content}`
        };

        if (Configure.read('mailer.mailer')) {
            try {
                let info = await transporter.sendMail(mailOptions);
                console.log('Message sent: %s', info.messageId);
            } catch (error) {
                console.error('Error sending email:', error);
            }
        }
    }
}

export default NodeMailer;
