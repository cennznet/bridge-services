import { CENNZNET_NETWORK, ETHEREUM_NETWORK } from "@bs-libs/constants";
import { startClaimSubscriber } from "@deposit-relayer/utils/startClaimSubscriber";
import { getLogger } from "@bs-libs/utils/getLogger";
import { getEthersProvider } from "@bs-libs/utils/getEthersProvider";
import { getCENNZnetApi } from "@bs-libs/utils/getCENNZnetApi";
import * as chalk from "chalk";

const logger = getLogger("ClaimSubscriber");
logger.info(
	`Start ClaimSubscriber with CENNZnet: ${chalk.magenta(
		"%s"
	)} | Ethereum: ${chalk.magenta("%s")}...`,
	CENNZNET_NETWORK,
	ETHEREUM_NETWORK
);
Promise.all([getCENNZnetApi(), getEthersProvider("Contract")])
	.then(([cennzApi, ethersProvider]) =>
		startClaimSubscriber(cennzApi, ethersProvider)
	)
	.catch((error) => {
		logger.error(error);
	});
