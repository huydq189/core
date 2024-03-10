import { Nullable } from '@heronjs/common';
import {
    EavAttributeOptionValueDto,
    EavAttributeStatus,
    EavAttributeTypes,
    EavAttributeUpdateData,
} from '..';

export type EavAttributeDto = {
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
    options?: EavAttributeOptionValueDto[];
    updateData?: EavAttributeUpdateData;
};
