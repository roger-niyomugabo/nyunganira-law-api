import express from 'express';
const router = express.Router();
import cors from 'cors';
import config from './config';
import { errorHandler, jsonParseErrorHandler, methodNotAllowedErrorHandler, notFoundErrorHandler, payloadTooLargeErrorHandler, uuidErrorHandler } from './middleware/error_middleware';
import { errorLogger, requestLogger } from './middleware/logging_middleware';

// Import controllers
import health from './routes/health';
import resource from './routes/resource';
import test from './routes/testing_resources';
import client_resource from './routes/v1/client_resource';
import client_detail from './routes/v1/client_detail';
import users_resource from './routes/v1/users_resource';
import lawyer_resource from './routes/v1/lawyer_resource';
import admin_resource from './routes/v1/admin_resource';
import case_request_detail from './routes/v1/case_request_detail';
import case_request_resource from './routes/v1/case_request_resource';
import payment_resource from './routes/v1/payment_resource';
import payment_success_resource from './routes/v1/payment_success_resource';
import story_detail from './routes/v1/story_detail';
import story_resource from './routes/v1/story_resource';

const createServer = (app) => {
    app.disable('x-powered-by');
    app.use(cors());
    app.use(requestLogger);
    app.use(express.json({ limit: config.storage.requestBodyPayloadSizeLimit }));
    app.use(jsonParseErrorHandler);
    app.use(express.urlencoded({ limit: config.storage.requestBodyPayloadSizeLimit, extended: false }));
    app.use(payloadTooLargeErrorHandler);

    // Health checks
    app.use('/health', health, router.all('/', methodNotAllowedErrorHandler));

    // Only load test route if in development or tests
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        app.use('/test', test, router.all('/', methodNotAllowedErrorHandler));
    }

    // Set routes
    app.use('/index', resource, router.all('/', methodNotAllowedErrorHandler));

    // client routes
    app.use('/api/v1/client', client_detail, router.all('/', methodNotAllowedErrorHandler));
    app.use('/api/v1/client', client_resource, router.all('/', methodNotAllowedErrorHandler));
    // users routes
    app.use('/api/v1/users', users_resource, router.all('/', methodNotAllowedErrorHandler));
    // lawyer routes
    app.use('/api/v1/lawyer', lawyer_resource, router.all('/', methodNotAllowedErrorHandler));
    // admin routes
    app.use('/api/v1/admin', admin_resource, router.all('/', methodNotAllowedErrorHandler));
    // case request routes
    app.use('/api/v1/case_request', case_request_resource, router.all('/', methodNotAllowedErrorHandler));
    app.use('/api/v1/case_request/:caseRequestId', case_request_detail, router.all('/', methodNotAllowedErrorHandler));
    // payment routes
    app.use('/api/v1/payment/process', payment_success_resource, router.all('/', methodNotAllowedErrorHandler));
    app.use('/api/v1/payment/:caseRequestId', payment_resource, router.all('/', methodNotAllowedErrorHandler));
    // story routes
    app.use('/api/v1/story/:storyId', story_detail, router.all('/', methodNotAllowedErrorHandler));
    app.use('/api/v1/story', story_resource, router.all('/', methodNotAllowedErrorHandler));

    // Middleware error handlers
    app.use(notFoundErrorHandler);
    app.use(errorLogger);
    app.use(uuidErrorHandler);
    app.use(errorHandler);
};

export default createServer;
