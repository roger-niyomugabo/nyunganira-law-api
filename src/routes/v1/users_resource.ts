/* eslint-disable sonarjs/no-duplicate-string */
import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { User } from '../../db/models';
import { check } from '../../utils/bcrypt';
import { validate } from '../../middleware/middleware';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { sign } from '../../utils/jwt';
const router = express.Router();

// users login validations
const usersLoginValidations = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// Users login
router.post('/login', validate(usersLoginValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !['lawyer', 'client'].includes(user.role)) {
        return output(res, 404, 'Email not registered', null, 'NOT_FOUND_ERROR');
    }

    const isMatch = check(user.password, password);
    if (!isMatch) {
        return output(res, 401, 'Incorrect email or password', null, 'AUTHENTICATION_ERROR');
    }
    user.password = undefined;

    if (user.role === 'lawyer') {
        const token = sign({ lawyerId: user.id, role: user.role });
        return output(res, 200, 'Logged in successfully', { user, token }, null);
    }
    if (user.role === 'client') {
        const token = sign({ clientId: user.id, role: user.role });
        return output(res, 200, 'Logged in successfully', { user, token }, null);
    }

    return output(res, 401, 'Invalid login cridentials', null, 'AUTHENTICATION_ERROR');
})
);

export default router;
