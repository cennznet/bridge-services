import type { BaseProvider } from "@ethersproject/providers";

import {
	ALCHEMY_API_TOKEN,
	ETHEREUM_NETWORK,
	INFURA_PROJECT,
} from "@bs-libs/constants";
import { getDefaultProvider } from "ethers";

export function getEthersProvider(): BaseProvider {
	return getDefaultProvider(ETHEREUM_NETWORK, {
		alchemy: ALCHEMY_API_TOKEN,
		infura: INFURA_PROJECT,
	});
}
