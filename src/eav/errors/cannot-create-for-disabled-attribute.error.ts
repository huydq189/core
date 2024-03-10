import { RuntimeError } from '@heronjs/common';
import { ErrorCodes, ErrorNamespaces } from './eav.errors';

export class CannotCreateOrUpdateForDisabledAttributeError extends RuntimeError {
    constructor(message?: string) {
        super(
            ErrorNamespaces.EAV,
            ErrorCodes.CANNOT_CREATE_FOR_DISABLED_ATTRIBUTE,
            message ?? 'EAV attribute value cannot create or update for disabled attribute',
        );
    }
}
