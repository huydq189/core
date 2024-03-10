// TODO: check circular dependency
import { BaseTable, Column, TABLE_FIELD_DEFAULT_VALUE } from '../../database/table';
import { EavAttributeDto } from '../dtos';
import { EavAttributeStatus, EavAttributeTypes } from '../enums';

export class EavAttributeTable extends BaseTable<EavAttributeDto> implements EavAttributeDto {
    @Column({ isPrimaryKey: true })
    code: string = TABLE_FIELD_DEFAULT_VALUE;

    @Column()
    label: string = TABLE_FIELD_DEFAULT_VALUE;

    @Column()
    type: EavAttributeTypes = TABLE_FIELD_DEFAULT_VALUE;

    @Column()
    status: EavAttributeStatus = TABLE_FIELD_DEFAULT_VALUE;

    @Column()
    sortOrder: number = TABLE_FIELD_DEFAULT_VALUE;

    @Column()
    visibility: boolean = TABLE_FIELD_DEFAULT_VALUE;

    @Column()
    systemDefined: boolean = TABLE_FIELD_DEFAULT_VALUE;

    @Column()
    isRequired: boolean = TABLE_FIELD_DEFAULT_VALUE;

    @Column()
    editable: boolean = TABLE_FIELD_DEFAULT_VALUE;

    @Column()
    createdAt: Date = TABLE_FIELD_DEFAULT_VALUE;

    @Column()
    updatedAt: Date = TABLE_FIELD_DEFAULT_VALUE;
}
