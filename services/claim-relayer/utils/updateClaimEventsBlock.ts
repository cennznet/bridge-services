import { ClaimEvents } from "@/libs/models";
import { getLogger } from "@/libs/utils";
import { ClaimEventsParams } from "@/libs/types";

const logger = getLogger("RequestProcessor");

export async function updateClaimEventsBlock({
	txHash,
	claimId,
	blockNumber,
}: Partial<ClaimEventsParams>) {
	const filter = { _id: txHash };
	const update = { claimId, blockNumber };
	const options = { upsert: true, new: true, setDefaultsOnInsert: true }; // create new if record does not exist, else update
	await ClaimEvents.updateOne(filter, update, options);
	logger.info(
		`CLAIM Updated the claim events - claim id ${claimId} and ${blockNumber} for txHash: ${txHash}`
	);
}
