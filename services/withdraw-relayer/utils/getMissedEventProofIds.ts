import { WithdrawProofInterface } from "@withdraw-relayer/libs/models";

export function getMissedEventProofIds(
	unclaimedWithdrawals: WithdrawProofInterface[]
): string[] {
	return unclaimedWithdrawals
		.map((userWithdrawals) =>
			userWithdrawals.withdrawals.filter((tx) => !tx.hasClaimed)
		)
		.flat()
		.map((claim) => claim.proofId);
}
