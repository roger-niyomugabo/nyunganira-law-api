import dotenv from 'dotenv';
dotenv.config();

export default {
    requiredEnvVars: [
        'JWT_SECRET',
        'CLOUDINARY_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'API_SENDER_EMAIL',
        'EMAIL_PASSWORD',
        'ADMIN_PASSWORD',
        'ADMIN_EMAIL',
        'PAYPACK_CLIENT_ID',
        'PAYPACK_CLIENT_SECRET',
        'PAYPACK_WEBHOOK_ENVIRONMENT',
    ],
    JWT_SECRET: process.env.JWT_SECRET,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    PAYPACK_CLIENT_ID: process.env.PAYPACK_CLIENT_ID,
    PAYPACK_CLIENT_SECRET: process.env.PAYPACK_CLIENT_SECRET,
    PAYPACK_WEBHOOK_ENVIRONMENT: process.env.PAYPACK_WEBHOOK_ENVIRONMENT,
    NODEMAILER: {
        API_SENDER_EMAIL: process.env.API_SENDER_EMAIL,
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    },
    storage: {
        cloudinary_name: process.env.CLOUDINARY_NAME,
        cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
        cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
        requestBodyPayloadSizeLimit: parseInt(process.env.REQUEST_BODY_PAYLOAD_SIZE_LIMIT) || 5242880, // in bytes

    },
    logs: {
        level: process.env.SERVICE_LOG_LEVEL || 'info',
        requestBodyBlacklist: process.env.SERVICE_LOG_REQUEST_BODY_BLACKLIST?.split(',') || [],
        requestHeaderBlacklist: process.env.SERVICE_LOG_REQUEST_HEADER_BLACKLIST?.split(',') || [],
    },
};
