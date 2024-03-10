import { IBaseEavDao, UseCaseContext } from '../../..';
import { IUseCase, UseCase } from '../../../usecase';
import { GetListEavAttributeUseCaseInput, GetListEavAttributeUseCaseOutput } from './types';

export type IGetListEavAttributeUseCase = IUseCase<
    GetListEavAttributeUseCaseInput,
    GetListEavAttributeUseCaseOutput,
    UseCaseContext
>;

export class GetListEavAttributeUseCase
    extends UseCase<GetListEavAttributeUseCaseInput, GetListEavAttributeUseCaseOutput, UseCaseContext>
    implements IGetListEavAttributeUseCase
{
    constructor(protected readonly dao: IBaseEavDao<any>) {
        super();
        this.setMethods(this.processing);
    }

    processing = async (input: GetListEavAttributeUseCaseInput) => {
        return this.dao.findAttributes(input);
    };
}
