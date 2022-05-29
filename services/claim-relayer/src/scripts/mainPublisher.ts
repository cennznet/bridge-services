import type { u64 } from "@cennznet/types";
import type { Api } from "@cennznet/api";
import type { BaseProvider } from "@ethersproject/providers";

import * as amqp from "amqplib";
import mongoose from "mongoose";
import { Contract } from "ethers";
import * as ERC20Peg from "@bs-libs/abi/ERC20Peg.json";
import { TOPIC_CENNZnet_CONFIRM } from "@claim-relayer/libs/constants";
import { subscribeFinalizedBlock } from "@claim-relayer/utils/subscribeFinalizedBlock";
import { handleDepositEvent } from "@claim-relayer/utils/handleDepositEvent";
import {
	CENNZNET_NETWORK,
	MONGODB_SERVER,
	NETWORK_DETAILS,
	RABBBITMQ_SERVER,
} from "@bs-libs/constants";
import { getLogger } from "@bs-libs/utils/getLogger";

const logger = getLogger("ClaimPublisher");
const { PEG_CONTRACT_ADDRESS } = NETWORK_DETAILS;

export async function mainPublisher(
	cennzApi: Api,
	ethersProvider: BaseProvider
) {
	//check if db connection already connected for testing
	if (mongoose.connection.readyState !== 1)
		await mongoose.connect(MONGODB_SERVER);

	logger.info(`Connect to cennznet network ${CENNZNET_NETWORK}`);

	const rabbit = await amqp.connect(RABBBITMQ_SERVER);
	const channel = await rabbit.createChannel();

	// Keep track of latest finalized block
	subscribeFinalizedBlock(cennzApi, logger);

	const peg = new Contract(PEG_CONTRACT_ADDRESS, ERC20Peg, ethersProvider);

	logger.info(`Connecting to CENNZnet peg contract ${PEG_CONTRACT_ADDRESS}...`);

	const eventConfirmations = (
		(await cennzApi.query.ethBridge.eventConfirmations()) as u64
	).toNumber();
	await channel.assertQueue(TOPIC_CENNZnet_CONFIRM);

	peg.on(
		"Deposit",
		async (sender, tokenAddress, amount, cennznetAddress, eventInfo) => {
			logger.info(`Got the event...${JSON.stringify(eventInfo)}`);
			logger.info("*****************************************************");
			await handleDepositEvent(
				cennzApi,
				eventInfo.transactionHash,
				cennznetAddress,
				amount,
				tokenAddress,
				eventConfirmations,
				channel
			);
		}
	);
}
