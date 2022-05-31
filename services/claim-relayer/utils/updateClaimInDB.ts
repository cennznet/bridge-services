import { BridgeClaim } from "@claim-relayer/libs/models";
import { getLogger } from "@bs-libs/utils/getLogger";

const logger = getLogger("ClaimSubscriber");

export async function updateClaimInDB(
	claimId: string,
	status: string
): Promise<void> {
	const filter = { claimId: claimId };
	const update = { status: status };
	const options = { upsert: true, new: true, setDefaultsOnInsert: true }; // create new if record does not exist, else update

	await BridgeClaim.updateOne(filter, update, options);

	logger.info(
		`CLAIM Updated the bridge status ${status} for claimId: ${claimId}`
	);
}
