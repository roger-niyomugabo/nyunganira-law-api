/* eslint-disable @typescript-eslint/member-ordering */
import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize
} from 'sequelize';
import {
    OrderClause,
    QueryParameterType,
    WhereAutoClause
} from 'interfaces/sequelize_query_builder';
import {
    buildOrderSequelizeFilters,
    buildSelectionSequelizeFilters,
    buildWhereSequelizeFilters
} from '../../utils';
import { genderT, roleT } from '../../interfaces/userInterface';

export class User extends Model<
InferAttributes<User>,
InferCreationAttributes<User>
> {
    declare id: CreationOptional<string>;
    declare fullName: string;
    declare email: string;
    declare gender: genderT;
    declare phoneNumber: string;
    declare password: string;
    declare role: roleT;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static initModel(sequelize: Sequelize): typeof User {
        User.init(
            {
                id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    unique: true,
                    autoIncrement: false,
                    allowNull: false,
                    defaultValue: Sequelize.literal('gen_random_uuid()'),
                },
                fullName: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                gender: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                phoneNumber: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                role: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                createdAt: {
                    type: DataTypes.DATE,
                },
                updatedAt: {
                    type: DataTypes.DATE,
                },
            },
            {
                modelName: 'user',
                sequelize,
            }
        );

        return User;
    }

    static selectionAllowedFields: string[] = [
        'id',
        'fullName',
        'email',
        'gender',
        'phoneNumber',
        'role',
        'createdAt',
        'updatedAt',
    ];
    static defaultSortFields: OrderClause[] = [
        ['role', 'asc'],
        ['createdAt', 'desc'],
        ['fullName', 'asc'],
    ];
    static sortAllowedFields: string[] = [
        'role',
        'fullName',
        'gender',
        'createdAt',
        'updatedAt',
    ];
    static queryAllowedFields: { [field: string]: { type: QueryParameterType } } =
        {
            id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            gender: { type: 'string' },
            phoneNumber: { type: 'string' },
            role: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
        };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static getOrderQuery(query: any): OrderClause[] {
        return buildOrderSequelizeFilters(
            query,
            this.defaultSortFields,
            this.sortAllowedFields
        );
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
