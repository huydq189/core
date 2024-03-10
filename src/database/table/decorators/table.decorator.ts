import { AttributeValueTableName } from './eav.decorator';

export const tableNameMetadataKey = Symbol.for('table:name');
export const tableEavMetadataKey = Symbol.for('table:eav');

type TableOptions = {
    name?: string;
    eav?: boolean;
};

export function Table(options: TableOptions): ClassDecorator {
    const { name, eav } = options;
    return (target: Function) => {
        Reflect.defineMetadata(
            tableNameMetadataKey,
            (name || target.name.toLowerCase()).toString(),
            target.prototype,
        );
        if (eav) {
            const attributeTable = `${name}_a`;
            const attributeValueTables = {
                varchar: `${name}_av_varchar`,
                int: `${name}_av_int`,
                text: `${name}_av_text`,
                datetime: `${name}_av_datetime`,
                decimal: `${name}_av_decimal`,
            };
            const eavMetadata: {
                attributeTable: string;
                attributeValueTables: AttributeValueTableName;
            } = {
                attributeTable,
                attributeValueTables,
            };
            Reflect.defineMetadata(tableEavMetadataKey, eavMetadata, target.prototype);
        }
    };
}
