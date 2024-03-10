import { RuntimeError } from '@heronjs/common';
import { ErrorCodes, ErrorNamespaces } from './eav.errors';

export class AttributeCodeAlreadyExistError extends RuntimeError {
    constructor(message?: string) {
        super(
            ErrorNamespaces.EAV,
            ErrorCodes.ATTRIBUTE_CODE_ALREADY_EXIST,
            message ?? 'Attribute code already exist',
        );
    }
}
