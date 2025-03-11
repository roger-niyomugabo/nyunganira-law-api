/* eslint-disable sonarjs/no-duplicate-string */
import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { Client, Lawyer, User } from '../../db/models';
import { check } from '../../utils/bcrypt';
import { validate } from '../../middleware/middleware';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { sign } from '../../utils/jwt';
import { isAdmin, isLawyerOrClient } from '../../middleware/access_middleware';
import { generate } from '../../utils/bcrypt';

const router = express.Router();

// users login validations
const usersLoginValidations = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// Users login
router.post('/login', validate(usersLoginValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email }, include: [{ model: Client, as: 'client' }] });
    if (!user || !['lawyer', 'client'].includes(user.role)) {
        return output(res, 404, 'Email not registered', null, 'NOT_FOUND_ERROR');
    }
    const client_user = await Client.findOne({ where: { userId: user.id } });
    if (!client_user && user.role === 'client') {
        return output(res, 404, 'Client not found', null, 'NOT_FOUND_ERROR');
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
        if (!client_user.isVerified) {
            return output(res, 400, 'Account not verified', null, null);
        }
        return output(res, 200, 'Logged in successfully', { user, token }, null);
    }

    return output(res, 401, 'Invalid login cridentials', null, 'AUTHENTICATION_ERROR');
})
);

// change password
router.patch('/changePassword', isLawyerOrClient, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { clientId, lawyerId } = req.user;
    const userId = clientId || lawyerId;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
        return output(res, 404, 'User not found', null, 'NOT_FOUND_ERROR');
    }

    const isMatch = check(user.password, oldPassword);
    if (!isMatch) {
        return output(res, 400, 'Old password is incorrect', null, 'BAD_REQUEST_ERROR');
    }

    const hashedPassword = await generate(newPassword);
    await user.update({ password: hashedPassword });

    return output(res, 200, 'Password changed successfully', null, null);
})
);

// delete user
router.delete('/delete/:userId', isAdmin, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
        return output(res, 404, 'User not found', null, 'NOT_FOUND_ERROR');
    }
    if (user.role === 'lawyer') {
        const lawyer = await Lawyer.findOne({ where: { userId: user.id } });
        if (lawyer) {
            await lawyer.destroy();
        }
    }
    if (user.role === 'client') {
        const client = await Client.findOne({ where: { userId: user.id } });
        if (client) {
            await client.destroy();
        }
    }
    await user.destroy();

    return output(res, 200, 'User deleted successfully', null, null);
})
);

export default router;
