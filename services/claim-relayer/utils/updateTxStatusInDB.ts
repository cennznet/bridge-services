import { BridgeClaim } from "@/libs/models";
import { getLogger } from "@/libs/utils";

const logger = getLogger("ClaimPublisher");

export async function updateTxStatusInDB(
	txStatus: string,
	txHash: string,
	claimId: string | null,
	cennzAddress: string
): Promise<void> {
	const filter = { txHash };
	const update = { txHash, status: txStatus, claimId, cennzAddress };
	const options = { upsert: true, new: true, setDefaultsOnInsert: true }; // create new if record does not exist, else update
	await BridgeClaim.updateOne(filter, update, options);
	logger.info(
		`CLAIM: Updated the bridge status ${txStatus} for txHash: ${txHash}`
	);
}
