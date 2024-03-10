import { EavAttributeValueMapper, IEavAttributeValueMapper } from '../eav';

export interface IMapper<DTO, Entity> {
    fromEntityToDto(entity: Entity): Promise<DTO>;
    fromDtoToEntity(dto: DTO): Promise<Entity>;
    fromEntitiesToDtos(entities: Entity[]): Promise<DTO[]>;
    fromDtosToEntities(dtos: DTO[]): Promise<Entity[]>;
}

export abstract class BaseMapper<DTO = any, Entity = any> implements IMapper<DTO, Entity> {
    abstract fromEntityToDto(entity: Entity): Promise<DTO>;
    abstract fromDtoToEntity(dto: DTO): Promise<Entity>;

    async fromEntitiesToDtos(entities: Entity[]): Promise<DTO[]> {
        return Promise.all(entities.map((entity) => this.fromEntityToDto(entity)));
    }

    async fromDtosToEntities(dtos: DTO[]): Promise<Entity[]> {
        return Promise.all(dtos.map((dto) => this.fromDtoToEntity(dto)));
    }
}

export abstract class BaseEavMapper<DTO = any, Entity = any> extends BaseMapper<DTO, Entity> {
    protected readonly eavAttributeValueMapper: IEavAttributeValueMapper = new EavAttributeValueMapper();
}
