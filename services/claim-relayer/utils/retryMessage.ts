import type { Channel, ConsumeMessage } from "amqplib";

import { wait } from "@/libs/utils";

export async function retryMessage(
	channel: Channel,
	queueName: any,
	message: ConsumeMessage,
	initialDelay: number,
	maxRetries: number,
	failedCallback: () => void
) {
	try {
		const headers = message.properties.headers || {};
		const retryCount = (headers["x-retries"] || 0) + 1;
		const delayAmountSeconds =
			(Math.pow(2, retryCount - 1) * initialDelay) / 1000;
		if (retryCount > maxRetries) {
			// We're past our retry max count.  Dead-letter it.
			channel.reject(message, false);
			failedCallback();
		} else {
			headers["x-retries"] = retryCount;
			message.properties.headers = headers;
			await wait(delayAmountSeconds);
			channel.sendToQueue(queueName, message.content, message.properties);
			channel.ack(message);
		}
	} catch (e: any) {
		// if error thrown during retry
		channel.nack(message);
		throw new Error(e.message);
	}
}
