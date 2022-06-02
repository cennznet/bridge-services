import { Collections } from "@claim-relayer/libs/constants";
import { MONGODB_SERVER } from "@bs-libs/constants";
import mongoose, { Schema, Model } from "mongoose";

void mongoose.connect(MONGODB_SERVER);

export interface BridgeClaimInterface {
	_id: string;
	txHash: string; // txHash from ethereum bridge contract - deposit
	status: string;
	claimId: string;
	cennznetAddress: string;
}

const BridgeClaimSchema = new Schema<BridgeClaimInterface>(
	{
		_id: { type: Schema.Types.String, required: true },
		txHash: { type: Schema.Types.String, required: true },
		status: { type: Schema.Types.String, required: true },
		claimId: { type: Schema.Types.String, required: true },
		cennznetAddress: { type: Schema.Types.String, required: true },
	},
	{ collection: Collections["BRIDGE_CLAIM"] }
);

export const BridgeClaim: Model<BridgeClaimInterface> = mongoose.model(
	"BridgeClaim",
	BridgeClaimSchema
);

export interface ClaimEventsInterface {
	_id: string; // tx hash (Ethereum)
	tokenAddress: string;
	amount: string;
	beneficiary: string;
	claimId: string;
	blockNumber: string; // block number on cennznet when this claim was sent
}

const ClaimEventsSchema = new Schema<ClaimEventsInterface>(
	{
		_id: { type: Schema.Types.String, required: true },
		tokenAddress: { type: Schema.Types.String, required: true },
		amount: { type: Schema.Types.String, required: true },
		beneficiary: { type: Schema.Types.String, required: true },
		claimId: { type: Schema.Types.String, required: true },
		blockNumber: { type: Schema.Types.String, required: true },
	},
	{ collection: Collections["CLAIM_EVENTS"] }
);

export const ClaimEvents: Model<ClaimEventsInterface> = mongoose.model(
	"ClaimEvents",
	ClaimEventsSchema
);
