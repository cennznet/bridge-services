import { ethers, Event } from "ethers";
import { BaseProvider } from "@ethersproject/providers";

export async function fetchMissedEvents(
	allEvents: Event[],
	ethersProvider: BaseProvider,
	pegInterface: ethers.utils.Interface,
	unClaimedWithdrawalsProofIds: string[]
) {
	return Promise.all(
		allEvents.map(async (event) => {
			const tx = await ethersProvider.getTransaction(event.transactionHash);
			const decodedTx = pegInterface.parseTransaction({
				data: tx.data,
				value: tx.value,
			});
			const eventId = decodedTx.args[3].eventId.toString();
			if (unClaimedWithdrawalsProofIds.includes(eventId)) return event;
			else return undefined;
		})
	);
}
