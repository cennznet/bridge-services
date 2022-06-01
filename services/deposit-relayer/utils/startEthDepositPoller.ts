import type { BaseProvider } from "@ethersproject/providers";
import type { Api } from "@cennznet/api";
import mongoose from "mongoose";
import { MONGODB_SERVER, NETWORK_DETAILS } from "@bs-libs/constants";
import { getLogger } from "@bs-libs/utils/getLogger";
import {
	ETH_POLLER_INTERVAL,
	TOPIC_CENNZnet_CONFIRM,
} from "@deposit-relayer/libs/constants";
import { getRabbitMQSet } from "@bs-libs/utils/getRabbitMQSet";
import * as ERC20Peg from "@bs-libs/abi/ERC20Peg.json";
import { ethers } from "ethers";
import { waitFor } from "@bs-libs/utils/waitFor";
import { handleMissedEvents } from "@deposit-relayer/utils/handleMissedEvents";
import { getMissedEvents } from "@deposit-relayer/utils/getMissedEvents";
import { fetchBridgeEventConfirmations } from "@deposit-relayer/utils/fetchBridgeEventConfirmations";

const { PEG_CONTRACT_ADDRESS } = NETWORK_DETAILS;

const logger = getLogger("EthDepositPoller");

export async function startEthDepositPoller(
	cennzApi: Api,
	ethersProvider: BaseProvider
) {
	if (mongoose.connection.readyState !== 1)
		await mongoose.connect(MONGODB_SERVER);

	const [, queue] = await getRabbitMQSet(TOPIC_CENNZnet_CONFIRM);

	const peg = new ethers.Contract(
		PEG_CONTRACT_ADDRESS,
		ERC20Peg,
		ethersProvider
	);

	const shouldPoll = true;
	while (shouldPoll) {
		//stop poller if DB disconnects
		if (mongoose.connection.readyState === 0) {
			logger.error("Mongo DB disconnected Poller stopping...");
			break;
		}

		const allEvents = await peg.queryFilter({});

		const missedDepositEventHashes = await getMissedEvents(allEvents);
		const eventConfirmations = await fetchBridgeEventConfirmations(cennzApi);

		await handleMissedEvents(
			cennzApi,
			queue,
			allEvents,
			missedDepositEventHashes,
			eventConfirmations
		);
		await waitFor(ETH_POLLER_INTERVAL);
	}
}
