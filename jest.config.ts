import { getJestProjects } from "@nrwl/jest";

export default {
	projects: getJestProjects(),
	moduleNameMapper: {
		"^@bs-libs/(.*)$": "<rootDir>/services/bs-libs/$1",
		"^@claim-relayer/(.*)$": "<rootDir>/services/claim-relayer/$1",
		"^@withdraw-relayer/(.*)$": "<rootDir>/services/withdraw-relayer/$1",
	},
};
