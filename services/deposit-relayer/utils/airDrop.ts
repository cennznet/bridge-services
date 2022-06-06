import type { Balance } from "@cennznet/types";
import type { Nonce } from "@deposit-relayer/libs/types";

import { AIRDROP_AMOUNT } from "@deposit-relayer/libs/constants";
import { Api } from "@cennznet/api";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { BridgeClaim } from "@deposit-relayer/libs/models";
import {
	CENNZNET_NETWORK,
	CENNZNET_SIGNER,
	NETWORK_DETAILS,
} from "@bs-libs/constants";
import { getLogger } from "@bs-libs/utils/getLogger";
import { sendSlackAlert } from "@bs-libs/utils/sendSlackAlert";
import { hexToU8a } from "@polkadot/util";

const { SPENDING_ASSET_ID } = NETWORK_DETAILS;
const logger = getLogger("ClaimPublisher");

export async function airDrop(
	claimId: number,
	api: Api,
	nonce: Nonce
): Promise<Nonce> {
	await cryptoWaitReady();
	const signer = new Keyring({ type: "sr25519" }).addFromSeed(
		hexToU8a(CENNZNET_SIGNER)
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
