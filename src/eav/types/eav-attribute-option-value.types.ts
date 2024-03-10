import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

// TYPE: create

export type EavAttributeOptionValueCreateInput = {
    attributeCode?: string;
    value: string;
};

export class EavAttributeOptionValueCreateInputModel implements EavAttributeOptionValueCreateInput {
    @Expose()
    @IsString()
    @IsNotEmpty()
    public readonly attributeCode!: string;
    @Expose()
    @IsString()
    @IsNotEmpty()
    public readonly value!: string;
}

// TYPE: update
export type EavAttributeOptionValueUpdateInput = {
    id?: string;
    value?: string;
    isDelete?: boolean;
};

export class EavAttributeOptionValueUpdateInputModel implements EavAttributeOptionValueUpdateInput {
    @Expose()
    @IsUUID()
    public readonly id?: string;
    @Expose()
    @IsString()
    public readonly value?: string;
    @Expose()
    @IsBoolean()
    public readonly isDelete?: boolean;
}
