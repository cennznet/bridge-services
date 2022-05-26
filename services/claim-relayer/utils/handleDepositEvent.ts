import { TOPIC_CENNZnet_CONFIRM } from "@/libs/constants";
import { getLogger } from "@/libs/utils";
import {
	updateClaimEventsInDB,
	updateTxStatusInDB,
} from "@claim-relayer/utils";
import { Api } from "@cennznet/api";
import { Channel } from "amqplib";

const logger = getLogger("ClaimPublisher");

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
	channel: Channel
) {
	const claim = {
		tokenAddress,
		amount: amount.toString(),
		beneficiary: cennzAddress,
	};

	const data = { txHash, claim, confirms: eventConfirmations };
	channel.sendToQueue(
		TOPIC_CENNZnet_CONFIRM,
		Buffer.from(JSON.stringify(data))
	);

	await updateTxStatusInDB("EthereumConfirming", txHash, null, cennzAddress);
	await updateClaimEventsInDB({
		txHash,
		tokenAddress,
		amount,
		beneficiary: cennzAddress,
	});

	logger.info(`Deposit Event handled for TxHash...${txHash}`);
}
