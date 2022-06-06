import { Api } from "@cennznet/api";
import { updateClaimEventsInDB } from "@deposit-relayer/utils/updateClaimEventsInDB";
import { updateTxStatusInDB } from "@deposit-relayer/utils/updateTxStatusInDB";
import { AMQPQueue } from "@cloudamqp/amqp-client";
import { Logger } from "winston";
import { RABBITMQ_MESSAGE_TIMEOUT } from "@deposit-relayer/libs/constants";

/*
 * On eth side deposit push pub sub queue with the data,
 * if bridge is paused, update tx status as bridge paused
 */
export async function handleDepositEvent(
	api: Api,
	txHash: string,
	cennzAddress: string,
	amount: string,
	tokenAddress: string,
	eventConfirmations: number,
	queue: AMQPQueue,
	logger: Logger
) {
	const claim = {
		tokenAddress,
		amount: amount.toString(),
		beneficiary: cennzAddress,
	};

	const data = { txHash, claim, confirms: eventConfirmations };
	await queue.publish(JSON.stringify(data), {
		expiration: RABBITMQ_MESSAGE_TIMEOUT,
	});

	await updateTxStatusInDB(
		"EthereumConfirming",
		txHash,
		null,
		cennzAddress,
		logger
	);
	await updateClaimEventsInDB({
		txHash,
		tokenAddress,
		amount,
		beneficiary: cennzAddress,
	});

	logger.info(`Deposit Event handled for TxHash...${txHash}`);
}
