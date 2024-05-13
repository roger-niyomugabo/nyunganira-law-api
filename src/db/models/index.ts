import type { Sequelize } from 'sequelize';
import { User } from './user.model';

export {
    User
};

export function initModels(sequelize: Sequelize) {
    User.initModel(sequelize);

    // Declare associations here

    return {
        User,
    };
}
