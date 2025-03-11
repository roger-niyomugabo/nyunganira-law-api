/* eslint-disable sonarjs/no-duplicate-string */
import express, { NextFunction, Request, Response } from 'express';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { CaseRequest, Payment } from '../../db/models';
import { paypackConfig } from '../../utils/paypackConfig';

const router = express.Router({ mergeParams: true });

// eslint-disable-next-line sonarjs/cognitive-complexity
router.post('/', asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { data } = req.body;
    const { ref, status, fee, amount, client: number, kind } = data;

    let cashinResult: any;

    if (kind === 'CASHIN' && status === 'successful') {
        const paymentResults = await Payment.update({ status, fee }, { where: { refId: ref }, returning: true });
        cashinResult = paymentResults[1][0].dataValues;
    }

    if (cashinResult && status === 'successful') {
        try {
            // const withdrawalAmount = amount - (fee * 2);
            const withdrawalAmount = amount;
            const response = await paypackConfig.cashout(withdrawalAmount, number);

            if (response.data?.kind === 'CASHOUT') {
                const payment = await Payment.findOne({ where: { refId: ref } });
                if (payment) {
                    const caseRequest = await CaseRequest.findOne({ where: { id: payment.caseRequestId } });
                    if (caseRequest && caseRequest.status !== 'down payment' && caseRequest.status !== 'requested full payment' && caseRequest.status !== 'fully paid') {
                        await CaseRequest.update({ status: 'down payment' }, { where: { id: caseRequest.id } });
                        return output(res, 200, 'Down payment paid successfully', { paymentSuccess: cashinResult }, null);
                    } else if (caseRequest && caseRequest.status === 'down payment' || caseRequest.status === 'requested full payment') {
                        await CaseRequest.update({ status: 'fully paid' }, { where: { id: caseRequest.id } });
                        return output(res, 200, 'Full payment paid successfully', { paymentSuccess: cashinResult }, null);
                    }
                }
            }
        } catch (err) {
            return output(res, 500, 'Error processing payment', null, null);
        }
    } else {
        return output(res, 200, 'Processing down payment', { paymentSuccess: cashinResult }, null);
    }
}));

export default router;
