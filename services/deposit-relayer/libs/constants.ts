export const AIRDROP_AMOUNT = 50000;

export const Collections: Record<string, string> = {
	BRIDGE_CLAIM: "claims",
	EVENT_PROCESSED: "events",
	WITHDRAW_PROOF: "withdraw_proof",
	EVENT_PROOF: "event_proof",
	CLAIM_EVENTS: "claim_events",
};

export const MSG_QUEUE_NETWORK: string = process.env.MSG_QUEUE_NETWORK ?? "";

export const TOPIC_CENNZnet_CONFIRM = `STATE_CENNZ_CONFIRM_${MSG_QUEUE_NETWORK}`;
export const TOPIC_VERIFY_CONFIRM = `STATE_VERIFY_CONFIRM_${MSG_QUEUE_NETWORK}`;

export const RABBITMQ_CONSUMER_MESSAGE_LIMIT =
	Number(process.env.RABBITMQ_CONSUMER_MESSAGE_LIMIT) ?? 10;
export const RABBITMQ_MESSAGE_TIMEOUT =
	process.env.RABBITMQ_MESSAGE_TIMEOUT ?? String(60000 * 5); //5 minutes;
export const RABBITMQ_MAX_RETRIES =
	Number(process.env.RABBITMQ_MAX_RETRIES) ?? 3;
export const RABBITMQ_INITIAL_DELAY =
	Number(process.env.RABBITMQ_INITIAL_DELAY) ?? 5000;

export const ETH_POLLER_INTERVAL =
	Number(process.env.ETH_POLLER_INTERVAL) ?? 10;
