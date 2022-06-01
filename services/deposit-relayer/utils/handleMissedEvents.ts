import { Event } from "ethers";
import { handleDepositEvent } from "@deposit-relayer/utils/handleDepositEvent";
import { Api } from "@cennznet/api";
import { AMQPQueue } from "@cloudamqp/amqp-client";
import { getLogger } from "@bs-libs/utils/getLogger";

const logger = getLogger("EthDepositPoller");

export async function handleMissedEvents(
	cennzApi: Api,
	queue: AMQPQueue,
	allEvents: Event[],
	missedDepositEventHashes: string[],
	eventConfirmations: number
) {
	return Promise.all(
		missedDepositEventHashes.map(async (txHash) => {
			const eventInfo = allEvents.find(
				(event) => txHash === event.transactionHash
			) as Event;

			const cennznetAddress = (eventInfo as any).args[3];
			const amount = (eventInfo as any).args[2].toString();
			const tokenAddress = (eventInfo as any).args[1];
			await handleDepositEvent(
				cennzApi,
				eventInfo.transactionHash,
				cennznetAddress,
				amount,
				tokenAddress,
				eventConfirmations,
				queue,
				logger
			);
		})
	);
}
