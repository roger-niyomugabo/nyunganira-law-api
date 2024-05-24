import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import { passwordRegex, phoneNumberRegex } from '../../utils/globalValidations';
import { pagination, validate } from '../../middleware/middleware';
import { gender } from '../../interfaces/userInterface';
import { Lawyer, User } from '../../db/models';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { generate } from '../../utils/bcrypt';
import { sign } from '../../utils/jwt';
import { isClient } from '../../middleware/access_middleware';
import { computePaginationRes } from '../../utils';

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
    const client = await User.create({ ...req.body, password: hashedPassword, role: 'client' });
    client.password = undefined;

    const token = sign({ clientId: client.id, role: client.role });
    return output(res, 201, 'Signed up successfully', { client, token }, null);
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
        include: [{ model: Lawyer, as: 'lawyer' }],
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
