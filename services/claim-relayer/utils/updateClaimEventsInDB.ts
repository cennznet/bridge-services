import { ClaimEvents } from "@/libs/models";
import { getLogger } from "@/libs/utils";
import { ClaimEventsParams } from "@/libs/types";

const logger = getLogger("ClaimPublisher");

export async function updateClaimEventsInDB({
	txHash,
	tokenAddress,
	amount,
	beneficiary,
}: Partial<ClaimEventsParams>): Promise<void> {
	const filter = { _id: txHash };
	const update = { tokenAddress, amount, beneficiary };
	const options = { upsert: true, new: true, setDefaultsOnInsert: true }; // create new if record does not exist, else update

	await ClaimEvents.updateOne(filter, update, options);

	logger.info(
		`CLAIM Updated the claim events data ${tokenAddress}, ${amount}, ${beneficiary} for txHash: ${txHash}`
	);
}
