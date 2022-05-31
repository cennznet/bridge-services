import { Api } from "@cennznet/api";

global.getCENNZApiForTest = () => {
	let api: Api = new Api({
		provider: "wss://nikau.centrality.me/public/ws",
	});
	//@ts-ignore
	beforeAll(async () => {
		await api.isReady;
	});
	//@ts-ignore
	afterAll(async () => {
		await api?.disconnect();
	});

	return api;
};
