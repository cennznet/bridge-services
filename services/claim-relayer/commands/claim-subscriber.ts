import { CENNZNET_NETWORK, ETHEREUM_NETWORK } from "@/libs/constants";
import { getCENNZnetApi, getEthersProvider, getLogger } from "@/libs/utils";
import { mainSubscriber } from "@claim-relayer/scripts/mainSubscriber";

const logger = getLogger("ClaimSubscriber");
logger.info(
	`Start ClaimSubscriber with CENNZnet: %s | Ethereum: %s...`,
	CENNZNET_NETWORK,
	ETHEREUM_NETWORK
);
Promise.all([getCENNZnetApi(), getEthersProvider()])
	.then(async ([cennzApi, ethersProvider]) => {
		return mainSubscriber(cennzApi, ethersProvider);
	})
	.catch((error) => {
		logger.error(error);
	});
