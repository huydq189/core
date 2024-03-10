import { Nullable, Optional } from '@heronjs/common';
import { DATABASE_DECRALATION } from '../database.decralation';
import { ResolveAttributes } from '../query-util';
import {
    AttributeValueTableName,
    EAV_ATTRIBUTE_METADATA_KEY,
    EAV_ENTITY_METADATA_KEY,
    tableEavMetadataKey,
    tableNameMetadataKey,
} from './decorators';
import { TableRelationships } from './table.enums';

export enum QueryActions {
    CREATE,
    CREATE_LIST,
    UPDATE,
    UPDATE_LIST,
    UPSERT,
    UPSERT_LIST,
}

export type ColumnMetadata = {
    name: string;
    isPrimaryKey?: boolean;
    toDtoParser?: (
        value: any,
        context: {
            data: Record<string, any>;
        },
    ) => any;
    toRecordParser?: (
        value: any,
        context: {
            data: Record<string, any>;
            action?: QueryActions;
        },
    ) => any;
};

export type RelationMetadata = {
    tableName: string;
    name: string;
    localId: string;
    refId: string;
    relationship: TableRelationships;
    options?: {
        lazy?: boolean;
    };
    isEav?: boolean;
};

export interface IBaseTable<DTO = any> {
    tableName: string;
    primaryKeyColumnName: string;
    eav: {
        attributeTable: string;
        attributeOptionValueTable: string;
        attributeValueTables: AttributeValueTableName;
    };
    eavColumnNames: {
        entity: string;
        attribute: string;
    };

    // Get metadata
    getColumnMetadata(fieldName: string): Optional<ColumnMetadata>;

    getRelationMetadata(fieldName: string): Optional<RelationMetadata>;

    // Get column name
    getColumnName(fieldName: string, tableName?: string): Nullable<string>;

    getPrimaryKeyColumnName(tableName?: string): string;

    getColumnNames(payload?: { tableName?: string }): string[][];

    getSelectionFields(payload?: { tableName?: string; selectedFields?: string[] }): string[];

    toTable<K extends IBaseTable<DTO>>(payload: any): K;

    toRecord(payload?: { includes?: any[]; action?: QueryActions }): any;

    fromDto(dto: Partial<DTO>): IBaseTable<Partial<DTO>>;

    toDto(table: IBaseTable<Partial<DTO>>): Partial<DTO>;
}

export type BaseTableConstructorPayload = { tableName?: string };
export class BaseTable<DTO extends Record<string, any> = Record<string, any>> implements IBaseTable<DTO> {
    constructor(payload?: BaseTableConstructorPayload) {
        Object.defineProperties(this, {
            _tableName: {
                enumerable: false,
                value: Reflect.getMetadata(tableNameMetadataKey, this) ?? payload?.tableName,
            },
            _primaryKeyColumnName: {
                enumerable: false,
                value:
                    this.getColumnMetadata(Reflect.getMetadata(DATABASE_DECRALATION.TABLE_PRIMARY_KEY, this))
                        ?.name ?? 'id',
            },
            _eav: {
                enumerable: false,
                value: Reflect.getMetadata(tableEavMetadataKey, this),
            },
            _eavColumnNames: {
                enumerable: false,
                value: {
                    entity: Reflect.getMetadata(EAV_ENTITY_METADATA_KEY, this),
                    attribute: Reflect.getMetadata(EAV_ATTRIBUTE_METADATA_KEY, this),
                },
            },
        });
    }

    private _tableName!: string;
    get tableName(): string {
        return this._tableName;
    }

    private _primaryKeyColumnName!: string;
    get primaryKeyColumnName(): string {
        return this._primaryKeyColumnName;
    }

    private _eav!: {
        attributeTable: string;
        attributeOptionValueTable: string;
        attributeValueTables: AttributeValueTableName;
    };
    get eav() {
        return this._eav;
    }

    private _eavColumnNames!: {
        entity: string;
        attribute: string;
    };
    get eavColumnNames() {
        return this._eavColumnNames;
    }

    private _getColumnAliasName(columnName: string) {
        return this.tableName + '.' + columnName;
    }

    private new(payload: any) {
        const table = this as any;
        Object.keys(table).forEach((key) => {
            const columnMetadata = this.getColumnMetadata(key);
            if (columnMetadata) {
                if (columnMetadata.toDtoParser) {
                    table[key] = columnMetadata.toDtoParser(
                        payload[this._getColumnAliasName(columnMetadata.name!)],
                        payload,
                    );
                } else {
                    table[key] = payload[this._getColumnAliasName(columnMetadata.name)];
                }
            } else {
                const relationMetadata = this.getRelationMetadata(key);
                if (relationMetadata) {
                    table[key] = payload[relationMetadata.name];
                }
            }
        });
        if (payload[ResolveAttributes]) table[ResolveAttributes] = payload[ResolveAttributes];
        return table;
    }

    private set(dto: Partial<DTO>) {
        const table = this as any;
        Object.keys(table).forEach((key) => {
            table[key] = dto[key];
        });
        return table;
    }

    getPrimaryKeyColumnName(tableName?: string): string {
        return [tableName ? tableName : this.tableName, this.primaryKeyColumnName].join('.');
    }

    getColumnMetadata(fieldName: string): Optional<ColumnMetadata> {
        return Reflect.getMetadata(DATABASE_DECRALATION.TABLE_COLUMN, this, fieldName);
    }

    getRelationMetadata(fieldName: string): Optional<RelationMetadata> {
        return Reflect.getMetadata(DATABASE_DECRALATION.TABLE_RELATION, this, fieldName);
    }

    // (tableName|aliasName).columnName
    getColumnName(fieldName: string, tableName?: string): Nullable<string> {
        const columnName = this.getColumnMetadata(fieldName)?.name;
        if (columnName) return [tableName ? tableName : this.tableName, columnName || fieldName].join('.');
        return null;
    }

    getSelectionFields({
        tableName,
        selectedFields,
    }: { tableName?: string; selectedFields?: string[] } = {}): string[] {
        const fields: string[] = [];
        const selectedFieldsMap: Record<string, boolean> = {};
        if (selectedFields) {
            for (const field of selectedFields) {
                selectedFieldsMap[field] = true;
            }
        } else {
            selectedFieldsMap['*'] = true;
        }
        Object.keys(this).forEach((key) => {
            const columnMetadata = this.getColumnMetadata(key);

            if (columnMetadata) {
                const field = [tableName ? `${tableName}.` : '', columnMetadata.name].join('');
                if (selectedFieldsMap['*'] || selectedFieldsMap[columnMetadata.name!]) {
                    fields.push(field + ' as ' + field);
                }
            }
        });

        return fields;
    }

    getColumnNames({ tableName }: { tableName?: string } = {}): string[][] {
        const names: string[][] = [];
        Object.keys(this).forEach((key) => {
            const columnMetadata = this.getColumnMetadata(key);
            if (columnMetadata) {
                const name = [this.tableName, columnMetadata.name].join('.');
                const joinName = this.getColumnName(key, tableName);
                if (joinName) names.push([name, joinName]);
            }
        });

        return names;
    }

    toTable<K extends IBaseTable<DTO>>(payload: any): K {
        if (payload === undefined || payload === null) return payload;
        return new (this as any).constructor({ tableName: this.tableName }).new(payload);
    }

    toRecord({ includes, action }: { includes?: any[]; action?: QueryActions } = {}): Record<string, any> {
        const result: Record<string, any> = {};
        const data = this as any;

        Object.keys(this).forEach((key) => {
            if (includes && !includes.includes(key)) return;

            const columnMetadata = this.getColumnMetadata(key);
            let value = data[key];
            if (typeof value === 'string') value = value.normalize();

            if (columnMetadata) {
                if (columnMetadata.toRecordParser) {
                    result[columnMetadata.name!] = columnMetadata.toRecordParser(value, {
                        data,
                        action,
                    });
                } else {
                    result[columnMetadata.name!] = value;
                }
            }
        });

        return result;
    }

    fromDto(dto: Partial<DTO>): IBaseTable<Partial<DTO>> {
        if (dto === undefined || dto === null) return dto;
        return new (this as any).constructor().set(dto);
    }

    toDto(table: IBaseTable<Partial<DTO>>): Partial<DTO> {
        if (table === undefined || table === null) return table;

        const payload: Record<string, any> = {};
        Object.keys(table).forEach((key) => {
            payload[key] = (table as any)[key];
        });
        return payload as Partial<DTO>;
    }
}
