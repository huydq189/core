import { RuntimeError } from '@heronjs/common';
import { ErrorCodes, ErrorNamespaces } from './eav.errors';

export class MustBeABooleanError extends RuntimeError {
    constructor(message?: string) {
        super(
            ErrorNamespaces.EAV,
            ErrorCodes.TYPE_OF_VALUE_MUST_BE_A_BOOLEAN,
            message ?? 'EAV attribute value must be a boolean',
        );
    }
}
