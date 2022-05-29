import type { Api } from "@cennznet/api";
import type { BaseProvider } from "@ethersproject/providers";

import mongoose from "mongoose";
import * as amqp from "amqplib";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import {
	RABBITMQ_CONSUMER_MESSAGE_LIMIT,
	RABBITMQ_MESSAGE_TIMEOUT,
	TOPIC_CENNZnet_CONFIRM,
	TOPIC_VERIFY_CONFIRM,
} from "@claim-relayer/libs/constants";
import { subscribeFinalizedBlock } from "@claim-relayer/utils/subscribeFinalizedBlock";
import { sendCENNZnetClaimSubscriber } from "@claim-relayer/utils/sendCENNZnetClaimSubscriber";
import { verifyClaimSubscriber } from "@claim-relayer/utils/verifyClaimSubscriber";
import { retryMessage } from "@claim-relayer/utils/retryMessage";
import { getLogger } from "@bs-libs/utils/getLogger";
import { sendSlackAlert } from "@bs-libs/utils/sendSlackAlert";
import {
	CENNZNET_NETWORK,
	CENNZNET_SIGNER,
	MONGODB_SERVER,
	RABBBITMQ_SERVER,
} from "@bs-libs/constants";

const logger = getLogger("ClaimSubscriber");

let nonce: number;
let firstMessage = true;

export async function mainSubscriber(
	cennzApi: Api,
	ethersProvider: BaseProvider
): Promise<void> {
	if (mongoose.connection.readyState !== 1)
		await mongoose.connect(MONGODB_SERVER);
	const rabbit = await amqp.connect(RABBBITMQ_SERVER);
	logger.info(
		`Rabbit MQ Connected to Host:  ${(rabbit.connection as any).stream._host}`
	);
	logger.info(`Connected to cennznet network ${CENNZNET_NETWORK}`);

	await cryptoWaitReady();
	const signer = new Keyring({ type: "sr25519" }).addFromSeed(
		CENNZNET_SIGNER as any
	);
	nonce = (
		await cennzApi.rpc.system.accountNextIndex(signer.address)
	).toNumber();

	// Keep track of latest finalized block
	subscribeFinalizedBlock(cennzApi, logger);

	//Setup RabbitMQ
	const sendClaimChannel = await rabbit.createChannel();
	await sendClaimChannel.assertQueue(TOPIC_CENNZnet_CONFIRM, {
		durable: true,
		messageTtl: RABBITMQ_MESSAGE_TIMEOUT,
	});
	const verifyClaimChannel = await rabbit.createChannel();
	await verifyClaimChannel.assertQueue(TOPIC_VERIFY_CONFIRM, {
		durable: true,
		messageTtl: RABBITMQ_MESSAGE_TIMEOUT,
	});
	await sendClaimChannel.prefetch(RABBITMQ_CONSUMER_MESSAGE_LIMIT);
	await verifyClaimChannel.prefetch(RABBITMQ_CONSUMER_MESSAGE_LIMIT);
	await sendClaimChannel.consume(TOPIC_CENNZnet_CONFIRM, async (message) => {
		try {
			logger.info(
				`Received Message TOPIC_CENNZnet_CONFIRM: ${message?.content.toString()}`
			);
			const data = JSON.parse(message!.content.toString());
			const claimSubscriberResponse = await sendCENNZnetClaimSubscriber(
				cennzApi,
				ethersProvider,
				data,
				nonce,
				firstMessage
			);

			nonce = claimSubscriberResponse.nonce;
			firstMessage = claimSubscriberResponse.firstMessage;

			sendClaimChannel.ack(message!);
			verifyClaimChannel.sendToQueue(
				TOPIC_VERIFY_CONFIRM,
				Buffer.from(JSON.stringify(claimSubscriberResponse.verifyClaimData))
			);
		} catch (e: any) {
			//if already sent claim don't try to resend
			if (e.message === "AlreadyNotarized") return;
			const data = JSON.parse(message!.content.toString());
			const failedCB = () => {
				sendSlackAlert(
					`🚨 All retries failed for Message TOPIC_CENNZnet_CONFIRM 🚨
                \n ETH Transaction: ${data.txHash} 
                \n Beneficiary: ${data.claim.beneficiary}  
                \n Blocknumber: ${data.blockNumber}
                \n Error: ${e.message} `
				);
			};
			await retryMessage(
				sendClaimChannel,
				TOPIC_CENNZnet_CONFIRM,
				message!,
				failedCB
			);
		}
	});
	await verifyClaimChannel.consume(TOPIC_VERIFY_CONFIRM, async (message) => {
		try {
			logger.info(
				`Received Message TOPIC_VERIFY_CONFIRM: ${message!.content.toString()}`
			);
			const data = JSON.parse(message!.content.toString());
			nonce = await verifyClaimSubscriber(data, cennzApi, nonce);
			verifyClaimChannel.ack(message!);
		} catch (e: any) {
			const data = JSON.parse(message!.content.toString());
			const failedCB = () => {
				sendSlackAlert(
					`🚨 All retries failed for Message TOPIC_VERIFY_CONFIRM 🚨
                \n Event Claim Id: ${data.eventClaimId} 
                \n Blocknumber: ${data.blockNumber}
                \n Error: ${e.message} `
				);
			};
			await retryMessage(
				verifyClaimChannel,
				TOPIC_VERIFY_CONFIRM,
				message!,
				failedCB
			);
		}
	});
}
