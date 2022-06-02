import { BaseProvider } from "@ethersproject/providers";
import { ethers, Event } from "ethers";
import { WithdrawProof } from "@withdraw-relayer/libs/models";
import { getLogger } from "@bs-libs/utils/getLogger";

const logger = getLogger("EthWithdrawPoller");

export async function handleWithdrawEvent(
	event: Event,
	ethersProvider: BaseProvider,
	pegInterface: ethers.utils.Interface,
	bridgeContract: ethers.Contract
) {
	const tx = await ethersProvider.getTransaction(event.transactionHash);
	const decodedTx = pegInterface.parseTransaction({
		data: tx.data,
		value: tx.value,
	});
	const eventId = parseInt(decodedTx.args[3].eventId.toString());
	//confirm withdraw on contract
	const hasClaimed = await bridgeContract.eventIds(eventId);
	const withdrawalProof = await WithdrawProof.findOne().elemMatch(
		"withdrawals",
		{ proofId: eventId }
	);
	if (withdrawalProof) {
		//get correct proof in array and update
		withdrawalProof.withdrawals = withdrawalProof.withdrawals.map(
			(withdrawal) => {
				if (withdrawal.proofId === eventId.toString()) {
					withdrawal.hasClaimed = hasClaimed;
					return withdrawal;
				} else {
					return withdrawal;
				}
			}
		);
		await withdrawalProof.save();
		logger.info(
			`Withdraw event Successfully Updated. ETH Tx Hash: ${JSON.stringify(
				event.transactionHash
			)}`
		);
	}
}
