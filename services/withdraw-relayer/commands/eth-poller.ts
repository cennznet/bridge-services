import { CENNZNET_NETWORK, ETHEREUM_NETWORK } from "@bs-libs/constants";
import { startEthWithdrawPoller } from "@withdraw-relayer/utils/startEthWithdrawPoller";
import { getLogger } from "@bs-libs/utils/getLogger";
import { getEthersProvider } from "@bs-libs/utils/getEthersProvider";
import { getCENNZnetApi } from "@bs-libs/utils/getCENNZnetApi";
import * as chalk from "chalk";

const logger = getLogger("EthWithdrawPoller");
logger.info(
	`Start EthWithdrawPoller with CENNZnet: ${chalk.magenta(
		"%s"
	)} | Ethereum: ${chalk.magenta("%s")}...`,
	CENNZNET_NETWORK,
	ETHEREUM_NETWORK
);
Promise.all([getCENNZnetApi(), getEthersProvider()])
	.then(([cennzApi, ethersProvider]) =>
		startEthWithdrawPoller(cennzApi, ethersProvider)
	)
	.catch((error) => {
		logger.error(error);
	});
