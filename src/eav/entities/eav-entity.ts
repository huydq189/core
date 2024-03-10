import { EavAttribute, EavAttributeValue, IEavAttribute, IEavAttributeValue } from '.';
import { IEntity } from '../../domain';
import { EavAttributeStatus, EavAttributeTypes } from '../enums';
import {
    AttributeCannotBeDeletedError,
    AttributeIsRequiredError,
    AttributeValueDoesNotAllowUpdatedError,
    CannotCreateOrUpdateForDisabledAttributeError,
    MustBeADatetimeError,
    MustBeANumberError,
    MustBeAStringError,
    NotSupportThisTypeError,
} from '../errors';
import {
    CreateAttributesValuesInput,
    EavAttributeCreateInput,
    EavAttributeUpdateInput,
    EavEntityCreateAttributesValuesOutput,
    EavEntityDeleteAttributesValuesInput,
    EavEntityDeleteAttributesValuesOutput,
    EavEntityUpdateAttributesValuesOutput,
    UpdateAttributesValuesInput,
} from '../types';

export type EavEntityConstructorPayload = {
    entity: IEntity<any>;
    attributeValues?: IEavAttributeValue[];
    attributesMap: Map<string, IEavAttribute>;
};

export interface IEavEntity {
    attributeValues: IEavAttributeValue[];

    createAttribute(input: EavAttributeCreateInput): Promise<IEavAttribute>;

    updateAttribute(input: EavAttributeUpdateInput, attribute: IEavAttribute): Promise<IEavAttribute>;

    deleteAttribute(attribute: IEavAttribute): Promise<IEavAttribute>;

    createAttributeValues(input: CreateAttributesValuesInput): Promise<EavEntityCreateAttributesValuesOutput>;

    updateAttributeValues(input: UpdateAttributesValuesInput): Promise<EavEntityUpdateAttributesValuesOutput>;

    deleteAttributeValues(
        items: EavEntityDeleteAttributesValuesInput,
    ): Promise<EavEntityDeleteAttributesValuesOutput>;
}

export class EavEntity implements IEavEntity {
    private entity: IEntity<any>;
    private attributesMap: Map<string, IEavAttribute>;
    private _attributeValues: IEavAttributeValue[];

    constructor({ entity, attributeValues, attributesMap }: EavEntityConstructorPayload) {
        this.entity = entity;
        this.attributesMap = attributesMap;
        this._attributeValues = attributeValues ?? [];
    }

    get attributeValues(): IEavAttributeValue[] {
        return this._attributeValues;
    }

    private setAttributeValues(attributeValues?: IEavAttributeValue[]): void {
        if (attributeValues !== undefined) this._attributeValues = attributeValues;
    }

    public async createAttribute(input: EavAttributeCreateInput): Promise<IEavAttribute> {
        const attribute = new EavAttribute();
        await attribute.create(input);
        return attribute;
    }

    public async updateAttribute(
        input: EavAttributeUpdateInput,
        attribute: IEavAttribute,
    ): Promise<IEavAttribute> {
        await attribute.update(input);
        return attribute;
    }

    public async deleteAttribute(attribute: IEavAttribute): Promise<IEavAttribute> {
        await attribute.delete();
        return attribute;
    }

    private validateAttributeValue(attribute: IEavAttribute, value: any) {
        if (attribute.isRequired && (value === undefined || value === null || value === ''))
            throw new AttributeIsRequiredError(attribute.code);

        if (value !== undefined) {
            if (attribute.status !== EavAttributeStatus.ENABLED)
                throw new CannotCreateOrUpdateForDisabledAttributeError();

            if (value !== null) {
                switch (attribute.type) {
                    case EavAttributeTypes.INT:
                    case EavAttributeTypes.DECIMAL:
                        if (typeof value !== 'number')
                            throw new MustBeANumberError(
                                `Value of attribute "${attribute.code}" must be a number`,
                            );
                        break;
                    case EavAttributeTypes.VARCHAR:
                    case EavAttributeTypes.TEXT:
                        if (typeof value !== 'string' && typeof value !== 'object')
                            throw new MustBeAStringError(
                                `Value of attribute "${attribute.code}" must be a string or object`,
                            );
                        break;
                    case EavAttributeTypes.DATETIME:
                        value = new Date(value);
                        if (isNaN(value))
                            throw new MustBeADatetimeError(
                                `Value of attribute "${attribute.code}" must be a datetime`,
                            );
                        break;
                    default:
                        throw new NotSupportThisTypeError();
                }
            }
        }
    }

    public async createAttributeValues(
        input?: CreateAttributesValuesInput,
    ): Promise<EavEntityCreateAttributesValuesOutput> {
        if (!input || !Object.keys(input).length) return [];

        const createItems = await this.getAttributeValueItems(input);
        const attributeValuesCreate: IEavAttributeValue[] = [];
        for (const item of createItems) {
            if (this.attributeValues.find((a) => a.attributeCode === item.attribute.code)) continue;

            this.validateAttributeValue(item.attribute, item.value);

            const attributeValue = new EavAttributeValue();
            await attributeValue.create({
                ...item,
                entityId: this.entity.id,
                code: item.attribute.code,
            });

            if (attributeValue.value !== undefined) attributeValuesCreate.push(attributeValue);
        }

        this.setAttributeValues([...this.attributeValues, ...attributeValuesCreate]);

        return attributeValuesCreate;
    }

    public async updateAttributeValues(
        input?: UpdateAttributesValuesInput,
    ): Promise<EavEntityUpdateAttributesValuesOutput> {
        if (!input || !Object.keys(input).length) return [];
        const updateItems = await this.getAttributeValueItems(input);
        const attributeValuesCreate: IEavAttributeValue[] = [];
        const attributeValuesUpdate: IEavAttributeValue[] = [];

        for (const item of updateItems) {
            this.validateAttributeValue(item.attribute, item.value);
            if (!item.attribute.editable) throw new AttributeValueDoesNotAllowUpdatedError();

            let attributeValue = this.attributeValues.find((a) => a.attributeCode === item.attribute.code);
            if (attributeValue) {
                if (attributeValue.value !== item.value) {
                    await attributeValue.update(item);
                    attributeValuesUpdate.push(attributeValue);
                }
            } else {
                attributeValue = new EavAttributeValue();
                await attributeValue.create({
                    ...item,
                    entityId: this.entity.id,
                    code: item.attribute.code,
                });
                attributeValuesCreate.push(attributeValue);
            }
        }
        this.setAttributeValues([
            ...this.attributeValues,
            ...attributeValuesCreate,
            ...attributeValuesUpdate,
        ]);

        return [...attributeValuesCreate, ...attributeValuesUpdate];
    }

    public async deleteAttributeValues(
        items: EavEntityDeleteAttributesValuesInput,
    ): Promise<EavEntityDeleteAttributesValuesOutput> {
        const attributeValuesDeleted: IEavAttributeValue[] = [];

        for (const item of items) {
            if (item.attribute.systemDefined) throw new AttributeCannotBeDeletedError();

            const attributeValue = this.attributeValues.find((a) => a.attributeCode === item.attribute.code);
            if (attributeValue) {
                attributeValue.delete();
                attributeValuesDeleted.push(attributeValue);
            }
        }

        this.setAttributeValues(this.attributeValues.filter((a) => !attributeValuesDeleted.includes(a)));

        return attributeValuesDeleted;
    }

    private async getAttributeValueItems(input: CreateAttributesValuesInput) {
        const items: { value: any; attribute: IEavAttribute }[] = [];
        for (const key in input) {
            const attribute = this.attributesMap.get(key);
            if (attribute) items.push({ value: input[key], attribute });
        }
        return items;
    }
}
