import { Optional } from '@heronjs/common';
import {
    EavAttributeDto,
    EavAttributeOptionValueDto,
    EavAttributeTypes,
    EavAttributeValueDto,
} from '../../eav';
import {
    EavQueryInput,
    EavQueryInputFindOne,
    IEavQueryUtil,
    QueryInput,
    QueryInputFindOne,
    QueryUtilJoinOptions,
    QueryUtilMethodOptions,
    QueryUtilUpsertOptions,
} from '../query-util';
import { BaseDao, IBaseDao } from './dao';

export interface IBaseEavDao<DTO> extends IBaseDao<DTO> {
    create(dto: DTO, options?: QueryUtilMethodOptions): Promise<DTO>;
    updateById(id: string, dto: Partial<DTO>, options?: QueryUtilMethodOptions): Promise<Partial<DTO>>;
    find(
        payload?: EavQueryInput<DTO>,
        options?: QueryUtilMethodOptions & QueryUtilJoinOptions<DTO>,
    ): Promise<Partial<DTO>[]>;
    findOne(
        payload?: EavQueryInputFindOne<DTO>,
        options?: QueryUtilMethodOptions & QueryUtilJoinOptions<DTO>,
    ): Promise<Optional<Partial<DTO>>>;
    createAttribute(dto: EavAttributeDto, options?: QueryUtilMethodOptions): Promise<EavAttributeDto>;
    createListAttribute(
        listDto: EavAttributeDto[],
        options?: QueryUtilMethodOptions,
    ): Promise<EavAttributeDto[]>;
    upsertListAttribute(
        listDto: EavAttributeDto[],
        options?: QueryUtilMethodOptions & QueryUtilUpsertOptions,
    ): Promise<EavAttributeDto[]>;
    updateAttribute(
        code: string,
        dto: Partial<EavAttributeDto>,
        options?: QueryUtilMethodOptions,
    ): Promise<Partial<EavAttributeDto>>;
    deleteAttribute(code: string, options?: QueryUtilMethodOptions): Promise<string>;
    deleteListAttribute(codeList: string[], options?: QueryUtilMethodOptions): Promise<string[]>;
    findAttributes(
        payload?: QueryInput<EavAttributeDto>,
        options?: QueryUtilMethodOptions,
    ): Promise<Partial<EavAttributeDto>[]>;
    findOneAttribute(
        payload?: QueryInputFindOne<EavAttributeDto>,
        options?: QueryUtilMethodOptions,
    ): Promise<Optional<Partial<EavAttributeDto>>>;

    createListAttributeValue(
        listDto: EavAttributeValueDto[],
        options?: QueryUtilMethodOptions,
    ): Promise<EavAttributeValueDto[]>;

    upsertListAttributeValue(
        listDto: EavAttributeValueDto[],
        options?: QueryUtilMethodOptions & QueryUtilUpsertOptions,
    ): Promise<EavAttributeValueDto[]>;
}

export class BaseEavDao<DTO> extends BaseDao<DTO> implements IBaseEavDao<DTO> {
    protected readonly queryUtil!: IEavQueryUtil<DTO>;

    protected getAttributeTableName() {
        const table = this.queryUtil.getTable(this.tableName);
        return table.eav.attributeTable;
    }

    protected getAttributeOptionValueTableName() {
        const table = this.queryUtil.getTable(this.tableName);
        return table.eav.attributeOptionValueTable;
    }

    protected getAttributeValueTableName() {
        const table = this.queryUtil.getTable(this.tableName);
        return table.eav.attributeValueTables;
    }

    async create(dto: DTO, options: QueryUtilMethodOptions = {}) {
        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            await this.queryUtil.create(this.tableName, dto, newOptions);
            // @ts-ignore
            if (dto.attributes?.length) await this.createListAttributeValue(dto.attributes, newOptions);
            if (!options.trx) await this.commitTrx(trx);
            return dto;
        } catch (err: any) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async createList(dtos: DTO[], options: QueryUtilMethodOptions = {}) {
        if (!dtos.length) return dtos;

        const attributeDtos: EavAttributeValueDto[] = (dtos as any[]).reduce(
            (a: EavAttributeValueDto[], b: any) => {
                return [...a, ...(b.attributes ?? [])];
            },
            [],
        );

        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            await this.queryUtil.createList(this.tableName, dtos, newOptions);
            if (attributeDtos.length) await this.createListAttributeValue(attributeDtos, newOptions);

            if (!options.trx) await this.commitTrx(trx);

            return dtos;
        } catch (err: any) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async updateById(id: string, dto: Partial<DTO>, options: QueryUtilMethodOptions = {}) {
        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            await Promise.all([
                this.queryUtil.updateById(this.tableName, id, dto, newOptions),
                (dto as any).attributes?.length
                    ? await this.upsertListAttributeValue((dto as any).attributes, newOptions)
                    : Promise.resolve(true),
            ]);

            if (!options.trx) await this.commitTrx(trx);

            return dto;
        } catch (err) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async updateList(dtos: (Partial<DTO> & { id: string })[], options: QueryUtilMethodOptions = {}) {
        if (!dtos.length) return dtos;

        const attributeDtos: EavAttributeValueDto[] = (dtos as any[]).reduce(
            (a: EavAttributeValueDto[], b: any) => {
                return [...a, ...(b.attributes ?? [])];
            },
            [],
        );

        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            await Promise.all([
                this.queryUtil.updateList(this.tableName, dtos, newOptions),
                attributeDtos.length
                    ? await this.upsertListAttributeValue(attributeDtos, newOptions)
                    : Promise.resolve(true),
            ]);
            if (!options.trx) await this.commitTrx(trx);
            return dtos;
        } catch (err: any) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async upsertById(
        id: string,
        dto: Partial<DTO>,
        options: QueryUtilMethodOptions & QueryUtilUpsertOptions = {},
    ) {
        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            await this.queryUtil.upsertById(this.tableName, id, dto, newOptions);
            // @ts-ignore
            if (dto.attributes?.length) await this.upsertListAttributeValue(dto.attributes, newOptions);

            if (!options.trx) await this.commitTrx(trx);

            return dto;
        } catch (err) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async upsertList(
        dtos: (Partial<DTO> & { id: string })[],
        options: QueryUtilMethodOptions & QueryUtilUpsertOptions = {},
    ) {
        if (!dtos.length) return dtos;

        const attributeDtos: EavAttributeValueDto[] = (dtos as any[]).reduce(
            (a: EavAttributeValueDto[], b: any) => {
                return [...a, ...(b.attributes ?? [])];
            },
            [],
        );

        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            await this.queryUtil.upsertList(this.tableName, dtos, newOptions);
            if (attributeDtos.length) await this.upsertListAttributeValue(attributeDtos, newOptions);

            if (!options.trx) await this.commitTrx(trx);

            return dtos;
        } catch (err: any) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async createAttribute(dto: EavAttributeDto, options: QueryUtilMethodOptions = {}) {
        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            const queryUtil = this.queryUtil as IEavQueryUtil<EavAttributeDto>;
            const attributeTableName = this.getAttributeTableName();
            await queryUtil.create(this.getAttributeTableName(), dto, newOptions);
            queryUtil.updateEavAttributeTable(attributeTableName, { code: dto.code, type: dto.type });
            if (dto.options && dto.options.length) {
                const queryUtilOptionValue = this.queryUtil as IEavQueryUtil<EavAttributeOptionValueDto>;
                await queryUtilOptionValue.createList(
                    this.getAttributeOptionValueTableName(),
                    dto.options,
                    newOptions,
                );
            }
            if (!options.trx) await this.commitTrx(trx);

            return dto;
        } catch (err: any) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async updateAttribute(code: string, dto: Partial<EavAttributeDto>, options: QueryUtilMethodOptions = {}) {
        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            const queryUtil = this.queryUtil as IEavQueryUtil<EavAttributeDto>;
            const queryUtilOptionValue = this.queryUtil as IEavQueryUtil<EavAttributeOptionValueDto>;
            const attributeTableName = this.getAttributeTableName();
            await Promise.all([
                queryUtil.updateById(attributeTableName, code, dto, newOptions),
                dto.updateData?.optionCreateItems?.length
                    ? queryUtilOptionValue.createList(
                          this.getAttributeOptionValueTableName(),
                          dto.updateData.optionCreateItems,
                          newOptions,
                      )
                    : undefined,
                dto.updateData?.optionUpdateItems?.length
                    ? queryUtilOptionValue.updateList(
                          this.getAttributeOptionValueTableName(),
                          dto.updateData.optionUpdateItems,
                          newOptions,
                      )
                    : undefined,
                dto.updateData?.optionDeleteItems?.length
                    ? queryUtilOptionValue.deleteList(
                          this.getAttributeOptionValueTableName(),
                          dto.updateData.optionDeleteItems,
                          newOptions,
                      )
                    : undefined,
            ]);

            if (!options.trx) await this.commitTrx(trx);

            return dto;
        } catch (err) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async createListAttribute(listDto: EavAttributeDto[], options: QueryUtilMethodOptions = {}) {
        if (!listDto.length) return listDto;

        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            const queryUtil = this.queryUtil as IEavQueryUtil<EavAttributeDto>;
            const attributeTableName = this.getAttributeTableName();

            await queryUtil.createList(attributeTableName, listDto, newOptions);
            for (const dto of listDto) {
                queryUtil.updateEavAttributeTable(attributeTableName, {
                    code: dto.code,
                    type: dto.type,
                });
            }

            if (!options.trx) await this.commitTrx(trx);

            return listDto;
        } catch (err: any) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async upsertListAttribute(
        listDto: EavAttributeDto[],
        options: QueryUtilMethodOptions & QueryUtilUpsertOptions = {},
    ) {
        if (!listDto.length) return listDto;

        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            const queryUtil = this.queryUtil as IEavQueryUtil<EavAttributeDto>;
            const attributeTableName = this.getAttributeTableName();

            await queryUtil.upsertList(attributeTableName, listDto, newOptions);
            for (const dto of listDto) {
                queryUtil.updateEavAttributeTable(attributeTableName, {
                    code: dto.code,
                    type: dto.type,
                });
            }

            if (!options.trx) await this.commitTrx(trx);

            return listDto;
        } catch (err: any) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async deleteAttribute(code: string, options: QueryUtilMethodOptions = {}) {
        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            const attributeTableName = this.getAttributeTableName();
            await this.queryUtil.deleteById(attributeTableName, code, newOptions);

            if (!options.trx) await this.commitTrx(trx);

            return code;
        } catch (err) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async deleteListAttribute(codeList: string[], options: QueryUtilMethodOptions = {}) {
        if (!codeList.length) return codeList;

        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            const attributeTableName = this.getAttributeTableName();
            await this.queryUtil.deleteList(attributeTableName, codeList, newOptions);

            if (!options.trx) await this.commitTrx(trx);

            return codeList;
        } catch (err) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async findAttributes(
        payload: EavQueryInput<EavAttributeDto> = {},
        options: QueryUtilMethodOptions = {},
    ): Promise<Partial<EavAttributeDto>[]> {
        try {
            const attributeTableName = this.getAttributeTableName();
            const result = await this.queryUtil.findAndTransform(attributeTableName, payload, options);
            return result as Partial<EavAttributeDto>[];
        } catch (err) {
            throw this.transformError(err);
        }
    }

    async findOneAttribute(
        payload: QueryInputFindOne<EavAttributeDto> = {},
        options: QueryUtilMethodOptions = {},
    ) {
        try {
            const newPayload = payload as QueryInput<EavAttributeDto>;
            newPayload.offset = 0;
            newPayload.limit = 1;

            const results = await this.findAttributes(newPayload, options);

            return results[0] ? results[0] : undefined;
        } catch (err) {
            throw this.transformError(err);
        }
    }

    protected getAttributeTableData() {
        return this.queryUtil.getAttributeTableData(this.getAttributeTableName());
    }

    async createListAttributeValue(listDto: EavAttributeValueDto[], options: QueryUtilMethodOptions = {}) {
        if (!listDto.length) return listDto;

        const queryUtil = this.queryUtil as IEavQueryUtil<EavAttributeValueDto>;
        const attributeValueTableName = this.getAttributeValueTableName();
        const classifiedData = this.getClassifiedAttributeValueData(listDto);

        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            await Promise.all([
                classifiedData.varcharValue.length && attributeValueTableName.varchar
                    ? queryUtil.createList(
                          attributeValueTableName.varchar,
                          classifiedData.varcharValue,
                          newOptions,
                      )
                    : undefined,
                classifiedData.intValue.length && attributeValueTableName.int
                    ? queryUtil.createList(attributeValueTableName.int, classifiedData.intValue, newOptions)
                    : undefined,
                classifiedData.decimalValue.length && attributeValueTableName.decimal
                    ? queryUtil.createList(
                          attributeValueTableName.decimal,
                          classifiedData.decimalValue,
                          newOptions,
                      )
                    : undefined,
                classifiedData.textValue.length && attributeValueTableName.text
                    ? queryUtil.createList(attributeValueTableName.text, classifiedData.textValue, newOptions)
                    : undefined,
                classifiedData.datetimeValue.length && attributeValueTableName.datetime
                    ? queryUtil.createList(
                          attributeValueTableName.datetime,
                          classifiedData.datetimeValue,
                          newOptions,
                      )
                    : undefined,
            ]);

            if (!options.trx) await this.commitTrx(trx);

            return listDto;
        } catch (err: any) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    async upsertListAttributeValue(
        listDto: EavAttributeValueDto[],
        options: QueryUtilMethodOptions & QueryUtilUpsertOptions = {},
    ) {
        if (!listDto.length) return listDto;

        const queryUtil = this.queryUtil as IEavQueryUtil<EavAttributeValueDto>;
        const attributeValueTableName = this.getAttributeValueTableName();
        const classifiedData = this.getClassifiedAttributeValueData(listDto);
        options.conflictColumn = ['entity_id', 'attribute_code'];

        const trx = options.trx ?? (await this.startTrx());
        const newOptions = { ...options, trx };
        try {
            await Promise.all([
                classifiedData.varcharValue.length && attributeValueTableName.varchar
                    ? queryUtil.upsertList(
                          attributeValueTableName.varchar,
                          classifiedData.varcharValue,
                          newOptions,
                      )
                    : undefined,
                classifiedData.intValue.length && attributeValueTableName.int
                    ? queryUtil.upsertList(attributeValueTableName.int, classifiedData.intValue, newOptions)
                    : undefined,
                classifiedData.decimalValue.length && attributeValueTableName.decimal
                    ? queryUtil.upsertList(
                          attributeValueTableName.decimal,
                          classifiedData.decimalValue,
                          newOptions,
                      )
                    : undefined,
                classifiedData.textValue.length && attributeValueTableName.text
                    ? queryUtil.upsertList(attributeValueTableName.text, classifiedData.textValue, newOptions)
                    : undefined,
                classifiedData.datetimeValue.length && attributeValueTableName.datetime
                    ? queryUtil.upsertList(
                          attributeValueTableName.datetime,
                          classifiedData.datetimeValue,
                          newOptions,
                      )
                    : undefined,
            ]);

            if (!options.trx) await this.commitTrx(trx);

            return listDto;
        } catch (err: any) {
            if (!options.trx) await this.rollbackTrx(trx);
            throw this.transformError(err);
        }
    }

    private getClassifiedAttributeValueData(listDto: EavAttributeValueDto[]) {
        const attributeData = this.getAttributeTableData();
        const attributeCodeMap: Record<string, string> = {};
        for (const data of attributeData) {
            attributeCodeMap[data.code] = data.type;
        }
        const varcharValue = [],
            intValue = [],
            decimalValue = [],
            textValue = [],
            datetimeValue = [];
        for (const dto of listDto) {
            const type = attributeCodeMap[dto.attributeCode];
            if (type === EavAttributeTypes.VARCHAR) varcharValue.push(dto);
            else if (type === EavAttributeTypes.INT) intValue.push(dto);
            else if (type === EavAttributeTypes.DECIMAL) decimalValue.push(dto);
            else if (type === EavAttributeTypes.TEXT) textValue.push(dto);
            else if (type === EavAttributeTypes.DATETIME) datetimeValue.push(dto);
        }
        return {
            varcharValue,
            intValue,
            decimalValue,
            textValue,
            datetimeValue,
        };
    }
}
