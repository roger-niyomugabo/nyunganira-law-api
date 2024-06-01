/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import output from '../../utils/response';
import { asyncMiddleware } from '../../middleware/error_middleware';
import { Address, Lawyer, User } from '../../db/models';
import { isAdmin, isClient } from '../../middleware/access_middleware';
import { pagination, validate } from '../../middleware/middleware';
import { db } from '../../db';
import { generate } from '../../utils/bcrypt';
import { phoneNumberRegex } from '../../utils/globalValidations';
import { gender } from '../../interfaces/userInterface';
import { generatePassword } from '../../utils/generatePassword';
import mailer from '../../utils/mailer';
import cloudinaryUpload from '../../utils/file_upload';
import { computePaginationRes } from '../../utils';

const router = express.Router();

// lawyer validations
const lawyerValidations = Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    gender: Joi.string().valid(...gender).required(),
    phoneNumber: Joi.string().regex(phoneNumberRegex).required().messages({
        'string.base': 'Please provide a valid phone number (07xxxxxxxx)',
        'string.pattern.base': 'Please provide a valid phone number (07xxxxxxxx)',
        'string.empty': 'Phone number is required',
    }),
    years_of_experience: Joi.number().required(),

    province: Joi.string().required(),
    district: Joi.string().required(),
    sector: Joi.string(),
    cell: Joi.string(),
    street: Joi.string(),
});

router.post('/register', isAdmin, cloudinaryUpload.single('profilePicture'), validate(lawyerValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { email, phoneNumber } = req.body;
    const file = req.file as Express.Multer.File;

    const userExists = await User.findOne({ where: { [Op.or] :[{ email }, { phoneNumber }] } });
    if (userExists) {
        return output(res, 409, 'User already exixts', null, 'CONFLICT_ERROR');
    }
    const password = generatePassword();
    const hashedPassword = await generate(password);
    try {
        await db.transaction(async (t) => {
            const user = await User.create({ ...req.body, password: hashedPassword, role: 'lawyer' }, { transaction: t });
            const lawyer = await Lawyer.create({ ...req.body, profilePicture: file.path, userId: user.id }, { transaction: t });
            const newAddress = await Address.create({ ...req.body, lawyerId: lawyer.id }, { transaction: t });
            user.password = undefined;
            const responseData = {
                user: {
                    ...user.dataValues,
                },
                lawyer: {
                    ...lawyer.dataValues,
                },
                address: newAddress.dataValues,
            };

            await mailer({ email: responseData.user.email, fullName: responseData.user.fullName, password }, 'accountCreationRequest');
            return output(res, 201, 'Lawyer created successfully', responseData, null);
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
