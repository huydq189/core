import { Knex } from 'knex';
import { IBaseDao, QueryInput, QueryInputFindOne } from '../database';
import { IMapper } from '../objects';
import { IAggregateRoot } from './aggregate-root';
import { Optional } from '@heronjs/common';

export type RepositoryOptions<T = any> = {
    subEntities?: T;
    trx?: Knex.Transaction;
};

export interface IRepository<T extends IAggregateRoot> {
    create: (entities: T, options?: RepositoryOptions) => Promise<T>;
    createList: (entity: T[], options?: RepositoryOptions) => Promise<T[]>;
    update: (entity: T, options?: RepositoryOptions) => Promise<T>;
    updateList: (entities: T[], options?: RepositoryOptions) => Promise<T[]>;
    delete: (entity: T, options?: RepositoryOptions) => Promise<T>;
    deleteList: (entities: T[], options?: RepositoryOptions) => Promise<T[]>;
    find: (input: QueryInput, options?: RepositoryOptions) => Promise<T[]>;
    findOne: (input: QueryInputFindOne, options?: RepositoryOptions) => Promise<Optional<T>>;
}

export abstract class BaseRepository<T extends IAggregateRoot> implements IRepository<T> {
    protected constructor(protected mapper: IMapper<any, T>, protected dao: IBaseDao<any>) {}

    async create(entity: T, options?: RepositoryOptions): Promise<T> {
        const dto: any = await this.mapper.fromEntityToDto(entity);
        await this.dao.create(dto, options);
        entity.dispatchDomainEvents();
        return entity;
    }

    async createList(entities: T[], options?: RepositoryOptions): Promise<T[]> {
        const dtos: any[] = await this.mapper.fromEntitiesToDtos(entities);
        await this.dao.createList(dtos, options);
        entities.forEach((entity) => entity.dispatchDomainEvents());
        return entities;
    }

    async update(entity: T, options?: RepositoryOptions): Promise<T> {
        const dto: any = await this.mapper.fromEntityToDto(entity);
        await this.dao.updateById(dto.id, dto, options);
        entity.dispatchDomainEvents();
        return entity;
    }

    async updateList(entities: T[], options?: RepositoryOptions): Promise<T[]> {
        const dtos: any[] = await this.mapper.fromEntitiesToDtos(entities);
        await this.dao.updateList(dtos, options);
        entities.forEach((entity) => entity.dispatchDomainEvents());
        return entities;
    }

    async delete(entity: T, options?: RepositoryOptions): Promise<T> {
        await this.dao.deleteById(entity.id, options);
        entity.dispatchDomainEvents();
        return entity;
    }

    async deleteList(entities: T[], options?: RepositoryOptions): Promise<T[]> {
        await this.dao.deleteList(
            entities.map((entity) => entity.id),
            options,
        );
        entities.forEach((entity) => entity.dispatchDomainEvents());
        return entities;
    }

    async getList(input: QueryInput, options?: RepositoryOptions): Promise<T[]> {
        const listDto = (await this.dao.find(input, options)) as any[];
        return this.mapper.fromDtosToEntities(listDto);
    }

    async find(input: QueryInput, options?: RepositoryOptions): Promise<T[]> {
        const listDto = (await this.dao.find(input, options)) as any[];
        return this.mapper.fromDtosToEntities(listDto);
    }

    async findOne(input: QueryInputFindOne, options?: RepositoryOptions): Promise<Optional<T>> {
        const dto = await this.dao.findOne(input, options);
        if (dto) return this.mapper.fromDtoToEntity(dto);
    }
}
