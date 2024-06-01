import { Sequelize } from 'sequelize';
import { User } from './user.model';
import { Lawyer } from './lawyer_user';
import { Address } from './address.model';
import { CaseRequest } from './case_request.model';
import { Payment } from './payment.model';
import { Story } from './story.model';
import { Client } from './client_user';

export {
    User,
    Lawyer,
    Address,
    CaseRequest,
    Payment,
    Story,
    Client
};

export function initModels(sequelize: Sequelize) {
    User.initModel(sequelize);
    Lawyer.initModel(sequelize);
    Address.initModel(sequelize);
    CaseRequest.initModel(sequelize);
    Payment.initModel(sequelize);
    Story.initModel(sequelize);
    Client.initModel(sequelize);

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

    User.hasOne(Client, {
        foreignKey: {
            allowNull: false,
        },
        onDelete: 'CASCADE',
    });
    Client.belongsTo(User, {
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

    // User.belongsToMany(Lawyer, { through: CaseRequest, foreignKey: 'clientId', as: 'Client' });

    // Lawyer.belongsToMany(User, { through: CaseRequest });

    User.hasMany(CaseRequest, {
        foreignKey: 'clientId',
        as: 'caseRequests',
    });
    Lawyer.hasMany(CaseRequest, {
        foreignKey: 'lawyerId',
        as: 'caseRequests',
    });

    CaseRequest.belongsTo(User, {
        foreignKey: 'clientId',
        as: 'client',
    });
    CaseRequest.belongsTo(Lawyer, {
        foreignKey: 'lawyerId',
        as: 'lawyer',
    });

    User.hasMany(Payment, {
        foreignKey: {
            allowNull: false,
        },
    });
    CaseRequest.hasMany(Payment, {
        foreignKey: {
            allowNull: false,
        },
    });

    return {
        User,
        Lawyer,
        Address,
        CaseRequest,
        Payment,
        Story,
        Client,
    };
}
