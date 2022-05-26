import type { BridgeClaimData, Nonce } from "@/libs/types";

import { Keyring } from "@polkadot/keyring";
import { CENNZNET_SIGNER } from "@/libs/constants";
import { Api } from "@cennznet/api";
import { getLogger, wait } from "@/libs/utils";
import { airDrop, updateClaimInDB } from "@claim-relayer/utils";

const logger = getLogger("RequestProcessor");

interface Event {
	section: string;
	method: string;
	data: any[];
}

type Events = Array<{
	event: Event;
}>;

/*
 * This is subscribed after the claim is sent on CENNZnet, it knows the blocknumber at which claim was sent
 * and it waits for 5 more finalized blocks and check if the claim was verified in these 5 blocks and updates the db
 */
export async function verifyClaimSubscriber(
	data: BridgeClaimData,
	api: Api,
	nonce: Nonce
): Promise<Nonce> {
	const { eventClaimId, blockNumber } = data;
	const blockIntervalSecond = 5;
	const blockNumWait = 5;
	await wait(blockNumWait * blockIntervalSecond);

	let newNonce = nonce;

	try {
		//loop through next 5 blocks to see if the claim is verified
		for (let i = blockNumber; i < blockNumber + blockNumWait; i++) {
			const blockHash = await api.rpc.chain.getBlockHash(i);
			const events = (await api.query.system.events.at(blockHash)) as Events;
			events.map(async ({ event }) => {
				const { section, method, data } = event;
				if (section === "ethBridge" && method === "Verified") {
					const claimId = data[0];
					if (eventClaimId.toString() === claimId.toString()) {
						logger.info(`CLAIM: ${claimId} verified successfully`);
						await updateClaimInDB(claimId, "Successful");
						newNonce = await airDrop(claimId, api, nonce);
					}
				} else if (section === "ethBridge" && method === "Invalid") {
					const claimId = data[0];
					if (eventClaimId.toString() === claimId.toString()) {
						logger.info(`CLAIM: ${claimId} verification failed`);
						await updateClaimInDB(claimId, "Failed");
					}
				}
			});
		}
		return nonce;
	} catch (e: any) {
		logger.error(`Error: ${e}`);
		throw new Error(e.message);
	}
}
