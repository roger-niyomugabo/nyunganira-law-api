import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { validate } from '../../middleware/middleware';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { sign } from '../../utils/jwt';
import config from '../../config';

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

export default router;
