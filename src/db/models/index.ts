import type { Sequelize } from 'sequelize';
import { User } from './user.model';
import { AdminUser } from './admin_user';

export {
    User,
    AdminUser
};

export function initModels(sequelize: Sequelize) {
    User.initModel(sequelize);

    // Declare associations here
    User.hasOne(AdminUser, {
        foreignKey: {
            allowNull: false,
        },
        onDelete: 'CASCADE',
    });
    AdminUser.belongsTo(User, {
        foreignKey: {
            allowNull: false,
        },
        onDelete: 'CASCADE',
    });

    return {
        User,
        AdminUser,
    };
}
