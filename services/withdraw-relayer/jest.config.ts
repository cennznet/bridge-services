/* eslint-disable */
export default {
	displayName: "withdraw-relayer",
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
	coverageDirectory: "../../coverage/services/withdraw-relayer",
	setupFiles: ["../../jest.setup.ts"],
	transformIgnorePatterns: ["<rootDir>/node_modules/(?!@cennznet/api)"],
};
