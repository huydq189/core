import { Logger, ModuleDataSource, Optional, SQLError, SQLErrors } from '@heronjs/common';
import { KnexClient } from '@heronjs/core';
import { Knex } from 'knex';
import {
    IQueryUtil,
    QueryInput,
    QueryInputFindOne,
    QueryUtilJoinOptions,
    QueryUtilMethodOptions,
    QueryUtilUpsertOptions,
} from '../query-util';
import { IBaseTable } from '../table';

export interface IBaseDao<T> {
    client: KnexClient;

    startTrx(): Promise<Knex.Transaction>;

    commitTrx(trx: Knex.Transaction): Promise<void>;

    rollbackTrx(trx: Knex.Transaction): Promise<void>;

    transaction(exec: (trx: Knex.Transaction) => Promise<any>): Promise<void>;

    create(dto: T, options?: QueryUtilMethodOptions): Promise<T>;

    createList(dtos: T[], options?: QueryUtilMethodOptions): Promise<T[]>;

    updateById(id: string, dto: Partial<T>, options?: QueryUtilMethodOptions): Promise<Partial<T>>;

    updateList(
        dtos: (Partial<T> & { id: string })[],
        options?: QueryUtilMethodOptions & QueryUtilUpsertOptions,
    ): Promise<Partial<T>[]>;

    upsertById(
        id: string,
        dto: Partial<T>,
        options?: QueryUtilMethodOptions & QueryUtilUpsertOptions,
    ): Promise<Partial<T>>;

    upsertList(
        dtos: (Partial<T> & { id: string })[],
        options?: QueryUtilMethodOptions & QueryUtilUpsertOptions,
    ): Promise<Partial<T>[]>;

    deleteById(id: string, options?: QueryUtilMethodOptions): Promise<string>;

    deleteList(ids: string[], options?: QueryUtilMethodOptions): Promise<string[]>;

    find(
        payload?: QueryInput<T>,
        options?: QueryUtilMethodOptions & QueryUtilJoinOptions<T>,
    ): Promise<Partial<T>[]>;

    count(
        payload?: QueryInput<T>,
        options?: QueryUtilMethodOptions & QueryUtilJoinOptions<T>,
    ): Promise<number>;

    findOne(
        payload?: QueryInputFindOne<T>,
        options?: QueryUtilMethodOptions & QueryUtilJoinOptions<T>,
    ): Promise<Optional<Partial<T>>>;

    getMainTable(): IBaseTable;
}

export class BaseDao<T> implements IBaseDao<T> {
    private readonly _client: KnexClient;
    protected readonly tableName: string;
    protected readonly queryUtil: IQueryUtil<T>;

    constructor(payload: { tableName: string; db: ModuleDataSource<KnexClient>; queryUtil: IQueryUtil<T> }) {
        const { tableName, db, queryUtil } = payload;

        const client = db.database();
        if (!client) throw new SQLError(SQLErrors.CONNECTION_ERR, 'Database client is undefined');

        this.tableName = tableName;
        this._client = client;
        this.queryUtil = queryUtil;
    }

    get client(): KnexClient {
        if (!this._client) throw new SQLError(SQLErrors.CONNECTION_ERR, 'Database client is undefined');
        return this.client;
    }

    getMainTable() {
        return this.queryUtil.getTable(this.tableName);
    }

    async startTrx(): Promise<Knex.Transaction> {
        return this.queryUtil.startTrx();
    }

    async commitTrx(trx: Knex.Transaction): Promise<void> {
        return this.queryUtil.commitTrx(trx);
    }

    async rollbackTrx(trx: Knex.Transaction): Promise<void> {
        return this.queryUtil.rollbackTrx(trx);
    }

    async transaction(exec: (trx: Knex.Transaction) => Promise<any>) {
        return this.queryUtil.transaction((trx) => exec(trx));
    }

    async create(dto: T, options: QueryUtilMethodOptions = {}) {
        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            await this.queryUtil.create(this.tableName, dto, newOptions);
            if (!options.trx) await this.commitTrx(trx);
            return dto;
        } catch (err: any) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async createList(dtos: T[], options: QueryUtilMethodOptions = {}) {
        if (!dtos.length) return dtos;

        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            await this.queryUtil.createList(this.tableName, dtos, newOptions);
            if (!options.trx) await this.commitTrx(trx);
            return dtos;
        } catch (err: any) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async updateById(id: string, dto: Partial<T>, options: QueryUtilMethodOptions = {}) {
        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            await this.queryUtil.updateById(this.tableName, id, dto, newOptions);
            if (!options.trx) await this.commitTrx(trx);
            return dto;
        } catch (err) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async updateList(dtos: (Partial<T> & { id: string })[], options: QueryUtilMethodOptions = {}) {
        if (!dtos.length) return dtos;

        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            await this.queryUtil.updateList(this.tableName, dtos, newOptions);
            if (!options.trx) await this.commitTrx(trx);
            return dtos;
        } catch (err: any) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async upsertById(id: string, dto: Partial<T>, options: QueryUtilMethodOptions = {}) {
        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            await this.queryUtil.upsertById(this.tableName, id, dto, newOptions);
            if (!options.trx) await this.commitTrx(trx);
            return dto;
        } catch (err) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async upsertList(
        dtos: (Partial<T> & { id: string })[],
        options: QueryUtilMethodOptions & QueryUtilUpsertOptions = {},
    ) {
        if (!dtos.length) return dtos;

        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            await this.queryUtil.upsertList(this.tableName, dtos, newOptions);
            if (!options.trx) await this.commitTrx(trx);
            return dtos;
        } catch (err: any) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async deleteById(id: string, options: QueryUtilMethodOptions = {}) {
        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            await this.queryUtil.deleteById(this.tableName, id, newOptions);
            if (!options.trx) await this.commitTrx(trx);
            return id;
        } catch (err) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async deleteList(ids: string[], options: QueryUtilMethodOptions = {}) {
        if (!ids.length) return ids;

        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            if (ids.length) await this.queryUtil.deleteList(this.tableName, ids, newOptions);
            if (!options.trx) await this.commitTrx(trx);
            return ids;
        } catch (err) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async find(payload: QueryInput<T> = {}, options: QueryUtilMethodOptions & QueryUtilJoinOptions<T> = {}) {
        try {
            return this.queryUtil.findAndTransform(this.tableName, payload, options);
        } catch (err) {
            throw this.transformError(err);
        }
    }

    async count(payload: QueryInput<T> = {}, options: QueryUtilMethodOptions & QueryUtilJoinOptions<T> = {}) {
        try {
            const res = await this.queryUtil.count(this.tableName, payload, options);
            return Number.parseInt(res[0]['count']);
        } catch (err) {
            throw this.transformError(err);
        }
    }

    async findOne(
        payload: QueryInputFindOne<T> = {},
        options: QueryUtilMethodOptions & QueryUtilJoinOptions<T> = {},
    ) {
        try {
            const newPayload = payload as QueryInput<T>;
            newPayload.offset = 0;
            newPayload.limit = 1;

            const results = await this.find(newPayload, options);

            return results[0] ? results[0] : undefined;
        } catch (err) {
            throw this.transformError(err);
        }
    }

    protected transformError(err: any) {
        const logger = new Logger(this.constructor.name);
        logger.error(err);

        return err;
    }
}
