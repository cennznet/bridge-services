/* eslint-disable */
export default {
	displayName: "claim-relayer",
	preset: "../../jest.preset.js",
	globals: {
		"ts-jest": {
			tsconfig: "<rootDir>/tsconfig.spec.json",
		},
	},
	transform: {
		"^.+\\.[tj]s$": "ts-jest",
	},
	moduleFileExtensions: ["ts", "js", "html"],
	coverageDirectory: "../../coverage/services/claim-relayer",
	setupFiles: ["../../jest.setup.ts"],
	transformIgnorePatterns: ["<rootDir>/node_modules/(?!@cennznet/api)"],
};
