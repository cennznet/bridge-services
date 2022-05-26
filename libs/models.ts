import { Collections, MONGODB_SERVER } from "@/libs/constants";
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
		_id: { type: Schema.Types.String, required: true, unique: true },
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
		_id: { type: Schema.Types.String, required: true, unique: true },
		tokenAddress: { type: Schema.Types.String, required: true },
		amount: { type: Schema.Types.String, required: true },
		beneficiary: { type: Schema.Types.String, required: true },
		claimId: { type: Schema.Types.String, required: true, unique: true },
		blockNumber: { type: Schema.Types.String, required: true },
	},
	{ collection: Collections["CLAIM_EVENTS"] }
);

export const ClaimEvents: Model<ClaimEventsInterface> = mongoose.model(
	"ClaimEvents",
	ClaimEventsSchema
);

interface EventProcessedInterface {
	_id: string;
	eventId: string; // txHash from ethereum bridge contract - deposit
	blockHash: string;
}

const EventProcessedSchema = new Schema<EventProcessedInterface>(
	{
		_id: { type: Schema.Types.String, required: true, unique: true },
		eventId: { type: Schema.Types.String, required: true },
		blockHash: { type: Schema.Types.String, required: true },
	},
	{ collection: Collections["EVENT_PROCESSED"] }
);

export const EventProcessed: Model<EventProcessedInterface> = mongoose.model(
	"EventProcessed",
	EventProcessedSchema
);

interface Withdrawal {
	proofId: string;
	amount: string;
	assetId: string;
	beneficiary: string;
	txHash: string;
	hasClaimed: boolean;
	expiresAt: number;
}

interface WithdrawProofInterface {
	_id: string;
	withdrawals: Array<Withdrawal>;
}

const WithdrawProofSchema = new Schema<WithdrawProofInterface>(
	{
		_id: { type: Schema.Types.Number, required: true, unique: true }, // cennznetAddress
		withdrawals: [
			{
				proofId: { type: Schema.Types.Number, required: true, unique: true },
				amount: { type: Schema.Types.Number, required: true },
				assetId: { type: Schema.Types.Number, required: true },
				beneficiary: { type: Schema.Types.Number, required: true },
				txHash: { type: Schema.Types.Number, required: true },
				hasClaimed: { type: Schema.Types.Boolean, required: true },
				expiresAt: { type: Schema.Types.Number, required: true },
			},
		],
	},
	{ collection: Collections["WITHDRAW_PROOF"] }
);

export const WithdrawProof: Model<WithdrawProofInterface> = mongoose.model(
	"WithdrawProof",
	WithdrawProofSchema
);

interface EventProofInterface {
	_id: string; // eventProofId
	validatorSetId: string;
	r: Array<string>;
	s: Array<string>;
	v: Array<string>;
	validators: Array<string>;
}

const EventProofSchema = new Schema<EventProofInterface>(
	{
		_id: { type: Schema.Types.String, required: true, unique: true },
		validatorSetId: { type: Schema.Types.String, required: true },
		r: { type: [Schema.Types.String], required: true },
		s: { type: [Schema.Types.String], required: true },
		v: { type: [Schema.Types.String], required: true },
		validators: { type: [Schema.Types.String], required: true },
	},
	{ collection: Collections["EVENT_PROOF"] }
);

export const EventProof: Model<EventProofInterface> = mongoose.model(
	"EventProof",
	EventProofSchema
);
