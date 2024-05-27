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

export class Story extends Model<
InferAttributes<Story>,
InferCreationAttributes<Story>
> {
    declare id: CreationOptional<string>;
    declare title: string;
    declare image: string;
    declare content: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static initModel(sequelize: Sequelize): typeof Story {
        Story.init(
            {
                id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    unique: true,
                    autoIncrement: false,
                    allowNull: false,
                    defaultValue: Sequelize.literal('gen_random_uuid()'),
                },
                title: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                image: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                content: {
                    type: DataTypes.TEXT,
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
                modelName: 'story',
                sequelize,
            }
        );

        return Story;
    }

    static selectionAllowedFields: string[] = ['id', 'title', 'image', 'content', 'createdAt', 'updatedAt'];
    static defaultSortFields: OrderClause[] = [
        ['createdAt', 'desc'], ['title', 'asc'],
    ];
    static sortAllowedFields: string[] = ['title', 'createdAt', 'updatedAt'];
    static queryAllowedFields: { [field: string]: { type: QueryParameterType } } =
        {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
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
