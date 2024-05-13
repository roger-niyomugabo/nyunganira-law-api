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
import { AdminUser } from './admin_user';

export class User extends Model<
InferAttributes<User>,
InferCreationAttributes<User>
> {
    declare id: CreationOptional<string>;
    declare firstname: string;
    declare surname: string;
    declare email: string;
    declare NID: string;
    declare gender: genderT;
    declare phoneNumber: string;
    declare password: string;
    declare role: roleT;
    declare isVerified: boolean;
    declare userDataId: ForeignKey<
    AdminUser['id']
    >;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // User hasOne AdminUser
    declare adminUser?: NonAttribute<AdminUser>;
    declare getAdminUser: HasManyGetAssociationsMixin<AdminUser>;
    declare setAdminUser: HasManySetAssociationsMixin<AdminUser, number>;
    declare createAdminUser: HasManyCreateAssociationMixin<AdminUser>;

    declare static associations: {
        AdminUser: Association<User, AdminUser>;
    };

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
                firstname: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                surname: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                NID: {
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
                isVerified: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
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
        'firstname',
        'surname',
        'email',
        'NID',
        'gender',
        'phoneNumber',
        'role',
        'isVerified',
        'createdAt',
        'updatedAt',
    ];
    static defaultSortFields: OrderClause[] = [
        ['role', 'asc'],
        ['firstname', 'asc'],
        ['createdAt', 'desc'],
    ];
    static sortAllowedFields: string[] = [
        'role',
        'firstname',
        'surname',
        'gender',
        'createdAt',
        'updatedAt',
    ];
    static queryAllowedFields: { [field: string]: { type: QueryParameterType } } =
        {
            id: { type: 'string' },
            firstname: { type: 'string' },
            surname: { type: 'string' },
            email: { type: 'string' },
            NID: { type: 'string' },
            gender: { type: 'string' },
            phoneNumber: { type: 'string' },
            role: { type: 'string' },
            isVerified: { type: 'boolean' },
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
