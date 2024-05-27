/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
import config from '../config';
const PaypackJs = require('paypack-js').default;

const clientId = config.PAYPACK_CLIENT_ID;
const clientSecret = config.PAYPACK_CLIENT_SECRET;

if (!clientId || !clientSecret) {
    throw new Error('Paypack configuration is missing client id or client secret');
}

// Configure PaypackJs
const paypack = PaypackJs.config({
    client_id: clientId,
    client_secret: clientSecret,
});

export const paypackConfig = {
    cashin: async (amount: number, number: string) => {
        try {
            return await paypack.cashin({
                amount,
                number,
                environment: config.PAYPACK_WEBHOOK_ENVIRONMENT,
            });
        } catch (err) {
            console.error('Paypack cashin error:', err);
            throw err;
        }
    },

    cashout: async (amount: number, number: string) => {
        try {
            return await paypack.cashout({
                amount,
                number,
                environment: config.PAYPACK_WEBHOOK_ENVIRONMENT,
            });
        } catch (err) {
            console.error('Paypack cashout error:', err);
            throw err;
        }
    },
};
