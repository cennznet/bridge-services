import type { u64 } from "@cennznet/types";
import type { Api } from "@cennznet/api";
import type { BaseProvider } from "@ethersproject/providers";

import mongoose from "mongoose";
import { Contract } from "ethers";
import * as ERC20Peg from "@bs-libs/abi/ERC20Peg.json";
import { TOPIC_CENNZnet_CONFIRM } from "@deposit-relayer/libs/constants";
import { subscribeFinalizedBlock } from "@deposit-relayer/utils/subscribeFinalizedBlock";
import { handleDepositEvent } from "@deposit-relayer/utils/handleDepositEvent";
import { MONGODB_SERVER, NETWORK_DETAILS } from "@bs-libs/constants";
import { getLogger } from "@bs-libs/utils/getLogger";
import { getRabbitMQSet } from "@bs-libs/utils/getRabbitMQSet";

const logger = getLogger("ClaimPublisher");
const { PEG_CONTRACT_ADDRESS } = NETWORK_DETAILS;

export async function startClaimPublisher(
	cennzApi: Api,
	ethersProvider: BaseProvider
) {
	//check if db connection already connected for testing
	if (mongoose.connection.readyState !== 1)
		await mongoose.connect(MONGODB_SERVER);

	const [, queue] = await getRabbitMQSet(TOPIC_CENNZnet_CONFIRM);

	// Keep track of latest finalized block
	subscribeFinalizedBlock(cennzApi, logger);

	const peg = new Contract(PEG_CONTRACT_ADDRESS, ERC20Peg, ethersProvider);

	logger.info(`Connecting to CENNZnet peg contract ${PEG_CONTRACT_ADDRESS}...`);

	const eventConfirmations = (
		(await cennzApi.query.ethBridge.eventConfirmations()) as u64
	).toNumber();

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
				queue,
				logger
			);
		}
	);
}
