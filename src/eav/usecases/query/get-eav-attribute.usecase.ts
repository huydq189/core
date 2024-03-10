import { AttributeNotFoundError, UseCaseContext } from '../../..';
import { IBaseEavDao } from '../../../database';
import { IUseCase, UseCase } from '../../../usecase';
import { GetEavAttributeUseCaseInput, GetEavAttributeUseCaseOutput } from './types';

export type IGetEavAttributeUseCase = IUseCase<
    GetEavAttributeUseCaseInput,
    GetEavAttributeUseCaseOutput,
    UseCaseContext
>;

export class GetEavAttributeUseCase
    extends UseCase<GetEavAttributeUseCaseInput, GetEavAttributeUseCaseOutput, UseCaseContext>
    implements IGetEavAttributeUseCase
{
    constructor(protected readonly dao: IBaseEavDao<any>) {
        super();
        this.setMethods(this.processing);
    }

    processing = async (input: GetEavAttributeUseCaseInput) => {
        const dto = await this.dao.findOneAttribute({ filter: { code: { $eq: input } } });
        if (!dto) throw new AttributeNotFoundError(input);
        return dto;
    };
}
