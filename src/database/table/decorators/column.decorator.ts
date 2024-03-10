// TODO: check circular dependency
import { StringFormatter } from '../../../common/string';
import { DATABASE_DECRALATION } from '../../database.decralation';
import { ColumnMetadata } from '../table';

export type ColumnOptions = Partial<ColumnMetadata>;

export function Column(options: ColumnOptions = {}): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        const name: string = options.name || StringFormatter.camelToSnakeCase(propertyKey.toString());
        const columnMetadata: ColumnMetadata = {
            name,
            ...options,
        };
        Reflect.defineMetadata(DATABASE_DECRALATION.TABLE_COLUMN, columnMetadata, target, propertyKey);
        if (options.isPrimaryKey)
            Reflect.defineMetadata(DATABASE_DECRALATION.TABLE_PRIMARY_KEY, propertyKey, target);
    };
}
