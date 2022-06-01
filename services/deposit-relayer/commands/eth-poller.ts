import { CENNZNET_NETWORK, ETHEREUM_NETWORK } from "@bs-libs/constants";
import { startEthDepositPoller } from "@deposit-relayer/utils/startEthDepositPoller";
import { getLogger } from "@bs-libs/utils/getLogger";
import { getEthersProvider } from "@bs-libs/utils/getEthersProvider";
import { getCENNZnetApi } from "@bs-libs/utils/getCENNZnetApi";
import * as chalk from "chalk";

const logger = getLogger("EthDepositPoller");
logger.info(
	`Start EthDepositPoller with CENNZnet: ${chalk.magenta(
		"%s"
	)} | Ethereum: ${chalk.magenta("%s")}...`,
	CENNZNET_NETWORK,
	ETHEREUM_NETWORK
);
Promise.all([getCENNZnetApi(), getEthersProvider()])
	.then(([cennzApi, ethersProvider]) =>
		startEthDepositPoller(cennzApi, ethersProvider)
	)
	.catch((error) => {
		logger.error(error);
	});
