import { waitFor } from "@bs-libs/utils/waitFor";
import {
	RABBITMQ_INITIAL_DELAY,
	RABBITMQ_MAX_RETRIES,
} from "@deposit-relayer/libs/constants";
import { AMQPChannel, AMQPMessage, AMQPQueue } from "@cloudamqp/amqp-client";

export async function retryMessage(
	channel: AMQPChannel,
	queue: AMQPQueue,
	message: AMQPMessage,
	failedCallback: () => void
) {
	try {
		const headers = message.properties.headers || {};
		const retryCount = (Number(headers["x-retries"]) || 0) + 1;
		const delayAmountSeconds =
			(Math.pow(2, retryCount - 1) * RABBITMQ_INITIAL_DELAY) / 1000;
		if (retryCount > RABBITMQ_MAX_RETRIES) {
			// We're past our retry max count.  Dead-letter it.
			channel.basicReject(message.deliveryTag, false);
			failedCallback();
		} else {
			headers["x-retries"] = retryCount;
			message.properties.headers = headers;
			await waitFor(delayAmountSeconds);
			queue.publish(message.bodyToString() as string, message.properties);
			channel.basicAck(message.deliveryTag);
		}
	} catch (e: any) {
		// if error thrown during retry
		channel.basicNack(message.deliveryTag);
		throw new Error(e.message);
	}
}
