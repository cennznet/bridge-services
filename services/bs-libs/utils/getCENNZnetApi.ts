import { CENNZNET_NETWORK } from "@bs-libs/constants";
import { Api } from "@cennznet/api";
import { CENNZNetNetwork } from "@cennznet/api/types";

export async function getCENNZnetApi(): Promise<Api> {
	return await Api.create({
		network: CENNZNET_NETWORK as CENNZNetNetwork,
	});
}
