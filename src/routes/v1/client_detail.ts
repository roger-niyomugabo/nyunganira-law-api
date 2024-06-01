/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable import/order */
import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { validate } from '../../middleware/middleware';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { Client, User } from '../../db/models';
import { sign } from '../../utils/jwt';
const router = express.Router({ mergeParams: true });

// verify email validations
const verificationValidations = Joi.object({
    otp: Joi.string().length(4).required(),
});

router.patch('/verify', validate(verificationValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { otp } = req.body;

    const clientOtp = await Client.findOne({ where: { otp } });
    if (!clientOtp) {
        return output(res, 404, 'Client OTP not found', null, 'NOT_FOUND_ERROR');
    }
    const client = await User.findOne({ where: { id: clientOtp.userId } });
    if (!client) {
        return output(res, 404, 'User not found', null, 'NOT_FOUND_ERROR');
    }

    const verifiedClient = await clientOtp.update({ isVerified: true }, { where: { userId: client.id } });
    verifiedClient.otp = undefined;

    const token = sign({ clientId: client.id, role: client.role });
    return output(res, 200, 'Email verified successfully', { verifiedClient, token }, null);
})
);

export default router;
