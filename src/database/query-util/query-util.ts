import { ModuleDataSource, Optional, SQLError, SQLErrors } from '@heronjs/common';
import { KnexClient } from '@heronjs/core';
import { Knex } from 'knex';
import { ShortIdUtil } from '../../common';
import {
    EavAttributeTable,
    EavAttributeTypes,
    EavAttributeValueDecimalTable,
    EavAttributeValueTable,
} from '../../eav';
import { DATABASE_DECRALATION } from '../database.decralation';
import { IBaseTable, QueryActions, RelationMetadata, RelationTable, TableRelationships } from '../table';
import {
    BuilderOperators,
    ComparisonOperators,
    CustomOperators,
    LogicalOperators,
    TransformJoinResultTypes,
} from './query-util.enums';
import {
    AllTables,
    ComparisonInput,
    CustomInput,
    EavAttributeTableData,
    EavAttributeTables,
    EavQueryInput,
    FilterHandler,
    FilterHandlerMap,
    FilterInput,
    QueryInput,
    QueryUtilJoinOptions,
    QueryUtilMethodOptions,
    QueryUtilUpsertOptions,
    ResolveAttributes,
    SelectInput,
    SortInput,
} from './query-util.types';

export interface IQueryUtil<DTO> {
    getTable(tableName: string): IBaseTable;
    startTrx(): Promise<Knex.Transaction>;
    commitTrx(trx: Knex.Transaction): Promise<void>;
    rollbackTrx(trx: Knex.Transaction): Promise<void>;
    transaction(exec: (trx: Knex.Transaction) => Promise<any>): Promise<void>;
    create(tableName: string, dto: DTO, options?: QueryUtilMethodOptions): Knex.QueryBuilder;
    createList(tableName: string, dtos: DTO[], options?: QueryUtilMethodOptions): Knex.QueryBuilder;
    updateById(
        tableName: string,
        id: string,
        dto: Partial<DTO>,
        options?: QueryUtilMethodOptions,
    ): Knex.QueryBuilder;
    updateList(tableName: string, dtos: Partial<DTO>[], options?: QueryUtilMethodOptions): Promise<void>;
    upsertById(
        tableName: string,
        id: string,
        dto: Partial<DTO>,
        options?: QueryUtilMethodOptions & QueryUtilUpsertOptions,
    ): Knex.QueryBuilder;
    upsertList(
        tableName: string,
        dtos: Partial<DTO>[],
        options?: QueryUtilMethodOptions & QueryUtilUpsertOptions,
    ): Promise<void>;
    deleteById(tableName: string, id: string, options?: QueryUtilMethodOptions): Knex.QueryBuilder;
    deleteList(tableName: string, ids: string[], options?: QueryUtilMethodOptions): Knex.QueryBuilder;
    find(
        tableName: string,
        payload?: QueryInput<DTO>,
        options?: QueryUtilMethodOptions &
            QueryUtilJoinOptions<DTO> & {
                tb?: IBaseTable;
                relations?: RelationTable[];
            },
    ): Knex.QueryBuilder;
    count(
        tableName: string,
        payload?: QueryInput<DTO>,
        options?: QueryUtilMethodOptions &
            QueryUtilJoinOptions<DTO> & {
                tb?: IBaseTable;
                relations?: RelationTable[];
            },
    ): Knex.QueryBuilder;
    transform(
        tableName: string,
        records: Optional<any[]>,
        payload: QueryInput<DTO>,
        options?: QueryUtilMethodOptions &
            QueryUtilJoinOptions<DTO> & {
                tb?: IBaseTable;
                relations?: RelationTable[];
            },
    ): Promise<Partial<DTO>[]>;
    findAndTransform(
        tableName: string,
        payload?: QueryInput<DTO>,
        options?: QueryUtilMethodOptions & QueryUtilJoinOptions<DTO>,
    ): Promise<Partial<DTO>[]>;
}

export interface IEavQueryUtil<DTO> extends IQueryUtil<DTO> {
    find(
        tableName: string,
        payload?: EavQueryInput<DTO>,
        options?: QueryUtilMethodOptions &
            QueryUtilJoinOptions & {
                tb?: IBaseTable;
                relations?: RelationTable[];
            },
    ): Knex.QueryBuilder;
    count(
        tableName: string,
        payload?: EavQueryInput<DTO>,
        options?: QueryUtilMethodOptions &
            QueryUtilJoinOptions & {
                tb?: IBaseTable;
                relations?: RelationTable[];
            },
    ): Knex.QueryBuilder;
    transform(
        tableName: string,
        records: Optional<any[]>,
        payload: EavQueryInput<DTO>,
        options?: QueryUtilMethodOptions &
            QueryUtilJoinOptions & {
                tb?: IBaseTable;
                relations?: RelationTable[];
            },
    ): Promise<Partial<DTO>[]>;
    findAndTransform(
        tableName: string,
        payload?: EavQueryInput<DTO>,
        options?: QueryUtilMethodOptions & QueryUtilJoinOptions,
    ): Promise<Partial<DTO>[]>;
    getAttributeTableData(tableName: string): EavAttributeTableData[];
    updateEavAttributeTable(tableName: string, data: EavAttributeTableData): void;
}

export class BaseQueryUtil<DTO extends Record<string, any> = Record<string, any>>
    implements IEavQueryUtil<DTO>
{
    protected readonly client: KnexClient;
    protected readonly allTables: AllTables;
    protected readonly eavAttributeTables: EavAttributeTables = new Map<string, EavAttributeTableData[]>();
    protected readonly tableConstrainNameMap = new Map();

    constructor(payload: { db: ModuleDataSource<KnexClient>; tables: AllTables }) {
        const { db, tables } = payload;
        const client = db.database();
        if (!client) throw new SQLError(SQLErrors.CONNECTION_ERR, 'Database client is undefined');

        this.client = client;
        this.allTables = tables;
        this.setEavAttributeTable();

        this.allTables.forEach((table) => {
            if (!table.eav) return;
            const tableName = table.eav.attributeTable;
            const attributeTable = new EavAttributeTable({ tableName });
            this.allTables.set(tableName, attributeTable);
            if (table.eav.attributeValueTables.varchar) {
                const tableName = table.eav.attributeValueTables.varchar;
                const attributeValueTable = new EavAttributeValueTable({
                    tableName,
                });
                this.allTables.set(tableName, attributeValueTable);
            }
            if (table.eav.attributeValueTables.int) {
                const tableName = table.eav.attributeValueTables.int;
                const attributeValueTable = new EavAttributeValueTable({
                    tableName,
                });
                this.allTables.set(tableName, attributeValueTable);
            }
            if (table.eav.attributeValueTables.datetime) {
                const tableName = table.eav.attributeValueTables.datetime;
                const attributeValueTable = new EavAttributeValueTable({
                    tableName,
                });
                this.allTables.set(tableName, attributeValueTable);
            }
            if (table.eav.attributeValueTables.text) {
                const tableName = table.eav.attributeValueTables.text;
                const attributeValueTable = new EavAttributeValueTable({
                    tableName,
                });
                this.allTables.set(tableName, attributeValueTable);
            }
            if (table.eav.attributeValueTables.decimal) {
                const tableName = table.eav.attributeValueTables.decimal;
                const attributeValueTable = new EavAttributeValueDecimalTable({
                    tableName,
                });
                this.allTables.set(tableName, attributeValueTable);
            }
        });
    }

    getClient(tenantId?: string): KnexClient {
        return this.client;
    }

    getQueryBuilder(tenantId?: string): Knex.QueryBuilder {
        return this.client.queryBuilder();
    }

    getTable(tableName: string): IBaseTable {
        const tb = this.allTables.get(tableName);
        if (!tb) throw new Error(`Table ${tableName} not found`);
        return tb;
    }

    async startTrx(tenantId?: string): Promise<Knex.Transaction> {
        return this.getClient(tenantId).transaction();
    }

    async commitTrx(trx: Knex.Transaction): Promise<void> {
        await trx.commit();
    }

    async rollbackTrx(trx: Knex.Transaction): Promise<void> {
        await trx.rollback();
    }

    async transaction(exec: (trx: Knex.Transaction) => Promise<any>, tenantId?: string) {
        await this.getClient(tenantId).transaction((trx) => exec(trx));
    }

    create(tableName: string, dto: DTO, options: QueryUtilMethodOptions = {}) {
        const tb = this.getTable(tableName);
        const record = tb.fromDto(dto).toRecord({ action: QueryActions.CREATE });

        const query = this.getQueryBuilder(options.tenantId).from(tb.tableName).insert(record);

        if (options.trx) query.transacting(options.trx);

        return query;
    }

    createList(tableName: string, dtos: DTO[], options: QueryUtilMethodOptions = {}) {
        const tb = this.getTable(tableName);
        const records = dtos.map((dto: any) =>
            tb.fromDto(dto).toRecord({ action: QueryActions.CREATE_LIST }),
        );

        const query = this.getQueryBuilder(options.tenantId).from(tb.tableName).insert(records);

        if (options.trx) query.transacting(options.trx);

        return query;
    }

    updateById(tableName: string, id: string, dto: Partial<DTO>, options: QueryUtilMethodOptions = {}) {
        const tb = this.getTable(tableName);
        const record = tb.fromDto(dto).toRecord({ action: QueryActions.UPDATE });

        const query = this.getQueryBuilder(options.tenantId)
            .from(tb.tableName)
            .update(record)
            .where(tb.primaryKeyColumnName, id);

        if (options.trx) query.transacting(options.trx);

        return query;
    }

    async updateList(tableName: string, dtos: Partial<DTO>[], options: QueryUtilMethodOptions = {}) {
        const tb = this.getTable(tableName);
        const exec = async (trx: Knex.Transaction) =>
            Promise.all(
                dtos.map((dto) => {
                    const record = tb.fromDto(dto).toRecord({ action: QueryActions.UPDATE_LIST });
                    return this.getQueryBuilder(options.tenantId)
                        .from(tb.tableName)
                        .update(record)
                        .where(tb.primaryKeyColumnName, record[tb.primaryKeyColumnName])
                        .transacting(trx);
                }),
            );

        if (options.trx) await exec(options.trx);
        else await this.transaction(exec);
    }

    upsertById(
        tableName: string,
        id: string,
        dto: Partial<DTO>,
        options: QueryUtilMethodOptions & QueryUtilUpsertOptions = {},
    ) {
        const tb = this.getTable(tableName);
        const record = tb.fromDto(dto).toRecord({ action: QueryActions.UPSERT });

        const query = this.getQueryBuilder(options.tenantId)
            .from(tb.tableName)
            .insert({
                ...record,
                [tb.primaryKeyColumnName]: id,
            });

        switch (options.onConflict) {
            case 'ignore':
                query.onConflict(tb.primaryKeyColumnName).ignore();
                break;
            case 'merge':
            default:
                query.onConflict(tb.primaryKeyColumnName).merge();
                break;
        }

        if (options.trx) query.transacting(options.trx);

        return query;
    }

    async upsertList(
        tableName: string,
        dtos: Partial<DTO>[],
        options: QueryUtilMethodOptions & QueryUtilUpsertOptions = {},
    ) {
        const tb = this.getTable(tableName);
        const onConflict = options.conflictColumn ?? tb.primaryKeyColumnName;

        const exec = async (trx: Knex.Transaction) =>
            Promise.all(
                dtos.map((dto) => {
                    const record = tb.fromDto(dto).toRecord({ action: QueryActions.UPSERT_LIST });
                    const query = this.getQueryBuilder(options.tenantId).from(tb.tableName).insert(record);
                    switch (options.onConflict) {
                        case 'ignore':
                            query.onConflict(onConflict).ignore();
                            break;
                        case 'merge':
                        default:
                            query.onConflict(onConflict).merge();
                            break;
                    }
                    query.transacting(trx);
                    return query;
                }),
            );
        if (options.trx) await exec(options.trx);
        else await this.transaction(exec);
    }

    deleteById(tableName: string, id: string, options: QueryUtilMethodOptions = {}) {
        const tb = this.getTable(tableName);
        const query = this.getQueryBuilder(options.tenantId)
            .from(tb.tableName)
            .where(tb.primaryKeyColumnName, id)
            .delete();

        if (options.trx) query.transacting(options.trx);

        return query;
    }

    deleteList(tableName: string, ids: string[], options: QueryUtilMethodOptions = {}) {
        const tb = this.getTable(tableName);
        const query = this.getQueryBuilder(options.tenantId)
            .from(tb.tableName)
            .whereIn(tb.primaryKeyColumnName, ids)
            .delete();

        if (options.trx) query.transacting(options.trx);

        return query;
    }

    find(
        tableName: string,
        payload: EavQueryInput<DTO> = {},
        options: QueryUtilMethodOptions &
            QueryUtilJoinOptions<DTO> & {
                tb?: IBaseTable;
                relations?: RelationTable[];
                hasJoinMany?: boolean;
            } = {},
    ) {
        const tb = options.tb ?? this.getTable(tableName);

        let relations, hasJoinMany;
        if (options.relations) {
            relations = options.relations;
            hasJoinMany = options.hasJoinMany;
        } else {
            const relationData = this.getRelationsData({
                table: tb,
                options,
            });
            relations = relationData.relations;
            hasJoinMany = relationData.hasJoinMany;
        }
        const query = this.getQueryBuilder(options.tenantId).from(tb.tableName).queryContext({
            useMaster: options.useMaster,
        });

        if (options.trx) query.transacting(options.trx);

        if (options.forUpdate) query.forUpdate();

        this.buildJoinQuery({
            payload,
            query,
            relations,
            mainTable: tb,
            ignoreLazy: true, // ignoreLazy al level 1
        });

        if (hasJoinMany) {
            const subQuery = query.clone();
            subQuery.clearSelect();
            this.buildWhereQuery({
                query: subQuery,
                filter: payload.filter,
                eavFilter: payload.eavFilter,
                tables: this.allTables,
                mainTable: tb,
            });
            this.buildSortQuery({
                query: subQuery,
                sort: payload.sort,
                tables: this.allTables,
                mainTable: tb,
                applyFirstLevel: true,
            });
            subQuery.distinct(tb.getPrimaryKeyColumnName());

            if (payload.offset) subQuery.offset(payload.offset);
            if (payload.limit) subQuery.limit(payload.limit);

            query.whereIn(tb.getPrimaryKeyColumnName(), subQuery);
        } else {
            this.buildWhereQuery({
                query,
                filter: payload.filter,
                eavFilter: payload.eavFilter,
                tables: this.allTables,
                mainTable: tb,
            });
            if (payload.offset) query.offset(payload.offset);
            if (payload.limit) query.limit(payload.limit);
        }

        this.buildSortQuery({
            query,
            sort: payload.sort,
            tables: this.allTables,
            mainTable: tb,
        });
        query.select(
            tb.getSelectionFields({
                tableName: tb.tableName,
                selectedFields: this.getSelectByTableName(payload.select, tb.tableName),
            }),
        );

        return query;
    }

    count(
        tableName: string,
        payload: EavQueryInput<DTO> = {},
        options: QueryUtilMethodOptions &
            QueryUtilJoinOptions<DTO> & {
                tb?: IBaseTable;
                relations?: RelationTable[];
            } = {},
    ) {
        const tb = options.tb ?? this.getTable(tableName);
        return this.find(tableName, payload, options)
            .clearSelect()
            .countDistinct(tb.getPrimaryKeyColumnName());
    }

    async transform(
        tableName: string,
        records: Optional<any[]>,
        payload: EavQueryInput<DTO>,
        options: QueryUtilMethodOptions &
            QueryUtilJoinOptions<DTO> & {
                tb?: IBaseTable;
                relations?: RelationTable[];
                hasMany?: boolean;
            } = {},
    ) {
        const tb = options.tb ?? this.getTable(tableName);

        const relations =
            options.relations ??
            this.getRelationsData({
                table: tb,
                options,
            }).relations;

        if (records === undefined || records.length === 0) return [];

        let finalResults = records;

        if (relations) {
            const joinRelations = relations.filter((r) => !r.options?.lazy);
            const lazyRelations = relations.filter((r) => r.options?.lazy);
            const temps = new Map<string, object>();
            const joinRelationsMapData = new Map<string, any>();
            const lazyRelationsMapData = new Map<string, any>();

            records.forEach((result: { [x: string]: any }) => {
                const id = result[tb.getPrimaryKeyColumnName()];
                if (!joinRelationsMapData.get(id)) joinRelationsMapData.set(id, result);

                if (joinRelations.length) {
                    joinRelations.forEach((relation) => {
                        this.transformJoinResult({
                            result,
                            finalResult: joinRelationsMapData.get(id),
                            relation,
                            temps,
                            itemId: id,
                            type: TransformJoinResultTypes.Multiple,
                        });
                    });
                }
            });

            if (lazyRelations.length) {
                await Promise.all(
                    lazyRelations.map(async (relation) => {
                        const relationTable: IBaseTable = this.getTable(relation.tableName)!;

                        const localIds = Array.from(
                            new Set(records.map((record) => record[`${tb.tableName}.${relation.localId}`])),
                        );
                        let selectedFields = payload.select;
                        if (relation.isEav && payload.eavSelect) {
                            selectedFields = payload.eavSelect;
                        }
                        const query = this.getQueryBuilder(options.tenantId)
                            .from(relation.tableName)
                            .queryContext({
                                useMaster: options.useMaster,
                            })
                            .whereIn(relation.refId, localIds)
                            .select(
                                relationTable.getSelectionFields({
                                    tableName: relation.tableName,
                                    selectedFields: this.getSelectByTableName(
                                        selectedFields,
                                        relation.tableName,
                                    ),
                                }),
                            );
                        if (relation.children && relation.children.length) {
                            this.buildJoinQuery({
                                payload,
                                query,
                                relations: relation.children,
                                mainTable: relationTable,
                            });
                        }

                        const rawData = await query;
                        const data = await this.transform(relation.tableName, rawData, payload, {
                            tb: relationTable,
                            relations: relation.children,
                            useMaster: options.useMaster,
                            trx: options.trx,
                        });
                        rawData.forEach((item: any, index: number) => {
                            const id = item[`${relationTable.tableName}.${relation.refId}`];
                            const current =
                                lazyRelationsMapData.get(id) ?? lazyRelationsMapData.set(id, {}).get(id);

                            switch (relation.relationship) {
                                case TableRelationships.ONE_TO_ONE:
                                case TableRelationships.MANY_TO_ONE:
                                    current[relation.name] = data[index];
                                    return;
                                case TableRelationships.ONE_TO_MANY:
                                case TableRelationships.MANY_TO_MANY:
                                    if (!current[relation.name]) current[relation.name] = [];
                                    current[relation.name].push(data[index]);
                            }
                        });
                    }),
                );
            }

            finalResults = Array.from(joinRelationsMapData.keys()).map((key) => ({
                ...(joinRelationsMapData.get(key) ?? {}),
                ...(lazyRelationsMapData.get(key) ?? {}),
            }));
        }

        return finalResults.map((result: any) => tb.toDto(tb.toTable<IBaseTable>(result)));
    }

    async findAndTransform(
        tableName: string,
        payload: EavQueryInput<DTO> = {},
        options: QueryUtilMethodOptions & QueryUtilJoinOptions<DTO> = {},
    ) {
        const tb = this.getTable(tableName);

        const relationsData = this.getRelationsData({
            table: tb,
            options,
        });

        const newOptions = { ...options, tb, ...relationsData };

        const results = await this.find(tableName, payload, newOptions);
        return this.transform(tableName, results, payload, newOptions);
    }

    protected getRelationsData({
        table,
        options,
    }: {
        table: IBaseTable;
        options: QueryUtilJoinOptions<any>;
    }): {
        hasJoinMany: boolean;
        relations: Optional<RelationTable[]>;
    } {
        const relations: RelationTable[] = [];
        const resolve = options.resolve;
        if (resolve) return this.resolveRelations({ table, relations, resolve });

        return { hasJoinMany: false, relations: undefined };
    }

    protected filterHandlerMap?: FilterHandlerMap;

    protected getFilterHandler(op: keyof ComparisonInput): Optional<FilterHandler> {
        return this.filterHandlerMap ? this.filterHandlerMap[op] : undefined;
    }

    protected buildWhereQuery({
        query,
        filter,
        eavFilter,
        tables,
        mainTable,
        mainTableName,
    }: {
        query: Knex.QueryBuilder;
        filter?: FilterInput;
        eavFilter?: FilterInput;
        tables: AllTables;
        mainTable: IBaseTable;
        mainTableName?: string;
        relationship?: TableRelationships;
    }): Knex.QueryBuilder {
        if (!filter && !eavFilter) return query;

        if (filter) {
            Object.keys(filter).forEach((field) => {
                const fieldFilter = filter[field];

                if (fieldFilter === undefined) return;

                const columnName = mainTable.getColumnName(field, mainTableName);

                if (!columnName) {
                    const relationMetadata = mainTable.getRelationMetadata(field);

                    if (relationMetadata) {
                        const relationTable = tables.get(relationMetadata.tableName)!;
                        this.buildWhereQuery({
                            query,
                            filter: fieldFilter as FilterInput,
                            tables,
                            mainTable: relationTable,
                            mainTableName: this.getConstraintName(
                                mainTableName || mainTable.tableName,
                                relationMetadata.tableName,
                                relationMetadata.localId,
                                relationMetadata.refId!,
                            ),
                        });
                        return;
                    }

                    if (field === LogicalOperators.$and) {
                        (fieldFilter as FilterInput[]).forEach((filter) =>
                            query.andWhere((subQuery) =>
                                this.buildWhereQuery({
                                    query: subQuery,
                                    filter,
                                    tables,
                                    mainTable,
                                    mainTableName,
                                }),
                            ),
                        );
                        return;
                    }
                    if (field === LogicalOperators.$or) {
                        (fieldFilter as FilterInput[]).forEach((filter) =>
                            query.orWhere((subQuery) =>
                                this.buildWhereQuery({
                                    query: subQuery,
                                    filter,
                                    tables,
                                    mainTable,
                                    mainTableName,
                                }),
                            ),
                        );
                        return;
                    }
                    if (field === LogicalOperators.$not) {
                        query.whereNot((subQuery) =>
                            this.buildWhereQuery({
                                query: subQuery,
                                filter: fieldFilter as FilterInput,
                                tables,
                                mainTable,
                                mainTableName,
                            }),
                        );
                        return;
                    }
                    if (field === BuilderOperators.$builder) {
                        query.where(fieldFilter as (query: Knex.QueryBuilder) => Knex.QueryBuilder);
                        return;
                    }

                    return;
                }

                if (fieldFilter) {
                    Object.keys(fieldFilter).forEach((operator) => {
                        //@ts-ignore
                        const value = fieldFilter[operator];
                        this.transformWhereQuery({
                            query,
                            columnName,
                            queryType: operator,
                            value,
                        });
                    });
                }
            });
        }

        if (eavFilter && mainTable.eav) {
            const attributeTable = this.eavAttributeTables.get(mainTable.eav.attributeTable);
            if (attributeTable) {
                Object.keys(eavFilter).forEach((attributeCode) => {
                    const attribute = attributeTable.find((attr) => attr.code === attributeCode);
                    if (attribute) {
                        const attributeFilter = eavFilter[attributeCode]!;
                        const valueTable = this.getEavAttributeValueTable(mainTable, attribute.type);
                        Object.keys(attributeFilter).forEach((operator) => {
                            //@ts-ignore
                            const value = attributeFilter[operator];
                            this.transformEavWhereQuery({
                                entityTable: mainTable,
                                valueTable,
                                query,
                                attribute: attribute.code,
                                value,
                                operator,
                            });
                        });
                    }
                });
            }
        }
        return query;
    }

    protected transformWhereQuery({
        query,
        columnName,
        queryType,
        value,
        attribute,
    }: {
        query: Knex.QueryBuilder;
        columnName: string;
        queryType: string;
        value: any;
        attribute?: string;
    }) {
        if (value === undefined || value === null) return query;

        if (typeof value === 'string') {
            try {
                value = value.normalize();
                value = JSON.parse(value);
            } catch (error) {
                // Do nothing
            }
        }

        const filterHandler = this.getFilterHandler(queryType as ComparisonOperators);
        if (filterHandler) filterHandler({ query, columnName, value, attribute });
        else {
            switch (queryType) {
                case ComparisonOperators.$eq:
                    if (value === null) query.whereNull(columnName);
                    else query.where(columnName, '=', value);
                    break;
                case ComparisonOperators.$lt:
                    query.where(columnName, '<', value);
                    break;
                case ComparisonOperators.$gt:
                    query.where(columnName, '>', value);
                    break;
                case ComparisonOperators.$lte:
                    query.where(columnName, '<=', value);
                    break;
                case ComparisonOperators.$gte:
                    query.where(columnName, '>=', value);
                    break;
                case ComparisonOperators.$in:
                    query.whereIn(columnName, value);
                    break;
                case ComparisonOperators.$ne:
                    if (value === null) query.whereNotNull(columnName);
                    else query.where(columnName, '<>', value);
                    break;
                case ComparisonOperators.$nin:
                    query.whereNotIn(columnName, value);
                    break;
                case ComparisonOperators.$like:
                    query.where(columnName, 'LIKE', value);
                    break;
                case ComparisonOperators.$ilike:
                    query.where(columnName, 'ILIKE', value);
                    break;
                case ComparisonOperators.$contains:
                    query.where(columnName, 'ILIKE', `%${value}%`);
                    break;
                case ComparisonOperators.$startswith:
                    query.where(columnName, 'ILIKE', `${value}%`);
                    break;
                case ComparisonOperators.$endswith:
                    query.where(columnName, 'ILIKE', `%${value}`);
                    break;
                case CustomOperators.$raw:
                    const rawData = value as CustomInput['$raw'];
                    query.whereRaw(rawData!.query, rawData!.bindings);
                    break;
                default:
                    break;
            }
        }

        return query;
    }

    protected transformEavWhereQuery({
        entityTable,
        valueTable,
        query,
        attribute,
        value,
        operator,
    }: {
        entityTable: IBaseTable;
        valueTable: IBaseTable;
        query: Knex.QueryBuilder;
        attribute: string;
        value: string;
        operator: string;
    }) {
        if (operator === ComparisonOperators.$eq && value === 'null') {
            query.where((builder) => {
                return builder
                    .whereExists((knex) => {
                        const subQuery = knex
                            .from(valueTable.tableName)
                            .where((builder) =>
                                builder
                                    .whereRaw(
                                        `${valueTable.getColumnName(
                                            valueTable.eavColumnNames.entity,
                                        )} = ${entityTable.getPrimaryKeyColumnName()}`,
                                    )
                                    .where(
                                        valueTable.getColumnName(valueTable.eavColumnNames.attribute)!,
                                        attribute,
                                    ),
                            );

                        this.transformWhereQuery({
                            query: subQuery,
                            columnName: valueTable.getColumnName('value')!,
                            queryType: operator,
                            value,
                            attribute,
                        });

                        return subQuery;
                    })
                    .orWhereNotExists((knex) => {
                        return knex
                            .from(valueTable.tableName)
                            .where((builder) =>
                                builder
                                    .whereRaw(
                                        `${valueTable.getColumnName(
                                            valueTable.eavColumnNames.entity,
                                        )} = ${entityTable.getPrimaryKeyColumnName()}`,
                                    )
                                    .where(
                                        valueTable.getColumnName(valueTable.eavColumnNames.attribute)!,
                                        attribute,
                                    ),
                            );
                    });
            });
        } else {
            query.whereExists((knex) => {
                const subQuery = knex
                    .from(valueTable.tableName)
                    .whereRaw(
                        `${valueTable.getColumnName(
                            valueTable.eavColumnNames.entity,
                        )} = ${entityTable.getPrimaryKeyColumnName()}`,
                    )
                    .where(valueTable.getColumnName(valueTable.eavColumnNames.attribute)!, attribute);

                this.transformWhereQuery({
                    query: subQuery,
                    columnName: valueTable.getColumnName('value')!,
                    queryType: operator,
                    value,
                    attribute,
                });

                return subQuery;
            });
        }
    }

    protected buildSortQuery({
        query,
        sort,
        tables,
        mainTable,
        mainTableName,
        applyFirstLevel,
    }: {
        query: Knex.QueryBuilder;
        sort?: SortInput;
        tables: AllTables;
        mainTable: IBaseTable;
        mainTableName?: string;
        applyFirstLevel?: boolean;
    }): Knex.QueryBuilder {
        if (!sort) return query;

        if (typeof sort === 'object') {
            Object.keys(sort).forEach((field) => {
                if (!sort[field]) return;

                // @ts-ignore
                const columnName = mainTable.getColumnName(field, mainTableName);
                if (columnName) {
                    const order = sort[field] as string;
                    if (order) {
                        query.select(columnName);
                        query.orderBy(columnName, order);
                    }
                    return;
                }
                if (!applyFirstLevel) {
                    const relationMetadata = mainTable.getRelationMetadata(field);
                    if (relationMetadata) {
                        const relationTable = tables.get(relationMetadata.tableName)!;
                        this.buildSortQuery({
                            query,
                            sort: sort[field] as SortInput,
                            tables,
                            mainTable: relationTable,
                            mainTableName: this.getConstraintName(
                                mainTableName || mainTable.tableName,
                                relationMetadata.tableName,
                                relationMetadata.localId,
                                relationMetadata.refId!,
                            ),
                        });
                        return;
                    }
                }
                if (mainTable.eav) {
                    const attributeTable = this.eavAttributeTables.get(mainTable.eav.attributeTable);
                    if (attributeTable) {
                        const attribute = attributeTable.find((attr) => attr.code === field);
                        if (attribute) {
                            const valueTable = this.getEavAttributeValueTable(mainTable, attribute.type);
                            this.sortByEavField(
                                mainTable,
                                valueTable.tableName,
                                query,
                                sort[field] as SortInput,
                                field,
                            );
                            return;
                        }
                    }
                }
            });
        }

        return query;
    }

    protected buildJoinQuery({
        payload,
        query,
        relations,
        mainTable,
        mainTableName,
        ignoreLazy = false,
    }: {
        payload: EavQueryInput<DTO>;
        query: Knex.QueryBuilder;
        relations: Optional<RelationTable[]>;
        mainTable: IBaseTable;
        mainTableName?: string;
        ignoreLazy?: boolean;
    }): Knex.QueryBuilder {
        if (relations) {
            (ignoreLazy ? relations.filter((r) => !r.options?.lazy) : relations).forEach((relation) => {
                const relationTable = this.getTable(relation.tableName)!;

                query.leftJoin(
                    `${relationTable.tableName} AS ${relation.constraintName}`,
                    `${mainTableName ? mainTableName : mainTable.tableName}.${relation.localId}`,
                    `${relation.constraintName}.${relation.refId}`,
                );

                query.select(
                    relationTable.getSelectionFields({
                        tableName: relation.constraintName,
                        selectedFields: this.getSelectByTableName(payload.select, relation.constraintName),
                    }),
                );

                if (relation.children && relation.children.length) {
                    this.buildJoinQuery({
                        payload,
                        query,
                        relations: relation.children,
                        mainTable: relationTable,
                        mainTableName: relation.constraintName,
                    });
                }
            });
        }

        return query;
    }

    protected transformJoinResult({
        result,
        finalResult,
        relation,
        temps,
        type = TransformJoinResultTypes.Single,
        itemId,
    }: {
        result: any;
        finalResult: any;
        relation: RelationTable;
        temps: Map<string, object>;
        type?: TransformJoinResultTypes;
        itemId?: string;
    }): void {
        const relationTable: IBaseTable = this.getTable(relation.tableName)!;
        const columnName = relationTable.getPrimaryKeyColumnName(relation.constraintName);
        if (!columnName) return;

        const relationId = result[columnName];
        const relationTableColumnNames = relationTable.getColumnNames({ tableName: relation.constraintName });

        let temp: any;

        switch (type) {
            case TransformJoinResultTypes.Single:
                temp = temps.get(relation.name);
                break;
            case TransformJoinResultTypes.Multiple:
                const tempId = `${itemId}_${relation.constraintName}`;
                if (!temps.get(tempId)) temps.set(tempId, {});
                temp = temps.get(tempId);
                break;
            default:
                break;
        }

        switch (relation.relationship) {
            case TableRelationships.ONE_TO_ONE:
            case TableRelationships.MANY_TO_ONE:
                relationTableColumnNames.forEach(([name, joinName]) => (temp[name] = result[joinName]));

                if (relation.children && relation.children.length) {
                    relation.children.forEach((childRelation) => {
                        this.transformJoinResult({
                            result,
                            finalResult: temp,
                            relation: childRelation,
                            temps,
                            type,
                        });
                    });
                }

                finalResult[relation.name] =
                    relationId === null ? null : relationTable.toDto(relationTable.toTable(temp));
                return;
            case TableRelationships.ONE_TO_MANY:
            case TableRelationships.MANY_TO_MANY:
                if (temp[relationId] && !(relation.children && relation.children.length)) return;

                let isDuplicate = false;

                if (!temp[relationId])
                    switch (type) {
                        case TransformJoinResultTypes.Single:
                            break;
                        case TransformJoinResultTypes.Multiple:
                            if (!finalResult[relation.name]) finalResult[relation.name] = [];
                            break;
                        default:
                            break;
                    }
                else isDuplicate = true;

                if (relationId === null) return;

                if (!temp[relationId]) {
                    temp[relationId] = {};
                    relationTableColumnNames.forEach(
                        ([name, joinName]) => (temp[relationId][name] = result[joinName]),
                    );
                }

                if (relation.children && relation.children.length) {
                    relation.children.forEach((childRelation) => {
                        this.transformJoinResult({
                            result,
                            finalResult: temp[relationId],
                            relation: childRelation,
                            temps,
                            type,
                        });
                    });
                }

                if (isDuplicate) return;

                finalResult[relation.name].push(relationTable.toDto(relationTable.toTable(temp[relationId])));
                break;
            default:
                break;
        }
    }

    protected resolveRelations({
        relations,
        resolve,
        table,
        tableName,
    }: {
        relations: RelationTable[];
        resolve: any[];
        table: IBaseTable;
        tableName?: string;
    }) {
        // TODO: implement caching
        let hasJoinMany = false;
        resolve.forEach((item) => {
            if (typeof item === 'string') {
                if (item === ResolveAttributes) {
                    const eavTable = table.eav.attributeValueTables;
                    Object.values(eavTable).forEach((eavTableName) => {
                        const relation = this.createRelation(table, eavTableName, true, tableName);
                        relations.push(relation);
                    });
                } else {
                    const relation = this.createRelation(table, item, false, tableName);
                    if (
                        !hasJoinMany &&
                        [TableRelationships.ONE_TO_MANY, TableRelationships.MANY_TO_MANY].includes(
                            relation.relationship,
                        ) &&
                        !relation.options?.lazy
                    )
                        hasJoinMany = true;

                    relations.push(relation);
                }
            } else if (typeof item === 'object') {
                Object.keys(item).forEach((key) => {
                    const relationMetadata: RelationMetadata = Reflect.getMetadata(
                        DATABASE_DECRALATION.TABLE_RELATION,
                        table,
                        key,
                    );
                    const relation = {
                        ...relationMetadata,
                        constraintName: this.getConstraintName(
                            tableName || table.tableName,
                            relationMetadata.tableName,
                            relationMetadata.localId,
                            relationMetadata.refId!,
                        ),
                        children: [],
                    } as RelationTable;
                    if (
                        !hasJoinMany &&
                        (relation.relationship === TableRelationships.ONE_TO_MANY ||
                            relation.relationship === TableRelationships.MANY_TO_MANY) &&
                        !relation.options?.lazy
                    ) {
                        hasJoinMany = true;
                    }
                    relations.push(relation);
                    const childTable = this.getTable(relationMetadata.tableName)!;
                    this.resolveRelations({
                        relations: relation.children!,
                        resolve: item[key],
                        table: childTable,
                        tableName: relation.constraintName,
                    });
                });
            }
        });

        return { hasJoinMany, relations };
    }

    protected getConstraintName(
        localTableName: string,
        refTableName: string,
        localId: string,
        refId: string,
    ) {
        const name = `${localTableName}_${refTableName}__${localId}_${refId}`;
        if (!this.tableConstrainNameMap.get(name))
            this.tableConstrainNameMap.set(name, ShortIdUtil.instance.randomUUID(5));
        return this.tableConstrainNameMap.get(name);
    }

    protected sortByEavField(
        mainTable: IBaseTable,
        valueTableName: string,
        query: Knex.QueryBuilder,
        sortOrder: SortInput,
        attributeCode: string,
        tenantId?: string,
    ) {
        // TODO: multi-tenant for eav
        const indexColumn = this.getClient(tenantId).raw(
            'ROW_NUMBER() OVER (ORDER BY value ' + sortOrder + ') as index',
        );
        const mainTableId = mainTable.tableName + '.' + mainTable.getPrimaryKeyColumnName();
        const subEavTable = attributeCode + '_index';
        const subEavTableEntityId = subEavTable + '.entity_id';
        const subEavTableIndex = subEavTable + '.index';
        query
            .leftJoin(
                (query) =>
                    query
                        .from(valueTableName)
                        .select('entity_id', 'value', indexColumn)
                        .where('attribute_code', attributeCode)
                        .as(subEavTable),
                mainTableId,
                subEavTableEntityId,
            )
            .select(subEavTableIndex);
        query.orderBy(subEavTableIndex);
        return query;
    }

    private getSelectByTableName(select?: SelectInput, tableName?: string) {
        if (Array.isArray(select)) {
            return select;
        }
        if (tableName && typeof select === 'object' && select[tableName]) {
            return select[tableName];
        }
    }

    private createRelation(table: IBaseTable, item: string, isEav: boolean, constraintName?: string) {
        let relationMetadata: RelationMetadata;
        if (isEav) {
            relationMetadata = {
                name: ResolveAttributes,
                tableName: item,
                localId: 'id',
                refId: 'entity_id',
                relationship: TableRelationships.ONE_TO_MANY,
                options: {
                    lazy: true,
                },
                isEav: true,
            };
        } else {
            relationMetadata = Reflect.getMetadata(DATABASE_DECRALATION.TABLE_RELATION, table, item);
        }
        return {
            ...relationMetadata,
            constraintName: this.getConstraintName(
                constraintName || table.tableName,
                relationMetadata.tableName,
                relationMetadata.localId,
                relationMetadata.refId!,
            ),
        } as RelationTable;
    }

    private async setEavAttributeTable() {
        const tableList = [];
        const queryList = [];
        for (const item of this.allTables) {
            const table = item[1];
            if (table.eav) {
                // TODO: multi-tenant for eav
                const query = this.getQueryBuilder().from(table.eav.attributeTable).select(['code', 'type']);
                tableList.push(table.eav.attributeTable);
                queryList.push(query);
            }
        }
        if (queryList.length) {
            const attributeTables = await Promise.all(queryList);
            let index = 0;
            for (const attributeTable of attributeTables) {
                this.eavAttributeTables.set(tableList[index], attributeTable);
                index++;
            }
        }
    }

    getAttributeTableData(tableName: string) {
        const value = this.eavAttributeTables.get(tableName);
        return value ?? [];
    }

    /*
     *  Add {code, type} to eavAttributeTables for query purpose
     */
    updateEavAttributeTable(tableName: string, data: EavAttributeTableData) {
        const value = this.eavAttributeTables.get(tableName);
        if (value) {
            value.push(data);
            this.eavAttributeTables.set(tableName, value);
        }
    }

    private getEavAttributeValueTable(mainTable: IBaseTable, type: string): IBaseTable {
        let tableName;
        const attributeValueTables = mainTable.eav.attributeValueTables;
        switch (type) {
            case EavAttributeTypes.VARCHAR:
                tableName = attributeValueTables.varchar;
                break;
            case EavAttributeTypes.INT:
                tableName = attributeValueTables.int;
                break;
            case EavAttributeTypes.DECIMAL:
                tableName = attributeValueTables.decimal;
                break;
            case EavAttributeTypes.DATETIME:
                tableName = attributeValueTables.datetime;
                break;
            case EavAttributeTypes.TEXT:
                tableName = attributeValueTables.text;
                break;
        }
        if (!tableName) throw new Error(`Table ${tableName} not found`);
        return this.getTable(tableName);
    }
}
