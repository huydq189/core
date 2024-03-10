import { Expose } from 'class-transformer';
import { IsDefined, IsString } from 'class-validator';

export type DeleteEavAttributeUseCaseInput = {
    code: string;
};

export class DeleteEavAttributeUseCaseInputModel implements DeleteEavAttributeUseCaseInput {
    @Expose()
    @IsDefined()
    @IsString()
    public readonly code!: string;
}

export type DeleteEavAttributeUseCaseOutput = void;
