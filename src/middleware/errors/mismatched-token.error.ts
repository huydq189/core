import { RuntimeError } from '@heronjs/common';
import { AuthorizeErrorCodes, ErrorNamespaces } from './errors';

export class MismatchedTokenError extends RuntimeError {
    constructor() {
        super(ErrorNamespaces.AUTHORIZE, AuthorizeErrorCodes.MISMATCHED_TOKEN, 'Token does not match!');
    }
}
