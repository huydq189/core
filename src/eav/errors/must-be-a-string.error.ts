import { RuntimeError } from '@heronjs/common';
import { ErrorCodes, ErrorNamespaces } from './eav.errors';

export class MustBeAStringError extends RuntimeError {
    constructor(message?: string) {
        super(
            ErrorNamespaces.EAV,
            ErrorCodes.TYPE_OF_VALUE_MUST_BE_A_STRING,
            message ?? 'EAV attribute value must be a string',
        );
    }
}
