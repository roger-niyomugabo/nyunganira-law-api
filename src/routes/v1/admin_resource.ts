/* eslint-disable sonarjs/no-duplicate-string */
import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { pagination, validate } from '../../middleware/middleware';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { sign } from '../../utils/jwt';
import config from '../../config';
import { isAdmin } from '../../middleware/access_middleware';
import { Address, CaseRequest, Client, Lawyer, Payment, Story, User } from '../../db/models';
import { computePaginationRes } from '../../utils';

const router = express.Router();

// users login validations
const usersLoginValidations = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// Users login
router.post('/login', validate(usersLoginValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (email !== config.ADMIN_EMAIL || password !== config.ADMIN_PASSWORD) {
        return output(res, 401, 'Incorrect email or password', null, 'AUTHENTICATION_ERROR');
    }
    const token = sign({ role: 'admin' });
    return output(res, 200, 'Logged in successfully', token, null);
})
);

router.get('/lawyers', isAdmin, pagination, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const lawyers = await User.findAndCountAll({
        where: { role: 'lawyer' },
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

router.get('/clients', isAdmin, pagination, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const clients = await User.findAndCountAll({
        where: { role: 'client' },
        include: [{ model: Client, as: 'client' }],
        limit: res.locals.pagination.limit,
        offset: res.locals.pagination.offset,
    });

    return output(
        res, 200, 'Case requests retrieved successfully',
        computePaginationRes(
            res.locals.pagination.page,
            res.locals.pagination.limit,
            clients.count,
            clients.rows),
        null);
})
);

router.get('/metrics', isAdmin, pagination, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const [clients, lawyers, cases, payments, stories] = await Promise.all([
        User.count({ where: { role: 'client' } }),
        User.count({ where: { role: 'lawyer' } }),
        CaseRequest.count(),
        Payment.count(),
        Story.count(),
    ]);

    return output(
        res, 200, 'Metrics retrieved successfully',
        { clients, lawyers, cases, payments, stories },
        null);
})
);

export default router;
