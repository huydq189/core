import { v4 as uuidV4 } from 'uuid';

export class EntityIdUtil {
    static randomUUID(): string {
        return uuidV4();
    }
}
