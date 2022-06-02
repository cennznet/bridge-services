import mongoose, { Model, Schema } from "mongoose";
import { Collections } from "@withdraw-relayer/libs/constants";

interface EventProcessedInterface {
	_id: string;
	eventId: string; // txHash from ethereum bridge contract - deposit
	blockHash: string;
}

const EventProcessedSchema = new Schema<EventProcessedInterface>(
	{
		_id: { type: Schema.Types.String, required: true },
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
	expiresAt: string;
}

export interface WithdrawProofInterface {
	_id: string;
	withdrawals: Array<Withdrawal>;
}

const WithdrawProofSchema = new Schema<WithdrawProofInterface>(
	{
		_id: { type: Schema.Types.String, required: true }, // cennznetAddress
		withdrawals: [
			{
				proofId: { type: Schema.Types.String, required: true, unique: true },
				amount: { type: Schema.Types.String, required: true },
				assetId: { type: Schema.Types.String, required: true },
				beneficiary: { type: Schema.Types.String, required: true },
				txHash: { type: Schema.Types.String, required: true },
				hasClaimed: { type: Schema.Types.Boolean, required: true },
				expiresAt: { type: Schema.Types.String, required: true },
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
		_id: { type: Schema.Types.String, required: true },
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
