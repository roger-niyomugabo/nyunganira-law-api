/* eslint-disable sonarjs/no-identical-functions */
import { EmailInfo } from '../interfaces';

const emailVerificationTemplate = (info: EmailInfo) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }

        .content {
            padding: 20px 0;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 5px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }

        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3498db;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }

    </style>
</head>
<body>
    <div class="content">
        <p>Hello ${info.fullName},</p>
        <p>Thanks for registering for an account on Nyunganira Law App, Before we get started we just need to confirm that this is you.</p>
        <p>Your One-Time-Pin is: ${info.otp}. Please do not share with anyone.</p>
    </div>
</body>
</html>
`;

const accountCreationTemplate = (info: EmailInfo) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }

        .content {
            padding: 20px 0;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 5px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }

        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3498db;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }

    </style>
</head>
<body>
    <div class="content">
        <p>Hello ${info.fullName},</p>
        <p>You have been registered for an account on <strong>Nyunganira Law Application</strong> as a lawyer.</p>
        <p>Below are your login credentials.</p>
        <p>Email: ${info.email}</p>
        <p>Password: ${info.password}</p>
        <p>If you have any questions or need assistance, please contact the authorities.</p>
    </div>
</body>
</html>
`;

export {
    accountCreationTemplate,
    emailVerificationTemplate
};
