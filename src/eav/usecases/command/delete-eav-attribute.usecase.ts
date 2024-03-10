import { IUseCase, ResultOf, UseCase, UseCaseContext } from '../../../usecase';
import { ValidatorUtil } from '../../../validator';
import { AttributeNotFoundError } from '../../errors';
import { IEavEntityRepository } from '../../repository';
import {
    DeleteEavAttributeUseCaseInput,
    DeleteEavAttributeUseCaseInputModel,
    DeleteEavAttributeUseCaseOutput,
} from './types';

export type IDeleteEavAttributeUseCase = IUseCase<
    DeleteEavAttributeUseCaseInput,
    DeleteEavAttributeUseCaseOutput,
    UseCaseContext
>;

export class DeleteEavAttributeUseCase
    extends UseCase<DeleteEavAttributeUseCaseInput, DeleteEavAttributeUseCaseOutput, UseCaseContext>
    implements IDeleteEavAttributeUseCase
{
    constructor(protected readonly repo: IEavEntityRepository<any>) {
        super();
        this.setMethods(this.validate, this.processing, this.save, this.map);
    }

    validate = async (input: DeleteEavAttributeUseCaseInput) => {
        return await ValidatorUtil.validatePlain(DeleteEavAttributeUseCaseInputModel, input);
    };
    processing = async (input: ResultOf<DeleteEavAttributeUseCase, 'validate'>) => {
        const entity = await this.repo.getAttributeByCode(input.code);
        if (!entity) throw new AttributeNotFoundError(input.code);
        await entity.delete();
        return entity;
    };

    save = async (entity: ResultOf<DeleteEavAttributeUseCase, 'processing'>) => {
        await this.repo.deleteAttribute(entity.code);
        return entity;
    };

    map = async () => {
        return;
    };
}
