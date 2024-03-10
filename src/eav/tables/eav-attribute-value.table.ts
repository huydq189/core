// TODO: check circular dependency
import { BaseTable, Column, Eav, EavTableTypes, TABLE_FIELD_DEFAULT_VALUE } from '../../database/table';
import { EavAttributeValueDto } from '../dtos';

export class EavAttributeValueTable extends BaseTable<EavAttributeValueDto> implements EavAttributeValueDto {
    @Column()
    id: string = TABLE_FIELD_DEFAULT_VALUE;

    @Column()
    value: any = TABLE_FIELD_DEFAULT_VALUE;

    @Column()
    @Eav({ type: EavTableTypes.Entity })
    entityId: string = TABLE_FIELD_DEFAULT_VALUE;

    @Column()
    @Eav({ type: EavTableTypes.Attribute })
    attributeCode: string = TABLE_FIELD_DEFAULT_VALUE;
}

export class EavAttributeValueDecimalTable extends EavAttributeValueTable {
    @Column({
        toDtoParser: (value) => {
            console.log('sadadadljsdkajdlkd');
            return parseFloat(value);
        },
    })
    value: any = TABLE_FIELD_DEFAULT_VALUE;
}
