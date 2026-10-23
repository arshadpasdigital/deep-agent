import amqplib, { type Channel, type ChannelModel, type Options } from "amqplib";
import { ExponentialBackoff, handleAll, retry } from "cockatiel";
import { env } from "./config.js";

const EXCHANGE_NAME = "auth.events";
const QUEUE_NAME = "auth.events.queue";
const ROUTING_KEY = "auth.#";

const connectionPolicy = retry(handleAll, {
  maxAttempts: 5,
  backoff: new ExponentialBackoff({ initialDelay: 250, maxDelay: 5_000 }),
});

class RabbitMQ {
  private static instance: RabbitMQ | undefined;

  private connection: ChannelModel | undefined;
  private channel: Channel | undefined;
  private connectionPromise: Promise<Channel> | undefined;
  private readonly consumerChannels = new Set<Channel>();

  private constructor() {}

  static getInstance(): RabbitMQ {
    RabbitMQ.instance ??= new RabbitMQ();
    return RabbitMQ.instance;
  }

  async connected(): Promise<Channel> {
    if (this.channel) {
      return this.channel;
    }

    this.connectionPromise ??= connectionPolicy.execute(async () => {
      const connection = await amqplib.connect(env.RABBITMQ_URL);
      try {
        const channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

        this.connection = connection;
        this.channel = channel;
        connection.on("close", () => this.reset());
        channel.on("close", () => this.channel = undefined);
        return channel;
      } catch (error) {
        await connection.close().catch(() => undefined);
        throw error;
      }
    }).finally(() => {
      this.connectionPromise = undefined;
    });

    return this.connectionPromise;
  }

  async publish(
    routingKey: string,
    message: unknown,
    options: Options.Publish = {},
  ): Promise<boolean> {
    const channel = await this.connected();
    const body = JSON.stringify(message);
    if (body === undefined) {
      throw new TypeError("RabbitMQ messages must be JSON serializable");
    }

    return channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(body), {
      persistent: true,
      contentType: "application/json",
      ...options,
    });
  }

  async consume<T = unknown>(
    handler: (message: T) => Promise<void> | void,
    options: { queue?: string; prefetch?: number } = {},
  ): Promise<string> {
    await this.connected();
    const connection = this.connection;
    if (!connection) {
      throw new Error("RabbitMQ connection closed before consumer setup");
    }

    const queue = options.queue ?? QUEUE_NAME;
    const consumerChannel = await connection.createChannel();
    this.consumerChannels.add(consumerChannel);

    try {
      await consumerChannel.assertQueue(queue, { durable: true });
      await consumerChannel.prefetch(options.prefetch ?? 1);
      const result = await consumerChannel.consume(queue, (message) => {
        if (!message) return;

        void (async () => {
          try {
            const payload = JSON.parse(message.content.toString()) as T;
            await handler(payload);
            consumerChannel.ack(message);
          } catch (error) {
            console.error(`RabbitMQ consumer failed for queue "${queue}"`, error);
            consumerChannel.nack(message, false, false);
          }
        })();
      });

      consumerChannel.on("close", () => this.consumerChannels.delete(consumerChannel));
      return result.consumerTag;
    } catch (error) {
      this.consumerChannels.delete(consumerChannel);
      await consumerChannel.close().catch(() => undefined);
      throw error;
    }
  }

  async closeConnection(): Promise<void> {
    const channel = this.channel;
    const connection = this.connection;
    const consumerChannels = [...this.consumerChannels];
    this.reset();

    await Promise.all(consumerChannels.map((consumerChannel) =>
      consumerChannel.close().catch(() => undefined),
    ));
    await channel?.close().catch(() => undefined);
    await connection?.close().catch(() => undefined);
  }

  private reset(): void {
    this.channel = undefined;
    this.connection = undefined;
  }
}

export const rabbitMQ = RabbitMQ.getInstance();
