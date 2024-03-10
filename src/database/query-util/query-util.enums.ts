export enum TransformJoinResultTypes {
    Single,
    Multiple,
}

export enum ComparisonOperators {
    $eq = '$eq',
    $lt = '$lt',
    $gt = '$gt',
    $lte = '$lte',
    $gte = '$gte',
    $in = '$in',
    $ne = '$ne',
    $nin = '$nin',
    $like = '$like',
    $ilike = '$ilike',
    $contains = '$contains',
    $startswith = '$startswith',
    $endswith = '$endswith',
}

export enum LogicalOperators {
    $not = '$not',
    $and = '$and',
    $or = '$or',
}

export enum BuilderOperators {
    $builder = '$builder',
}

export enum CustomOperators {
    $raw = '$raw',
}

export type SortType = 'asc' | 'desc';

export enum ComparisonUriOperators {
    eq = 'eq',
    lt = 'lt',
    gt = 'gt',
    lte = 'lte',
    gte = 'gte',
    in = 'in',
    ne = 'ne',
    nin = 'nin',
    like = 'like',
    ilike = 'ilike',
    contains = 'contains',
    startswith = 'startswith',
    endswith = 'endswith',
}

export enum LogicalUriOperators {
    not = 'not',
    and = 'and',
    or = 'or',
}
