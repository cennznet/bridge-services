import type { Api } from "@cennznet/api";
import type { Logger } from "winston";

export function subscribeFinalizedBlock(cennzApi: Api, logger: Logger) {
	void cennzApi.rpc.chain.subscribeFinalizedHeads((head) => {
		const blockNumber = head.number.toNumber();
		logger.info(`HEALTH CHECK => OK`);
		logger.info(`At blocknumber: ${blockNumber}`);
	});
}
