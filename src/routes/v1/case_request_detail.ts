/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable import/order */
import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { validate } from '../../middleware/middleware';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { isLawyer } from '../../middleware/access_middleware';
import { CaseRequest, User } from '../../db/models';
const router = express.Router({ mergeParams: true });

// Helper profile update validations
const acceptCaseRequestValidations = Joi.object({
    downPayment: Joi.number().required(),
    fullPayment: Joi.number().required(),
});

router.patch('/', isLawyer, validate(acceptCaseRequestValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { lawyerId } = req.user;
    let { caseRequestId } = req.query;
    caseRequestId = String(caseRequestId);

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

export default router;
