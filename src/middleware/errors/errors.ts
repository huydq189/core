export enum ErrorNamespaces {
    AUTHORIZE = 'AUTHORIZE',
}

export enum AuthorizeErrorCodes {
    UNAUTHORIZED = '1000',
    INVALID_TOKEN = '1001',
    MISMATCHED_TOKEN = '1002',
    INSUFFICIENT_PERMISSION = '1003',
    TOKEN_EXPIRED = '1004',
}
