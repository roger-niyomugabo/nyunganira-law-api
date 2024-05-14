/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import output from '../../utils/response';
import { asyncMiddleware } from '../../middleware/error_middleware';
import { Address, Lawyer, User } from '../../db/models';
import { isAdmin } from '../../middleware/access_middleware';
import { validate } from '../../middleware/middleware';
import { db } from '../../db';
import { generate } from '../../utils/bcrypt';
import { phoneNumberRegex } from '../../utils/globalValidations';
import { gender } from '../../interfaces/userInterface';
import { generatePassword } from '../../utils/generatePassword';
import mailer from '../../utils/mailer';

const router = express.Router();

// lawyer validations
const lawyerValidations = Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    gender: Joi.string().valid(...gender).required(),
    phoneNumber: Joi.string().regex(phoneNumberRegex).required().messages({
        'string.base': 'Please provide phone number, starting with country code.',
        'string.pattern.base': 'Please provide phone number, starting with country code.',
        'string.empty': 'Phone number is required',
    }),

    province: Joi.string().required(),
    district: Joi.string().required(),
    sector: Joi.string().required(),
    cell: Joi.string().required(),
    street: Joi.string(),
});

router.post('/register', isAdmin, validate(lawyerValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { email, phoneNumber } = req.body;

    const userExists = await User.findOne({ where: { [Op.or] :[{ email }, { phoneNumber }] } });
    if (userExists) {
        return output(res, 409, 'User already exixts', null, 'CONFLICT_ERROR');
    }
    const password = generatePassword();
    const hashedPassword = await generate(password);
    try {
        await db.transaction(async (t) => {
            const user = await User.create({ ...req.body, password: hashedPassword, role: 'lawyer' }, { transaction: t });
            const lawyer = await Lawyer.create({ ...req.body, userId: user.id }, { transaction: t });
            const newAddress = await Address.create({ ...req.body, lawyerId: lawyer.id }, { transaction: t });
            user.password = undefined;
            const responseData = {
                lawyer: {
                    ...user.dataValues,
                    ...lawyer.dataValues,
                },
                address: newAddress.dataValues,
            };

            await mailer({ email: responseData.lawyer.email, fullName: responseData.lawyer.fullName, password }, 'accountCreationRequest');
            return output(res, 201, 'Lawyer created successfully', responseData, null);
        });
    } catch (error) {
        return output(res, 500, error.message || error, null, 'INTERNAL_SERVER_ERROR');
    }
})
);

export default router;
