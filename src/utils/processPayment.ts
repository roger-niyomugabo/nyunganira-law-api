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

    const amount = paymentType === 'downPayment' ? caseRequest.downPayment : caseRequest.fullPayment;
    // const number = caseRequest?.lawyer?.user?.phoneNumber;

    if (!number) {
        return output(res, 400, 'Lawyer phone number not found', null, 'BAD_REQUEST_ERROR');
    }

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

        return output(res, 200, 'Payment request sent successfully', newPayment, null);
    }

    return output(res, 200, 'Payment request sent successfully', null, null);
};
