import { IBaseEavDao } from '../database';
import { EavAttributeDto, EavAttributeMapper, IEavAttributeMapper } from '../eav';

export interface IEntityBuilder<T, K> {
    build(args?: K): Promise<T>;
    buildList(args: K[] | number): Promise<T[]>;
}

export abstract class EavEntityBuilder<T = any, K = any> implements IEntityBuilder<T, K> {
    protected readonly attributeMapper: IEavAttributeMapper;

    constructor(protected readonly dao: IBaseEavDao<any>) {
        this.attributeMapper = new EavAttributeMapper();
    }

    protected async getAttributesMap() {
        const attributes = (await this.dao.findAttributes()) as EavAttributeDto[];
        const attributesMap = new Map(
            (await this.attributeMapper.fromDtosToEntities(attributes)).map((item) => [item.code, item]),
        );
        return attributesMap;
    }

    abstract build(args?: K): Promise<T>;
    abstract buildList(args: K[] | number): Promise<T[]>;
}
