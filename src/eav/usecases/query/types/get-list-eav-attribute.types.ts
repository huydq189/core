import { PaginationInput } from '../../../../usecase';
import { EavAttributeDto } from '../../../dtos';

export type GetListEavAttributeUseCaseInput = PaginationInput<EavAttributeDto>;

export type GetListEavAttributeUseCaseOutput = Partial<EavAttributeDto>[];
