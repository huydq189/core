import ShortUniqueId from 'short-unique-id';

export class ShortIdUtil {
    private static _instance: ShortUniqueId;

    static get instance(): ShortUniqueId {
        if (!this._instance) {
            this._instance = new ShortUniqueId();
            this._instance.setDictionary('alphanum_upper');
        }

        return this._instance;
    }
}
