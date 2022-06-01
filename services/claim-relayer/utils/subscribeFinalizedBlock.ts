import type { Api } from "@cennznet/api";
import type { Logger } from "winston";
import * as chalk from "chalk";

export function subscribeFinalizedBlock(cennzApi: Api, logger: Logger) {
	void cennzApi.rpc.chain.subscribeFinalizedHeads((head) => {
		const blockNumber = head.number.toNumber();
		logger.info(`HEALTH CHECK => ${chalk.italic.green("OK")}`);
		logger.info(`At blocknumber: ${chalk.italic.gray("%s")}`, blockNumber);
	});
}
