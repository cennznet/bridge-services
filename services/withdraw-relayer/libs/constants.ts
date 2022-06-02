export const Collections: Record<string, string> = {
	EVENT_PROCESSED: "events",
	WITHDRAW_PROOF: "withdraw_proof",
	EVENT_PROOF: "event_proof",
};

export const ETH_ACCOUNT_KEY = process.env.ETH_ACCOUNT_KEY ?? "";

export const ETH_POLLER_INTERVAL =
	Number(process.env.ETH_POLLER_INTERVAL) ?? 10;
