import type { Balance } from "@cennznet/types";
import type { Nonce } from "@/libs/types";

import {
	AIRDROP_AMOUNT,
	CENNZNET_NETWORK,
	CENNZNET_SIGNER,
	NETWORK_DETAILS,
} from "@/libs/constants";
import { BridgeClaim } from "@/libs/models";
import { Api } from "@cennznet/api";
import { getLogger, sendSlackAlert } from "@/libs/utils";
import { Keyring } from "@polkadot/keyring";

const { SPENDING_ASSET_ID } = NETWORK_DETAILS;
const logger = getLogger("RequestProcessor");

export async function airDrop(
	claimId: number,
	api: Api,
	nonce: Nonce
): Promise<Nonce> {
	const signer = new Keyring({ type: "sr25519" }).addFromSeed(
		CENNZNET_SIGNER as any
	);

	const signerBalance = (await api.query.genericAsset.freeBalance(
		SPENDING_ASSET_ID,
		signer.address
	)) as Balance;

	if (signerBalance.toNumber() < AIRDROP_AMOUNT) {
		await sendSlackAlert(
			`🚨 To keep the claim relayer airdrop running, topup the CENNZnet account ${signer.address} on ${CENNZNET_NETWORK}`
		);

		return nonce;
	}

	const { cennzAddress } = (await BridgeClaim.findOne({ claimId })) as {
		cennzAddress: string;
	};
	const checkRecordWithAddress = await BridgeClaim.find({
		cennzAddress,
		status: "Successful",
	});

	if (!checkRecordWithAddress?.length) return nonce;

	logger.info(`CLAIM Air drop in progress for address ${cennzAddress}`);
	nonce += 1;
	await api.tx.genericAsset
		.transfer(SPENDING_ASSET_ID, cennzAddress, AIRDROP_AMOUNT)
		.signAndSend(signer, { nonce }, async ({ status, events }) => {
			if (status.isInBlock) {
				for (const {
					event: { method, section },
				} of events) {
					if (section === "system" && method === "ExtrinsicSuccess") {
						logger.info(
							`Successfully Air dropped First Time reward for address ${cennzAddress}`
						);
					}
				}
			}
		});

	return nonce;
}
