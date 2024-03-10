import { IEavAttribute, IEavAttributeValue } from '../entities';
import { CreateAttributesValuesInput, UpdateAttributesValuesInput } from './eav-attribute-value.types';

export type EavEntityCreateAttributesValuesInput = {
    value: any;
    attribute: IEavAttribute;
}[];
export type EavEntityCreateAttributesValuesOutput = IEavAttributeValue[];

export type EavEntityUpdateAttributesValuesInput = {
    value: any;
    attribute: IEavAttribute;
}[];
export type EavEntityUpdateAttributesValuesOutput = IEavAttributeValue[];

export type EavEntityDeleteAttributesValuesInput = {
    attribute: IEavAttribute;
}[];
export type EavEntityDeleteAttributesValuesOutput = IEavAttributeValue[];

export type EavEntityCreateInput<T> = {
    attributes?: CreateAttributesValuesInput;
} & T;

export type EavEntityUpdateInput<T> = {
    attributes?: UpdateAttributesValuesInput;
} & T;
