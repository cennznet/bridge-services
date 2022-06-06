import { NETWORKS } from "@bs-libs/constants";

const api = global.getCENNZApiForTest();

describe("@cennznet/api", () => {
	it("works", () => {
		expect(api).toBeDefined();
	});
});

describe("moduleNameMapper", () => {
	it("works", () => {
		expect(NETWORKS["azalea"].PEG_CONTRACT_ADDRESS).toEqual(
			"0x76BAc85e1E82cd677faa2b3f00C4a2626C4c6E32"
		);
		expect(NETWORKS["azalea"].SPENDING_ASSET_ID).toEqual("2");
	});
});
