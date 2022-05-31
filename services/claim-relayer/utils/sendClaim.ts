import type { Claim, Nonce, VerifyClaimData } from "@claim-relayer/libs/types";

import BN from "bn.js";
import { encodeAddress, Keyring } from "@polkadot/keyring";
import { Api, SubmittableResult } from "@cennznet/api";
import { updateTxStatusInDB } from "@claim-relayer/utils/updateTxStatusInDB";
import { updateClaimEventsBlock } from "@claim-relayer/utils/updateClaimEventsBlock";
import { CENNZNET_SIGNER } from "@bs-libs/constants";
import { getLogger } from "@bs-libs/utils/getLogger";

const logger = getLogger("ClaimPublisher");

interface RawData {
	module: {
		index: string;
		error: string;
	};
}

export async function sendClaim(
	claim: Claim,
	txHash: string,
	api: Api,
	nonce: Nonce
): Promise<VerifyClaimData> {
	const signer = new Keyring({ type: "sr25519" }).addFromSeed(
		CENNZNET_SIGNER as any
	);

	return new Promise((resolve, reject) => {
		api.tx.erc20Peg
			.depositClaim(txHash, claim)
			.signAndSend(
				signer,
				{ nonce },
				async ({ status, events }: SubmittableResult) => {
					if (status.isInBlock) {
						const blockHash = status.asInBlock;
						const block = await api.rpc.chain.getBlock(blockHash);
						const blockNumber = block.block.header.number.toNumber();
						for (const {
							event: { method, section, data },
						} of events) {
							const [, address] = data;
							if (
								section === "erc20Peg" &&
								method == "Erc20Claim" &&
								address &&
								(address.toString() === signer.address ||
									address.toString() === encodeAddress(claim.beneficiary))
							) {
								const eventClaimId = data[0].toString();
								logger.info(
									"CLAIM: *******************************************"
								);
								logger.info("CLAIM: at block number: ", blockNumber);
								logger.info(
									"CLAIM: Deposit claim on CENNZnet side started for claim Id: ",
									eventClaimId
								);
								await updateTxStatusInDB(
									"CENNZnetConfirming",
									txHash,
									eventClaimId,
									claim.beneficiary,
									logger
								);
								await updateClaimEventsBlock({
									txHash: txHash,
									claimId: eventClaimId,
									blockNumber,
								});
								const verifyClaimData = { eventClaimId, blockNumber };
								resolve(verifyClaimData);
							} else if (section === "system" && method === "ExtrinsicFailed") {
								//check if already sent claim and if so skip to claim verification step
								const {
									module: { index: rawIndex, error: rawError },
								} = (data!.toJSON() as unknown as Array<RawData>)[0];

								const index = new BN(rawIndex);
								const error = new BN(rawError);
								//AlreadyNotarized error. findMetaError is getting out of index atm: `const errorMsg = api.registry.findMetaError({index, error});`
								// const errorMsg = api.registry.findMetaError(new Uint8Array([index.toNumber(), error.toNumber()]),);
								if (index.toNumber() === 22 && error.toNumber() === 6) {
									//TODO need to find way of getting claimId from ETH tx hash to find if already verified
									await updateTxStatusInDB(
										"AlreadyNotarized",
										txHash,
										null,
										claim.beneficiary,
										logger
									);
									reject(new Error("AlreadyNotarized"));
								}
								await updateTxStatusInDB(
									"Failed",
									txHash,
									null,
									claim.beneficiary,
									logger
								);
								reject(new Error("ExtrinsicFailed"));
							}
						}
					}
				}
			);
	});
}
