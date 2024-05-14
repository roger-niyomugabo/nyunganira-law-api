import type { Sequelize } from 'sequelize';
import { User } from './user.model';
import { Lawyer } from './lawyer_user';
import { Address } from './address.model';

export {
    User,
    Lawyer,
    Address
};

export function initModels(sequelize: Sequelize) {
    User.initModel(sequelize);
    Lawyer.initModel(sequelize);
    Address.initModel(sequelize);

    // Declare associations here
    User.hasOne(Lawyer, {
        foreignKey: {
            allowNull: false,
        },
        onDelete: 'CASCADE',
    });
    Lawyer.belongsTo(User, {
        foreignKey: {
            allowNull: false,
        },
        onDelete: 'CASCADE',
    });

    Lawyer.hasOne(Address, {
        foreignKey: {
            allowNull: false,
        },
        onDelete: 'CASCADE',
    });
    Address.belongsTo(Lawyer, {
        foreignKey: {
            allowNull: false,
        },
        onDelete: 'CASCADE',
    });

    return {
        User,
        Lawyer,
        Address,
    };
}
