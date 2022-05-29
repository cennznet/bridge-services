import { CENNZNET_NETWORK, ETHEREUM_NETWORK } from "@bs-libs/constants";
import { mainPublisher } from "@claim-relayer/scripts/mainPublisher";
import { getLogger } from "@bs-libs/utils/getLogger";
import { getEthersProvider } from "@bs-libs/utils/getEthersProvider";
import { getCENNZnetApi } from "@bs-libs/utils/getCENNZnetApi";

const logger = getLogger("ClaimPublisher");
logger.info(
	`Start ClaimPublisher with CENNZnet: %s | Ethereum: %s...`,
	CENNZNET_NETWORK,
	ETHEREUM_NETWORK
);
Promise.all([getCENNZnetApi(), getEthersProvider()])
	.then(async ([cennzApi, ethersProvider]) => {
		return mainPublisher(cennzApi, ethersProvider);
	})
	.catch((error) => {
		logger.error(error);
	});
