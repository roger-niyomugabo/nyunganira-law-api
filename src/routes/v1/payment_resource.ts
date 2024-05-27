/* eslint-disable sonarjs/no-duplicate-string */
import express, { NextFunction, Request, Response } from 'express';
import { asyncMiddleware } from '../../middleware/error_middleware';
import { paypackConfig } from '../../utils/paypackConfig';
import output from '../../utils/response';
import { CaseRequest, Lawyer, Payment, User } from '../../db/models';
import { isClient } from '../../middleware/access_middleware';

const router = express.Router({ mergeParams: true });

router.post('/', isClient, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { clientId } = req.user;
    const { caseRequestId } = req.params;

    const cases = await CaseRequest.findOne({ where: { id: caseRequestId }, include: [{ model: Lawyer, as: 'lawyer', include: [{ model: User, as: 'user' }] }] });
    if (!cases) {
        return output(res, 404, 'No case rquest to pay for', null, 'NOT_FOUND_ERROR');
    }
    const amount = cases.downPayment;
    const number = cases?.lawyer?.user?.phoneNumber;
    const response = await paypackConfig.cashin(amount, number);
    if (response.data.status === 'pending') {
        const newPayment = await Payment.create({
            amount,
            type: response.data.kind,
            status: response.data.status,
            userId: clientId,
            refId: response.data.ref,
            provider: response.data.provider,
            fee: response.data.fee,
            caseRequestId,
        });

        return output(res, 200, 'payment request sent successful', newPayment, null);
    }
    return output(res, 200, 'payment request sent successful', null, null);
})
);

export default router;
