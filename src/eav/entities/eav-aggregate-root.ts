import { AggregateRoot, AggregateRootConstructorPayload, IAggregateRoot } from '../../domain';
import { IEavAttribute } from './eav-attribute';
import { IEavAttributeValue } from './eav-attribute-value';
import { EavEntity, IEavEntity } from './eav-entity';

export type EavAggregateRootConstructorPayload<T> = AggregateRootConstructorPayload<T> & {
    attributeValues?: IEavAttributeValue[];
    attributesMap: Map<string, IEavAttribute>;
};
export type IEavAggregateRoot<T = any, K = any> = IAggregateRoot<T, K> & {
    eav: IEavEntity;
};
export abstract class EavAggregateRoot<T, K> extends AggregateRoot<T, K> implements IEavAggregateRoot {
    private readonly _eav: EavEntity;
    constructor({
        id,
        props,
        eventEmitter: eventHandler,
        attributesMap,
        attributeValues,
    }: EavAggregateRootConstructorPayload<T>) {
        super({ id, props, eventEmitter: eventHandler });
        this._eav = new EavEntity({ entity: this, attributesMap, attributeValues });
    }

    get eav(): EavEntity {
        return this._eav;
    }
}
