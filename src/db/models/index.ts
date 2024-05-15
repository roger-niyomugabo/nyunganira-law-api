import type { Sequelize } from 'sequelize';
import { User } from './user.model';
import { Lawyer } from './lawyer_user';
import { Address } from './address.model';
import { CaseRequest } from './case_request.model';

export {
    User,
    Lawyer,
    Address,
    CaseRequest
};

export function initModels(sequelize: Sequelize) {
    User.initModel(sequelize);
    Lawyer.initModel(sequelize);
    Address.initModel(sequelize);
    CaseRequest.initModel(sequelize);

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

    // many-to-many self-association
    User.belongsToMany(User, {
        through: CaseRequest,
        as: 'Client',
        foreignKey: 'clientId',
    });
    User.belongsToMany(User, {
        through: CaseRequest,
        as: 'Lawyer',
        foreignKey: 'lawyerId',
    });

    return {
        User,
        Lawyer,
        Address,
        CaseRequest,
    };
}
