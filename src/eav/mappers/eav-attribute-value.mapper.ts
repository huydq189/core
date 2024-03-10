import { Lifecycle, Provider } from '@heronjs/common';
import { EAV_MAPPER_TOKENS } from '../../common';
import { IMapper } from '../../objects';
import { EavAttributeValueDto } from '../dtos';
import { EavAttributeValue, IEavAttributeValue } from '../entities';

export type IEavAttributeValueMapper = IMapper<EavAttributeValueDto, IEavAttributeValue>;

@Provider({ token: EAV_MAPPER_TOKENS.ATTRIBUTE_VALUE, scope: Lifecycle.Singleton })
export class EavAttributeValueMapper implements IEavAttributeValueMapper {
    async fromEntityToDto(entity: IEavAttributeValue): Promise<EavAttributeValueDto> {
        return {
            id: entity.id,
            value: entity.value,
            entityId: entity.entityId,
            attributeCode: entity.attributeCode,
        };
    }

    async fromDtoToEntity(dto: EavAttributeValueDto): Promise<IEavAttributeValue> {
        return new EavAttributeValue(dto.id, {
            id: dto.id,
            value: dto.value,
            entityId: dto.entityId,
            attributeCode: dto.attributeCode,
        });
    }

    async fromEntitiesToDtos(entities: IEavAttributeValue[]): Promise<EavAttributeValueDto[]> {
        return Promise.all(entities.map((entity) => this.fromEntityToDto(entity)));
    }

    async fromDtosToEntities(dtos: EavAttributeValueDto[]): Promise<IEavAttributeValue[]> {
        return Promise.all(dtos.map((dto) => this.fromDtoToEntity(dto)));
    }
}
