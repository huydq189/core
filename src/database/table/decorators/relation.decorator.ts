import { RelationMetadata, TableRelationships } from '..';
import { StringFormatter } from '../../../common/string';
import { DATABASE_DECRALATION } from '../../database.decralation';

export type RelationOptions = Partial<Omit<RelationMetadata, 'relationship'>> & {
    tableName: string;
};

function getRelationMetadata(
    options: RelationOptions,
    propertyKey: string | symbol,
    relationship: TableRelationships,
) {
    const name: string = options.name || StringFormatter.camelToSnakeCase(propertyKey.toString());
    const localId: string = options.localId || 'id';
    const refId: string = options.refId || 'id';
    const relationMetadata: RelationMetadata = {
        ...options,
        name,
        localId,
        refId,
        relationship,
    };
    return relationMetadata;
}

export function OneToOne(options: RelationOptions): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        Reflect.defineMetadata(
            DATABASE_DECRALATION.TABLE_RELATION,
            getRelationMetadata(options, propertyKey, TableRelationships.ONE_TO_ONE),
            target,
            propertyKey,
        );
    };
}

export function OneToMany(options: RelationOptions): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        Reflect.defineMetadata(
            DATABASE_DECRALATION.TABLE_RELATION,
            getRelationMetadata(options, propertyKey, TableRelationships.ONE_TO_MANY),
            target,
            propertyKey,
        );
    };
}
