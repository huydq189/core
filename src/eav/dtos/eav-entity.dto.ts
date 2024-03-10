import { EavAttributeValueDto } from './eav-attribute-value.dto';

export type EavEntityDto<T> = {
    attributes?: EavAttributeValueDto[];
} & T;
