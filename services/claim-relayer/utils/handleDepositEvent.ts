import { Api } from "@cennznet/api";
import { updateClaimEventsInDB } from "@claim-relayer/utils/updateClaimEventsInDB";
import { updateTxStatusInDB } from "@claim-relayer/utils/updateTxStatusInDB";
import { getLogger } from "@bs-libs/utils/getLogger";
import { AMQPQueue } from "@cloudamqp/amqp-client";

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
	queue: AMQPQueue
) {
	const claim = {
		tokenAddress,
		amount: amount.toString(),
		beneficiary: cennzAddress,
	};

	const data = { txHash, claim, confirms: eventConfirmations };
	await queue.publish(JSON.stringify(data));

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
