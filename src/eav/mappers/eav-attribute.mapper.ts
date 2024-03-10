import { Lifecycle, Provider } from '@heronjs/common';
import { EAV_MAPPER_TOKENS } from '../../common';
import { IMapper } from '../../objects';
import { EavAttributeDto } from '../dtos';
import { EavAttribute, IEavAttribute } from '../entities';

export type IEavAttributeMapper = IMapper<EavAttributeDto, IEavAttribute>;

@Provider({ token: EAV_MAPPER_TOKENS.ATTRIBUTE, scope: Lifecycle.Singleton })
export class EavAttributeMapper implements IEavAttributeMapper {
    async fromEntityToDto(entity: IEavAttribute): Promise<EavAttributeDto> {
        return {
            code: entity.code,
            label: entity.label,
            isRequired: entity.isRequired,
            editable: entity.editable,
            visibility: entity.visibility,
            sortOrder: entity.sortOrder,
            systemDefined: entity.systemDefined,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            type: entity.type,
            status: entity.status,
            updateData: entity.updateData,
        };
    }

    async fromDtoToEntity(dto: EavAttributeDto): Promise<IEavAttribute> {
        return new EavAttribute(dto.code, {
            code: dto.code,
            label: dto.label,
            isRequired: dto.isRequired,
            editable: dto.editable,
            visibility: dto.visibility,
            sortOrder: dto.sortOrder,
            systemDefined: dto.systemDefined,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt,
            type: dto.type,
            status: dto.status,
            updateData: dto.updateData,
        });
    }

    async fromEntitiesToDtos(entities: IEavAttribute[]): Promise<EavAttributeDto[]> {
        return Promise.all(entities.map((entity) => this.fromEntityToDto(entity)));
    }

    async fromDtosToEntities(dtos: EavAttributeDto[]): Promise<IEavAttribute[]> {
        return Promise.all(dtos.map((dto) => this.fromDtoToEntity(dto)));
    }
}
