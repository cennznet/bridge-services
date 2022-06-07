import { Logger } from "winston";
import { createBridgeClaimUpdater } from "@deposit-relayer/utils/createBridgeClaimUpdater";

export async function updateTxStatusInDB(
	txStatus: string,
	txHash: string,
	claimId: string | undefined,
	cennznetAddress: string,
	logger: Logger
): Promise<void> {
	const updateBridgeClaimRecord = createBridgeClaimUpdater(
			"TxHash", txHash
		) as ReturnType<typeof createBridgeClaimUpdater>;

	updateBridgeClaimRecord({status: txStatus, claimId, cennznetAddress})
	logger.info(
		`CLAIM: Updated the bridge status ${txStatus} for txHash: ${txHash}`
	);
}
