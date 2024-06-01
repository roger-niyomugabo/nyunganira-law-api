import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import { passwordRegex, phoneNumberRegex } from '../../utils/globalValidations';
import { pagination, validate } from '../../middleware/middleware';
import { gender } from '../../interfaces/userInterface';
import { Address, Client, Lawyer, User } from '../../db/models';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { generate } from '../../utils/bcrypt';
import { sign } from '../../utils/jwt';
import { isClient } from '../../middleware/access_middleware';
import { computePaginationRes } from '../../utils';
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

router.get('/', isClient, pagination, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const orderClause = User.getOrderQuery(req.query);
    const selectClause = User.getSelectionQuery(req.query);
    const whereClause = User.getWhereQuery(req.query);
    const { clientId, role } = req.user;

    const client = await User.findOne({ where: { id: clientId } });
    if (!client || client.role !== role) {
        return output(res, 404, 'User not found', null, 'NOT_FOUND_ERROR');
    }

    const lawyers = await User.findAndCountAll({
        order: orderClause,
        attributes: selectClause,
        where: { ...whereClause, role: 'lawyer' },
        include: [{ model: Lawyer, as: 'lawyer', include: [{ model: Address, as: 'address' }] }],
        limit: res.locals.pagination.limit,
        offset: res.locals.pagination.offset,
    });

    return output(
        res, 200, 'Case requests retrieved successfully',
        computePaginationRes(
            res.locals.pagination.page,
            res.locals.pagination.limit,
            lawyers.count,
            lawyers.rows),
        null);
})
);

export default router;
