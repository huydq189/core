import { IUseCase, ResultOf, UseCase, UseCaseContext } from '../../../usecase';
import { ValidatorUtil } from '../../../validator';
import { AttributeNotFoundError } from '../../errors';
import { IEavEntityRepository } from '../../repository';
import {
    UpdateEavAttributeUseCaseInput,
    UpdateEavAttributeUseCaseInputModel,
    UpdateEavAttributeUseCaseOutput,
} from './types';

export type IUpdateEavAttributeUseCase = IUseCase<
    UpdateEavAttributeUseCaseInput,
    UpdateEavAttributeUseCaseOutput,
    UseCaseContext
>;

export class UpdateEavAttributeUseCase
    extends UseCase<UpdateEavAttributeUseCaseInput, UpdateEavAttributeUseCaseOutput, UseCaseContext>
    implements IUpdateEavAttributeUseCase
{
    constructor(protected readonly repo: IEavEntityRepository<any>) {
        super();
        this.setMethods(this.validate, this.processing, this.save, this.map);
    }

    validate = async (input: UpdateEavAttributeUseCaseInput) => {
        return await ValidatorUtil.validatePlain(UpdateEavAttributeUseCaseInputModel, input);
    };
    processing = async (input: ResultOf<UpdateEavAttributeUseCase, 'validate'>) => {
        const entity = await this.repo.getAttributeByCode(input.code);
        if (!entity) throw new AttributeNotFoundError(input.code);
        await entity.update(input);
        return entity;
    };

    save = async (entity: ResultOf<UpdateEavAttributeUseCase, 'processing'>) => {
        await this.repo.updateAttribute(entity);
        return entity;
    };

    map = async () => {
        return;
    };
}
