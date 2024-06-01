import nodemailer from 'nodemailer';
import config from '../config';
import { EmailInfo } from '../interfaces';
import { accountCreationTemplate, caseRequestTemplate, emailVerificationTemplate } from './emailTemplates';

const mailer = async (info: EmailInfo, action: string, attachmentPath?: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.NODEMAILER.API_SENDER_EMAIL,
            pass: config.NODEMAILER.EMAIL_PASSWORD,
        },
    });

    let subject: string;
    let emailto: string;
    let data: string;
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (action) {
        case 'emailVerificationRequest':
            subject = 'Email Verification';
            data = emailVerificationTemplate(info);
            emailto = info.email;
            break;
        case 'accountCreationRequest':
            subject = 'Account Creation';
            data = accountCreationTemplate(info);
            emailto = info.email;
            break;
        case 'caseRequestInvitation':
            subject = 'Case Request Invitation';
            data = caseRequestTemplate(info);
            emailto = info.email;
            break;

        default:
            subject = '';
            break;
    }
    const mailOptions = {
        from: 'Nyunganira Law ',
        to: emailto,
        subject,
        html: data,
        attachments: attachmentPath ? [{ path: attachmentPath }] : [],
    };
    try {
        return transporter.sendMail(mailOptions);
    } catch (error) {
        return error;
    }
};
export default mailer;
