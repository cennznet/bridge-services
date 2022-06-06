/* eslint-disable */
export default {
	displayName: "deposit-relayer",
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
	coverageDirectory: "../../coverage/services/deposit-relayer",
	moduleNameMapper: {
		// Handle module aliases
		"^@bs-libs/(.*)$": "<rootDir>/../bs-libs/$1",
		"^@deposit-relayer/(.*)$": "<rootDir>/$1",
	},
	setupFiles: ["<rootDir>/tests/jest.setup.ts"],
	transformIgnorePatterns: ["<rootDir>/node_modules/(?!@cennznet/api)"],
};
