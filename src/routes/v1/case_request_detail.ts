/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable import/order */
import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { validate } from '../../middleware/middleware';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { isLawyer, isLawyerOrClient } from '../../middleware/access_middleware';
import { CaseRequest, Lawyer, User } from '../../db/models';
const router = express.Router({ mergeParams: true });

// accept case request validations
const acceptCaseRequestValidations = Joi.object({
    downPayment: Joi.number().required(),
    fullPayment: Joi.number().required(),
});

router.patch('/accept', isLawyer, validate(acceptCaseRequestValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { lawyerId } = req.user;
    const { caseRequestId } = req.params;

    const lawyerPromise = User.findOne({ where: { id: lawyerId } });
    const caseRequestPromise = CaseRequest.findOne({ where: { id: caseRequestId } });
    const [lawyer, caseRequest] = await Promise.all([lawyerPromise, caseRequestPromise]);
    if (!lawyer || lawyer.role !== 'lawyer') {
        return output(res, 404, 'User not found', null, 'NOT_FOUND_ERROR');
    }
    if (!caseRequest) {
        return output(res, 404, 'Case request not found', null, 'NOT_FOUND_ERROR');
    }

    const request = await caseRequest.update({ ...req.body, status: 'approved' }, { where: { id: caseRequestId } });
    return output(res, 200, 'Case request approved successfully', request, null);
})
);

router.patch('/decline', isLawyer, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { lawyerId } = req.user;
    const { caseRequestId } = req.params;

    const lawyerPromise = User.findOne({ where: { id: lawyerId } });
    const caseRequestPromise = CaseRequest.findOne({ where: { id: caseRequestId } });
    const [lawyer, caseRequest] = await Promise.all([lawyerPromise, caseRequestPromise]);
    if (!lawyer || lawyer.role !== 'lawyer') {
        return output(res, 404, 'User not found', null, 'NOT_FOUND_ERROR');
    }
    if (!caseRequest) {
        return output(res, 404, 'Case request not found', null, 'NOT_FOUND_ERROR');
    }

    const request = await caseRequest.update({ status: 'declined' }, { where: { id: caseRequestId } });
    return output(res, 200, 'Case request declined successfully', request, null);
})
);

// Get a single case
router.get('/', isLawyerOrClient, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { role, clientId } = req.user;
    const { caseRequestId } = req.params;
    const caseRequestExists = await CaseRequest.findOne({ where: { id: caseRequestId } });
    if (!caseRequestExists) {
        return output(res, 404, 'Case not found', null, 'NOT_FOUND_ERROR');
    }

    if (role === 'client') {
        const caseRequest = await CaseRequest.findOne({
            where: { id: caseRequestId, clientId },
            include: [{ model: Lawyer, as: 'lawyer' }],
        });
        return output(res, 200, 'Case retrieved successfully', caseRequest, null);
    }
    if (role === 'lawyer') {
        const caseRequest = await CaseRequest.findOne({
            where: { id: caseRequestId },
            include: [{ model: User, as: 'client' }],
        });
        return output(res, 200, 'Case retrieved successfully', caseRequest, null);
    }
    return output(res, 200, 'Cse retrieved successfully', null, null);
})
);

export default router;
