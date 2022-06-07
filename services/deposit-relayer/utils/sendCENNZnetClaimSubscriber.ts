import type { Api } from "@cennznet/api";
import type { BaseProvider } from "@ethersproject/providers";
import type {
	ClaimSubscriberData,
	Nonce,
	VerifyClaimData,
} from "@deposit-relayer/libs/types";
import { sendClaim } from "@deposit-relayer/utils/sendClaim";
import { updateTxStatusInDB } from "@deposit-relayer/utils/updateTxStatusInDB";
import { getLogger } from "@bs-libs/utils/getLogger";

const logger = getLogger("ClaimSubscriber");

interface ClaimSubscriberResponse {
	verifyClaimData: VerifyClaimData;
	nonce: Nonce;
	firstMessage: boolean;
}

/*
 * Wait for tx on ethereum till the confirmed blocks and then submits claim on CENNZnet,
 * wait has a timeout of 10 minutes, after which it will update the status 'EthConfirmationTimeout' for a txHash
 */
export async function sendCENNZnetClaimSubscriber(
	api: Api,
	provider: BaseProvider,
	{ txHash, confirms, claim }: ClaimSubscriberData,
	nonce: Nonce,
	firstMessage: boolean
): Promise<ClaimSubscriberResponse> {
	const timeout = 600000; // 10 minutes
	try {
		//known bug with waitForTransaction on local network
		if (provider.network.chainId === 1337) {
			const tx = await provider.getTransaction(txHash);
			await tx.wait(); // wait for confirm blocks before sending tx on CENNZnet
		} else {
			await provider.waitForTransaction(txHash, confirms + 1, timeout); // wait for confirm blocks before sending tx on CENNZnet
		}

		if (!firstMessage) nonce += 1;
		else firstMessage = false;

		return {
			verifyClaimData: await sendClaim(claim, txHash, api, nonce),
			nonce,
			firstMessage,
		};
	} catch (err: any) {
		logger.error("Error:", err);

		if (err.message == "timeout exceeded")
			await updateTxStatusInDB(
				"EthConfirmationTimeout",
				txHash,
				undefined,
				claim.beneficiary,
				logger
			);

		throw new Error(err.message);
	}
}
