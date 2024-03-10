import { Logger } from '@heronjs/common';
import { ConnectionOptions, JSONCodec, JetStreamClient, NatsConnection, connect } from 'nats';
import { NatsConfig } from '../../configs';
import {
    AbstractQueueMessaging,
    MessagingPayload,
    MessagingPublishPayload,
    MessagingSubscribePayload,
} from '../abstract-queue.messaging';

export class NatsQueueMessaging<T> extends AbstractQueueMessaging<any, NatsConnection, T> {
    protected _jetStreamClient!: JetStreamClient;

    constructor({ name, config = NatsConfig }: MessagingPayload<any>) {
        super({ name, config, logger: new Logger(NatsQueueMessaging.name) });
    }

    private readonly LOG_NAME = `[${this.constructor.name}:${this.name}]`;

    public async connect(options?: ConnectionOptions) {
        try {
            this._client = await connect({
                servers: `${this._config.host}:${this._config.port}`,
                name: this.name,
                ...options,
            });
            this._client.closed().then((err: any) => this.onDisconnected(err));
            this.onConnected();

            if (this._config.jetStream) {
                const jetStreamManager = await this._client.jetstreamManager();
                await jetStreamManager.streams.add({
                    name: this._config.jetStream.name,
                    retention: this._config.jetStream.retention,
                    subjects: [this._config.jetStream.subjects],
                });
                this._jetStreamClient = this._client.jetstream();
            }
        } catch (err) {
            this.onConnected(err as any);
        }
    }

    async publish(payload: MessagingPublishPayload<T>) {
        const jc = JSONCodec();
        const encodedData = jc.encode(payload.data);
        try {
            if (this._config.jetStream) {
                return this._jetStreamClient.publish(
                    this._config.jetStream.subjects,
                    encodedData,
                    payload.options,
                );
            } else {
                return this._client.publish(this.name, encodedData, payload.options);
            }
        } catch (err: any) {
            throw new Error(
                `Failed to publish message to subject ${this._config.jetStream.subjects}: ${err.message}`,
            );
        }
    }

    async subscribe({ messageHandler }: MessagingSubscribePayload<T>) {
        const jc = JSONCodec();
        try {
            let messages;
            if (this._config.jetStream) {
                messages = await this._jetStreamClient.pullSubscribe(this._config.jetStream.subjects, {});
            } else {
                messages = await this._client.subscribe(this.name);
            }
            this._logger.info(`${this.LOG_NAME}: subscribed`);
            await (async () => {
                for await (const m of messages) {
                    const data = jc.decode(m.data) as T;
                    this._logger.info(`${this.LOG_NAME}: subscribed`);
                    try {
                        this._logger.info(`${this.LOG_NAME}: subscriber message received`);
                        await messageHandler(data);
                        this._logger.info(`${this.LOG_NAME}: subscriber message processed`);
                    } catch (err) {
                        this._logger.error(`${this.LOG_NAME}: subscriber message processing failed`, err);
                    }
                }
            })();
        } catch (err) {
            this._logger.error(`${this.LOG_NAME}: subscribe failed`, err);
        }
    }

    protected onConnected(err?: Error): void {
        if (err) this._logger.error(`${this.LOG_NAME}: queue connect failed`, err);
        else this._logger.info(`${this.LOG_NAME}: queue connected`);
    }

    protected onDisconnected(err?: Error): void {
        if (err) {
            this._logger.error(`${this.LOG_NAME}: queue disconnected because of error ${err.message}`, err);
            return;
        }

        this._logger.info(`${this.LOG_NAME}: queue disconnected`);
    }
}
