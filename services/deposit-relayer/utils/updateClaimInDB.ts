import { getLogger } from "@bs-libs/utils/getLogger";
import { createBridgeClaimUpdater } from "@deposit-relayer/utils/createBridgeClaimUpdater";

const logger = getLogger("ClaimSubscriber");

export async function updateClaimInDB(
	claimId: string,
	status: string
): Promise<void> {
	const updateBridgeClaimRecord = createBridgeClaimUpdater(
		"ClaimId",
		claimId
	) as ReturnType<typeof createBridgeClaimUpdater>;

	updateBridgeClaimRecord({ status });
	logger.info(
		`CLAIM Updated the bridge status ${status} for claimId: ${claimId}`
	);
}
