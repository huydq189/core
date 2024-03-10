import { RuntimeError } from '@heronjs/common';
import { AuthorizeErrorCodes, ErrorNamespaces } from './errors';

export class UnauthorizedError extends RuntimeError {
    constructor() {
        super(
            ErrorNamespaces.AUTHORIZE,
            AuthorizeErrorCodes.UNAUTHORIZED,
            'Token not present in req header!',
        );
    }
}
