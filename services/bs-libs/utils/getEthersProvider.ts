import type { BaseProvider } from "@ethersproject/providers";

import {
	ALCHEMY_API_TOKEN,
	ETHEREUM_NETWORK,
	INFURA_PROJECT,
	ETHERSCAN_API_TOKEN,
} from "@bs-libs/constants";
import { getDefaultProvider } from "ethers";

type Channel = "Contract" | "Etherscan";

export function getEthersProvider(channel: Channel): BaseProvider {
	if (channel === "Contract")
		return getDefaultProvider(ETHEREUM_NETWORK, {
			...(INFURA_PROJECT && { infura: INFURA_PROJECT }),
			...(ALCHEMY_API_TOKEN && { alchemy: ALCHEMY_API_TOKEN }),
			etherscan: "-",
			pocket: "-",
			ankr: "-",
		});
	else
		return getDefaultProvider(ETHEREUM_NETWORK, {
			...(ETHERSCAN_API_TOKEN && { etherscan: ETHERSCAN_API_TOKEN }),
			infura: "-",
			alchemy: "-",
			pocket: "-",
			ankr: "-",
		});
}
