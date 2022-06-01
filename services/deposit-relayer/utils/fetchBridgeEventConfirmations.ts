import { u64 } from "@cennznet/types";
import { Api } from "@cennznet/api";

export async function fetchBridgeEventConfirmations(cennzApi: Api) {
	return (
		(await cennzApi.query.ethBridge.eventConfirmations()) as u64
	).toNumber();
}
