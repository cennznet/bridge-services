import type { BaseProvider } from "@ethersproject/providers";
import type { Api } from "@cennznet/api";
import mongoose from "mongoose";
import { MONGODB_SERVER, NETWORK_DETAILS } from "@bs-libs/constants";
import { getLogger } from "@bs-libs/utils/getLogger";
import {
	ETH_DEPOST_POLLER_INTERVAL,
	TOPIC_CENNZnet_CONFIRM,
} from "@claim-relayer/libs/constants";
import { getRabbitMQSet } from "@bs-libs/utils/getRabbitMQSet";
import * as ERC20Peg from "@bs-libs/abi/ERC20Peg.json";
import { ethers, Event } from "ethers";
import { handleDepositEvent } from "@claim-relayer/utils/handleDepositEvent";
import { BridgeClaim } from "@claim-relayer/libs/models";
import { u64 } from "@cennznet/types";
import { waitFor } from "@bs-libs/utils/waitFor";

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
		const depositEventTxHashes = allEvents
			.filter((event) => event.event === "Deposit")
			.map((event) => event.transactionHash);
		//check if any deposit tx hashes are not in DB yet
		const allDepositClaims = await BridgeClaim.find({});
		const allDepositClaimsTxHashes = allDepositClaims.map(
			(claim) => claim.txHash
		);
		const missedDepositEventHashes = depositEventTxHashes.filter(
			(txHash) => !allDepositClaimsTxHashes.includes(txHash)
		);
		logger.info(
			`Current Missed Deposit Events Number: ${missedDepositEventHashes?.length}`
		);
		//get the event for each and submit
		const eventConfirmations = (
			(await cennzApi.query.ethBridge.eventConfirmations()) as u64
		).toNumber();
		const missedEventProms = missedDepositEventHashes.map(async (txHash) => {
			const eventInfo = allEvents.find(
				(event) => txHash === event.transactionHash
			) as Event;

			const cennznetAddress = (eventInfo as any).args[3];
			const amount = (eventInfo as any).args[2].toString();
			const tokenAddress = (eventInfo as any).args[1];
			await handleDepositEvent(
				cennzApi,
				eventInfo.transactionHash,
				cennznetAddress,
				amount,
				tokenAddress,
				eventConfirmations,
				queue,
				logger
			);
		});
		await Promise.all(missedEventProms);
		await waitFor(ETH_DEPOST_POLLER_INTERVAL);
	}
}
