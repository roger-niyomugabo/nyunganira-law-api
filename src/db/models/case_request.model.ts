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
import { caseRequestStatusT } from '../../interfaces';
import { Lawyer } from './lawyer_user';

export class CaseRequest extends Model<
InferAttributes<CaseRequest>,
InferCreationAttributes<CaseRequest>
> {
    declare id: CreationOptional<string>;
    declare clientId: ForeignKey<User['id']>;
    declare lawyerId: ForeignKey<Lawyer['id']>;
    declare description: string;
    declare caseFile: string;
    declare downPayment: number;
    declare fullPayment: number;
    declare status: caseRequestStatusT;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // client belongs to User
    declare client?: NonAttribute<User>;
    declare getUser: HasManyGetAssociationsMixin<User>;
    declare setUser: HasManySetAssociationsMixin<User, number>;
    declare createUser: HasManyCreateAssociationMixin<User>;

    // Lawyer belongs to User
    declare lawyer?: NonAttribute<Lawyer>;
    declare getLawyer: HasManyGetAssociationsMixin<Lawyer>;
    declare setLawyer: HasManySetAssociationsMixin<Lawyer, number>;
    declare createLawyer: HasManyCreateAssociationMixin<Lawyer>;

    declare static associations: {
        User: Association<CaseRequest, User>;
        Lawyer: Association<CaseRequest, Lawyer>;
    };

    static initModel(sequelize: Sequelize): typeof CaseRequest {
        CaseRequest.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                unique: true,
                autoIncrement: false,
                allowNull: false,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            caseFile: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            downPayment: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            fullPayment: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'requested',
            },
            createdAt: {
                type: DataTypes.DATE,
            },
            updatedAt: {
                type: DataTypes.DATE,
            },
        }, {
            modelName: 'case_request',
            sequelize,
        });

        return CaseRequest;
    }

    static selectionAllowedFields: string[] =
        ['id', 'description', 'caseFile', 'downPayment', 'fullPayment', 'status', 'createdAt', 'updatedAt'];
    static defaultSortFields: OrderClause[] = [
        ['createdAt', 'desc'],
    ];
    static sortAllowedFields: string[] = ['status', 'downPayment', 'fullPayment', 'createdAt', 'updatedAt'];
    static queryAllowedFields: { [field: string]: { type: QueryParameterType } } = {
        id: { type: 'string' },
        description: { type: 'string' },
        downPayment: { type: 'number' },
        fullPayment: { type: 'number' },
        status: { type: 'string' },
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
