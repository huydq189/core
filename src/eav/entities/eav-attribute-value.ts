import { EntityIdUtil } from '../../common';
import { Entity, IEntity } from '../../domain';
import { ValidatorUtil } from '../../validator';
import {
    EavAttributeValueCreateInput,
    EavAttributeValueCreateInputModel,
    EavAttributeValueCreateOutput,
    EavAttributeValueUpdateInput,
    EavAttributeValueUpdateInputModel,
} from '../types';

export type EavAttributeValueProps = {
    id: string;
    value: any;
    entityId: string;
    attributeCode: string;
};

export type EavAttributeValueMethods = {
    create(payload: EavAttributeValueCreateInput): Promise<EavAttributeValueCreateOutput>;
    update(payload: EavAttributeValueUpdateInput): Promise<void>;
    delete(): void;
};

export type IEavAttributeValue = IEntity<EavAttributeValueProps, EavAttributeValueMethods>;

export class EavAttributeValue
    extends Entity<EavAttributeValueProps, EavAttributeValueMethods>
    implements IEavAttributeValue
{
    constructor(id?: string, props?: EavAttributeValueProps) {
        super({ id, props });
    }

    public get value(): any {
        return this.props.value;
    }

    public get entityId(): string {
        return this.props.entityId;
    }

    public get attributeCode(): string {
        return this.props.attributeCode;
    }

    private setValue(value?: any) {
        if (value !== undefined) this.props.value = value;
    }

    private setEntityId(entityId?: string): void {
        if (entityId !== undefined) this.props.entityId = entityId;
    }

    private setAttributeCode(attributeCode?: string): void {
        if (attributeCode !== undefined) this.props.attributeCode = attributeCode;
    }

    public async create(payload: EavAttributeValueCreateInput): Promise<EavAttributeValueCreateOutput> {
        const model = await ValidatorUtil.validatePlain(EavAttributeValueCreateInputModel, payload);

        this.setId(EntityIdUtil.randomUUID());
        this.setEntityId(model.entityId);
        this.setAttributeCode(model.code);
        this.setValue(model.value);
    }

    public async update(payload: EavAttributeValueUpdateInput): Promise<void> {
        const model = await ValidatorUtil.validatePlain(EavAttributeValueUpdateInputModel, payload);
        this.setValue(model.value);
    }

    public delete(): void {
        return;
    }
}
