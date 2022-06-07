import { BridgeClaim, BridgeClaimInterface } from "@deposit-relayer/libs/models";

export function createBridgeClaimUpdater(
	txHash: string
): (data: Partial<BridgeClaimInterface>) => Promise<any> {
	return async (data: Partial<BridgeClaimInterface>) =>
		BridgeClaim.findOneAndUpdate(
			{ txHash },
			{ ...data, txHash, updatedAt: new Date() },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
}