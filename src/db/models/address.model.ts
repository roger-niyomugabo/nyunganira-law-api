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
import { genderT } from '../../interfaces/userInterface';
import { Lawyer } from './lawyer_user';

export class Address extends Model<
InferAttributes<Address>,
InferCreationAttributes<Address>
> {
    declare id: CreationOptional<string>;
    declare lawyerId: ForeignKey<Lawyer['id']>;
    declare province: string;
    declare district: string;
    declare sector: genderT;
    declare cell: string;
    declare street?: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // Address belongs to Lawyer
    declare lawyer?: NonAttribute<Lawyer>;
    declare getLawyer: HasManyGetAssociationsMixin<Lawyer>;
    declare setLawyer: HasManySetAssociationsMixin<Lawyer, number>;
    declare createLawyer: HasManyCreateAssociationMixin<Lawyer>;

    declare static associations: {
        Lawyer: Association<Address, Lawyer>;
    };

    static initModel(sequelize: Sequelize): typeof Address {
        Address.init(
            {
                id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    unique: true,
                    autoIncrement: false,
                    allowNull: false,
                    defaultValue: Sequelize.literal('gen_random_uuid()'),
                },
                province: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                district: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                sector: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                cell: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                street: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                createdAt: {
                    type: DataTypes.DATE,
                },
                updatedAt: {
                    type: DataTypes.DATE,
                },
            },
            {
                modelName: 'address',
                sequelize,
            }
        );

        return Address;
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
