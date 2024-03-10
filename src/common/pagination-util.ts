import { ComparisonOperators, ComparisonUriOperators, FilterInput, LogicalOperators } from '../database';
import { PaginationInput } from '../usecase';

export type FilterSchema<T> = {
    [P in keyof T]?: { [key in ComparisonOperators]?: true } | FilterSchema<T[P]>;
} & { [key in LogicalOperators]?: FilterSchema<T> };

function transformFilter(filter: FilterInput, schema?: any) {
    Object.entries(filter).forEach(([key, value]: any) => {
        Object.keys(value).forEach((operator) => {
            let newOperator;
            switch (operator) {
                case ComparisonUriOperators.eq:
                    newOperator = ComparisonOperators.$eq;
                    break;
                case ComparisonUriOperators.lt:
                    newOperator = ComparisonOperators.$lt;
                    break;
                case ComparisonUriOperators.gt:
                    newOperator = ComparisonOperators.$gt;
                    break;
                case ComparisonUriOperators.lte:
                    newOperator = ComparisonOperators.$lte;
                    break;
                case ComparisonUriOperators.gte:
                    newOperator = ComparisonOperators.$gte;
                    break;
                case ComparisonUriOperators.in:
                    newOperator = ComparisonOperators.$in;
                    break;
                case ComparisonUriOperators.ne:
                    newOperator = ComparisonOperators.$ne;
                    break;
                case ComparisonUriOperators.nin:
                    newOperator = ComparisonOperators.$nin;
                    break;
                case ComparisonUriOperators.like:
                    newOperator = ComparisonOperators.$like;
                    break;
                case ComparisonUriOperators.ilike:
                    newOperator = ComparisonOperators.$ilike;
                    break;
                case ComparisonUriOperators.contains:
                    newOperator = ComparisonOperators.$contains;
                    break;
                case ComparisonUriOperators.startswith:
                    newOperator = ComparisonOperators.$startswith;
                    break;
                case ComparisonUriOperators.endswith:
                    newOperator = ComparisonOperators.$endswith;
                    break;
                default:
                    break;
            }
            if (newOperator) {
                (filter as any)[key][newOperator] = (filter as any)[key][operator];
                delete (filter as any)[key][operator];
            }
        });

        if (schema) {
            switch (key) {
                case LogicalOperators.$not:
                    if (schema[LogicalOperators.$not]) transformFilter(value, schema[LogicalOperators.$not]);
                    else delete (filter as any)[key];
                    break;
                case LogicalOperators.$and:
                    if (schema[LogicalOperators.$and]) transformFilter(value, schema[LogicalOperators.$and]);
                    else delete (filter as any)[key];
                    break;
                case LogicalOperators.$or:
                    if (schema[LogicalOperators.$or]) transformFilter(value, schema[LogicalOperators.$or]);
                    else delete (filter as any)[key];
                    break;
                default:
                    Object.keys(value).forEach((operator) => {
                        if (!((schema as any)[key] ?? {})[operator]) delete (filter as any)[key][operator];
                    });
                    break;
            }
        }
    });
}
export class PaginationUtil {
    static transform<T>(
        input: PaginationInput<T>,
        configs: {
            schema?: FilterSchema<T>;
            defaultLimit?: number;
            maxLimit?: number;
        } = {
            defaultLimit: 10,
            maxLimit: 100,
        },
    ): PaginationInput<T> {
        const { defaultLimit, maxLimit, schema } = configs;

        const limit = input.limit ? (input.limit > maxLimit! ? maxLimit : input.limit) : defaultLimit;

        const filter = input.filter;
        if (filter) transformFilter(filter, schema);

        const result: PaginationInput<T> = {
            ...input,
            limit,
        };

        return result;
    }
}
