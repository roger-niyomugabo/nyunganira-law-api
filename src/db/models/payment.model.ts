/* eslint-disable @typescript-eslint/member-ordering */
import {
    Association,
    CreationOptional,
    DataTypes,
    ForeignKey,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManySetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
    Sequelize } from 'sequelize';
import { OrderClause, QueryParameterType, WhereAutoClause } from 'interfaces/sequelize_query_builder';
import { buildOrderSequelizeFilters, buildSelectionSequelizeFilters, buildWhereSequelizeFilters } from '../../utils';
import { User } from './user.model';
import { paymentStatusT } from '../../interfaces';
import { CaseRequest } from './case_request.model';

export class Payment extends Model<
InferAttributes<Payment>,
InferCreationAttributes<Payment>
> {
    declare id: CreationOptional<string>;
    declare userId: ForeignKey<User['id']>;
    declare caseRequestId: ForeignKey<CaseRequest['id']>;
    declare refId: string;
    declare status: paymentStatusT;
    declare amount: number;
    declare provider: string;
    declare type: string;
    declare fee?: number;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // client belongs to User
    declare client?: NonAttribute<User>;
    declare getUser: HasManyGetAssociationsMixin<User>;
    declare setUser: HasManySetAssociationsMixin<User, number>;
    declare createUser: HasManyCreateAssociationMixin<User>;

    declare static associations: {
        User: Association<Payment, User>;
        CaseRequest: Association<Payment, CaseRequest>;
    };

    static initModel(sequelize: Sequelize): typeof Payment {
        Payment.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                unique: true,
                autoIncrement: false,
                allowNull: false,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            refId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            amount: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            provider: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            fee: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            createdAt: {
                type: DataTypes.DATE,
            },
            updatedAt: {
                type: DataTypes.DATE,
            },
        }, {
            modelName: 'payment',
            sequelize,
        });

        return Payment;
    }

    static selectionAllowedFields: string[] =
        ['id', 'refId', 'status', 'amount', 'provider', 'type', 'createdAt', 'updatedAt'];
    static defaultSortFields: OrderClause[] = [
        ['createdAt', 'desc'],
    ];
    static sortAllowedFields: string[] = ['status', 'amount', 'provider', 'type', 'createdAt', 'updatedAt'];
    static queryAllowedFields: { [field: string]: { type: QueryParameterType } } = {
        id: { type: 'string' },
        refId: { type: 'string' },
        status: { type: 'string' },
        amount: { type: 'number' },
        provider: { type: 'string' },
        type: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static getOrderQuery(query: any): OrderClause[] {
        return buildOrderSequelizeFilters(query, this.defaultSortFields, this.sortAllowedFields);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static getSelectionQuery(query: any): string[] {
        return buildSelectionSequelizeFilters(query, this.selectionAllowedFields);
    }

    /**
     * Be careful when using this function. It may return one Op.and and one Op.or
     * You have to make sure the combination of your normal where query and the result
     * that could come here can be coupled correctly
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static getWhereQuery(query: any): WhereAutoClause {
        return buildWhereSequelizeFilters(query, this.queryAllowedFields);
    }
}
