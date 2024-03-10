export type DomainEvent<T> = {
    name: string;
    aggregateId: string | number;
    metadata?: {
        props: T;
        externalProps?: Record<string, any>;
    };
    createdAt: Date;
};

export interface IDomainEventHandler<T> {
    emit: (name: string, payload?: DomainEvent<T>) => void;
}
