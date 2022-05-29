export const MESSAGE_MAX_RETRY = Number(process.env.MESSAGE_MAX_RETRY ?? 3);
export const MESSAGE_MAX_TIME = Number(process.env.MESSAGE_MAX_TIME ?? 10000);

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
