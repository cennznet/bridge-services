import { CENNZNET_NETWORK, ETHEREUM_NETWORK } from "@/libs/constants";
import { getCENNZnetApi, getEthersProvider, getLogger } from "@/libs/utils";
import { mainPublisher } from "@claim-relayer/scripts/mainPublisher";

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
