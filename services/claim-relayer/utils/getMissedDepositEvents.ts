import { BridgeClaim } from "@claim-relayer/libs/models";
import { getLogger } from "@bs-libs/utils/getLogger";
import { Event } from "ethers";

const logger = getLogger("EthDepositPoller");

export async function getMissedDepositEvents(
	allEvents: Event[]
): Promise<string[]> {
	const depositEventTxHashes = allEvents
		.filter((event) => event.event === "Deposit")
		.map((event) => event.transactionHash);

	//check if any deposit tx hashes are not in DB yet
	const allDepositClaims = await BridgeClaim.find({});
	const allDepositClaimsTxHashes = allDepositClaims.map(
		(claim) => claim.txHash
	);

	const missedDepositEventHashes = depositEventTxHashes.filter(
		(txHash) => !allDepositClaimsTxHashes.includes(txHash)
	);

	logger.info(
		`Current Missed Deposit Events Number: ${missedDepositEventHashes?.length}`
	);

	return missedDepositEventHashes;
}
