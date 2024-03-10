import { Optional } from '@heronjs/common';
import { Knex } from 'knex';
import { IBaseTable, RelationTable } from '../table';
import { SortType } from './query-util.enums';

export const ResolveAttributes = 'attributes';
export type ResolveOption<T> = (
    | keyof T
    | { [P in keyof T]?: ResolveOption<T[P]> | (string | object)[] }
    | 'attributes'
)[];

export type QueryUtilJoinOptions<T = any> = {
    resolve?: ResolveOption<T>;
};

export type AllTables = Map<string, IBaseTable>;
export type AllRelations = Map<string, RelationTable>;
export type EavAttributeTables = Map<string, EavAttributeTableData[]>;
export type EavAttributeTableData = { code: string; type: string };

export type QueryUtilMethodOptions = {
    trx?: Knex.Transaction;
    forUpdate?: boolean;
    useMaster?: boolean;
    tenantId?: string;
};

export type QueryUtilUpsertOptions = {
    conflictColumn?: any;
    onConflict?: 'merge' | 'ignore';
};

export type PaginationOutput<T> = {
    items: T;
    pagination: {
        offset: number;
        limit: number;
        total?: number;
    };
};

export type PaginationInputProps<T> = {
    offset?: Optional<number>;
    limit?: Optional<number>;
    filter?: Optional<T>;
    orderBy?: Optional<string>;
    sort?: Optional<SortType>;
};

export type SelectInput = string[] | Record<string, string[]>;

export type QueryInput<T = any> = {
    select?: SelectInput;
    offset?: Optional<number>;
    limit?: Optional<number>;
    filter?: Optional<FilterInput<T>>;
    sort?: Optional<SortInput<T>>;
};

export type EavQueryInput<T = any> = {
    eavSelect?: string[];
    eavFilter?: Optional<FilterInput<T>>;
} & QueryInput<T>;

export type QueryInputFindOne<T = any> = {
    select?: string[];
    filter?: Optional<FilterInput<T>>;
    sort?: Optional<SortInput<T>>;
};

export type EavQueryInputFindOne<T = any> = {
    eavSelect?: string[];
    eavFilter?: Optional<FilterInput>;
} & QueryInputFindOne<T>;

export type ComparisonInput = {
    $eq?: string | number | boolean | null;
    $lt?: string | number;
    $gt?: string | number;
    $lte?: string | number;
    $gte?: string | number;
    $in?: string[] | number[];
    $ne?: string | number | boolean | null;
    $nin?: string[] | number[];
    $like?: string | number;
    $ilike?: string | number;
    $contains?: string | number;
    $startswith?: string | number;
    $endswith?: string | number;
};

export type CustomInput = {
    $raw?: {
        query: string;
        bindings?: (string | number)[];
    };
};

export type LogicalInput<T = any> = {
    $and?: FilterInput<T>[];
    $or?: FilterInput<T>[];
    $not?: FilterInput<T>;
};

export type BuilderInput = {
    $builder?: (query: Knex.QueryBuilder) => Knex.QueryBuilder;
};

export type FilterInput<T = any> = {
    [P in keyof T]?:
        | ComparisonInput
        | CustomInput
        | {
              [L in keyof T[P]]?: ComparisonInput | CustomInput;
          };
} & LogicalInput<T> &
    BuilderInput;

export type SortInput<T = any> = {
    [P in keyof T]?: SortType | SortInput<T[P]>;
};

export type FilterHandlerPayload = {
    query: Knex.QueryBuilder;
    columnName: string;
    value: any;
    attribute?: string;
};
export type FilterHandler = (payload: FilterHandlerPayload) => void;
export type FilterHandlerMap = {
    [P in keyof ComparisonInput]: FilterHandler;
};
