// TODO: check circular dependency
import { BaseTable, Column, TABLE_FIELD_DEFAULT_VALUE } from '../../database/table';
import { EavAttributeOptionValueDto } from '../dtos';

export class EavAttributeOptionValueTable
    extends BaseTable<EavAttributeOptionValueDto>
    implements EavAttributeOptionValueDto
{
    @Column()
    id: string = TABLE_FIELD_DEFAULT_VALUE;
    @Column()
    attributeCode: string = TABLE_FIELD_DEFAULT_VALUE;
    @Column()
    value: any = TABLE_FIELD_DEFAULT_VALUE;
}
