import { IBaseEavDao, QueryUtilMethodOptions } from '../../database';
import { BaseRepository, IAggregateRoot, IRepository } from '../../domain';
import { IMapper } from '../../objects';
import { EavAttributeDto } from '../dtos';
import { IEavAttribute } from '../entities';
import { EavAttributeMapper, IEavAttributeMapper } from '../mappers';

export interface IEavEntityRepository<T extends IAggregateRoot> extends IRepository<T> {
    createAttribute: (
        eavAttribute: IEavAttribute,
        options?: QueryUtilMethodOptions,
    ) => Promise<IEavAttribute>;
    updateAttribute: (
        eavAttribute: IEavAttribute,
        options?: QueryUtilMethodOptions,
    ) => Promise<IEavAttribute>;
    deleteAttribute: (code: string, options?: QueryUtilMethodOptions) => Promise<string>;
    getAttributeByCode: (code: string, options?: QueryUtilMethodOptions) => Promise<IEavAttribute>;
}

export abstract class EavEntityRepository<T extends IAggregateRoot>
    extends BaseRepository<T>
    implements IEavEntityRepository<T>
{
    protected readonly eavAttributeMapper: IEavAttributeMapper;
    protected constructor(protected mapper: IMapper<any, T>, protected dao: IBaseEavDao<any>) {
        super(mapper, dao);
        this.eavAttributeMapper = new EavAttributeMapper();
    }

    public async createAttribute(
        eavAttribute: IEavAttribute,
        options?: QueryUtilMethodOptions,
    ): Promise<IEavAttribute> {
        const dto = await this.eavAttributeMapper.fromEntityToDto(eavAttribute);
        await this.dao.createAttribute(dto, options);
        return eavAttribute;
    }

    public async updateAttribute(
        eavAttribute: IEavAttribute,
        options?: QueryUtilMethodOptions,
    ): Promise<IEavAttribute> {
        const dto = await this.eavAttributeMapper.fromEntityToDto(eavAttribute);
        await this.dao.updateAttribute(dto.code, dto, options);
        return eavAttribute;
    }

    public async getAttributeByCode(code: string, options?: QueryUtilMethodOptions) {
        const dto = (await this.dao.findOneAttribute(
            {
                filter: {
                    code: { $eq: code },
                },
            },
            options,
        )) as EavAttributeDto;
        return dto ? this.eavAttributeMapper.fromDtoToEntity(dto) : dto;
    }

    public async deleteAttribute(code: string, options?: QueryUtilMethodOptions): Promise<string> {
        await this.dao.deleteAttribute(code, options);
        return code;
    }
}
