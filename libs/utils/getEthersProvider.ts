import type { BaseProvider } from "@ethersproject/providers";

import {
	ALCHEMY_API_TOKEN,
	ETHEREUM_NETWORK,
	INFURA_PROJECT,
} from "@/libs/constants";
import { getDefaultProvider } from "ethers";
import { MockProvider } from "ethereum-waffle";

export const getEthersProvider = (): BaseProvider => {
	if (ETHEREUM_NETWORK === "local") return new MockProvider();

	return getDefaultProvider(ETHEREUM_NETWORK, {
		alchemy: ALCHEMY_API_TOKEN,
		infura: INFURA_PROJECT,
	});
};
