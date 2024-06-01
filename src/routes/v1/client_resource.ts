import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import { passwordRegex, phoneNumberRegex } from '../../utils/globalValidations';
import { validate } from '../../middleware/middleware';
import { gender } from '../../interfaces/userInterface';
import { Client, User } from '../../db/models';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { generate } from '../../utils/bcrypt';
import mailer from '../../utils/mailer';
import { generateOTP } from '../../utils/otpGenerator';
import { db } from '../../db';

const router = express.Router();

// Client signup validations
const clientSignupValidations = Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    gender: Joi.string().valid(...gender).required(),
    phoneNumber: Joi.string().regex(phoneNumberRegex).required().messages({
        'string.base': 'Please provide a valid phone number (07xxxxxxxx)',
        'string.pattern.base': 'Please provide a valid phone number (07xxxxxxxx)',
        'string.empty': 'Phone number is required',
    }),
    password: Joi.string().regex(passwordRegex).required().messages({
        'string.base': 'Please provide a valid password',
        'string.pattern.base': 'Password must have at least 8 characters, including uppercase, lowercase, and a digit',
        'string.empty': 'Password is required',
    }),
});

// Client signup
router.post('/signup', validate(clientSignupValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { email, phoneNumber, password } = req.body;
    const userExists = await User.findOne({ where: { [Op.or]: [{ email }, { phoneNumber }] } });
    if (userExists) {
        return output(res, 409, 'User already exixts', null, 'CONFLICT_ERROR');
    }
    const hashedPassword = await generate(password);

    try {
        await db.transaction(async (t) => {
            const otp = generateOTP(4);
            const client = await User.create({ ...req.body, password: hashedPassword, role: 'client' }, { transaction: t });
            const client_user = await Client.create({ otp, userId: client.id }, { transaction: t });
            client.password = undefined;
            client_user.otp = undefined;

            const responseData = {
                client: {
                    ...client.dataValues,
                    ...client_user.dataValues,
                },
            };
            // send an email to lawyer
            await mailer({
                email: responseData.client.email, fullName: responseData.client.fullName, otp }, 'emailVerificationRequest');
            return output(res, 201, 'Signed up successfully', responseData, null);
        });
    } catch (error) {
        return output(res, 500, error.message || error, null, 'INTERNAL_SERVER_ERROR');
    }
})
);

export default router;
