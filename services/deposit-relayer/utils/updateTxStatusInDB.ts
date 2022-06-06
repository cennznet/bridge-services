import { BridgeClaim } from "@deposit-relayer/libs/models";
import { Logger } from "winston";

export async function updateTxStatusInDB(
	txStatus: string,
	txHash: string,
	claimId: string | null,
	cennznetAddress: string,
	logger: Logger
): Promise<void> {
	const filter = { txHash };
	const update = { txHash, status: txStatus, claimId, cennznetAddress };
	const options = { upsert: true, new: true, setDefaultsOnInsert: true }; // create new if record does not exist, else update
	await BridgeClaim.updateOne(filter, update, options);
	logger.info(
		`CLAIM: Updated the bridge status ${txStatus} for txHash: ${txHash}`
	);
}
