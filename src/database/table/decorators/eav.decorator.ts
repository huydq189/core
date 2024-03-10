export const EAV_ENTITY_METADATA_KEY = Symbol.for('table:eav_entity');
export const EAV_ATTRIBUTE_METADATA_KEY = Symbol.for('table:eav_attribute');
export const EAV_VALUE_METADATA_KEY = Symbol.for('table:eav_value');

export type AttributeValueTableName = {
    varchar?: string;
    int?: string;
    decimal?: string;
    text?: string;
    datetime?: string;
    any?: string;
};

export type EavOptions = {
    type: EavTableTypes;
};

export enum EavTableTypes {
    Entity,
    Attribute,
    Value,
}

export function Eav(options: EavOptions): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        switch (options.type) {
            case EavTableTypes.Entity:
                Reflect.defineMetadata(EAV_ENTITY_METADATA_KEY, propertyKey, target);
                break;

            case EavTableTypes.Attribute:
                Reflect.defineMetadata(EAV_ATTRIBUTE_METADATA_KEY, propertyKey, target);
                break;

            case EavTableTypes.Value:
                Reflect.defineMetadata(EAV_VALUE_METADATA_KEY, propertyKey, target);
                break;

            default:
                break;
        }
    };
}
