import type { Channel, ConsumeMessage } from "amqplib";

import { waitFor } from "@bs-libs/utils/waitFor";
import {
	RABBITMQ_INITIAL_DELAY,
	RABBITMQ_MAX_RETRIES,
} from "@claim-relayer/libs/constants";

export async function retryMessage(
	channel: Channel,
	queueName: any,
	message: ConsumeMessage,
	failedCallback: () => void
) {
	try {
		const headers = message.properties.headers || {};
		const retryCount = (headers["x-retries"] || 0) + 1;
		const delayAmountSeconds =
			(Math.pow(2, retryCount - 1) * RABBITMQ_INITIAL_DELAY) / 1000;
		if (retryCount > RABBITMQ_MAX_RETRIES) {
			// We're past our retry max count.  Dead-letter it.
			channel.reject(message, false);
			failedCallback();
		} else {
			headers["x-retries"] = retryCount;
			message.properties.headers = headers;
			await waitFor(delayAmountSeconds);
			channel.sendToQueue(queueName, message.content, message.properties);
			channel.ack(message);
		}
	} catch (e: any) {
		// if error thrown during retry
		channel.nack(message);
		throw new Error(e.message);
	}
}
