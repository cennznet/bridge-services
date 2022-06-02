import { ethers, Event } from "ethers";
import { BaseProvider } from "@ethersproject/providers";
import { handleWithdrawEvent } from "@withdraw-relayer/utils/handleWithdrawEvent";

export async function handleMissedEvents(
	missedEvents: Event[],
	ethersProvider: BaseProvider,
	pegInterface: ethers.utils.Interface,
	bridge: ethers.Contract
) {
	return Promise.all(
		missedEvents.map(
			async (event) =>
				await handleWithdrawEvent(
					event as Event,
					ethersProvider,
					pegInterface,
					bridge
				)
		)
	);
}
