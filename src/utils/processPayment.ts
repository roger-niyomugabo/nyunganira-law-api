import { NextFunction, Request, Response } from 'express';
import output from '../utils/response';
import { CaseRequest, Lawyer, Payment, User } from '../db/models';
import { paypackConfig } from './paypackConfig';

export const processPayment = async (req: Request, res: Response, next: NextFunction, paymentType: 'downPayment' | 'fullPayment') => {
    const { clientId } = req.user;
    const { caseRequestId } = req.params;
    const { number } = req.body;
    const caseRequest = await CaseRequest.findOne({
        where: { id: caseRequestId },
        include: [{ model: Lawyer, as: 'lawyer',
            include: [{ model: User, as: 'user' }],
        }],
    });

    if (!caseRequest) {
        return output(res, 404, 'No case request to pay for', null, 'NOT_FOUND_ERROR');
    }

    const amount = paymentType === 'downPayment' ? caseRequest.downPayment : caseRequest.fullPayment - caseRequest.downPayment;
    // const number = caseRequest?.lawyer?.user?.phoneNumber;

    if (!number) {
        return output(res, 400, 'Client phone number not found', null, 'BAD_REQUEST_ERROR');
    }

    const paymentResponse = await paypackConfig.cashin(amount, number).catch((err) => {
        return output(res, 400, err.message, null, 'BAD_REQUEST_ERROR');
    });
    // eslint-disable-next-line no-console
    if (paymentResponse.data.status === 'pending') {
        const newPayment = await Payment.create({
            amount,
            type: paymentResponse.data.kind,
            status: paymentResponse.data.status,
            userId: clientId,
            refId: paymentResponse.data.ref,
            provider: paymentResponse.data.provider,
            fee: paymentResponse.data.fee,
            caseRequestId,
        });

        return output(res, 200, 'Payment request sent successfully', newPayment, null);
    } else {
        return output(res, 400, 'Payment request failed', null, null);
    }

};
