import { AMQPChannel, AMQPClient, AMQPQueue } from "@cloudamqp/amqp-client";
import { RABBBITMQ_SERVER } from "@bs-libs/constants";

export async function getRabbitMQSet(
	name: string
): Promise<[AMQPChannel, AMQPQueue]> {
	const client = new AMQPClient(RABBBITMQ_SERVER);
	const connection = await client.connect();

	const channel = await connection.channel();
	const queue = await channel.queue(name, { durable: true });

	return [channel, queue];
}
