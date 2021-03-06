import type { Api } from "@cennznet/api";
import type { BaseProvider } from "@ethersproject/providers";

import mongoose from "mongoose";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import {
	RABBITMQ_CONSUMER_MESSAGE_LIMIT,
	RABBITMQ_MESSAGE_TIMEOUT,
	TOPIC_CENNZnet_CONFIRM,
	TOPIC_VERIFY_CONFIRM,
} from "@deposit-relayer/libs/constants";
import { subscribeFinalizedBlock } from "@deposit-relayer/utils/subscribeFinalizedBlock";
import { sendCENNZnetClaimSubscriber } from "@deposit-relayer/utils/sendCENNZnetClaimSubscriber";
import { verifyClaimSubscriber } from "@deposit-relayer/utils/verifyClaimSubscriber";
import { retryMessage } from "@deposit-relayer/utils/retryMessage";
import { getLogger } from "@bs-libs/utils/getLogger";
import { sendSlackAlert } from "@bs-libs/utils/sendSlackAlert";
import { CENNZNET_SIGNER, MONGODB_SERVER } from "@bs-libs/constants";
import { getRabbitMQSet } from "@bs-libs/utils/getRabbitMQSet";
import { hexToU8a } from "@polkadot/util";

const logger = getLogger("ClaimSubscriber");

let nonce: number;
let firstMessage = true;

export async function startClaimSubscriber(
	cennzApi: Api,
	ethersProvider: BaseProvider
): Promise<void> {
	if (mongoose.connection.readyState !== 1)
		await mongoose.connect(MONGODB_SERVER);

	await cryptoWaitReady();
	const signer = new Keyring({ type: "sr25519" }).addFromSeed(
		hexToU8a(CENNZNET_SIGNER)
	);
	nonce = (
		await cennzApi.rpc.system.accountNextIndex(signer.address)
	).toNumber();

	// Keep track of latest finalized block
	subscribeFinalizedBlock(cennzApi, logger);

	//Setup RabbitMQ
	const [sendClaimChannel, sendClaimQueue] = await getRabbitMQSet(
		TOPIC_CENNZnet_CONFIRM
	);
	const [verifyClaimChannel, verifyClaimQueue] = await getRabbitMQSet(
		TOPIC_VERIFY_CONFIRM
	);
	await sendClaimChannel.prefetch(RABBITMQ_CONSUMER_MESSAGE_LIMIT);
	await verifyClaimChannel.prefetch(RABBITMQ_CONSUMER_MESSAGE_LIMIT);

	await sendClaimQueue.subscribe({ noAck: false }, async (message) => {
		try {
			logger.info(
				`Received Message TOPIC_CENNZnet_CONFIRM: ${message.bodyToString()}`
			);
			const data = JSON.parse(message.bodyToString() as string);
			const claimSubscriberResponse = await sendCENNZnetClaimSubscriber(
				cennzApi,
				ethersProvider,
				data,
				nonce,
				firstMessage
			);

			nonce = claimSubscriberResponse.nonce;
			firstMessage = claimSubscriberResponse.firstMessage;

			sendClaimChannel.basicAck(message.deliveryTag);
			verifyClaimQueue.publish(
				JSON.stringify(claimSubscriberResponse.verifyClaimData),
				{ expiration: RABBITMQ_MESSAGE_TIMEOUT }
			);
		} catch (e: any) {
			//if already sent claim don't try to resend
			if (e.message === "AlreadyNotarized") return;
			const data = JSON.parse(message.bodyToString() as string);
			const failedCB = () => {
				sendSlackAlert(
					`???? All retries failed for Message TOPIC_CENNZnet_CONFIRM ????
                \n ETH Transaction: ${data.txHash} 
                \n Beneficiary: ${data.claim.beneficiary}  
                \n Blocknumber: ${data.blockNumber}
                \n Error: ${e.message} `
				);
			};
			await retryMessage(sendClaimChannel, sendClaimQueue, message, failedCB);
		}
	});

	await verifyClaimQueue.subscribe({ noAck: false }, async (message) => {
		try {
			logger.info(
				`Received Message TOPIC_VERIFY_CONFIRM: ${message.bodyToString()}`
			);
			const data = JSON.parse(message.bodyToString() as string);
			nonce = await verifyClaimSubscriber(data, cennzApi, nonce);
			verifyClaimChannel.basicAck(message.deliveryTag);
		} catch (e: any) {
			const data = JSON.parse(message.bodyToString() as string);
			const failedCB = () => {
				sendSlackAlert(
					`???? All retries failed for Message TOPIC_VERIFY_CONFIRM ????
                \n Event Claim Id: ${data.eventClaimId} 
                \n Blocknumber: ${data.blockNumber}
                \n Error: ${e.message} `
				);
			};
			await retryMessage(
				verifyClaimChannel,
				verifyClaimQueue,
				message,
				failedCB
			);
		}
	});
}
