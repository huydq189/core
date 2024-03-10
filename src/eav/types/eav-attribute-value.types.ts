import { Expose } from 'class-transformer';
import { IsDefined, IsOptional } from 'class-validator';

// TYPE: create

export type EavAttributeValueCreateInput = {
    value: string;
    entityId: string;
    code: string;
};

export class EavAttributeValueCreateInputModel implements EavAttributeValueCreateInput {
    @Expose()
    @IsDefined()
    @IsOptional()
    public readonly value!: string;

    @Expose()
    @IsDefined()
    public readonly code!: string;

    @Expose()
    @IsDefined()
    public readonly entityId!: string;
}

export type EavAttributeValueCreateOutput = void;

// TYPE: update
export type EavAttributeValueUpdateInput = {
    value?: string;
};

export class EavAttributeValueUpdateInputModel implements EavAttributeValueUpdateInput {
    @Expose()
    @IsOptional()
    public readonly value?: string;
}

// Repo and UseCase dto
export type CreateAttributesValuesInput = Record<string, any>;
export type UpdateAttributesValuesInput = Record<string, any>;
export type DeleteAttributesValuesInput = string[];
