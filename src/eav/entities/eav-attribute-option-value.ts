import { EntityIdUtil } from '../../common';
import { Entity, IEntity } from '../../domain';
import { ValidatorUtil } from '../../validator';
import {
    EavAttributeOptionValueCreateInput,
    EavAttributeOptionValueCreateInputModel,
    EavAttributeOptionValueUpdateInput,
    EavAttributeOptionValueUpdateInputModel,
} from '../types';

export type EavAttributeOptionValueProps = {
    id: string;
    attributeCode: string;
    value: string;
};

export type EavAttributeOptionValueMethods = {
    create(payload: EavAttributeOptionValueCreateInput): Promise<void>;
    update(payload: EavAttributeOptionValueUpdateInput): Promise<void>;
    delete(): void;
};

export type IEavAttributeOptionValue = IEntity<EavAttributeOptionValueProps, EavAttributeOptionValueMethods>;

export class EavAttributeOptionValue
    extends Entity<EavAttributeOptionValueProps, EavAttributeOptionValueMethods>
    implements IEavAttributeOptionValue
{
    constructor(id?: string, props?: EavAttributeOptionValueProps) {
        super({ id, props });
    }

    public get attributeCode(): string {
        return this.props.attributeCode;
    }

    public get value(): string {
        return this.props.value;
    }

    private setAttributeCode(attributeCode?: string): void {
        if (attributeCode !== undefined) this.props.attributeCode = attributeCode;
    }

    private setValue(value?: string) {
        if (value !== undefined) this.props.value = value;
    }

    public async create(payload: EavAttributeOptionValueCreateInput): Promise<void> {
        const model = await ValidatorUtil.validatePlain(EavAttributeOptionValueCreateInputModel, payload);

        this.setId(EntityIdUtil.randomUUID());
        this.setAttributeCode(model.attributeCode);
        this.setValue(model.value);
    }

    public async update(payload: EavAttributeOptionValueUpdateInput): Promise<void> {
        const model = await ValidatorUtil.validatePlain(EavAttributeOptionValueUpdateInputModel, payload);
        this.setValue(model.value);
    }

    public delete(): void {
        return;
    }
}
