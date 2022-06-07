import {
	BridgeClaim,
	BridgeClaimInterface,
} from "@deposit-relayer/libs/models";

type BridgeClaimFilterType = "TxHash" | "ClaimId";

export function createBridgeClaimUpdater(
	filterType: BridgeClaimFilterType,
	filter: string
): (data: Partial<BridgeClaimInterface>) => Promise<any> {
	return async (data: Partial<BridgeClaimInterface>) =>
		BridgeClaim.findOneAndUpdate(
			{ filter },
			{
				...data,
				claimId: filterType === "ClaimId" && filter,
				txHash: filterType === "TxHash" && filter,
				updatedAt: new Date(),
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
}
