export const NatsConfig = {
    host: process.env.NATS_MESSAGING_HOST || 'nats://nats',
    port: process.env.NATS_MESSAGING_PORT || '4222',
    queue: {
        name: process.env.NATS_MESSAGING_QUEUE_NAME || 'DEFAULT_QUEUE_NAME',
    },
    jetStream: {
        name: process.env.NATS_JET_STREAM_NAME || 'DEFAULT_STREAM_NAME',
        subjects: process.env.NATS_JET_STREAM_SUBJECTS || 'DEFAULT.*',
        retention: process.env.NATS_JET_STREAM_RETENTION || 'workqueue',
    },
};
