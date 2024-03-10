import { Expose } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDefined,
    IsEnum,
    IsNumber,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { EavAttributeStatus, EavAttributeTypes } from '../../../enums';
import { EavAttributeOptionValueCreateInput } from '../../../types';

export type CreateEavAttributeUseCaseInput = {
    code: string;
    label: string;
    type: EavAttributeTypes;
    status?: EavAttributeStatus;
    sortOrder?: number;
    visibility?: boolean;
    isRequired?: boolean;
    options?: EavAttributeOptionValueCreateInput[];
};

export class CreateEavAttributeUseCaseInputModel implements CreateEavAttributeUseCaseInput {
    @Expose()
    @IsDefined()
    @IsString()
    @MinLength(1)
    @MaxLength(32)
    @Matches(/^[a-zA-Z0-9_-]*$/)
    public readonly code!: string;

    @Expose()
    @IsDefined()
    @IsString()
    @MinLength(1)
    public readonly label!: string;

    @Expose()
    @IsDefined()
    @IsEnum(EavAttributeTypes)
    public readonly type!: EavAttributeTypes;

    @Expose()
    @IsEnum(EavAttributeStatus)
    public readonly status?: EavAttributeStatus;

    @Expose()
    @IsNumber()
    public readonly sortOrder?: number;

    @Expose()
    @IsBoolean()
    public readonly visibility?: boolean;

    @Expose()
    @IsBoolean()
    public readonly isRequired?: boolean;

    @Expose()
    @IsArray()
    public readonly options?: EavAttributeOptionValueCreateInput[];
}

export type CreateEavAttributeUseCaseOutput = {
    id: string;
};
