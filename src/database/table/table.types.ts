import { BaseTable, TableRelationships } from '.';

export type TableProps<T> = {
    [P in keyof T]: TableField<T[P]>;
};

export type TableField<T = any> = {
    value: T;
    name: string;
};

export type RelationTable = {
    tableName: string;
    relationship: TableRelationships;
    name: string;
    constraintName: string;
    localId: string;
    refId: string;
    children?: RelationTable[];
    options?: {
        lazy?: boolean;
    };
    isEav?: boolean;
};

export interface ITables {
    allTables: Map<string, BaseTable>;
}
