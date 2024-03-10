import { Logger } from '@heronjs/common';

export type MessagingPayload<T> = { config: T; name: string };
export type MessagingPublishPayload<T> = { data: T; options?: any };
export type MessagingSubscribePayload<T> = { messageHandler: (message: T) => any };

export interface IQueueMessaging<T> {
    name: string;

    connect(): Promise<void>;

    publish(payload: MessagingPublishPayload<T>): void;

    subscribe: (payload: MessagingSubscribePayload<T>) => void;
}

export abstract class AbstractQueueMessaging<T, K, L> implements IQueueMessaging<L> {
    protected readonly _config: T;
    protected _client!: K;
    private readonly _name: string;
    protected readonly _logger: Logger;

    protected constructor({ name, config, logger }: MessagingPayload<T> & { logger: Logger }) {
        this._logger = logger;
        this._config = config;
        this._name = name;
    }

    public get name(): string {
        return this._name;
    }

    protected abstract onConnected(err?: Error): void;

    protected abstract onDisconnected(err?: Error): void;

    public abstract connect(): Promise<void>;

    public abstract publish(payload: MessagingPublishPayload<L>): void;

    public abstract subscribe(payload: MessagingSubscribePayload<L>): void;
}
