import { Optional } from '@heronjs/common';

export type EntityConstructorPayload<T> = { id?: string; props?: T; externalProps?: Record<string, any> };

export type IEntity<T = any, K = any> = {
    [P in keyof T]: T[P];
} & {
    [P in keyof K]: K[P];
} & {
    id: string;
    props: T;
    externalProps?: Record<string, any>;
    equals(entity: IEntity<T, K>): boolean;
    setExternalProps(payload: Record<string, any>): void;
};

export abstract class Entity<T, K> implements IEntity {
    private _id!: string;
    private _props!: T;
    private _externalProps?: Record<string, any>;

    protected constructor({ id, props, externalProps }: EntityConstructorPayload<T>) {
        if (id === undefined || props === undefined) {
            this._props = {} as any;
            return;
        }
        this._id = id;
        this._props = props;
        this._externalProps = externalProps;
    }

    get id(): string {
        return this._id;
    }

    get props(): T {
        return this._props;
    }

    get externalProps(): Optional<Record<string, any>> {
        return this._externalProps;
    }

    protected setId(payload?: string) {
        if (payload !== undefined) this._id = payload;
    }

    public equals(entity: IEntity<T, K>) {
        if (entity.id === undefined || entity.id === null) return false;
        if (!(entity instanceof this.constructor)) return false;

        return entity.id === this.id;
    }

    public setExternalProps(payload?: Record<string, any>) {
        if (typeof payload !== 'object' || Array.isArray(payload)) return;

        if (this._externalProps === undefined) {
            this._externalProps = payload;
            return;
        }

        Object.keys(this._externalProps).forEach((key: string) => {
            if (payload[key] !== undefined) this._externalProps![key] = payload[key];
        });
    }
}
