import { Logger } from '@heronjs/common';
import { Entity, EntityConstructorPayload, IEntity } from './entity';
import { DomainEvent } from './event';

export interface DomainEventEmitter {
    emit(name: string, data: DomainEvent<any>): void;
}

export type AggregateRootConstructorPayload<T> = EntityConstructorPayload<T> & {
    eventEmitter?: DomainEventEmitter;
};

export type IAggregateRoot<T = any, K = any> = IEntity<T, K> & {
    domainEvents: DomainEvent<T>[];
    dispatchDomainEvents(): void;
};

export abstract class AggregateRoot<T, K> extends Entity<T, K> implements IAggregateRoot {
    private readonly logger: Logger;
    private _domainEvents: DomainEvent<T>[] = [];
    private eventEmitter?: DomainEventEmitter;

    protected constructor({ id, props, eventEmitter }: AggregateRootConstructorPayload<T>) {
        super({ id, props });
        this.logger = new Logger(this.constructor.name);
        this.eventEmitter = eventEmitter;
    }

    get domainEvents(): DomainEvent<T>[] {
        return this._domainEvents;
    }

    protected addDomainEvent(name: string): void {
        const event: DomainEvent<T> = {
            name,
            aggregateId: this.id,
            metadata: {
                props: this.props,
                externalProps: this.externalProps,
            },
            createdAt: new Date(),
        };
        this._domainEvents.push(event);
    }

    protected clearEvents(): void {
        this._domainEvents = [];
    }

    public dispatchDomainEvents() {
        if (this._domainEvents.length && this.eventEmitter)
            this.logger.warning(`[DOMAIN_EVENT]: Handler not set!`);

        try {
            if (this.eventEmitter && this._domainEvents.length) {
                this._domainEvents.forEach((event) => {
                    this.eventEmitter!.emit(event.name, event);
                });
                this.clearEvents();
            }
        } catch (err) {
            console.error(`[DOMAIN_EVENT]: Publish failed!`, err);
            throw new Error(`[DOMAIN_EVENT]: Publish failed!`);
        }
    }
}
