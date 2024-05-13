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
import { User } from './user.model';

export class Lawyer extends Model<
InferAttributes<Lawyer>,
InferCreationAttributes<Lawyer>
> {
    declare id: CreationOptional<string>;
    declare userId: ForeignKey<User['id']>;
    declare profilePicture: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // Lawyer belongsTo User
    declare user?: NonAttribute<User>;
    declare getUser: HasManyGetAssociationsMixin<User>;
    declare setUser: HasManySetAssociationsMixin<User, number>;
    declare createUser: HasManyCreateAssociationMixin<User>;

    declare static associations: {
        User: Association<Lawyer, User>;
    };

    static initModel(sequelize: Sequelize): typeof Lawyer {
        Lawyer.init(
            {
                id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    unique: true,
                    autoIncrement: false,
                    allowNull: false,
                    defaultValue: Sequelize.literal('gen_random_uuid()'),
                },
                profilePicture: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: 'avatar',
                },
                createdAt: {
                    type: DataTypes.DATE,
                },
                updatedAt: {
                    type: DataTypes.DATE,
                },
            },
            {
                modelName: 'lawyer',
                sequelize,
            }
        );

        return Lawyer;
    }

    static selectionAllowedFields: string[] = ['id', 'province', 'district', 'sector', 'cell', 'street', 'createdAt', 'updatedAt'];
    static defaultSortFields: OrderClause[] = [
        ['createdAt', 'desc'], ['district', 'asc'],
    ];
    static sortAllowedFields: string[] = ['province', 'district', 'sector', 'cell', 'createdAt', 'updatedAt'];
    static queryAllowedFields: { [field: string]: { type: QueryParameterType } } =
        {
            id: { type: 'string' },
            province: { type: 'string' },
            district: { type: 'string' },
            sector: { type: 'string' },
            cell: { type: 'string' },
            street: { type: 'string' },
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
