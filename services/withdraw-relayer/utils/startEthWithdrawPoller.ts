import { MONGODB_SERVER, NETWORK_DETAILS } from "@bs-libs/constants";
import * as mongoose from "mongoose";
import { Api } from "@cennznet/api";
import { ethers, Event } from "ethers";
import type { BaseProvider } from "@ethersproject/providers";
import * as ERC20Peg from "@bs-libs/abi/ERC20Peg.json";
import * as CENNZnetBridge from "@bs-libs/abi/CENNZnetBridge.json";
import {
	ETH_ACCOUNT_KEY,
	ETH_POLLER_INTERVAL,
} from "@withdraw-relayer/libs/constants";
import { getLogger } from "@bs-libs/utils/getLogger";
import { WithdrawProof } from "@withdraw-relayer/libs/models";
import { waitFor } from "@bs-libs/utils/waitFor";
import { handleMissedEvents } from "@withdraw-relayer/utils/handleMissedEvents";
import { fetchMissedEvents } from "@withdraw-relayer/utils/fetchMissedEvents";
import { fetchWithdrawalEvents } from "@withdraw-relayer/utils/fetchWithdrawalEvents";
import { getMissedEventProofIds } from "@withdraw-relayer/utils/getMissedEventProofIds";

const { BRIDGE_CONTRACT_ADDRESS, PEG_CONTRACT_ADDRESS } = NETWORK_DETAILS;

const logger = getLogger("EthWithdrawPoller");

export async function startEthWithdrawPoller(
	cennzApi: Api,
	ethersProvider: BaseProvider
) {
	//check if db connection already connected for testing
	if (mongoose.connection.readyState !== 1)
		await mongoose.connect(MONGODB_SERVER);

	const wallet = new ethers.Wallet(ETH_ACCOUNT_KEY, ethersProvider);
	const peg = new ethers.Contract(
		PEG_CONTRACT_ADDRESS,
		ERC20Peg,
		ethersProvider
	);
	const bridge = new ethers.Contract(
		BRIDGE_CONTRACT_ADDRESS,
		CENNZnetBridge,
		wallet
	);

	const shouldPoll = true;
	while (shouldPoll) {
		//stop poller if DB disconnects
		if (mongoose.connection.readyState === 0) {
			logger.error("Mongo DB disconnected Poller stopping...");
			break;
		}

		//check if any withdrawals that haven't been claimed yet
		const unclaimedWithdrawals = await WithdrawProof.find({
			withdrawals: { $elemMatch: { hasClaimed: false } },
		});

		if (unclaimedWithdrawals.length > 0) {
			const pegInterface = new ethers.utils.Interface(ERC20Peg);
			const allWithdrawalEvents = await fetchWithdrawalEvents(peg);
			const missedEventProofIds = getMissedEventProofIds(unclaimedWithdrawals);

			const missedEvents = (
				await fetchMissedEvents(
					allWithdrawalEvents,
					ethersProvider,
					pegInterface,
					missedEventProofIds
				)
			).filter((item) => item);

			await handleMissedEvents(
				missedEvents as Event[],
				ethersProvider,
				pegInterface,
				bridge
			);
		}
		await waitFor(ETH_POLLER_INTERVAL);
	}
}
