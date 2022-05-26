import type { NetworkDetails } from "@/libs/types";
import type { CENNZNetNetwork } from "@cennznet/api/types";

require("dotenv").config();

export const MONGODB_SERVER: string =
	process.env.MONGODB_SERVER ?? "mongodb://root:root@localhost:27017/bridgeDb";
export const RABBBITMQ_SERVER: string =
	process.env.RABBBITMQ_SERVER ?? "amqp://guest:guest@localhost:5672";
export const CENNZNET_NETWORK: string = process.env.CENNZNET_NETWORK ?? "local";
export const ETHEREUM_NETWORK: string = process.env.ETHEREUM_NETWORK ?? "kovan";
export const CENNZNET_SIGNER: string = process.env.CENNZNET_SIGNER ?? "";
export const MESSAGE_MAX_RETRY: number = Number(
	process.env.MESSAGE_MAX_RETRY ?? 3
);
export const MESSAGE_MAX_TIME: number = Number(
	process.env.MESSAGE_MAX_TIME ?? 10000
);

export const INFURA_PROJECT = process.env.INFURA_PROJECT_ID
	? {
			projectId: process.env.INFURA_PROJECT_ID,
			projectSecret: process.env.INFURA_PROJECT_SECRET,
	  }
	: null;

export const ALCHEMY_API_TOKEN: string = process.env.ALCHEMY_API_TOKEN ?? "";

export const AIRDROP_AMOUNT: number = 50000;

export const Collections: Record<string, string> = {
	BRIDGE_CLAIM: "claims",
	EVENT_PROCESSED: "events",
	WITHDRAW_PROOF: "withdraw_proof",
	EVENT_PROOF: "event_proof",
	CLAIM_EVENTS: "claim_events",
};

export const SLACK_SECRET: string = process.env.SLACK_SECRET ?? "";

export const MSG_QUEUE_NETWORK: string = process.env.MSG_QUEUE_NETWORK ?? "";

const NETWORKS: Record<CENNZNetNetwork, NetworkDetails> = {
	azalea: {
		PEG_CONTRACT_ADDRESS: "0x76BAc85e1E82cd677faa2b3f00C4a2626C4c6E32",
		SPENDING_ASSET_ID: "2",
	},
	local: {
		PEG_CONTRACT_ADDRESS: "0xa39E871e6e24f2d1Dd6AdA830538aBBE7b30F78F",
		SPENDING_ASSET_ID: "16001",
	},
	nikau: {
		PEG_CONTRACT_ADDRESS: "0xa39E871e6e24f2d1Dd6AdA830538aBBE7b30F78F",
		SPENDING_ASSET_ID: "16001",
	},
	rata: {
		PEG_CONTRACT_ADDRESS: "0x4C411B3Bf36D6DE908C6f4256a72B85E3f2B00bF",
		SPENDING_ASSET_ID: "16001",
	},
};

export const NETWORK_DETAILS: NetworkDetails =
	NETWORKS[CENNZNET_NETWORK as CENNZNetNetwork];

export const TOPIC_CENNZnet_CONFIRM = `STATE_CENNZ_CONFIRM_${MSG_QUEUE_NETWORK}`;
export const TOPIC_VERIFY_CONFIRM = `STATE_VERIFY_CONFIRM_${MSG_QUEUE_NETWORK}`;
