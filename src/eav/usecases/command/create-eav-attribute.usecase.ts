import { IUseCase, ResultOf, UseCase, UseCaseContext } from '../../../usecase';
import { ValidatorUtil } from '../../../validator';
import { EavAttribute } from '../../entities';
import { IEavEntityRepository } from '../../repository';
import {
    CreateEavAttributeUseCaseInput,
    CreateEavAttributeUseCaseInputModel,
    CreateEavAttributeUseCaseOutput,
} from './types';

export type ICreateEavAttributeUseCase = IUseCase<
    CreateEavAttributeUseCaseInput,
    CreateEavAttributeUseCaseOutput,
    UseCaseContext
>;

export class CreateEavAttributeUseCase
    extends UseCase<CreateEavAttributeUseCaseInput, CreateEavAttributeUseCaseOutput, UseCaseContext>
    implements ICreateEavAttributeUseCase
{
    constructor(protected readonly _repo: IEavEntityRepository<any>) {
        super();
        this.setMethods(this.validate, this.processing, this.save, this.map);
    }

    validate = async (input: CreateEavAttributeUseCaseInput) => {
        return await ValidatorUtil.validatePlain(CreateEavAttributeUseCaseInputModel, input);
    };

    processing = async (input: ResultOf<CreateEavAttributeUseCase, 'validate'>) => {
        const entity = new EavAttribute();
        await entity.create(input);
        return entity;
    };

    save = async (entity: ResultOf<CreateEavAttributeUseCase, 'processing'>) => {
        await this._repo.createAttribute(entity);
        return entity;
    };

    map = async (entity: ResultOf<CreateEavAttributeUseCase, 'save'>) => {
        return {
            id: entity.id,
        };
    };
}
