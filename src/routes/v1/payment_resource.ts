/* eslint-disable sonarjs/no-duplicate-string */
import express, { NextFunction, Request, Response } from 'express';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { CaseRequest, Payment, User } from '../../db/models';
import { isClient, isLawyer } from '../../middleware/access_middleware';
import { processPayment } from '../../utils/processPayment';

const router = express.Router({ mergeParams: true });

// down payment
router.post('/downPayment', isClient, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    await processPayment(req, res, next, 'downPayment');
})
);

// full payment
router.post('/fullPayment', isClient, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    await processPayment(req, res, next, 'fullPayment');
})
);

// requesting full payment
router.patch('/request', isLawyer, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
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

    if (caseRequest.status === 'down payment') {
        const request = await caseRequest.update({ status: 'requested full payment' }, { where: { id: caseRequestId } });
        return output(res, 200, 'Full payment requested successfully', request, null);
    }
    return output(res, 400, 'Down payment was not paid', null, 'BAD_REQUEST');
})
);

router.get('/status/:refId', asyncMiddleware(async(req: Request, res: Response, next: NextFunction)=>{
    const { refId } = req.params;
    try {
        // Update payment record
        const payment = await Payment.findOne({ where: { refId } });
        if (!payment) {
            return res.status(404).json({ message: 'payment not found' });
        }
        if (payment.status === 'successful') {
            return output(res, 201, 'payment was completed successfuly', payment, null);
        }
        if (payment.status === 'failed') {
            return output(res, 400, 'Payment failed', null, 'BAD_REQUEST');
        }
        let iterations = 0;
        const interval = setInterval(async () => {
            iterations++;
            if (iterations > 132) {
                clearInterval(interval);
                await payment.update({ status: 'failed' });
                return output(res, 400, 'Payment failed', null, 'BAD_REQUEST');
            }
            const reservation = await Payment.findOne({ where: { refId } });
            if (reservation?.status === 'successful' || reservation?.status === 'failed') {
                clearInterval(interval);
                if (reservation?.status === 'successful') {
                    return output(res, 201, 'payment was completed successfuly', payment, null);
                } else {

                    return output(res, 400, 'Payment failed', null, 'BAD_REQUEST');
                }
            }
        }, 5000); // 5 seconds and total is 11 minutes

    } catch (error) {
        return output(res, 500, 'Payment failed', null, 'BAD_REQUEST');
    }
}));

export default router;
