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

export class AdminUser extends Model<
InferAttributes<AdminUser>,
InferCreationAttributes<AdminUser>
> {
    declare id: CreationOptional<string>;
    declare userId: ForeignKey<User['id']>;
    declare position: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // Admin User belongs to a User
    declare user?: NonAttribute<User>;
    declare getUser: HasManyGetAssociationsMixin<User>;
    declare setUser: HasManySetAssociationsMixin<User, number>;
    declare createUser: HasManyCreateAssociationMixin<User>;

    declare static associations: {
        User: Association<AdminUser, User>;
    };

    static initModel(sequelize: Sequelize): typeof AdminUser {
        AdminUser.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                unique: true,
                autoIncrement: false,
                allowNull: false,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            position: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
            },
            updatedAt: {
                type: DataTypes.DATE,
            },
        }, {
            modelName: 'admin_user',
            sequelize,
        });

        return AdminUser;
    }

    static selectionAllowedFields: string[] = ['id', 'position', 'createdAt', 'updatedAt'];
    static defaultSortFields: OrderClause[] = [
        ['position', 'asc'], ['createdAt', 'desc'],
    ];
    static sortAllowedFields: string[] = ['createdAt', 'updatedAt'];
    static queryAllowedFields: { [field: string]: { type: QueryParameterType } } = {
        id: { type: 'string' },
        position: { type: 'string' },
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
