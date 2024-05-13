import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AdminUser, Business, BusinessOwnerUser, HelperUser, User } from '../../src/db/models';
import config from '../../src/config';
import { TokenPayloadI } from '../../src/interfaces';
dotenv.config();

/**
 * Create a valid token for testing.
 * @param {object} payload Payload for sign the token
 * @return {string} Returns the token
 */
export const createTestUserToken = (payload: TokenPayloadI): string => {

    let tokenPayload;
    switch (payload.role) {
        case 'admin':
            tokenPayload = {
                adminUserId: payload.userId,
                role: payload.role,
            };
            break;
        case 'company':
            tokenPayload = {
                companyUserId: payload.userId,
                role: payload.role,
                username: payload.username,
            };
            break;
        case 'intern':
            tokenPayload = {
                internUserId: payload.userId,
                role: payload.role,
                username: payload.username,
            };
            break;
        default:
            tokenPayload = {
            };
    }
    return <string>jwt.sign(
        tokenPayload,
        config.JWT_SECRET
    );
};

export const clearAllDatabaseModels = async () => {
    // When a new model is added it should be added here in the correct order
    if (process.env.NODE_ENV === 'test'){
        await HelperUser.destroy({ where: {}, force: true });
        await BusinessOwnerUser.destroy({ where: {}, force: true });
        await Business.destroy({ where: {}, force: true });
        await AdminUser.destroy({ where: {}, force: true });
        await User.destroy({ where: {}, force: true });
    } else {
        throw Error('Can not delete all Database models!!');
    }
};
