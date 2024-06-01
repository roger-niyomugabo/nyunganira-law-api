/* eslint-disable sonarjs/no-duplicate-string */
import express, { NextFunction, Request, Response } from 'express';
import { Sequelize } from 'sequelize';
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
                    if (caseRequest) {
                        await CaseRequest.update({ downPayment: Sequelize.literal(`"downPayment" - ${amount}`), fullPayment: Sequelize.literal(`"fullPayment" - ${amount}`), status: 'down payment' }, { where: { id: caseRequest.id } });
                        // console.log('Down payment success');
                        return output(res, 200, 'Down payment paid successfully', { paymentSuccess: cashinResult }, null);
                    }
                }
            }

            return output(res, 200, 'Processing down payment', { paymentSuccess: cashinResult }, null);
        } catch (err) {
            // console.error('Error processing payment:', err);
            return output(res, 500, 'Error processing payment', null, null);
        }
    } else {
        return output(res, 200, 'Processing down payment', { paymentSuccess: cashinResult }, null);
    }
}));

export default router;
