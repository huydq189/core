import { EavAttributeDto } from './eav-attribute.dto';

export interface EavAttributeValueDto {
    id: string;
    value: any;
    entityId: string;
    attributeCode: string;
    attribute?: EavAttributeDto;
}
