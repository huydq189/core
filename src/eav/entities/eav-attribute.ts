import { Nullable } from '@heronjs/common';
import { Entity, IEntity } from '../../domain';
import { ValidatorUtil } from '../../validator';
import { EavAttributeStatus, EavAttributeTypes } from '../enums';
import { AttributeCannotBeDeletedError } from '../errors';
import {
    EavAttributeCreateInput,
    EavAttributeCreateInputModel,
    EavAttributeOptionValueCreateInput,
    EavAttributeUpdateInput,
    EavAttributeUpdateInputModel,
} from '../types';
import { EavAttributeOptionValue, IEavAttributeOptionValue } from './eav-attribute-option-value';

export type EavAttributeProps = {
    code: string;
    label: string;
    isRequired: boolean;
    editable: boolean;
    visibility: boolean;
    sortOrder: number;
    systemDefined: boolean;
    createdAt: Date;
    updatedAt: Nullable<Date>;
    type: EavAttributeTypes;
    status: EavAttributeStatus;
    options?: IEavAttributeOptionValue[];
    updateData?: EavAttributeUpdateData;
};
export type EavAttributeUpdateData = {
    optionCreateItems?: IEavAttributeOptionValue[];
    optionUpdateItems?: IEavAttributeOptionValue[];
    optionDeleteItems?: string[];
};
export type EavAttributeMethods = {
    create(payload: EavAttributeCreateInput): Promise<void>;
    update(payload: EavAttributeUpdateInput): Promise<void>;
    delete(): Promise<void>;
};
export type IEavAttribute = IEntity<EavAttributeProps, EavAttributeMethods>;

export class EavAttribute extends Entity<EavAttributeProps, EavAttributeMethods> implements IEavAttribute {
    constructor(id?: string, props?: EavAttributeProps) {
        super({ id, props });
    }

    public get code(): string {
        return this.props.code;
    }

    public get label(): string {
        return this.props.label;
    }

    public get type(): EavAttributeTypes {
        return this.props.type;
    }

    public get isRequired(): boolean {
        return this.props.isRequired;
    }

    public get editable(): boolean {
        return this.props.editable;
    }

    public get visibility(): boolean {
        return this.props.visibility;
    }

    public get sortOrder(): number {
        return this.props.sortOrder;
    }

    public get systemDefined(): boolean {
        return this.props.systemDefined;
    }

    public get status(): EavAttributeStatus {
        return this.props.status;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Nullable<Date> {
        return this.props.updatedAt;
    }

    public get options(): IEavAttributeOptionValue[] {
        return this.props.options ?? [];
    }

    public get updateData(): EavAttributeUpdateData | undefined {
        return this.props.updateData;
    }

    private setCode(code?: string): void {
        if (code !== undefined) this.props.code = code;
    }

    private setLabel(label?: string): void {
        if (label !== undefined) this.props.label = label;
    }

    private setType(type?: EavAttributeTypes): void {
        if (type !== undefined) this.props.type = type;
    }

    private setIsRequired(isRequired?: boolean): void {
        if (isRequired !== undefined) this.props.isRequired = isRequired;
    }

    private setEditable(editable?: boolean): void {
        if (editable !== undefined) this.props.editable = editable;
    }

    private setVisibility(visibility?: boolean): void {
        if (visibility !== undefined) this.props.visibility = visibility;
    }

    private setSortOrder(sortOrder?: number): void {
        if (sortOrder !== undefined) this.props.sortOrder = sortOrder;
    }

    private setSystemDefined(systemDefined?: boolean): void {
        if (systemDefined !== undefined) this.props.systemDefined = systemDefined;
    }

    private setStatus(status?: EavAttributeStatus): void {
        if (status !== undefined) this.props.status = status;
    }

    private setCreatedAt(createdAt?: Date): void {
        if (createdAt !== undefined) this.props.createdAt = createdAt;
    }

    private setUpdatedAt(updatedAt?: Nullable<Date>): void {
        if (updatedAt !== undefined) this.props.updatedAt = updatedAt;
    }

    private setOptions(options?: IEavAttributeOptionValue[]): void {
        if (options !== undefined) this.props.options = options;
    }

    private setUpdateData(payload?: EavAttributeUpdateData) {
        if (payload !== undefined) this.props.updateData = payload;
    }

    public async create(payload: EavAttributeCreateInput): Promise<void> {
        const model = await ValidatorUtil.validatePlain(EavAttributeCreateInputModel, payload);
        this.setId(model.code);
        this.setCode(model.code);
        this.setLabel(model.label);
        this.setType(model.type);
        this.setIsRequired(model.isRequired ?? false);
        this.setEditable(true);
        this.setSystemDefined(false);
        this.setVisibility(model.visibility === undefined ? true : model.visibility);
        this.setSortOrder(model.sortOrder ?? 0);
        this.setStatus(model.status ?? EavAttributeStatus.ENABLED);
        if (model.options) {
            const options = model.options.map((i) => {
                const value = new EavAttributeOptionValue();
                value.create({ ...i, attributeCode: model.code });
                return value;
            });
            this.setOptions(options);
        }
        this.setCreatedAt(new Date());
    }

    public async update(payload: EavAttributeUpdateInput): Promise<void> {
        const model = await ValidatorUtil.validatePlain(EavAttributeUpdateInputModel, payload);
        this.setLabel(model.label);
        this.setIsRequired(model.isRequired);
        this.setVisibility(model.visibility);
        this.setSortOrder(model.sortOrder);
        this.setStatus(model.status);
        this.setUpdatedAt(new Date());

        if (payload.options) {
            const optionCreateItems: IEavAttributeOptionValue[] = [];
            const optionUpdateItems: IEavAttributeOptionValue[] = [];
            const optionDeleteItems: string[] = [];
            for (const optionItem of payload.options) {
                const isDelete = optionItem.isDelete;
                const currentItemIndex = this.options.findIndex((item) => optionItem.id === item.id);
                const currentItem = this.options[currentItemIndex];
                // delete
                if (isDelete && currentItem && optionItem.id) {
                    optionDeleteItems.push(optionItem.id);
                    this.options.splice(currentItemIndex, 1);
                    continue;
                }
                // update
                if (!isDelete && currentItem) {
                    await currentItem.update(optionItem);
                    optionUpdateItems.push(currentItem);
                    continue;
                }
                // create
                if (!isDelete && !currentItem) {
                    const newOption = new EavAttributeOptionValue();
                    await newOption.create({
                        ...optionItem,
                        attributeCode: this.code,
                    } as EavAttributeOptionValueCreateInput);
                    optionCreateItems.push(newOption);
                    this.setOptions([...this.options, newOption]);
                }
            }
            this.setUpdateData({
                optionCreateItems,
                optionUpdateItems,
                optionDeleteItems,
            });
        }
    }

    public async delete(): Promise<void> {
        if (this.systemDefined) throw new AttributeCannotBeDeletedError();
    }
}
