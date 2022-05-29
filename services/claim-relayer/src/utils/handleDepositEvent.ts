import { TOPIC_CENNZnet_CONFIRM } from "@claim-relayer/libs/constants";
import { Api } from "@cennznet/api";
import { Channel } from "amqplib";
import { updateClaimEventsInDB } from "@claim-relayer/utils/updateClaimEventsInDB";
import { updateTxStatusInDB } from "@claim-relayer/utils/updateTxStatusInDB";
import { getLogger } from "@bs-libs/utils/getLogger";

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
