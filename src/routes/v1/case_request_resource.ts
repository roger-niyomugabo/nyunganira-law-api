/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import output from '../../utils/response';
import { asyncMiddleware } from '../../middleware/error_middleware';
import { CaseRequest, User } from '../../db/models';
import { isClient } from '../../middleware/access_middleware';
import { validate } from '../../middleware/middleware';
import cloudinaryUpload from '../../utils/file_upload';
import config from '../../config';
import mailer from '../../utils/mailer';

const router = express.Router({ mergeParams: true });

// case request validations
const caseRequestValidations = Joi.object({
    description: Joi.string().required(),
});

router.post('/:lawyerId', isClient, cloudinaryUpload.single('caseFile'), validate(caseRequestValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { clientId } = req.user;
    const { lawyerId } = req.params;
    const file = req.file as Express.Multer.File;
    const caseFile = file.path;

    const client = await User.findOne({ where: { id: clientId } });
    const lawyer = await User.findOne({ where: { id: lawyerId } });
    if (!client || client.role !== 'client') {
        return output(res, 404, 'User not found', null, 'NOT_FOUND_ERROR');
    }
    if (!lawyer || lawyer.role !== 'lawyer') {
        return output(res, 404, 'User not found', null, 'NOT_FOUND_ERROR');
    }
    try {
        const request = await CaseRequest.create({ ...req.body, caseFile, clientId, lawyerId });
        // send an email to lawyer
        const queryParams = new URLSearchParams({ caseRequestId: request.id }).toString();
        const URL = `${config.client.frontend_url}/case_request/accept?${queryParams}`;
        await mailer({
            email: lawyer.email,
            lawyerName: lawyer.fullName,
            URL }, 'caseRequestInvitation', caseFile);

        return output(res, 201, 'Case request registered successfully', request, null);
    } catch (error) {
        return output(res, 400, error.message || error, null, 'BAD_REQUEST');
    }
})
);

export default router;
