export type FirstMessage = boolean;
export type Nonce = number;

export interface ClaimEventsParams {
	txHash: string;
	claimId: string;
	blockNumber: number;
	tokenAddress: string;
	amount: string;
	beneficiary: string;
}

export interface Claim {
	beneficiary: string;
}

export interface ClaimSubscriberData {
	txHash: string;
	confirms: number;
	claim: Claim;
}

export interface BridgeClaimData {
	eventClaimId: string;
	blockNumber: number;
}

export interface NetworkDetails {
	PEG_CONTRACT_ADDRESS: string;
	SPENDING_ASSET_ID: string;
}

export interface VerifyClaimData {
	eventClaimId: string;
	blockNumber: number;
}
