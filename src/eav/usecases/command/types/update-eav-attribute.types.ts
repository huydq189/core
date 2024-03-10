import { Expose } from 'class-transformer';
import { IsArray, IsBoolean, IsDefined, IsEnum, IsNumber, IsString, MinLength } from 'class-validator';
import { EavAttributeStatus } from '../../../enums';
import { EavAttributeOptionValueUpdateInput } from '../../../types';

export type UpdateEavAttributeUseCaseInput = {
    code: string;
    label?: string;
    status?: EavAttributeStatus;
    sortOrder?: number;
    visibility?: boolean;
    isRequired?: boolean;
    options?: EavAttributeOptionValueUpdateInput[];
};

export class UpdateEavAttributeUseCaseInputModel implements UpdateEavAttributeUseCaseInput {
    @Expose()
    @IsDefined()
    @IsString()
    public readonly code!: string;

    @Expose()
    @IsString()
    @MinLength(1)
    public readonly label?: string;

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
    public readonly options?: EavAttributeOptionValueUpdateInput[];
}

export type UpdateEavAttributeUseCaseOutput = void;
